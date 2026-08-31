// Types for Module 8 (Startup Growth) & Module 9 (Knowledge Workspace)

export interface LandingPageSection {
  id: string;
  type: 'hero' | 'problem_solution' | 'features' | 'social_proof' | 'pricing' | 'waitlist_cta';
  headline: string;
  subheadline?: string;
  bodyCopy: string;
  bullets?: string[];
  ctaLabel?: string;
  badge?: string;
}

export interface DesignTheme {
  id: string;
  name: string;
  domain: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBgColor: string;
  textColor: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
  radius: string;
}

export interface GeneratedLandingPage {
  id: string;
  productName: string;
  tagline: string;
  nicheDomain: string;
  targetAudience: string;
  sections: LandingPageSection[];
  theme: DesignTheme;
  codeSnippetNextJs: string;
  createdAt: string;
  deployedUrl?: string;
}

export interface PitchDeckSlide {
  id: string;
  slideNumber: number;
  type: 'title' | 'problem' | 'solution' | 'market_size' | 'product_traction' | 'business_model' | 'competition' | 'go_to_market' | 'team' | 'financials_ask';
  title: string;
  keyMetricOrHighlight?: string;
  bulletPoints: string[];
  narrativeScript: string;
  chartData?: {
    chartType: 'tam_sam_som' | 'revenue_growth' | 'feature_matrix' | 'unit_economics';
    labels: string[];
    datasets: { label: string; data: number[]; color?: string }[];
    summary: string;
  };
  visualPrompt: string;
}

export interface PitchDeck {
  id: string;
  startupName: string;
  targetAudience: 'VC / Series A' | 'Angel Investor / Pre-Seed' | 'Y Combinator / Accelerator Application';
  oneSentencePitch: string;
  problemStatement: string;
  solutionSummary: string;
  tamUsdBillions: number;
  samUsdBillions: number;
  somUsdMillions: number;
  askAmountUsd: number;
  slides: PitchDeckSlide[];
  generatedAt: string;
}

export interface ApiEndpointDoc {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary: string;
  description: string;
  requestBodySchema?: string;
  responseExample: string;
  authRequired: boolean;
  rateLimit: string;
}

export interface ProductDocArticle {
  id: string;
  title: string;
  category: 'getting_started' | 'architecture' | 'api_reference' | 'user_guides' | 'blog_announcements';
  readTimeMinutes: number;
  markdownContent: string;
  tags: string[];
  screenshotPrompt?: string;
}

export interface GoToMarketChannelStrategy {
  channelName: string;
  category: 'Organic / Dev Community' | 'Direct Outbound' | 'Paid Performance' | 'Strategic Partnerships';
  cacEstimateUsd: number;
  expectedConversionRate: number; // percentage
  tactics: string[];
  timelineWeek: string;
}

export interface GoToMarketPlan {
  id: string;
  startupName: string;
  pricingStrategy: {
    model: 'Freemium + Usage-Based' | 'Tiered Subscription B2B' | 'Enterprise Custom';
    tiers: { name: string; price: string; features: string[]; targetCohort: string }[];
  };
  launchPhases: {
    phase: string;
    timeline: string;
    milestones: string[];
    kpiTarget: string;
  }[];
  distributionChannels: GoToMarketChannelStrategy[];
  launchDayChecklist: string[];
}

// Module 9: Knowledge Workspace Enhanced Graph Types
export type KnowledgeNodeType =
  | 'Project'
  | 'Research'
  | 'Competition'
  | 'Application'
  | 'Document'
  | 'Email'
  | 'Contact'
  | 'File'
  | 'Deadline'
  | 'Task'
  | 'Note';

export type KnowledgeRelationType =
  | 'child_of'
  | 'references'
  | 'supports'
  | 'blocks'
  | 'mentions'
  | 'created_by'
  | 'funded_by'
  | 'depends_on';

export interface EnhancedKnowledgeNode {
  id: string;
  label: string;
  type: KnowledgeNodeType;
  description: string;
  tags: string[];
  metadata: {
    status?: string;
    dueDate?: string;
    priority?: 'high' | 'medium' | 'low';
    url?: string;
    owner?: string;
    confidenceScore?: number;
    embeddingVectorDim?: number; // 768 or 1536 dim simulation
    [key: string]: any;
  };
  x?: number;
  y?: number;
}

export interface EnhancedKnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relation: KnowledgeRelationType;
  weight: number; // 0.0 - 1.0 for link strength
  suggested?: boolean; // If auto-linked via pgvector cosine similarity
  similarityScore?: number;
  rationale?: string;
}

export interface SuggestedLinkProposal {
  id: string;
  sourceNodeId: string;
  sourceNodeLabel: string;
  targetNodeId: string;
  targetNodeLabel: string;
  suggestedRelation: KnowledgeRelationType;
  cosineSimilarity: number; // e.g. 0.88
  nlpExplanation: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ImpactAnalysisResult {
  targetNodeId: string;
  targetNodeLabel: string;
  actionSimulated: 'postpone_deadline' | 'delete_node' | 'change_scope' | 'block_dependency';
  affectedDownstreamNodes: {
    nodeId: string;
    nodeLabel: string;
    nodeType: KnowledgeNodeType;
    impactSeverity: 'critical' | 'high' | 'moderate' | 'low';
    rippleExplanation: string;
  }[];
  overallRiskScore: number; // 0-100
  mitigationRecommendation: string;
}
