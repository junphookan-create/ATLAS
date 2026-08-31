export type ModuleId =
  | 'approval_center'
  | 'celery_worker_dashboard'
  | 'opportunity_discovery'
  | 'competition_manager'
  | 'grant_writer'
  | 'research_scientist'
  | 'outreach_manager'
  | 'social_media_manager'
  | 'brand_collaboration'
  | 'startup_growth'
  | 'knowledge_workspace'
  | 'email_assistant'
  | 'calendar_intelligence'
  | 'ai_research_lab'
  | 'browser_agent'
  | 'project_builder'
  | 'document_generator'
  | 'executive_dashboard'
  | 'essay_architect'
  | 'side_hustle_scraper'
  | 'idea_incubator'
  | 'general_cognitive_worker';

export interface CeleryTaskUI {
  id: string;
  name: string;
  args: any[];
  kwargs: Record<string, any>;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY';
  result?: any;
  error?: string;
  retries: number;
  maxRetries: number;
  createdAt: string;
  completedAt?: string;
}

export interface CeleryWorkerStatsUI {
  isProcessing: boolean;
  queueLength: number;
  totalCompleted: number;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  retryCount: number;
  avgExecutionDurationMs: number;
  successRate: number;
  beat: {
    isActive: boolean;
    intervalMs: number;
    lastSweepAt: string;
    totalExpiredSwept: number;
    healthStatus: string;
  };
}

export interface RedisStreamMetricUI {
  stream: string;
  totalEvents: number;
  consumerGroups: {
    name: string;
    lastReadIndex: number;
    unreadLag: number;
  }[];
  lastEventTime: string | null;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ApprovalRequest {
  id: string;
  tenantId: string;
  userId: string;
  moduleName: ModuleId;
  actionType: string;
  payload: Record<string, any>;
  summary: string;
  riskLevel: RiskLevel;
  status: 'pending' | 'approved' | 'approved_with_modifications' | 'denied' | 'expired' | 'executed' | 'more_info_requested';
  createdAt: string;
  expiresAt: string;
  previousHash: string;
  hash: string;
  justification?: string;
  modifications?: Record<string, any>;
  callbackUrl?: string;
  callbackPayload?: Record<string, any>;
  evidence?: {
    type: string;
    title: string;
    content: string;
    url?: string;
  };
  executedAt?: string;
  executedBy?: string;
  impactScore?: number;
}

export interface ApprovalPolicy {
  id: string;
  actionType: string;
  moduleName: ModuleId;
  riskLevel: RiskLevel;
  ttlSeconds: number;
  autoExpireAction: 'deny' | 'cancel';
  requireJustification: boolean;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  source: string;
  category: 'Grant' | 'Competition' | 'Scholarship' | 'Fellowship' | 'Hackathon';
  deadline: string;
  fundingAmount?: string;
  eligibility: string;
  description: string;
  relevanceScore: number; // 0-1 (Cosine similarity with user profile embedding via text-embedding-3-large)
  impactScore: number; // 0-1 (Logistic regression output: prestige, complexity, prize, expected applicants)
  priorityScore: number; // 0-1 (Weighted combination of relevance and impact)
  url: string;
  status: 'discovered' | 'pursued' | 'archived' | 'dismissed';
  
  // Extended Horizon Scanning & Extraction Metadata
  originalLanguage?: string;
  translatedText?: string;
  nerEntities?: {
    organizations: string[];
    monetaryAmounts: string[];
    academicFields: string[];
    requiredSkills: string[];
    dates: string[];
  };
  eligibilityDeBERTa?: {
    categories: string[];
    isEligible: boolean;
    restrictiveFlags: string[];
    confidence: number;
  };
  scoreBreakdown?: {
    embeddingCosineSim: number;
    prestigeRank: number;
    applicationComplexity: number; // 1-10 (e.g. required docs count)
    estimatedApplicants: number;
    historicalWinRateMatch: number;
    customWeightProfile: {
      relevanceWeight: number;
      prestigeWeight: number;
      easeOfApplyWeight: number;
    };
  };
  scraperMetadata?: {
    strategy: 'api' | 'static_html_lxml' | 'playwright_stealth';
    sourcePlatform: 'Kaggle' | 'Devpost' | 'LinkedIn' | 'GitHub Jobs' | 'RSS' | 'Custom Portal';
    gcsStagedPath?: string;
    layoutExtractionMethod?: 'unstructured_io' | 'wrapper_induction_ml';
    proxyTypeUsed?: 'residential_rotating' | 'browserless_chrome' | 'direct';
    scrapedAt: string;
  };
  isDuplicateFlag?: boolean;
  duplicateOfId?: string;
  similarityScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserScoringPreferences {
  relevanceWeight: number; // e.g. 0.50
  prestigeWeight: number; // e.g. 0.30
  easeOfApplyWeight: number; // e.g. 0.20
  minimumAlertThreshold: number; // default 0.85
  digestThreshold: number; // default 0.60
  userProfileEmbeddingsLoaded: boolean;
  userSkills: string[];
  userInterests: string[];
  userPastWinsCount: number;
}

export interface ScraperJobStatus {
  id: string;
  name: string;
  source: string;
  strategy: 'api' | 'static_html_lxml' | 'playwright_stealth';
  schedule: 'every_15_mins' | 'hourly' | 'daily';
  lastRunAt: string;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'RATE_LIMITED' | 'RETRY';
  itemsScrapedCount: number;
  proxyPool: 'rotating_residential' | 'browserless_chrome_cluster';
  wrapperStabilityScore: number; // 0-100%
  gcsRetentionDays: number;
}

export interface OpportunityNotificationRecord {
  id: string;
  opportunityId: string;
  title: string;
  priorityScore: number;
  channel: 'INSTANT_SSE' | 'WEB_PUSH' | 'DAILY_DIGEST_JINJA2';
  recipientEmail?: string;
  status: 'DELIVERED' | 'QUEUED' | 'VIEWED' | 'DISMISSED';
  deliveredAt: string;
  summarySnippet: string;
}

export interface OpportunityInteraction {
  id: string;
  opportunityId: string;
  userId: string;
  action: 'view' | 'save' | 'apply' | 'ignore' | 'pursue';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface StructuredRules {
  eligibility_criteria: string;
  required_materials: string[];
  key_dates: {
    submission_deadline: string;
    judging_start_date: string;
    winner_announce_date: string;
  };
  evaluation_criteria: {
    criterion: string;
    weightPercentage: number;
    description: string;
  }[];
  restrictions: string[];
}

export interface CompetitionSubtask {
  id: string;
  parentId?: string;
  materialKey: string;
  title: string;
  description: string;
  effortHours: number;
  relativeDeadline: string;
  completed: boolean;
  assignedAgent: string;
  isCriticalPath: boolean;
}

export interface DraftArtifact {
  id: string;
  competitionId: string;
  fieldKey: string;
  title: string;
  content: string;
  version: number;
  wordCount: number;
  maxWords: number;
  selfCritiqueScore: number; // 0-100
  critiqueNotes: string[];
  revisionCount: number;
  approvalStatus: 'DRAFTING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  ltmExamplesUsed: string[];
  knowledgeGraphCitations: string[];
  updatedAt: string;
}

export interface BrowserFormFieldMapping {
  fieldName: string;
  selector: string;
  value: string;
  fieldType: 'text' | 'textarea' | 'file_upload' | 'select' | 'checkbox';
  status: 'MAPPED' | 'FILLED' | 'MANUAL_REQUIRED';
}

export interface BrowserSubmissionState {
  submissionPortalUrl: string;
  formFieldMappings: BrowserFormFieldMapping[];
  preSubmissionScreenshot: string;
  confirmationScreenshot: string;
  confirmationNumber: string;
  harLogUri?: string;
  status: 'IDLE' | 'AUTO_FILLING' | 'AWAITING_HUMAN_APPROVAL' | 'SUBMITTED' | 'FALLBACK_MANUAL' | 'ERROR';
  errorMessage?: string;
}

export interface PostSubmissionMonitor {
  lastCheckedAt: string;
  emailTrackingStatus: string;
  portalStatusScraped: string;
  winnerListStatus: string;
  isWinner: boolean;
  celebrationTriggered: boolean;
  socialDraft?: string;
}

export interface Competition {
  id: string;
  opportunityId?: string;
  title: string;
  organizer: string;
  deadline: string;
  submissionDeadline?: string;
  judgingStartDate?: string;
  winnerAnnounceDate?: string;
  prizePool: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'shortlisted' | 'won' | 'lost';
  officialGuidelinesUrl?: string;
  feedback?: string;
  requiredMaterials: string[];
  structuredRules?: StructuredRules;
  structuredRulesSummary: string;
  checklist: CompetitionSubtask[];
  draftArtifacts?: DraftArtifact[];
  browserSubmissionState?: BrowserSubmissionState;
  postSubmissionMonitor?: PostSubmissionMonitor;
  submissionScreenshot?: string;
}

export interface PostgresAuditEntry {
  id: string;
  tenantId: string;
  tableName: 'opportunities' | 'competitions' | 'approvals' | 'grants';
  recordId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  diff?: Record<string, { old: any; new: any }> | null;
  changedFields?: string[];
  performedBy: string;
  clientIp?: string;
  clientUserAgent?: string;
  hash: string;
  previousHash: string;
  createdAt: string;
}

export interface GrantProfile {
  agencyMission: string;
  explicitPriorities: string[];
  implicitPriorities: string[];
  typicalAwardSize: string;
  typicalDuration: string;
  recentAwardees: {
    name: string;
    institution: string;
    projectTitle: string;
    year: number;
    funding: string;
  }[];
  specialRequirements: {
    dmpRequired: boolean;
    broaderImpactsRequired: boolean;
    biosketchFormat: string;
    pageLimit: number;
  };
  priorFundedPatterns: {
    source: 'PubMed' | 'arXiv' | 'NIH RePORTER' | 'UKRI Gateway' | 'NSF Award Search';
    query: string;
    commonPhrases: string[];
    commonPitfalls: string[];
    structuralStrengths: string[];
  }[];
}

export interface GrantOutlineNode {
  id: string;
  sectionKey: string;
  title: string;
  criterionConnected: string;
  suggestedWordCount: number;
  hypotheses?: string[];
  subsections: {
    title: string;
    prompt: string;
    keyPoints: string[];
  }[];
  status: 'draft' | 'approved_by_user' | 'modifying';
}

export interface GrantBudgetItem {
  id: string;
  category: 'Personnel' | 'Equipment' | 'Travel' | 'Publications' | 'Supplies' | 'Indirect_Costs_FA';
  lineItem: string;
  justification: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  sourceQuoteScraped: string;
  blsRateCode?: string;
  warningFlag?: string;
}

export interface GrantBudgetSummary {
  directCosts: number;
  indirectCostRate: number; // e.g. 52.5%
  indirectCosts: number;
  totalRequested: number;
  maxAllowableFunding: number;
  budgetNarrative: string;
  lineItemWarnings: string[];
}

export interface CritiqueEvaluation {
  iteration: number;
  clarityScore: number; // 1-10
  significanceScore: number; // 1-10
  innovationScore: number; // 1-10
  feasibilityScore: number; // 1-10
  alignmentScore: number; // 1-10
  competitivenessScore: number; // 1-10
  overallScore: number; // 1-10
  topThreeCritiques: string[];
  textualRecommendations: string[];
  coherenceCheckPassed: boolean;
  coherenceNotes: string[];
  timestamp: string;
}

export interface SupplementaryMaterials {
  dataManagementPlan: string;
  lettersOfSupport: {
    institution: string;
    signer: string;
    title: string;
    text: string;
  }[];
  biosketch: {
    name: string;
    positionTitle: string;
    personalStatement: string;
    contributions: string[];
  };
  typesetPdfUrl?: string;
  formattedDocxUrl?: string;
}

export interface PostSubmissionAnalysis {
  status: 'pending_decision' | 'awarded' | 'rejected';
  feedbackIngested?: string;
  strengthsExtracted: string[];
  weaknessesExtracted: string[];
  archivedAsSuccessTemplate: boolean;
  timeSpentHours: number;
  apiTokensCost: number;
  grantWritingEfficiency: number; // e.g. 96.8%
}

export interface GrantProposal {
  id: string;
  opportunityId?: string;
  title: string;
  agency: string;
  grantType: string;
  fundingAmount: string;
  deadline: string;
  status: 'drafting' | 'critique' | 'ready_for_review' | 'submitted' | 'awarded';
  sections: {
    id: string;
    title: string;
    content: string;
    wordCount: number;
    maxWords: number;
    assignedAgent?: string;
    knowledgeWorkspaceCitations?: string[];
  }[];
  grantProfile?: GrantProfile;
  outlineNodes?: GrantOutlineNode[];
  budgetItems?: GrantBudgetItem[];
  budgetSummary?: GrantBudgetSummary;
  critiqueHistory?: CritiqueEvaluation[];
  supplementaryMaterials?: SupplementaryMaterials;
  postSubmissionAnalysis?: PostSubmissionAnalysis;
  critiqueScores: {
    clarity: number;
    significance: number;
    innovation: number;
    feasibility: number;
    alignment: number;
    competitiveness?: number;
    overall: number;
  };
  critiqueNotes: string[];
}

export interface IngestionSource {
  id: string;
  name: string;
  type: 'arxiv' | 'pubmed' | 'biorxiv' | 'nature' | 'science' | 'custom_rss';
  endpoint: string;
  pollingFrequency: string; // e.g. 'Every 15 mins' or 'Daily'
  lastPolled: string;
  status: 'active' | 'rate_limited' | 'paused';
  papersIngested: number;
  rateLimitRemaining: number;
}

export interface PaperChunk {
  chunkIndex: number;
  section: string;
  text: string;
  embeddingVectorSize: number;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  affiliations?: string[];
  venue: string;
  year: number;
  doi: string;
  citations: number;
  abstract: string;
  growthRate: string;
  clusterName: string;
  clusterId?: string;
  sourceType?: string;
  ingestedAt?: string;
  pdfUrl?: string;
  fullTextAvailable?: boolean;
  semanticChunks?: PaperChunk[];
  coCitations?: string[];
  betweennessScore?: number;
}

export interface ResearchCluster {
  id: string;
  name: string;
  themeSummary: string;
  subThemes: string[];
  topKeywords: string[]; // Top 10 TF-IDF keywords
  paperCount: number;
  papersLast3Months: number;
  papersPreceding6Months: number;
  growthVelocity: number; // percentage change
  growthTrajectory: 'explosive' | 'emerging' | 'stable' | 'declining';
  silhouetteScore: number;
  colorHex: string;
}

export interface CoCitationGap {
  id: string;
  title: string;
  sourceClusterId: string;
  sourceClusterName: string;
  targetClusterId: string;
  targetClusterName: string;
  bridgingTopic: string;
  betweennessCentrality: number; // 0-1
  citationCount: number;
  rationale: string;
  suggestedGapHypothesis: string;
  confidenceScore: number; // 0-1
}

export interface ReActStep {
  stepNumber: number;
  thought: string;
  action: string;
  actionInput?: string;
  observation: string;
}

export interface ResearchHypothesis {
  id: string;
  title: string;
  domain: string;
  independentVariable: string;
  dependentVariable: string;
  controlConditions: string[];
  predictedOutcome: string;
  rationale: string;
  confidenceScore: number;
  status: 'hypothesis' | 'testing' | 'validated' | 'refuted';
  supportingPaperIds: string[];
  reactReasoningChain?: ReActStep[];
  knowledgeWorkspaceNodeId?: string;
  suggestedExperiments?: string[];
  type?: 'computational' | 'wet_lab' | 'hybrid';
  createdAt?: string;
}

export interface ComputationalAnalysis {
  hypothesisId: string;
  language: 'python' | 'r';
  stack: string[]; // e.g. ['scanpy', 'scikit-learn', 'torch']
  generatedCode: string;
  executionStatus: 'success' | 'running' | 'failed';
  executionTimeMs: number;
  datasetUsed: {
    name: string;
    source: 'Hugging Face Datasets' | 'Kaggle' | 'Local';
    url?: string;
    sampleCount: number;
  };
  metrics: Record<string, number | string>;
  findingsSummary: string;
  outputArtifacts: {
    type: 'table' | 'figure' | 'chart';
    title: string;
    description: string;
    dataPreview?: string;
  }[];
}

export interface WetLabProtocol {
  hypothesisId: string;
  title: string;
  objective: string;
  reagents: {
    name: string;
    catalogId: string;
    supplier: string;
    unitPriceEstimate: string;
    requiredQty: string;
  }[];
  stepByStepProtocol: {
    stepNumber: number;
    title: string;
    duration: string;
    instructions: string;
    criticalControls: string;
  }[];
  safetyPrecautions: string[];
  estimatedCost: string;
  turnaroundDays: number;
}

export interface TargetJournalRecommendation {
  name: string;
  publisher: string;
  impactFactor: number;
  openAccess: boolean;
  typicalTurnaroundWeeks: number;
  acceptanceRate: number; // percentage
  matchScore: number; // 0-100
  scopeAlignmentRationale: string;
  submissionGuidelinesUrl: string;
}

export interface ManuscriptDraft {
  id: string;
  hypothesisId: string;
  title: string;
  authors: string[];
  targetJournal: string;
  abstract: string;
  introduction: string;
  methods: string;
  results: string;
  discussion: string;
  references: string[];
  latexSource: string;
  status: 'drafting' | 'review_ready' | 'submitted';
  targetJournalRecommendations: TargetJournalRecommendation[];
}

export interface PersonalResearcherProfile {
  researcherName: string;
  primaryInterests: string[];
  emergingInterests: string[];
  knownMethodologies: string[];
  collaborators: {
    name: string;
    institution: string;
    complementarySkills: string[];
    coAuthoredPapersCount: number;
  }[];
  activeProjectIds: string[];
  nextScheduledReviewSession?: string;
}

export interface ContactProfile {
  hIndex?: number;
  citationCount?: number;
  recentPublications?: { title: string; year: number; journal?: string; citations?: number }[];
  googleScholarSnippet?: string;
  linkedInUrl?: string;
  verifiedEmailScore?: number; // 0-100 (Hunter.io verification)
  emailDeliverability?: 'valid' | 'risky' | 'unverified';
  secondaryEmail?: string;
  phone?: string;
  preferredTimeZone?: string;
  institutionTier?: string;
  cooldownUntil?: string; // ISO date for cooldown protection
  notes?: string;
}

export interface ContactAuditEntry {
  id: string;
  timestamp: string;
  changedField: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  complianceReason?: string; // GDPR, user update, etc.
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  email: string;
  secondaryEmail?: string;
  phone?: string;
  location: string;
  researchInterests: string[];
  relationshipStrength: number; // 0-1
  lastContacted: string;
  status: 'prospective' | 'contacted' | 'replied' | 'collaborator';
  source?: 'web_scrape' | 'semantic_scholar' | 'linkedin' | 'competition_context' | 'paper_author' | 'manual';
  linkedProjectIds?: string[];
  linkedOpportunityIds?: string[];
  profile?: ContactProfile;
  auditTrail?: ContactAuditEntry[];
}

export interface PersonalizedEmailDraft {
  id: string;
  campaignId: string;
  contactId: string;
  contactName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  personalizedCompliment: string;
  userBackgroundConnection: string;
  concreteAsk: string;
  styleScore: {
    formalityMatch: number; // 0-100
    toneAlignment: string; // e.g. "Warm Academic"
    concisenessScore: number; // 0-100
    overallStyleMatch: number; // 0-100
  };
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'sent';
  sentAt?: string;
  followUpScheduledAt?: string;
  isFollowUp?: boolean;
  followUpSequenceNumber?: number;
  replyData?: {
    detected: boolean;
    detectedAt?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    intent?: 'interested' | 'not_interested' | 'request_for_info' | 'referral';
    snippet?: string;
    suggestedAction?: 'schedule_meeting' | 'send_paper' | 'archive';
  };
}

export interface Campaign {
  id: string;
  title: string;
  naturalLanguageIntent?: string;
  objective?: string;
  targetRole: string;
  totalContacts: number;
  emailsSent: number;
  repliesReceived: number;
  positiveReplyRate: number;
  openRate?: number; // percentage
  meetingConversionRate?: number; // percentage
  status: 'active' | 'paused' | 'completed';
  dailyLimit?: number;
  maxContactsPerDay?: number;
  followUpDays?: number;
  startDate?: string;
  contactIds?: string[];
  targetCriteria?: {
    keywords: string[];
    minHIndex?: number;
    locations?: string[];
    institutions?: string[];
  };
  drafts?: PersonalizedEmailDraft[];
}

export interface ContextualDiscoveryCandidate {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  emailGuess: string;
  confidenceScore: number;
  sourceType: 'competition_judge' | 'paper_corresponding_author' | 'paper_author' | 'past_winner' | 'event_speaker';
  sourceEntityName: string; // e.g. "Kaggle NeuroMatch 2026", "Nature BCI Paper"
  suggestedCollaborationAngle: string;
}

export interface OutreachAnalyticsData {
  totalDelivered: number;
  openRate: number;
  replyRate: number;
  positiveReplyRate: number;
  meetingsBooked: number;
  activeCooldowns: number;
  spamRiskScore: number; // 0-100 (lower is better)
  recommendations: {
    title: string;
    insight: string;
    potentialImpact: string;
  }[];
}

export interface SocialMediaImageVariant {
  id: string;
  url?: string;
  prompt: string;
  composition: string;
  colorScheme: string;
  focusAngle: string;
  aestheticScore: number; // 0-100 (neural aesthetic classifier)
  ocrSafeZones?: { top: number; left: number; width: number; height: number };
  altText: string;
  isSelected?: boolean;
}

export interface VideoStoryboardScene {
  sceneNumber: number;
  durationSeconds: number;
  visualDescription: string;
  onScreenText: string;
  voiceoverScript: string;
  transitionEffect: 'cut' | 'fade_black' | 'whip_pan' | 'zoom_in' | 'cross_dissolve';
}

export interface VideoProductionSpec {
  format: '1080x1920_vertical' | '1920x1080_horizontal' | '1080x1080_square';
  totalDurationSeconds: number;
  scenes: VideoStoryboardScene[];
  voiceoverEngine: 'Bark' | 'Tortoise-TTS' | 'ElevenLabs';
  voiceTone: 'authoritative' | 'friendly' | 'academic' | 'inspirational';
  backgroundMusicGenMood: 'lofi_chill' | 'driving_synthwave' | 'ambient_minimalist' | 'upbeat_tech';
  musicTempoBpm: number;
}

export interface CarouselSlide {
  slideNumber: number;
  headline: string;
  bodyContent: string;
  keyMetricOrQuote?: string;
  visualPrompt: string;
  altText: string;
}

export interface SocialPost {
  id: string;
  platform: 'X/Twitter' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube' | 'Pinterest';
  caption: string;
  mediaType: 'text' | 'image' | 'video' | 'carousel';
  mediaPrompt?: string;
  imageVariants?: SocialMediaImageVariant[];
  selectedVariantId?: string;
  carouselSlides?: CarouselSlide[];
  videoSpec?: VideoProductionSpec;
  scheduledTime: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected';
  hashtags?: string[];
  mentions?: string[];
  altText?: string;
  complianceChecked?: boolean;
  complianceIssues?: string[];
  campaignTag?: string;
  dealId?: string; // Linked brand collaboration deal
  optimalTimingReason?: string;
  engagementMetrics?: {
    likes: number;
    shares: number;
    comments: number;
    impressions: number;
    reach?: number;
    clicks?: number;
    ctr?: number; // Click-through-rate %
    sentimentBreakdown?: { positive: number; neutral: number; negative: number };
  };
}

export interface SocialListeningMention {
  id: string;
  platform: 'X/Twitter' | 'LinkedIn' | 'Instagram' | 'Reddit' | 'YouTube';
  author: string;
  authorHandle: string;
  authorFollowers?: number;
  content: string;
  detectedAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'question' | 'complaint' | 'praise' | 'competitor_reference' | 'general';
  suggestedReplyDraft: string;
  status: 'unhandled' | 'reply_queued' | 'replied' | 'ignored';
}

export interface ContentStrategyPlan {
  id: string;
  brief: string;
  goals: ('increase_followers' | 'drive_traffic' | 'build_community' | 'recruit_collaborators' | 'brand_awareness')[];
  targetAudience: string;
  recommendedMix: {
    platform: 'X/Twitter' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube' | 'Pinterest';
    recommendedFormat: 'carousel' | 'short_thread' | 'long_article' | '60s_video' | 'infographic_pin';
    frequencyPerWeek: number;
    bestTimeWindow: string;
    strategicRationale: string;
  }[];
  generatedPosts: SocialPost[];
  createdAt: string;
}

export interface SocialAnalyticsOverview {
  totalFollowers: number;
  followerGrowth7d: number;
  totalImpressions30d: number;
  avgEngagementRate: number; // percentage e.g. 4.8
  sentimentRatio: { positive: number; neutral: number; negative: number };
  platformBreakdown: {
    platform: string;
    followers: number;
    engagementRate: number;
    topPostEngagement: string;
  }[];
  arimaForecast: {
    dates: string[];
    predictedImpressions: number[];
    lowerBound: number[];
    upperBound: number[];
  };
  mabExperiment: {
    format: string;
    trials: number;
    rewardAvg: number;
    status: 'exploring' | 'exploiting';
  }[];
  abTests: {
    id: string;
    postTitle: string;
    variantA: { hook: string; ctr: number; conversions: number };
    variantB: { hook: string; ctr: number; conversions: number };
    confidence: number;
    winner: 'Variant A' | 'Variant B' | 'Inconclusive';
  }[];
  advisorReport: {
    summary: string;
    topPerformersInsights: string[];
    actionableRecommendations: string[];
    riskWarnings: string[];
  };
}

// Module 7: Brand Collaboration Manager Types
export interface BrandDossier {
  id: string;
  brandName: string;
  logoUrl?: string;
  website: string;
  industry: string;
  missionStatement: string;
  targetDemographics: string;
  recentCampaigns: string[];
  productPortfolio: string[];
  financialTier: 'Seed/Startup' | 'Series B-D Scaleup' | 'Enterprise / Tech Giant' | 'Venture Fund';
  fitScore: number; // 0-100%
  fitRationale: string;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    linkedinUrl?: string;
    location: string;
  };
  discoverySource: 'AspireIQ' | 'Upfluence' | 'Grapevine' | 'Competitor_Scrape' | 'Website_Crawler';
  matchedCompetitorCampaign?: string;
  pitchStatus: 'prospective' | 'pitch_drafted' | 'pitch_sent' | 'in_negotiation' | 'contract_signed' | 'declined';
  lastInteractedDate?: string;
}

export interface SponsorshipPackage {
  id: string;
  tierName: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Custom';
  priceUsd: number;
  deliverablesSummary: string[];
  estimatedReach: number;
  projectedImpressions: number;
  includedChannels: string[];
  exclusiveSponsorshipDays: number;
  features: string[];
}

export interface MediaKitData {
  creatorName: string;
  niche: string;
  tagline: string;
  totalNetworkReach: number;
  avgEngagementRate: number;
  demographics: {
    occupations: { label: string; percentage: number }[];
    ageGroups: { label: string; percentage: number }[];
    topLocations: { label: string; percentage: number }[];
  };
  topContentCaseStudies: {
    title: string;
    platform: string;
    impressions: number;
    engagement: string;
    keyTakeaway: string;
  }[];
  pastBrandCollaborators: string[];
  standardPricingTiers: SponsorshipPackage[];
  contactEmail: string;
}

export interface BrandDealDeliverable {
  id: string;
  dealId: string;
  title: string;
  platform: 'X/Twitter' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube';
  format: 'thread' | 'dedicated_video' | 'carousel' | 'article_shoutout' | 'newsletter_placement';
  dueDate: string;
  status: 'drafting' | 'pending_approval' | 'scheduled' | 'published';
  linkedPostId?: string;
  utmTrackingUrl?: string;
  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    earnedMediaValueUsd: number;
  };
}

export interface BrandDealInvoice {
  invoiceNumber: string;
  dealId: string;
  amountUsd: number;
  paymentTerms: 'Net 15' | 'Net 30' | '50% Upfront, 50% on Completion' | 'Immediate';
  issuedDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  paymentLinkOrWireInfo: string;
}

export interface BrandDeal {
  id: string;
  brandId: string;
  brandName: string;
  dealTitle: string;
  packageTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Custom';
  contractValueUsd: number;
  status: 'prospecting' | 'pitch_sent' | 'in_negotiation' | 'contract_signed' | 'deliverables_active' | 'completed' | 'renewed';
  contactPerson: string;
  contactEmail: string;
  contractSignDate?: string;
  campaignStartDate: string;
  campaignEndDate: string;
  deliverables: BrandDealDeliverable[];
  invoices: BrandDealInvoice[];
  communicationLog: {
    id: string;
    date: string;
    sender: 'user' | 'brand' | 'agent';
    summary: string;
    attachmentName?: string;
  }[];
  postCampaignReport?: {
    totalImpressions: number;
    totalEngagements: number;
    totalClicks: number;
    estimatedRoiRatio: number; // e.g. 3.4x return on spend
    creatorHourlyEarnedRate: number; // e.g. $420/hr
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    topCommentQuotes: string[];
    clientRenewalLikelihood: 'High' | 'Medium' | 'Low';
  };
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'Project' | 'Research' | 'Competition' | 'Contact' | 'Deadline' | 'Document';
  description: string;
  tags: string[];
  x?: number;
  y?: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body: string;
  category: 'opportunity' | 'professor_reply' | 'collaboration' | 'action_required' | 'newsletter';
  date: string;
  hasReplyDraft: boolean;
  draftContent?: string;
  extractedActions?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'deep_work' | 'deadline' | 'travel';
  energyDemand: 'low' | 'medium' | 'high';
  isConflict?: boolean;
}

export interface WbsTask {
  id: string;
  title: string;
  assignee: string;
  durationDays: number;
  status: 'todo' | 'in_progress' | 'completed';
  dependencies: string[];
}

export interface SideHustleBlueprint {
  id: string;
  title: string;
  category: string;
  toolsRequired: string[];
  timeToFirstDollar: string;
  automationLevel: number; // 0-100
  profitabilityPotential: string;
  scamScore: number; // 0-100 (lower is legitimate)
  steps: string[];
  trendsVelocity: 'Rising' | 'Stable' | 'Explosive';
}

export interface LeanCanvas {
  problem: string[];
  solution: string[];
  valueProposition: string;
  unfairAdvantage: string;
  customerSegments: string[];
  channels: string[];
  revenueStreams: string[];
  costStructure: string[];
}

// =========================================================================
// GENERAL COGNITIVE WORKER (GCW) & COGNITIVE ARCHITECTURE TYPES
// =========================================================================

export type GCWChunkType =
  | 'fact'
  | 'goal'
  | 'hypothesis'
  | 'question'
  | 'plan'
  | 'constraint'
  | 'observation';

export interface GCWWorkingChunk {
  id: string;
  type: GCWChunkType;
  content: string;
  confidence: number;
  source: string;
  timestamp: string;
  relevance: number; // 0-1 computed by attention controller
  isComposed?: boolean;
  subChunkIds?: string[];
}

export interface SensoryEvent {
  id: string;
  timestamp: string;
  inputType: 'text' | 'image' | 'audio' | 'structured';
  source: string;
  rawInput: string;
  tokenCount?: number;
  entities?: {
    people: string[];
    organizations: string[];
    dates: string[];
    locations: string[];
    concepts: string[];
  };
  relationships?: { subject: string; predicate: string; object: string }[];
  vlmDescription?: string;
  ocrExtractedText?: string;
  whisperTranscript?: string;
  diarizedSpeakers?: { speaker: string; text: string; time: string }[];
  inferredSchema?: Record<string, string>;
  salienceScore: number; // 0-1
  salienceSummary: string;
}

export interface EpisodicMemory {
  id: string;
  timestamp: string;
  taskTitle: string;
  objective: string;
  inputState: string;
  reasoningSteps: string[];
  actionsTaken: string[];
  outcome: string;
  successScore: number; // 0-1
  clusterSummaryTag?: string;
  vectorEmbeddingSnippet: string;
}

export interface SemanticTriple {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
  source: string;
  hasContradiction?: boolean;
  contradictionDetails?: string;
}

export interface ProceduralSkill {
  id: string;
  name: string;
  description: string;
  parameters: { name: string; type: string; description: string; required: boolean }[];
  pythonRoutine: string;
  version: string;
  invocationCount: number;
  avgSuccessRate: number;
  learnedAt: string;
}

export interface HTNMethod {
  id: string;
  taskName: string;
  preconditions: string[];
  subtasks: string[];
  isLlmGenerated: boolean;
  validationScore: number;
}

export interface CounterfactualSimulation {
  id: string;
  candidateAction: string;
  simulatedOutcome: string;
  riskScore: number; // 0-1
  projectedReward: number; // 0-1
  selected: boolean;
}

export interface SensePlanActReflectCycle {
  cycleIndex: number;
  timestamp: string;
  senseSummary: string;
  formulatedPlan: string[];
  executedAction: string;
  reflectionNotes: string;
  revisedPlan?: string[];
  scratchpadText: string;
}

export interface ActionDispatcherLog {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING_APPROVAL';
  resultSummary: string;
  sha256Hash: string;
  prevHash: string;
}

export interface MetaCognitiveState {
  persona: 'formal_professional' | 'startup_cofounder' | 'creative_strategist' | 'academic_researcher';
  operationalMode: 'directed' | 'autonomous' | 'collaborative';
  resourceAllocation: {
    cpuUsagePct: number;
    tokenBudgetRemaining: number;
    activeModelTier: 'Gemini 2.5 Flash (Fast/Cost-Optimized)' | 'Gemini 3.5 Pro (Deep Reasoning)' | 'Llama-3-Local';
    estimatedCostUsd: number;
  };
  globalTaskQueue: {
    id: string;
    title: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'queued' | 'active' | 'preempted' | 'completed';
    progressPct: number;
    assignedSubAgent: string;
  }[];
  selfEvaluation: {
    taskSuccessRatePct: number;
    userSatisfactionScorePct: number;
    efficiencyRatio: number;
    totalCostSavingsPct: number;
  };
  metaReasoning: {
    isStuck: boolean;
    confidenceScore: number;
    activeIntervention?: string;
    strategyChangesCount: number;
  };
}

export interface StartupCofounderWalkthroughState {
  scenarioTitle: string;
  currentDay: number;
  totalDays: number;
  dailyStandup: {
    timestamp: string;
    yesterdayAccomplished: string[];
    plannedToday: string[];
    blockers: string[];
  };
  workstreams: {
    marketAnalysis: {
      status: 'pending' | 'in_progress' | 'completed';
      progressPct: number;
      tamSamSom: { tamUsd: string; samUsd: string; somUsd: string };
      keyFindings: string[];
      swotSummary: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
      reportPages: number;
    };
    pitchDeck: {
      status: 'pending' | 'in_progress' | 'completed';
      progressPct: number;
      totalSlides: number;
      slides: { slideNumber: number; title: string; bullets: string[]; visualType: string }[];
    };
    mvpDevelopment: {
      status: 'pending' | 'in_progress' | 'completed';
      progressPct: number;
      techStack: { frontend: string; backend: string; database: string };
      previewUrl: string;
      testSuiteStatus: 'Passing (14/14 tests)' | 'Running' | 'Failed';
      personaFeedback: { persona: string; comment: string; willingnessToPay: string; rating: number }[];
    };
  };
}

export interface CrossCuttingGovernance {
  security: {
    mtlsStatus: 'Active & Encrypted (Cert auto-rotated 24h)';
    jwtExpiryMinutes: number;
    vaultSecretsStatus: 'Injected via HashiCorp Vault Runtime';
    auditChainLength: number;
    chainIntegrity: 'Valid (Cryptographic SHA-256 Verified)';
  };
  observability: {
    openTelemetryTraces: {
      traceId: string;
      spanId: string;
      service: string;
      operation: string;
      durationMs: number;
      status: 'OK' | 'ERROR';
    }[];
    anomalies: {
      id: string;
      metric: string;
      deviationPct: number;
      severity: 'Low' | 'Medium' | 'High';
      remediationAction: string;
      timestamp: string;
    }[];
  };
  costManagement: {
    dailySpendUsd: number;
    monthlyBudgetUsd: number;
    forecastMonthEndUsd: number;
    tokenUsageByModel: { model: string; inputTokens: number; outputTokens: number; costUsd: number }[];
    queryCacheHitRatePct: number;
  };
  multiTenancy: {
    activeTenantId: string;
    tenantIsolationMode: 'Row-Level Security (RLS) + Dedicated Schema';
    tenantQuotaUtilizationPct: number;
  };
}

export interface GCWState {
  activeGoal: string;
  workingMemory: GCWWorkingChunk[];
  scratchpad: string[];
  actionLogs: { timestamp: string; action: string; result: string }[];
  currentPhase: 'Perception' | 'Deliberate Planning' | 'Action Execution' | 'Reflection';
  metaCognitive: MetaCognitiveState;
  longTermMemory: {
    episodic: EpisodicMemory[];
    semantic: SemanticTriple[];
    procedural: ProceduralSkill[];
  };
  sensoryStream: SensoryEvent[];
  htnMethods: HTNMethod[];
  counterfactuals: CounterfactualSimulation[];
  sensePlanActCycles: SensePlanActReflectCycle[];
  dispatcherLogs: ActionDispatcherLog[];
  cofounderWalkthrough: StartupCofounderWalkthroughState;
  governance: CrossCuttingGovernance;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'approver' | 'researcher' | 'user';
  tenantId: string;
  createdAt: string;
}

export interface UserSession {
  token: string;
  user: User;
  expiresAt: string;
}

export type MemoryChunk = GCWWorkingChunk;

export * from './labBrowserProjectTypes';
export * from './dashboardEssayTypes';
export * from './sideHustleIncubatorTypes';

