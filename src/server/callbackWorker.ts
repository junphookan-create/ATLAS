import crypto from 'crypto';

export interface CallbackJob {
  id: string;
  requestId: string;
  callbackUrl: string;
  payload: any;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed_dlq';
  lastError?: string;
  createdAt: Date;
}

export interface DLQEntry {
  id: string;
  jobId: string;
  requestId: string;
  callbackUrl: string;
  payload: any;
  failedAt: Date;
  totalAttempts: number;
  errorLog: string;
}

// Circuit Breaker State per Domain
export interface CircuitState {
  domain: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailureAt?: Date;
  nextAttemptAt?: Date;
}

export class CallbackWorkerQueue {
  private jobs: CallbackJob[] = [];
  private dlq: DLQEntry[] = [];
  private circuits: Record<string, CircuitState> = {};
  private isProcessing = false;

  constructor() {
    // Start background processing tick every 3 seconds
    setInterval(() => {
      this.processQueue();
    }, 3000);
  }

  enqueue(requestId: string, callbackUrl: string, payload: any): CallbackJob {
    const job: CallbackJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requestId,
      callbackUrl,
      payload,
      attempts: 0,
      maxAttempts: 5,
      nextAttemptAt: new Date(),
      status: 'pending',
      createdAt: new Date(),
    };
    this.jobs.push(job);
    return job;
  }

  getDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return 'unknown';
    }
  }

  getCircuit(domain: string): CircuitState {
    if (!this.circuits[domain]) {
      this.circuits[domain] = {
        domain,
        state: 'CLOSED',
        failures: 0,
      };
    }
    const c = this.circuits[domain];

    // Check if OPEN circuit should transition to HALF_OPEN
    if (c.state === 'OPEN' && c.nextAttemptAt && new Date() >= c.nextAttemptAt) {
      c.state = 'HALF_OPEN';
    }
    return c;
  }

  recordCircuitSuccess(domain: string) {
    const c = this.getCircuit(domain);
    c.failures = 0;
    c.state = 'CLOSED';
  }

  recordCircuitFailure(domain: string) {
    const c = this.getCircuit(domain);
    c.failures += 1;
    if (c.failures >= 3) {
      c.state = 'OPEN';
      // Trip circuit breaker for 30 seconds
      c.nextAttemptAt = new Date(Date.now() + 30000);
      c.lastFailureAt = new Date();
    }
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const now = new Date();
    const pendingJobs = this.jobs.filter(
      (j) => j.status === 'pending' && j.nextAttemptAt <= now
    );

    for (const job of pendingJobs) {
      const domain = this.getDomain(job.callbackUrl);
      const circuit = this.getCircuit(domain);

      if (circuit.state === 'OPEN') {
        // Skip execution while circuit breaker is OPEN
        continue;
      }

      job.status = 'processing';
      job.attempts += 1;

      try {
        const signature = crypto
          .createHmac('sha256', process.env.CALLBACK_HMAC_SECRET || 'atlas-secret')
          .update(JSON.stringify(job.payload))
          .digest('hex');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(job.callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Approval-Signature': signature,
            'X-Delivery-Attempt': String(job.attempts),
            'X-Idempotency-Key': `idemp-${job.requestId}-${job.attempts}`,
          },
          body: JSON.stringify(job.payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          job.status = 'completed';
          this.recordCircuitSuccess(domain);
        } else {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
      } catch (err: any) {
        this.recordCircuitFailure(domain);
        job.lastError = err?.message || 'Callback execution error';

        if (job.attempts >= job.maxAttempts) {
          job.status = 'failed_dlq';
          this.moveToDlq(job);
        } else {
          job.status = 'pending';
          // Exponential backoff: 2^attempts * 1000ms + jitter
          const backoffMs = Math.pow(2, job.attempts) * 1000 + Math.floor(Math.random() * 500);
          job.nextAttemptAt = new Date(Date.now() + backoffMs);
        }
      }
    }

    this.isProcessing = false;
  }

  private moveToDlq(job: CallbackJob) {
    const entry: DLQEntry = {
      id: `dlq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      jobId: job.id,
      requestId: job.requestId,
      callbackUrl: job.callbackUrl,
      payload: job.payload,
      failedAt: new Date(),
      totalAttempts: job.attempts,
      errorLog: job.lastError || 'Exhausted maximum retry attempts',
    };
    this.dlq.unshift(entry);
  }

  getDlq(): DLQEntry[] {
    return this.dlq;
  }

  replayDlqItem(dlqId: string): boolean {
    const idx = this.dlq.findIndex((d) => d.id === dlqId);
    if (idx === -1) return false;

    const dlqItem = this.dlq[idx];
    this.dlq.splice(idx, 1);

    this.enqueue(dlqItem.requestId, dlqItem.callbackUrl, dlqItem.payload);
    return true;
  }

  getCircuits(): Record<string, CircuitState> {
    return this.circuits;
  }

  getPendingJobsCount(): number {
    return this.jobs.filter((j) => j.status === 'pending').length;
  }
}

export const callbackWorkerQueue = new CallbackWorkerQueue();
