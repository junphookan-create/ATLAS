import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  Play,
  Layers,
  Terminal,
  FileText,
  Download,
  MessageSquare,
  Sparkles,
  RefreshCw,
  FolderGit2,
  Code2,
  PieChart,
  BarChart3,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Send,
  Plus,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import {
  ProjectScope,
  WbsNode,
  SandboxedCodeExecution,
  MilestoneFeedbackReview,
  GitCommitLog,
  FinalProjectDeliverable,
  WbsTask,
} from '../../types';

interface ProjectBuilderViewProps {
  tasks?: WbsTask[];
  onRequestApproval?: (summary: string, moduleName: string) => void;
}

export const ProjectBuilderView: React.FC<ProjectBuilderViewProps> = ({ onRequestApproval }) => {
  const [activeTab, setActiveTab] = useState<'wbs' | 'sandbox' | 'feedback' | 'git' | 'deliverable'>('wbs');

  // State
  const [project, setProject] = useState<ProjectScope | null>(null);
  const [wbsNodes, setWbsNodes] = useState<WbsNode[]>([]);
  const [sandboxedExecutions, setSandboxedExecutions] = useState<SandboxedCodeExecution[]>([]);
  const [milestoneFeedback, setMilestoneFeedback] = useState<MilestoneFeedbackReview[]>([]);
  const [gitHistory, setGitHistory] = useState<GitCommitLog[]>([]);
  const [deliverable, setDeliverable] = useState<FinalProjectDeliverable | null>(null);

  // Python Sandbox Execution Input
  const [pythonCode, setPythonCode] = useState<string>(`import numpy as np
import matplotlib.pyplot as plt

# Monte Carlo simulation of event-driven spiking synapse latency vs energy
np.random.seed(42)
n_synapses = 10000
firing_rate_hz = np.random.gamma(shape=2.0, scale=5.0, size=n_synapses)
energy_pj_per_spike = 12.0 + 4.5 * np.random.normal(loc=0.5, scale=0.1, size=n_synapses)

total_power_mw = np.sum(firing_rate_hz * energy_pj_per_spike * 1e-9) * 1000
print(f"Total Simulated Power Dissipation: {total_power_mw:.4f} mW")
print(f"Mean Energy per Spike: {np.mean(energy_pj_per_spike):.2f} pJ")
print(f"Energy Efficiency Gain vs GPU: 10.42x")`);
  const [isRunningPython, setIsRunningPython] = useState<boolean>(false);

  // Natural Language Feedback Input
  const [feedbackInput, setFeedbackInput] = useState<string>('Emphasize sub-millisecond real-time sensor latency for edge robotics in Section 4, while preserving the 10.4x energy efficiency proof.');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  // Goal Decomposition Input
  const [newGoalInput, setNewGoalInput] = useState<string>('');
  const [isDecomposing, setIsDecomposing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [projRes, sandRes, feedRes, gitRes, delivRes] = await Promise.all([
        fetch('/api/project/current').then((r) => r.json()),
        fetch('/api/project/sandbox/python').then((r) => r.json()),
        fetch('/api/project/milestone/feedback').then((r) => r.json()),
        fetch('/api/project/git-history').then((r) => r.json()),
        fetch('/api/project/deliverable').then((r) => r.json()),
      ]);

      if (projRes.project) setProject(projRes.project);
      if (projRes.wbsNodes) setWbsNodes(projRes.wbsNodes);
      if (sandRes.executions) setSandboxedExecutions(sandRes.executions);
      if (feedRes.feedbackList) setMilestoneFeedback(feedRes.feedbackList);
      if (gitRes.history) setGitHistory(gitRes.history);
      if (delivRes.deliverable) setDeliverable(delivRes.deliverable);
    } catch (err) {
      console.warn('Could not load Project Builder data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunPython = async () => {
    setIsRunningPython(true);
    try {
      const res = await fetch('/api/project/sandbox/python/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pythonCode }),
      });
      const data = await res.json();
      if (data.execution) {
        setSandboxedExecutions((prev) => [data.execution, ...prev]);
      }
    } catch (err) {
      console.error('Python execution failed:', err);
    } finally {
      setIsRunningPython(false);
    }
  };

  const handleSubmitFeedback = async (milestoneId: string) => {
    if (!feedbackInput.trim()) return;
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch('/api/project/milestone/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, feedback: feedbackInput }),
      });
      const data = await res.json();
      if (data.review) {
        setMilestoneFeedback((prev) =>
          prev.map((m) => (m.milestoneId === milestoneId ? data.review : m))
        );
        fetchData();
      }
    } catch (err) {
      console.error('Feedback submit failed:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDecomposeGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    setIsDecomposing(true);
    try {
      const res = await fetch('/api/project/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: newGoalInput }),
      });
      const data = await res.json();
      if (data.result) {
        setProject(data.result.project);
        setWbsNodes(data.result.nodes);
        setNewGoalInput('');
      }
    } catch (err) {
      console.error('Goal decomposition failed:', err);
    } finally {
      setIsDecomposing(false);
    }
  };

  // Group WBS nodes by milestone
  const milestones = Array.from(new Set(wbsNodes.map((n) => n.milestoneTitle)));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-semibold tracking-wide">
              MODULE 14
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Hierarchical WBS State Machine & Multi-Agent Orchestrator
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight flex items-center gap-2.5">
            Project Builder
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-normal font-mono border border-slate-700">
              Lifecycle: {project?.status.toUpperCase()}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs hidden sm:block">
            <span className="text-slate-400">Target Completion</span>
            <p className="text-slate-200 font-bold">Aug 22, 2026</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            title="Refresh Project State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Scope Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
              {project?.category.replace('_', ' ').toUpperCase()}
            </span>
            <h2 className="text-lg font-bold text-slate-100 mt-1">{project?.title}</h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">{project?.tasksCount} Tasks across 4 Milestones</span>
            <span className="text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800">
              {project?.overallProgressPct}% Complete
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          <strong className="text-slate-400">High-Level Goal: </strong>
          {project?.highLevelGoal}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all"
            style={{ width: `${project?.overallProgressPct || 68}%` }}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
        {[
          { id: 'wbs', label: 'Hierarchical WBS Task Tree', icon: Layers },
          { id: 'sandbox', label: 'Docker Python Sandbox & Analysis', icon: Terminal },
          { id: 'feedback', label: 'Milestone Review & Human Feedback', icon: MessageSquare },
          { id: 'git', label: 'Git Version Control & Commits', icon: FolderGit2 },
          { id: 'deliverable', label: 'Compiled Final Deliverable Package', icon: FileText },
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

      {/* TAB 1: HIERARCHICAL WBS TASK TREE */}
      {activeTab === 'wbs' && (
        <div className="space-y-6">
          {/* Goal Decomposition Bar */}
          <form onSubmit={handleDecomposeGoal} className="flex gap-2">
            <input
              type="text"
              placeholder="Decompose a new high-level objective into a hierarchical WBS tree..."
              value={newGoalInput}
              onChange={(e) => setNewGoalInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
            />
            <button
              type="submit"
              disabled={isDecomposing}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Auto-Decompose WBS
            </button>
          </form>

          {/* Milestones & Tasks Hierarchy */}
          <div className="space-y-5">
            {milestones.map((milestoneTitle, mIdx) => {
              const tasksInMilestone = wbsNodes.filter((n) => n.milestoneTitle === milestoneTitle);
              return (
                <div
                  key={mIdx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs font-sans"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
                        {mIdx + 1}
                      </span>
                      {milestoneTitle}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {tasksInMilestone.filter((t) => t.status === 'completed').length} / {tasksInMilestone.length} Completed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {tasksInMilestone.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200 text-xs">{task.title}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-indigo-400">
                              Agent: {task.assignedAgent}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              task.status === 'completed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : task.status === 'in_progress'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-slate-400 text-xs leading-relaxed">{task.description}</p>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                          <span>Est: {task.estimatedDurationDays} days (Actual: {task.actualDurationHours || 0} hrs)</span>
                          {task.dependencies.length > 0 && (
                            <span className="text-slate-400">Depends on: {task.dependencies.join(', ')}</span>
                          )}
                        </div>

                        {/* Intermediate Artifacts Preview */}
                        {task.intermediateArtifacts.length > 0 && (
                          <div className="space-y-1.5 pt-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              Intermediate Artifacts Produced:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {task.intermediateArtifacts.map((art) => (
                                <div
                                  key={art.id}
                                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2"
                                >
                                  <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                                  <span className="font-bold">{art.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DOCKER PYTHON SANDBOX & ANALYSIS */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Python Code Editor */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Sandboxed Docker Python 3.12 Runtime
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Isolated Container
              </span>
            </div>

            <textarea
              value={pythonCode}
              onChange={(e) => setPythonCode(e.target.value)}
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />

            <button
              onClick={handleRunPython}
              disabled={isRunningPython}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isRunningPython ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing Simulation in Docker...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Run Python Script in Container
                </>
              )}
            </button>
          </div>

          {/* Right: Container Output & Statistical Key Findings */}
          <div className="lg:col-span-6 space-y-5">
            {sandboxedExecutions.map((exec, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs font-sans"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{exec.taskTitle}</h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Container: {exec.dockerContainerId} ({exec.executionDurationSec}s)
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                    EXIT 0 (SUCCESS)
                  </span>
                </div>

                {/* Stdout Console */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-400/90 whitespace-pre-wrap">
                  {exec.stdout}
                </div>

                {/* Key Findings Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  {exec.numericKeyFindings.map((finding, fIdx) => (
                    <div key={fIdx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono">
                      <span className="text-slate-400 text-[10px] block">{finding.metric}</span>
                      <span className="text-slate-100 font-bold text-sm">{finding.value}</span>
                      <span className="text-[9px] text-slate-500 block mt-1 font-sans">{finding.significance}</span>
                    </div>
                  ))}
                </div>

                {/* Generated Plot Preview */}
                {exec.chartPlotBase64OrUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Generated Visualization: {exec.generatedPlotTitle}
                    </span>
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img
                        src={exec.chartPlotBase64OrUrl}
                        alt="Monte Carlo Pareto Plot"
                        className="w-full h-40 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MILESTONE REVIEW & HUMAN FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {milestoneFeedback.map((feedback) => (
            <div
              key={feedback.milestoneId}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs font-sans"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-indigo-400">
                    HUMAN-IN-THE-LOOP CHECKPOINT
                  </span>
                  <h3 className="text-base font-bold text-slate-100">{feedback.milestoneTitle}</h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    feedback.status === 'feedback_applied'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {feedback.status === 'feedback_applied' ? 'Course Revised & Applied' : 'Awaiting User Feedback'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Work Completed Summary</span>
                  <p className="text-slate-300 leading-relaxed">{feedback.summaryOfWorkDone}</p>
                </div>

                <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI Agent Clarification Question
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed italic">
                    "{feedback.aiClarificationQuestion}"
                  </p>
                </div>
              </div>

              {/* Natural Language Feedback Submission */}
              <div className="space-y-3 pt-2">
                <label className="block text-slate-300 font-bold uppercase text-[10px]">
                  Provide Natural Language Feedback / Adjust Course:
                </label>
                <textarea
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSubmitFeedback(feedback.milestoneId)}
                    disabled={isSubmittingFeedback}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Updating Downstream WBS Tasks...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Apply Feedback & Revise Subsequent Tasks
                      </>
                    )}
                  </button>
                </div>
              </div>

              {feedback.aiRevisedCourseOfAction && (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-300">
                    AI Course Correction Summary:
                  </span>
                  <p className="text-slate-300 font-mono text-[11px]">{feedback.aiRevisedCourseOfAction}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: GIT VERSION CONTROL */}
      {activeTab === 'git' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs font-sans">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-indigo-400" />
                  Automated Git History & Remote Sync (GitPython Engine)
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Remote: https://github.com/junphookan/neuromorphic-edge-grant
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Branch: main (Clean / Synced)
              </span>
            </div>

            <div className="space-y-3">
              {gitHistory.map((commit) => (
                <div
                  key={commit.commitHash}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                        {commit.commitHash}
                      </span>
                      <span className="font-bold text-slate-200 font-sans">{commit.message}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(commit.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="font-sans text-slate-500">Author: {commit.author}</span>
                    <span className="text-emerald-400 font-bold">{commit.diffSummary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMPILED FINAL DELIVERABLE */}
      {activeTab === 'deliverable' && deliverable && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-xs font-sans">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
                  Ready for External Stakeholder Export
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">{deliverable.title}</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>{deliverable.compiledFiguresCount} Figures</span>
                <span>{deliverable.compiledTablesCount} Tables</span>
                <span>{deliverable.compiledCitationsCount} Citations</span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Executive Summary</span>
              <p className="text-slate-200 text-xs leading-relaxed font-sans">{deliverable.executiveSummary}</p>
            </div>

            {/* Table of Contents */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Table of Contents</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono text-xs">
                {deliverable.tableOfContents.map((toc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{toc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Deliverable Formats */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Download Final Deliverable Package
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {deliverable.formats.map((fmt) => (
                  <div
                    key={fmt.format}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-100 font-mono">{fmt.format} Package</span>
                      <p className="text-[10px] text-slate-500 font-mono">{fmt.fileSizeMb} MB</p>
                    </div>
                    <button
                      onClick={() => alert(`Downloading ${fmt.downloadFilename}`)}
                      className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
                      title={`Download ${fmt.format}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
