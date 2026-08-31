import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, coerceTypes: true });
addFormats(ajv);

// V1 Schema Definition
const schemaV1 = {
  type: 'object',
  properties: {
    module_name: { type: 'string', minLength: 2 },
    action_type: { type: 'string', minLength: 2 },
    schema_version: { type: 'string', enum: ['v1'] },
    payload: { type: 'object' },
    summary: { type: 'string' },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    tenant_id: { type: 'string' },
    user_id: { type: 'string' },
    callback_url: { type: 'string', format: 'uri', nullable: true },
    callback_payload: { type: 'object', nullable: true },
    idempotency_key: { type: 'string' },
  },
  required: ['module_name', 'action_type', 'payload'],
  additionalProperties: true,
};

// V2 Schema Definition (Requires riskLevel and evidence or impactScore)
const schemaV2 = {
  type: 'object',
  properties: {
    module_name: { type: 'string', minLength: 2 },
    action_type: { type: 'string', minLength: 2 },
    schema_version: { type: 'string', enum: ['v2'] },
    payload: { type: 'object' },
    summary: { type: 'string', minLength: 5 },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    tenant_id: { type: 'string' },
    user_id: { type: 'string' },
    callback_url: { type: 'string', format: 'uri', nullable: true },
    impactScore: { type: 'number', minimum: 0, maximum: 1 },
    idempotency_key: { type: 'string' },
  },
  required: ['module_name', 'action_type', 'payload', 'schema_version', 'riskLevel', 'summary'],
  additionalProperties: true,
};

const validateV1Compiled = ajv.compile(schemaV1);
const validateV2Compiled = ajv.compile(schemaV2);

export function validateApprovalSubmission(data: any): { valid: boolean; errors?: string[] } {
  const version = data?.schema_version || 'v1';
  const validator = version === 'v2' ? validateV2Compiled : validateV1Compiled;

  const valid = validator(data);
  if (!valid && validator.errors) {
    const errors = validator.errors.map(
      (err) => `${err.instancePath || 'root'} ${err.message}`
    );
    return { valid: false, errors };
  }
  return { valid: true };
}
