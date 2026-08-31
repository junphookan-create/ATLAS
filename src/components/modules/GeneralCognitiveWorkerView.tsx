import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Loader2,
  Terminal,
  Activity,
  Layers,
  Cpu,
  Zap,
  Play,
  CheckCircle2,
  Radio,
  Eye,
  FileText,
  Volume2,
  Database,
  Search,
  Network,
  Code2,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Users,
  Presentation,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Sliders,
  Award,
  ChevronRight,
  GitBranch,
  KeyRound,
  DollarSign,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import {
  GCWState,
  GCWChunkType,
  MemoryChunk,
  SensoryEvent,
  CounterfactualSimulation,
} from '../../types';

interface GeneralCognitiveWorkerViewProps {
  gcwState: GCWState;
  onUpdateState: (newState: GCWState) => void;
}

export const GeneralCognitiveWorkerView: React.FC<GeneralCognitiveWorkerViewProps> = ({
  gcwState,
  onUpdateState,
}) => {
  const [activeTab, setActiveTab] = useState<
    'workspace' | 'sensory' | 'ltm' | 'reasoning' | 'cofounder' | 'governance'
  >('workspace');

  const [taskPrompt, setTaskPrompt] = useState(
    'Synthesize NSF Career Grant proposal section 3 and integrate Stanford motor cortex dataset'
  );
  const [executing, setExecuting] = useState(false);
  const [pruning, setPruning] = useState(false);

  // New Chunk Modal / Form
  const [showAddChunk, setShowAddChunk] = useState(false);
  const [newChunkType, setNewChunkType] = useState<GCWChunkType>('fact');
  const [newChunkContent, setNewChunkContent] = useState('');
  const [newChunkConfidence, setNewChunkConfidence] = useState(0.95);

  // Sensory Feeder
  const [sensoryInputType, setSensoryInputType] = useState<'text' | 'image' | 'audio' | 'structured'>('text');
  const [sensoryInputRaw, setSensoryInputRaw] = useState(
    'From: Prof. Katherine Chen <kchen@stanford.edu> - "We are transmitting the motor cortex spatial transcriptomics dataset for Section 3 Methodology."'
  );
  const [sensoryProcessing, setSensoryProcessing] = useState(false);

  // LTM Search
  const [ltmSearchQuery, setLtmSearchQuery] = useState('');
  const [ltmSearchResults, setLtmSearchResults] = useState<any>(null);
  const [ltmSearching, setLtmSearching] = useState(false);

  // Deliberation Simulation
  const [simulating, setSimulating] = useState(false);

  // Co-Founder Walkthrough
  const [advancingDay, setAdvancingDay] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // 1. Execute GCW Reasoning Cycle
  const handleRunGcwCycle = async () => {
    if (!taskPrompt.trim()) return;
    setExecuting(true);

    try {
      const res = await fetch('/api/gcw/cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: taskPrompt }),
      });

      const data = await res.json();
      if (res.ok && data.gcwState) {
        onUpdateState(data.gcwState);
      }
    } catch (err) {
      console.error('Failed to run GCW cycle:', err);
    } finally {
      setExecuting(false);
    }
  };

  // 2. Run Attention Controller Pruning & LTM Offload
  const handleRunAttentionController = async () => {
    setPruning(true);
    try {
      const res = await fetch('/api/gcw/attention/prune', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.state) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error('Failed to run attention controller:', err);
    } finally {
      setPruning(false);
    }
  };

  // 3. Add Custom Chunk to Working Memory
  const handleAddCustomChunk = async () => {
    if (!newChunkContent.trim()) return;
    try {
      const res = await fetch('/api/gcw/memory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newChunkType,
          content: newChunkContent,
          confidence: newChunkConfidence,
          source: 'Manual User Ingestion',
        }),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        onUpdateState(data.state);
        setNewChunkContent('');
        setShowAddChunk(false);
      }
    } catch (err) {
      console.error('Failed to add chunk:', err);
    }
  };

  // 4. Ingest Sensory Event
  const handleProcessSensory = async () => {
    if (!sensoryInputRaw.trim()) return;
    setSensoryProcessing(true);
    try {
      const res = await fetch('/api/gcw/sensory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputType: sensoryInputType,
          rawInput: sensoryInputRaw,
          source: `User Ingestion (${sensoryInputType.toUpperCase()})`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error('Failed to process sensory input:', err);
    } finally {
      setSensoryProcessing(false);
    }
  };

  // 5. Query Long-Term Memory
  const handleSearchLtm = async () => {
    if (!ltmSearchQuery.trim()) return;
    setLtmSearching(true);
    try {
      const res = await fetch('/api/gcw/ltm/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ltmSearchQuery }),
      });
      const data = await res.json();
      if (res.ok) {
        setLtmSearchResults(data);
      }
    } catch (err) {
      console.error('Failed to query LTM:', err);
    } finally {
      setLtmSearching(false);
    }
  };

  // 6. Simulate Counterfactuals
  const handleSimulateCounterfactuals = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/gcw/deliberation/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: gcwState.activeGoal }),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error('Failed to simulate counterfactuals:', err);
    } finally {
      setSimulating(false);
    }
  };

  // 7. Update Meta-Cognitive Settings
  const handleUpdateMetaCognitive = async (
    updates: {
      persona?: 'formal_professional' | 'startup_cofounder' | 'creative_strategist' | 'academic_researcher';
      operationalMode?: 'directed' | 'autonomous' | 'collaborative';
      modelTier?: 'Gemini 2.5 Flash (Fast/Cost-Optimized)' | 'Gemini 3.5 Pro (Deep Reasoning)' | 'Llama-3-Local';
    }
  ) => {
    try {
      const res = await fetch('/api/gcw/metacognitive/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error('Failed to update meta-cognitive state:', err);
    }
  };

  // 8. Advance Co-Founder Walkthrough Day
  const handleAdvanceCofounderDay = async () => {
    setAdvancingDay(true);
    try {
      const res = await fetch('/api/gcw/cofounder/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error('Failed to advance co-founder day:', err);
    } finally {
      setAdvancingDay(false);
    }
  };

  const meta = gcwState.metaCognitive || {
    persona: 'startup_cofounder',
    operationalMode: 'autonomous',
    resourceAllocation: { cpuUsagePct: 24, tokenBudgetRemaining: 842500, activeModelTier: 'Gemini 3.5 Pro (Deep Reasoning)', estimatedCostUsd: 1.42 },
    globalTaskQueue: [],
    selfEvaluation: { taskSuccessRatePct: 96.4, userSatisfactionScorePct: 98.2, efficiencyRatio: 4.8, totalCostSavingsPct: 41.5 },
    metaReasoning: { isStuck: false, confidenceScore: 0.94, strategyChangesCount: 1 },
  };

  const ltm = gcwState.longTermMemory || { episodic: [], semantic: [], procedural: [] };
  const cofounder = gcwState.cofounderWalkthrough;
  const governance = gcwState.governance;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & META-COGNITIVE OS CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold tracking-wider">
                CORE ARCHITECTURE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                • General Cognitive Worker (GCW) Operating System
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2.5">
              <Brain className="w-6 h-6 text-emerald-400" />
              <span>Universal Intellectual Meta-Agent (Atlas OS)</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Sense-Plan-Act-Reflect cognitive loop with multimodal perception, attention-controlled working memory, episodic analogical transfer, and self-regulating meta-reasoning.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 font-mono text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Active Phase</span>
              <p className="text-emerald-400 font-bold uppercase">{gcwState.currentPhase}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Confidence</span>
              <p className="text-indigo-300 font-bold">{Math.round((meta.metaReasoning?.confidenceScore || 0.9) * 100)}%</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Working Mem</span>
              <p className="text-amber-300 font-bold">{gcwState.workingMemory.length} / 50 Chunks</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Cost / Token</span>
              <p className="text-sky-300 font-bold">${meta.resourceAllocation?.estimatedCostUsd?.toFixed(2) || '1.42'}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Meta-Cognitive Control Switches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
          {/* Persona Selector */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Persona & Identity</span>
            </label>
            <select
              value={meta.persona}
              onChange={(e) => handleUpdateMetaCognitive({ persona: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="startup_cofounder">Startup Co-Founder (Aggressive MVP & GTM)</option>
              <option value="formal_professional">Formal / Professional (Corporate Rigor)</option>
              <option value="creative_strategist">Creative Strategist (Divergent Ideation)</option>
              <option value="academic_researcher">Academic Researcher (Peer-Review Rigor)</option>
            </select>
          </div>

          {/* Operational Mode Selector */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tri-Modal Operation Mode</span>
            </label>
            <select
              value={meta.operationalMode}
              onChange={(e) => handleUpdateMetaCognitive({ operationalMode: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="autonomous">Autonomous Mode (Proactive Goal-Driven)</option>
              <option value="directed">Directed Mode (Strict Step-by-Step)</option>
              <option value="collaborative">Collaborative Mode (3 Alternative Options Partner)</option>
            </select>
          </div>

          {/* Model Tier Selector */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Cognitive Engine Tier</span>
            </label>
            <select
              value={meta.resourceAllocation?.activeModelTier}
              onChange={(e) => handleUpdateMetaCognitive({ modelTier: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Gemini 3.5 Pro (Deep Reasoning)">Gemini 3.5 Pro (Deep Deliberative Reasoning)</option>
              <option value="Gemini 2.5 Flash (Fast/Cost-Optimized)">Gemini 2.5 Flash (Ultra-Low Latency)</option>
              <option value="Llama-3-Local">Llama-3 70B (Local Air-Gapped Fallback)</option>
            </select>
          </div>
        </div>

        {/* Global Task Execution Trigger */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            placeholder="Type any high-level strategic directive or cognitive objective for the GCW..."
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-sans shadow-inner"
          />
          <button
            onClick={handleRunGcwCycle}
            disabled={executing}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/50 shrink-0"
          >
            {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{executing ? 'Executing Cognitive Cycle...' : 'Execute GCW Cycle'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'workspace'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Active Conscious Workspace</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
            {gcwState.workingMemory.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sensory')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sensory'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Multimodal Sensory Gateway</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
            {gcwState.sensoryStream?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ltm')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ltm'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Long-Term Memory (Episodic/Semantic/Skills)</span>
        </button>

        <button
          onClick={() => setActiveTab('reasoning')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reasoning'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>HTN Planner & Counterfactuals</span>
        </button>

        <button
          onClick={() => setActiveTab('cofounder')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'cofounder'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Startup Co-Founder Walkthrough</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
            Day {cofounder?.currentDay || 4}/7
          </span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'governance'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Enterprise Governance & Observability</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE CONSCIOUS WORKSPACE (Working Memory & Sense-Plan-Act Loop) */}
      {/* ========================================================================= */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Working Memory 50-Chunk Redis Buffer */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
                    Working Memory Buffer (50 Chunks Max)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunAttentionController}
                    disabled={pruning}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <RotateCw className={`w-3 h-3 ${pruning ? 'animate-spin' : ''}`} />
                    <span>Prune & Offload to LTM</span>
                  </button>
                  <button
                    onClick={() => setShowAddChunk(!showAddChunk)}
                    className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[11px] font-mono rounded-lg transition-all"
                  >
                    + Add Chunk
                  </button>
                </div>
              </div>

              {/* Inline Add Chunk Drawer */}
              {showAddChunk && (
                <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                    <span className="font-bold">Inject Custom Chunk into Working Memory</span>
                    <button onClick={() => setShowAddChunk(false)} className="text-slate-500 hover:text-slate-300">
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono">Chunk Type</label>
                      <select
                        value={newChunkType}
                        onChange={(e) => setNewChunkType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
                      >
                        <option value="fact">Fact</option>
                        <option value="goal">Goal</option>
                        <option value="hypothesis">Hypothesis</option>
                        <option value="question">Question</option>
                        <option value="plan">Plan</option>
                        <option value="constraint">Constraint</option>
                        <option value="observation">Observation</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono">Confidence ({Math.round(newChunkConfidence * 100)}%)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.0"
                        step="0.05"
                        value={newChunkConfidence}
                        onChange={(e) => setNewChunkConfidence(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newChunkContent}
                      onChange={(e) => setNewChunkContent(e.target.value)}
                      placeholder="Chunk proposition content..."
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                    />
                  </div>
                  <button
                    onClick={handleAddCustomChunk}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded transition-all"
                  >
                    Commit to Active Working Memory
                  </button>
                </div>
              )}

              {/* Chunks List */}
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                {gcwState.workingMemory.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono transition-all hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-bold text-[10px] uppercase">
                          {chunk.type}
                        </span>
                        <span className="text-[10px] text-slate-500">{chunk.source}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-slate-400">
                          Relevance: <strong className="text-indigo-400">{Math.round((chunk.relevance || 0.8) * 100)}%</strong>
                        </span>
                        <span className="text-slate-500">Conf: {Math.round(chunk.confidence * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-slate-200 font-sans leading-relaxed">{chunk.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Reasoning Scratchpad & Action Logs */}
            <div className="lg:col-span-5 space-y-6">
              {/* Live Sense-Plan-Act-Reflect Cycles */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <RotateCw className="w-4 h-4 text-emerald-400" />
                  <span>Sense-Plan-Act-Reflect Loop</span>
                </h3>

                <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
                  {(gcwState.sensePlanActCycles || []).map((cycle, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-500">
                        <span className="text-emerald-400 font-bold">Cycle #{cycle.cycleIndex}</span>
                        <span>{cycle.timestamp}</span>
                      </div>
                      <p className="text-slate-300 font-sans"><strong className="text-sky-400">Sense:</strong> {cycle.senseSummary}</p>
                      <p className="text-slate-300 font-sans"><strong className="text-amber-400">Action:</strong> {cycle.executedAction}</p>
                      <p className="text-slate-400 font-sans"><strong className="text-indigo-400">Reflect:</strong> {cycle.reflectionNotes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliberative Scratchpad */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>Chain-of-Thought Scratchpad</span>
                </h3>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 text-[11px] text-slate-300 leading-relaxed font-mono">
                  {gcwState.scratchpad.map((note, i) => (
                    <p key={i} className="text-slate-300 font-mono">{note}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MULTIMODAL SENSORY GATEWAY */}
      {/* ========================================================================= */}
      {activeTab === 'sensory' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-sm font-mono font-bold text-slate-100 uppercase flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Multimodal Sensory Layer (Perception & Salience Attention Filter)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Extracts structured entities, relationships, OCR/VLM text, and Whisper transcriptions with dynamic salience scoring.
                </p>
              </div>

              {/* Modality Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => {
                    setSensoryInputType('text');
                    setSensoryInputRaw('From: Prof. Katherine Chen <kchen@stanford.edu> - "We are transmitting the motor cortex spatial transcriptomics data package for Section 3."');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    sensoryInputType === 'text' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Text (NER)</span>
                </button>
                <button
                  onClick={() => {
                    setSensoryInputType('image');
                    setSensoryInputRaw('[Prophesee Metavision DVS Sensor Capture: 120,000 temporal event spikes/sec raster plot]');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    sensoryInputType === 'image' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Vision (VLM+OCR)</span>
                </button>
                <button
                  onClick={() => {
                    setSensoryInputType('audio');
                    setSensoryInputRaw('[Whisper Diarized Stream: Speaker 1 (Dr. Jun): "Let us verify aim 2." Speaker 2 (Prof. Chen): "Agreed."]');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    sensoryInputType === 'audio' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Audio (Whisper)</span>
                </button>
                <button
                  onClick={() => {
                    setSensoryInputType('structured');
                    setSensoryInputRaw('{"grantId": "NSF-2026-99", "budgetCap": 1250000, "indirectRate": 0.525, "deadline": "2026-08-30"}');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    sensoryInputType === 'structured' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Database className="w-3 h-3" />
                  <span>Schema (JSON)</span>
                </button>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-3">
              <textarea
                value={sensoryInputRaw}
                onChange={(e) => setSensoryInputRaw(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                placeholder="Enter raw sensory observation or multi-modal signal..."
              />

              <div className="flex justify-end">
                <button
                  onClick={handleProcessSensory}
                  disabled={sensoryProcessing}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                  {sensoryProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Ingest & Run Salience Filter</span>
                </button>
              </div>
            </div>

            {/* Sensory Stream History */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
                Perceived Sensory Events ({gcwState.sensoryStream?.length || 0})
              </h3>

              <div className="space-y-3">
                {(gcwState.sensoryStream || []).map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold text-[10px] uppercase">
                          {event.inputType}
                        </span>
                        <span className="text-slate-400">{event.source}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">{event.timestamp}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold text-[10px]">
                          Salience: {Math.round((event.salienceScore || 0.85) * 100)}%
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-200 font-sans text-xs">{event.rawInput}</p>

                    {/* Entities Chips */}
                    {event.entities && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {event.entities.people?.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px]">
                            👤 {p}
                          </span>
                        ))}
                        {event.entities.organizations?.map((o, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px]">
                            🏢 {o}
                          </span>
                        ))}
                        {event.entities.concepts?.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px]">
                            💡 {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {event.salienceSummary && (
                      <div className="p-2 rounded bg-slate-900/80 text-[11px] text-slate-300 font-sans border-l-2 border-sky-400">
                        <strong>Salience Summary:</strong> {event.salienceSummary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LONG-TERM MEMORY (Episodic, Semantic, Procedural Skills) */}
      {/* ========================================================================= */}
      {activeTab === 'ltm' && (
        <div className="space-y-6">
          {/* LTM Vector Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={ltmSearchQuery}
                onChange={(e) => setLtmSearchQuery(e.target.value)}
                placeholder="Search Episodic memories, Semantic graph triples, or Procedural skills..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSearchLtm}
                disabled={ltmSearching}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
              >
                {ltmSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Vector Query</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Episodic Memory (Analogical Transfer) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Episodic Memory ({ltm.episodic.length})</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Vector Embeddings</span>
              </div>

              <div className="space-y-3">
                {ltm.episodic.map((ep) => (
                  <div key={ep.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-purple-300 font-bold">{ep.taskTitle}</span>
                      <span className="text-emerald-400 font-bold">Score: {Math.round(ep.successScore * 100)}%</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans">{ep.objective}</p>
                    <div className="p-2 rounded bg-slate-900 text-[10px] font-mono text-slate-400">
                      <strong>Outcome:</strong> {ep.outcome}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 truncate">
                      Embedding: {ep.vectorEmbeddingSnippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Semantic Knowledge Triples */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-sky-400 uppercase flex items-center gap-1.5">
                  <Network className="w-4 h-4" />
                  <span>Semantic Graph ({ltm.semantic.length})</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Neo4j Triples</span>
              </div>

              <div className="space-y-2.5">
                {ltm.semantic.map((sem) => (
                  <div key={sem.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-sky-300 font-bold">{sem.subject}</span>
                      <span className="text-slate-500">Conf: {Math.round(sem.confidence * 100)}%</span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-bold">
                      ↳ {sem.predicate} ↳ <span className="text-slate-200 font-normal">{sem.object}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 block">Source: {sem.source}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Procedural Skills Library */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  <span>Procedural Skills ({ltm.procedural.length})</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Python Code Lib</span>
              </div>

              <div className="space-y-3">
                {ltm.procedural.map((sk) => (
                  <div key={sk.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-300 font-bold">{sk.name}</span>
                      <span className="text-[10px] text-slate-500">v{sk.version}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans">{sk.description}</p>
                    <pre className="p-2 rounded bg-slate-900 text-[10px] text-emerald-400 font-mono overflow-x-auto">
                      {sk.pythonRoutine}
                    </pre>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Invocations: {sk.invocationCount}</span>
                      <span className="text-emerald-400">Success: {Math.round(sk.avgSuccessRate * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DELIBERATIVE REASONING & HTN PLANNER */}
      {/* ========================================================================= */}
      {activeTab === 'reasoning' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: HTN Method Library */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  <span>Hierarchical Task Networks (HTN Methods)</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">{gcwState.htnMethods?.length || 0} Methods</span>
              </div>

              <div className="space-y-4">
                {(gcwState.htnMethods || []).map((method) => (
                  <div key={method.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-300 font-bold">{method.taskName}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        Validation: {Math.round(method.validationScore * 100)}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase">Preconditions:</span>
                      <div className="flex flex-wrap gap-1">
                        {method.preconditions.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px]">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase">Recursive Decomposition:</span>
                      <div className="space-y-1 pl-2 border-l border-indigo-500/30">
                        {method.subtasks.map((task, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <span className="text-indigo-400 font-bold">{i + 1}.</span>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Counterfactual Simulation */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Counterfactual Simulation Engine</span>
                </h3>
                <button
                  onClick={handleSimulateCounterfactuals}
                  disabled={simulating}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-mono rounded-lg transition-all flex items-center gap-1.5"
                >
                  {simulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  <span>Simulate 3 Trajectories</span>
                </button>
              </div>

              <div className="space-y-3">
                {(gcwState.counterfactuals || []).map((cf) => (
                  <div
                    key={cf.id}
                    className={`p-4 rounded-xl border text-xs font-mono space-y-2.5 transition-all ${
                      cf.selected
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${cf.selected ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {cf.candidateAction}
                      </span>
                      {cf.selected && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          ★ OPTIMAL TRAJECTORY
                        </span>
                      )}
                    </div>

                    <p className="text-slate-300 font-sans text-xs leading-relaxed">{cf.simulatedOutcome}</p>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono pt-1">
                      <div className="p-2 rounded bg-slate-900/90 flex justify-between">
                        <span className="text-slate-400">Risk Score:</span>
                        <strong className={cf.riskScore < 0.2 ? 'text-emerald-400' : 'text-rose-400'}>
                          {Math.round(cf.riskScore * 100)}%
                        </strong>
                      </div>
                      <div className="p-2 rounded bg-slate-900/90 flex justify-between">
                        <span className="text-slate-400">Projected Reward:</span>
                        <strong className="text-emerald-400">{Math.round(cf.projectedReward * 100)}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: STARTUP CO-FOUNDER WALKTHROUGH (Indian Colleges Textbook Rental) */}
      {/* ========================================================================= */}
      {activeTab === 'cofounder' && cofounder && (
        <div className="space-y-6">
          {/* Header Banner & Day Progression */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  OPERATIONAL SCENARIO WALKTHROUGH
                </span>
                <h2 className="text-lg font-black text-slate-100 mt-1">
                  {cofounder.scenarioTitle}
                </h2>
                <p className="text-xs text-slate-400">
                  Simulating 3 concurrent autonomous R&D streams (Market Analysis, Pitch Deck, and MVP Sandbox) with daily 9:00 AM standup synthesis.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-500 block text-[10px] uppercase">Progression</span>
                  <strong className="text-amber-400 text-sm">Day {cofounder.currentDay} of {cofounder.totalDays}</strong>
                </div>
                <button
                  onClick={handleAdvanceCofounderDay}
                  disabled={advancingDay}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg"
                >
                  {advancingDay ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>Advance to Next Day</span>
                </button>
              </div>
            </div>

            {/* Daily 9:00 AM Standup Report */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-[11px] text-amber-400 border-b border-slate-800 pb-2">
                <span className="font-bold uppercase flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  <span>9:00 AM Autonomous Co-Founder Standup</span>
                </span>
                <span className="text-slate-500">{cofounder.dailyStandup.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">Yesterday Accomplished:</span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside font-sans">
                    {cofounder.dailyStandup.yesterdayAccomplished.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="text-sky-400 font-bold uppercase text-[10px]">Planned Today:</span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside font-sans">
                    {cofounder.dailyStandup.plannedToday.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="text-rose-400 font-bold uppercase text-[10px]">Blockers / Risks:</span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside font-sans">
                    {cofounder.dailyStandup.blockers.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Concurrent Workstreams */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* STREAM 1: MARKET ANALYSIS & SIZING */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-sky-400 uppercase flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Stream 1: Market Intelligence</span>
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {cofounder.workstreams.marketAnalysis.progressPct}% Complete
                </span>
              </div>

              {/* TAM SAM SOM */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Market Sizing</span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-400">TAM:</span> <strong className="text-sky-300">{cofounder.workstreams.marketAnalysis.tamSamSom.tamUsd}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">SAM:</span> <strong className="text-sky-300">{cofounder.workstreams.marketAnalysis.tamSamSom.samUsd}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">SOM:</span> <strong className="text-emerald-400">{cofounder.workstreams.marketAnalysis.tamSamSom.somUsd}</strong></div>
                </div>
              </div>

              {/* Key Findings */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Key Empirical Findings:</span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside font-sans text-[11px]">
                  {cofounder.workstreams.marketAnalysis.keyFindings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* SWOT Summary */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-[11px] font-mono">
                <span className="text-[10px] text-slate-500 uppercase font-bold">SWOT Matrix</span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-1.5 rounded bg-emerald-950/40 text-emerald-300">
                    <strong>Strengths:</strong> {cofounder.workstreams.marketAnalysis.swotSummary.strengths[0]}
                  </div>
                  <div className="p-1.5 rounded bg-amber-950/40 text-amber-300">
                    <strong>Weakness:</strong> {cofounder.workstreams.marketAnalysis.swotSummary.weaknesses[0]}
                  </div>
                </div>
              </div>
            </div>

            {/* STREAM 2: 10-SLIDE PITCH DECK */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Presentation className="w-4 h-4" />
                  <span>Stream 2: 10-Slide VC Pitch Deck</span>
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {cofounder.workstreams.pitchDeck.progressPct}% Rendered
                </span>
              </div>

              {/* Slide Carousel Preview */}
              {cofounder.workstreams.pitchDeck.slides && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-[10px] text-amber-400">
                    <span className="font-bold">
                      Slide {cofounder.workstreams.pitchDeck.slides[activeSlideIndex]?.slideNumber} of {cofounder.workstreams.pitchDeck.totalSlides}
                    </span>
                    <span className="text-slate-500">
                      Visual: {cofounder.workstreams.pitchDeck.slides[activeSlideIndex]?.visualType}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">
                    {cofounder.workstreams.pitchDeck.slides[activeSlideIndex]?.title}
                  </h4>

                  <ul className="space-y-1.5 text-slate-300 font-sans text-xs list-disc list-inside">
                    {cofounder.workstreams.pitchDeck.slides[activeSlideIndex]?.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                      disabled={activeSlideIndex === 0}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[11px]"
                    >
                      ← Prev Slide
                    </button>
                    <button
                      onClick={() => setActiveSlideIndex(Math.min(cofounder.workstreams.pitchDeck.totalSlides - 1, activeSlideIndex + 1))}
                      disabled={activeSlideIndex === cofounder.workstreams.pitchDeck.totalSlides - 1}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[11px]"
                    >
                      Next Slide →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STREAM 3: MVP DEVELOPMENT & PERSONA EVALUATIONS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  <span>Stream 3: MVP Code & Personas</span>
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {cofounder.workstreams.mvpDevelopment.testSuiteStatus}
                </span>
              </div>

              {/* Stack Spec */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-[11px] font-mono">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Tech Architecture</span>
                <p className="text-slate-300 truncate"><strong>FE:</strong> {cofounder.workstreams.mvpDevelopment.techStack.frontend}</p>
                <p className="text-slate-300 truncate"><strong>BE:</strong> {cofounder.workstreams.mvpDevelopment.techStack.backend}</p>
                <p className="text-slate-300 truncate"><strong>DB:</strong> {cofounder.workstreams.mvpDevelopment.techStack.database}</p>
              </div>

              {/* Synthetic Persona Feedback */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Persona Simulation (WTP):</span>
                <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                  {cofounder.workstreams.mvpDevelopment.personaFeedback.map((p, i) => (
                    <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-[11px]">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-emerald-400 font-bold">{p.persona}</span>
                        <span className="text-amber-400">{'★'.repeat(p.rating)}</span>
                      </div>
                      <p className="text-slate-300 font-sans">{p.comment}</p>
                      <span className="text-[10px] font-mono text-sky-400 block">WTP: {p.willingnessToPay}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ENTERPRISE GOVERNANCE, SECURITY & OBSERVABILITY */}
      {/* ========================================================================= */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cryptographic SHA-256 Action Dispatcher Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200 uppercase flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>SHA-256 Hash-Chain Audit Log</span>
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {governance?.security?.chainIntegrity || 'Valid & Verified'}
                </span>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                {(gcwState.dispatcherLogs || []).map((log) => (
                  <div key={log.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold">{log.toolName}</span>
                      <span className="text-[10px] text-slate-500">{log.durationMs}ms</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{log.resultSummary}</p>
                    <div className="p-2 rounded bg-slate-900 text-[9px] text-slate-400 space-y-0.5 truncate">
                      <div><strong>SHA-256:</strong> {log.sha256Hash}</div>
                      <div><strong>Prev Hash:</strong> {log.prevHash}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OpenTelemetry Traces & Cost Governance */}
            <div className="space-y-6">
              {/* Cost Governance */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <h3 className="font-bold text-slate-200 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Cost Governance & Token Allocation</span>
                </h3>

                <div className="grid grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Daily Spend</span>
                    <p className="text-emerald-400 font-bold">${governance?.costManagement?.dailySpendUsd || '2.14'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Monthly Budget</span>
                    <p className="text-slate-200 font-bold">${governance?.costManagement?.monthlyBudgetUsd || '150.00'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Cache Hit Rate</span>
                    <p className="text-sky-400 font-bold">{governance?.costManagement?.queryCacheHitRatePct || 44.8}%</p>
                  </div>
                </div>
              </div>

              {/* OpenTelemetry Traces */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <h3 className="font-bold text-slate-200 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>OpenTelemetry Distributed Traces (Jaeger)</span>
                </h3>

                <div className="space-y-2">
                  {(governance?.observability?.openTelemetryTraces || []).map((tr, i) => (
                    <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-sky-300 font-bold">{tr.service}</span>
                        <span className="text-slate-400 block text-[10px]">↳ {tr.operation}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">{tr.durationMs}ms</span>
                        <span className="text-[9px] text-slate-500 block">Status: {tr.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

