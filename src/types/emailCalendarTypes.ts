import { ModuleId, RiskLevel } from './index';

// ==========================================
// MODULE 10: EMAIL ASSISTANT TYPES
// ==========================================

export type EmailCategory =
  | 'opportunity'
  | 'professor_reply'
  | 'collaboration'
  | 'newsletter'
  | 'personal'
  | 'spam'
  | 'action_required';

export type EmailProcessingStatus =
  | 'RAW_INGESTED'
  | 'CLASSIFIED'
  | 'ENTITIES_EXTRACTED'
  | 'ACTIONS_PARSED'
  | 'DRAFT_GENERATED'
  | 'REPLIED'
  | 'ARCHIVED';

export interface EmailAttachmentMetadata {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  gcsStorageUri: string;
  isScannedSafe: boolean;
}

export interface ExtractedActionItem {
  id: string;
  emailId: string;
  description: string;
  deadline?: string;
  relatedEntity: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
  isExportedToPlanner: boolean;
  exportedTaskId?: string;
}

export interface ExtractedEntityNER {
  entityText: string;
  entityType: 'DATE' | 'MONEY' | 'PROJECT' | 'PERSON' | 'ORG' | 'DEADLINE';
  startChar: number;
  endChar: number;
}

export interface EmailDraftReply {
  id: string;
  threadId: string;
  emailId: string;
  to: string[];
  cc?: string[];
  subject: string;
  bodyText: string;
  bodyHtml: string;
  tone: 'Warm Academic' | 'Formal Executive' | 'Collaborative Peer' | 'Concise Direct';
  formalityScore: number; // 0 - 100
  styleMatchScore: number; // 0 - 100
  status: 'drafting' | 'pending_approval' | 'approved' | 'rejected' | 'sent';
  knowledgeGraphContextUsed: string[];
  createdAt: string;
  approvalRequestId?: string;
}

export interface NormalizedEmail {
  id: string; // Database PK
  messageId: string; // Provider-specific RFC 2822 ID
  threadId: string;
  fromAddress: string;
  fromName: string;
  toAddresses: string[];
  ccAddresses: string[];
  bccAddresses: string[];
  subject: string;
  bodyText: string;
  bodyHtml: string;
  originalLanguage: string; // e.g. 'en', 'es', 'de', 'zh'
  translatedEnglishText?: string;
  sentDate: string;
  receivedDate: string;
  inReplyTo?: string;
  references?: string[];
  processingStatus: EmailProcessingStatus;
  category: EmailCategory;
  categoryConfidence: number; // 0.0 - 1.0 (BERT score)
  isImportant: boolean;
  isRead: boolean;
  isReplied: boolean;
  extractedEntities: ExtractedEntityNER[];
  actionItems: ExtractedActionItem[];
  attachments: EmailAttachmentMetadata[];
  draftReply?: EmailDraftReply;
  followUpRequired?: boolean;
  followUpDueDate?: string;
  bounceStatus?: 'none' | 'soft_bounce' | 'hard_bounce';
}

export interface EmailThread {
  threadId: string;
  subject: string;
  participants: { name: string; email: string }[];
  latestMessageDate: string;
  messageCount: number;
  category: EmailCategory;
  processingStatus: EmailProcessingStatus;
  messages: NormalizedEmail[];
  hasPendingAction: boolean;
  hasDraftReply: boolean;
}

export interface PubSubWebhookLog {
  id: string;
  timestamp: string;
  provider: 'Gmail API' | 'Microsoft Graph' | 'IMAP IDLE';
  historyIdOrEvent: string;
  emailAddress: string;
  status: 'ENQUEUED' | 'CELERY_PROCESSING' | 'INGESTED' | 'FAILED';
  latencyMs: number;
}

// ==========================================
// MODULE 11: CALENDAR INTELLIGENCE TYPES
// ==========================================

export type CalendarSource = 'google' | 'outlook' | 'apple' | 'atlas_internal';

export type CalendarEventType =
  | 'meeting'
  | 'deep_work'
  | 'task_block'
  | 'deadline'
  | 'travel_buffer'
  | 'focus_block';

export type EnergyDemand = 'low' | 'medium' | 'high';

export interface CalendarAttendee {
  email: string;
  name: string;
  responseStatus: 'accepted' | 'tentative' | 'declined' | 'needsAction';
  isOrganizer?: boolean;
}

export interface InternalCalendarEvent {
  id: string;
  externalEventId?: string;
  source: CalendarSource;
  title: string;
  description: string;
  location?: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  timezone: string; // e.g. 'America/Los_Angeles'
  type: CalendarEventType;
  energyDemand: EnergyDemand;
  attendees: CalendarAttendee[];
  isLocked: boolean; // Immutable external meeting
  linkedTaskId?: string;
  linkedEmailId?: string;
  travelTimeMinutesBefore?: number;
  travelTimeMinutesAfter?: number;
  meetingUrl?: string;
  isConflict?: boolean;
  conflictId?: string;
}

export interface EnergyWindowConfig {
  period: 'morning_peak' | 'afternoon_collab' | 'evening_review' | 'night_off';
  label: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  preferredActivity: 'High-Demand Deep Work' | 'Meetings & Outreach' | 'Review & Admin' | 'Rest';
  energyScore: number; // 0 - 100
}

export interface OptaPyScheduleCandidate {
  id: string;
  name: string; // e.g. "Option A: Balanced Productivity", "Option B: Deep Work Clustered"
  description: string;
  totalScore: number; // Multi-objective utility 0-100
  hardConstraintsViolated: number; // 0 is ideal
  softConstraintSatisfactionPct: number; // 0-100%
  deepWorkHoursTotal: number;
  meetingHoursTotal: number;
  energyWindowAlignmentPct: number;
  events: InternalCalendarEvent[];
  recommendedReason: string;
}

export interface ConflictResolutionOption {
  id: string;
  description: string;
  actionType: 'reschedule_meeting' | 'shift_task_deadline' | 'split_task' | 'reject_overlap';
  impactSummary: string;
  requiresExternalApproval: boolean;
  approvalPayload?: {
    recipientEmail: string;
    proposedNewTime: string;
    meetingTitle: string;
  };
}

export interface DetectedCalendarConflict {
  id: string;
  severity: 'critical' | 'moderate' | 'minor';
  title: string;
  conflictingEventIds: string[];
  conflictingEventTitles: string[];
  conflictWindow: {
    start: string;
    end: string;
  };
  rootCause: string;
  resolutionOptions: ConflictResolutionOption[];
  isResolved: boolean;
  resolvedWithOptionId?: string;
}

export interface TimeTrackingAnalytics {
  weeklyTotalHours: number;
  actualVsTarget: {
    category: 'Meetings' | 'Deep Work & Research' | 'Admin & Email' | 'Proposal Writing';
    actualHours: number;
    targetHours: number;
    actualPercentage: number;
    targetPercentage: number;
    status: 'on_track' | 'exceeded_limit' | 'under_allocated';
  }[];
  estimationAccuracyRate: number; // e.g. 74%
  aiInsights: string[];
  topProductivityDay: string;
  focusBlockProtectionRatePct: number;
}

export interface IncomingMeetingExtraction {
  id: string;
  sourceEmailId: string;
  senderName: string;
  senderEmail: string;
  emailSubject: string;
  extractedTitle: string;
  extractedProposedTimes: {
    startTime: string;
    endTime: string;
    isUserAvailable: boolean;
  }[];
  selectedTimeIndex: number;
  extractedLocationOrLink: string;
  status: 'pending_user_review' | 'confirmed_event_created' | 'dismissed';
}
