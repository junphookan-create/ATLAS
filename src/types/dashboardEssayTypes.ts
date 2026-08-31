// Module 16: Executive Dashboard & Module 17: Social Media Advice Compiler and College Essay Architect Types

// ==========================================
// MODULE 16: EXECUTIVE DASHBOARD TYPES
// ==========================================

export interface SystemAgentStatus {
  moduleId: string;
  moduleName: string;
  status: 'active' | 'idle' | 'warning' | 'error' | 'throttled';
  activeWorkers: number;
  maxWorkers: number;
  cpuUsagePct: number;
  memoryUsageMb: number;
  tokenConsumptionRate: number; // tokens/min
  avgLatencyMs: number;
  lastHeartbeat: string;
  currentTaskSummary: string;
  errorBudgetRemainingPct: number;
}

export interface LiveStreamEvent {
  id: string;
  timestamp: string;
  sourceModule: string;
  severity: 'info' | 'success' | 'warning' | 'error' | 'critical';
  eventType: 'agent_action' | 'hitl_approval_required' | 'milestone_completed' | 'metric_anomaly' | 'budget_alert' | 'decision_logged';
  message: string;
  metadata?: Record<string, any>;
  requiresAck?: boolean;
  acknowledged?: boolean;
}

export interface TimelineTaskHorizon {
  id: string;
  title: string;
  category: 'Grant' | 'Competition' | 'Essay' | 'Research' | 'Outreach' | 'System';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progressPct: number;
  startDate: string;
  dueDate: string;
  assignedAgent: string;
  status: 'on_track' | 'at_risk' | 'blocked' | 'completed';
  bottleneckWarning?: string;
  dependentTaskIds?: string[];
  estimatedRemainingHours: number;
}

export interface DashboardKPISummary {
  totalOpportunitiesDiscovered: number;
  opportunitiesValueEstimate: string;
  grantsPipelineValue: string;
  competitionsActiveCount: number;
  pendingApprovalsCount: number;
  autonomousActionsPast24h: number;
  computeTokensConsumedToday: number;
  totalEstimatedSavingsUsd: number;
  systemReliabilityScore: number; // 0-100
  overallSprintVelocity: number;
}

export interface CommandBarActionIntent {
  rawQuery: string;
  parsedIntent: 'adjust_priority' | 'trigger_workflow' | 'grant_approval' | 'reallocate_compute' | 'query_status' | 'summarize_module' | 'general_directive';
  targetModule?: string;
  actionSummary: string;
  confidence: number;
  suggestedActionPayload?: Record<string, any>;
  executionStatus: 'previewed' | 'executed' | 'failed' | 'requires_hitl';
  executionResultText?: string;
}

// ==========================================
// MODULE 17: SOCIAL MEDIA ADVICE & ESSAY ARCHITECT TYPES
// ==========================================

export type SocialPlatform = 'Reddit' | 'YouTube' | 'TikTok' | 'Instagram' | 'CollegeConfidential' | 'Discord';

export interface SocialAdvicePost {
  id: string;
  platform: SocialPlatform;
  author: string;
  authorRole: 'AO / Former Dean' | 'Accepted Ivy Student' | 'Independent College Counselor' | 'Essay Specialist' | 'Peer Applicant';
  sourceTitle: string;
  url: string;
  upvotesOrLikes: number;
  engagementScore: number;
  timestamp: string;
  category: 'Unconventional Hooks' | 'Clichés to Avoid' | 'Vulnerability Calibration' | 'Activity Framing' | 'Supplemental Strategy' | 'Interview Tips';
  keyTakeaways: string[];
  extractedQuote: string;
  sentimentRating: 'Highly Recommended' | 'Caution / Nuance' | 'Common Myth Busted';
  tags: string[];
}

export interface AdviceTopicCluster {
  id: string;
  topicName: string;
  category: string;
  consensusScore: number; // 0-100%
  summaryInsight: string;
  recommendedDoList: string[];
  strictDontList: string[];
  representativeSourcesCount: number;
}

export interface BrainstormMetaphorNode {
  id: string;
  coreInterest: string; // e.g. "FPGA hardware synthesis & free jazz improvisation"
  intellectualTheme: string; // e.g. "Architectural improvisation under deterministic constraints"
  metaphorConcept: string; // e.g. "Timing closure is like the rhythm section holding groove while the soloist wanders"
  emotionalPivot: string; // e.g. "Accepting that perfection isn't zero jitter, but expressive timing"
  alignmentPromptIds: string[];
  potentialScore: number; // 1-10
}

export interface EssayTargetPrompt {
  id: string;
  institution: string; // "Common App", "Harvard", "Stanford", "MIT", "UC Berkeley"
  promptNumber: string; // "Prompt #1", "PIQ #6", "Intellectual Spark"
  promptText: string;
  maxWordLimit: number;
  keyEvaluationCriteria: string[];
}

export interface EssaySectionBlock {
  sectionId: 'hook' | 'inciting_incident' | 'tension_pivot' | 'intellectual_core' | 'resolution_trajectory';
  title: string;
  purpose: string;
  targetWordCount: number;
  currentWordCount: number;
  content: string;
  feedbackNotes: string[];
}

export interface AdmissionsReviewerFeedback {
  reviewerId: 'dean_admissions' | 'harsh_critic' | 'authentic_voice_advocate';
  reviewerName: string;
  roleTitle: string;
  avatarIcon: string;
  overallScore: number; // 1-10
  intellectualVitalityScore: number; // 1-10
  authenticityVoiceScore: number; // 1-10
  hookStrengthScore: number; // 1-10
  narrativeArcScore: number; // 1-10
  strengths: string[];
  vulnerabilitiesOrRedFlags: string[];
  lineByLineCritique: {
    excerpt: string;
    critique: string;
    suggestedRevision: string;
  }[];
  finalVerdict: 'Strong Admit / Top 2%' | 'Competitive Contender' | 'Borderline / Needs Polish' | 'Generic / Rewrite Recommended';
}

export interface VoiceHumanizerMetrics {
  totalWordCount: number;
  readingTimeMinutes: number;
  voiceAuthenticityIndex: number; // 0-100
  burstinessScore: number; // sentence length variation
  perplexityEstimate: number; // vocabulary novelty & syntax variance
  aiLikelihoodScore: number; // 0-100 (lower is better, e.g. < 5%)
  clicheCount: number;
  passiveVoiceRatioPct: number;
  vocabularyRichnessRatio: number; // unique words / total words
}

export interface CollegeEssayProject {
  id: string;
  title: string;
  targetInstitution: string;
  selectedPrompt: EssayTargetPrompt;
  centralMetaphor: string;
  status: 'brainstorming' | 'outline' | 'drafting' | 'reviewing' | 'finalized';
  version: number;
  sections: EssaySectionBlock[];
  fullDraftText: string;
  voiceMetrics: VoiceHumanizerMetrics;
  reviewerPanels: AdmissionsReviewerFeedback[];
  ragReferenceEssaysUsed: {
    essayTitle: string;
    acceptedSchool: string;
    similarityTheme: string;
    relevanceScore: number;
  }[];
  createdAt: string;
  updatedAt: string;
}
