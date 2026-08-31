import {
  AuthResponse,
  AuthUser,
  GCWProject,
  FastApiApproval,
  FastApiOpportunity,
  FastApiCompetition,
  FastApiGrant,
  FastApiResearchPaper,
  FastApiHypothesis,
  FastApiContact,
  FastApiCampaign,
  FastApiCalendarEvent,
  FastApiCalendarSchedule,
  FastApiKnowledgeGraph,
  FastApiSocialPost,
  FastApiLandingPage,
  FastApiPitchDeck,
  FastApiModelRouterConfig,
  ApplicationDossier,
  MultiChannelOpportunity,
  MultiChannelWinnerIntelligence,
  WinnerIntelligence,
  BiomimicryResearchProject,
  SideHustleAutonomousExecution,
  MultiAiEnsembleDeliberation,
  MultiAiDeliberationSession,
} from '../types/apiTypes';

// Configurable API base URL
const envMeta = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const DEFAULT_API_URL =
  (typeof window !== 'undefined' && (window as any).__ATLAS_API_URL__) ||
  envMeta.VITE_API_URL ||
  envMeta.NEXT_PUBLIC_API_URL ||
  '/api/v1';

let currentBaseUrl: string = DEFAULT_API_URL;
let currentToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('atlas_jwt_token') : null;

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('atlas_custom_api_url');
    if (override) return override;
  }
  return currentBaseUrl;
}

export function setApiBaseUrl(url: string) {
  currentBaseUrl = url.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    localStorage.setItem('atlas_custom_api_url', currentBaseUrl);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('atlas_jwt_token') || currentToken;
  }
  return currentToken;
}

export function setAuthToken(token: string | null) {
  currentToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('atlas_jwt_token', token);
    } else {
      localStorage.removeItem('atlas_jwt_token');
    }
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('atlas_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
  }
  return {
    id: 'usr_atlas_lead',
    name: 'Atlas Lead Researcher',
    email: 'lead@atlas-ai.org',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'admin',
  };
}

export function setAuthUser(user: AuthUser | null) {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('atlas_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('atlas_auth_user');
    }
  }
}

/**
 * Generic Fetch Wrapper with Bearer Auth Token
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) errorMessage = errorJson.detail;
        else if (errorJson.error) errorMessage = errorJson.error;
      } catch (e) {
        // use fallback message
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    console.error(`[API Request Error] ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

// ============================================================================
// 1. AUTHENTICATION (Google OAuth)
// ============================================================================

export async function loginWithGoogle(googleIdToken: string): Promise<AuthResponse> {
  const res = await request<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token: googleIdToken }),
  });

  if (res.access_token) {
    setAuthToken(res.access_token);
  }
  if (res.user) {
    setAuthUser(res.user);
  }

  return res;
}

export function logout() {
  setAuthToken(null);
  setAuthUser(null);
}

// ============================================================================
// 2. GENERAL COGNITIVE WORKER (GCW) & PROJECTS
// ============================================================================

export async function createGCWProject(goal: string, userId: string = 'usr_atlas_lead'): Promise<GCWProject> {
  return request<GCWProject>('/gcw/projects', {
    method: 'POST',
    body: JSON.stringify({ goal, user_id: userId }),
  });
}

export async function getGCWProjects(userId: string = 'usr_atlas_lead'): Promise<GCWProject[]> {
  return request<GCWProject[]>(`/gcw/projects?user_id=${encodeURIComponent(userId)}`, {
    method: 'GET',
  });
}

export async function getGCWProjectById(projectId: string): Promise<GCWProject> {
  return request<GCWProject>(`/gcw/projects/${projectId}`, {
    method: 'GET',
  });
}

// ============================================================================
// 3. APPROVAL CENTER
// ============================================================================

export async function getPendingApprovals(userId: string = 'usr_atlas_lead'): Promise<FastApiApproval[]> {
  return request<FastApiApproval[]>(`/approvals/pending?user_id=${encodeURIComponent(userId)}`, {
    method: 'GET',
  });
}

export async function decideApproval(
  approvalId: string,
  approved: boolean,
  approvedBy: string = 'usr_atlas_lead',
  modifications?: Record<string, any>
): Promise<FastApiApproval> {
  return request<FastApiApproval>(`/approvals/${approvalId}`, {
    method: 'PATCH',
    body: JSON.stringify({ approved, approved_by: approvedBy, modifications }),
  });
}

// ============================================================================
// 4. OPPORTUNITY DISCOVERY
// ============================================================================

export async function getOpportunities(
  status: string = 'new',
  minScore: number = 0,
  limit: number = 50
): Promise<FastApiOpportunity[]> {
  return request<FastApiOpportunity[]>(
    `/opportunities?status=${encodeURIComponent(status)}&min_score=${minScore}&limit=${limit}`,
    { method: 'GET' }
  );
}

export async function scanOpportunities(): Promise<{ message: string; opportunities: FastApiOpportunity[] }> {
  return request<{ message: string; opportunities: FastApiOpportunity[] }>('/opportunities/scan', {
    method: 'POST',
  });
}

// ============================================================================
// 5. COMPETITION MANAGER
// ============================================================================

export async function getCompetitions(status: string = 'discovered'): Promise<FastApiCompetition[]> {
  return request<FastApiCompetition[]>(`/competitions?status=${encodeURIComponent(status)}`, {
    method: 'GET',
  });
}

export async function extractCompetitionRules(competitionId: string): Promise<FastApiCompetition> {
  return request<FastApiCompetition>(`/competitions/${competitionId}/extract-rules`, {
    method: 'POST',
  });
}

export async function draftCompetitionMaterial(
  competitionId: string,
  materialName: string
): Promise<FastApiCompetition> {
  return request<FastApiCompetition>(
    `/competitions/${competitionId}/draft/${encodeURIComponent(materialName)}`,
    {
      method: 'POST',
    }
  );
}

export async function getCompetitionWinnersAnalysis(competitionId: string): Promise<{ success: boolean; previous_winners_analysis: any[] }> {
  return request<{ success: boolean; previous_winners_analysis: any[] }>(`/competitions/${competitionId}/winners-analysis`, {
    method: 'GET',
  });
}

export async function getCompetitionIdeas(competitionId: string): Promise<{ success: boolean; ideas_and_differentiators: any[] }> {
  return request<{ success: boolean; ideas_and_differentiators: any[] }>(`/competitions/${competitionId}/ideas`, {
    method: 'GET',
  });
}

export async function getCompetitionRubricAnalysis(competitionId: string): Promise<{ success: boolean; rubric_criteria: any[]; critical_analysis: any }> {
  return request<{ success: boolean; rubric_criteria: any[]; critical_analysis: any }>(`/competitions/${competitionId}/rubric-analysis`, {
    method: 'GET',
  });
}

export async function getCompetitionImprovements(competitionId: string): Promise<{ success: boolean; actionable_improvements: any[] }> {
  return request<{ success: boolean; actionable_improvements: any[] }>(`/competitions/${competitionId}/improvements`, {
    method: 'GET',
  });
}

export async function getCompetitionFollowUps(competitionId: string): Promise<{ success: boolean; follow_up_communications: any[] }> {
  return request<{ success: boolean; follow_up_communications: any[] }>(`/competitions/${competitionId}/follow-ups`, {
    method: 'GET',
  });
}

// ============================================================================
// 6. GRANT WRITER
// ============================================================================

export async function getGrants(): Promise<FastApiGrant[]> {
  return request<FastApiGrant[]>('/grants', { method: 'GET' });
}

export async function researchGrantBackground(grantId: string): Promise<FastApiGrant> {
  return request<FastApiGrant>(`/grants/${grantId}/research-background`, {
    method: 'POST',
  });
}

export async function generateGrantDraft(
  grantId: string,
  sectionTitle: string = 'Project Summary'
): Promise<FastApiGrant> {
  return request<FastApiGrant>(`/grants/${grantId}/generate-draft`, {
    method: 'POST',
    body: JSON.stringify({ section: sectionTitle }),
  });
}

export async function generateGrantBudget(grantId: string): Promise<FastApiGrant> {
  return request<FastApiGrant>(`/grants/${grantId}/generate-budget`, {
    method: 'POST',
  });
}

// ============================================================================
// 7. RESEARCH SCIENTIST
// ============================================================================

export async function getResearchPapers(): Promise<FastApiResearchPaper[]> {
  return request<FastApiResearchPaper[]>('/research/papers', { method: 'GET' });
}

export async function getResearchHypotheses(): Promise<FastApiHypothesis[]> {
  return request<FastApiHypothesis[]>('/research/hypotheses', { method: 'GET' });
}

export async function generateResearchHypothesis(topic: string): Promise<FastApiHypothesis> {
  return request<FastApiHypothesis>('/research/hypothesis', {
    method: 'POST',
    body: JSON.stringify({ topic }),
  });
}

// ============================================================================
// 8. OUTREACH CRM
// ============================================================================

export async function getOutreachContacts(): Promise<FastApiContact[]> {
  return request<FastApiContact[]>('/outreach/contacts', { method: 'GET' });
}

export async function getOutreachCampaigns(): Promise<FastApiCampaign[]> {
  return request<FastApiCampaign[]>('/outreach/campaigns', { method: 'GET' });
}

export async function createOutreachCampaign(
  name: string,
  targetAudience: string = 'Academic Researchers'
): Promise<FastApiCampaign> {
  return request<FastApiCampaign>('/outreach/campaigns', {
    method: 'POST',
    body: JSON.stringify({ name, target_audience: targetAudience }),
  });
}

export async function findOutreachContacts(query: string): Promise<FastApiContact[]> {
  return request<FastApiContact[]>('/outreach/find-contacts', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// ============================================================================
// 9. CALENDAR INTELLIGENCE
// ============================================================================

export async function getCalendarEvents(): Promise<FastApiCalendarEvent[]> {
  return request<FastApiCalendarEvent[]>('/calendar/events', { method: 'GET' });
}

export async function getCalendarSchedule(): Promise<FastApiCalendarSchedule> {
  return request<FastApiCalendarSchedule>('/calendar/schedule', { method: 'GET' });
}

export async function optimizeCalendarSchedule(userId: string = 'usr_atlas_lead'): Promise<FastApiCalendarSchedule> {
  return request<FastApiCalendarSchedule>('/calendar/optimize', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

// ============================================================================
// 10. KNOWLEDGE GRAPH
// ============================================================================

export async function getKnowledgeGraph(nodeType?: string): Promise<FastApiKnowledgeGraph> {
  const query = nodeType ? `?node_type=${encodeURIComponent(nodeType)}` : '';
  return request<FastApiKnowledgeGraph>(`/knowledge/graph${query}`, { method: 'GET' });
}

// ============================================================================
// 11. SOCIAL MEDIA
// ============================================================================

export async function getSocialPosts(): Promise<FastApiSocialPost[]> {
  return request<FastApiSocialPost[]>('/social/posts', { method: 'GET' });
}

export async function generateSocialPost(topic: string, platform: string = 'twitter'): Promise<FastApiSocialPost> {
  return request<FastApiSocialPost>('/social/generate', {
    method: 'POST',
    body: JSON.stringify({ topic, platform }),
  });
}

// ============================================================================
// 12. STARTUP GROWTH
// ============================================================================

export async function getStartupLandingPages(): Promise<FastApiLandingPage[]> {
  return request<FastApiLandingPage[]>('/startup/landing-pages', { method: 'GET' });
}

export async function getStartupPitchDecks(): Promise<FastApiPitchDeck[]> {
  return request<FastApiPitchDeck[]>('/startup/pitch-decks', { method: 'GET' });
}

export async function generateLandingPage(
  productName: string,
  valueProp: string
): Promise<FastApiLandingPage> {
  return request<FastApiLandingPage>('/startup/landing-page', {
    method: 'POST',
    body: JSON.stringify({ product_name: productName, value_proposition: valueProp }),
  });
}

export async function generatePitchDeck(
  productName: string,
  problem: string,
  market: string
): Promise<FastApiPitchDeck> {
  return request<FastApiPitchDeck>('/startup/pitch-deck', {
    method: 'POST',
    body: JSON.stringify({ product_name: productName, problem, market }),
  });
}

// ============================================================================
// 13. AI LAB
// ============================================================================

export async function getModelRouterConfig(): Promise<FastApiModelRouterConfig> {
  return request<FastApiModelRouterConfig>('/ai-lab/models', { method: 'GET' });
}

// ============================================================================
// 14. MOD 0: APPLICATION DOSSIER & GOOGLE DOCS AUTO-FILLER
// ============================================================================

export async function getApplicationDossier(approvalId: string): Promise<ApplicationDossier> {
  return request<ApplicationDossier>(`/approvals/${approvalId}/application-dossier`, { method: 'GET' });
}

export async function updateApplicationDossier(dossier: ApplicationDossier): Promise<ApplicationDossier> {
  return request<ApplicationDossier>(`/approvals/${dossier.approval_id || dossier.id}/application-dossier`, {
    method: 'PUT',
    body: JSON.stringify(dossier),
  });
}

export async function autoFillApplicationDossier(
  opportunityId: string,
  selectedDocs?: string[]
): Promise<ApplicationDossier> {
  return request<ApplicationDossier>('/approvals/auto-fill-dossier', {
    method: 'POST',
    body: JSON.stringify({ opportunity_id: opportunityId, selected_docs: selectedDocs }),
  });
}

// ============================================================================
// 15. MOD 1: MULTI-CHANNEL OPPORTUNITY SURVEILLANCE & TOOL DISPATCHER
// ============================================================================

export async function getMultiChannelOpportunities(): Promise<MultiChannelOpportunity[]> {
  return request<MultiChannelOpportunity[]>('/opportunities/multi-channel', { method: 'GET' });
}

export async function runMultiChannelScan(
  channels: string[] = ['instagram_search', 'pinterest_board', 'linkedin_research', 'email_newsletter', 'snowday_portal', 'youth_opportunities'],
  filterBrainrot: boolean = true
): Promise<MultiChannelOpportunity[]> {
  return request<MultiChannelOpportunity[]>('/opportunities/multi-channel-scan', {
    method: 'POST',
    body: JSON.stringify({ channels, filter_brainrot: filterBrainrot }),
  });
}

export async function getWinnerAdviceAndOutreach(opportunityId: string): Promise<MultiChannelWinnerIntelligence> {
  return request<MultiChannelWinnerIntelligence>(`/opportunities/${opportunityId}/winner-intelligence`, {
    method: 'GET',
  });
}

export async function dispatchOpportunityToTool(
  opportunityId: string,
  toolName: string
): Promise<{ success: boolean; tool: string; status: string; workspace_url: string; message: string }> {
  return request<{ success: boolean; tool: string; status: string; workspace_url: string; message: string }>(
    `/opportunities/${opportunityId}/dispatch-tool`,
    {
      method: 'POST',
      body: JSON.stringify({ tool: toolName }),
    }
  );
}

// ============================================================================
// 16. RESEARCH SCIENTIST: BIOMIMICRY NATURE INSPIRATION & EXPERIMENTS
// ============================================================================

export async function getBiomimicryProjects(): Promise<BiomimicryResearchProject[]> {
  return request<BiomimicryResearchProject[]>('/research/biomimicry-projects', { method: 'GET' });
}

export async function createBiomimicryProject(
  organismName: string,
  inquiryQuestion: string
): Promise<BiomimicryResearchProject> {
  return request<BiomimicryResearchProject>('/research/biomimicry-projects', {
    method: 'POST',
    body: JSON.stringify({ organism_name: organismName, inquiry_question: inquiryQuestion }),
  });
}

// ============================================================================
// 17. AUTONOMOUS SIDE HUSTLES (DEEPSEEK BACKEND + GEMINI AI STUDIO)
// ============================================================================

export async function getSideHustleAutonomousBlueprints(): Promise<SideHustleAutonomousExecution[]> {
  return request<SideHustleAutonomousExecution[]>('/startup/side-hustles', { method: 'GET' });
}

export async function generateDeepseekBackendExecution(
  title: string,
  category: string,
  tagline: string
): Promise<SideHustleAutonomousExecution> {
  return request<SideHustleAutonomousExecution>('/startup/side-hustles/generate-deepseek-backend', {
    method: 'POST',
    body: JSON.stringify({ title, category, tagline }),
  });
}

// ============================================================================
// 18. MULTI-AI ENSEMBLE COGNITIVE CO-REASONING
// ============================================================================

export async function runMultiAiEnsembleDeliberation(
  inquiryTopic: string,
  context?: string
): Promise<MultiAiEnsembleDeliberation> {
  return request<MultiAiEnsembleDeliberation>('/ai-lab/ensemble-deliberation', {
    method: 'POST',
    body: JSON.stringify({ inquiry_topic: inquiryTopic, context }),
  });
}

export async function getAiDeliberations(): Promise<MultiAiDeliberationSession[]> {
  return request<MultiAiDeliberationSession[]>('/ai-lab/deliberations', { method: 'GET' });
}

export async function createAiDeliberation(params: {
  inquiry_prompt: string;
  deliberation_mode: string;
  ensemble_models: string[];
}): Promise<MultiAiDeliberationSession> {
  return request<MultiAiDeliberationSession>('/ai-lab/deliberations', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getSideHustles(): Promise<SideHustleAutonomousExecution[]> {
  return getSideHustleAutonomousBlueprints();
}

export async function generateSideHustleBackend(params: {
  title: string;
  category: string;
  tagline: string;
}): Promise<SideHustleAutonomousExecution> {
  return generateDeepseekBackendExecution(params.title, params.category, params.tagline);
}

// Export default and unified api object
export const api = {
  getBaseUrl: getApiBaseUrl,
  setBaseUrl: setApiBaseUrl,
  getAuthToken,
  setAuthToken,
  getAuthUser,
  setAuthUser,
  loginWithGoogle,
  logout,
  createGCWProject,
  getGCWProjects,
  getGCWProjectById,
  getPendingApprovals,
  decideApproval,
  getApplicationDossier,
  updateApplicationDossier,
  autoFillApplicationDossier,
  getOpportunities,
  scanOpportunities,
  getMultiChannelOpportunities,
  runMultiChannelScan,
  getWinnerAdviceAndOutreach,
  dispatchOpportunityToTool,
  dispatchOpportunityTool: dispatchOpportunityToTool,
  getCompetitions,
  extractCompetitionRules,
  draftCompetitionMaterial,
  getCompetitionWinnersAnalysis,
  getCompetitionIdeas,
  getCompetitionRubricAnalysis,
  getCompetitionImprovements,
  getCompetitionFollowUps,
  getGrants,
  researchGrantBackground,
  generateGrantDraft,
  generateGrantBudget,
  getResearchPapers,
  getResearchHypotheses,
  generateResearchHypothesis,
  getBiomimicryProjects,
  createBiomimicryProject,
  getOutreachContacts,
  getOutreachCampaigns,
  createOutreachCampaign,
  findOutreachContacts,
  getCalendarEvents,
  getCalendarSchedule,
  optimizeCalendarSchedule,
  getKnowledgeGraph,
  getSocialPosts,
  generateSocialPost,
  getLandingPages: getStartupLandingPages,
  getPitchDecks: getStartupPitchDecks,
  generateLandingPage,
  generatePitchDeck,
  getSideHustleAutonomousBlueprints,
  getSideHustles,
  generateDeepseekBackendExecution,
  generateSideHustleBackend,
  getModelRouterConfig,
  runMultiAiEnsembleDeliberation,
  getAiDeliberations,
  createAiDeliberation,
  getFeaturesCatalog,
  searchFeaturesCatalog,
  executeMasterFeature,
};

// ============================================================================
// 1000+ ADVANCED MASTER FEATURES SUITE
// ============================================================================
export async function getFeaturesCatalog(): Promise<{
  success: boolean;
  total_count: number;
  stats: any;
  groups: any[];
}> {
  return request<{ success: boolean; total_count: number; stats: any; groups: any[] }>('/features/catalog', {
    method: 'GET',
  });
}

export async function searchFeaturesCatalog(params?: {
  q?: string;
  module?: string;
  tier?: string;
  mode?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  total_matched: number;
  offset: number;
  limit: number;
  features: any[];
}> {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.set('q', params.q);
  if (params?.module) queryParams.set('module', params.module);
  if (params?.tier) queryParams.set('tier', params.tier);
  if (params?.mode) queryParams.set('mode', params.mode);
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.offset) queryParams.set('offset', String(params.offset));

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return request<{ success: boolean; total_matched: number; offset: number; limit: number; features: any[] }>(
    `/features/search${queryStr}`,
    { method: 'GET' }
  );
}

export async function executeMasterFeature(
  featureId: string,
  customParameters?: Record<string, any>
): Promise<{ success: boolean; result: any }> {
  return request<{ success: boolean; result: any }>('/features/execute', {
    method: 'POST',
    body: JSON.stringify({ featureId, customParameters }),
  });
}

export async function getDocumentTemplates(): Promise<{ templates: any[] }> {
  return request<{ templates: any[] }>('/documents/templates', { method: 'GET' });
}

export async function generateDocument(payload: {
  templateId?: string;
  title: string;
  fields?: Record<string, string>;
  generateFigures?: boolean;
}): Promise<{ success: boolean; document: any }> {
  return request<{ success: boolean; document: any }>('/documents/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getDocumentVersions(documentId: string): Promise<{ versions: any[] }> {
  return request<{ versions: any[] }>(`/documents/${documentId}/versions`, { method: 'GET' });
}

export async function getChromaCollections(): Promise<{ collections: any[] }> {
  return request<{ collections: any[] }>('/chroma/collections', { method: 'GET' });
}

export async function queryChroma(payload: {
  collection: string;
  queryText: string;
  topK?: number;
  filter?: Record<string, any>;
}): Promise<{ collection: string; queryText: string; count: number; results: any[] }> {
  return request<{ collection: string; queryText: string; count: number; results: any[] }>('/chroma/query', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addChromaDocuments(payload: {
  collection: string;
  documents: { id?: string; document: string; metadata?: Record<string, any> }[];
}): Promise<{ success: boolean; collection: string; addedIds: string[]; count: number }> {
  return request<{ success: boolean; collection: string; addedIds: string[]; count: number }>('/chroma/add', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}



