import React, { useState } from 'react';
import {
  Rocket,
  Presentation,
  Globe,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Code,
  Download,
  Share2,
  Play,
  BarChart3,
  Layers,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Palette,
  ExternalLink,
  ChevronRight,
  Eye,
  RefreshCw,
  Copy,
} from 'lucide-react';
import {
  GeneratedLandingPage,
  PitchDeck,
  PitchDeckSlide,
  ProductDocArticle,
  ApiEndpointDoc,
  GoToMarketPlan,
} from '../../types/startupKnowledgeTypes';
import { StartupGrowthEngine } from '../../server/startupGrowthEngine';

interface StartupGrowthViewProps {
  onRequestApproval?: (summary: string, module: string) => void;
}

export const StartupGrowthView: React.FC<StartupGrowthViewProps> = ({
  onRequestApproval = (_summary: string, _module: string) => {},
}) => {
  const [activeTab, setActiveTab] = useState<'landing_page' | 'pitch_deck' | 'product_docs' | 'gtm_strategy'>('landing_page');

  // Landing Page Generator State
  const [productName, setProductName] = useState('Atlas AI');
  const [productDescription, setProductDescription] = useState(
    'Autonomous Horizon Scanning and Proposal Engineering Operating System for Research Labs & DeepTech Startups.'
  );
  const [targetAudience, setTargetAudience] = useState('Research Labs, PIs & DeepTech Founders');
  const [nicheDomain, setNicheDomain] = useState('DeepTech & AI');
  const [landingPage, setLandingPage] = useState<GeneratedLandingPage>(() =>
    StartupGrowthEngine.generateLandingPage(productName, productDescription, targetAudience, nicheDomain)
  );
  const [landingPreviewMode, setLandingPreviewMode] = useState<'visual' | 'code'>('visual');

  // Pitch Deck State
  const [deckAudience, setDeckAudience] = useState<'VC / Series A' | 'Angel Investor / Pre-Seed' | 'Y Combinator / Accelerator Application'>('VC / Series A');
  const [oneSentencePitch, setOneSentencePitch] = useState('The Autonomous Central Nervous System for High-Stakes Scientific Innovation & Venture Creation');
  const [problemStatement, setProblemStatement] = useState('42% of researcher working hours are lost to administrative grant formatting, literature searching, and compliance paperwork.');
  const [solutionSummary, setSolutionSummary] = useState('Autonomous multi-agent discovery, compliant proposal synthesis, and human-in-the-loop cryptographic governance.');
  const [tamBillions, setTamBillions] = useState(120);
  const [samBillions, setSamBillions] = useState(14);
  const [somMillions, setSomMillions] = useState(350);
  const [askAmountUsd, setAskAmountUsd] = useState(2500000);
  const [pitchDeck, setPitchDeck] = useState<PitchDeck>(() =>
    StartupGrowthEngine.generatePitchDeck(
      productName,
      deckAudience,
      oneSentencePitch,
      problemStatement,
      solutionSummary,
      tamBillions,
      samBillions,
      somMillions,
      askAmountUsd
    )
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Documentation State
  const [docsData] = useState(() => StartupGrowthEngine.getInitialDocumentation());
  const [selectedDocCategory, setSelectedDocCategory] = useState<'all' | 'api' | 'articles'>('all');
  const [selectedArticle, setSelectedArticle] = useState<ProductDocArticle>(docsData.articles[0]);

  // Go-To-Market State
  const [gtmPlan] = useState<GoToMarketPlan>(() => StartupGrowthEngine.getGoToMarketPlan(productName));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Handlers
  const handleRegenerateLandingPage = () => {
    const updated = StartupGrowthEngine.generateLandingPage(productName, productDescription, targetAudience, nicheDomain);
    setLandingPage(updated);
    setStatusMessage('Generated new responsive Next.js landing page & domain-specific color palette!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleRegeneratePitchDeck = () => {
    const updated = StartupGrowthEngine.generatePitchDeck(
      productName,
      deckAudience,
      oneSentencePitch,
      problemStatement,
      solutionSummary,
      tamBillions,
      samBillions,
      somMillions,
      askAmountUsd
    );
    setPitchDeck(updated);
    setActiveSlideIndex(0);
    setStatusMessage(`Generated ${updated.slides.length}-slide venture presentation with vector charts & narrative scripts!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeployToVercel = () => {
    onRequestApproval(
      `Deploy generated Next.js Landing Page (${landingPage.productName}) to Vercel production hosting`,
      'startup_growth'
    );
    setStatusMessage('Deployment to Vercel queued in Human Approval Center!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleExportDeck = (format: 'pptx' | 'pdf') => {
    onRequestApproval(
      `Export pitch deck "${pitchDeck.startupName}" as presentation-ready ${format.toUpperCase()} with embedded vector charts`,
      'startup_growth'
    );
    setStatusMessage(`${format.toUpperCase()} Export request routed to Approval Center!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const activeSlide: PitchDeckSlide = pitchDeck.slides[activeSlideIndex] || pitchDeck.slides[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
              MODULE 8
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • Accelerated Product Development, Pitch Decks & Go-To-Market
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Startup Growth & Venture Studio</h1>
        </div>

        {/* Global Action Stats */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2">
            <Rocket className="w-3.5 h-3.5 text-indigo-400" />
            <span>Time to MVP: <strong className="text-indigo-300 font-bold">Instant</strong></span>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Ask: <strong className="text-emerald-400 font-bold">${(askAmountUsd / 1_000_000).toFixed(1)}M USD</strong></span>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-center space-x-2 text-xs text-indigo-200 font-mono">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Module Sub-Navigation */}
      <div className="flex items-center space-x-1 bg-slate-900/80 p-1 border border-slate-800 rounded-xl text-xs font-mono overflow-x-auto">
        {[
          { id: 'landing_page', label: '1. Automated Landing Page Builder', icon: Globe },
          { id: 'pitch_deck', label: '2. Pitch Deck & Narrative Studio', icon: Presentation },
          { id: 'product_docs', label: '3. Technical & User Documentation', icon: FileText },
          { id: 'gtm_strategy', label: '4. Go-To-Market & Pricing Assistant', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LANDING PAGE BUILDER */}
      {activeTab === 'landing_page' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls & Parameters */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Static Site Generator Config</span>
                  </h3>
                  <span className="text-[10px] text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    Next.js + Tailwind
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Product Name:</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Domain & Archetype:</label>
                  <select
                    value={nicheDomain}
                    onChange={(e) => setNicheDomain(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="DeepTech & AI">DeepTech & AI (Indigo/Emerald)</option>
                    <option value="Biotech & Health">Biotech & Health (Teal/Mint)</option>
                    <option value="FinTech & Web3">FinTech & Web3 (Gold/Slate)</option>
                    <option value="General SaaS">General SaaS (Blue/Purple)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Target Audience:</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Value Proposition Summary:</label>
                  <textarea
                    rows={3}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                  />
                </div>

                {/* Theme Palette Swatch */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                    <Palette className="w-3 h-3 text-indigo-400" />
                    <span>Domain Palette Rule Engine:</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg border border-slate-700 shadow" style={{ backgroundColor: landingPage.theme.primaryColor }} />
                    <div className="w-6 h-6 rounded-lg border border-slate-700 shadow" style={{ backgroundColor: landingPage.theme.secondaryColor }} />
                    <div className="w-6 h-6 rounded-lg border border-slate-700 shadow" style={{ backgroundColor: landingPage.theme.accentColor }} />
                    <span className="text-[11px] text-slate-300 font-bold">{landingPage.theme.name}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleRegenerateLandingPage}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/30"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Synthesize Copy & Code</span>
                  </button>
                  <button
                    onClick={handleDeployToVercel}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold transition flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deploy to Vercel (1-Click)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview / Code Workspace */}
            <div className="lg:col-span-8 space-y-4">
              {/* Preview Toggle Header */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl font-mono text-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">Preview:</span>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setLandingPreviewMode('visual')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        landingPreviewMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <Eye className="w-3 h-3" />
                        <span>Live Visual Canvas</span>
                      </span>
                    </button>
                    <button
                      onClick={() => setLandingPreviewMode('code')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        landingPreviewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <Code className="w-3 h-3" />
                        <span>Next.js Code Output</span>
                      </span>
                    </button>
                  </div>
                </div>

                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Production Ready</span>
                </span>
              </div>

              {/* Render either Visual or Code */}
              {landingPreviewMode === 'visual' ? (
                <div
                  className="p-8 rounded-2xl border border-slate-800 space-y-12 overflow-y-auto max-h-[680px] shadow-2xl transition-all"
                  style={{ backgroundColor: landingPage.theme.bgColor, color: landingPage.theme.textColor }}
                >
                  {/* Hero Visual Mock */}
                  <div className="text-center space-y-4 max-w-2xl mx-auto pt-6">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-mono font-bold border inline-block"
                      style={{
                        backgroundColor: `${landingPage.theme.cardBgColor}80`,
                        borderColor: landingPage.theme.primaryColor,
                        color: landingPage.theme.secondaryColor,
                      }}
                    >
                      {landingPage.sections[0].badge}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                      {landingPage.sections[0].headline}
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {landingPage.sections[0].subheadline}
                    </p>

                    <div className="flex max-w-md mx-auto gap-2 pt-2">
                      <input
                        type="email"
                        placeholder="Enter email for waitlist..."
                        readOnly
                        value="investor@venturelabs.ai"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-xs text-slate-300 font-mono"
                      />
                      <button
                        style={{ backgroundColor: landingPage.theme.primaryColor }}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg whitespace-nowrap"
                      >
                        {landingPage.sections[0].ctaLabel}
                      </button>
                    </div>
                  </div>

                  {/* Problem & Solution Mock */}
                  <div
                    className="p-6 rounded-2xl border border-slate-800 space-y-4"
                    style={{ backgroundColor: landingPage.theme.cardBgColor }}
                  >
                    <h2 className="text-xl font-bold text-white">{landingPage.sections[1].headline}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">{landingPage.sections[1].bodyCopy}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {landingPage.sections[1].bullets?.map((b, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                          <p className="text-xs text-slate-300">{b}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-white">{landingPage.sections[2].headline}</h2>
                      <p className="text-xs text-slate-400">{landingPage.sections[2].subheadline}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {landingPage.sections[2].bullets?.map((b, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-800 space-y-2"
                          style={{ backgroundColor: landingPage.theme.cardBgColor }}
                        >
                          <span className="text-[10px] font-mono font-bold" style={{ color: landingPage.theme.secondaryColor }}>
                            0{idx + 1}. CAPABILITY
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed">{b}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Tiers */}
                  <div
                    className="p-6 rounded-2xl border border-slate-800 space-y-4"
                    style={{ backgroundColor: landingPage.theme.cardBgColor }}
                  >
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-white">{landingPage.sections[3].headline}</h2>
                      <p className="text-xs text-slate-400">{landingPage.sections[3].subheadline}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {landingPage.sections[3].bullets?.map((b, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 max-h-[680px] overflow-y-auto">
                  <pre className="text-[11px] leading-relaxed text-emerald-300">{landingPage.codeSnippetNextJs}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PITCH DECK STUDIO */}
      {activeTab === 'pitch_deck' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Questionnaire & Slide Selector */}
            <div className="lg:col-span-4 space-y-4 font-mono text-xs">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                    <Presentation className="w-4 h-4 text-indigo-400" />
                    <span>Pitch Deck Generator</span>
                  </h3>
                  <span className="text-[10px] text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    {pitchDeck.slides.length} Slides
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Target Investor Archetype:</label>
                  <select
                    value={deckAudience}
                    onChange={(e) => setDeckAudience(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                  >
                    <option value="VC / Series A">VC / Series A</option>
                    <option value="Angel Investor / Pre-Seed">Angel Investor / Pre-Seed</option>
                    <option value="Y Combinator / Accelerator Application">Y Combinator / Accelerator Application</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">TAM ($B):</label>
                    <input
                      type="number"
                      value={tamBillions}
                      onChange={(e) => setTamBillions(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">SAM ($B):</label>
                    <input
                      type="number"
                      value={samBillions}
                      onChange={(e) => setSamBillions(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">SOM ($M):</label>
                    <input
                      type="number"
                      value={somMillions}
                      onChange={(e) => setSomMillions(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRegeneratePitchDeck}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Slides & Scripts</span>
                </button>

                {/* Slides Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold mb-2">
                    Slide Deck Navigator:
                  </span>
                  {pitchDeck.slides.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between ${
                        activeSlideIndex === idx
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="truncate">
                        {idx + 1}. {s.title}
                      </span>
                      {s.chartData && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 text-indigo-300">Chart</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Slide Visualizer & Narrative Script */}
            <div className="lg:col-span-8 space-y-4 font-mono text-xs">
              {/* Slide Canvas */}
              <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl min-h-[420px] flex flex-col justify-between space-y-6 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    <span className="text-slate-400 text-xs font-bold uppercase">{pitchDeck.startupName} • SERIES A DECK</span>
                  </div>
                  <span className="text-xs text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-xl border border-indigo-800 font-bold">
                    Slide {activeSlide.slideNumber} of {pitchDeck.slides.length}
                  </span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-100">{activeSlide.title}</h2>
                  {activeSlide.keyMetricOrHighlight && (
                    <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-indigo-200 text-sm font-bold">
                      ⭐ {activeSlide.keyMetricOrHighlight}
                    </div>
                  )}

                  <ul className="space-y-2.5 text-slate-300 font-sans text-sm pt-2">
                    {activeSlide.bulletPoints.map((bp, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Chart Vector Mock */}
                  {activeSlide.chartData && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-300 font-bold">
                        <span className="flex items-center space-x-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Vector Graphic: {activeSlide.chartData.chartType.replace('_', ' ').toUpperCase()}</span>
                        </span>
                        <span className="text-[10px] text-emerald-400">Matplotlib Embedded SVG</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                        {activeSlide.chartData.labels.map((lbl, idx) => (
                          <div key={idx} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 block truncate">{lbl}</span>
                            <span className="text-sm font-bold text-indigo-300">
                              {activeSlide.chartData?.datasets[0]?.data[idx]?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 italic pt-1">{activeSlide.chartData.summary}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-800">
                  <span>Prompt: "{activeSlide.visualPrompt}"</span>
                  <span>Confidential — For Authorized Investors Only</span>
                </div>
              </div>

              {/* Speaker Narrative Script Box */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[11px] text-emerald-300 uppercase tracking-wider block font-bold flex items-center space-x-1.5">
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Teleprompter / Speaker Narrative Script:</span>
                </span>
                <p className="text-slate-200 text-xs leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-sans italic">
                  "{activeSlide.narrativeScript}"
                </p>
              </div>

              {/* Export Controls */}
              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-slate-400">Export High-Fidelity Artifacts:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExportDeck('pptx')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center space-x-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download PPTX (Editable)</span>
                  </button>
                  <button
                    onClick={() => handleExportDeck('pdf')}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center space-x-1.5 transition shadow-md shadow-indigo-600/20"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Export Presentation PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT DOCUMENTATION */}
      {activeTab === 'product_docs' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Doc Categories & Article Index */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Documentation Architecture</span>
                </h3>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">User Guides & Architecture:</span>
                  {docsData.articles.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className={`w-full p-3 rounded-xl text-left transition space-y-1 block ${
                        selectedArticle.id === art.id
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <p className="text-xs truncate">{art.title}</p>
                      <div className="flex items-center space-x-2 text-[10px] opacity-80">
                        <span>{art.category.replace('_', ' ').toUpperCase()}</span>
                        <span>•</span>
                        <span>{art.readTimeMinutes} min read</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">OpenAPI v3 REST Endpoints:</span>
                  {docsData.apiEndpoints.map((ep) => (
                    <div key={ep.path} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                          {ep.method}
                        </span>
                        <span className="text-[11px] text-slate-200 truncate">{ep.path}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{ep.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Rendered Markdown & OpenAPI Schema */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">{selectedArticle.title}</h2>
                    <span className="text-indigo-400 text-[11px]">Category: {selectedArticle.category}</span>
                  </div>
                  <div className="flex space-x-2">
                    {selectedArticle.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-sans text-xs text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
                  {selectedArticle.markdownContent}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GO-TO-MARKET STRATEGY */}
      {activeTab === 'gtm_strategy' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Go-To-Market & Pricing Assistant: {gtmPlan.startupName}</span>
                </h2>
                <p className="text-slate-400 mt-0.5">
                  Combines live market intelligence, unit economics modeling, and multi-channel acquisition tactics.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl font-bold">
                Model: {gtmPlan.pricingStrategy.model}
              </span>
            </div>

            {/* Pricing Matrix */}
            <div className="space-y-3">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                Commercial Pricing Tiers & Cohort Targets:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gtmPlan.pricingStrategy.tiers.map((tier) => (
                  <div key={tier.name} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-200">{tier.name}</h4>
                      <span className="text-base font-bold text-emerald-400">{tier.price}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans italic">{tier.targetCohort}</p>
                    <ul className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-300">
                      {tier.features.map((f, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Phases Timeline */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                Phased Launch Roadmap & Milestones:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gtmPlan.launchPhases.map((phase) => (
                  <div key={phase.phase} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-200">{phase.phase}</span>
                      <span className="text-indigo-400">{phase.timeline}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-emerald-300 font-bold">
                      Target: {phase.kpiTarget}
                    </div>
                    <ul className="space-y-1 text-[10px] text-slate-400 font-sans">
                      {phase.milestones.map((m, idx) => (
                        <li key={idx}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution Channels */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                Customer Acquisition Channels (CAC & Conversion Modeling):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gtmPlan.distributionChannels.map((ch) => (
                  <div key={ch.channelName} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200">{ch.channelName}</h4>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Est. CAC: <strong className="text-emerald-400 font-bold">${ch.cacEstimateUsd}</strong></span>
                      <span>Conversion: <strong className="text-purple-300 font-bold">{ch.expectedConversionRate}%</strong></span>
                    </div>
                    <p className="text-[10px] text-slate-400">{ch.tactics[0]}</p>
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
