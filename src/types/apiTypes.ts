export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'approver' | 'user';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface GCWProjectPlanNode {
  id: string;
  title: string;
  type: 'goal' | 'subtask' | 'tool_call' | 'approval_gate' | 'verification';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed';
  assigned_module?: string;
  estimated_cost_usd?: number;
  dependencies?: string[];
  children?: GCWProjectPlanNode[];
  output_summary?: string;
}

export interface GCWProject {
  id: string;
  user_id: string;
  goal: string;
  status: 'planning' | 'executing' | 'completed' | 'failed' | 'waiting_approval';
  current_phase: 'Perception' | 'Deliberate Planning' | 'Action Execution' | 'Reflection' | 'Completed';
  plan_tree: {
    root_goal: string;
    nodes: GCWProjectPlanNode[];
  };
  created_at: string;
  updated_at?: string;
}

export interface FastApiApproval {
  id: string;
  user_id: string;
  module: string;
  action_type: string;
  payload_summary: string;
  payload?: Record<string, any>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_time: string;
  status: 'pending' | 'approved' | 'denied';
  decision_by?: string;
  decision_time?: string;
}

export interface FastApiOpportunity {
  id: string;
  title: string;
  source: string;
  match_score: number;
  deadline: string;
  url: string;
  status: 'new' | 'reviewed' | 'applied' | 'archived';
  description?: string;
  funding_amount?: string;
}

export interface WinnerIntelligenceItem {
  year: string;
  project_title: string;
  team_name: string;
  prize: string;
  winning_factors: string[];
  submission_breakdown: string;
  github_repo?: string;
  tech_stack: string[];
  key_differentiator: string;
}

export interface RubricCriterionItem {
  id: string;
  criterion: string;
  weight_percentage: number;
  description: string;
  scoring_levels: {
    poor: string;
    good: string;
    exceptional: string;
  };
  our_current_score?: number;
  gap_analysis?: string;
}

export interface CriticalAnalysisAudit {
  overall_score: number; // 0-100
  confidence_rating: string;
  strengths: string[];
  vulnerabilities: string[];
  blindspots: string[];
  competitive_threat_analysis: string;
  feasibility_risk: 'low' | 'medium' | 'high';
  verdict: string;
}

export interface ActionableImprovement {
  id: string;
  priority: 'critical' | 'high' | 'medium';
  title: string;
  impact_on_score: string;
  current_state: string;
  recommended_upgrade: string;
  implementation_pseudocode_or_diff: string;
  applied: boolean;
}

export interface FollowUpCommunicationPlan {
  id: string;
  stage: 'post_submission_inquiry' | 'judge_qna_prep' | 'organizer_clarification' | 'winner_mentorship_request' | 'sponsor_networking';
  target_recipient: string;
  subject_line: string;
  body_content: string;
  tactical_notes: string;
  status: 'drafted' | 'ready_to_send' | 'sent';
  created_at: string;
}

export interface FastApiCompetition {
  id: string;
  title: string;
  organizer?: string;
  prize_pool?: string;
  status: 'discovered' | 'preparing' | 'submitted' | 'won';
  url?: string;
  rules?: {
    eligibility?: string[];
    materials?: string[];
    deadlines?: string[];
  };
  checklist_items?: {
    id: string;
    title: string;
    completed: boolean;
    effort_hours?: number;
    assigned_agent?: string;
    is_critical_path?: boolean;
  }[];
  drafted_materials?: Record<string, string>;
  // Advanced Winning & Intelligence Modules
  previous_winners_analysis?: WinnerIntelligenceItem[];
  ideas_and_differentiators?: {
    id: string;
    title: string;
    novelty_summary: string;
    uniqueness_index: number; // 1-10
    execution_complexity: 'Low' | 'Medium' | 'High' | 'Extreme';
    recommended_angle: string;
  }[];
  rubric_criteria?: RubricCriterionItem[];
  critical_analysis?: CriticalAnalysisAudit;
  actionable_improvements?: ActionableImprovement[];
  follow_up_communications?: FollowUpCommunicationPlan[];
}

export interface FastApiGrant {
  id: string;
  title: string;
  agency?: string;
  status: 'discovered' | 'drafting' | 'review' | 'submitted';
  deadline?: string;
  draft_sections?: Record<string, string>;
  budget?: {
    requested: number;
    directCosts: number;
    indirectCosts: number;
    currency: string;
  };
  background_research?: string;
}

export interface FastApiResearchPaper {
  id: string;
  title: string;
  abstract: string;
  url: string;
  authors?: string[];
  published_date?: string;
  relevance_score?: number;
}

export interface FastApiHypothesis {
  id: string;
  topic: string;
  hypothesis: string;
  status: 'formulated' | 'testing' | 'validated' | 'refuted';
  rationale?: string;
  independent_variable?: string;
  dependent_variable?: string;
  proposed_experiment?: string;
  confidence_score?: number;
  created_at?: string;
}

export interface FastApiContact {
  id: string;
  name: string;
  email: string;
  title: string;
  affiliation: string;
  enriched_data?: {
    h_index?: number;
    recent_papers?: string[];
    linkedin?: string;
    research_topics?: string[];
  };
}

export interface FastApiCampaign {
  id: string;
  name: string;
  target_audience?: string;
  status: 'draft' | 'active' | 'completed';
  email_threads?: {
    id: string;
    recipient_name: string;
    recipient_email: string;
    subject: string;
    status: 'drafted' | 'sent' | 'opened' | 'replied';
    last_message_at: string;
  }[];
}

export interface FastApiCalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: 'task' | 'deadline' | 'meeting' | 'deep_work';
  priority?: 'low' | 'medium' | 'high';
  module_link?: string;
}

export interface FastApiCalendarSchedule {
  week_start: string;
  total_deep_work_hours: number;
  total_meetings_hours: number;
  events: FastApiCalendarEvent[];
  optimization_score: number;
  recommendations: string[];
}

export interface FastApiKnowledgeGraphNode {
  id: string;
  label: string;
  type: 'concept' | 'paper' | 'grant' | 'contact' | 'opportunity' | 'entity';
  properties?: Record<string, any>;
}

export interface FastApiKnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export interface FastApiKnowledgeGraph {
  nodes: FastApiKnowledgeGraphNode[];
  edges: FastApiKnowledgeGraphEdge[];
}

export interface FastApiSocialPost {
  id: string;
  content: string;
  scheduled_time: string;
  platform: 'twitter' | 'linkedin' | 'threads' | 'youtube';
  status: 'draft' | 'scheduled' | 'published';
  tags?: string[];
  engagement_estimate?: number;
}

export interface FastApiLandingPage {
  id: string;
  title: string;
  slug: string;
  headline: string;
  subheadline: string;
  html_preview: string;
  created_at: string;
  conversion_features?: string[];
}

export interface FastApiPitchDeck {
  id: string;
  title: string;
  tagline: string;
  target_market_tam: string;
  slides_outline: {
    slide_number: number;
    title: string;
    key_points: string[];
  }[];
  created_at: string;
}

export interface FastApiModelRouterConfig {
  available_models: {
    id: string;
    name: string;
    provider: string;
    cost_per_1k_tokens: number;
    latency_ms: number;
    capabilities: string[];
  }[];
  routing_rules: {
    task_type: string;
    preferred_model: string;
    fallback_model: string;
    max_cost_threshold?: number;
  }[];
}

// ============================================================================
// MOD 0: PRE-FLIGHT APPLICATION DOSSIER & GOOGLE DOCS AUTO-FILLER TYPES
// ============================================================================
export interface ApplicationDossierSection {
  id: string;
  title: string;
  field_key: string;
  content: string;
  char_count: number;
  max_char_limit?: number;
  source_doc_origin: string;
  confidence_score: number;
  nature_adaptation_note: string;
}

export interface ApplicationDossier {
  id: string;
  approval_id?: string;
  opportunity_id: string;
  opportunity_title: string;
  opportunity_type: 'nsf_grant' | 'darpa_grant' | 'cvpr_kaggle' | 'hackathon' | 'startup_pitch' | 'fellowship' | 'creative_grant';
  target_agency: string;
  submission_deadline: string;
  nature_analysis: {
    competition_tone: string;
    key_evaluation_criteria: string[];
    doc_selection_rationale: string;
    selected_google_docs: {
      doc_name: string;
      doc_id: string;
      extracted_focus: string;
      relevance_weight: number;
    }[];
  };
  applicant_profile: {
    full_name: string;
    affiliation: string;
    email: string;
    biography: string;
    selected_publications: string[];
    relevant_awards: string[];
    github_or_portfolio: string;
  };
  sections: ApplicationDossierSection[];
  budget_table: {
    item: string;
    category: 'personnel' | 'equipment' | 'compute' | 'travel' | 'indirect';
    amount_usd: number;
    justification: string;
  }[];
  compliance_checklist: {
    rule: string;
    satisfied: boolean;
    verification_note: string;
  }[];
  status: 'draft' | 'pending_approval' | 'authorized' | 'submitted' | 'rejected';
  created_at: string;
  last_modified: string;
}

// ============================================================================
// MOD 1: MULTI-CHANNEL OPPORTUNITY SURVEILLANCE & DEPLOYMENT DISPATCHER TYPES
// ============================================================================
export interface MultiChannelWinnerIntelligence {
  winner_names: string[];
  winning_project_titles: string[];
  key_tactics: string[];
  youtube_breakdown_urls: { title: string; url: string; takeaway: string }[];
  drafted_outreach_template: string;
  post_mortem_notes: string;
}

export interface MultiChannelOpportunity extends FastApiOpportunity {
  source_channel:
    | 'instagram_search'
    | 'pinterest_board'
    | 'linkedin_research'
    | 'email_newsletter'
    | 'snowday_portal'
    | 'youth_opportunities'
    | 'grants_gov'
    | 'kaggle_devpost'
    | 'darpa_rfp';
  creator_or_channel_name: string;
  content_category: 'competition' | 'award' | 'non_profit_initiative' | 'grant' | 'entrepreneurship_advice' | 'cs_project' | 'whimsical_creativity' | 'biomimetic_research';
  signal_quality_score: number; // 0-100
  brainrot_filtered: boolean;
  raw_post_excerpt?: string;
  extracted_actionable_ideas: string[];
  actionable_winning_advice: string[];
  winner_intelligence?: MultiChannelWinnerIntelligence;
  deployable_tools: ('strawberry_browser' | 'replit' | 'n8n' | 'codex' | 'deepseek' | 'github_vercel' | 'figma')[];
  deployment_status?: {
    tool: string;
    status: 'idle' | 'drafting' | 'sandboxed' | 'deployed';
    link?: string;
  }[];
}

// ============================================================================
// RESEARCH SCIENTIST: BIOMIMETIC NATURE INSPIRATION & END-TO-END PROJECTS
// ============================================================================
export interface BiomimicryResearchProject {
  id: string;
  organism_name: string;
  biological_kingdom: string;
  natural_phenomenon: string;
  inquiry_question: string;
  computational_translation: string;
  mathematical_formulation: string;
  pytorch_simulation_code: string;
  experimental_results_summary: string;
  latex_preprint_abstract: string;
  verification_benchmarks: string[];
  status: 'observation' | 'hypothesis' | 'mathematical_model' | 'simulated' | 'preprint_ready';
  created_at: string;
}

// ============================================================================
// SIDE HUSTLE & AUTONOMOUS VENTURE EXECUTION (DEEPSEEK + GEMINI AI STUDIO)
// ============================================================================
export interface SideHustleAutonomousExecution {
  id: string;
  title: string;
  tagline: string;
  category: 'biomimicry_saas' | 'grant_automation' | 'campus_escrow' | 'generative_shaders';
  uniqueness_score: number; // 0-100
  deepseek_backend_architecture: {
    framework: string;
    core_routes: { endpoint: string; method: string; description: string }[];
    python_backend_code: string;
    gemini_ai_studio_scaffolding: string;
  };
  monetization_model: string;
  pricing_tiers: { tier: string; price: string; features: string[] }[];
  target_mrr: string;
  live_status: 'blueprint' | 'code_generated' | 'testing' | 'deployed';
  created_at: string;
}

// ============================================================================
// MULTI-AI ENSEMBLE COGNITIVE CO-REASONING
// ============================================================================
export interface MultiAiEnsembleDeliberation {
  id: string;
  inquiry_topic: string;
  context: string;
  models_deliberating: {
    model_name: 'ChatGPT (GPT-4o/o1)' | 'DeepSeek (R1/V3)' | 'Claude (3.5 Sonnet)' | 'Grok (2)' | 'Perplexity (Sonar)' | 'Gemini (3.5 Pro)';
    perspective: string;
    confidence_score: number;
    critique_of_peers: string;
    key_proposal: string;
  }[];
  socratic_questions: string[];
  consensus_synthesis: string;
  unanimous_recommendation: string;
  created_at: string;
}

// Aliases for convenience
export type WinnerIntelligence = MultiChannelWinnerIntelligence;

export interface MultiAiDeliberationSession {
  id: string;
  inquiry_prompt: string;
  deliberation_mode: string;
  ensemble_models: string[];
  consensus_synthesis: {
    unified_solution: string;
    confidence_score: number;
    agreement_level: string;
    actionable_steps: string[];
  };
  model_responses: {
    model_name: string;
    provider: string;
    perspective_summary: string;
    critique?: string;
  }[];
  created_at: string;
}


export type SSEEventType =
  | 'new_approval'
  | 'approval_decided'
  | 'high_match_opportunity'
  | 'gcw_question'
  | 'heartbeat'
  | 'project_updated'
  | 'multi_channel_ingested'
  | 'biomimicry_simulated';

export interface SSEMessage {
  event: SSEEventType;
  data: any;
  timestamp: string;
}
