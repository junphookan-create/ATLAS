import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Globe,
  Presentation,
  Sparkles,
  Loader2,
  ExternalLink,
  Code2,
  Eye,
  CheckCircle2,
  DollarSign,
  Cpu,
  Layers,
  Terminal,
  Copy,
  Zap,
  TrendingUp,
  Server,
} from 'lucide-react';
import { FastApiLandingPage, FastApiPitchDeck, SideHustleAutonomousExecution } from '../../types/apiTypes';
import { api } from '../../lib/api';

interface StartupGrowthSectionProps {
  landingPages: FastApiLandingPage[];
  pitchDecks: FastApiPitchDeck[];
  isLoading: boolean;
  onGenerateLandingPage: (productName: string, valueProp: string) => Promise<void>;
  onGeneratePitchDeck: (productName: string, problem: string, market: string) => Promise<void>;
}

export const StartupGrowthSection: React.FC<StartupGrowthSectionProps> = ({
  landingPages,
  pitchDecks,
  isLoading,
  onGenerateLandingPage,
  onGeneratePitchDeck,
}) => {
  const [activeTab, setActiveTab] = useState<'hustles' | 'landing_pages'>('hustles');
  const [sideHustles, setSideHustles] = useState<SideHustleAutonomousExecution[]>([]);
  const [selectedHustle, setSelectedHustle] = useState<SideHustleAutonomousExecution | null>(null);
  const [hustleTitle, setHustleTitle] = useState('');
  const [hustleCategory, setHustleCategory] = useState('biomimicry_saas');
  const [hustleTagline, setHustleTagline] = useState('');
  const [isGeneratingHustle, setIsGeneratingHustle] = useState(false);

  const [productName, setProductName] = useState('');
  const [valueProp, setValueProp] = useState('');
  const [problem, setProblem] = useState('');
  const [isGeneratingPage, setIsGeneratingPage] = useState(false);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);

  useEffect(() => {
    loadSideHustles();
  }, []);

  const loadSideHustles = async () => {
    try {
      const data = await api.getSideHustles();
      setSideHustles(data);
      if (data.length > 0) {
        setSelectedHustle(data[0]);
      }
    } catch (e) {
      console.error('Failed to load side hustles:', e);
    }
  };

  const handleGenerateSideHustle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hustleTitle.trim() || isGeneratingHustle) return;
    setIsGeneratingHustle(true);
    try {
      const created = await api.generateSideHustleBackend({
        title: hustleTitle.trim(),
        category: hustleCategory,
        tagline: hustleTagline.trim() || 'Autonomous micro-SaaS with DeepSeek R1 backend and Gemini orchestration',
      });
      setSideHustles([created, ...sideHustles]);
      setSelectedHustle(created);
      setHustleTitle('');
      setHustleTagline('');
    } catch (e) {
      console.error('Failed to generate side hustle:', e);
    } finally {
      setIsGeneratingHustle(false);
    }
  };

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || isGeneratingPage) return;
    setIsGeneratingPage(true);
    try {
      await onGenerateLandingPage(
        productName.trim(),
        valueProp.trim() || 'Accelerated autonomous workflow for researchers'
      );
      setProductName('');
      setValueProp('');
    } finally {
      setIsGeneratingPage(false);
    }
  };

  const handleDeckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || isGeneratingDeck) return;
    setIsGeneratingDeck(true);
    try {
      await onGeneratePitchDeck(
        productName.trim(),
        problem.trim() || 'Severe friction in decentralized academic workflows',
        '$2.8B Higher Ed Market'
      );
      setProductName('');
      setProblem('');
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-950/80 border border-emerald-800/50 rounded-lg text-emerald-400">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-slate-100">
                Autonomous Side Hustles & Commercialization
              </h2>
              <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                DEEPSEEK BACKEND + GOOGLE AI STUDIO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous venture deployment with DeepSeek R1 Python FastAPI code generation & Gemini AI Studio API
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('hustles')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'hustles'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Autonomous Side Hustles ({sideHustles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('landing_pages')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'landing_pages'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Landing Pages & Pitch Decks</span>
          </button>
        </div>
      </div>

      {activeTab === 'hustles' ? (
        <div className="space-y-6">
          {/* DeepSeek Side Hustle Generator Form */}
          <form
            onSubmit={handleGenerateSideHustle}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
          >
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Architect Novel Side Hustle Micro-SaaS (DeepSeek + Google AI Studio)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                value={hustleTitle}
                onChange={(e) => setHustleTitle(e.target.value)}
                placeholder="Venture Title (e.g. 'BioSim-as-a-Service', 'GrantSherpa')..."
                disabled={isGeneratingHustle}
                className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              <select
                value={hustleCategory}
                onChange={(e) => setHustleCategory(e.target.value)}
                disabled={isGeneratingHustle}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="biomimicry_saas">Biomimicry & Vision SaaS</option>
                <option value="grant_automation">Grant & RFP Automation</option>
                <option value="generative_shaders">Generative Shaders & 3D Assets</option>
                <option value="campus_p2p">Campus Peer-to-Peer Escrow</option>
                <option value="whimsical_bot">Whimsical Creative Tools</option>
              </select>
              <input
                type="text"
                value={hustleTagline}
                onChange={(e) => setHustleTagline(e.target.value)}
                placeholder="Tagline & Core Monetization Goal..."
                disabled={isGeneratingHustle}
                className="md:col-span-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                <span className="text-slate-500">Fast Templates:</span>
                <button
                  type="button"
                  onClick={() => {
                    setHustleTitle('BioSim-as-a-Service');
                    setHustleCategory('biomimicry_saas');
                    setHustleTagline('Cloud synthetic neuromorphic event-camera streams for drone robotics developers');
                  }}
                  className="text-emerald-400 hover:underline"
                >
                  BioSim SaaS
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setHustleTitle('GrantSherpa');
                    setHustleCategory('grant_automation');
                    setHustleTagline('Autonomous AI grant watchdog & proposal writer for academic laboratories');
                  }}
                  className="text-emerald-400 hover:underline"
                >
                  GrantSherpa
                </button>
              </div>

              <button
                type="submit"
                disabled={!hustleTitle.trim() || isGeneratingHustle}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {isGeneratingHustle ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing DeepSeek FastAPI Code...</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Deploy Side Hustle Backend</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 2-Column Split: Hustles List & Backend Code/Architecture Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Hustles List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Deployed Side Hustle Portfolio</span>
                <span className="text-[11px] font-mono text-slate-500">{sideHustles.length} Ventures</span>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {sideHustles.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHustle(h)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedHustle?.id === h.id
                        ? 'bg-emerald-950/70 border-emerald-600 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-100 text-xs flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        {h.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-900 text-emerald-300 px-2 py-0.5 rounded border border-slate-800">
                        {h.target_mrr}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{h.tagline}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{h.deepseek_backend_architecture.framework}</span>
                      <span className="text-emerald-400 font-bold">{h.monetization_model}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Detailed DeepSeek Backend & AI Studio Scaffolding */}
            <div className="lg:col-span-7">
              {selectedHustle ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="border-b border-slate-800/80 pb-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 uppercase">
                        <span>{selectedHustle.category}</span>
                        <span>•</span>
                        <span className="text-yellow-400 font-bold">{selectedHustle.target_mrr}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 mt-1">{selectedHustle.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedHustle.tagline}</p>
                    </div>

                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold rounded">
                      LIVE BACKEND READY
                    </span>
                  </div>

                  {/* Pricing Tiers */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                      Configured Monetization Tiers:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedHustle.pricing_tiers.map((tier, i) => (
                        <div key={i} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{tier.tier}</span>
                            <span className="font-mono text-emerald-400 font-bold">{tier.price}</span>
                          </div>
                          <ul className="text-[10px] text-slate-400 space-y-0.5">
                            {tier.features.map((f, j) => (
                              <li key={j}>• {f}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DeepSeek Python FastAPI Code */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase flex items-center">
                        <Terminal className="w-3.5 h-3.5 mr-1" />
                        DeepSeek R1 Python FastAPI Backend:
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            selectedHustle.deepseek_backend_architecture.python_backend_code
                          )
                        }
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-200 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded cursor-pointer"
                      >
                        Copy Python Code
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
                      {selectedHustle.deepseek_backend_architecture.python_backend_code}
                    </pre>
                  </div>

                  {/* Google AI Studio Integration Scaffolding */}
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-lg space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase block">
                      Google AI Studio Gemini API Integration:
                    </span>
                    <pre className="font-mono text-[10px] text-slate-300">
                      {selectedHustle.deepseek_backend_architecture.gemini_ai_studio_scaffolding}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs bg-slate-950 border border-slate-800 rounded-xl">
                  Select a venture on the left or generate a new one.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LANDING PAGES & PITCH DECKS TAB */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            {/* Landing Page Generator */}
            <form onSubmit={handlePageSubmit} className="space-y-2">
              <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Generate Production Landing Page</span>
              </div>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product name (e.g. 'CampusBookRent')..."
                disabled={isGeneratingPage}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={valueProp}
                  onChange={(e) => setValueProp(e.target.value)}
                  placeholder="Value proposition..."
                  disabled={isGeneratingPage}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!productName.trim() || isGeneratingPage}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1 shrink-0"
                >
                  {isGeneratingPage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Generate landing page</span>
                  )}
                </button>
              </div>
            </form>

            {/* Pitch Deck Generator */}
            <form onSubmit={handleDeckSubmit} className="space-y-2">
              <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Presentation className="w-4 h-4 text-indigo-400" />
                <span>Generate 10-Slide VC Pitch Deck</span>
              </div>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Venture name..."
                disabled={isGeneratingDeck}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Core problem statement..."
                  disabled={isGeneratingDeck}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!productName.trim() || isGeneratingDeck}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1 shrink-0"
                >
                  {isGeneratingDeck ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Generate pitch deck</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Grid: Landing Pages & Pitch Decks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Generated Landing Pages */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Landing Page Previews ({landingPages.length})</span>
              </div>

              {landingPages.map((lp) => (
                <div key={lp.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-100 text-sm">{lp.title}</h4>
                      <p className="text-xs text-slate-400">{lp.subheadline}</p>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      /{lp.slug}
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-2 overflow-hidden">
                    <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-1 mb-1">
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span>Live HTML Render Preview:</span>
                    </div>
                    <div
                      className="p-3 bg-slate-950 rounded text-xs text-slate-300 max-h-48 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: lp.html_preview }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Pitch Decks */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                <Presentation className="w-4 h-4 text-indigo-400" />
                <span>10-Slide Pitch Decks ({pitchDecks.length})</span>
              </div>

              {pitchDecks.map((deck) => (
                <div key={deck.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-100 text-sm">{deck.title}</h4>
                      <p className="text-xs text-indigo-400">{deck.tagline}</p>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {deck.target_market_tam}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {deck.slides_outline?.map((slide) => (
                      <div
                        key={slide.slide_number}
                        className="p-2.5 bg-slate-900/60 rounded border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold shrink-0">
                            {slide.slide_number}
                          </span>
                          <span className="font-semibold text-slate-200">{slide.title}</span>
                        </div>
                        <ul className="pl-7 space-y-0.5 text-slate-400 text-[11px]">
                          {slide.key_points.map((pt, i) => (
                            <li key={i}>• {pt}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

