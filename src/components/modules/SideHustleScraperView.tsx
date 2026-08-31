import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Zap,
  Search,
  Filter,
  Play,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  BarChart3,
  Cpu,
  Clock,
  Briefcase,
  Sliders,
  ChevronRight,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  FileSpreadsheet,
  Flame,
  Info,
} from 'lucide-react';
import {
  SideHustleBlueprintFull,
  ScrapedRawItem,
  BlueprintFeasibilityReport,
  TrendForecastItem,
  ScraperPlatform,
} from '../../types/sideHustleIncubatorTypes';

interface SideHustleScraperViewProps {
  blueprints?: any;
  onRequestApproval?: (req: { summary: string; moduleName?: string; payload?: any }) => void;
}

export const SideHustleScraperView: React.FC<SideHustleScraperViewProps> = ({ onRequestApproval }) => {
  const [activeTab, setActiveTab] = useState<'blueprints' | 'scraper_feed' | 'scam_filter' | 'feasibility' | 'trends'>('blueprints');
  
  // Data state
  const [blueprints, setBlueprints] = useState<SideHustleBlueprintFull[]>([]);
  const [scrapedItems, setScrapedItems] = useState<ScrapedRawItem[]>([]);
  const [trendForecasts, setTrendForecasts] = useState<TrendForecastItem[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<SideHustleBlueprintFull | null>(null);
  const [feasibilityReport, setFeasibilityReport] = useState<BlueprintFeasibilityReport | null>(null);
  
  // Loading & Filter states
  const [loading, setLoading] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scam checker form
  const [scamPitchInput, setScamPitchInput] = useState('');
  const [scamCheckResult, setScamCheckResult] = useState<any | null>(null);
  const [scamChecking, setScamChecking] = useState(false);

  // New blueprint synthesis
  const [newBlueprintPrompt, setNewBlueprintPrompt] = useState('');
  const [synthesizing, setSynthesizing] = useState(false);

  // Feasibility form state
  const [userSkills, setUserSkills] = useState('TypeScript, AI Prompting, Figma, Next.js');
  const [userHours, setUserHours] = useState(15);
  const [userCapital, setUserCapital] = useState(300);
  const [analyzingFeasibility, setAnalyzingFeasibility] = useState(false);

  // Scraper Run Modal
  const [isScrapeModalOpen, setIsScrapeModalOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<ScraperPlatform[]>(['Pinterest', 'YouTube Transcripts', 'TikTok', 'Instagram Reels']);
  const [scrapeKeywords, setScrapeKeywords] = useState('AI micro services, Notion templates, 3D printing e-commerce');

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sidehustle/overview');
      const data = await res.json();
      if (data.blueprints) {
        setBlueprints(data.blueprints);
        if (data.blueprints.length > 0 && !selectedBlueprint) {
          setSelectedBlueprint(data.blueprints[0]);
        }
      }
      if (data.scrapedItems) setScrapedItems(data.scrapedItems);
      if (data.trends) setTrendForecasts(data.trends);
    } catch (e) {
      console.error('Failed to load side hustle overview:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScrape = async () => {
    try {
      setLoading(true);
      const queries = scrapeKeywords.split(',').map((k) => k.trim()).filter(Boolean);
      const res = await fetch('/api/sidehustle/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: selectedPlatforms, searchQueries: queries }),
      });
      const data = await res.json();
      if (data.newItems) {
        setScrapedItems((prev) => [...data.newItems, ...prev]);
        setIsScrapeModalOpen(false);
        setActiveTab('scraper_feed');
      }
    } catch (e) {
      console.error('Failed to trigger scrape:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleScamCheck = async () => {
    if (!scamPitchInput.trim()) return;
    try {
      setScamChecking(true);
      const res = await fetch('/api/sidehustle/scam-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scamPitchInput }),
      });
      const data = await res.json();
      if (data.result) {
        setScamCheckResult(data.result);
      }
    } catch (e) {
      console.error('Failed to check scam:', e);
    } finally {
      setScamChecking(false);
    }
  };

  const handleSynthesizeBlueprint = async () => {
    if (!newBlueprintPrompt.trim()) return;
    try {
      setSynthesizing(true);
      const res = await fetch('/api/sidehustle/blueprint/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newBlueprintPrompt }),
      });
      const data = await res.json();
      if (data.blueprint) {
        setBlueprints((prev) => [data.blueprint, ...prev]);
        setSelectedBlueprint(data.blueprint);
        setNewBlueprintPrompt('');
        setActiveTab('blueprints');
      }
    } catch (e) {
      console.error('Failed to synthesize blueprint:', e);
    } finally {
      setSynthesizing(false);
    }
  };

  const handleRunFeasibility = async (bpId?: string) => {
    const targetId = bpId || selectedBlueprint?.id;
    if (!targetId) return;
    try {
      setAnalyzingFeasibility(true);
      const res = await fetch('/api/sidehustle/feasibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprintId: targetId,
          userProfile: {
            skills: userSkills.split(',').map((s) => s.trim()),
            availableHoursPerWeek: Number(userHours),
            capitalBudgetUsd: Number(userCapital),
          },
        }),
      });
      const data = await res.json();
      if (data.report) {
        setFeasibilityReport(data.report);
        setActiveTab('feasibility');
      }
    } catch (e) {
      console.error('Failed to calculate feasibility:', e);
    } finally {
      setAnalyzingFeasibility(false);
    }
  };

  const filteredBlueprints = blueprints.filter((bp) => {
    const matchCategory = categoryFilter === 'all' || bp.category === categoryFilter;
    const matchSearch =
      bp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredScrapedItems = scrapedItems.filter((item) => {
    const matchPlatform = platformFilter === 'all' || item.platform === platformFilter;
    return matchPlatform;
  });

  return (
    <div id="side_hustle_scraper_view" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold tracking-wider">
              MODULE 18
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • Pinterest, Reels, YouTube & TikTok Business Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">
            Side Hustle & Knowledge Scraper
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Distributed opportunity crawler, MLM/scam filtering pipeline, and quantitative viability analysis engine.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn_open_scrape_modal"
            onClick={() => setIsScrapeModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Multi-Platform Scraper</span>
          </button>

          <button
            onClick={fetchOverview}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition"
            title="Refresh Knowledge Base"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
        {[
          { id: 'blueprints', label: 'Structured Blueprints', icon: Briefcase, count: blueprints.length },
          { id: 'scraper_feed', label: 'Raw Scraper Stream', icon: Layers, count: scrapedItems.length },
          { id: 'scam_filter', label: 'Scam & MLM Classifier', icon: ShieldCheck, badge: 'AI Guard' },
          { id: 'feasibility', label: 'SWOT & Viability Engine', icon: BarChart3, badge: 'pytrends' },
          { id: 'trends', label: 'Emerging Trend Radar', icon: Flame, count: trendForecasts.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab_${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 font-medium ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="px-1.5 py-0.2 text-[9px] rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: STRUCTURED BLUEPRINTS */}
      {/* ========================================================= */}
      {activeTab === 'blueprints' && (
        <div className="space-y-6">
          {/* Quick Synthesize Box */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="flex-1 w-full flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
              <Sparkles className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
              <input
                type="text"
                value={newBlueprintPrompt}
                onChange={(e) => setNewBlueprintPrompt(e.target.value)}
                placeholder="Synthesize new blueprint from idea (e.g. 'Micro-SaaS Notion widget directory' or 'Local AI cold calling agency')..."
                className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSynthesizeBlueprint}
              disabled={synthesizing || !newBlueprintPrompt.trim()}
              className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-2 shrink-0"
            >
              {synthesizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>{synthesizing ? 'Synthesizing...' : 'Synthesize Blueprint'}</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blueprints..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {['all', 'AI Services', 'Digital Products', 'E-commerce', 'Freelancing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    categoryFilter === cat
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Blueprints Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Blueprint Cards List */}
            <div className="lg:col-span-1 space-y-3.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredBlueprints.map((bp) => {
                const isSelected = selectedBlueprint?.id === bp.id;
                return (
                  <div
                    key={bp.id}
                    onClick={() => setSelectedBlueprint(bp)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-xs space-y-2.5 ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono text-[10px] font-bold">
                        {bp.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>{bp.trendVelocity}</span>
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-100 text-sm leading-snug">{bp.title}</h3>
                    <p className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed">{bp.summary}</p>

                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px] border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block">Complexity</span>
                        <span className="text-slate-200 font-bold">{bp.complexityRating}/10</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">First $</span>
                        <span className="text-slate-200 font-bold">{bp.timeToFirstDollarDays}d</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Automation</span>
                        <span className="text-emerald-400 font-bold">{bp.automationLevelPercentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Blueprint Detailed View */}
            {selectedBlueprint && (
              <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                        {selectedBlueprint.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Initial Capital: ${selectedBlueprint.initialCapitalRequiredUsd}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-100 mt-1">{selectedBlueprint.title}</h2>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRunFeasibility(selectedBlueprint.id)}
                      disabled={analyzingFeasibility}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
                    >
                      {analyzingFeasibility ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5" />}
                      <span>Run SWOT & Viability</span>
                    </button>
                  </div>
                </div>

                {/* Key Metrics Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Est. Revenue Potential</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                      ${selectedBlueprint.estimatedMonthlyEarningsMinUsd} - ${selectedBlueprint.estimatedMonthlyEarningsMaxUsd}/mo
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Time To First Dollar</span>
                    <span className="text-xs font-bold text-indigo-300 font-mono mt-0.5 block">
                      ~{selectedBlueprint.timeToFirstDollarDays} Days
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Automation Level</span>
                    <span className="text-xs font-bold text-teal-400 font-mono mt-0.5 block">
                      {selectedBlueprint.automationLevelPercentage}% Automated
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Scam Safety Index</span>
                    <span className="text-xs font-bold text-emerald-300 font-mono mt-0.5 block">
                      {100 - selectedBlueprint.scamLikelihoodScore}/100 (Safe)
                    </span>
                  </div>
                </div>

                {/* Target Audience & Summary */}
                <div className="space-y-2 text-xs">
                  <span className="font-mono text-indigo-400 font-bold uppercase text-[11px]">Target Audience & Positioning:</span>
                  <p className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 leading-relaxed">
                    {selectedBlueprint.targetAudience}
                  </p>
                </div>

                {/* Synthesized Steps */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-bold uppercase text-[11px]">
                      Synthesized Actionable Steps ({selectedBlueprint.steps.length} Phases):
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Synthesized from multi-channel scraper</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedBlueprint.steps.map((step) => (
                      <div key={step.stepNumber} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">
                            Phase {step.stepNumber}: {step.title}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                            ~{step.estimatedHours} hrs • {step.actionType}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{step.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {step.toolsUsed.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tools & Platform Stack */}
                <div className="space-y-2 text-xs">
                  <span className="font-mono text-slate-400 font-bold uppercase text-[11px]">Required Software & Platforms:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedBlueprint.tools.map((tool, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-medium text-slate-200">{tool.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({tool.category})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {tool.costPerMonthUsd === 0 ? 'Free' : `$${tool.costPerMonthUsd}/mo`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1.5">
                    <span className="font-bold text-emerald-400 flex items-center space-x-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Advantages (Pros)</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {selectedBlueprint.prosAndCons.pros.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-1.5">
                    <span className="font-bold text-rose-400 flex items-center space-x-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Risks & Limitations (Cons)</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {selectedBlueprint.prosAndCons.cons.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: RAW SCRAPER STREAM */}
      {/* ========================================================= */}
      {activeTab === 'scraper_feed' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-mono">Platform Feed Filter:</span>
              {['all', 'Pinterest', 'YouTube Transcripts', 'TikTok', 'Instagram Reels'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                    platformFilter === p
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {p === 'all' ? 'All Platforms' : p}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-slate-500">
              Showing {filteredScrapedItems.length} cleaned items
            </span>
          </div>

          <div className="space-y-3">
            {filteredScrapedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[10px]">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                      {item.platform}
                    </span>
                    <span className="text-slate-300 font-semibold">{item.creatorOrChannel}</span>
                    <span className="text-slate-500">• {new Date(item.scrapedAt).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400">{(item.viewCount).toLocaleString()} views</span>
                    <span className="text-emerald-400">Engage: {item.engagementScore}%</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        item.classificationStatus === 'legitimate'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {item.classificationStatus === 'legitimate' ? 'Legitimate Business' : 'Scam Filtered'}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Raw Ingested Text</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed italic">"{item.rawText}"</p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                    <span className="text-[10px] text-emerald-500 font-mono uppercase block">Cleaned & Synthesized Strategy</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{item.cleanedText}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono text-[10px]">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">Keywords:</span>
                    {item.extractedKeywords?.map((k, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                        #{k}
                      </span>
                    ))}
                  </div>

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Inspect Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SCAM & MLM CLASSIFIER */}
      {/* ========================================================= */}
      {activeTab === 'scam_filter' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-sm">Fine-Tuned Scam & Fraud Evaluator</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test any viral pitch or side hustle promise against our multi-heuristic fraud model and LLM verification pipeline. Detects pyramid recruitment, upfront payment traps, and empty product claims.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">Paste Pitch / Caption / Offer:</label>
              <textarea
                value={scamPitchInput}
                onChange={(e) => setScamPitchInput(e.target.value)}
                rows={5}
                placeholder="e.g. 'Pay $99 for our VIP mentor group to earn $5,000/week guaranteed on Amazon without any inventory or work...'"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleScamCheck}
                disabled={scamChecking || !scamPitchInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-2"
              >
                {scamChecking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>{scamChecking ? 'Evaluating Safety...' : 'Run Scam Classifier'}</span>
              </button>

              <button
                onClick={() =>
                  setScamPitchInput(
                    'DM "FREEDOM" to get my 1000x crypto trading bot. Guaranteed $1,000/day passive with zero experience. Join my private Telegram before 10 spots run out!'
                  )
                }
                className="px-3 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs rounded-xl transition font-mono"
              >
                Load Scam Sample
              </button>
            </div>
          </div>

          {/* Scam Evaluation Output */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm font-mono uppercase">Classifier Diagnostic Output</h3>

            {scamCheckResult ? (
              <div className="space-y-4 text-xs">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    scamCheckResult.verdict === 'legitimate'
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-mono block">Classification Verdict</span>
                    <span className="text-base font-bold">
                      {scamCheckResult.verdict === 'legitimate' ? 'VERIFIED LEGITIMATE MODEL' : 'HIGH RISK SCAM / FRAUD DETECTED'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono block">Scam Risk Score</span>
                    <span className="text-lg font-mono font-bold">{scamCheckResult.scamScore}/100</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase">Heuristic Checkpoints:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${scamCheckResult.heuristics.unrealisticPromises ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <span className="text-slate-300">Unrealistic Guarantees</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${scamCheckResult.heuristics.upfrontFeeRequired ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <span className="text-slate-300">Upfront Paywall Gate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${scamCheckResult.heuristics.pyramidRecruitment ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <span className="text-slate-300">Pyramid / Recruitment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${scamCheckResult.heuristics.lackOfClearProduct ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <span className="text-slate-300">Missing Actual Product</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Model Reasoning</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{scamCheckResult.reasoning}</p>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-600" />
                <span className="text-xs">Submit a pitch to trigger real-time scam scoring</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SWOT & VIABILITY ENGINE */}
      {/* ========================================================= */}
      {activeTab === 'feasibility' && (
        <div className="space-y-6">
          {/* User profile parameters */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Target Blueprint</label>
              <select
                value={selectedBlueprint?.id || ''}
                onChange={(e) => {
                  const found = blueprints.find((b) => b.id === e.target.value);
                  if (found) setSelectedBlueprint(found);
                }}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                {blueprints.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Your Skill Set</label>
              <input
                type="text"
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Available Hours / Week</label>
              <input
                type="number"
                value={userHours}
                onChange={(e) => setUserHours(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => handleRunFeasibility()}
                disabled={analyzingFeasibility}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2"
              >
                {analyzingFeasibility ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5" />}
                <span>Compute Viability Score</span>
              </button>
            </div>
          </div>

          {/* Feasibility Report Presentation */}
          {feasibilityReport ? (
            <div className="space-y-6">
              {/* Top Decision Banner */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        feasibilityReport.recommendation === 'GO'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : feasibilityReport.recommendation === 'CONDITIONAL_GO'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      RECOMMENDATION: {feasibilityReport.recommendation}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Break-even estimate: ~{feasibilityReport.estimatedBreakEvenMonths} Month
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{feasibilityReport.blueprintTitle}</h3>
                  <p className="text-xs text-slate-400 max-w-2xl">{feasibilityReport.recommendationRationale}</p>
                </div>

                <div className="text-center p-4 bg-slate-950 border border-slate-800 rounded-2xl shrink-0 w-full md:w-44">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Overall Viability</span>
                  <span className="text-3xl font-mono font-bold text-emerald-400">{feasibilityReport.viabilityScore}</span>
                  <span className="text-[10px] text-slate-500 block">out of 100</span>
                </div>
              </div>

              {/* 4-Factor Viability Score Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Google Trends Saturation</span>
                  <span className="text-base font-bold text-slate-200 font-mono">{feasibilityReport.scoreBreakdown.marketSaturationScore}/100</span>
                  <span className="text-[10px] text-emerald-400 block">High Search Interest</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Barrier To Entry</span>
                  <span className="text-base font-bold text-slate-200 font-mono">{feasibilityReport.scoreBreakdown.barrierToEntryScore}/100</span>
                  <span className="text-[10px] text-indigo-400 block">Low Startup Friction</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Profitability Potential</span>
                  <span className="text-base font-bold text-slate-200 font-mono">{feasibilityReport.scoreBreakdown.profitabilityScore}/100</span>
                  <span className="text-[10px] text-teal-400 block">80%+ Gross Margin</span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">User Profile Fit</span>
                  <span className="text-base font-bold text-slate-200 font-mono">{feasibilityReport.scoreBreakdown.personalFitScore}/100</span>
                  <span className="text-[10px] text-emerald-400 block">Direct Skills Match</span>
                </div>
              </div>

              {/* 4-Quadrant SWOT Analysis Matrix */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">4-Quadrant SWOT Analysis Matrix:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Strengths */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl space-y-2">
                    <span className="font-bold text-emerald-400 text-xs flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>STRENGTHS (Internal Advantages)</span>
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                      {feasibilityReport.swotAnalysis.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-2xl space-y-2">
                    <span className="font-bold text-amber-400 text-xs flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>WEAKNESSES (Internal Gaps)</span>
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                      {feasibilityReport.swotAnalysis.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl space-y-2">
                    <span className="font-bold text-indigo-400 text-xs flex items-center space-x-1.5">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>OPPORTUNITIES (Market Tailwinds)</span>
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                      {feasibilityReport.swotAnalysis.opportunities.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-2xl space-y-2">
                    <span className="font-bold text-rose-400 text-xs flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>THREATS (External Headwinds)</span>
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                      {feasibilityReport.swotAnalysis.threats.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Differentiation Strategies */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
                  Recommended Differentiation & Moat Strategies:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {feasibilityReport.differentiationStrategies.map((strat, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block">Strategy #{i + 1}</span>
                      <p className="text-slate-300 text-[11px]">{strat}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-slate-400">
              <BarChart3 className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">Click "Compute Viability Score" to generate real-time SWOT and pytrends data.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: TREND RADAR */}
      {/* ========================================================= */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">
              Time-Series & Social Mention Velocity Tracking (Google Trends + Web Scrape)
            </span>
            <span className="text-xs font-mono text-emerald-400">Updated Hourly</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendForecasts.map((trend) => (
              <div
                key={trend.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-xs hover:border-slate-700 transition"
              >
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                    {trend.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      trend.status === 'Emerging Hot Opportunity'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}
                  >
                    {trend.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100">{trend.keyword}</h4>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Velocity</span>
                    <span className="text-emerald-400 font-bold">{trend.velocityScore}/100</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">7d Mentions</span>
                    <span className="text-slate-200 font-bold">{trend.mentionsLast7Days.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Growth</span>
                    <span className="text-teal-400 font-bold">+{trend.growthPercentage}%</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block">Sample Blueprint Spin-offs:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {trend.sampleBlueprintIdeas.map((idea, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {idea}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setNewBlueprintPrompt(trend.keyword);
                      setActiveTab('blueprints');
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
                  >
                    <span>Synthesize Blueprint</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LAUNCH SCRAPER JOB */}
      {/* ========================================================= */}
      {isScrapeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Launch Distributed Scraper Job</span>
              </h3>
              <button onClick={() => setIsScrapeModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-slate-300 block mb-1">Target Scraper Platforms:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Pinterest', 'YouTube Transcripts', 'TikTok', 'Instagram Reels'] as ScraperPlatform[]).map((plat) => {
                    const isChecked = selectedPlatforms.includes(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
                          } else {
                            setSelectedPlatforms([...selectedPlatforms, plat]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left font-mono text-[11px] transition ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {plat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-mono text-slate-300 block mb-1">Keywords / Target Niches (comma-separated):</label>
                <input
                  type="text"
                  value={scrapeKeywords}
                  onChange={(e) => setScrapeKeywords(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-[10px] text-slate-400">
                <span className="text-indigo-400 font-bold">Scraping Pipeline Architecture:</span>
                <p>• Headless Chromium + residential proxy pool active</p>
                <p>• Automated scam classifier filter threshold: 40/100</p>
                <p>• Cleaned texts auto-indexed in Knowledge Workspace</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsScrapeModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRunScrape}
                disabled={loading || selectedPlatforms.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                <span>Start Crawl Job</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
