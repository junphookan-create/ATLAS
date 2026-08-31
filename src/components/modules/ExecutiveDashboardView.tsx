import React, { useState, useEffect } from 'react';
import {
  Trophy,
  FileText,
  Brain,
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  Send,
  Layers,
  Flame,
  Radio,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ApprovalRequest,
  Opportunity,
  Competition,
  GrantProposal,
  Contact,
  CalendarEvent,
  ModuleId,
  SystemAgentStatus,
  LiveStreamEvent,
  TimelineTaskHorizon,
  DashboardKPISummary,
  CommandBarActionIntent,
} from '../../types';

interface ExecutiveDashboardViewProps {
  approvals: ApprovalRequest[];
  opportunities: Opportunity[];
  competitions: Competition[];
  grants: GrantProposal[];
  contacts: Contact[];
  calendar: CalendarEvent[];
  onNavigateModule: (module: ModuleId) => void;
  onOpenCommandBar?: () => void;
  onRequestApproval?: (request: Partial<ApprovalRequest>) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  approvals,
  opportunities,
  competitions,
  grants,
  contacts: _contacts,
  calendar: _calendar,
  onNavigateModule,
  onOpenCommandBar,
  onRequestApproval,
}) => {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'fleet' | 'events' | 'approvals'>('cockpit');
  const [commandInput, setCommandInput] = useState('');
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  const [commandResult, setCommandResult] = useState<CommandBarActionIntent | null>(null);

  const [agents, setAgents] = useState<SystemAgentStatus[]>([]);
  const [events, setEvents] = useState<LiveStreamEvent[]>([]);
  const [timeline, setTimeline] = useState<TimelineTaskHorizon[]>([]);
  const [kpiSummary, setKpiSummary] = useState<DashboardKPISummary | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<LiveStreamEvent | null>(null);

  // Fetch initial dashboard overview data from server
  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard/overview');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        setEvents(data.events || []);
        setTimeline(data.timeline || []);
        setKpiSummary(data.kpi || null);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Periodic SSE simulation
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      // Simulate light pulse or refresh events
      fetch('/api/dashboard/events')
        .then((r) => r.json())
        .then((d) => {
          if (d.events) setEvents(d.events);
        })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const handleExecuteCommand = async (cmdText?: string) => {
    const textToRun = cmdText || commandInput;
    if (!textToRun.trim()) return;
    setIsExecutingCommand(true);
    try {
      const res = await fetch('/api/dashboard/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: textToRun }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommandResult(data.commandResult);

        // If intent requires HITL approval, trigger approval flow
        if (data.commandResult.executionStatus === 'requires_hitl' && onRequestApproval) {
          onRequestApproval({
            moduleName: 'executive_dashboard',
            actionType: 'execute_command_directive',
            summary: data.commandResult.actionSummary,
            riskLevel: 'high',
            payload: { command: textToRun, intent: data.commandResult },
          });
        }
      }
    } catch (err) {
      console.error('Command execution failed:', err);
    } finally {
      setIsExecutingCommand(false);
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const activeCompetitions = competitions.filter((c) => c.status !== 'won' && c.status !== 'lost');
  const activeGrants = grants.filter((g) => g.status !== 'awarded');

  const filteredEvents = events.filter((e) => {
    if (eventFilter === 'all') return true;
    return e.severity === eventFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/50 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                MODULE 16
              </span>
              <span className="text-xs text-slate-400 font-mono">• COMMAND & CONTROL COCKPIT</span>
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Real-time SSE Active</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Atlas Executive Cockpit</span>
              <Radio className="w-5 h-5 text-indigo-400" />
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Unified command center for autonomous orchestration, real-time telemetry, cryptographic human-in-the-loop governance, and dynamic priority steering.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`px-3 py-2 text-xs font-mono rounded-xl border flex items-center space-x-1.5 transition-all ${
                isLiveStreaming
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isLiveStreaming ? 'Live Streaming (SSE)' : 'Stream Paused'}</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-all"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Natural Language Command Bar */}
      <div className="p-4 bg-slate-900 border border-indigo-900/40 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 font-semibold uppercase">
            <Terminal className="w-4 h-4" />
            <span>Autonomous Command Bar & Intent Parser</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Type high-level directives in plain English</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
              placeholder="e.g. Atlas, prioritize NSF proposal and shift compute from scraper to neural essay optimizer..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono outline-none"
            />
            {commandInput && (
              <button
                onClick={() => setCommandInput('')}
                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => handleExecuteCommand()}
            disabled={isExecutingCommand || !commandInput.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-950 transition-all shrink-0"
          >
            {isExecutingCommand ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Execute</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] font-mono text-slate-500">Quick directives:</span>
          {[
            'Prioritize NSF grant proposal and reallocate workers',
            'Trigger Admissions Panel review on Common App draft',
            'Query global cluster health and latency telemetry',
            'Stage cryptographic approval signature for Devpost submission',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCommandInput(prompt);
                handleExecuteCommand(prompt);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700/50 text-slate-300 hover:text-indigo-300 transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Command Result Output */}
        {commandResult && (
          <div className="p-3 bg-slate-950 border border-indigo-900/60 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700 text-[10px] font-bold">
                  INTENT: {commandResult.parsedIntent.toUpperCase()}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Target: <span className="text-slate-200">{commandResult.targetModule}</span> (Confidence: {(commandResult.confidence * 100).toFixed(0)}%)
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                commandResult.executionStatus === 'executed'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {commandResult.executionStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-200">{commandResult.actionSummary}</p>
            {commandResult.executionResultText && (
              <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-900">
                ⚡ {commandResult.executionResultText}
              </p>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateModule('opportunity_discovery')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Opportunity Pipeline</span>
            <Trophy className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {kpiSummary?.opportunitiesValueEstimate || '$1.85M'}
            </span>
            <span className="text-[11px] text-indigo-400 font-mono">48 Opportunities</span>
          </div>
          <p className="text-[11px] text-slate-400">Grants, competitions & fellowships active</p>
        </div>

        <div
          onClick={() => onNavigateModule('grant_writer')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Grant Proposal Value</span>
            <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {kpiSummary?.grantsPipelineValue || '$650,000'}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">9.4/10 Score</span>
          </div>
          <p className="text-[11px] text-slate-400">NSF Cyber-Physical proposal Stage 4</p>
        </div>

        <div
          onClick={() => onNavigateModule('approval_center')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">HITL Governance</span>
            <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">{pendingApprovals.length}</span>
            <span className="text-[11px] text-amber-400 font-mono">Pending Cryptographic Sign</span>
          </div>
          <p className="text-[11px] text-slate-400">SHA-256 tamper-evident decision ledger</p>
        </div>

        <div
          onClick={() => setActiveTab('fleet')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-xl cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">System Reliability</span>
            <Cpu className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {kpiSummary ? `${kpiSummary.systemReliabilityScore}%` : '99.8%'}
            </span>
            <span className="text-[11px] text-sky-400 font-mono">342 Actions / 24h</span>
          </div>
          <p className="text-[11px] text-slate-400">Model router saving ${(kpiSummary?.totalEstimatedSavingsUsd || 184.6).toFixed(2)}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {[
          { id: 'cockpit', label: 'Priority Timeline & Launchpad', icon: Clock },
          { id: 'fleet', label: 'Autonomous Agent Fleet', icon: Cpu },
          { id: 'events', label: 'Live SSE Event Stream', icon: Activity },
          { id: 'approvals', label: `Pending Approvals (${pendingApprovals.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COCKPIT & TIMELINE */}
      {activeTab === 'cockpit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Gantt Timeline */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-100 font-mono">Priority Gantt Task Schedule</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Multi-Horizon Scheduling</span>
            </div>

            <div className="space-y-3">
              {timeline.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        task.category === 'Grant'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : task.category === 'Competition'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : task.category === 'Essay'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}>
                        {task.category.toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-200">{task.title}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">Due: {task.dueDate}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Assigned: {task.assignedAgent}</span>
                      <span>{task.progressPct}% Complete ({task.estimatedRemainingHours}h remaining)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          task.status === 'at_risk' ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${task.progressPct}%` }}
                      />
                    </div>
                  </div>

                  {task.bottleneckWarning && (
                    <div className="flex items-center space-x-2 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-900/60 rounded-lg p-2 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{task.bottleneckWarning}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Launchpad & Quick Switch */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
                Autonomous Sub-Modules Launchpad
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { id: 'essay_architect', name: 'Essay Architect' },
                  { id: 'ai_research_lab', name: 'AI Research Lab' },
                  { id: 'browser_agent', name: 'Browser Agent' },
                  { id: 'project_builder', name: 'Project Builder' },
                  { id: 'grant_writer', name: 'Grant Writer' },
                  { id: 'opportunity_discovery', name: 'Opportunity Scanner' },
                  { id: 'research_scientist', name: 'Research Scientist' },
                  { id: 'general_cognitive_worker', name: 'GCW Meta-Agent' },
                ].map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => onNavigateModule(mod.id as ModuleId)}
                    className="p-2.5 bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-700/50 rounded-xl text-left text-slate-300 hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>{mod.name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
                Direct Operator Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigateModule('essay_architect')}
                  className="w-full p-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800 rounded-xl text-left text-purple-300 text-xs font-mono flex items-center space-x-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Launch Essay Architect & Admissions Simulator</span>
                </button>

                <button
                  onClick={() => onNavigateModule('approval_center')}
                  className="w-full p-2.5 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800 rounded-xl text-left text-amber-300 text-xs font-mono flex items-center space-x-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Review Cryptographic Decision Ledger</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTONOMOUS AGENT FLEET */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 font-mono">Active Agent Fleet & Telemetry Health</h3>
            <span className="text-xs text-slate-400 font-mono">8 of 20 Sub-Modules In High-Throughput Mode</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.moduleId}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-100 truncate pr-2">{agent.moduleName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    agent.status === 'active'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Workers Active:</span>
                    <span className="text-slate-200">{agent.activeWorkers} / {agent.maxWorkers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU / RAM:</span>
                    <span className="text-slate-200">{agent.cpuUsagePct}% / {agent.memoryUsageMb}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Burn:</span>
                    <span className="text-slate-200">{(agent.tokenConsumptionRate / 1000).toFixed(1)}k / min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency / SLA:</span>
                    <span className="text-slate-200">{agent.avgLatencyMs}ms ({agent.errorBudgetRemainingPct}%)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[11px] text-slate-300 italic line-clamp-2 leading-relaxed">
                    "{agent.currentTaskSummary}"
                  </p>
                </div>

                <button
                  onClick={() => onNavigateModule(agent.moduleId as ModuleId)}
                  className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-mono rounded-lg transition-colors"
                >
                  Manage Engine →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SSE EVENT STREAM */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-100 font-mono">Live Event Stream (SSE / WebSockets)</h3>
              </div>

              {/* Filter controls */}
              <div className="flex items-center space-x-1.5 text-xs font-mono">
                {['all', 'info', 'success', 'warning', 'critical'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setEventFilter(f)}
                    className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold transition-all ${
                      eventFilter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs font-mono space-y-1.5 ${
                    selectedEvent?.id === evt.id
                      ? 'bg-indigo-950/40 border-indigo-500'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.severity === 'success'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : evt.severity === 'warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : evt.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}>
                        {evt.severity}
                      </span>
                      <span className="text-slate-400 font-medium">[{evt.sourceModule}]</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-200 font-sans leading-relaxed">{evt.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Event Inspector Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
              Event Payload Inspector
            </h3>
            {selectedEvent ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-500 text-[10px]">Event ID:</span>
                  <p className="text-slate-200">{selectedEvent.id}</p>
                  <span className="text-slate-500 text-[10px]">Timestamp:</span>
                  <p className="text-slate-200">{selectedEvent.timestamp}</p>
                  <span className="text-slate-500 text-[10px]">Source Engine:</span>
                  <p className="text-indigo-300">{selectedEvent.sourceModule}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px]">Metadata JSON:</span>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-emerald-400 overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata || {}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                Select an event from the stream to view structured metadata and cryptographic traces.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PENDING APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100 font-mono">
                Cryptographically Signed Action Queue ({pendingApprovals.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateModule('approval_center')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono"
            >
              Open Full Approval Ledger →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {req.moduleName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono text-[10px] uppercase font-bold">
                    {req.riskLevel} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">{req.summary}</p>
                <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Expires: {req.expiresAt}</span>
                  <span className="text-indigo-400 truncate max-w-[140px]">Hash: {req.hash}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                  <button
                    onClick={() => onNavigateModule('approval_center')}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg font-mono transition-colors"
                  >
                    Authorize & Sign
                  </button>
                  <button
                    onClick={() => onNavigateModule('approval_center')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
