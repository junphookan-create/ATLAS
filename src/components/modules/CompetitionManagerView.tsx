import React, { useState, useEffect } from 'react';
import {
  Trophy,
  CheckSquare,
  Square,
  Globe,
  Upload,
  FileCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  FileText,
  Bot,
  Sliders,
  Send,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ChevronRight,
  Award,
  Share2,
  Lock,
  Search,
  Check,
  Calendar,
  Flame,
} from 'lucide-react';
import {
  Competition,
  CompetitionSubtask,
  DraftArtifact,
  StructuredRules,
  BrowserFormFieldMapping,
} from '../../types';

interface CompetitionManagerViewProps {
  competitions: Competition[];
  onToggleChecklist: (competitionId: string, taskId: string) => void;
  onRequestBrowserSubmission: (competition: Competition) => void;
  onRefreshCompetitions?: () => void;
}

export const CompetitionManagerView: React.FC<CompetitionManagerViewProps> = ({
  competitions,
  onToggleChecklist,
  onRequestBrowserSubmission,
  onRefreshCompetitions,
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(competitions[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'checklist' | 'rules' | 'drafting' | 'browser_actuator' | 'monitor'>('checklist');
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [editingDraftContent, setEditingDraftContent] = useState<string>('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState<boolean>(false);
  const [isAutofilling, setIsAutofilling] = useState<boolean>(false);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [promptGuidance, setPromptGuidance] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeComp = competitions.find((c) => c.id === selectedCompId) || competitions[0];

  useEffect(() => {
    if (competitions.length > 0 && (!selectedCompId || !competitions.some((c) => c.id === selectedCompId))) {
      setSelectedCompId(competitions[0].id);
    }
  }, [competitions, selectedCompId]);

  useEffect(() => {
    if (activeComp?.draftArtifacts && activeComp.draftArtifacts.length > 0) {
      const activeDraft = activeComp.draftArtifacts.find((d) => d.id === selectedDraftId) || activeComp.draftArtifacts[0];
      setSelectedDraftId(activeDraft.id);
      setEditingDraftContent(activeDraft.content);
    } else {
      setSelectedDraftId('');
      setEditingDraftContent('');
    }
  }, [activeComp, selectedDraftId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateDraft = async (fieldKey: string) => {
    if (!activeComp) return;
    setIsGeneratingDraft(true);
    try {
      const res = await fetch(`/api/competitions/${activeComp.id}/drafts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldKey, customPrompt: promptGuidance }),
      });
      const data = await res.json();
      if (data.draftArtifact) {
        showToast(`Synthesized and critiqued draft for "${fieldKey}" (Score: ${data.draftArtifact.selfCritiqueScore}/100)`);
        if (onRefreshCompetitions) onRefreshCompetitions();
      }
    } catch (err: any) {
      showToast(`Drafting failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!activeComp || !selectedDraftId) return;
    try {
      const res = await fetch(`/api/competitions/${activeComp.id}/drafts/${selectedDraftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingDraftContent, status: 'APPROVED' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Draft approved and finalized for submission dossier.');
        if (onRefreshCompetitions) onRefreshCompetitions();
      }
    } catch (err: any) {
      showToast(`Save failed: ${err?.message || 'Server error'}`);
    }
  };

  const handleTriggerBrowserAutofill = async () => {
    if (!activeComp) return;
    setIsAutofilling(true);
    try {
      const res = await fetch(`/api/competitions/${activeComp.id}/browser/autofill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Playwright DOM actuator completed! Pre-submission screenshot sent to Approval Center.');
        onRequestBrowserSubmission(activeComp);
        if (onRefreshCompetitions) onRefreshCompetitions();
      }
    } catch (err: any) {
      showToast(`Autofill error: ${err?.message || 'Server error'}`);
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleRunMonitorCheck = async () => {
    if (!activeComp) return;
    setIsMonitoring(true);
    try {
      const res = await fetch(`/api/competitions/${activeComp.id}/monitor/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.monitor.isWinner ? '🎉 Winner detected! Celebration workflow triggered.' : 'Post-submission monitor updated status.');
        if (onRefreshCompetitions) onRefreshCompetitions();
      }
    } catch (err: any) {
      showToast(`Monitor check error: ${err?.message || 'Server error'}`);
    } finally {
      setIsMonitoring(false);
    }
  };

  const completedCount = activeComp?.checklist?.filter((t) => t.completed).length || 0;
  const totalChecklistCount = activeComp?.checklist?.length || 1;
  const progressPercent = Math.round((completedCount / totalChecklistCount) * 100);

  const selectedDraft = activeComp?.draftArtifacts?.find((d) => d.id === selectedDraftId) || activeComp?.draftArtifacts?.[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-indigo-400/40 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs font-mono font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              MODULE 2
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • Competition Manager: End-to-End Submission Automation & Tracking
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 flex items-center space-x-3">
            <span>Autonomous Submission Orchestrator</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-normal">
              Stateful Workflow Engine
            </span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onRefreshCompetitions && onRefreshCompetitions()}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono rounded-xl flex items-center space-x-2 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Sync Competitions</span>
          </button>
          {activeComp && (
            <button
              onClick={handleTriggerBrowserAutofill}
              disabled={isAutofilling}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-950/60 transition-all cursor-pointer disabled:opacity-50"
            >
              <Globe className="w-4 h-4" />
              <span>{isAutofilling ? 'Actuating Playwright...' : 'Actuate Browser Submission'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pursued Competitions List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Active Competitions ({competitions.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Real-Time Ingestion</span>
          </div>

          <div className="space-y-3">
            {competitions.map((comp) => {
              const isSelected = comp.id === selectedCompId;
              const compDone = comp.checklist?.filter((t) => t.completed).length || 0;
              const compTotal = comp.checklist?.length || 1;
              const pct = Math.round((compDone / compTotal) * 100);

              let statusBadge = (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono uppercase">
                  In Progress
                </span>
              );
              if (comp.status === 'won') {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>Won 1st Place</span>
                  </span>
                );
              } else if (comp.status === 'submitted') {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase">
                    Submitted
                  </span>
                );
              }

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono text-[10px]">
                      {comp.organizer}
                    </span>
                    <span className="text-amber-400 font-mono font-bold text-xs">{comp.prizePool}</span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2">
                    {comp.title}
                  </h4>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Progress ({compDone}/{compTotal} Tasks)</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1.5 border-t border-slate-800/80">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{comp.deadline}</span>
                    </span>
                    {statusBadge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Inspection & Actuation Pane */}
        {activeComp ? (
          <div className="lg:col-span-8 space-y-4">
            {/* Active Header Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                      {activeComp.organizer}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {activeComp.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 mt-1">{activeComp.title}</h2>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Prize Pool</div>
                    <div className="text-sm font-mono font-bold text-amber-400">{activeComp.prizePool}</div>
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'checklist'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Dynamic Checklist ({activeComp.checklist?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('rules')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'rules'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Structured Rules (2-Stage LLM)</span>
                </button>

                <button
                  onClick={() => setActiveTab('drafting')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'drafting'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Drafting & Self-Critique</span>
                </button>

                <button
                  onClick={() => setActiveTab('browser_actuator')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'browser_actuator'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Browser Actuator & Audit</span>
                </button>

                <button
                  onClick={() => setActiveTab('monitor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'monitor'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Post-Submission Monitor</span>
                </button>
              </div>

              {/* TAB 1: DYNAMIC CHECKLIST */}
              {activeTab === 'checklist' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 font-mono">Critical-Path Backward Scheduling: </span>
                      <span className="text-slate-200 font-semibold font-mono">
                        Target Deadline {activeComp.submissionDeadline || activeComp.deadline}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-emerald-400 font-bold">
                      {progressPercent}% Completed
                    </div>
                  </div>

                  <div className="space-y-2">
                    {activeComp.checklist?.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onToggleChecklist(activeComp.id, task.id)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          task.completed
                            ? 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="pt-0.5">
                            {task.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600 shrink-0" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {task.title}
                              </span>
                              {task.isCriticalPath && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-mono uppercase">
                                  Critical Path
                                </span>
                              )}
                              {task.assignedAgent && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] font-mono">
                                  {task.assignedAgent}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              {task.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono text-[11px] space-y-0.5">
                          <div className="text-slate-400">{task.effortHours} hrs effort</div>
                          <div className="text-[10px] text-slate-500">
                            Due: {task.relativeDeadline ? task.relativeDeadline.slice(0, 10) : 'T-minus 3d'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: STRUCTURED RULES (2-STAGE LLM) */}
              {activeTab === 'rules' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                        <FileCheck className="w-4 h-4" />
                        <span>Stage 1: Official Compressed Narrative (1,500 Words)</span>
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Pydantic Validated
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {activeComp.structuredRulesSummary}
                    </p>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2">
                      <span>Source URL:</span>
                      <a
                        href={activeComp.officialGuidelinesUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline truncate max-w-md flex items-center space-x-1"
                      >
                        <span>{activeComp.officialGuidelinesUrl || 'https://ieee-cas.org/challenges/guidelines'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Stage 2: Strict JSON Schema Rubric */}
                  {activeComp.structuredRules && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Evaluation Criteria */}
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Evaluation Criteria & Weights</span>
                        </h4>
                        <div className="space-y-2.5">
                          {activeComp.structuredRules.evaluation_criteria.map((ec, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                                <span>{ec.criterion}</span>
                                <span className="font-mono text-amber-400">{ec.weightPercentage}%</span>
                              </div>
                              <p className="text-[11px] text-slate-400">{ec.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Restrictions & Eligibility */}
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center space-x-2">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Restrictions & Constraints</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {activeComp.structuredRules.restrictions.map((r, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="text-rose-400 font-bold">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-3 border-t border-slate-800/80 space-y-1">
                          <span className="text-[11px] font-mono text-slate-400 uppercase">Eligibility Criteria:</span>
                          <p className="text-xs text-slate-300">
                            {activeComp.structuredRules.eligibility_criteria}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: AI DRAFTING & SELF-CRITIQUE */}
              {activeTab === 'drafting' && (
                <div className="space-y-4">
                  {/* Selectable Draft Artifacts */}
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {activeComp.requiredMaterials.map((mat, idx) => {
                      const draft = activeComp.draftArtifacts?.find((d) => d.fieldKey === mat);
                      const isSelected = draft?.id === selectedDraftId || (!selectedDraftId && idx === 0);
                      return (
                        <button
                          key={mat}
                          onClick={() => {
                            if (draft) {
                              setSelectedDraftId(draft.id);
                              setEditingDraftContent(draft.content);
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center space-x-2 border transition-all whitespace-nowrap ${
                            isSelected
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{mat}</span>
                          {draft && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                              {draft.selfCritiqueScore}/100
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Draft Editor Pane */}
                  {selectedDraft ? (
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                              Version {selectedDraft.version}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {selectedDraft.wordCount} words (Max {selectedDraft.maxWords})
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-100 mt-1">{selectedDraft.title}</h3>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-[10px] font-mono text-slate-400">Self-Critique Score</div>
                            <div className="text-sm font-mono font-bold text-emerald-400">
                              {selectedDraft.selfCritiqueScore} / 100
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Textarea for Live Human In-Line Editing */}
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
                          <span>Live In-Line Document Editor:</span>
                          <span className="text-[10px] text-slate-500">Auto-saved to Document Generator Artifacts</span>
                        </label>
                        <textarea
                          rows={7}
                          value={editingDraftContent}
                          onChange={(e) => setEditingDraftContent(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none leading-relaxed resize-y"
                        />
                      </div>

                      {/* Self-Critique Feedback & LTM Citations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1.5">
                          <span className="font-mono text-amber-400 font-semibold flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Self-Critique Scoring Loop Notes:</span>
                          </span>
                          <ul className="space-y-1 text-[11px] text-slate-300">
                            {selectedDraft.critiqueNotes.map((note, i) => (
                              <li key={i} className="flex items-start space-x-1.5">
                                <span className="text-amber-400 font-bold">•</span>
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1.5">
                          <span className="font-mono text-indigo-400 font-semibold flex items-center space-x-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>LTM & Knowledge Workspace Citations:</span>
                          </span>
                          <div className="space-y-1 text-[11px] text-slate-300">
                            <div className="text-slate-400">Winning Templates:</div>
                            {selectedDraft.ltmExamplesUsed.map((ex, i) => (
                              <div key={i} className="text-indigo-300 truncate">
                                ↳ {ex}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                        <div className="flex items-center space-x-2 flex-1 max-w-md">
                          <input
                            type="text"
                            placeholder="Provide refinement prompt to Drafting Agent..."
                            value={promptGuidance}
                            onChange={(e) => setPromptGuidance(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                          />
                          <button
                            onClick={() => handleGenerateDraft(selectedDraft.fieldKey)}
                            disabled={isGeneratingDraft}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-mono rounded-lg flex items-center space-x-1 shrink-0 disabled:opacity-50"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>{isGeneratingDraft ? 'Revising...' : 'Re-Draft'}</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={handleSaveDraft}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono rounded-xl flex items-center space-x-2 transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve for Submission Dossier</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-3">
                      <Bot className="w-8 h-8 text-indigo-400 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-300 font-mono">No Draft Artifact Synthesized Yet</h4>
                      <button
                        onClick={() => handleGenerateDraft(activeComp.requiredMaterials[0] || 'Executive Abstract')}
                        disabled={isGeneratingDraft}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono rounded-xl font-bold"
                      >
                        {isGeneratingDraft ? 'Drafting Agent Running...' : 'Spawn Drafting Agent'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BROWSER ACTUATOR & AUDIT */}
              {activeTab === 'browser_actuator' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Playwright DOM Label & Semantic Field Mapping</span>
                      </h4>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        Browserless Chrome Farm
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeComp.browserSubmissionState?.formFieldMappings?.map((mapping, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span className="text-slate-200 font-semibold">{mapping.fieldName}</span>
                            <span className="text-[10px] text-slate-500">[{mapping.selector}]</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-[11px] text-slate-400 truncate max-w-xs">{mapping.value}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] uppercase">
                              {mapping.fieldType}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pre-Submission Screenshot Audit Viewer */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-indigo-400" />
                        <span>Pre-Submission Full-Page Screenshot Audit (Mandatory Human Sign-Off)</span>
                      </h4>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        Approval Center Attached
                      </span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-72 group">
                      <img
                        src={
                          activeComp.browserSubmissionState?.preSubmissionScreenshot ||
                          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
                        }
                        alt="Pre-submission form screenshot"
                        className="w-full object-cover object-top"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-4">
                        <div className="text-xs font-mono text-slate-300 space-y-0.5">
                          <div className="font-bold text-white">Full Playwright Render State</div>
                          <div className="text-[10px] text-slate-400">HAR Audit Log: {activeComp.browserSubmissionState?.harLogUri || 'gs://atlas-audit/log.har'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[11px] text-slate-400 font-mono">
                        Status: <span className="text-amber-400 font-semibold">{activeComp.browserSubmissionState?.status || 'AWAITING_APPROVAL'}</span>
                      </div>

                      <button
                        onClick={handleTriggerBrowserAutofill}
                        disabled={isAutofilling}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-300" />
                        <span>Push to Human Approval Center</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: POST-SUBMISSION MONITOR */}
              {activeTab === 'monitor' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Post-Submission Celery Monitor (Daily Polling)</span>
                      </h4>
                      <button
                        onClick={handleRunMonitorCheck}
                        disabled={isMonitoring}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg flex items-center space-x-1.5 transition-all"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isMonitoring ? 'animate-spin' : ''}`} />
                        <span>Run Live Check</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">Email Assistant Tracking</span>
                        <p className="text-slate-200 font-semibold">
                          {activeComp.postSubmissionMonitor?.emailTrackingStatus || 'Watching inbox for portal confirmation'}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">Portal Scraped Status</span>
                        <p className="text-indigo-300 font-semibold">
                          {activeComp.postSubmissionMonitor?.portalStatusScraped || 'In Review'}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase">Winner RSS Feeds</span>
                        <p className="text-amber-400 font-semibold">
                          {activeComp.postSubmissionMonitor?.winnerListStatus || 'Judging in progress'}
                        </p>
                      </div>
                    </div>

                    {/* Celebration Banner if Won */}
                    {activeComp.postSubmissionMonitor?.isWinner && (
                      <div className="p-4 bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border border-amber-500/40 rounded-xl space-y-3">
                        <div className="flex items-center space-x-2 text-amber-300 font-bold font-mono text-sm">
                          <Trophy className="w-5 h-5 text-amber-400" />
                          <span>Celebratory Workflow Triggered: First Place Winner!</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {activeComp.postSubmissionMonitor.socialDraft || 'Winning announcement draft prepared for LinkedIn & X.'}
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => showToast('Social media announcement pushed to Approval Center queue.')}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono rounded-lg flex items-center space-x-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Review Social Announcement in Approval Center</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            Select a pursued competition on the left or pursue one from the Opportunity Discovery Engine.
          </div>
        )}
      </div>
    </div>
  );
};
