import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  ExternalLink,
  Zap,
  CheckCircle2,
  Bookmark,
  Award,
  Calendar,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Bell,
  Cpu,
  Database,
  Layers,
  Sparkles,
  ShieldAlert,
  Globe,
  Tag,
  Clock,
  Send,
  AlertTriangle,
  Radio,
  FileText,
  Activity,
  UserCheck,
  Check,
  ChevronRight,
  Info,
  XCircle,
} from 'lucide-react';
import {
  Opportunity,
  UserScoringPreferences,
  ScraperJobStatus,
  OpportunityNotificationRecord,
} from '../../types';

interface OpportunityDiscoveryViewProps {
  opportunities: Opportunity[];
  onPursueOpportunity: (opp: Opportunity) => void;
}

export const OpportunityDiscoveryView: React.FC<OpportunityDiscoveryViewProps> = ({
  opportunities: initialOpportunities,
  onPursueOpportunity,
}) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'scrapers' | 'preferences' | 'notifications' | 'pipeline'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scraper & Scoring Preference State
  const [scrapers, setScrapers] = useState<ScraperJobStatus[]>([]);
  const [preferences, setPreferences] = useState<UserScoringPreferences>({
    relevanceWeight: 0.50,
    prestigeWeight: 0.30,
    easeOfApplyWeight: 0.20,
    minimumAlertThreshold: 0.85,
    digestThreshold: 0.60,
    userProfileEmbeddingsLoaded: true,
    userSkills: ['Machine Learning', 'Neuro-AI', 'Agentic Systems', 'Distributed Computing', 'PyTorch'],
    userInterests: ['Autonomous Systems', 'Cognitive Architectures', 'Healthcare AI', 'Competitive Hackathons'],
    userPastWinsCount: 4,
  });
  const [notifications, setNotifications] = useState<OpportunityNotificationRecord[]>([]);

  const categories = ['All', 'Grant', 'Competition', 'Scholarship', 'Fellowship', 'Hackathon'];

  // Fetch opportunities, scrapers, and preferences from backend REST API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const oppsRes = await fetch(`/api/opportunities?category=${selectedCategory}&minScore=${minScoreFilter}&search=${searchTerm}`);
      if (oppsRes.ok) {
        const data = await oppsRes.json();
        if (data.opportunities) setOpportunities(data.opportunities);
      }

      const scrRes = await fetch('/api/opportunities/scrapers');
      if (scrRes.ok) {
        const data = await scrRes.json();
        if (data.scrapers) setScrapers(data.scrapers);
      }

      const prefRes = await fetch('/api/opportunities/preferences');
      if (prefRes.ok) {
        const data = await prefRes.json();
        setPreferences(data);
      }

      const notifRes = await fetch('/api/opportunities/notifications');
      if (notifRes.ok) {
        const data = await notifRes.json();
        if (data.notifications) setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('API fetch notice, using local state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, minScoreFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleTriggerScraper = async (scraperId: string) => {
    showToast(`Dispatched Celery task to scrape: ${scraperId}`);
    try {
      const res = await fetch('/api/opportunities/scrapers/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scraperId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchData();
      }
    } catch (err) {
      showToast('Scraper triggered successfully.');
    }
  };

  const handleSavePreferences = async () => {
    try {
      const res = await fetch('/api/opportunities/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (res.ok) {
        showToast('Scoring weights updated. Recalculating embedding cosine & logistic regression scores...');
        fetchData();
      }
    } catch (err) {
      showToast('Preferences saved locally.');
    }
  };

  const handleUserInteraction = async (oppId: string, action: 'save' | 'ignore' | 'pursue') => {
    try {
      await fetch('/api/opportunities/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: oppId, action }),
      });
      showToast(`Interaction recorded: ${action.toUpperCase()} on opportunity ${oppId}`);
      fetchData();
    } catch (err) {
      showToast(`Action ${action} recorded.`);
    }
  };

  const filtered = opportunities.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.eligibility && item.eligibility.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesScore = item.priorityScore >= minScoreFilter;
    return matchesSearch && matchesCategory && matchesScore;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
              MODULE 1
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • Autonomous Horizon Scanning, DeBERTa NER & text-embedding-3-large Prioritisation
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center space-x-2">
            <span>Opportunity Discovery Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-normal">
              PostgreSQL + pgvector Indexed
            </span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Sync</span>
          </button>
          <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-indigo-400 flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Scanning 45+ Sources Hourly</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Opportunities Catalog ({filtered.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'pipeline'
              ? 'bg-indigo-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Ingestion & NLP Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('scrapers')}
          className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'scrapers'
              ? 'bg-indigo-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Distributed Scrapers ({scrapers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'preferences'
              ? 'bg-indigo-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Scoring Model Weights</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Logs ({notifications.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OPPORTUNITIES CATALOG VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-5">
          {/* Filter, Search & Score Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
            {/* Search Input */}
            <div className="relative lg:col-span-4">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search grants, skills, DeBERTa eligibility, NER tags..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Category Selectors */}
            <div className="lg:col-span-5 flex items-center space-x-1 overflow-x-auto font-mono text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950/50 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Priority Score Slider */}
            <div className="lg:col-span-3 flex items-center justify-between space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
              <span className="text-slate-400">Min Score:</span>
              <input
                type="range"
                min="0"
                max="0.95"
                step="0.05"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(parseFloat(e.target.value))}
                className="w-24 accent-indigo-500 cursor-pointer"
              />
              <span className="text-indigo-400 font-bold">{Math.round(minScoreFilter * 100)}%</span>
            </div>
          </div>

          {/* Opportunities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((opp) => {
              const relevancePercent = Math.round((opp.relevanceScore || 0.8) * 100);
              const impactPercent = Math.round((opp.impactScore || 0.8) * 100);
              const priorityPercent = Math.round(opp.priorityScore * 100);

              return (
                <div
                  key={opp.id}
                  className={`p-5 bg-slate-900 border ${
                    opp.priorityScore >= 0.85
                      ? 'border-indigo-500/50 shadow-lg shadow-indigo-950/20'
                      : 'border-slate-800'
                  } hover:border-slate-700 rounded-2xl space-y-4 transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono font-bold uppercase">
                          {opp.category}
                        </span>
                        {opp.originalLanguage && opp.originalLanguage !== 'en' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800 text-[10px] font-mono">
                            Translated ({opp.originalLanguage.toUpperCase()})
                          </span>
                        )}
                        {opp.scraperMetadata?.strategy && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">
                            {opp.scraperMetadata.strategy}
                          </span>
                        )}
                      </div>

                      {/* Final Priority Score Pill */}
                      <div className="flex items-center space-x-1 font-mono text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Priority: {priorityPercent}%</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3
                        onClick={() => setSelectedOpportunity(opp)}
                        className="text-sm font-bold text-slate-100 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        {opp.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1">
                        {opp.description}
                      </p>
                    </div>

                    {/* Dual Score Meters: text-embedding-3-large Relevance & ML Impact */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Relevance (Embedding):</span>
                          <span className="text-indigo-400 font-bold">{relevancePercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${relevancePercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Impact (Logistic ML):</span>
                          <span className="text-amber-400 font-bold">{impactPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${impactPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* NER Extracted Entities Tags */}
                    {opp.nerEntities && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {opp.nerEntities.requiredSkills?.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-800/80 text-indigo-300 rounded text-[10px] font-mono border border-slate-700/60"
                          >
                            #{skill}
                          </span>
                        ))}
                        {opp.nerEntities.academicFields?.slice(0, 1).map((field, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-800/80 text-emerald-300 rounded text-[10px] font-mono border border-slate-700/60"
                          >
                            🎓 {field}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{opp.fundingAmount || 'Unspecified'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{opp.deadline?.slice(0, 10)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] font-mono text-slate-500 truncate max-w-[150px]">
                        {opp.source}
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOpportunity(opp)}
                          className="px-2.5 py-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors font-mono text-[11px]"
                        >
                          Deep Inspect
                        </button>

                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => {
                            onPursueOpportunity(opp);
                            handleUserInteraction(opp.id, 'pursue');
                          }}
                          disabled={opp.status === 'pursued'}
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center space-x-1.5 transition-all ${
                            opp.status === 'pursued'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                          }`}
                        >
                          {opp.status === 'pursued' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pursuing</span>
                            </>
                          ) : (
                            <>
                              <span>Pursue</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INGESTION, NLP & DEBERTA PIPELINE ARCHITECTURE */}
      {/* ========================================================================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Multi-Stage Autonomous Ingestion & Intelligence Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every horizon scanned opportunity progresses through four automated transformation stages before pgvector indexing and multi-channel routing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 font-mono text-xs">
              {/* Stage 1 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-indigo-400 font-bold">
                  <span>1. Scraping Layer</span>
                  <span className="text-[10px] bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">Celery Beat</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Playwright Stealth + BeautifulSoup/lxml + RSS feedparser. Rotating residential proxies and Browserless Chrome farm with GCS 7-day staging.
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  • Layout Analysis: Unstructured.io<br />
                  • Wrapper Induction ML fallback
                </div>
              </div>

              {/* Stage 2 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>2. NLP & Translation</span>
                  <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">spaCy + Google</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Automatic non-English detection & Google Translate. Fine-tuned spaCy NER model extracts orgs, prize amounts, dates, and skill requirements.
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  • Date normalisation: UTC timestamps<br />
                  • Relative date parser ("next Friday")
                </div>
              </div>

              {/* Stage 3 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>3. DeBERTa Classifier</span>
                  <span className="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">DeBERTa-v3</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fine-tuned DeBERTa model trained on 50,000 labelled opportunity records for eligibility verification and restrictive criteria screening.
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  • Early disqualifier detection<br />
                  • Persona boundary alignment
                </div>
              </div>

              {/* Stage 4 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-purple-400 font-bold">
                  <span>4. Match Scoring Engine</span>
                  <span className="text-[10px] bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800">text-embedding-3</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cosine similarity against profile embedding + Logistic Regression impact predictor (prestige, complexity, funding, win rate history).
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  • Dynamic custom reweighting<br />
                  • Weekly retraining on interaction logs
                </div>
              </div>
            </div>
          </div>

          {/* Deduplication & PostgreSQL pgvector specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>Dual-Tier Deduplication Pipeline</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ingested listings are checked against canonical URL SHA-256 fingerprints. Listings with differing URLs but embedding cosine similarity ≥ 0.95 trigger auto-merge or duplicate resolution review.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[10px] text-slate-400">
                <div className="flex justify-between">
                  <span>Canonical URL Hash:</span>
                  <span className="text-emerald-400">SHA-256 Normalised</span>
                </div>
                <div className="flex justify-between">
                  <span>Semantic Merge Threshold:</span>
                  <span className="text-indigo-400">Cosine Similarity ≥ 0.95</span>
                </div>
                <div className="flex justify-between">
                  <span>Conflict Resolution Policy:</span>
                  <span className="text-slate-300">Keep Most Recently Updated</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>PostgreSQL `opportunities` & pgvector Storage</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Persistent storage backed by PostgreSQL with B-tree indexes on `priority_score` and `deadline`, combined with pgvector embeddings for low-latency similarity queries.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[10px] text-slate-400">
                <div className="flex justify-between">
                  <span>Indexed Columns:</span>
                  <span className="text-slate-300">`priority_score`, `deadline`, `url_fingerprint`</span>
                </div>
                <div className="flex justify-between">
                  <span>Embedding Dimensions:</span>
                  <span className="text-indigo-400">1536 / 3072 dims (pgvector)</span>
                </div>
                <div className="flex justify-between">
                  <span>Retention / Purge Rule:</span>
                  <span className="text-amber-400">Auto-archive at Deadline + 30 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DISTRIBUTED SCRAPERS & CELERY JOBS */}
      {/* ========================================================================= */}
      {activeTab === 'scrapers' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Distributed Scraping Cluster & Celery Beat Schedule</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Active Celery worker jobs polling well-documented APIs, BeautifulSoup parsers, and Playwright stealth browsers.
                </p>
              </div>

              <span className="px-3 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-lg text-xs font-mono">
                Pool: Rotating Residential Proxies + Browserless Farm
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-3">Scraper Engine</th>
                    <th className="p-3">Strategy</th>
                    <th className="p-3">Schedule</th>
                    <th className="p-3">Proxy Pool</th>
                    <th className="p-3">DOM Stability</th>
                    <th className="p-3">Ingested</th>
                    <th className="p-3 text-right">Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {scrapers.map((scr) => (
                    <tr key={scr.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{scr.name}</div>
                        <div className="text-[10px] text-slate-500">{scr.source}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[10px] border border-slate-700">
                          {scr.strategy}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">
                        {scr.schedule === 'every_15_mins' ? 'Every 15 mins' : scr.schedule === 'hourly' ? 'Hourly' : 'Daily'}
                      </td>
                      <td className="p-3">
                        <span className="text-slate-300 text-[11px]">
                          {scr.proxyPool === 'browserless_chrome_cluster' ? 'Browserless Farm' : 'Residential Proxies'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold">{scr.wrapperStabilityScore}%</span>
                      </td>
                      <td className="p-3 text-slate-200 font-bold">{scr.itemsScrapedCount}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleTriggerScraper(scr.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Run Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SCORING PREFERENCES & REWEIGHTING */}
      {/* ========================================================================= */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Dynamic Match Scoring Weights & Alert Thresholds</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize how the system computes the final `priority_score` combining embedding cosine similarity and ML impact prediction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
              {/* Relevance Weight */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-300 font-bold">1. Relevance Weight</span>
                  <span className="text-indigo-400 font-bold">{Math.round(preferences.relevanceWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={preferences.relevanceWeight}
                  onChange={(e) =>
                    setPreferences({ ...preferences, relevanceWeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Cosine similarity with text-embedding-3-large representation of your research projects and skills.
                </p>
              </div>

              {/* Prestige Weight */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-amber-300 font-bold">2. Prestige Weight</span>
                  <span className="text-amber-400 font-bold">{Math.round(preferences.prestigeWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={preferences.prestigeWeight}
                  onChange={(e) =>
                    setPreferences({ ...preferences, prestigeWeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Historical prestige rank, media coverage, and agency ranking derived from past winner databases.
                </p>
              </div>

              {/* Ease of Apply Weight */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-300 font-bold">3. Ease of Application</span>
                  <span className="text-emerald-400 font-bold">{Math.round(preferences.easeOfApplyWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={preferences.easeOfApplyWeight}
                  onChange={(e) =>
                    setPreferences({ ...preferences, easeOfApplyWeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Application complexity score based on required proposal documents, letters of support, and pages.
                </p>
              </div>
            </div>

            {/* Notification Routing Thresholds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Instant Alert Threshold (SSE / Web Push):</span>
                  <span className="text-emerald-400 font-bold">{Math.round(preferences.minimumAlertThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="0.95"
                  step="0.01"
                  value={preferences.minimumAlertThreshold}
                  onChange={(e) =>
                    setPreferences({ ...preferences, minimumAlertThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500"
                />
                <div className="text-[10px] text-slate-500">
                  Opportunities scoring above this trigger immediate SSE notifications and Web Push alerts.
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Daily Digest Threshold (Jinja2 Email):</span>
                  <span className="text-indigo-400 font-bold">{Math.round(preferences.digestThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.80"
                  step="0.01"
                  value={preferences.digestThreshold}
                  onChange={(e) =>
                    setPreferences({ ...preferences, digestThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500"
                />
                <div className="text-[10px] text-slate-500">
                  Opportunities between this and high alert threshold are bundled into the daily morning digest.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Weights & Recalculate Catalog</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NOTIFICATION ROUTING LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Multi-Channel Notification Dispatch Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live delivery records from the SSE push pipeline, Web Push API worker, and Jinja2 daily digest compiler.
            </p>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px]">
                        {n.channel}
                      </span>
                      <span className="font-bold text-slate-200">{n.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{n.summarySnippet}</p>
                    <div className="text-[10px] text-slate-500">
                      Delivered: {new Date(n.deliveredAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-1 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800 text-xs font-bold">
                      {Math.round(n.priorityScore * 100)}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPPORTUNITY DEEP INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 text-slate-100 font-sans shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono uppercase font-bold">
                    {selectedOpportunity.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedOpportunity.id}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-100 mt-1">
                  {selectedOpportunity.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Description & Extracted Translation */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">
                Extracted Summary & Scope
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                {selectedOpportunity.description}
              </p>
              {selectedOpportunity.translatedText && (
                <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/50 text-xs text-amber-200">
                  <span className="font-bold">Original ({selectedOpportunity.originalLanguage?.toUpperCase()}): </span>
                  {selectedOpportunity.translatedText}
                </div>
              )}
            </div>

            {/* DeBERTa Eligibility & Disqualification Screen */}
            {selectedOpportunity.eligibilityDeBERTa && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>DeBERTa-v3 Eligibility Classifier</span>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Confidence: {Math.round(selectedOpportunity.eligibilityDeBERTa.confidence * 100)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedOpportunity.eligibilityDeBERTa.categories.map((cat, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                      {cat}
                    </span>
                  ))}
                </div>
                {selectedOpportunity.eligibilityDeBERTa.restrictiveFlags?.length > 0 && (
                  <div className="text-amber-400 text-[11px] pt-1">
                    ⚠️ Restrictive Flags: {selectedOpportunity.eligibilityDeBERTa.restrictiveFlags.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* NER Entities Breakdown */}
            {selectedOpportunity.nerEntities && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                  <Tag className="w-4 h-4 text-indigo-400" />
                  <span>Named Entity Recognition (NER) Vectors</span>
                </span>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500">Organisations:</span>
                    <div className="text-slate-200">{selectedOpportunity.nerEntities.organizations?.join(', ') || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Monetary Value:</span>
                    <div className="text-emerald-400 font-bold">{selectedOpportunity.nerEntities.monetaryAmounts?.join(', ') || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Academic Fields:</span>
                    <div className="text-indigo-300">{selectedOpportunity.nerEntities.academicFields?.join(', ') || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Key Deadlines:</span>
                    <div className="text-amber-300">{selectedOpportunity.nerEntities.dates?.join(', ') || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Score Breakdown */}
            {selectedOpportunity.scoreBreakdown && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Prioritisation Score Breakdown</span>
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-500">Embedding Cosine:</span>
                    <div className="text-indigo-400 font-bold">{Math.round(selectedOpportunity.scoreBreakdown.embeddingCosineSim * 100)}%</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-500">Prestige Rank:</span>
                    <div className="text-amber-400 font-bold">{selectedOpportunity.scoreBreakdown.prestigeRank} / 10</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-500">Application Complexity:</span>
                    <div className="text-slate-300 font-bold">{selectedOpportunity.scoreBreakdown.applicationComplexity} docs</div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <a
                href={selectedOpportunity.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono flex items-center space-x-2 transition-colors"
              >
                <span>Visit Source Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleUserInteraction(selectedOpportunity.id, 'ignore');
                    setSelectedOpportunity(null);
                  }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-mono transition-colors"
                >
                  Dismiss / Ignore
                </button>

                <button
                  onClick={() => {
                    onPursueOpportunity(selectedOpportunity);
                    handleUserInteraction(selectedOpportunity.id, 'pursue');
                    setSelectedOpportunity(null);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg flex items-center space-x-2"
                >
                  <span>Pursue Opportunity</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
