import { memoryStore } from './memoryStore.js';
import { validateApprovalSubmission } from './validator.js';
import { deduplicationEngine } from './deduplication.js';
import { cryptoVault } from './cryptoVault.js';

export interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  duplicateRejected: number;
  failedValidation: number;
  durationMs: number;
  rps: number;
  latenciesMs: {
    p50: number;
    p95: number;
    p99: number;
    max: number;
  };
  auditChainValid: boolean;
  timestamp: string;
}

export function runProductionLoadTest(count: number = 100): LoadTestResult {
  const start = performance.now();
  const latencies: number[] = [];

  let successful = 0;
  let duplicates = 0;
  let failedVal = 0;

  for (let i = 0; i < count; i++) {
    const t0 = performance.now();
    const actionType = i % 5 === 0 ? 'FINANCIAL_DISBURSEMENT' : 'PII_EXPORT_REQUEST';
    const payload = {
      amount: 1000 + i,
      currency: 'USD',
      recipient: `user_${i}@example.com`,
      idempotency_key: `loadtest-${Math.floor(i / 2)}`, // intentional duplicates every 2 requests
    };

    const submissionData = {
      module_name: 'approval_center' as const,
      action_type: actionType,
      payload,
      summary: `Automated Load Test Submission #${i}`,
      riskLevel: 'high' as const,
      tenant_id: 'tenant-primary',
      user_id: 'usr-jun',
    };

    // 1. Schema Validation
    const valResult = validateApprovalSubmission(submissionData);
    if (!valResult.valid) {
      failedVal++;
      continue;
    }

    // 2. Deduplication check
    const hash = deduplicationEngine.computeHash(
      submissionData.tenant_id,
      submissionData.action_type,
      submissionData.payload,
      payload.idempotency_key
    );

    const existingId = deduplicationEngine.isDuplicate(hash);
    if (existingId) {
      duplicates++;
      latencies.push(performance.now() - t0);
      continue;
    }

    // 3. Encrypt payload
    const encrypted = cryptoVault.encrypt(JSON.stringify(payload));

    // 4. Add approval to store & cryptographic audit chain
    const app = memoryStore.addApproval({
      tenantId: submissionData.tenant_id,
      userId: submissionData.user_id,
      moduleName: submissionData.module_name,
      actionType: submissionData.action_type,
      payload: { ...payload, _encrypted: encrypted },
      summary: submissionData.summary,
      riskLevel: 'high',
      status: 'pending',
      impactScore: 0.85,
    });

    deduplicationEngine.register(hash, app.id);
    successful++;
    latencies.push(performance.now() - t0);
  }

  const end = performance.now();
  const durationMs = Math.max(1, end - start);

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const max = latencies[latencies.length - 1] || 0;

  const auditCheck = memoryStore.verifyAuditChain();

  return {
    totalRequests: count,
    successfulRequests: successful,
    duplicateRejected: duplicates,
    failedValidation: failedVal,
    durationMs: Math.round(durationMs),
    rps: Math.round((count / durationMs) * 1000),
    latenciesMs: {
      p50: Number(p50.toFixed(2)),
      p95: Number(p95.toFixed(2)),
      p99: Number(p99.toFixed(2)),
      max: Number(max.toFixed(2)),
    },
    auditChainValid: auditCheck.valid,
    timestamp: new Date().toISOString(),
  };
}
