import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Compass,
  Trophy,
  FileText,
  Microscope,
  Users,
  Calendar,
  Network,
  Share2,
  Rocket,
  Cpu,
  Brain,
  Layers,
  Radio,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  LogIn,
  Settings,
  X,
  ExternalLink,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { api } from '../lib/api';
import { useSSE } from '../hooks/useSSE';
import {
  AuthUser,
  FastApiApproval,
  GCWProject,
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
} from '../types/apiTypes';

// Subcomponents
import { CommandBarSection } from './fastapi/CommandBarSection';
import { ApprovalCenterSection } from './fastapi/ApprovalCenterSection';
import { GcwProjectsSection } from './fastapi/GcwProjectsSection';
import { OpportunitiesSection } from './fastapi/OpportunitiesSection';
import { CompetitionsSection } from './fastapi/CompetitionsSection';
import { GrantsSection } from './fastapi/GrantsSection';
import { ResearchSection } from './fastapi/ResearchSection';
import { OutreachSection } from './fastapi/OutreachSection';
import { CalendarSection } from './fastapi/CalendarSection';
import { KnowledgeGraphSection } from './fastapi/KnowledgeGraphSection';
import { SocialMediaSection } from './fastapi/SocialMediaSection';
import { StartupGrowthSection } from './fastapi/StartupGrowthSection';
import { AiLabSection } from './fastapi/AiLabSection';
import { MasterFeatureCatalogSection } from './fastapi/MasterFeatureCatalogSection';
import { WorkspaceHubSection } from './fastapi/WorkspaceHubSection';
import { FullStackArchitectureSection } from './fastapi/FullStackArchitectureSection';
import { CeleryWorkerDashboardView } from './modules/CeleryWorkerDashboardView';
import { BrandCollabView } from './modules/BrandCollabView';
import { BrowserAgentView } from './modules/BrowserAgentView';
import { DocumentGeneratorView } from './modules/DocumentGeneratorView';
import { EmailAssistantView } from './modules/EmailAssistantView';
import { IdeaIncubatorView } from './modules/IdeaIncubatorView';
import { SideHustleScraperView } from './modules/SideHustleScraperView';
import { EssayArchitectView } from './modules/EssayArchitectView';
import { ProjectBuilderView } from './modules/ProjectBuilderView';
import { GeneralCognitiveWorkerView } from './modules/GeneralCognitiveWorkerView';
import { INITIAL_GCW_STATE } from '../data/mockInitialData';
import { GCWState } from '../types';
import { Zap, Server, Briefcase, Globe, FileCheck, Mail, Lightbulb, TrendingUp, PenTool, GitBranch, BrainCircuit } from 'lucide-react';

export type FastApiTabId =
  | 'command_center'
  | 'gcw_cognitive_worker'
  | 'architecture_stack'
  | 'celery_redis'
  | 'workspace'
  | 'features_catalog'
  | 'approvals'
  | 'projects'
  | 'opportunities'
  | 'competitions'
  | 'grants'
  | 'research'
  | 'outreach'
  | 'brand_collab'
  | 'social'
  | 'startup'
  | 'idea_incubator'
  | 'side_hustle'
  | 'email_assistant'
  | 'calendar'
  | 'knowledge'
  | 'browser_agent'
  | 'project_builder'
  | 'document_generator'
  | 'essay_architect'
  | 'ai_lab';

export const FastApiLiveApp: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<FastApiTabId>('command_center');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(api.getAuthUser());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [googleIdTokenInput, setGoogleIdTokenInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // API Config Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(api.getBaseUrl());

  // Global Error & Toast Banners
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [recentSseEvents, setRecentSseEvents] = useState<
    { id: string; type: string; title: string; time: string }[]
  >([]);

  // Core Data States
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [approvals, setApprovals] = useState<FastApiApproval[]>([]);
  const [projects, setProjects] = useState<GCWProject[]>([]);
  const [opportunities, setOpportunities] = useState<FastApiOpportunity[]>([]);
  const [competitions, setCompetitions] = useState<FastApiCompetition[]>([]);
  const [grants, setGrants] = useState<FastApiGrant[]>([]);
  const [papers, setPapers] = useState<FastApiResearchPaper[]>([]);
  const [hypotheses, setHypotheses] = useState<FastApiHypothesis[]>([]);
  const [contacts, setContacts] = useState<FastApiContact[]>([]);
  const [campaigns, setCampaigns] = useState<FastApiCampaign[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<FastApiCalendarEvent[]>([]);
  const [calendarSchedule, setCalendarSchedule] = useState<FastApiCalendarSchedule | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<FastApiKnowledgeGraph | null>(null);
  const [graphFilter, setGraphFilter] = useState<string | undefined>();
  const [socialPosts, setSocialPosts] = useState<FastApiSocialPost[]>([]);
  const [landingPages, setLandingPages] = useState<FastApiLandingPage[]>([]);
  const [pitchDecks, setPitchDecks] = useState<FastApiPitchDeck[]>([]);
  const [modelConfig, setModelConfig] = useState<FastApiModelRouterConfig | null>(null);
  const [gcwState, setGcwState] = useState<GCWState>(INITIAL_GCW_STATE);

  // Handle SSE Real-Time Event Dispatch
  const handleSseEvent = useCallback((event: any) => {
    console.log('[SSE Live Event Received]:', event);
    const eventTime = new Date().toLocaleTimeString();

    if (event.type === 'new_approval') {
      const payload = event.payload as FastApiApproval;
      setApprovals((prev) => [payload, ...prev.filter((p) => p.id !== payload.id)]);
      setRecentSseEvents((prev) => [
        {
          id: `${Date.now()}_${Math.random()}`,
          type: 'new_approval',
          title: `New Authorization Required: ${payload.action_type} (${payload.module})`,
          time: eventTime,
        },
        ...prev.slice(0, 4),
      ]);
    } else if (event.type === 'approval_decided') {
      const payload = event.payload as { approval_id: string; approved: boolean };
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === payload.approval_id
            ? { ...a, status: payload.approved ? 'approved' : 'rejected' }
            : a
        )
      );
      setRecentSseEvents((prev) => [
        {
          id: `${Date.now()}_${Math.random()}`,
          type: 'approval_decided',
          title: `Approval Decided: ${payload.approval_id} -> ${
            payload.approved ? 'AUTHORIZED' : 'DENIED'
          }`,
          time: eventTime,
        },
        ...prev.slice(0, 4),
      ]);
    } else if (event.type === 'high_match_opportunity') {
      const opp = event.payload as FastApiOpportunity;
      setOpportunities((prev) => [opp, ...prev.filter((o) => o.id !== opp.id)]);
      setRecentSseEvents((prev) => [
        {
          id: `${Date.now()}_${Math.random()}`,
          type: 'high_match_opportunity',
          title: `High Match Discovered: ${opp.title} (${opp.match_score}%)`,
          time: eventTime,
        },
        ...prev.slice(0, 4),
      ]);
    } else if (event.type === 'gcw_question') {
      setRecentSseEvents((prev) => [
        {
          id: `${Date.now()}_${Math.random()}`,
          type: 'gcw_question',
          title: `Cognitive Worker Alert: ${event.payload?.question || 'GCW Task Updated'}`,
          time: eventTime,
        },
        ...prev.slice(0, 4),
      ]);
    }
  }, []);

  // SSE Subscription Hook
  const { isConnected: sseConnected, connectionError: sseError } = useSSE({
    userId: user?.id || 'usr_atlas_lead',
    onAnyEvent: handleSseEvent,
    enabled: !!user,
  });

  // Fetch All Backend Data
  const loadAllData = useCallback(async () => {
    if (!user) return;
    setIsLoadingAll(true);
    setGlobalError(null);

    try {
      const [
        approvalsRes,
        projectsRes,
        oppsRes,
        compsRes,
        grantsRes,
        papersRes,
        hypothesesRes,
        contactsRes,
        campaignsRes,
        eventsRes,
        scheduleRes,
        graphRes,
        socialRes,
        landingRes,
        decksRes,
        modelsRes,
      ] = await Promise.allSettled([
        api.getPendingApprovals(user.id),
        api.getGCWProjects(user.id),
        api.getOpportunities('new', 0, 50),
        api.getCompetitions('discovered'),
        api.getGrants(),
        api.getResearchPapers(),
        api.getResearchHypotheses(),
        api.getOutreachContacts(),
        api.getOutreachCampaigns(),
        api.getCalendarEvents(),
        api.getCalendarSchedule(),
        api.getKnowledgeGraph(graphFilter),
        api.getSocialPosts(),
        api.getLandingPages(),
        api.getPitchDecks(),
        api.getModelRouterConfig(),
      ]);

      if (approvalsRes.status === 'fulfilled') setApprovals(approvalsRes.value);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value);
      if (oppsRes.status === 'fulfilled') setOpportunities(oppsRes.value);
      if (compsRes.status === 'fulfilled') setCompetitions(compsRes.value);
      if (grantsRes.status === 'fulfilled') setGrants(grantsRes.value);
      if (papersRes.status === 'fulfilled') setPapers(papersRes.value);
      if (hypothesesRes.status === 'fulfilled') setHypotheses(hypothesesRes.value);
      if (contactsRes.status === 'fulfilled') setContacts(contactsRes.value);
      if (campaignsRes.status === 'fulfilled') setCampaigns(campaignsRes.value);
      if (eventsRes.status === 'fulfilled') setCalendarEvents(eventsRes.value);
      if (scheduleRes.status === 'fulfilled') setCalendarSchedule(scheduleRes.value);
      if (graphRes.status === 'fulfilled') setKnowledgeGraph(graphRes.value);
      if (socialRes.status === 'fulfilled') setSocialPosts(socialRes.value);
      if (landingRes.status === 'fulfilled') setLandingPages(landingRes.value);
      if (decksRes.status === 'fulfilled') setPitchDecks(decksRes.value);
      if (modelsRes.status === 'fulfilled') setModelConfig(modelsRes.value);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setGlobalError(err?.message || 'Failed to communicate with FastAPI backend.');
    } finally {
      setIsLoadingAll(false);
    }
  }, [user, graphFilter]);

  // Initial Load & 10-Second Auto Refresh for GCW Projects
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, loadAllData]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const freshProjects = await api.getGCWProjects(user.id);
        setProjects(freshProjects);
      } catch (e) {
        // Silently skip background poll error
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Google OAuth Login
  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const authRes = await api.loginWithGoogle(
        googleIdTokenInput.trim() || 'mock_google_id_token_atlas'
      );
      setUser(authRes.user);
      setShowLoginModal(false);
      setGoogleIdTokenInput('');
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setApprovals([]);
    setProjects([]);
  };

  // Specific Action Handlers
  const handleGoalSubmit = async (goal: string): Promise<GCWProject | null> => {
    if (!user) {
      setShowLoginModal(true);
      return null;
    }
    setIsCreatingProject(true);
    try {
      const proj = await api.createGCWProject(goal, user.id);
      setProjects((prev) => [proj, ...prev]);
      return proj;
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to dispatch project.');
      return null;
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleApprovalDecision = async (id: string, approved: boolean) => {
    if (!user) return;
    try {
      const updated = await api.decideApproval(id, approved, user.id);
      setApprovals((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to submit authorization decision.');
    }
  };

  const handleScanOpportunities = async () => {
    try {
      const scanRes = await api.scanOpportunities();
      setOpportunities(scanRes.opportunities);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to trigger opportunities scan.');
    }
  };

  const handleExtractRules = async (id: string) => {
    try {
      const comp = await api.extractCompetitionRules(id);
      setCompetitions((prev) => prev.map((c) => (c.id === id ? comp : c)));
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to extract rules.');
    }
  };

  const handleDraftCompMaterial = async (id: string, materialName: string) => {
    try {
      const comp = await api.draftCompetitionMaterial(id, materialName);
      setCompetitions((prev) => prev.map((c) => (c.id === id ? comp : c)));
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to draft material.');
    }
  };

  const handleGrantResearch = async (id: string) => {
    try {
      const updated = await api.researchGrantBackground(id);
      setGrants((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to research grant background.');
    }
  };

  const handleGrantDraft = async (id: string, sectionTitle?: string) => {
    try {
      const updated = await api.generateGrantDraft(id, sectionTitle);
      setGrants((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to generate grant draft.');
    }
  };

  const handleGrantBudget = async (id: string) => {
    try {
      const updated = await api.generateGrantBudget(id);
      setGrants((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to generate grant budget.');
    }
  };

  const handleGenerateHypothesis = async (topic: string) => {
    try {
      const hypo = await api.generateResearchHypothesis(topic);
      setHypotheses((prev) => [hypo, ...prev]);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to generate hypothesis.');
    }
  };

  const handleCreateCampaign = async (name: string, targetAudience?: string) => {
    try {
      const camp = await api.createOutreachCampaign(name, targetAudience);
      setCampaigns((prev) => [camp, ...prev]);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to create campaign.');
    }
  };

  const handleFindContacts = async (query: string) => {
    try {
      const res = await api.findOutreachContacts(query);
      setContacts(res);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to find contacts.');
    }
  };

  const handleOptimizeCalendar = async () => {
    if (!user) return;
    try {
      const sch = await api.optimizeCalendarSchedule(user.id);
      setCalendarSchedule(sch);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to optimize calendar.');
    }
  };

  const handleGenerateSocial = async (topic: string, platform: string) => {
    try {
      const post = await api.generateSocialPost(topic, platform);
      setSocialPosts((prev) => [post, ...prev]);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to generate post.');
    }
  };

  const handleGenerateLandingPage = async (pName: string, valueProp: string) => {
    try {
      const lp = await api.generateLandingPage(pName, valueProp);
      setLandingPages((prev) => [lp, ...prev]);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to generate landing page.');
    }
  };

  const handleGeneratePitchDeck = async (pName: string, problem: string, market: string) => {
    try {
      const deck = await api.generatePitchDeck(pName, problem, market);
      setPitchDecks((prev) => [deck, ...prev]);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to generate pitch deck.');
    }
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  const navTabs = [
    { id: 'command_center', label: 'Executive Dashboard', icon: Sparkles },
    {
      id: 'gcw_cognitive_worker',
      label: 'General Cognitive Worker (AGI)',
      icon: BrainCircuit,
      badge: 'Module 20',
    },
    {
      id: 'architecture_stack',
      label: 'FastAPI & AI Stack',
      icon: Server,
      badge: 'FastAPI/pgvector',
    },
    {
      id: 'celery_redis',
      label: 'Celery & Redis Streams',
      icon: Cpu,
      badge: 'Async',
    },
    {
      id: 'workspace',
      label: 'Google Workspace & Firebase',
      icon: Share2,
      badge: 'Live Cloud',
    },
    {
      id: 'features_catalog',
      label: '1,000+ Features Suite',
      icon: Zap,
      badge: '1,065',
    },
    {
      id: 'approvals',
      label: 'Approval Center',
      icon: ShieldCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: 'projects', label: 'GCW Projects', icon: Brain, badge: projects.length || undefined },
    { id: 'opportunities', label: 'Opportunities', icon: Compass },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'grants', label: 'Grants & Fellowships', icon: FileText },
    { id: 'research', label: 'Research & Hypotheses', icon: Microscope },
    { id: 'outreach', label: 'Outreach CRM', icon: Users },
    { id: 'brand_collab', label: 'Brand Collab & Deals', icon: Briefcase },
    { id: 'social', label: 'Social Media Engine', icon: Share2 },
    { id: 'startup', label: 'Startup Growth', icon: Rocket },
    { id: 'idea_incubator', label: 'Autonomous Idea Incubator', icon: Lightbulb },
    { id: 'side_hustle', label: 'Side Hustle Scraper', icon: TrendingUp },
    { id: 'email_assistant', label: 'Smart Email Assistant', icon: Mail },
    { id: 'calendar', label: 'Calendar Intelligence', icon: Calendar },
    { id: 'knowledge', label: 'Knowledge Graph', icon: Network },
    { id: 'browser_agent', label: 'Browser Agent (Playwright)', icon: Globe },
    { id: 'project_builder', label: 'Project Builder (WBS)', icon: GitBranch },
    { id: 'document_generator', label: 'Document Studio (LaTeX)', icon: FileCheck },
    { id: 'essay_architect', label: 'Social Advice & Essays', icon: PenTool },
    { id: 'ai_lab', label: 'AI Model Router', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Universal App Header */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-white">ATLAS AI</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                  FASTAPI v1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Backend: {api.getBaseUrl()}
              </p>
            </div>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center space-x-3">
          {/* SSE Live Status */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono">
            <Radio
              className={`w-3 h-3 ${
                sseConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
              }`}
            />
            <span className={sseConnected ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {sseConnected ? 'SSE Live' : 'SSE Offline'}
            </span>
          </div>

          {/* Backend Settings */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Configure Backend API URL"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Global Refresh Button */}
          <button
            onClick={loadAllData}
            disabled={isLoadingAll || !user}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh All Backend Modules"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAll ? 'animate-spin' : ''}`} />
          </button>

          {/* User Auth Info / Login */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`}
                alt={user.name}
                className="w-7 h-7 rounded-full border border-indigo-500/50 bg-slate-800"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors ml-1 cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login with Google</span>
            </button>
          )}
        </div>
      </header>

      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-rose-950/90 border-b border-rose-800 px-4 py-2 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real-time SSE Live Event Stream Bar */}
      {recentSseEvents.length > 0 && (
        <div className="bg-indigo-950/60 border-b border-indigo-800/60 px-4 py-1.5 text-[11px] font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-200 font-bold uppercase shrink-0">
              Live Stream
            </span>
            <span className="text-slate-200 truncate">{recentSseEvents[0].title}</span>
            <span className="text-slate-500 shrink-0">({recentSseEvents[0].time})</span>
          </div>
          <button
            onClick={() => setRecentSseEvents([])}
            className="text-slate-400 hover:text-slate-200 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Body Layout: Sidebar Navigation + Content Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Platform Modules
            </div>

            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as FastApiTabId);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-800 text-white'
                          : tab.id === 'approvals'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] font-mono text-slate-500">
            <div className="flex items-center justify-between">
              <span>FastAPI Backend</span>
              <span className="text-emerald-400 font-bold">LIVE</span>
            </div>
            <div className="text-[10px] text-slate-600 mt-1">Celery Worker: Connected</div>
          </div>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Command Bar always visible in Executive mode */}
          {(activeTab === 'command_center' || activeTab === 'projects') && (
            <CommandBarSection onSubmitGoal={handleGoalSubmit} isCreating={isCreatingProject} />
          )}

          {/* Module Views Routing */}
          {activeTab === 'command_center' && (
            <div className="space-y-6">
              {/* Approvals Summary Row if any pending */}
              {pendingApprovalsCount > 0 && (
                <ApprovalCenterSection
                  approvals={approvals}
                  isLoading={isLoadingAll}
                  onDecide={handleApprovalDecision}
                  onRefresh={loadAllData}
                />
              )}

              {/* GCW Projects Plan Tree */}
              <GcwProjectsSection
                projects={projects}
                isLoading={isLoadingAll}
                onRefresh={loadAllData}
              />

              {/* Opportunities Grid */}
              <OpportunitiesSection
                opportunities={opportunities}
                isLoading={isLoadingAll}
                onScan={handleScanOpportunities}
              />
            </div>
          )}

          {activeTab === 'gcw_cognitive_worker' && (
            <GeneralCognitiveWorkerView
              gcwState={gcwState}
              onUpdateState={setGcwState}
            />
          )}

          {activeTab === 'architecture_stack' && (
            <FullStackArchitectureSection />
          )}

          {activeTab === 'celery_redis' && (
            <CeleryWorkerDashboardView />
          )}

          {activeTab === 'workspace' && (
            <WorkspaceHubSection />
          )}

          {activeTab === 'features_catalog' && (
            <MasterFeatureCatalogSection />
          )}

          {activeTab === 'approvals' && (
            <ApprovalCenterSection
              approvals={approvals}
              isLoading={isLoadingAll}
              onDecide={handleApprovalDecision}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'projects' && (
            <GcwProjectsSection
              projects={projects}
              isLoading={isLoadingAll}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesSection
              opportunities={opportunities}
              isLoading={isLoadingAll}
              onScan={handleScanOpportunities}
            />
          )}

          {activeTab === 'competitions' && (
            <CompetitionsSection
              competitions={competitions}
              isLoading={isLoadingAll}
              onExtractRules={handleExtractRules}
              onDraftMaterial={handleDraftCompMaterial}
            />
          )}

          {activeTab === 'grants' && (
            <GrantsSection
              grants={grants}
              isLoading={isLoadingAll}
              onResearchBackground={handleGrantResearch}
              onGenerateDraft={handleGrantDraft}
              onGenerateBudget={handleGrantBudget}
            />
          )}

          {activeTab === 'research' && (
            <ResearchSection
              papers={papers}
              hypotheses={hypotheses}
              isLoading={isLoadingAll}
              onGenerateHypothesis={handleGenerateHypothesis}
            />
          )}

          {activeTab === 'outreach' && (
            <OutreachSection
              contacts={contacts}
              campaigns={campaigns}
              isLoading={isLoadingAll}
              onCreateCampaign={handleCreateCampaign}
              onFindContacts={handleFindContacts}
            />
          )}

          {activeTab === 'brand_collab' && (
            <BrandCollabView />
          )}

          {activeTab === 'social' && (
            <SocialMediaSection
              posts={socialPosts}
              isLoading={isLoadingAll}
              onGeneratePost={handleGenerateSocial}
            />
          )}

          {activeTab === 'startup' && (
            <StartupGrowthSection
              landingPages={landingPages}
              pitchDecks={pitchDecks}
              isLoading={isLoadingAll}
              onGenerateLandingPage={handleGenerateLandingPage}
              onGeneratePitchDeck={handleGeneratePitchDeck}
            />
          )}

          {activeTab === 'idea_incubator' && (
            <IdeaIncubatorView />
          )}

          {activeTab === 'side_hustle' && (
            <SideHustleScraperView />
          )}

          {activeTab === 'email_assistant' && (
            <EmailAssistantView />
          )}

          {activeTab === 'calendar' && (
            <CalendarSection
              events={calendarEvents}
              schedule={calendarSchedule}
              isLoading={isLoadingAll}
              onOptimize={handleOptimizeCalendar}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeGraphSection
              graph={knowledgeGraph}
              isLoading={isLoadingAll}
              onFilterChange={(type) => {
                setGraphFilter(type);
                api.getKnowledgeGraph(type).then(setKnowledgeGraph);
              }}
              selectedFilter={graphFilter}
            />
          )}

          {activeTab === 'browser_agent' && (
            <BrowserAgentView />
          )}

          {activeTab === 'project_builder' && (
            <ProjectBuilderView />
          )}

          {activeTab === 'document_generator' && (
            <DocumentGeneratorView />
          )}

          {activeTab === 'essay_architect' && (
            <EssayArchitectView />
          )}

          {activeTab === 'ai_lab' && (
            <AiLabSection modelConfig={modelConfig} isLoading={isLoadingAll} />
          )}
        </main>
      </div>

      {/* Google OAuth Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                  <LogIn className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-slate-100">Google OAuth Authentication</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Exchange your Google ID Token for an Atlas AI FastAPI JWT session (POST /auth/google).
            </p>

            {loginError && (
              <div className="p-2.5 bg-rose-950 border border-rose-800 rounded text-xs text-rose-300">
                {loginError}
              </div>
            )}

            <form onSubmit={handleGoogleLogin} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Google ID Token (or test token)
                </label>
                <input
                  type="text"
                  value={googleIdTokenInput}
                  onChange={(e) => setGoogleIdTokenInput(e.target.value)}
                  placeholder="Paste Google ID Token or leave empty for default test session..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 font-mono outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? 'Authenticating...' : 'Sign in to Atlas AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backend API Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-200">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-slate-100">Backend API URL Config</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Configure `NEXT_PUBLIC_API_URL`. Default is <code>http://localhost:8000/api/v1</code> or <code>/api/v1</code> proxy.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  API Base Endpoint
                </label>
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-100 font-mono outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCustomApiUrl('http://localhost:8000/api/v1')}
                  className="text-[10px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-800"
                >
                  Local Port 8000
                </button>
                <button
                  type="button"
                  onClick={() => setCustomApiUrl('/api/v1')}
                  className="text-[10px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-800"
                >
                  App Proxy (/api/v1)
                </button>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    api.setBaseUrl(customApiUrl);
                    setShowConfigModal(false);
                    loadAllData();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save & Reload Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
