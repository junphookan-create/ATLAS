import { createPool } from '../db/index.js';

export interface ActionDefinition {
  id?: number;
  tenantId: string;
  moduleName: string;
  actionType: string;
  version: string;
  description?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  payloadSchema: any;
  requiredRole: string;
  createdAt?: string;
}

export class ActionCatalogService {
  private inMemoryCatalog: ActionDefinition[] = [
    {
      tenantId: 'tenant-primary',
      moduleName: 'approval_center',
      actionType: 'FINANCIAL_DISBURSEMENT',
      version: 'v1',
      description: 'Disburse financial funds above threshold',
      riskLevel: 'critical',
      requiredRole: 'approver',
      payloadSchema: {
        type: 'object',
        properties: {
          amount: { type: 'number', minimum: 1 },
          currency: { type: 'string', minLength: 3 },
          recipient: { type: 'string' },
        },
        required: ['amount', 'currency', 'recipient'],
      },
    },
    {
      tenantId: 'tenant-primary',
      moduleName: 'approval_center',
      actionType: 'PII_EXPORT_REQUEST',
      version: 'v1',
      description: 'Bulk export user PII data records',
      riskLevel: 'high',
      requiredRole: 'approver',
      payloadSchema: {
        type: 'object',
        properties: {
          recordCount: { type: 'number' },
          exportFormat: { type: 'string' },
        },
        required: ['recordCount'],
      },
    },
  ];

  async getCatalog(tenantId: string = 'tenant-primary'): Promise<ActionDefinition[]> {
    try {
      const pool = createPool();
      const res = await pool.query('SELECT * FROM action_catalog WHERE tenant_id = $1 ORDER BY module_name, action_type, version', [tenantId]);
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          tenantId: r.tenant_id,
          moduleName: r.module_name,
          actionType: r.action_type,
          version: r.version,
          description: r.description,
          riskLevel: r.risk_level,
          payloadSchema: typeof r.payload_schema === 'string' ? JSON.parse(r.payload_schema) : r.payload_schema,
          requiredRole: r.required_role,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));
      }
    } catch {
      // Fallback
    }
    return this.inMemoryCatalog.filter((a) => a.tenantId === tenantId);
  }

  async registerAction(action: ActionDefinition): Promise<ActionDefinition> {
    try {
      const pool = createPool();
      const sqlText = `
        INSERT INTO action_catalog (
          tenant_id, module_name, action_type, version, description, risk_level, payload_schema, required_role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (tenant_id, module_name, action_type, version)
        DO UPDATE SET description = EXCLUDED.description, risk_level = EXCLUDED.risk_level, payload_schema = EXCLUDED.payload_schema
        RETURNING *
      `;

      const values = [
        action.tenantId,
        action.moduleName,
        action.actionType,
        action.version || 'v1',
        action.description || '',
        action.riskLevel || 'medium',
        JSON.stringify(action.payloadSchema || {}),
        action.requiredRole || 'approver',
      ];

      const res = await pool.query(sqlText, values);
      const row = res.rows[0];
      return {
        id: row.id,
        tenantId: row.tenant_id,
        moduleName: row.module_name,
        actionType: row.action_type,
        version: row.version,
        description: row.description,
        riskLevel: row.risk_level,
        payloadSchema: typeof row.payload_schema === 'string' ? JSON.parse(row.payload_schema) : row.payload_schema,
        requiredRole: row.required_role,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      };
    } catch {
      this.inMemoryCatalog.push(action);
      return action;
    }
  }
}

export const actionCatalogService = new ActionCatalogService();
