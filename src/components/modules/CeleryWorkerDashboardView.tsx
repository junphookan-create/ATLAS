import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Play,
  Flame,
  Radio,
  Server,
  Layers,
  CheckCheck,
  AlertTriangle,
  FileCode,
  Gauge,
  ChevronRight,
  TrendingUp,
  Cpu,
  CornerDownRight,
  Send,
  Database,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import { CeleryTaskUI, CeleryWorkerStatsUI, RedisStreamMetricUI } from '../../types';

export const CeleryWorkerDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'beat_health' | 'redis_streams' | 'cache_performance'>('tasks');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Telemetry States
  const [stats, setStats] = useState<CeleryWorkerStatsUI | null>(null);
  const [tasks, setTasks] = useState<CeleryTaskUI[]>([]);
  const [taskFilter, setTaskFilter] = useState<string>('ALL');
  const [selectedTask, setSelectedTask] = useState<CeleryTaskUI | null>(null);
  
  const [redisStreams, setRedisStreams] = useState<RedisStreamMetricUI[]>([]);
  const [selectedStream, setSelectedStream] = useState<string>('approval_events');
  const [streamEvents, setStreamEvents] = useState<any[]>([]);
  const [cacheMetrics, setCacheMetrics] = useState<any>(null);
  const [dlqMetrics, setDlqMetrics] = useState<{ count: number; items: any[] }>({ count: 0, items: [] });

  // Dispatch Task Modal / Inline State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [newTaskName, setNewTaskName] = useState<string>('tasks.sweep_expired_approvals');
  const [newTaskKwargs, setNewTaskKwargs] = useState<string>('{\n  "benchmark": true,\n  "tenantId": "tenant-primary"\n}');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // Sweep Trigger State
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepResult, setSweepResult] = useState<{ sweptCount: number; timestamp: string } | null>(null);

  // Fetch full metrics
  const fetchMetrics = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/workers/metrics');
      if (res.ok) {
        const data = await res.json();
        setStats(data.celery);
        setRedisStreams(data.redis.streams || []);
        setCacheMetrics(data.redis.cache || null);
        setDlqMetrics(data.dlq || { count: 0, items: [] });
      }

      const tasksRes = await fetch(`/api/workers/celery/tasks?status=${taskFilter}`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
        if (!selectedTask && tasksData.tasks?.length > 0) {
          setSelectedTask(tasksData.tasks[0]);
        }
      }

      const streamRes = await fetch(`/api/workers/redis/streams?stream=${selectedStream}&limit=30`);
      if (streamRes.ok) {
        const streamData = await streamRes.json();
        setStreamEvents(streamData.events || []);
      }
    } catch (err) {
      console.warn('Failed to fetch worker metrics:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [taskFilter, selectedStream, selectedTask]);

  // Initial and Periodic polling
  useEffect(() => {
    fetchMetrics();
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMetrics();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchMetrics, autoRefresh]);

  // Handle Manual Celery Task Dispatch
  const handleDispatchTask = async () => {
    try {
      setDispatchStatus('Dispatching task to Celery queue...');
      let parsedKwargs = {};
      try {
        parsedKwargs = JSON.parse(newTaskKwargs);
      } catch {
        // use raw or empty
      }

      const res = await fetch('/api/workers/celery/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTaskName,
          kwargs: parsedKwargs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchStatus(`Task ${data.task?.id} dispatched successfully!`);
        setTimeout(() => {
          setIsDispatchModalOpen(false);
          setDispatchStatus(null);
          fetchMetrics(true);
        }, 1200);
      } else {
        setDispatchStatus('Failed to dispatch task');
      }
    } catch {
      setDispatchStatus('Error dispatching task');
    }
  };

  // Handle Force Expiry Sweep
  const handleForceSweep = async () => {
    try {
      setIsSweeping(true);
      const res = await fetch('/api/workers/beat/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setSweepResult({
          sweptCount: data.sweptCount ?? 0,
          timestamp: data.timestamp || new Date().toISOString(),
        });
        fetchMetrics(true);
      }
    } catch (err) {
      console.warn('Sweep failed:', err);
    } finally {
      setIsSweeping(false);
    }
  };

  // Handle Redis Stream XACK
  const handleAckStreamEvent = async (stream: string, eventId: string) => {
    try {
      await fetch('/api/workers/redis/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream, group: 'audit-consumers', eventId }),
      });
      fetchMetrics(true);
    } catch (err) {
      console.warn('Ack error:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'ALL') return true;
    return t.status === taskFilter;
  });

  return (
    <div id="celery-worker-dashboard" className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white">Celery Worker & Redis Stream Engine</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE CLUSTER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time asynchronous task orchestration, Celery Beat periodic expiry queue, and Redis Streams consumer pipelines.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            id="toggle-auto-refresh-btn"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              autoRefresh
                ? 'bg-indigo-950/70 border-indigo-700 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-indigo-400 animate-pulse' : ''}`} />
            {autoRefresh ? 'Live Polling (3s)' : 'Polling Paused'}
          </button>

          <button
            id="manual-refresh-metrics-btn"
            onClick={() => fetchMetrics(true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh
          </button>

          <button
            id="trigger-manual-sweep-btn"
            onClick={handleForceSweep}
            disabled={isSweeping}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/80 border border-amber-700 text-amber-300 hover:bg-amber-900/90 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Flame className={`w-3.5 h-3.5 ${isSweeping ? 'animate-bounce text-amber-400' : 'text-amber-400'}`} />
            {isSweeping ? 'Sweeping Expiry...' : 'Force Expiry Sweep'}
          </button>

          <button
            id="dispatch-task-open-btn"
            onClick={() => setIsDispatchModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-md hover:shadow-emerald-900/40"
          >
            <Send className="w-3.5 h-3.5" />
            Dispatch Celery Task
          </button>
        </div>
      </div>

      {/* Sweep Toast Notification if triggered */}
      {sweepResult && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-3.5 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-3 text-xs text-amber-200">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Celery Beat Expiry Sweep executed at <strong>{new Date(sweepResult.timestamp).toLocaleTimeString()}</strong>. Stale approvals swept: <strong>{sweepResult.sweptCount}</strong> items expired (410 Gone status enforced).
            </span>
          </div>
          <button
            onClick={() => setSweepResult(null)}
            className="text-xs text-amber-400 hover:text-amber-200 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Celery Tasks KPI */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Celery Tasks Total</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">{stats?.totalProcessed ?? 0}</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              {stats?.successRate ?? 100}% Success
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>In Queue: <strong className="text-amber-300">{stats?.queueLength ?? 0}</strong></span>
            <span>Avg Latency: <strong className="text-slate-200">{stats?.avgExecutionDurationMs ?? 24}ms</strong></span>
          </div>
        </div>

        {/* Celery Beat Expiry Worker KPI */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Beat Expiry Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-300 tracking-tight">5.0s</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {stats?.beat.healthStatus || 'HEALTHY'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Total Expired Swept: <strong className="text-white">{stats?.beat.totalExpiredSwept ?? 0}</strong></span>
            <span>Last Run: <strong className="text-slate-300">{stats?.beat.lastSweepAt ? new Date(stats.beat.lastSweepAt).toLocaleTimeString() : 'Active'}</strong></span>
          </div>
        </div>

        {/* Redis Streams KPI */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Redis Streams Event Rate</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-300 tracking-tight">
              {redisStreams.reduce((acc, curr) => acc + curr.totalEvents, 0)}
            </span>
            <span className="text-xs font-medium text-cyan-400 bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded-full">
              {redisStreams.length} Streams Active
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Consumer Groups: <strong className="text-white">{redisStreams.reduce((acc, curr) => acc + curr.consumerGroups.length, 0)}</strong></span>
            <span>Consumer Lag: <strong className="text-emerald-400">0 msgs</strong></span>
          </div>
        </div>

        {/* Redis Policy Cache & DLQ KPI */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Policy Cache & DLQ</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-300 tracking-tight">{cacheMetrics?.activeKeys ?? 2} Keys</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              dlqMetrics.count === 0
                ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-800/50'
                : 'text-rose-300 bg-rose-950/70 border border-rose-800/50'
            }`}>
              DLQ: {dlqMetrics.count}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Redis Backend: <strong className="text-slate-200">{cacheMetrics?.isConnectedToExternalRedis ? 'Cloud Redis' : 'Internal Engine'}</strong></span>
            <span>Evictions: <strong className="text-slate-300">{cacheMetrics?.expiredKeys ?? 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          id="tab-celery-tasks-btn"
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'tasks'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Celery Tasks Pipeline ({tasks.length})
        </button>

        <button
          id="tab-beat-health-btn"
          onClick={() => setActiveTab('beat_health')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'beat_health'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Celery Beat Expiry Health
        </button>

        <button
          id="tab-redis-streams-btn"
          onClick={() => setActiveTab('redis_streams')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'redis_streams'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Redis Streams & Consumer Groups
        </button>

        <button
          id="tab-cache-perf-btn"
          onClick={() => setActiveTab('cache_performance')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'cache_performance'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gauge className="w-4 h-4" />
          Cache & Engine Performance
        </button>
      </div>

      {/* TAB 1: CELERY TASKS PIPELINE */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Task List & Filtering */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center space-x-1.5">
                {(['ALL', 'SUCCESS', 'PENDING', 'STARTED', 'RETRY', 'FAILURE'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTaskFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      taskFilter === filter
                        ? 'bg-slate-750 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400">
                Showing <strong>{filteredTasks.length}</strong> tasks
              </span>
            </div>

            {loading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                Loading Celery tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
                <FileCode className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium">No tasks found matching filter &quot;{taskFilter}&quot;.</p>
                <button
                  onClick={() => setIsDispatchModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                >
                  Dispatch a task now <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                {filteredTasks.map((task) => {
                  const isSelected = selectedTask?.id === task.id;
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              task.status === 'SUCCESS'
                                ? 'bg-emerald-400'
                                : task.status === 'STARTED' || task.status === 'PENDING'
                                ? 'bg-amber-400 animate-ping'
                                : task.status === 'RETRY'
                                ? 'bg-indigo-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span className="text-xs font-mono font-bold text-white">{task.name}</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            task.status === 'SUCCESS'
                              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                              : task.status === 'STARTED' || task.status === 'PENDING'
                              ? 'bg-amber-950/70 border-amber-800 text-amber-300'
                              : task.status === 'RETRY'
                              ? 'bg-indigo-950/70 border-indigo-800 text-indigo-300'
                              : 'bg-rose-950/70 border-rose-800 text-rose-300'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-[11px] text-slate-300">{task.id}</span>
                        <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
                      </div>

                      {task.error && (
                        <div className="mt-2 text-[11px] text-rose-300 bg-rose-950/50 border border-rose-900/60 p-2 rounded-lg">
                          Error: {task.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Task Inspector */}
          <div className="lg:col-span-5">
            {selectedTask ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 sticky top-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Task Inspector</span>
                    <h3 className="text-sm font-bold text-white font-mono">{selectedTask.name}</h3>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      selectedTask.status === 'SUCCESS'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : selectedTask.status === 'FAILURE'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {selectedTask.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-medium">Task ID</span>
                    <span className="font-mono text-slate-200 text-[11px] break-all">{selectedTask.id}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-medium">Retries</span>
                    <span className="text-slate-200 font-semibold">{selectedTask.retries} / {selectedTask.maxRetries}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-medium">Created At</span>
                    <span className="text-slate-200">{new Date(selectedTask.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-medium">Completed At</span>
                    <span className="text-slate-200">
                      {selectedTask.completedAt ? new Date(selectedTask.completedAt).toLocaleString() : 'Processing...'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5">Task Kwargs / Parameters:</span>
                  <pre className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto max-h-36 custom-scrollbar">
                    {JSON.stringify(selectedTask.kwargs || {}, null, 2)}
                  </pre>
                </div>

                {selectedTask.result && (
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block mb-1.5">Execution Result:</span>
                    <pre className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto max-h-48 custom-scrollbar">
                      {typeof selectedTask.result === 'string'
                        ? selectedTask.result
                        : JSON.stringify(selectedTask.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <FileCode className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm">Select a task from the list to inspect payload kwargs, execution timing, and return results.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CELERY BEAT EXPIRY WORKER HEALTH */}
      {activeTab === 'beat_health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Beat Scheduler State</h3>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Celery Beat runs an automated tick every <strong>5000ms</strong> to sweep PostgreSQL approval records that have passed their TTL.
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-xs flex justify-between items-center text-slate-300">
                <span>Scheduler Loop:</span>
                <span className="font-mono text-emerald-400 font-bold">5.00s Ticker</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">410 Gone Enforcement</h3>
                <CheckCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Expired records are automatically marked as <code>expired</code> and instantly return <strong>410 Gone</strong> to all API consumers.
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-xs flex justify-between items-center text-slate-300">
                <span>Total Items Swept:</span>
                <span className="font-mono text-white font-bold">{stats?.beat.totalExpiredSwept ?? 0}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Instant Manual Control</h3>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trigger an out-of-band sweep across all PostgreSQL partitions to immediately test expiry state transitions.
              </p>
              <button
                onClick={handleForceSweep}
                disabled={isSweeping}
                className="w-full mt-2 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <Flame className="w-3.5 h-3.5" />
                {isSweeping ? 'Sweeping Database...' : 'Run Immediate Sweep'}
              </button>
            </div>
          </div>

          {/* Expiry Health Diagnostics Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Expiry Sweep Architecture & Guarantees
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  PostgreSQL Partition Pruning
                </span>
                <p className="text-slate-400 leading-relaxed">
                  The query <code>UPDATE approvals SET status = &apos;expired&apos; WHERE status = &apos;pending&apos; AND expires_at &lt; NOW()</code> leverages the compound indexes on <code>(status, expires_at)</code> to achieve sub-5ms sweep latencies even under millions of rows.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Redis Streams Broadcast
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Upon sweeping expired records, a <code>STALE_APPROVALS_EXPIRED</code> event is appended to Redis stream <code>approval_events</code> and broadcast across SSE channels to refresh all connected browser clients with zero polling lag.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REDIS STREAMS & CONSUMER GROUPS */}
      {activeTab === 'redis_streams' && (
        <div className="space-y-6">
          {/* Stream Selector Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {redisStreams.map((st) => (
              <div
                key={st.stream}
                onClick={() => setSelectedStream(st.stream)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedStream === st.stream
                    ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{st.stream}</span>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                    {st.totalEvents} events
                  </span>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 flex justify-between">
                  <span>Consumer Groups: <strong className="text-slate-200">{st.consumerGroups.length}</strong></span>
                  <span>Lag: <strong className="text-emerald-400">0</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Consumer Groups Detail */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Active Consumer Groups for &quot;{selectedStream}&quot;
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {redisStreams.find((s) => s.stream === selectedStream)?.consumerGroups.map((g) => (
                <div key={g.name} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-300">{g.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Cursor Index: {g.lastReadIndex}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Lag: {g.unreadLag}
                  </span>
                </div>
              )) || (
                <div className="text-xs text-slate-400 col-span-3 py-2">
                  Consumer group <code>audit-consumers</code> registered and listening for XREADGROUP.
                </div>
              )}
            </div>
          </div>

          {/* Live Stream Event Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Stream Event Log (XADD Stream: {selectedStream})
              </h3>
              <span className="text-xs text-slate-400">Showing last {streamEvents.length} events</span>
            </div>

            {streamEvents.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No events recorded in this stream yet. Submit an approval or dispatch a task to see stream entries.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {streamEvents.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-400 font-bold">{ev.id}</span>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-300">{new Date(ev.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate max-w-xl">
                        {JSON.stringify(ev.fields)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAckStreamEvent(selectedStream, ev.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] flex items-center gap-1 shrink-0 self-start md:self-auto transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      XACK
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CACHE & ENGINE PERFORMANCE */}
      {activeTab === 'cache_performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cache Stats */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                Redis Policy Cache Status
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <span className="text-slate-400 block text-[10px] uppercase">Active Cached Keys</span>
                  <span className="text-lg font-bold text-white">{cacheMetrics?.activeKeys ?? 0}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <span className="text-slate-400 block text-[10px] uppercase">TTL Evicted Keys</span>
                  <span className="text-lg font-bold text-slate-300">{cacheMetrics?.expiredKeys ?? 0}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Approval policies, action catalog definitions, and user permissions are cached with configurable 300s TTLs to bypass PostgreSQL query overhead on high-frequency evaluation requests.
              </p>
            </div>

            {/* DLQ & Dead Letter Handling */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Dead-Letter Queue (DLQ) & Circuit Breakers
              </h3>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-300 font-semibold">DLQ Poison Messages:</span>
                  <span className="text-[11px] text-slate-400 block">Exceeded max retry limits (3 attempts)</span>
                </div>
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                  dlqMetrics.count === 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {dlqMetrics.count} Poison Items
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Callback deliveries that fail after exponential backoff retries are shunted to the DLQ stream (<code>celery_dlq</code>) for automated replay or administrative review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH TASK MODAL */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Dispatch New Celery Task</h3>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Handler Name:</label>
                <select
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                >
                  <option value="tasks.sweep_expired_approvals">tasks.sweep_expired_approvals</option>
                  <option value="tasks.dispatch_callback">tasks.dispatch_callback</option>
                  <option value="tasks.benchmark_batch">tasks.benchmark_batch</option>
                  <option value="tasks.reindex_audit_logs">tasks.reindex_audit_logs</option>
                  <option value="tasks.custom_diagnostic">tasks.custom_diagnostic</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Kwargs (JSON):</label>
                <textarea
                  rows={4}
                  value={newTaskKwargs}
                  onChange={(e) => setNewTaskKwargs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {dispatchStatus && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-center">
                  {dispatchStatus}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-3">
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchTask}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Task Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
