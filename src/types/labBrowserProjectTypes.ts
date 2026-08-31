// Module 12: AI Research Lab, Module 13: Browser Agent, Module 14: Project Builder Types

// ==========================================
// MODULE 12: AI RESEARCH LAB TYPES
// ==========================================

export type RoutingTaskType =
  | 'creative_writing'
  | 'code_generation'
  | 'factual_research'
  | 'summarisation'
  | 'translation'
  | 'sentiment_analysis'
  | 'multimodal_vision'
  | 'complex_reasoning';

export interface ModelRegistryItem {
  id: string;
  name: string;
  provider: 'Anthropic' | 'Google' | 'OpenAI' | 'Meta' | 'Mistral' | 'DeepSeek';
  tier: 'Flagship' | 'Reasoning' | 'Efficiency' | 'Local / Edge';
  capabilities: RoutingTaskType[];
  costPer1kInputTokens: number; // in USD
  costPer1kOutputTokens: number; // in USD
  avgLatencyMs: number;
  currentLoadPct: number; // 0-100%
  accuracyScore: number; // 0-100
  bleuScore: number; // 0-100
  userSatisfactionRating: number; // 1-10
  contextWindowTokens: number;
  isOnline: boolean;
  fallbackModelId: string;
  endpointUrl: string;
  description: string;
}

export interface ModelCandidateScore {
  modelId: string;
  modelName: string;
  provider: string;
  compositeScore: number; // 0-100
  performanceSubScore: number; // 0-40
  costEfficiencySubScore: number; // 0-30
  latencySubScore: number; // 0-20
  loadPenalty: number; // deduction
  rank: number;
  isEligible: boolean;
  exclusionReason?: string;
}

export interface ModelRoutingRequest {
  id: string;
  taskType: RoutingTaskType;
  promptSnippet: string;
  requiredOutputTokens: number;
  desiredQualityLevel: number; // 1-10
  maxAcceptableCostUsd: number;
  maxAllowableLatencyMs: number;
  enforcePrivacyLocalOnly?: boolean;
}

export interface ModelRoutingDecision {
  requestId: string;
  timestamp: string;
  selectedModel: ModelRegistryItem;
  fallbackChain: string[]; // e.g. ["gemini-3.1-pro-preview", "claude-3-5-sonnet", "llama-3-1-70b"]
  candidateScores: ModelCandidateScore[];
  decisionRationale: string;
  decisionTreePath: string[];
  rlRewardScore?: number;
  executionOutcome?: {
    success: boolean;
    actualLatencyMs: number;
    tokensPrompt: number;
    tokensCompletion: number;
    costUsd: number;
    outputPreview: string;
    usedFallback: boolean;
  };
}

export interface DagWorkflowNode {
  id: string;
  label: string;
  modelId: string;
  role: string; // e.g. 'Factual Researcher', 'Chief Drafter', 'Adversarial Critic', 'Proofreader'
  promptTemplate: string;
  inputDependencies: string[]; // node IDs
  params: {
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  status: 'idle' | 'running' | 'completed' | 'failed' | 'skipped';
  output?: string;
  executionTimeMs?: number;
  tokenCount?: number;
  costUsd?: number;
}

export interface DagWorkflowEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  dataTransform?: 'raw_text' | 'extract_bullets' | 'critique_scoring' | 'concatenation';
}

export interface DagWorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: 'Article Synthesis' | 'Code System Architecture' | 'Grant Peer Review' | 'Market Intelligence';
  yamlConfig: string;
  nodes: DagWorkflowNode[];
  edges: DagWorkflowEdge[];
  mergeStrategy: 'recursive_consensus' | 'best_score' | 'concatenation' | 'critic_revision';
  isEnsemble: boolean;
}

export interface DagWorkflowExecution {
  runId: string;
  workflowId: string;
  workflowName: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  totalTokens: number;
  totalCostUsd: number;
  totalDurationMs: number;
  nodeOutputs: Record<string, string>;
  finalConsensusOutput?: string;
  activeNodeId?: string;
  consensusBreakdown?: {
    candidateWeights: { model: string; weight: number; agreementPct: number }[];
    synthesisMethod: string;
  };
}

export interface CostBudgetEntity {
  id: string;
  entityType: 'module' | 'user';
  name: string;
  allocatedBudgetUsd: number;
  currentSpentUsd: number;
  usagePct: number;
  autoDowngradeThresholdPct: number; // e.g. 85%
  alertThresholdPct: number; // e.g. 90%
  status: 'optimal' | 'warning' | 'budget_exceeded' | 'downgraded';
  dailyHistory: { date: string; costUsd: number; tokenCount: number }[];
}

export interface ModelTelemetry {
  modelId: string;
  modelName: string;
  totalCalls: number;
  errorRatePct: number;
  latencyP50Ms: number;
  latencyP99Ms: number;
  avgBleuScore: number;
  avgRougeScore: number;
  humanSatisfactionPct: number;
  activeDegradationAlert: boolean;
  lastDegradationIncident?: string;
}

export interface VectorCacheItem {
  id: string;
  querySnippet: string;
  embeddingCosineSim: number;
  modelId: string;
  cachedResponseSnippet: string;
  hitCount: number;
  tokensSaved: number;
  costSavedUsd: number;
  lastHitAt: string;
}

// ==========================================
// MODULE 13: BROWSER AGENT TYPES
// ==========================================

export interface BrowserSessionInstance {
  instanceId: string;
  status: 'idle' | 'navigating' | 'interacting' | 'waiting_approval' | 'recycled';
  currentUrl: string;
  activeCookiesCount: number;
  userAgentProfile: string;
  proxyRegion: 'US-East (Stealth Residential)' | 'US-West (Datacenter)' | 'EU-Central (Stealth)' | 'Direct';
  memoryUsageMb: number;
  uptimeSeconds: number;
  isHeadless: boolean;
  stealthPatchesActive: boolean;
}

export type BrowserActionType =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'select_dropdown'
  | 'upload_file'
  | 'scroll'
  | 'wait_mutation'
  | 'vlm_reasoning'
  | 'solve_captcha_fallback';

export interface BrowserNavigationStep {
  stepNumber: number;
  timestamp: string;
  actionType: BrowserActionType;
  targetSelector?: string;
  targetDescription: string;
  vlmRationale?: string;
  screenshotUrl?: string;
  domTreeSummary?: string;
  executionStatus: 'success' | 'failed' | 'retrying' | 'waiting_user_input';
  latencyMs: number;
}

export interface BrowserAutonomousSession {
  sessionId: string;
  goalPrompt: string;
  targetUrl: string;
  status: 'idle' | 'in_progress' | 'paused_for_approval' | 'completed' | 'failed';
  currentStepIndex: number;
  maxSteps: number;
  steps: BrowserNavigationStep[];
  liveDomSummary: string;
  currentScreenshotUrl: string;
  captchaDetected: boolean;
  extractedResults?: Record<string, any>;
  harLogAvailable: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface FormDetectedField {
  fieldId: string;
  label: string;
  inferredType: 'text' | 'email' | 'url' | 'tel' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'file_upload';
  matchedPayloadKey: string;
  fuzzyConfidencePct: number; // e.g. 98%
  proposedValue: string;
  isConditional: boolean;
  dependsOn?: { parentFieldId: string; conditionValue: string };
  isFilled: boolean;
}

export interface FormAutoFillMapping {
  formId: string;
  formTitle: string;
  targetUrl: string;
  detectedFields: FormDetectedField[];
  unmappedFieldsCount: number;
  totalFieldsCount: number;
}

export interface InterceptedFormSubmission {
  submissionId: string;
  formName: string;
  targetActionUrl: string;
  filledPayload: Record<string, string>;
  finalScreenshotUrl: string;
  requiresUserApproval: boolean;
  approvalRequestId?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'submitted';
  confirmationNumber?: string;
  submittedAt?: string;
}

export interface WebScrapingJob {
  jobId: string;
  targetUrl: string;
  title: string;
  extractionSchema: { field: string; selectorOrVlmRule: string }[];
  scrapedItems: Record<string, any>[];
  totalRecordsExtracted: number;
  status: 'ready' | 'running' | 'completed' | 'error';
  exportedJsonPreview: string;
  lastScrapedAt: string;
}

// ==========================================
// MODULE 14: PROJECT BUILDER TYPES
// ==========================================

export type ProjectLifecycleStatus =
  | 'planning'
  | 'wbs_review'
  | 'executing'
  | 'milestone_review'
  | 'final_deliverable_ready'
  | 'completed';

export interface ProjectScope {
  id: string;
  title: string;
  category: 'research_program' | 'business_plan' | 'technical_system' | 'creative_production';
  highLevelGoal: string;
  status: ProjectLifecycleStatus;
  overallProgressPct: number;
  createdAt: string;
  targetCompletionDate: string;
  totalEstimatedDays: number;
  activeMilestoneIndex: number;
  milestonesCount: number;
  tasksCount: number;
}

export interface WbsNode {
  id: string;
  projectId: string;
  milestoneTitle: string;
  milestoneIndex: number;
  title: string;
  description: string;
  taskType:
    | 'literature_review'
    | 'data_analysis_code'
    | 'document_drafting'
    | 'web_research'
    | 'system_integration'
    | 'peer_review';
  assignedAgent:
    | 'research_scientist'
    | 'ai_research_lab'
    | 'document_generator'
    | 'browser_agent'
    | 'planner';
  estimatedDurationDays: number;
  actualDurationHours?: number;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  dependencies: string[];
  intermediateArtifacts: {
    id: string;
    type: 'paper_summary' | 'python_chart' | 'draft_section' | 'dataset_json' | 'pdf_report';
    title: string;
    summary: string;
    contentPreview?: string;
    generatedAt: string;
  }[];
}

export interface SandboxedCodeExecution {
  taskId: string;
  taskTitle: string;
  pythonCode: string;
  dockerContainerId: string;
  status: 'success' | 'running' | 'failed';
  stdout: string;
  stderr?: string;
  executionDurationSec: number;
  generatedPlotTitle: string;
  chartPlotBase64OrUrl?: string;
  numericKeyFindings: { metric: string; value: string; significance: string }[];
}

export interface MilestoneFeedbackReview {
  milestoneId: string;
  milestoneTitle: string;
  milestoneIndex: number;
  status: 'waiting_feedback' | 'feedback_applied' | 'approved';
  summaryOfWorkDone: string;
  sampleArtifactPreview: string;
  aiClarificationQuestion: string;
  userNaturalLanguageFeedback?: string;
  aiRevisedCourseOfAction?: string;
  subsequentTasksUpdatedCount?: number;
}

export interface GitCommitLog {
  commitHash: string;
  author: string;
  timestamp: string;
  message: string;
  branch: string;
  filesChanged: string[];
  insertions: number;
  deletions: number;
  diffSummary: string;
  remoteSynced: boolean;
  githubRepoUrl: string;
}

export interface FinalProjectDeliverable {
  projectId: string;
  title: string;
  formats: {
    format: 'PDF' | 'DOCX' | 'LaTeX' | 'Markdown';
    fileSizeMb: number;
    downloadFilename: string;
  }[];
  executiveSummary: string;
  tableOfContents: string[];
  compiledFiguresCount: number;
  compiledTablesCount: number;
  compiledCitationsCount: number;
  generatedAt: string;
  isReadyForExport: boolean;
}
