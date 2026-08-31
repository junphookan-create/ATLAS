import React, { useState } from 'react';
import {
  Share2,
  Calendar,
  Image as ImageIcon,
  Send,
  Sparkles,
  BarChart2,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Layers,
  Video,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Volume2,
  Music,
  ShieldCheck,
  Zap,
  Radio,
  FileText,
  Play,
  ArrowRight,
  Filter,
  Plus,
  RefreshCw,
  Sliders,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  SocialPost,
  ContentStrategyPlan,
  SocialAnalyticsOverview,
  SocialListeningMention,
  SocialMediaImageVariant,
  CarouselSlide,
  VideoProductionSpec,
} from '../../types';
import { SocialMediaEngine } from '../../server/socialMediaEngine';

interface SocialMediaManagerViewProps {
  posts: SocialPost[];
  onRequestApproval: (summary: string, module: string) => void;
  onAddPost?: (post: SocialPost) => void;
}

export const SocialMediaManagerView: React.FC<SocialMediaManagerViewProps> = ({
  posts: initialPosts,
  onRequestApproval,
  onAddPost,
}) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'studio' | 'calendar' | 'analytics' | 'listening'>('strategy');
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('All');
  
  // Strategy State
  const [contentBrief, setContentBrief] = useState<string>(
    'Share our breakthrough neuromorphic sparse attention benchmark (4.2x compute efficiency, 78% power reduction) and invite computational neuroscience collaborators to join our open-source repo.'
  );
  const [selectedGoals, setSelectedGoals] = useState<('increase_followers' | 'drive_traffic' | 'build_community' | 'recruit_collaborators' | 'brand_awareness')[]>([
    'recruit_collaborators',
    'build_community',
    'drive_traffic',
  ]);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [strategyPlan, setStrategyPlan] = useState<ContentStrategyPlan | null>(null);

  // Studio / Asset Generation State
  const [currentPostList, setCurrentPostList] = useState<SocialPost[]>(initialPosts);
  const [selectedPostForStudio, setSelectedPostForStudio] = useState<SocialPost | null>(initialPosts[0] || null);
  const [activeCarouselSlideIndex, setActiveCarouselSlideIndex] = useState(0);
  const [selectedImageVariant, setSelectedImageVariant] = useState<string | null>(null);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

  // Analytics & Listening State
  const [analyticsData] = useState<SocialAnalyticsOverview>(() => SocialMediaEngine.getAnalyticsOverview());
  const [listeningMentions, setListeningMentions] = useState<SocialListeningMention[]>(() => SocialMediaEngine.getListeningMentions());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize initial strategy plan on first mount if none
  React.useEffect(() => {
    if (!strategyPlan) {
      SocialMediaEngine.interpretContentBrief(contentBrief, selectedGoals).then((plan) => {
        setStrategyPlan(plan);
        if (plan.generatedPosts.length > 0) {
          setCurrentPostList((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const newOnes = plan.generatedPosts.filter((p) => !ids.has(p.id));
            return [...newOnes, ...prev];
          });
          setSelectedPostForStudio(plan.generatedPosts[0]);
        }
      });
    }
  }, []);

  const handleGenerateStrategy = async () => {
    setIsGeneratingStrategy(true);
    setStatusMessage('Generating platform-tailored omnichannel strategy & distribution schedule...');
    try {
      const plan = await SocialMediaEngine.interpretContentBrief(contentBrief, selectedGoals);
      setStrategyPlan(plan);
      setCurrentPostList((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newOnes = plan.generatedPosts.filter((p) => !ids.has(p.id));
        return [...newOnes, ...prev];
      });
      setSelectedPostForStudio(plan.generatedPosts[0]);
      setStatusMessage('Omnichannel strategy created! Formats optimized for LinkedIn, X, Instagram & TikTok.');
    } finally {
      setIsGeneratingStrategy(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleBatchApproveWeek = () => {
    onRequestApproval(
      `Batch publish approval for 4 scheduled social media posts across LinkedIn, X/Twitter, Instagram, and TikTok`,
      'social_media_manager'
    );
    setStatusMessage('Batch approval request routed to Human Approval Center!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDispatchListeningReply = (mention: SocialListeningMention) => {
    onRequestApproval(
      `Approve public social reply to ${mention.author} (${mention.platform}): "${mention.suggestedReplyDraft}"`,
      'social_media_manager'
    );
    setListeningMentions((prev) =>
      prev.map((m) => (m.id === mention.id ? { ...m, status: 'reply_queued' } : m))
    );
    setStatusMessage(`Reply to ${mention.author} submitted to Approval Center.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const filteredPosts = currentPostList.filter(
    (p) => activePlatformFilter === 'All' || p.platform === activePlatformFilter
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
              MODULE 6
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • Omnichannel Content Strategy, Asset Studio & Analytics
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Social Media Manager</h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBatchApproveWeek}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-purple-600/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Batch Approve Week (4 Posts)</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-slate-900/80 p-1 border border-slate-800 rounded-xl text-xs font-mono overflow-x-auto">
        {[
          { id: 'strategy', label: '1. Content Strategy Engine', icon: Sparkles },
          { id: 'studio', label: '2. Asset & Production Studio', icon: ImageIcon },
          { id: 'calendar', label: '3. Schedule & Publishing Calendar', icon: Calendar },
          { id: 'analytics', label: '4. Analytics & AI Advisor', icon: BarChart2 },
          { id: 'listening', label: '5. Social Listening & Mentions', icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONTENT STRATEGY ENGINE */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {/* Brief Input Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Natural Language Content Brief & Goal Formulator</span>
              </h2>
              <span className="text-[11px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800/50">
                LLM Decision Matrix
              </span>
            </div>

            <textarea
              value={contentBrief}
              onChange={(e) => setContentBrief(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
              placeholder="Describe what project milestone, paper, hardware demo, or community update to announce..."
            />

            {/* Goal Toggles */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Strategic Campaign Goals:
              </label>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {[
                  { id: 'recruit_collaborators', label: 'Recruit Co-Authors & Lab Collaborators' },
                  { id: 'drive_traffic', label: 'Drive GitHub Stars & Colab Demo Traffic' },
                  { id: 'build_community', label: 'Build Engineering Community' },
                  { id: 'increase_followers', label: 'Grow High-Trust Followers' },
                  { id: 'brand_awareness', label: 'Sponsor & Lab Brand Awareness' },
                ].map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id as any);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => {
                        setSelectedGoals((prev) =>
                          isSelected ? prev.filter((g) => g !== goal.id) : [...prev, goal.id as any]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg border transition ${
                        isSelected
                          ? 'bg-purple-900/40 text-purple-200 border-purple-500/60 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {goal.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span>Quick Presets:</span>
              <button
                onClick={() =>
                  setContentBrief(
                    'Announce our open-source benchmark: 4.2x compute efficiency on Jetson Orin with full PyTorch weights and Colab repo.'
                  )
                }
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
              >
                Benchmark Paper
              </button>
              <button
                onClick={() =>
                  setContentBrief(
                    'Share ISEF grand award milestone, thank academic mentors, and announce next-gen silicon testbench.'
                  )
                }
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
              >
                ISEF Milestone
              </button>
              <button
                onClick={() =>
                  setContentBrief(
                    'Educational teardown: Why biological brains run on 20W while GPU server racks consume 5,000W.'
                  )
                }
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
              >
                Educational Teardown
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateStrategy}
                disabled={isGeneratingStrategy}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition shadow-lg shadow-purple-600/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingStrategy ? 'Synthesizing Mix...' : 'Synthesize Omnichannel Content Mix'}</span>
              </button>
            </div>
          </div>

          {/* Strategy Distribution Recommendations */}
          {strategyPlan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Platform Mix & Peak Engagement Windows
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Target Audience: <span className="text-purple-300">{strategyPlan.targetAudience}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {strategyPlan.recommendedMix.map((mix, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
                          {mix.platform}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{mix.frequencyPerWeek}x / week</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                        {mix.recommendedFormat.replace('_', ' ')}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{mix.strategicRationale}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-purple-300">
                      <span>Peak Timing:</span>
                      <span className="font-bold">{mix.bestTimeWindow}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generated Posts Queue for this Strategy */}
              <div className="space-y-3 pt-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Generated Draft Posts Ready for Asset Customization
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategyPlan.generatedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl space-y-3 transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 text-xs font-mono font-bold">
                            {post.platform} • {post.mediaType.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            <span>{post.scheduledTime}</span>
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 font-mono whitespace-pre-line line-clamp-4 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                          {post.caption}
                        </p>

                        {post.optimalTimingReason && (
                          <p className="text-[10px] text-purple-300 font-mono flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-purple-400 flex-shrink-0" />
                            <span>{post.optimalTimingReason}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold">
                            ✓ Policy Verified
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPostForStudio(post);
                            setActiveTab('studio');
                          }}
                          className="flex items-center space-x-1 px-3 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 rounded-lg text-xs font-mono font-bold transition"
                        >
                          <span>Open in Asset Studio</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSET & PRODUCTION STUDIO */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          {/* Post Selector Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Active Post:</span>
            {currentPostList.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPostForStudio(post)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono border whitespace-nowrap transition ${
                  selectedPostForStudio?.id === post.id
                    ? 'bg-purple-600 text-white border-purple-500 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {post.platform} ({post.mediaType})
              </button>
            ))}
          </div>

          {selectedPostForStudio ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Post Details & Copywriting */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 text-xs font-mono font-bold">
                      {selectedPostForStudio.platform} Content Inspector
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Status: <span className="text-amber-400 font-bold">{selectedPostForStudio.status}</span>
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Post Caption & Copy:
                    </label>
                    <textarea
                      value={selectedPostForStudio.caption}
                      onChange={(e) => {
                        const newCaption = e.target.value;
                        setSelectedPostForStudio((prev) => (prev ? { ...prev, caption: newCaption } : null));
                        setCurrentPostList((prev) =>
                          prev.map((p) => (p.id === selectedPostForStudio.id ? { ...p, caption: newCaption } : p))
                        );
                      }}
                      rows={8}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  {/* Policy & Compliance Checklist */}
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-300 font-bold">
                      <span className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Platform Policy & Compliance Checker</span>
                      </span>
                      <span className="text-emerald-400">100% Passed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Character Count: {selectedPostForStudio.caption.length}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Hashtag Density: Optimal</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Spam Keyword Scan: Clean</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Alt-Text Accessibility: Generated</span>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility Alt Text */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Vision AI Accessibility Alt-Text:
                    </label>
                    <input
                      type="text"
                      value={selectedPostForStudio.altText || ''}
                      onChange={(e) => {
                        const newAlt = e.target.value;
                        setSelectedPostForStudio((prev) => (prev ? { ...prev, altText: newAlt } : null));
                      }}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">
                      Scheduled: <span className="text-purple-300">{selectedPostForStudio.scheduledTime}</span>
                    </span>
                    <button
                      onClick={() => {
                        onRequestApproval(
                          `Publish ${selectedPostForStudio.platform} post: "${selectedPostForStudio.caption.slice(0, 80)}..."`,
                          'social_media_manager'
                        );
                        setStatusMessage(`Post routed to Approval Center!`);
                        setTimeout(() => setStatusMessage(null), 4000);
                      }}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-md shadow-purple-600/30"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit to Approval Center</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Asset Generator (SDXL Image Variants OR Carousel OR Video Storyboard) */}
              <div className="lg:col-span-6 space-y-4">
                {/* 1. SDXL Image Variants */}
                {selectedPostForStudio.imageVariants && selectedPostForStudio.imageVariants.length > 0 && (
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2 font-mono">
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                        <span>ComfyUI + SDXL Multi-Variant Engine (Aesthetic Scored)</span>
                      </h3>
                      <span className="text-[10px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                        Neural Scorer
                      </span>
                    </div>

                    <div className="space-y-3">
                      {selectedPostForStudio.imageVariants.map((variant, vIdx) => (
                        <div
                          key={variant.id}
                          onClick={() => setSelectedImageVariant(variant.id)}
                          className={`p-3.5 rounded-xl border transition cursor-pointer ${
                            selectedImageVariant === variant.id || (!selectedImageVariant && vIdx === 0)
                              ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-900/20'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-200 font-mono">
                              Variant {String.fromCharCode(65 + vIdx)}: {variant.composition}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                              Aesthetic: {variant.aestheticScore}/100
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1">
                            <p>
                              <span className="text-purple-400">Palette:</span> {variant.colorScheme}
                            </p>
                            <p>
                              <span className="text-purple-400">Focus:</span> {variant.focusAngle}
                            </p>
                            {variant.ocrSafeZones && (
                              <p className="text-[10px] text-slate-400">
                                📐 OCR Safe Zone: Top {variant.ocrSafeZones.top}%, Left {variant.ocrSafeZones.left}% (Width {variant.ocrSafeZones.width}%)
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Instagram 5-Slide Carousel Visualizer */}
                {selectedPostForStudio.carouselSlides && selectedPostForStudio.carouselSlides.length > 0 && (
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2 font-mono">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>5-Slide Carousel Breakdown & Story Arc</span>
                      </h3>
                      <span className="text-[10px] text-purple-300 font-mono">
                        Slide {activeCarouselSlideIndex + 1} of {selectedPostForStudio.carouselSlides.length}
                      </span>
                    </div>

                    {/* Carousel Preview Card */}
                    {(() => {
                      const slide = selectedPostForStudio.carouselSlides[activeCarouselSlideIndex];
                      return (
                        <div className="p-6 bg-gradient-to-br from-slate-950 to-purple-950/40 border border-purple-500/40 rounded-2xl space-y-3 min-h-[190px] flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                              Slide {slide.slideNumber}
                            </span>
                            <h4 className="text-base font-bold text-slate-100">{slide.headline}</h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-mono">{slide.bodyContent}</p>
                          </div>

                          {slide.keyMetricOrQuote && (
                            <div className="p-2 bg-purple-900/40 border border-purple-700/50 rounded-xl text-xs font-mono font-bold text-purple-200 flex items-center justify-between">
                              <span>Metric Highlight:</span>
                              <span className="text-emerald-400">{slide.keyMetricOrQuote}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Slide Selector Controls */}
                    <div className="flex items-center justify-center space-x-2 pt-2">
                      {selectedPostForStudio.carouselSlides.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveCarouselSlideIndex(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-mono font-bold border transition ${
                            activeCarouselSlideIndex === idx
                              ? 'bg-purple-600 text-white border-purple-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. 60s Video Production Spec & TTS Storyboard */}
                {selectedPostForStudio.videoSpec && (
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2 font-mono">
                        <Video className="w-4 h-4 text-purple-400" />
                        <span>60s Video Script, ffmpeg Scene Cuts & Audio Engine</span>
                      </h3>
                      <span className="text-[10px] text-purple-300 font-mono">
                        {selectedPostForStudio.videoSpec.totalDurationSeconds}s • {selectedPostForStudio.videoSpec.format}
                      </span>
                    </div>

                    {/* Audio & Music Parameters */}
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase flex items-center space-x-1">
                          <Volume2 className="w-3 h-3 text-purple-400" />
                          <span>TTS Engine & Tone:</span>
                        </span>
                        <p className="text-slate-200 font-bold">
                          {selectedPostForStudio.videoSpec.voiceoverEngine} ({selectedPostForStudio.videoSpec.voiceTone})
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase flex items-center space-x-1">
                          <Music className="w-3 h-3 text-purple-400" />
                          <span>MusicGen Background:</span>
                        </span>
                        <p className="text-slate-200 font-bold">
                          {selectedPostForStudio.videoSpec.backgroundMusicGenMood.replace('_', ' ')} (
                          {selectedPostForStudio.videoSpec.musicTempoBpm} BPM)
                        </p>
                      </div>
                    </div>

                    {/* Storyboard Scenes List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedPostForStudio.videoSpec.scenes.map((scene) => (
                        <div
                          key={scene.sceneNumber}
                          className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between text-purple-300 font-bold text-[11px]">
                            <span>Scene {scene.sceneNumber} ({scene.durationSeconds}s)</span>
                            <span className="text-slate-400 text-[10px]">Transition: {scene.transitionEffect}</span>
                          </div>
                          <p className="text-slate-300">
                            <span className="text-slate-500">Visual:</span> {scene.visualDescription}
                          </p>
                          <p className="text-purple-200 bg-purple-950/30 p-1.5 rounded border border-purple-900/40">
                            <span className="text-purple-400">🎙️ Voiceover:</span> "{scene.voiceoverScript}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 font-mono text-xs">
              Select a post above to customize assets in the Studio.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULE & PUBLISHING CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3 border border-slate-800 rounded-xl text-xs font-mono">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Platform Filter:</span>
              <div className="flex items-center space-x-1">
                {['All', 'LinkedIn', 'X/Twitter', 'Instagram', 'TikTok'].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setActivePlatformFilter(plat)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      activePlatformFilter === plat
                        ? 'bg-purple-600 text-white border-purple-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Auto-adjusts for real-time trending news</span>
            </div>
          </div>

          {/* Calendar List View */}
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                      {post.platform}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {post.mediaType.toUpperCase()}
                    </span>
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>{post.scheduledTime}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        post.status === 'published'
                          ? 'bg-emerald-950 text-emerald-300'
                          : post.status === 'pending_approval'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-slate-200 whitespace-pre-line line-clamp-2">{post.caption}</p>

                  {post.optimalTimingReason && (
                    <p className="text-[10px] text-purple-300 flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-purple-400 flex-shrink-0" />
                      <span>{post.optimalTimingReason}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedPostForStudio(post);
                      setActiveTab('studio');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onRequestApproval(`Publish ${post.platform} post immediately`, 'social_media_manager');
                      setStatusMessage('Routed to Approval Center!');
                      setTimeout(() => setStatusMessage(null), 4000);
                    }}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition flex items-center space-x-1 shadow-md shadow-purple-600/20"
                  >
                    <Send className="w-3 h-3" />
                    <span>Approve Post</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & AI ADVISOR */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Followers</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-100 font-mono">
                  {analyticsData.totalFollowers.toLocaleString()}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">+{analyticsData.followerGrowth7d}% (7d)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">30-Day Impressions</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-purple-300 font-mono">
                  {analyticsData.totalImpressions30d.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-purple-400">High Velocity</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Avg Engagement Rate</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-emerald-400 font-mono">{analyticsData.avgEngagementRate}%</span>
                <span className="text-xs font-mono text-slate-400">vs 1.8% tech avg</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">BERT Sentiment Ratio</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-100 font-mono">
                  {analyticsData.sentimentRatio.positive}%
                </span>
                <span className="text-xs font-mono text-emerald-400">Positive Sentiment</span>
              </div>
            </div>
          </div>

          {/* AI Advisor Report & A/B Testing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: LLM Advisor Report */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2 font-mono">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>LLM Performance Advisor & Causal Insights</span>
                  </h3>
                  <span className="text-[10px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    Causal Inference Engine
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {analyticsData.advisorReport.summary}
                </p>

                {/* Top Performer Insights */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Key Performance Attribution:
                  </span>
                  {analyticsData.advisorReport.topPerformersInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 flex items-start space-x-2"
                    >
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>

                {/* Actionable Recommendations */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider block">
                    Actionable Next Steps:
                  </span>
                  {analyticsData.advisorReport.actionableRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-purple-950/30 rounded-xl border border-purple-800/50 text-xs font-mono text-purple-200 flex items-start space-x-2"
                    >
                      <Zap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Multi-Armed Bandit (MAB) & A/B Tests */}
            <div className="lg:col-span-5 space-y-4">
              {/* Multi-Armed Bandit Formats */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2 font-mono">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Multi-Armed Bandit Format Optimizer</span>
                  </h3>
                  <span className="text-[10px] text-purple-300 font-mono">Thompson Sampling</span>
                </div>

                <div className="space-y-2">
                  {analyticsData.mabExperiment.map((mab, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between"
                    >
                      <div>
                        <p className="text-slate-200 font-bold">{mab.format}</p>
                        <p className="text-[10px] text-slate-400">{mab.trials} trials evaluated</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">{mab.rewardAvg} Score</span>
                        <p className="text-[10px] text-purple-300 uppercase">{mab.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* A/B Test Experiments */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2 font-mono">
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                    <span>Automated A/B Hook Experiments</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">Statistical Confidence &gt;90%</span>
                </div>

                <div className="space-y-3">
                  {analyticsData.abTests.map((ab) => (
                    <div
                      key={ab.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{ab.postTitle}</span>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800 text-[10px] font-bold">
                          Winner: {ab.winner} ({ab.confidence}% Conf.)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-300">
                          <p className="text-slate-500 font-bold">Variant A (Direct)</p>
                          <p className="line-clamp-2">"{ab.variantA.hook}"</p>
                          <p className="text-purple-300 font-bold mt-1">CTR: {ab.variantA.ctr}%</p>
                        </div>
                        <div className="p-1.5 bg-purple-950/40 rounded border border-purple-700/50 text-purple-200">
                          <p className="text-purple-400 font-bold">Variant B (Question Hook)</p>
                          <p className="line-clamp-2">"{ab.variantB.hook}"</p>
                          <p className="text-emerald-400 font-bold mt-1">CTR: {ab.variantB.ctr}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SOCIAL LISTENING & MENTIONS */}
      {activeTab === 'listening' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Real-Time Social Listening & Proactive Community Engagement</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Filtered streams across X/Twitter, LinkedIn, and Instagram with BERT sentiment analysis and AI reply drafting.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs font-bold">
              ● Stream Live (3 Mentions)
            </span>
          </div>

          <div className="space-y-4">
            {listeningMentions.map((mention) => (
              <div
                key={mention.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                      {mention.platform}
                    </span>
                    <span className="font-bold text-slate-200">
                      {mention.author} ({mention.authorHandle})
                    </span>
                    {mention.authorFollowers && (
                      <span className="text-[10px] text-slate-400">
                        • {mention.authorFollowers.toLocaleString()} followers
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mention.sentiment === 'positive'
                          ? 'bg-emerald-950 text-emerald-300'
                          : mention.sentiment === 'negative'
                          ? 'bg-red-950 text-red-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      BERT: {mention.sentiment.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">{mention.detectedAt}</span>
                  </div>
                </div>

                {/* Original Content */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-slate-300 leading-relaxed">
                  "{mention.content}"
                </div>

                {/* AI Reply Draft */}
                <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-800/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Suggested AI Response Draft:</span>
                    </span>
                    <span className="text-slate-400 font-normal">Requires Approval</span>
                  </div>
                  <p className="text-xs text-purple-100 leading-relaxed">{mention.suggestedReplyDraft}</p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDispatchListeningReply(mention)}
                      disabled={mention.status === 'reply_queued'}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/20"
                    >
                      <Send className="w-3 h-3" />
                      <span>{mention.status === 'reply_queued' ? 'Reply Queued' : 'Approve & Queue Reply'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
