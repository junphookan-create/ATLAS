import React, { useState, useEffect } from 'react';
import {
  Cpu,
  GitBranch,
  Zap,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Database,
  Search,
  Sliders,
  Settings,
  RefreshCw,
  Terminal,
  FileCode,
  PieChart,
  BarChart2,
  TrendingDown,
  Lock,
  Plus,
} from 'lucide-react';
import {
  ModelRegistryItem,
  ModelRoutingDecision,
  DagWorkflowDefinition,
  DagWorkflowExecution,
  CostBudgetEntity,
  ModelTelemetry,
  VectorCacheItem,
  RoutingTaskType,
} from '../../types';

interface AiResearchLabViewProps {
  onRequestApproval?: (summary: string, moduleName: string) => void;
}

export const AiResearchLabView: React.FC<AiResearchLabViewProps> = ({ onRequestApproval }) => {
  const [activeTab, setActiveTab] = useState<'router' | 'dags' | 'budgets' | 'telemetry' | 'registry'>('router');

  // Router State
  const [taskType, setTaskType] = useState<RoutingTaskType>('creative_writing');
  const [outputTokens, setOutputTokens] = useState<number>(1500);
  const [qualityLevel, setQualityLevel] = useState<number>(9);
  const [maxCost, setMaxCost] = useState<number>(0.05);
  const [maxLatency, setMaxLatency] = useState<number>(2000);
  const [localOnly, setLocalOnly] = useState<boolean>(false);
  const [promptSnippet, setPromptSnippet] = useState<string>('Synthesize high-impact NSF Grant abstract for Neuromorphic Edge Computing co-processor with milliwatt latency constraints.');
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [currentDecision, setCurrentDecision] = useState<ModelRoutingDecision | null>(null);
  const [routingHistory, setRoutingHistory] = useState<ModelRoutingDecision[]>([]);

  // DAG Workflow State
  const [workflows, setWorkflows] = useState<DagWorkflowDefinition[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('wf-article-synthesis');
  const [activeExecution, setActiveExecution] = useState<DagWorkflowExecution | null>(null);
  const [isRunningDag, setIsRunningDag] = useState<boolean>(false);

  // Budgets & Telemetry State
  const [models, setModels] = useState<ModelRegistryItem[]>([]);
  const [budgets, setBudgets] = useState<CostBudgetEntity[]>([]);
  const [telemetry, setTelemetry] = useState<ModelTelemetry[]>([]);
  const [vectorCache, setVectorCache] = useState<VectorCacheItem[]>([]);
  const [cacheSearchQuery, setCacheSearchQuery] = useState<string>('');
  const [cacheHitResult, setCacheHitResult] = useState<VectorCacheItem | null>(null);

  // New Model Register Modal
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [newModelName, setNewModelName] = useState<string>('');
  const [newModelProvider, setNewModelProvider] = useState<string>('Google');
  const [newModelCostIn, setNewModelCostIn] = useState<number>(0.0005);
  const [newModelCostOut, setNewModelCostOut] = useState<number>(0.002);
  const [newModelEndpoint, setNewModelEndpoint] = useState<string>('https://api.deepseek.com/v1/chat/completions');

  const fetchData = async () => {
    try {
      const [modelsRes, historyRes, wfRes, budRes, telemRes, cacheRes] = await Promise.all([
        fetch('/api/lab/models').then((r) => r.json()),
        fetch('/api/lab/routing-history').then((r) => r.json()),
        fetch('/api/lab/workflows').then((r) => r.json()),
        fetch('/api/lab/budgets').then((r) => r.json()),
        fetch('/api/lab/telemetry').then((r) => r.json()),
        fetch('/api/lab/vector-cache').then((r) => r.json()),
      ]);

      if (modelsRes.models) setModels(modelsRes.models);
      if (historyRes.history) {
        setRoutingHistory(historyRes.history);
        if (historyRes.history.length > 0 && !currentDecision) {
          setCurrentDecision(historyRes.history[0]);
        }
      }
      if (wfRes.workflows) setWorkflows(wfRes.workflows);
      if (wfRes.activeExecution) setActiveExecution(wfRes.activeExecution);
      if (budRes.budgets) setBudgets(budRes.budgets);
      if (telemRes.telemetry) setTelemetry(telemRes.telemetry);
      if (cacheRes.cache) setVectorCache(cacheRes.cache);
    } catch (err) {
      console.warn('Could not load AI Research Lab data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRouteRequest = async () => {
    setIsRouting(true);
    try {
      const res = await fetch('/api/lab/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          promptSnippet,
          requiredOutputTokens: outputTokens,
          desiredQualityLevel: qualityLevel,
          maxAcceptableCostUsd: maxCost,
          maxAllowableLatencyMs: maxLatency,
          enforcePrivacyLocalOnly: localOnly,
        }),
      });
      const data = await res.json();
      if (data.decision) {
        setCurrentDecision(data.decision);
        setRoutingHistory((prev) => [data.decision, ...prev.slice(0, 19)]);
      }
    } catch (err) {
      console.error('Routing failed:', err);
    } finally {
      setIsRouting(false);
    }
  };

  const handleExecuteDag = async () => {
    setIsRunningDag(true);
    try {
      const res = await fetch('/api/lab/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: selectedWorkflowId }),
      });
      const data = await res.json();
      if (data.execution) {
        setActiveExecution(data.execution);
      }
    } catch (err) {
      console.error('DAG execution failed:', err);
    } finally {
      setIsRunningDag(false);
    }
  };

  const handleSearchVectorCache = async () => {
    if (!cacheSearchQuery.trim()) return;
    try {
      const res = await fetch('/api/lab/vector-cache/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cacheSearchQuery }),
      });
      const data = await res.json();
      setCacheHitResult(data.match || null);
    } catch (err) {
      console.error('Vector cache query failed:', err);
    }
  };

  const handleRegisterModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;
    try {
      const res = await fetch('/api/lab/models/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newModelName,
          provider: newModelProvider,
          costPer1kInputTokens: newModelCostIn,
          costPer1kOutputTokens: newModelCostOut,
          endpointUrl: newModelEndpoint,
          tier: 'Reasoning',
          capabilities: ['creative_writing', 'code_generation', 'complex_reasoning'],
        }),
      });
      const data = await res.json();
      if (data.model) {
        setModels((prev) => [...prev, data.model]);
        setShowRegisterModal(false);
        setNewModelName('');
      }
    } catch (err) {
      console.error('Register model failed:', err);
    }
  };

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-semibold tracking-wide">
              MODULE 12
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Reinforcement-Learned Decision Router & DAG Orchestrator
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight flex items-center gap-2.5">
            AI Research Lab
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-normal font-mono border border-slate-700">
              v3.4 Multi-Model
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Model
          </button>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
        {[
          { id: 'router', label: 'Dynamic Model Router', icon: Zap },
          { id: 'dags', label: 'Multi-Model DAG Workflows', icon: GitBranch },
          { id: 'budgets', label: 'Cost & Budget Manager', icon: DollarSign },
          { id: 'telemetry', label: 'Performance & Vector Cache', icon: Activity },
          { id: 'registry', label: 'Model Registry', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DYNAMIC MODEL ROUTER */}
      {activeTab === 'router' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Router Parameter Simulation Form */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Router Request Parameters
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                RL Policy: Active
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Task Archetype</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as RoutingTaskType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="creative_writing">creative_writing (Long-Form Prose & Proposals)</option>
                  <option value="code_generation">code_generation (Algorithms & System Code)</option>
                  <option value="complex_reasoning">complex_reasoning (Mathematical Deduction)</option>
                  <option value="factual_research">factual_research (Scientific Literature Scan)</option>
                  <option value="summarisation">summarisation (High-Speed Extraction)</option>
                  <option value="multimodal_vision">multimodal_vision (DOM & Layout Analysis)</option>
                  <option value="translation">translation (Multilingual Academic)</option>
                  <option value="sentiment_analysis">sentiment_analysis (Correspondence Sentiment)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Prompt / Context Snippet</label>
                <textarea
                  value={promptSnippet}
                  onChange={(e) => setPromptSnippet(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Quality Level</span>
                    <span className="text-indigo-400 font-mono font-bold">{qualityLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={qualityLevel}
                    onChange={(e) => setQualityLevel(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Output Tokens</span>
                    <span className="text-indigo-400 font-mono font-bold">{outputTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="4000"
                    step="100"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Max Cost ($ USD)</label>
                  <input
                    type="number"
                    step="0.005"
                    min="0.001"
                    max="1.0"
                    value={maxCost}
                    onChange={(e) => setMaxCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Max Latency (ms)</label>
                  <input
                    type="number"
                    step="100"
                    min="200"
                    max="10000"
                    value={maxLatency}
                    onChange={(e) => setMaxLatency(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-semibold text-slate-200">Enforce Airgapped Privacy</span>
                    <p className="text-[10px] text-slate-500">Route exclusively to local edge models (Llama 3.1 70B)</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localOnly}
                  onChange={(e) => setLocalOnly(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <button
                onClick={handleRouteRequest}
                disabled={isRouting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRouting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Evaluating Decision Tree...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Simulate Decision Routing
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Decision Tree Breakdown & Selected Model */}
          <div className="lg:col-span-7 space-y-6">
            {currentDecision ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">DECISION OUTCOME</span>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      {currentDecision.selectedModel.name}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                        {currentDecision.selectedModel.tier}
                      </span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono">RL REWARD SCORE</span>
                    <p className="text-sm font-bold text-emerald-400 font-mono">
                      +{(currentDecision.rlRewardScore || 0.95).toFixed(2)} / 1.00
                    </p>
                  </div>
                </div>

                {/* Rationale & Decision Tree Trace */}
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Decision Tree Evaluation Path
                    </span>
                    <div className="space-y-1.5 font-mono text-xs text-slate-400">
                      {currentDecision.decisionTreePath.map((path, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-300">
                          <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                          <span>{path}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl">
                    <strong className="text-indigo-300">Synthesized Rationale: </strong>
                    {currentDecision.decisionRationale}
                  </p>
                </div>

                {/* Candidate Scoring Matrix */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Candidate Model Evaluation Matrix
                  </h4>
                  <div className="space-y-2">
                    {currentDecision.candidateScores.map((cand) => (
                      <div
                        key={cand.modelId}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          cand.modelId === currentDecision.selectedModel.id
                            ? 'bg-indigo-950/40 border-indigo-600/60 text-slate-100'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">
                              #{cand.rank} {cand.modelName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {cand.provider}
                            </span>
                            {!cand.isEligible && (
                              <span className="text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900">
                                {cand.exclusionReason}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-[11px] font-mono text-slate-400">
                            <span>Quality: {cand.performanceSubScore}/40</span>
                            <span>Cost Eff: {cand.costEfficiencySubScore}/30</span>
                            <span>Latency: {cand.latencySubScore}/20</span>
                            {cand.loadPenalty > 0 && (
                              <span className="text-amber-400">Load Pen: -{cand.loadPenalty}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                          <span className="text-[10px] text-slate-500 uppercase">Composite Score</span>
                          <span className="text-sm font-bold font-mono text-indigo-300">
                            {cand.compositeScore} / 100
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fallback Chain */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Automated Fallback Chain:</span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-indigo-400 font-bold">{currentDecision.selectedModel.id}</span>
                    {currentDecision.fallbackChain.map((fb, idx) => (
                      <React.Fragment key={idx}>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="text-slate-400">{fb}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                Select parameters and click "Simulate Decision Routing" to inspect the dynamic scoring matrix.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-MODEL DAG WORKFLOWS */}
      {activeTab === 'dags' && (
        <div className="space-y-6">
          {/* Workflow Selector & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Select Multi-Model Directed Acyclic Graph (DAG)
              </label>
              <select
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm font-bold focus:outline-none focus:border-indigo-500"
              >
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.category})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExecuteDag}
              disabled={isRunningDag}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isRunningDag ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing Async Celery Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Execute Multi-Model Pipeline
                </>
              )}
            </button>
          </div>

          {/* DAG Visual Node Pipeline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">{activeWorkflow?.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeWorkflow?.description}</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                Merge Strategy: {activeWorkflow?.mergeStrategy}
              </span>
            </div>

            {/* Pipeline Step Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeWorkflow?.nodes.map((node, idx) => (
                <div
                  key={node.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      Stage {idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {node.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{node.label}</h4>
                    <p className="text-xs text-indigo-400 font-mono mt-0.5">{node.modelId}</p>
                    <p className="text-[11px] text-slate-400 mt-1 italic">Role: {node.role}</p>
                  </div>

                  <div className="p-2.5 bg-slate-900/80 rounded-xl text-[11px] text-slate-300 font-mono line-clamp-3">
                    {node.output || node.promptTemplate}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800/80 pt-2">
                    <span>{node.executionTimeMs} ms</span>
                    <span>{node.tokenCount} tokens</span>
                    <span>${(node.costUsd || 0).toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recursive Consensus Breakdown Output */}
            {activeExecution && (
              <div className="p-5 bg-slate-950 border border-indigo-900/40 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-slate-100">
                      Consolidated Multi-Model Consensus Output
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>Total Cost: ${activeExecution.totalCostUsd.toFixed(4)}</span>
                    <span>Total Duration: {(activeExecution.totalDurationMs / 1000).toFixed(2)}s</span>
                    <span>Total Tokens: {activeExecution.totalTokens}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {activeExecution.finalConsensusOutput}
                </div>

                {activeExecution.consensusBreakdown && (
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="text-slate-300 font-bold">Ensemble Weighting:</span>
                    {activeExecution.consensusBreakdown.candidateWeights.map((w, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-900 rounded-lg border border-slate-800">
                        {w.model}: {(w.weight * 100).toFixed(0)}% weight ({w.agreementPct}% agreement)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* YAML Configuration Viewer */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  YAML DAG Specification (Celery Pipeline Definition)
                </span>
                <span>Asynchronous DAG Engine</span>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-indigo-300/90 overflow-x-auto">
                {activeWorkflow?.yamlConfig}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COST & BUDGET CONTROLS */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {budgets.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 font-sans text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {b.entityType}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      b.status === 'optimal'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {b.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-100">{b.name}</h4>
                  <div className="flex items-baseline justify-between mt-2 font-mono">
                    <span className="text-lg font-bold text-slate-100">${b.currentSpentUsd.toFixed(2)}</span>
                    <span className="text-slate-400">/ ${b.allocatedBudgetUsd.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.usagePct > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, b.usagePct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{b.usagePct.toFixed(1)}% Used</span>
                    <span>Auto-Downgrade: {b.autoDowngradeThresholdPct}%</span>
                  </div>
                </div>

                {/* 5-day Sparkline Trend */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">5-Day Cost Trend</span>
                  <div className="flex items-end gap-1.5 h-8">
                    {b.dailyHistory.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-indigo-600/70 hover:bg-indigo-500 rounded-t transition-all"
                          style={{ height: `${Math.min(32, Math.max(4, d.costUsd * 4))}%` }}
                          title={`${d.date}: $${d.costUsd}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Budget Downgrade Protection Safeguard */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-100">Automated Cost Downgrade & Guardrails</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When a module consumes &gt;85% of its monthly allocation, the Model Router seamlessly switches non-critical background jobs to local zero-cost models (Llama 3.1 70B) or ultra-low-cost Gemini Flash. Critical human-facing synthesis (Grants, Pitches) remains at Flagship quality unless the 95% hard ceiling is reached.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE & VECTOR CACHE */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Model Latency & BLEU Telemetry */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Live Model Performance Telemetry
              </h3>
              <span className="text-xs font-mono text-slate-400">Updated: Real-time</span>
            </div>

            <div className="space-y-3">
              {telemetry.map((t) => (
                <div
                  key={t.modelId}
                  className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 text-sm">{t.modelName}</span>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {t.totalCalls} Calls • Error Rate: {t.errorRatePct}%
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                      {t.humanSatisfactionPct}% Approval
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono text-[11px]">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Latency P50</span>
                      <span className="text-indigo-300 font-bold">{t.latencyP50Ms}ms</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Latency P99</span>
                      <span className="text-slate-300 font-bold">{t.latencyP99Ms}ms</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">BLEU Score</span>
                      <span className="text-emerald-400 font-bold">{t.avgBleuScore}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">ROUGE-L</span>
                      <span className="text-emerald-400 font-bold">{t.avgRougeScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Semantic Vector Query Cache */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Semantic Vector Query Cache
              </h3>
              <span className="text-xs font-mono text-emerald-400">Cosine Similarity Lookup</span>
            </div>

            {/* Cache Search Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Test query similarity against vector cache..."
                value={cacheSearchQuery}
                onChange={(e) => setCacheSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchVectorCache()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={handleSearchVectorCache}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Query
              </button>
            </div>

            {cacheHitResult && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-emerald-300 font-bold">
                  <span>CACHE HIT ({cacheHitResult.embeddingCosineSim * 100}% Cosine Match)</span>
                  <span>Hits: {cacheHitResult.hitCount}</span>
                </div>
                <p className="text-slate-300 font-sans">{cacheHitResult.cachedResponseSnippet}</p>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                  <span>Tokens Saved: +{cacheHitResult.tokensSaved}</span>
                  <span>Cost Saved: +${cacheHitResult.costSavedUsd.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Cache Entries List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Frequent Cached Queries</span>
              {vectorCache.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs font-mono"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-300 font-bold line-clamp-1">{c.querySnippet}</span>
                    <span className="text-slate-400 text-[10px]">{c.hitCount} hits</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                    {c.cachedResponseSnippet}
                  </p>
                  <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5">
                    <span>Saved {c.tokensSaved} tokens</span>
                    <span className="text-emerald-400 font-bold">+${c.costSavedUsd.toFixed(2)} USD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MODEL REGISTRY */}
      {activeTab === 'registry' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {models.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 font-sans text-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {m.provider}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100">{m.name}</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{m.description}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Capabilities</span>
                  <div className="flex flex-wrap gap-1">
                    {m.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-800/80 pt-3">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Input Cost / 1k</span>
                    <span className="text-slate-200 font-bold">${m.costPer1kInputTokens.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Output Cost / 1k</span>
                    <span className="text-slate-200 font-bold">${m.costPer1kOutputTokens.toFixed(6)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded-xl">
                  <span>Context: {(m.contextWindowTokens / 1000).toFixed(0)}k</span>
                  <span>Avg Latency: {m.avgLatencyMs}ms</span>
                  <span>Load: {m.currentLoadPct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REGISTER NEW MODEL MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Register Custom Model Endpoint
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-200 font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterModel} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DeepSeek-V3 Reasoning Endpoint"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Provider</label>
                  <select
                    value={newModelProvider}
                    onChange={(e) => setNewModelProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="Google">Google</option>
                    <option value="Anthropic">Anthropic</option>
                    <option value="OpenAI">OpenAI</option>
                    <option value="Meta">Meta</option>
                    <option value="DeepSeek">DeepSeek</option>
                    <option value="Mistral">Mistral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Endpoint URL</label>
                  <input
                    type="url"
                    value={newModelEndpoint}
                    onChange={(e) => setNewModelEndpoint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Input $/1k tokens</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newModelCostIn}
                    onChange={(e) => setNewModelCostIn(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Output $/1k tokens</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newModelCostOut}
                    onChange={(e) => setNewModelCostOut(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Save Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
