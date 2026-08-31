import Redis from 'ioredis';
import EventEmitter from 'events';

export interface StreamEvent {
  id: string;
  stream: string;
  fields: Record<string, string>;
  createdAt: Date;
  acknowledgedBy: Set<string>;
}

export class RedisEngine extends EventEmitter {
  private redisClient: Redis | null = null;
  private streamStore: Map<string, StreamEvent[]> = new Map();
  private consumerGroups: Map<string, Map<string, number>> = new Map(); // stream -> groupName -> lastReadIndex
  private policyCache: Map<string, { value: any; expiresAt: number }> = new Map();
  private isConnected = false;

  constructor() {
    super();
    this.initRedisClient();
  }

  private initRedisClient() {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
        });

        this.redisClient.on('connect', () => {
          this.isConnected = true;
          console.log('[Redis] Connected to external Redis server');
        });

        this.redisClient.on('error', (err) => {
          this.isConnected = false;
          console.warn('[Redis] Connection attempt notice (using internal Redis Engine):', err.message);
        });
      } catch (err) {
        this.isConnected = false;
      }
    }
  }

  /**
   * Redis Stream XADD implementation
   */
  async xadd(stream: string, fields: Record<string, any>): Promise<string> {
    const eventId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const stringFields: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) {
      stringFields[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
    }

    if (this.isConnected && this.redisClient) {
      try {
        const flatArgs: string[] = [];
        for (const [k, v] of Object.entries(stringFields)) {
          flatArgs.push(k, v);
        }
        await this.redisClient.xadd(stream, '*', ...flatArgs);
      } catch (err) {
        // Fallback to internal Redis Stream Store
      }
    }

    if (!this.streamStore.has(stream)) {
      this.streamStore.set(stream, []);
    }

    const eventObj: StreamEvent = {
      id: eventId,
      stream,
      fields: stringFields,
      createdAt: new Date(),
      acknowledgedBy: new Set(),
    };

    this.streamStore.get(stream)!.push(eventObj);

    // Emit event for Pub/Sub listener
    this.emit('stream:event', { stream, event: eventObj });
    this.publish(`pubsub:${stream}`, eventObj);

    return eventId;
  }

  /**
   * Creates a consumer group for Redis Stream
   */
  createConsumerGroup(stream: string, groupName: string): boolean {
    if (!this.consumerGroups.has(stream)) {
      this.consumerGroups.set(stream, new Map());
    }
    const groups = this.consumerGroups.get(stream)!;
    if (!groups.has(groupName)) {
      groups.set(groupName, 0);
      return true;
    }
    return false;
  }

  /**
   * Reads events from stream using Consumer Group cursor
   */
  readConsumerGroup(stream: string, groupName: string, count: number = 10): StreamEvent[] {
    if (!this.streamStore.has(stream)) return [];
    this.createConsumerGroup(stream, groupName);

    const groups = this.consumerGroups.get(stream)!;
    const lastIdx = groups.get(groupName) || 0;
    const events = this.streamStore.get(stream)!;

    const unread = events.slice(lastIdx, lastIdx + count);
    groups.set(groupName, lastIdx + unread.length);

    return unread;
  }

  /**
   * Acknowledges event in Consumer Group (XACK)
   */
  xack(stream: string, groupName: string, eventId: string): boolean {
    const events = this.streamStore.get(stream);
    if (!events) return false;

    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      ev.acknowledgedBy.add(groupName);
      return true;
    }
    return false;
  }

  /**
   * Redis Policy Cache GET
   */
  async getCache(key: string): Promise<any | null> {
    if (this.isConnected && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        if (val) return JSON.parse(val);
      } catch {
        // Fallback
      }
    }

    const cached = this.policyCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.policyCache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Redis Policy Cache SET with TTL in seconds
   */
  async setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (this.isConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      } catch {
        // Fallback
      }
    }

    this.policyCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Redis Pub/Sub Publish
   */
  publish(channel: string, message: any): void {
    if (this.isConnected && this.redisClient) {
      try {
        this.redisClient.publish(channel, JSON.stringify(message));
      } catch {
        // Fallback
      }
    }
    this.emit(`channel:${channel}`, message);
  }

  /**
   * Redis Pub/Sub Subscribe
   */
  subscribe(channel: string, listener: (msg: any) => void): void {
    this.on(`channel:${channel}`, listener);
  }

  getStreamLength(stream: string): number {
    return this.streamStore.get(stream)?.length || 0;
  }

  getStreamEvents(stream: string, limit: number = 50): StreamEvent[] {
    const events = this.streamStore.get(stream) || [];
    return events.slice(-limit).reverse();
  }

  getAllStreamsMetrics() {
    const streamNames = Array.from(this.streamStore.keys());
    if (!streamNames.includes('approval_events')) streamNames.push('approval_events');
    if (!streamNames.includes('celery_tasks')) streamNames.push('celery_tasks');
    if (!streamNames.includes('celery_dlq')) streamNames.push('celery_dlq');

    return streamNames.map((name) => {
      const events = this.streamStore.get(name) || [];
      const groups = this.consumerGroups.get(name);
      const groupData: { name: string; lastReadIndex: number; unreadLag: number }[] = [];

      if (groups) {
        for (const [gName, lastIdx] of groups.entries()) {
          groupData.push({
            name: gName,
            lastReadIndex: lastIdx,
            unreadLag: Math.max(0, events.length - lastIdx),
          });
        }
      }

      return {
        stream: name,
        totalEvents: events.length,
        consumerGroups: groupData,
        lastEventTime: events.length > 0 ? events[events.length - 1].createdAt.toISOString() : null,
      };
    });
  }

  getCacheMetrics() {
    let activeEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const [_, v] of this.policyCache.entries()) {
      if (now <= v.expiresAt) {
        activeEntries += 1;
      } else {
        expiredEntries += 1;
      }
    }

    return {
      totalKeys: this.policyCache.size,
      activeKeys: activeEntries,
      expiredKeys: expiredEntries,
      isConnectedToExternalRedis: this.isConnected,
    };
  }
}

export const redisEngine = new RedisEngine();
