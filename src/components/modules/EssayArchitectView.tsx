import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Sparkles,
  BookOpen,
  Share2,
  ThumbsUp,
  MessageSquare,
  ShieldAlert,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Layers,
  ChevronRight,
  TrendingUp,
  Flame,
  FileCheck,
  Zap,
  Edit3,
  Copy,
  Check,
} from 'lucide-react';
import {
  SocialAdvicePost,
  AdviceTopicCluster,
  BrainstormMetaphorNode,
  EssayTargetPrompt,
  CollegeEssayProject,
  AdmissionsReviewerFeedback,
  VoiceHumanizerMetrics,
  ApprovalRequest,
} from '../../types';

interface EssayArchitectViewProps {
  onRequestApproval?: (request: Partial<ApprovalRequest>) => void;
}

export const EssayArchitectView: React.FC<EssayArchitectViewProps> = ({ onRequestApproval }) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'reviewers' | 'social_compiler' | 'metaphors' | 'rag_corpus'>('editor');
  const [project, setProject] = useState<CollegeEssayProject | null>(null);
  const [prompts, setPrompts] = useState<EssayTargetPrompt[]>([]);
  const [topicClusters, setTopicClusters] = useState<AdviceTopicCluster[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialAdvicePost[]>([]);
  const [metaphors, setMetaphors] = useState<BrainstormMetaphorNode[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('hook');

  // Metaphor generator inputs
  const [domainA, setDomainA] = useState('');
  const [domainB, setDomainB] = useState('');
  const [isGeneratingMetaphor, setIsGeneratingMetaphor] = useState(false);

  // Review simulation loading
  const [isRunningReview, setIsRunningReview] = useState(false);
  const [socialFilter, setSocialFilter] = useState<string>('all');
  const [copiedDraft, setCopiedDraft] = useState(false);

  const fetchEssayData = async () => {
    try {
      const res = await fetch('/api/essay/overview');
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setPrompts(data.prompts || []);
        setTopicClusters(data.topicClusters || []);
        setSocialPosts(data.socialPosts || []);
        setMetaphors(data.brainstormMetaphors || []);
      }
    } catch (err) {
      console.error('Failed to fetch essay overview:', err);
    }
  };

  useEffect(() => {
    fetchEssayData();
  }, []);

  const handleSectionContentChange = async (sectionId: string, newContent: string) => {
    if (!project) return;
    try {
      const res = await fetch('/api/essay/section/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, content: newContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch (err) {
      console.error('Failed to update essay section:', err);
    }
  };

  const handleSynthesizeMetaphor = async () => {
    if (!domainA.trim() || !domainB.trim()) return;
    setIsGeneratingMetaphor(true);
    try {
      const res = await fetch('/api/essay/metaphors/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainA, domainB }),
      });
      if (res.ok) {
        const data = await res.json();
        setMetaphors([data.metaphor, ...metaphors]);
        setDomainA('');
        setDomainB('');
      }
    } catch (err) {
      console.error('Failed to synthesize metaphor:', err);
    } finally {
      setIsGeneratingMetaphor(false);
    }
  };

  const handleRunAdmissionsReview = async () => {
    setIsRunningReview(true);
    try {
      const res = await fetch('/api/essay/admissions-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (project) {
          setProject({ ...project, reviewerPanels: data.reviewers });
        }
        setActiveTab('reviewers');
      }
    } catch (err) {
      console.error('Failed to run admissions review:', err);
    } finally {
      setIsRunningReview(false);
    }
  };

  const handleCopyDraft = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.fullDraftText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const filteredPosts = socialPosts.filter((post) => {
    if (socialFilter === 'all') return true;
    return post.platform === socialFilter || post.category === socialFilter;
  });

  const activeSection = project?.sections.find((s) => s.sectionId === selectedSectionId) || project?.sections[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/70 to-slate-900 border border-purple-900/50 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                MODULE 17
              </span>
              <span className="text-xs text-slate-400 font-mono">• SOCIAL ADVICE COMPILER & ESSAY ARCHITECT</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>College Essay Architect & Admissions Simulator</span>
              <PenTool className="w-5 h-5 text-purple-400" />
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Harvest crowdsourced admissions wisdom from Reddit, YouTube, and Ivy counselors. Synthesize interdisciplinary metaphors, draft non-cliché narratives, and test drafts with a 3-person Admissions Committee simulation.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleRunAdmissionsReview}
              disabled={isRunningReview}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-purple-950 transition-all"
            >
              {isRunningReview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
              <span>Simulate Admissions Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Metrics & Humanizer Strip */}
      {project && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Total Word Count</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold font-mono text-slate-100">{project.voiceMetrics.totalWordCount}</span>
              <span className="text-[10px] text-slate-400">/ {project.selectedPrompt.maxWordLimit} max</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Authenticity Score</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold font-mono text-emerald-400">{project.voiceMetrics.voiceAuthenticityIndex}%</span>
              <span className="text-[10px] text-slate-400">Unmistakably Human</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Burstiness (Variance)</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold font-mono text-purple-400">{project.voiceMetrics.burstinessScore} / 100</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Perplexity Score</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold font-mono text-sky-400">{project.voiceMetrics.perplexityEstimate}</span>
              <span className="text-[10px] text-slate-400">Novel vocabulary</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">AI Likelihood</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold font-mono text-emerald-400">{project.voiceMetrics.aiLikelihoodScore}%</span>
              <span className="text-[10px] text-emerald-400 font-bold">Ultra Clean</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Clichés Detected</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold font-mono text-emerald-400">{project.voiceMetrics.clicheCount}</span>
              <span className="text-[10px] text-slate-400">0 generic tropes</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 flex-wrap gap-y-2">
        {[
          { id: 'editor', label: 'Section-by-Section Architect', icon: Edit3 },
          { id: 'reviewers', label: 'Simulated Admissions Committee', icon: GraduationCap },
          { id: 'social_compiler', label: 'Social Advice & Cliché Buster', icon: MessageSquare },
          { id: 'metaphors', label: 'Metaphor Synthesizer', icon: Sparkles },
          { id: 'rag_corpus', label: 'RAG Admitted Essays Reference', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SECTION-BY-SECTION ARCHITECT & DRAFTING */}
      {activeTab === 'editor' && project && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Selector & Prompt Outline */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Target Prompt</span>
                <span className="text-[10px] text-slate-500 font-mono">{project.selectedPrompt.institution}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">{project.selectedPrompt.promptNumber}</p>
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                "{project.selectedPrompt.promptText}"
              </p>
            </div>

            {/* Central Metaphor Card */}
            <div className="p-4 bg-purple-950/30 border border-purple-900/50 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-purple-300 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Central Metaphor Arc</span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                "{project.centralMetaphor}"
              </p>
            </div>

            {/* Section Blocks Navigation */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Narrative Structural Blocks
              </span>
              {project.sections.map((sec, idx) => (
                <div
                  key={sec.sectionId}
                  onClick={() => setSelectedSectionId(sec.sectionId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                    selectedSectionId === sec.sectionId
                      ? 'bg-purple-950/50 border-purple-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      {idx + 1}. {sec.title.split(':')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {sec.currentWordCount} / {sec.targetWordCount} w
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{sec.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Section Editor */}
          <div className="lg:col-span-2 space-y-4">
            {activeSection && (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 font-mono">{activeSection.title}</h3>
                    <p className="text-xs text-slate-400">{activeSection.purpose}</p>
                  </div>
                  <span className="text-xs font-mono text-purple-400 font-bold">
                    {activeSection.currentWordCount} words
                  </span>
                </div>

                <textarea
                  rows={9}
                  value={activeSection.content}
                  onChange={(e) => handleSectionContentChange(activeSection.sectionId, e.target.value)}
                  placeholder="Draft your section here with concrete sensory details, authentic voice, and philosophical reflection..."
                  className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-slate-200 font-sans leading-relaxed outline-none"
                />

                {/* Section Feedback Notes */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Architect Feedback & Safeguards:</span>
                  <div className="space-y-1.5">
                    {activeSection.feedbackNotes.map((note, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Complete Full Draft Preview */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-slate-100 font-mono">Consolidated Full Draft</h3>
                </div>
                <button
                  onClick={handleCopyDraft}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg flex items-center space-x-1.5 transition-all"
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDraft ? 'Copied' : 'Copy Full Draft'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl max-h-72 overflow-y-auto space-y-3 text-xs text-slate-300 leading-relaxed font-serif whitespace-pre-line">
                {project.fullDraftText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SIMULATED ADMISSIONS COMMITTEE */}
      {activeTab === 'reviewers' && project && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-100 font-mono">Simulated Admissions Review Committee</h3>
              <p className="text-xs text-slate-400">
                Multi-perspective evaluation evaluating distinctiveness, vulnerability, anti-AI voice, and intellectual vitality.
              </p>
            </div>
            <button
              onClick={handleRunAdmissionsReview}
              disabled={isRunningReview}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningReview ? 'animate-spin' : ''}`} />
              <span>Re-Evaluate Current Draft</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {project.reviewerPanels.map((reviewer) => (
              <div
                key={reviewer.reviewerId}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{reviewer.reviewerName}</h4>
                      <p className="text-[11px] text-purple-400 font-mono">{reviewer.roleTitle}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-purple-950 border border-purple-800 text-purple-300 font-mono font-bold text-xs rounded-lg">
                      {reviewer.overallScore} / 10
                    </span>
                  </div>

                  {/* Sub-scores */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>Intellect: <span className="text-slate-200">{reviewer.intellectualVitalityScore}/10</span></div>
                    <div>Authenticity: <span className="text-slate-200">{reviewer.authenticityVoiceScore}/10</span></div>
                    <div>Hook Power: <span className="text-slate-200">{reviewer.hookStrengthScore}/10</span></div>
                    <div>Narrative Arc: <span className="text-slate-200">{reviewer.narrativeArcScore}/10</span></div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Key Strengths:</span>
                    {reviewer.strengths.map((str, i) => (
                      <p key={i} className="text-xs text-slate-300 leading-snug flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </p>
                    ))}
                  </div>

                  {/* Vulnerabilities */}
                  {reviewer.vulnerabilitiesOrRedFlags.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Refinement Flags:</span>
                      {reviewer.vulnerabilitiesOrRedFlags.map((flag, i) => (
                        <p key={i} className="text-xs text-amber-200 leading-snug flex items-start space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{flag}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Line-by-Line Highlight */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Line-by-Line Excerpt:</span>
                    {reviewer.lineByLineCritique.map((crit, i) => (
                      <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                        <p className="text-purple-300 italic">"{crit.excerpt}"</p>
                        <p className="text-slate-300 font-sans">{crit.critique}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold text-center rounded-lg">
                    VERDICT: {reviewer.finalVerdict}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL ADVICE COMPILER & CLICHÉ BUSTER */}
      {activeTab === 'social_compiler' && (
        <div className="space-y-6">
          {/* Topic Consensus Clusters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-100 font-mono">Consensus Advice Clusters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topicClusters.map((cluster) => (
                <div key={cluster.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 font-mono">{cluster.topicName}</span>
                    <span className="text-[10px] font-mono text-purple-400 font-bold">{cluster.consensusScore}% Consensus</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cluster.summaryInsight}</p>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Recommended Practices:</span>
                    {cluster.recommendedDoList.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-[11px] text-slate-300 flex items-start space-x-1">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{item}</span>
                      </p>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">Strict Clichés to Avoid:</span>
                    {cluster.strictDontList.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-[11px] text-slate-400 flex items-start space-x-1">
                        <span className="text-rose-400 font-bold">✗</span>
                        <span>{item}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Posts Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-slate-100 font-mono">Harvested Social Posts & Dean Insights</h3>
              <div className="flex items-center space-x-1.5 text-xs font-mono">
                {['all', 'Reddit', 'YouTube', 'TikTok'].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setSocialFilter(plat)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                      socialFilter === plat
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
                        {post.platform}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{post.author}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({post.authorRole})</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">♥ {post.upvotesOrLikes.toLocaleString()}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100">{post.sourceTitle}</h4>
                  <p className="text-xs text-purple-200 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {post.extractedQuote}
                  </p>

                  <div className="space-y-1">
                    {post.keyTakeaways.map((takeaway, idx) => (
                      <p key={idx} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                        <span className="text-purple-400">•</span>
                        <span>{takeaway}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METAPHOR SYNTHESIZER */}
      {activeTab === 'metaphors' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 font-mono">Interdisciplinary Metaphor Synthesizer</h3>
            <p className="text-xs text-slate-400">
              Combine two seemingly unrelated passions (e.g. a technical/STEM specialty and an artistic/humanities hobby) to discover high-vitality personal metaphors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={domainA}
                onChange={(e) => setDomainA(e.target.value)}
                placeholder="Domain A (e.g. FPGA Verilog RTL, Quantum Error Correction, Entomology)"
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={domainB}
                onChange={(e) => setDomainB(e.target.value)}
                placeholder="Domain B (e.g. Bebop Jazz Saxophone, Sourdough Bread, 35mm Rangefinders)"
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleSynthesizeMetaphor}
              disabled={isGeneratingMetaphor || !domainA || !domainB}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 font-mono"
            >
              {isGeneratingMetaphor ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Synthesize Interdisciplinary Metaphor Node</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metaphors.map((node) => (
              <div key={node.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold rounded">
                    Potential: {node.potentialScore} / 10
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {node.id}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-100">{node.coreInterest}</h4>
                <p className="text-xs text-purple-200 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  "{node.metaphorConcept}"
                </p>
                <p className="text-[11px] text-slate-300">
                  <span className="font-semibold text-slate-200">Emotional Pivot:</span> {node.emotionalPivot}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: RAG ADMITTED ESSAYS CORPUS */}
      {activeTab === 'rag_corpus' && project && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">Admitted Ivy / Tier-1 Essays Knowledge Base</h3>
              <p className="text-xs text-slate-400">
                Vector-indexed semantic matches used for stylistic benchmarking and narrative trajectory reference.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.ragReferenceEssaysUsed.map((rag, idx) => (
              <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold rounded">
                    {rag.acceptedSchool}
                  </span>
                  <span className="text-xs font-mono text-purple-400 font-bold">{(rag.relevanceScore * 100).toFixed(0)}% Match</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100">{rag.essayTitle}</h4>
                <p className="text-[11px] text-slate-300">
                  <span className="font-semibold text-slate-200">Thematic Overlap:</span> {rag.similarityTheme}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
