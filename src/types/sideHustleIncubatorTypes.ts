// Module 18 (Side Hustle Scraper) & Module 19 (Idea Incubator) & Module 20 (General Cognitive Worker) Type Definitions

export type ScraperPlatform = 'Pinterest' | 'Instagram Reels' | 'YouTube Transcripts' | 'TikTok' | 'Web Forums';

export interface ScrapedRawItem {
  id: string;
  platform: ScraperPlatform;
  title: string;
  creatorOrChannel: string;
  rawText: string;
  cleanedText: string;
  sourceUrl: string;
  viewCount: number;
  engagementScore: number;
  extractedKeywords: string[];
  scamScore: number; // 0-100 (high = scam, low = legit)
  scamHeuristics: {
    unrealisticPromises: boolean;
    upfrontFeeRequired: boolean;
    pyramidRecruitment: boolean;
    lackOfClearProduct: boolean;
  };
  classificationStatus: 'legitimate' | 'scam_filtered' | 'pending_llm_review';
  scrapedAt: string;
}

export interface BlueprintStep {
  stepNumber: number;
  title: string;
  description: string;
  estimatedHours: number;
  requiredSkills: string[];
  toolsUsed: string[];
  actionType: 'setup' | 'creation' | 'marketing' | 'operations' | 'scaling';
}

export interface SideHustleBlueprintFull {
  id: string;
  title: string;
  category: 'E-commerce' | 'Content Creation' | 'Freelancing' | 'Digital Products' | 'Local Services' | 'Micro-SaaS' | 'AI Services';
  summary: string;
  tools: {
    name: string;
    category: 'Software' | 'Platform' | 'Hardware' | 'Service';
    costPerMonthUsd: number;
    url?: string;
  }[];
  complexityRating: number; // 1-10
  timeToFirstDollarDays: number; // estimated days
  automationLevelPercentage: number; // 0-100
  initialCapitalRequiredUsd: number;
  targetAudience: string;
  sourceUrls: string[];
  steps: BlueprintStep[];
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  scamLikelihoodScore: number; // 0-100
  trendVelocity: 'Explosive' | 'Rising' | 'Stable' | 'Declining';
  estimatedMonthlyEarningsMinUsd: number;
  estimatedMonthlyEarningsMaxUsd: number;
  profitabilityPotential: string;
  createdAt: string;
}

export interface BlueprintFeasibilityReport {
  blueprintId: string;
  blueprintTitle: string;
  viabilityScore: number; // 0-100
  recommendation: 'GO' | 'CONDITIONAL_GO' | 'NO_GO';
  recommendationRationale: string;
  scoreBreakdown: {
    marketSaturationScore: number; // based on Google Trends
    barrierToEntryScore: number; // based on complexity & capital
    profitabilityScore: number; // estimated margins
    personalFitScore: number; // user skill match
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  googleTrendsData: {
    keyword: string;
    trendScore: number; // 0-100
    searchVolume30dGrowth: number; // percentage
    history: { date: string; value: number }[];
  };
  competitors: {
    name: string;
    marketShareEstimate: string;
    strengths: string;
    weaknesses: string;
  }[];
  differentiationStrategies: string[];
  estimatedBreakEvenMonths: number;
}

export interface TrendForecastItem {
  id: string;
  keyword: string;
  category: string;
  velocityScore: number; // 0-100
  mentionsLast7Days: number;
  growthPercentage: number;
  googleTrendsIndex: number;
  status: 'Emerging Hot Opportunity' | 'High Growth' | 'Maturing' | 'Saturated';
  sampleBlueprintIdeas: string[];
  flaggedAsPriority: boolean;
}

// Module 19: Idea Incubator Types

export type VentureDomain = 'SaaS' | 'Consumer Product' | 'Social Impact' | 'Hardware' | 'Micro-Service' | 'AI Automation' | 'Marketplace';

export interface LeanCanvasModel {
  problem: string[];
  customerSegments: string[];
  uniqueValueProposition: string;
  solution: string[];
  channels: string[];
  revenueStreams: string[];
  costStructure: string[];
  keyMetrics: string[];
  unfairAdvantage: string;
}

export interface MarketLandscapeAnalysis {
  competitorMatrix: {
    name: string;
    valuationOrFunding: string;
    keyFeatures: string[];
    vulnerability: string;
    pricingModel: string;
  }[];
  marketSizeEstimates: {
    tamUsdBillions: number;
    samUsdMillions: number;
    somUsdMillions: number;
    methodology: string;
  };
  onlineSentiment: {
    positiveMentionsPct: number;
    negativeComplaintsPct: number;
    commonCustomerPainPoints: string[];
  };
  earlyAdopterPersonas: {
    role: string;
    archetype: string;
    urgencyLevel: 'High' | 'Medium' | 'Low';
    whereToFindThem: string;
  }[];
  regulatoryConsiderations: string[];
}

export interface PrototypeMockupVariant {
  id: string;
  targetPersona: string;
  themeName: string;
  layoutDescription: string;
  heuristicScore: number; // 0-100
  featuresHighlighted: string[];
  previewUiElements: {
    type: 'header' | 'hero_cta' | 'dashboard_widget' | 'card_list' | 'input_form' | 'pricing_table';
    title: string;
    subtitle?: string;
    content: string;
  }[];
}

export interface FullStackPrototypeCode {
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
  };
  technicalSpecification: string;
  frontendCode: string;
  backendCode: string;
  databaseSchemaSql: string;
  testSuite: {
    name: string;
    passed: boolean;
    durationMs: number;
    logs: string;
  }[];
  selfHealingLogs: {
    attempt: number;
    detectedBug: string;
    fixedSnippet: string;
    resolved: boolean;
  }[];
  sandboxUrl: string;
  status: 'generating' | 'testing' | 'self_healed' | 'ready_for_preview';
}

export interface SimulatedPersonaFeedback {
  personaId: string;
  personaName: string;
  role: string;
  overallImpression: 'Enthusiastic' | 'Cautious' | 'Skeptical' | 'Passionate Adopter';
  usabilityRating: number; // 1-5
  valuePropClarityRating: number; // 1-5
  willingnessToPayUsdPerMonth: number;
  verbatimQuote: string;
  suggestedFeatureOrPivot: string;
}

export interface ViabilityPackage {
  id: string;
  ventureName: string;
  domain: VentureDomain;
  executiveSummary: string;
  overallViabilityScore: number; // 0-100
  recommendation: 'GO' | 'PIVOT' | 'NO_GO';
  projectedRoiPercentage18Months: number;
  breakEvenTimelineMonths: number;
  financialProjections: {
    month: number;
    projectedUsers: number;
    mrrUsd: number;
    operationalCostsUsd: number;
    netProfitUsd: number;
  }[];
  keyMilestones: string[];
  pdfDownloadUrl?: string;
  generatedAt: string;
}

export interface IncubatorVenture {
  id: string;
  rawInput: string;
  inputMode: 'text' | 'voice_memo';
  domain: VentureDomain;
  stage: 'intake' | 'canvas_refinement' | 'concurrent_rnd' | 'user_validation' | 'viability_ready';
  leanCanvas: LeanCanvasModel;
  marketResearch?: MarketLandscapeAnalysis;
  uiMockups?: PrototypeMockupVariant[];
  fullStackPrototype?: FullStackPrototypeCode;
  personaValidation?: SimulatedPersonaFeedback[];
  viabilityPackage?: ViabilityPackage;
  createdAt: string;
  updatedAt: string;
}
