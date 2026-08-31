import { Request, Response, NextFunction } from 'express';
import { createPool } from '../db/index.js';
import crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  tenantId?: string;
  userId?: string;
  userRole?: string;
}

/**
 * Multi-Tenant Authorization Middleware
 * Extracts X-Tenant-ID, X-User-ID, and X-User-Role headers
 */
export function multiTenantAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-primary';
  const userId = (req.headers['x-user-id'] as string) || 'usr-jun';
  const userRole = (req.headers['x-user-role'] as string) || 'approver';

  req.tenantId = tenantId;
  req.userId = userId;
  req.userRole = userRole;

  res.setHeader('X-Tenant-ID', tenantId);
  next();
}

/**
 * PostgreSQL-Backed Proper Idempotency Middleware
 */
export async function postgresIdempotencyCheck(
  tenantId: string,
  idempotencyKey: string,
  requestHash: string
): Promise<{ isDuplicate: boolean; responseCode?: number; responseBody?: any }> {
  if (!idempotencyKey) return { isDuplicate: false };

  try {
    const pool = createPool();
    const query = 'SELECT response_code, response_body, expires_at FROM idempotency_records WHERE tenant_id = $1 AND idempotency_key = $2';
    const res = await pool.query(query, [tenantId, idempotencyKey]);

    if (res.rows.length > 0) {
      const row = res.rows[0];
      if (new Date() < new Date(row.expires_at)) {
        return {
          isDuplicate: true,
          responseCode: row.response_code,
          responseBody: typeof row.response_body === 'string' ? JSON.parse(row.response_body) : row.response_body,
        };
      }
    }
  } catch (err) {
    console.warn('Idempotency table lookup error:', err);
  }

  return { isDuplicate: false };
}

export async function recordPostgresIdempotency(
  tenantId: string,
  idempotencyKey: string,
  requestHash: string,
  requestId: string,
  responseCode: number,
  responseBody: any
): Promise<void> {
  if (!idempotencyKey) return;

  try {
    const pool = createPool();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const insertSql = `
      INSERT INTO idempotency_records (tenant_id, idempotency_key, hash, request_id, response_code, response_body, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tenant_id, idempotency_key) DO NOTHING
    `;
    await pool.query(insertSql, [
      tenantId,
      idempotencyKey,
      requestHash,
      requestId,
      responseCode,
      JSON.stringify(responseBody),
      expiresAt,
    ]);
  } catch (err) {
    console.warn('Record idempotency error:', err);
  }
}

/**
 * 304 ETag Helper / Middleware
 */
export function handleETag304(req: Request, res: Response, data: any): boolean {
  const dataString = JSON.stringify(data);
  const etag = `W/"${crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16)}"`;

  res.setHeader('ETag', etag);

  const clientETag = req.headers['if-none-match'];
  if (clientETag && clientETag === etag) {
    res.status(304).end();
    return true; // Sent 304 Not Modified
  }

  return false;
}
