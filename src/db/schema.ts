import { pgTable, serial, text, timestamp, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table matching Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('user'),
  tenantId: text('tenant_id').default('tenant-primary').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Action Catalog Table for Dynamic Module & Action Registrations
export const actionCatalog = pgTable(
  'action_catalog',
  {
    id: serial('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    moduleName: text('module_name').notNull(),
    actionType: text('action_type').notNull(),
    version: text('version').default('v1').notNull(), // 'v1' | 'v2'
    description: text('description'),
    riskLevel: text('risk_level').default('medium').notNull(), // 'low' | 'medium' | 'high' | 'critical'
    payloadSchema: jsonb('payload_schema').notNull(),
    requiredRole: text('required_role').default('approver').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('action_cat_tenant_action_ver_idx').on(
      table.tenantId,
      table.moduleName,
      table.actionType,
      table.version
    ),
  ]
);

// Approvals Table for Human Approval Center (PostgreSQL Partitioned Table Base)
export const approvals = pgTable(
  'approvals',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    userId: text('user_id').notNull(),
    moduleName: text('module_name').notNull(),
    actionType: text('action_type').notNull(),
    schemaVersion: text('schema_version').default('v1').notNull(),
    payload: jsonb('payload').notNull(),
    summary: text('summary').notNull(),
    riskLevel: text('risk_level').notNull(),
    status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected' | 'expired' | 'canceled'
    impactScore: text('impact_score').default('0.5'),
    callbackUrl: text('callback_url'),
    callbackPayload: jsonb('callback_payload'),
    evidence: jsonb('evidence'),
    decidedBy: text('decided_by'),
    justification: text('justification'),
    modifications: jsonb('modifications'),
    decidedAt: timestamp('decided_at'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    hash: text('hash').notNull(),
    previousHash: text('previous_hash').notNull(),
  },
  (table) => [
    index('approval_tenant_idx').on(table.tenantId),
    index('approval_status_idx').on(table.status),
    index('approval_expires_idx').on(table.expiresAt),
    index('approval_created_idx').on(table.createdAt),
  ]
);

// Idempotency Records Table in PostgreSQL
export const idempotencyRecords = pgTable(
  'idempotency_records',
  {
    id: serial('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    hash: text('hash').notNull(),
    requestId: text('request_id').notNull(),
    responseCode: integer('response_code').default(202).notNull(),
    responseBody: jsonb('response_body').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => [
    uniqueIndex('idemp_tenant_key_idx').on(table.tenantId, table.idempotencyKey),
    index('idemp_expires_idx').on(table.expiresAt),
  ]
);

// PostgreSQL Audit Logs with DB Triggers
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    tenantId: text('tenant_id').default('tenant-primary').notNull(),
    tableName: text('table_name').notNull(), // 'opportunities' | 'competitions' | 'approvals' | 'grants'
    recordId: text('record_id').notNull(),
    operation: text('operation').notNull(), // 'INSERT' | 'UPDATE' | 'DELETE'
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    diff: jsonb('diff'),
    changedFields: jsonb('changed_fields'),
    previousHash: text('previous_hash').notNull(),
    currentHash: text('current_hash').notNull(),
    performedBy: text('performed_by').default('system').notNull(),
    clientIp: text('client_ip'),
    clientUserAgent: text('client_user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('audit_tenant_idx').on(table.tenantId),
    index('audit_table_record_idx').on(table.tableName, table.recordId),
    index('audit_operation_idx').on(table.operation),
    index('audit_created_at_idx').on(table.createdAt),
  ]
);

// Module 2: Competitions Table
export const competitions = pgTable(
  'competitions',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').default('tenant-primary').notNull(),
    opportunityId: text('opportunity_id'),
    title: text('title').notNull(),
    organizer: text('organizer').notNull(),
    deadline: timestamp('deadline').notNull(),
    submissionDeadline: timestamp('submission_deadline'),
    judgingStartDate: timestamp('judging_start_date'),
    winnerAnnounceDate: timestamp('winner_announce_date'),
    prizePool: text('prize_pool').notNull(),
    status: text('status').default('in_progress').notNull(), // 'draft' | 'in_progress' | 'submitted' | 'shortlisted' | 'won' | 'lost'
    officialGuidelinesUrl: text('official_guidelines_url'),
    feedback: text('feedback'),
    requiredMaterials: jsonb('required_materials').notNull(),
    structuredRules: jsonb('structured_rules'),
    structuredRulesSummary: text('structured_rules_summary'),
    checklist: jsonb('checklist'),
    draftArtifacts: jsonb('draft_artifacts'),
    browserSubmissionState: jsonb('browser_submission_state'),
    postSubmissionMonitor: jsonb('post_submission_monitor'),
    submissionScreenshot: text('submission_screenshot'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('comp_tenant_idx').on(table.tenantId),
    index('comp_status_idx').on(table.status),
    index('comp_deadline_idx').on(table.deadline),
  ]
);

// Research Hypotheses
export const hypotheses = pgTable('hypotheses', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  domain: text('domain').notNull(),
  statement: text('statement').notNull(),
  predictedOutcome: text('predicted_outcome'),
  confidenceScore: text('confidence_score'),
  status: text('status').default('hypothesis'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Workspace Items
export const workspaceItems = pgTable('workspace_items', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  itemType: text('item_type').notNull(),
  title: text('title').notNull(),
  snippet: text('snippet'),
  externalId: text('external_id').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Module 1: Opportunities Table with PG Indexes & Embeddings
export const opportunities = pgTable(
  'opportunities',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').default('tenant-primary').notNull(),
    title: text('title').notNull(),
    source: text('source').notNull(),
    category: text('category').notNull(), // 'Grant' | 'Competition' | 'Scholarship' | 'Fellowship' | 'Hackathon'
    deadline: timestamp('deadline').notNull(),
    fundingAmount: text('funding_amount'),
    eligibility: text('eligibility').notNull(),
    description: text('description').notNull(),
    relevanceScore: text('relevance_score').default('0.5').notNull(),
    impactScore: text('impact_score').default('0.5').notNull(),
    priorityScore: text('priority_score').default('0.5').notNull(),
    url: text('url').notNull(),
    status: text('status').default('discovered').notNull(), // 'discovered' | 'pursued' | 'archived' | 'dismissed'
    embeddingVector: jsonb('embedding_vector'), // text-embedding-3-large 1536/3072 dims or pgvector representation
    nerEntities: jsonb('ner_entities'),
    eligibilityDeBERTa: jsonb('eligibility_deberta'),
    scoreBreakdown: jsonb('score_breakdown'),
    scraperMetadata: jsonb('scraper_metadata'),
    originalLanguage: text('original_language').default('en'),
    translatedText: text('translated_text'),
    urlFingerprint: text('url_fingerprint').notNull(),
    isDuplicateFlag: integer('is_duplicate_flag').default(0),
    duplicateOfId: text('duplicate_of_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('opp_priority_score_idx').on(table.priorityScore),
    index('opp_deadline_idx').on(table.deadline),
    index('opp_category_idx').on(table.category),
    index('opp_tenant_idx').on(table.tenantId),
    index('opp_url_fingerprint_idx').on(table.urlFingerprint),
  ]
);

// Opportunity Interactions Table (ML Feedback loop)
export const opportunityInteractions = pgTable(
  'opportunity_interactions',
  {
    id: serial('id').primaryKey(),
    tenantId: text('tenant_id').default('tenant-primary').notNull(),
    opportunityId: text('opportunity_id').notNull(),
    userId: text('user_id').notNull(),
    action: text('action').notNull(), // 'view' | 'save' | 'apply' | 'ignore' | 'pursue'
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('opp_interact_opp_idx').on(table.opportunityId),
    index('opp_interact_user_idx').on(table.userId),
  ]
);

// Notifications Table for Multi-Channel Routing
export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id').default('tenant-primary').notNull(),
    opportunityId: text('opportunity_id').notNull(),
    recipientEmail: text('recipient_email'),
    channel: text('channel').notNull(), // 'INSTANT_SSE' | 'WEB_PUSH' | 'DAILY_DIGEST_JINJA2'
    title: text('title').notNull(),
    summarySnippet: text('summary_snippet').notNull(),
    priorityScore: text('priority_score').notNull(),
    status: text('status').default('DELIVERED').notNull(),
    deliveredAt: timestamp('delivered_at').defaultNow().notNull(),
  },
  (table) => [
    index('notif_opp_idx').on(table.opportunityId),
    index('notif_status_idx').on(table.status),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  hypotheses: many(hypotheses),
  workspaceItems: many(workspaceItems),
}));
