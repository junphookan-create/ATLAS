import React, { useState, useEffect } from 'react';
import {
  Trophy,
  CheckSquare,
  Square,
  FileText,
  Sparkles,
  Loader2,
  ListChecks,
  Clock,
  Shield,
  Layers,
  Award,
  Lightbulb,
  Scale,
  TrendingUp,
  Mail,
  Send,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Zap,
  Flame,
  BarChart3,
} from 'lucide-react';
import {
  FastApiCompetition,
  WinnerIntelligenceItem,
  RubricCriterionItem,
  CriticalAnalysisAudit,
  ActionableImprovement,
  FollowUpCommunicationPlan,
} from '../../types/apiTypes';
import { api } from '../../lib/api';

interface CompetitionsSectionProps {
  competitions: FastApiCompetition[];
  isLoading: boolean;
  onExtractRules: (id: string) => Promise<void>;
  onDraftMaterial: (id: string, material: string) => Promise<void>;
}

export const CompetitionsSection: React.FC<CompetitionsSectionProps> = ({
  competitions,
  isLoading,
  onExtractRules,
  onDraftMaterial,
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(
    competitions.length > 0 ? competitions[0].id : 'comp-201'
  );
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'winners' | 'ideas' | 'rubric' | 'improvements' | 'followups'
  >('overview');

  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [draftingMap, setDraftingMap] = useState<Record<string, boolean>>({});

  // Advanced Intelligence State
  const [winnersData, setWinnersData] = useState<Record<string, WinnerIntelligenceItem[]>>({});
  const [ideasData, setIdeasData] = useState<Record<string, any[]>>({});
  const [rubricData, setRubricData] = useState<
    Record<string, { criteria: RubricCriterionItem[]; analysis?: CriticalAnalysisAudit }>
  >({});
  const [improvementsData, setImprovementsData] = useState<
    Record<string, ActionableImprovement[]>
  >({});
  const [followUpsData, setFollowUpsData] = useState<
    Record<string, FollowUpCommunicationPlan[]>
  >({});

  const [loadingIntelligence, setLoadingIntelligence] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedComp =
    competitions.find((c) => c.id === selectedCompId) || competitions[0];

  // Auto-fetch intelligence when switching tabs or competition
  useEffect(() => {
    if (!selectedComp) return;
    const cid = selectedComp.id;

    if (activeSubTab === 'winners' && !winnersData[cid]) {
      fetchWinners(cid);
    } else if (activeSubTab === 'ideas' && !ideasData[cid]) {
      fetchIdeas(cid);
    } else if (activeSubTab === 'rubric' && !rubricData[cid]) {
      fetchRubric(cid);
    } else if (activeSubTab === 'improvements' && !improvementsData[cid]) {
      fetchImprovements(cid);
    } else if (activeSubTab === 'followups' && !followUpsData[cid]) {
      fetchFollowUps(cid);
    }
  }, [selectedCompId, activeSubTab]);

  const fetchWinners = async (cid: string) => {
    setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_winners`]: true }));
    try {
      const res = await api.getCompetitionWinnersAnalysis(cid);
      if (res?.previous_winners_analysis) {
        setWinnersData((prev) => ({ ...prev, [cid]: res.previous_winners_analysis }));
      }
    } catch (e) {
      console.warn('Failed to load winners analysis:', e);
    } finally {
      setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_winners`]: false }));
    }
  };

  const fetchIdeas = async (cid: string) => {
    setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_ideas`]: true }));
    try {
      const res = await api.getCompetitionIdeas(cid);
      if (res?.ideas_and_differentiators) {
        setIdeasData((prev) => ({ ...prev, [cid]: res.ideas_and_differentiators }));
      }
    } catch (e) {
      console.warn('Failed to load ideas:', e);
    } finally {
      setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_ideas`]: false }));
    }
  };

  const fetchRubric = async (cid: string) => {
    setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_rubric`]: true }));
    try {
      const res = await api.getCompetitionRubricAnalysis(cid);
      if (res) {
        setRubricData((prev) => ({
          ...prev,
          [cid]: {
            criteria: res.rubric_criteria || [],
            analysis: res.critical_analysis,
          },
        }));
      }
    } catch (e) {
      console.warn('Failed to load rubric analysis:', e);
    } finally {
      setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_rubric`]: false }));
    }
  };

  const fetchImprovements = async (cid: string) => {
    setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_improvements`]: true }));
    try {
      const res = await api.getCompetitionImprovements(cid);
      if (res?.actionable_improvements) {
        setImprovementsData((prev) => ({ ...prev, [cid]: res.actionable_improvements }));
      }
    } catch (e) {
      console.warn('Failed to load improvements:', e);
    } finally {
      setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_improvements`]: false }));
    }
  };

  const fetchFollowUps = async (cid: string) => {
    setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_followups`]: true }));
    try {
      const res = await api.getCompetitionFollowUps(cid);
      if (res?.follow_up_communications) {
        setFollowUpsData((prev) => ({ ...prev, [cid]: res.follow_up_communications }));
      }
    } catch (e) {
      console.warn('Failed to load follow-up communications:', e);
    } finally {
      setLoadingIntelligence((prev) => ({ ...prev, [`${cid}_followups`]: false }));
    }
  };

  const handleExtract = async (id: string) => {
    setExtractingId(id);
    try {
      await onExtractRules(id);
    } finally {
      setExtractingId(null);
    }
  };

  const handleDraft = async (id: string, materialName: string) => {
    const key = `${id}_${materialName}`;
    setDraftingMap((prev) => ({ ...prev, [key]: true }));
    try {
      await onDraftMaterial(id, materialName);
    } finally {
      setDraftingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleImprovementApplied = (impId: string) => {
    if (!selectedComp) return;
    const cid = selectedComp.id;
    setImprovementsData((prev) => {
      const list = prev[cid] || [];
      return {
        ...prev,
        [cid]: list.map((item) =>
          item.id === impId ? { ...item, applied: !item.applied } : item
        ),
      };
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-yellow-950/80 border border-yellow-800/50 rounded-xl text-yellow-400 shadow-lg shadow-yellow-950/40">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Competition Winning Engine & Intelligence
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-950 text-yellow-300 border border-yellow-800 font-mono">
                CHAMPIONSHIP SUITE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical winner pattern analysis, rubric critical review, actionable improvements & judge follow-ups
            </p>
          </div>
        </div>

        {/* Competition Selector Pill */}
        {competitions.length > 0 && (
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Target:</span>
            <select
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1 focus:outline-none focus:border-yellow-500 font-medium"
            >
              {competitions.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading && competitions.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mx-auto mb-2" />
          <p className="text-xs">Loading competition intelligence modules...</p>
        </div>
      ) : competitions.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/50 border border-slate-800/60 rounded-lg">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No active competitions found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Scan for high-match opportunities in the Opportunities section to pursue new challenges.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sub-Navigation Tabs */}
          <div className="flex items-center space-x-1 border-b border-slate-800 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg font-medium transition-colors cursor-pointer border-b-2 ${
                activeSubTab === 'overview'
                  ? 'border-yellow-400 text-yellow-300 bg-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Submission Overview</span>
            </button>

            <button
              onClick={() => setActiveSubTab('winners')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg font-medium transition-colors cursor-pointer border-b-2 ${
                activeSubTab === 'winners'
                  ? 'border-yellow-400 text-yellow-300 bg-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Past Winners Intelligence</span>
            </button>

            <button
              onClick={() => setActiveSubTab('ideas')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg font-medium transition-colors cursor-pointer border-b-2 ${
                activeSubTab === 'ideas'
                  ? 'border-yellow-400 text-yellow-300 bg-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              <span>Innovative Angles</span>
            </button>

            <button
              onClick={() => setActiveSubTab('rubric')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg font-medium transition-colors cursor-pointer border-b-2 ${
                activeSubTab === 'rubric'
                  ? 'border-yellow-400 text-yellow-300 bg-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rubric & Critical Audit</span>
            </button>

            <button
              onClick={() => setActiveSubTab('improvements')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg font-medium transition-colors cursor-pointer border-b-2 ${
                activeSubTab === 'improvements'
                  ? 'border-yellow-400 text-yellow-300 bg-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Actionable Upgrades</span>
            </button>

            <button
              onClick={() => setActiveSubTab('followups')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg font-medium transition-colors cursor-pointer border-b-2 ${
                activeSubTab === 'followups'
                  ? 'border-yellow-400 text-yellow-300 bg-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>Follow-ups & Outreach</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && selectedComp && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-slate-100">{selectedComp.title}</h3>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                      {selectedComp.status}
                    </span>
                  </div>
                  {selectedComp.url && (
                    <a
                      href={selectedComp.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-mono mt-0.5 block"
                    >
                      {selectedComp.url}
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleExtract(selectedComp.id)}
                  disabled={extractingId === selectedComp.id}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
                >
                  {extractingId === selectedComp.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  )}
                  <span>Re-Extract Rules</span>
                </button>
              </div>

              {/* Extracted Rules Grid */}
              {selectedComp.rules ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Eligibility */}
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-2">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Eligibility Rules</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {selectedComp.rules.eligibility?.map((r, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-indigo-400">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Materials */}
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Required Deliverables</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {selectedComp.rules.materials?.map((m, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deadlines */}
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Submission Timeline</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-400 font-mono">
                      {selectedComp.rules.deadlines?.map((d, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-900/40 rounded-lg text-xs text-slate-400 border border-slate-800">
                  Rules not yet extracted. Click "Re-Extract Rules" to analyze competition terms with Gemini.
                </div>
              )}

              {/* Checklist Items */}
              {selectedComp.checklist_items && selectedComp.checklist_items.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dynamic Execution Checklist</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedComp.checklist_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2 p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={item.completed ? 'line-through text-slate-500' : ''}>
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Drafting Action Area */}
              <div className="pt-3 border-t border-slate-900">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Autonomous Synthesis:</span>
                  {['Technical Report Abstract', 'Reproducibility Statement', 'Model Architecture Summary'].map(
                    (mat) => {
                      const isDrafting = draftingMap[`${selectedComp.id}_${mat}`];
                      return (
                        <button
                          key={mat}
                          onClick={() => handleDraft(selectedComp.id, mat)}
                          disabled={isDrafting}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isDrafting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                          <span>Draft "{mat}"</span>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Drafted Material Preview */}
                {selectedComp.drafted_materials && Object.keys(selectedComp.drafted_materials).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {Object.entries(selectedComp.drafted_materials).map(([matName, content]) => (
                      <div
                        key={matName}
                        className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Synthesized Deliverable: {matName}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(String(content || ''), matName)}
                            className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center space-x-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedId === matName ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans bg-slate-950/60 p-3 rounded border border-slate-850">
                          {String(content || '')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PREVIOUS WINNERS INTELLIGENCE */}
          {activeSubTab === 'winners' && selectedComp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Championship Case Studies & Winning Factors
                  </span>
                </div>
                <button
                  onClick={() => fetchWinners(selectedComp.id)}
                  disabled={loadingIntelligence[`${selectedComp.id}_winners`]}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span>Refresh Analysis</span>
                </button>
              </div>

              {loadingIntelligence[`${selectedComp.id}_winners`] ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
                  <p className="text-xs">Analyzing historical champions and judge feedback...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(winnersData[selectedComp.id] || []).map((win, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            {win.year} • {win.prize}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                            {win.team_name}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 leading-snug">
                          {win.project_title}
                        </h4>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {win.submission_breakdown}
                        </p>

                        <div className="pt-2 border-t border-slate-900 space-y-1.5">
                          <div className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>Why It Won:</span>
                          </div>
                          <ul className="space-y-1 text-xs text-slate-400">
                            {win.winning_factors?.map((f, i) => (
                              <li key={i} className="flex items-start space-x-1.5">
                                <span className="text-amber-400">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-900 space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {win.tech_stack?.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        {win.github_repo && (
                          <a
                            href={win.github_repo}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Winning Code</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INNOVATIVE ANGLES & IDEAS */}
          {activeSubTab === 'ideas' && selectedComp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    High-Uniqueness Proposal Angles & Technical Differentiators
                  </span>
                </div>
                <button
                  onClick={() => fetchIdeas(selectedComp.id)}
                  disabled={loadingIntelligence[`${selectedComp.id}_ideas`]}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span>Synthesize New Angles</span>
                </button>
              </div>

              {loadingIntelligence[`${selectedComp.id}_ideas`] ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mx-auto mb-2" />
                  <p className="text-xs">Generating breakthrough concept proposals...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(ideasData[selectedComp.id] || []).map((idea, idx) => (
                    <div
                      key={idea.id || idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800 flex items-center space-x-1">
                            <Flame className="w-3 h-3 text-yellow-400" />
                            <span>Uniqueness: {idea.uniqueness_index}/10</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                            {idea.execution_complexity} Complexity
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 leading-snug">
                          {idea.title}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {idea.novelty_summary}
                        </p>
                      </div>

                      <div className="p-2.5 rounded bg-indigo-950/40 border border-indigo-900/50 space-y-1">
                        <div className="text-[11px] font-bold text-indigo-300 flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-indigo-400" />
                          <span>Winning Positioning:</span>
                        </div>
                        <p className="text-xs text-slate-300">{idea.recommended_angle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RUBRIC & CRITICAL AUDIT */}
          {activeSubTab === 'rubric' && selectedComp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Official Rubric Evaluation & Multi-Dimensional Critical Audit
                  </span>
                </div>
                <button
                  onClick={() => fetchRubric(selectedComp.id)}
                  disabled={loadingIntelligence[`${selectedComp.id}_rubric`]}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Audit Submission</span>
                </button>
              </div>

              {loadingIntelligence[`${selectedComp.id}_rubric`] ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs">Evaluating submission against scoring rubric & threat vectors...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Critical Audit Executive Card */}
                  {rubricData[selectedComp.id]?.analysis && (
                    <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-bold text-slate-100">
                            Overall Readiness Score: {rubricData[selectedComp.id].analysis?.overall_score}/100
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {rubricData[selectedComp.id].analysis?.confidence_rating}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 italic">
                        "{rubricData[selectedComp.id].analysis?.verdict}"
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-900/40 space-y-1">
                          <div className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Core Strengths</span>
                          </div>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {rubricData[selectedComp.id].analysis?.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-900/40 space-y-1">
                          <div className="text-[11px] font-bold text-rose-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Vulnerabilities & Fixes</span>
                          </div>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {rubricData[selectedComp.id].analysis?.vulnerabilities.map((v, i) => (
                              <li key={i}>• {v}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-900/40 space-y-1">
                          <div className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Competitive Threat Vector</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {rubricData[selectedComp.id].analysis?.competitive_threat_analysis}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rubric Criteria List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Weighted Scoring Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(rubricData[selectedComp.id]?.criteria || []).map((crit) => (
                        <div
                          key={crit.id}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-slate-200">{crit.criterion}</h5>
                            <span className="text-[11px] font-mono font-bold text-indigo-400">
                              {crit.weight_percentage}% Weight • Score: {crit.our_current_score || 9.0}/10
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{crit.description}</p>
                          {crit.gap_analysis && (
                            <div className="p-2 rounded bg-slate-900 text-xs text-slate-300 border border-slate-800">
                              <span className="text-indigo-400 font-semibold">Gap Analysis: </span>
                              {crit.gap_analysis}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTIONABLE IMPROVEMENTS */}
          {activeSubTab === 'improvements' && selectedComp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Prioritized Upgrade Loops to Maximize Scoring Impact
                  </span>
                </div>
                <button
                  onClick={() => fetchImprovements(selectedComp.id)}
                  disabled={loadingIntelligence[`${selectedComp.id}_improvements`]}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Synthesize Upgrades</span>
                </button>
              </div>

              {loadingIntelligence[`${selectedComp.id}_improvements`] ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs">Formulating actionable score improvements...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(improvementsData[selectedComp.id] || []).map((imp) => (
                    <div
                      key={imp.id}
                      className={`p-4 rounded-xl border transition-all ${
                        imp.applied
                          ? 'bg-slate-950/60 border-slate-800 opacity-80'
                          : 'bg-slate-950 border-emerald-900/60 shadow-lg shadow-emerald-950/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              imp.priority === 'critical'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {imp.priority}
                          </span>
                          <h4 className="text-sm font-bold text-slate-100">{imp.title}</h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {imp.impact_on_score}
                          </span>
                          <button
                            onClick={() => toggleImprovementApplied(imp.id)}
                            className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer transition-colors ${
                              imp.applied
                                ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {imp.applied ? 'Mark Unapplied' : 'Mark Applied'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-500 font-semibold">Current State:</span>
                          <p className="text-slate-400">{imp.current_state}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-emerald-400 font-semibold">Recommended Upgrade:</span>
                          <p className="text-slate-200">{imp.recommended_upgrade}</p>
                        </div>
                      </div>

                      {imp.implementation_pseudocode_or_diff && (
                        <div className="mt-3 p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
                          {imp.implementation_pseudocode_or_diff}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FOLLOW-UPS & OUTREACH */}
          {activeSubTab === 'followups' && selectedComp && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Post-Submission Communications, Judge Q&A & Sponsor Networking
                  </span>
                </div>
                <button
                  onClick={() => fetchFollowUps(selectedComp.id)}
                  disabled={loadingIntelligence[`${selectedComp.id}_followups`]}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>Draft New Templates</span>
                </button>
              </div>

              {loadingIntelligence[`${selectedComp.id}_followups`] ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500 mx-auto mb-2" />
                  <p className="text-xs">Preparing customized outreach and judge correspondence...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(followUpsData[selectedComp.id] || []).map((comm) => (
                    <div
                      key={comm.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                              {comm.stage.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              To: {comm.target_recipient}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-100 mt-1">
                            {comm.subject_line}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopy(comm.body_content, comm.id)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedId === comm.id ? 'Copied' : 'Copy Body'}</span>
                          </button>
                          <button
                            onClick={() => alert(`Communication dispatched to ${comm.target_recipient}`)}
                            className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            <span>Dispatch via Outreach CRM</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                        {comm.body_content}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                        <span className="text-amber-400 font-semibold">Tactical Guidance:</span>
                        <span>{comm.tactical_notes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
