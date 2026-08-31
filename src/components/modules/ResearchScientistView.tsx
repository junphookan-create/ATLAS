import React, { useState, useEffect } from 'react';
import {
  Microscope,
  Search,
  Sparkles,
  ExternalLink,
  BookOpen,
  TrendingUp,
  Loader2,
  Plus,
  Zap,
  GitBranch,
  Cpu,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Database,
  Network,
  FlaskConical,
  Layers,
  Download,
  RefreshCw,
  Play,
  Terminal,
  Clock,
  Compass,
  ListFilter,
  Check,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  Flame,
} from 'lucide-react';
import {
  ResearchPaper,
  ResearchHypothesis,
  IngestionSource,
  ResearchCluster,
  CoCitationGap,
  ComputationalAnalysis,
  WetLabProtocol,
  ManuscriptDraft,
  PersonalResearcherProfile,
} from '../../types';

interface ResearchScientistViewProps {
  papers: ResearchPaper[];
  hypotheses: ResearchHypothesis[];
  onAddHypothesis: (h: ResearchHypothesis) => void;
}

type TabType = 'ingestion' | 'radar' | 'gaps' | 'react_hypothesis' | 'experiments' | 'manuscript' | 'profile_calendar';

export const ResearchScientistView: React.FC<ResearchScientistViewProps> = ({
  papers: initialPapers,
  hypotheses: initialHypotheses,
  onAddHypothesis,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [papers, setPapers] = useState<ResearchPaper[]>(initialPapers);
  const [hypotheses, setHypotheses] = useState<ResearchHypothesis[]>(initialHypotheses);
  const [selectedHypothesis, setSelectedHypothesis] = useState<ResearchHypothesis>(initialHypotheses[0] || null);

  // Data states
  const [sources, setSources] = useState<IngestionSource[]>([]);
  const [clusters, setClusters] = useState<ResearchCluster[]>([]);
  const [gaps, setGaps] = useState<CoCitationGap[]>([]);
  const [profile, setProfile] = useState<PersonalResearcherProfile | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ResearchCluster | null>(null);

  // Action states
  const [topicInput, setTopicInput] = useState('Sparse Neuro-AI & Continuous-Time STDP');
  const [isGeneratingHypothesis, setIsGeneratingHypothesis] = useState(false);
  const [isPollingSource, setIsPollingSource] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>('all');

  // Computational Analysis & Wet Lab states
  const [computationalAnalysis, setComputationalAnalysis] = useState<ComputationalAnalysis | null>(null);
  const [isExecutingAnalysis, setIsExecutingAnalysis] = useState(false);
  const [wetLabProtocol, setWetLabProtocol] = useState<WetLabProtocol | null>(null);
  const [isGeneratingProtocol, setIsGeneratingProtocol] = useState(false);

  // Manuscript drafting states
  const [manuscriptDraft, setManuscriptDraft] = useState<ManuscriptDraft | null>(null);
  const [isDraftingManuscript, setIsDraftingManuscript] = useState(false);
  const [manuscriptSectionTab, setManuscriptSectionTab] = useState<'abstract' | 'intro' | 'methods' | 'results' | 'discussion' | 'latex'>('abstract');

  // Calendar scheduling
  const [scheduledReviewSuccess, setScheduledReviewSuccess] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Load initial backend intelligence
  useEffect(() => {
    fetchSourcesAndProfile();
    fetchResearchRadar();
    fetchCoCitationGaps();
  }, []);

  const fetchSourcesAndProfile = async () => {
    try {
      const res = await fetch('/api/research/sources');
      const data = await res.json();
      if (data.sources) setSources(data.sources);
      if (data.profile) setProfile(data.profile);
    } catch (e) {
      console.error('Failed to fetch research sources:', e);
    }
  };

  const fetchResearchRadar = async () => {
    try {
      const res = await fetch('/api/research/radar');
      const data = await res.json();
      if (data.clusters) {
        setClusters(data.clusters);
        if (!selectedCluster) setSelectedCluster(data.clusters[0]);
      }
    } catch (e) {
      console.error('Failed to fetch research radar:', e);
    }
  };

  const fetchCoCitationGaps = async () => {
    try {
      const res = await fetch('/api/research/gaps');
      const data = await res.json();
      if (data.gaps) setGaps(data.gaps);
    } catch (e) {
      console.error('Failed to fetch co-citation gaps:', e);
    }
  };

  // 1. Poll Source
  const handlePollSource = async (sourceId: string) => {
    setIsPollingSource(sourceId);
    try {
      const res = await fetch(`/api/research/sources/${sourceId}/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: topicInput }),
      });
      const data = await res.json();
      if (data.samplePaper) {
        setPapers((prev) => [data.samplePaper, ...prev]);
      }
      fetchSourcesAndProfile();
    } catch (e) {
      console.error('Failed to poll source:', e);
    } finally {
      setIsPollingSource(null);
    }
  };

  // 2. Generate Hypothesis via ReAct loop
  const handleGenerateReActHypothesis = async (topicToUse?: string) => {
    const topic = topicToUse || topicInput;
    if (!topic.trim()) return;
    setIsGeneratingHypothesis(true);

    try {
      const res = await fetch('/api/research/hypothesis/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (res.ok && data.hypothesis) {
        setHypotheses((prev) => [data.hypothesis, ...prev]);
        setSelectedHypothesis(data.hypothesis);
        onAddHypothesis(data.hypothesis);
        setActiveTab('react_hypothesis');
      }
    } catch (err) {
      console.error('Failed to synthesize hypothesis:', err);
    } finally {
      setIsGeneratingHypothesis(false);
    }
  };

  // 3. Execute Computational Sandbox Analysis
  const handleExecuteComputationalAnalysis = async () => {
    if (!selectedHypothesis) return;
    setIsExecutingAnalysis(true);

    try {
      const res = await fetch('/api/research/execute-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesis: selectedHypothesis }),
      });
      const data = await res.json();
      if (data.analysis) {
        setComputationalAnalysis(data.analysis);
      }
    } catch (e) {
      console.error('Failed to execute computational analysis:', e);
    } finally {
      setIsExecutingAnalysis(false);
    }
  };

  // 4. Generate Wet Lab Protocol
  const handleGenerateWetLabProtocol = async () => {
    if (!selectedHypothesis) return;
    setIsGeneratingProtocol(true);

    try {
      const res = await fetch('/api/research/wetlab-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesis: selectedHypothesis }),
      });
      const data = await res.json();
      if (data.protocol) {
        setWetLabProtocol(data.protocol);
      }
    } catch (e) {
      console.error('Failed to generate wet-lab protocol:', e);
    } finally {
      setIsGeneratingProtocol(false);
    }
  };

  // 5. Draft Manuscript
  const handleDraftManuscript = async () => {
    if (!selectedHypothesis) return;
    setIsDraftingManuscript(true);

    try {
      const res = await fetch('/api/research/manuscript/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesis: selectedHypothesis }),
      });
      const data = await res.json();
      if (data.draft) {
        setManuscriptDraft(data.draft);
        setActiveTab('manuscript');
      }
    } catch (e) {
      console.error('Failed to draft manuscript:', e);
    } finally {
      setIsDraftingManuscript(false);
    }
  };

  // 6. Schedule Research Review Session
  const handleScheduleReview = async () => {
    setIsScheduling(true);
    try {
      const targetDate = new Date(Date.now() + 86400000 * 5).toISOString();
      const res = await fetch('/api/research/schedule-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: targetDate }),
      });
      const data = await res.json();
      if (data.success) {
        setScheduledReviewSuccess(true);
        setTimeout(() => setScheduledReviewSuccess(false), 5000);
        fetchSourcesAndProfile();
      }
    } catch (e) {
      console.error('Failed to schedule review:', e);
    } finally {
      setIsScheduling(false);
    }
  };

  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      searchFilter === '' ||
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.abstract.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.clusterName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesSource = activeSourceFilter === 'all' || p.sourceType?.includes(activeSourceFilter);
    return matchesSearch && matchesSource;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <Microscope className="w-3.5 h-3.5" />
                MODULE 4
              </span>
              <span className="text-xs text-slate-400 font-mono">• Autonomous Literature Mining & Hypothesis Generation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Research Scientist
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Autonomous continuous literature surveillance across PubMed, arXiv, bioRxiv, and Nature. Hierarchical clustering, Louvain co-citation gap finding, ReAct hypothesis reasoning, and sandboxed code execution.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Ingested Papers</span>
              <p className="text-lg font-bold text-sky-400 font-mono">6,737</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Radar Clusters</span>
              <p className="text-lg font-bold text-indigo-400 font-mono">{clusters.length || 4}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Betweenness Gaps</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{gaps.length || 3}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Hypotheses</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{hypotheses.length}</p>
            </div>
          </div>
        </div>

        {/* Global Prompt Bar */}
        <div className="mt-5 pt-5 border-t border-slate-800 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter scientific frontier (e.g. Asynchronous STDP in neuromorphic chips, Microglia spatial transcriptomics)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-sans"
            />
          </div>
          <button
            onClick={() => handleGenerateReActHypothesis()}
            disabled={isGeneratingHypothesis}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shrink-0 cursor-pointer"
          >
            {isGeneratingHypothesis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGeneratingHypothesis ? 'Synthesizing ReAct Chain...' : 'Synthesize Falsifiable Hypothesis'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto scrollbar-none gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'radar'
              ? 'bg-sky-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Research Radar & Clusters</span>
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'gaps'
              ? 'bg-sky-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Gap Finder (Co-Citation)</span>
          {gaps.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-bold rounded-full">
              {gaps.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('react_hypothesis')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'react_hypothesis'
              ? 'bg-sky-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>ReAct Hypothesis Studio</span>
          <span className="px-1.5 py-0.2 bg-sky-950 border border-sky-700 text-sky-300 text-[10px] font-bold rounded-full">
            {hypotheses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('experiments')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'experiments'
              ? 'bg-sky-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Code & Lab Protocol Execution</span>
        </button>

        <button
          onClick={() => setActiveTab('manuscript')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'manuscript'
              ? 'bg-sky-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Manuscript Drafting & Journal Suggester</span>
        </button>

        <button
          onClick={() => setActiveTab('ingestion')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ingestion'
              ? 'bg-sky-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Literature Ingestion Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('profile_calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'profile_calendar'
              ? 'bg-sky-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Personal Graph & Review</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: RESEARCH RADAR & CLUSTERS
      ========================================================================= */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          {/* Top summary card */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                Hierarchical Clustering & 6-Month Velocity (Silhouette Score: 0.76)
              </h3>
              <p className="text-xs text-slate-400">
                Linkage clustering across text-embedding-3-large multi-vector representations (Title, Abstract, Full-Text chunks).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                +64.2% Growth Velocity in Neuro-AI & Spatial Biology
              </span>
            </div>
          </div>

          {/* Cluster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {clusters.map((cluster) => {
              const isSelected = selectedCluster?.id === cluster.id;
              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden space-y-4 ${
                    isSelected
                      ? 'bg-slate-900/90 border-sky-500 shadow-xl'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cluster.colorHex }}
                      />
                      <span className="font-bold text-sm text-slate-100">{cluster.name}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        cluster.growthTrajectory === 'explosive'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : cluster.growthTrajectory === 'emerging'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : cluster.growthTrajectory === 'declining'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {cluster.growthVelocity > 0 ? `+${cluster.growthVelocity}%` : `${cluster.growthVelocity}%`} Velocity
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{cluster.themeSummary}</p>

                  {/* Top 10 Keywords Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Top TF-IDF Keywords:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cluster.topKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 rounded text-[10px] font-mono"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quantitative Stats Bar */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{cluster.paperCount} Ingested Papers</span>
                    <span>Last 3 Mo: <strong className="text-slate-200">{cluster.papersLast3Months}</strong> (vs {cluster.papersPreceding6Months})</span>
                    <span className="text-sky-400 font-bold">Silhouette: {cluster.silhouetteScore}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Selected Cluster View */}
          {selectedCluster && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 font-mono">SELECTED RESEARCH RADAR CLUSTER</span>
                  <h4 className="text-base font-bold text-white mt-0.5">{selectedCluster.name}</h4>
                </div>
                <button
                  onClick={() => handleGenerateReActHypothesis(selectedCluster.name)}
                  disabled={isGeneratingHypothesis}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize Hypothesis for this Cluster</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Sub-Themes Identified</span>
                  <ul className="space-y-1 text-slate-300">
                    {selectedCluster.subThemes.map((st, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-sky-400" />
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Trend Velocity Trajectory</span>
                  <p className="text-slate-300">
                    Classified as <strong className="text-emerald-400 uppercase">{selectedCluster.growthTrajectory}</strong> with a {selectedCluster.growthVelocity}% acceleration in publication rate.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Recommended Investigation Stack</span>
                  <p className="text-slate-300">
                    PyTorch 2.5 JAX Kernels • Scanpy Single-Cell Spatial • AMD Xilinx FPGA Verilog Emulation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: GAP FINDER & CO-CITATION NETWORK
      ========================================================================= */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4 text-amber-400" />
                Louvain Co-Citation Community Detection & High Betweenness Centrality
              </h3>
              <p className="text-xs text-slate-400">
                Identifies nodes bridging disparate clusters that have high betweenness centrality but low citation counts (unexploited frontiers).
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono font-bold">
              {gaps.length} High-Impact Gaps Extracted
            </span>
          </div>

          <div className="space-y-4">
            {gaps.map((gap) => (
              <div
                key={gap.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 relative overflow-hidden shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                      Betweenness Centrality: {Math.round(gap.betweennessCentrality * 100)}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Citations: {gap.citationCount} (Low Competition)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    Confidence: {Math.round(gap.confidenceScore * 100)}%
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-100">{gap.title}</h4>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                    <span className="text-indigo-400">{gap.sourceClusterName}</span>
                    <span>⟷</span>
                    <span className="text-sky-400">{gap.targetClusterName}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-slate-200">Structural Rationale: </strong>
                    {gap.rationale}
                  </p>
                  <p className="text-sky-300 font-mono">
                    <strong className="text-white">Predicted Gap Hypothesis: </strong>
                    {gap.suggestedGapHypothesis}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleGenerateReActHypothesis(gap.title)}
                    disabled={isGeneratingHypothesis}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-sky-600 hover:from-amber-500 hover:to-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Initiate ReAct Exploration on this Gap</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ReAct HYPOTHESIS STUDIO
      ========================================================================= */}
      {activeTab === 'react_hypothesis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left list of Hypotheses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400" />
                Hypotheses ({hypotheses.length})
              </h3>
            </div>

            <div className="space-y-3">
              {hypotheses.map((h) => {
                const isSelected = selectedHypothesis?.id === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHypothesis(h)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 border-sky-500 shadow-md'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                        Score: {Math.round(h.confidenceScore * 100)}%
                      </span>
                      <span className="capitalize text-slate-400">{h.status}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-100 line-clamp-2">{h.title}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{h.rationale}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Selected Hypothesis & ReAct Trace Details */}
          {selectedHypothesis ? (
            <div className="lg:col-span-2 space-y-5">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold">
                        {selectedHypothesis.domain || 'Neuro-AI'}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        Falsifiable • Rigor Score: {Math.round(selectedHypothesis.confidenceScore * 100)}%
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white">{selectedHypothesis.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('experiments');
                        handleExecuteComputationalAnalysis();
                      }}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Execute Sandbox</span>
                    </button>
                    <button
                      onClick={handleDraftManuscript}
                      disabled={isDraftingManuscript}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isDraftingManuscript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>Draft Paper</span>
                    </button>
                  </div>
                </div>

                {/* Structured Variables Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Independent Variable:</span>
                    <p className="text-slate-200">{selectedHypothesis.independentVariable}</p>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Dependent Variable:</span>
                    <p className="text-slate-200">{selectedHypothesis.dependentVariable}</p>
                  </div>
                </div>

                {/* Controls & Predicted Outcome */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Control Baselines & Conditions:</span>
                  <ul className="space-y-1 text-slate-300">
                    {(selectedHypothesis.controlConditions || [
                      'Standard Backpropagation through Time (BPTT)',
                      'Untrained random synaptic baseline',
                    ]).map((ctrl, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{ctrl}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-sky-400 uppercase font-bold">Predicted Outcome:</span>
                    <p className="text-slate-200 mt-0.5">{selectedHypothesis.predictedOutcome || selectedHypothesis.rationale}</p>
                  </div>
                </div>

                {/* ReAct Reasoning Chain Trace */}
                {selectedHypothesis.reactReasoningChain && selectedHypothesis.reactReasoningChain.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      Autonomous ReAct (Reasoning and Acting) Trace
                    </span>

                    <div className="space-y-2.5 font-mono text-xs">
                      {selectedHypothesis.reactReasoningChain.map((step) => (
                        <div
                          key={step.stepNumber}
                          className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="text-sky-400 font-bold">STEP #{step.stepNumber}</span>
                            <span className="text-slate-500">Action: {step.action}</span>
                          </div>
                          <p className="text-slate-300"><strong className="text-indigo-300">Thought:</strong> {step.thought}</p>
                          <p className="text-emerald-400 text-[11px]"><strong className="text-emerald-300">Observation:</strong> {step.observation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 p-12 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <Zap className="w-10 h-10 text-slate-600" />
              <p className="text-sm text-slate-400">Select or generate a hypothesis from the panel to inspect reasoning.</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: CODE & EXPERIMENTAL EXECUTION
      ========================================================================= */}
      {activeTab === 'experiments' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-sky-400" />
                Experimental Design & Sandboxed Execution Suite
              </h3>
              <p className="text-xs text-slate-400">
                DeepSeek-Coder-V2 / Gemini Python stack generator with scanpy/scikit-learn and wet-lab assay protocols.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExecuteComputationalAnalysis}
                disabled={isExecutingAnalysis}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {isExecutingAnalysis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isExecutingAnalysis ? 'Executing Python Sandbox...' : 'Run Computational Sandbox'}</span>
              </button>

              <button
                onClick={handleGenerateWetLabProtocol}
                disabled={isGeneratingProtocol}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                {isGeneratingProtocol ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Microscope className="w-3.5 h-3.5" />}
                <span>Generate Wet-Lab Protocol</span>
              </button>
            </div>
          </div>

          {/* Computational Execution Box */}
          {computationalAnalysis && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Execution: SUCCESS ({computationalAnalysis.executionTimeMs}ms)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Stack: {computationalAnalysis.stack.join(', ')}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Dataset: <span className="text-sky-400">{computationalAnalysis.datasetUsed.name}</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(computationalAnalysis.metrics).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block truncate">{key}</span>
                    <p className="text-sm font-bold text-sky-400 font-mono">{String(val)}</p>
                  </div>
                ))}
              </div>

              {/* Findings Summary */}
              <div className="p-4 bg-sky-950/30 border border-sky-900/50 rounded-xl space-y-1 text-xs">
                <span className="font-mono text-sky-300 uppercase font-bold">LLM Synthesis of Findings:</span>
                <p className="text-slate-200 leading-relaxed">{computationalAnalysis.findingsSummary}</p>
              </div>

              {/* Generated Code Display */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Executed DeepSeek-Coder Python Kernel:</span>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72 leading-relaxed">
                  {computationalAnalysis.generatedCode}
                </pre>
              </div>
            </div>
          )}

          {/* Wet-Lab Protocol Box */}
          {wetLabProtocol && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-mono uppercase">Wet-Lab Experimental Protocol</span>
                  <h4 className="text-base font-bold text-white">{wetLabProtocol.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400 font-bold">{wetLabProtocol.estimatedCost}</span>
                  <p className="text-[10px] text-slate-400 font-mono">Turnaround: {wetLabProtocol.turnaroundDays} Days</p>
                </div>
              </div>

              {/* Reagents list */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase">Required Reagents & Catalog Estimates:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {wetLabProtocol.reagents.map((r, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{r.name}</span>
                        <span className="text-emerald-400 font-mono text-[11px]">{r.unitPriceEstimate}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Supplier: {r.supplier} ({r.catalogId})</span>
                        <span>Qty: {r.requiredQty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase">Step-by-Step Procedure:</span>
                <div className="space-y-2">
                  {wetLabProtocol.stepByStepProtocol.map((step) => (
                    <div key={step.stepNumber} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400">Step {step.stepNumber}: {step.title}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{step.duration}</span>
                      </div>
                      <p className="text-slate-300">{step.instructions}</p>
                      <p className="text-amber-300 text-[11px]"><strong className="text-amber-400">Critical Control:</strong> {step.criticalControls}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: MANUSCRIPT DRAFTING & JOURNAL FINDER
      ========================================================================= */}
      {activeTab === 'manuscript' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Journal Manuscript Drafting & Elsevier / Nature Target Recommender
              </h3>
              <p className="text-xs text-slate-400">
                Populates methods from executed code and results from experimental metrics. Exports LaTeX sources.
              </p>
            </div>

            <button
              onClick={handleDraftManuscript}
              disabled={isDraftingManuscript}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {isDraftingManuscript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isDraftingManuscript ? 'Synthesizing Journal Article...' : 'Re-Draft Full Manuscript'}</span>
            </button>
          </div>

          {manuscriptDraft ? (
            <div className="space-y-6">
              {/* Journal Targets Recommender */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Target Journal Recommender (Journal Finder API Matches)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {manuscriptDraft.targetJournalRecommendations.map((j, i) => (
                    <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100">{j.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                          {j.matchScore}% Match
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Impact Factor: <strong className="text-sky-400">{j.impactFactor}</strong></span>
                        <span>Acceptance: {j.acceptanceRate}%</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{j.scopeAlignmentRationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manuscript Section Tabs */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex gap-2">
                    {(['abstract', 'intro', 'methods', 'results', 'discussion', 'latex'] as const).map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setManuscriptSectionTab(sec)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                          manuscriptSectionTab === sec
                            ? 'bg-sky-600 text-white font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>

                  <a
                    href={`data:text/plain;charset=utf-8,${encodeURIComponent(manuscriptDraft.latexSource)}`}
                    download="manuscript_submission.tex"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .tex</span>
                  </a>
                </div>

                {/* Section Content */}
                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                  {manuscriptSectionTab === 'abstract' && (
                    <div className="space-y-2 text-xs">
                      <h4 className="font-bold text-slate-100 text-sm">{manuscriptDraft.title}</h4>
                      <p className="text-slate-400 text-[11px]">Authors: {manuscriptDraft.authors.join(', ')}</p>
                      <p className="text-slate-200 leading-relaxed">{manuscriptDraft.abstract}</p>
                    </div>
                  )}

                  {manuscriptSectionTab === 'intro' && (
                    <div className="space-y-2 text-xs">
                      <h5 className="font-bold text-slate-200 uppercase font-mono">1. Introduction</h5>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">{manuscriptDraft.introduction}</p>
                    </div>
                  )}

                  {manuscriptSectionTab === 'methods' && (
                    <div className="space-y-2 text-xs">
                      <h5 className="font-bold text-slate-200 uppercase font-mono">2. Methods and Mathematical Formulation</h5>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">{manuscriptDraft.methods}</p>
                    </div>
                  )}

                  {manuscriptSectionTab === 'results' && (
                    <div className="space-y-2 text-xs">
                      <h5 className="font-bold text-slate-200 uppercase font-mono">3. Results and Hardware Benchmarks</h5>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">{manuscriptDraft.results}</p>
                    </div>
                  )}

                  {manuscriptSectionTab === 'discussion' && (
                    <div className="space-y-2 text-xs">
                      <h5 className="font-bold text-slate-200 uppercase font-mono">4. Discussion</h5>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">{manuscriptDraft.discussion}</p>
                    </div>
                  )}

                  {manuscriptSectionTab === 'latex' && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-200 uppercase font-mono text-xs">Typeset LaTeX Document Source:</h5>
                      <pre className="p-4 bg-slate-900 rounded-lg text-[11px] font-mono text-sky-300 overflow-x-auto max-h-96">
                        {manuscriptDraft.latexSource}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-600" />
              <p className="text-sm text-slate-400">Click "Re-Draft Full Manuscript" to synthesize a complete journal publication draft.</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 6: LITERATURE INGESTION PIPELINE
      ========================================================================= */}
      {activeTab === 'ingestion' && (
        <div className="space-y-6">
          {/* Polling Sources Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((src) => {
              const isPolling = isPollingSource === src.id;
              return (
                <div key={src.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{src.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase">
                      {src.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    <p>Frequency: <strong className="text-slate-200">{src.pollingFrequency}</strong></p>
                    <p>Ingested: <strong className="text-sky-400">{src.papersIngested} Papers</strong></p>
                    <p>Rate Limit: <strong className="text-emerald-400">{src.rateLimitRemaining} reqs left</strong></p>
                  </div>

                  <button
                    onClick={() => handlePollSource(src.id)}
                    disabled={isPolling}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isPolling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>{isPolling ? 'Polling API & Chunking...' : 'Poll Source Now'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Ingested Papers Stream */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Ingested Literature Stream ({filteredPapers.length})
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter papers by title, abstract, or author..."
                  className="pl-8 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredPapers.map((paper) => (
                <div key={paper.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-indigo-400 font-bold">{paper.venue}</span>
                    <span className="text-slate-500">DOI: {paper.doi}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">{paper.title}</h4>
                  <p className="text-slate-400 text-[11px]">Authors: {paper.authors.join(', ')}</p>
                  <p className="text-slate-300 leading-relaxed">{paper.abstract}</p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Cluster: <strong className="text-sky-400">{paper.clusterName}</strong></span>
                    <span className="text-emerald-400 font-bold">{paper.citations} Citations ({paper.growthRate})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: PERSONAL GRAPH & CALENDAR REVIEW
      ========================================================================= */}
      {activeTab === 'profile_calendar' && profile && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Researcher Profile Card */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Researcher Knowledge Graph Profile</span>
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono">
                  Principal Investigator
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{profile.researcherName}</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Primary Research Interests:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {profile.primaryInterests.map((interest, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px]">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Methodologies & Analysis Stacks:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {profile.knownMethodologies.map((m, i) => (
                      <span key={i} className="px-2.5 py-1 bg-sky-950/50 border border-sky-900/60 rounded text-sky-300 text-[11px] font-mono">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Collaborators Complementarity */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <span className="text-xs font-mono text-slate-400 uppercase">Co-Authors & Complementary Expertise</span>
              <div className="space-y-2.5">
                {profile.collaborators.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-100">{c.name}</strong>
                      <span className="text-[10px] font-mono text-slate-400">{c.coAuthoredPapersCount} Co-authored</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{c.institution}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {c.complementarySkills.map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-indigo-950 text-indigo-300 rounded text-[10px] font-mono">
                          +{s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Review Session Scheduler */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">Weekly Literature Digest & Review Sync</span>
                <h4 className="text-base font-bold text-white mt-0.5">Schedule Calendar Intelligence Review</h4>
              </div>

              <button
                onClick={handleScheduleReview}
                disabled={isScheduling}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                <span>{isScheduling ? 'Scheduling...' : 'Schedule Weekly Literature Review Session'}</span>
              </button>
            </div>

            {scheduledReviewSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Successfully added "Weekly Literature Digest & ReAct Hypothesis Review" to Calendar Intelligence!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
