import crypto from 'crypto';

export interface DeduplicationRecord {
  hash: string;
  requestId: string;
  createdAt: Date;
  expiresAt: Date;
}

export class DeduplicationEngine {
  private records: Map<string, DeduplicationRecord> = new Map();
  private ttlMs = 10 * 60 * 1000; // 10 minutes deduplication window

  computeHash(tenantId: string, actionType: string, payload: any, idempotencyKey?: string): string {
    const raw = `${tenantId}:${actionType}:${JSON.stringify(payload)}:${idempotencyKey || ''}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  isDuplicate(hash: string): string | null {
    const existing = this.records.get(hash);
    if (!existing) return null;

    if (new Date() > existing.expiresAt) {
      this.records.delete(hash);
      return null;
    }

    return existing.requestId;
  }

  register(hash: string, requestId: string): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.ttlMs);
    this.records.set(hash, {
      hash,
      requestId,
      createdAt: now,
      expiresAt,
    });
  }
}

export const deduplicationEngine = new DeduplicationEngine();
