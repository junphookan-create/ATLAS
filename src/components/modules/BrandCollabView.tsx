import React, { useState } from 'react';
import {
  Briefcase,
  DollarSign,
  FileCheck,
  Award,
  TrendingUp,
  Search,
  Sparkles,
  Send,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  BarChart2,
  FileText,
  UserCheck,
  ShieldCheck,
  Percent,
  Plus,
  ArrowRight,
  RefreshCw,
  PieChart,
  Calendar,
  AlertCircle,
  Copy,
} from 'lucide-react';
import {
  BrandDossier,
  SponsorshipPackage,
  MediaKitData,
  BrandDeal,
  BrandDealDeliverable,
  BrandDealInvoice,
  SocialPost,
} from '../../types';
import { BrandCollabEngine } from '../../server/brandCollabEngine';

interface BrandCollabViewProps {
  onRequestApproval?: (summary: string, module: string) => void;
  onSyncDeliverablesToSocial?: (posts: SocialPost[]) => void;
}

export const BrandCollabView: React.FC<BrandCollabViewProps> = ({
  onRequestApproval = (_summary: string, _module: string) => {},
  onSyncDeliverablesToSocial = (_posts: SocialPost[]) => {},
}) => {
  const [activeTab, setActiveTab] = useState<'discovery' | 'pitch_mediakit' | 'pipeline' | 'invoicing' | 'roi_reports'>('discovery');
  
  // Data State
  const [brandDossiers, setBrandDossiers] = useState<BrandDossier[]>(() => BrandCollabEngine.discoverProspectiveBrands());
  const [activeDeals, setActiveDeals] = useState<BrandDeal[]>(() => BrandCollabEngine.getActiveBrandDeals());
  const [mediaKit] = useState<MediaKitData>(() => BrandCollabEngine.getCreatorMediaKit());
  const [selectedBrand, setSelectedBrand] = useState<BrandDossier | null>(brandDossiers[0] || null);
  const [selectedDeal, setSelectedDeal] = useState<BrandDeal | null>(activeDeals[0] || null);

  // Pitch Builder State
  const [selectedPitchPackage, setSelectedPitchPackage] = useState<'Bronze' | 'Silver' | 'Gold'>('Silver');
  const [customPitchSubject, setCustomPitchSubject] = useState('');
  const [customPitchBody, setCustomPitchBody] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Generate pitch when selected brand or package changes
  React.useEffect(() => {
    if (selectedBrand) {
      const pitch = BrandCollabEngine.generateCommercialPitch(selectedBrand, selectedPitchPackage);
      setCustomPitchSubject(pitch.subject);
      setCustomPitchBody(pitch.body);
    }
  }, [selectedBrand, selectedPitchPackage]);

  const handleSendPitchApproval = () => {
    if (!selectedBrand) return;
    onRequestApproval(
      `Dispatch Commercial Brand Pitch to ${selectedBrand.primaryContact.name} (${selectedBrand.brandName}) for ${selectedPitchPackage} Tier Sponsorship`,
      'brand_collaboration'
    );
    setBrandDossiers((prev) =>
      prev.map((b) => (b.id === selectedBrand.id ? { ...b, pitchStatus: 'pitch_sent' } : b))
    );
    setStatusMessage(`Pitch to ${selectedBrand.brandName} routed to Approval Center!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSyncToSocial = (deal: BrandDeal) => {
    const posts = BrandCollabEngine.syncDeliverablesToSocialPosts(deal);
    onSyncDeliverablesToSocial(posts);
    onRequestApproval(
      `Auto-schedule ${deal.deliverables.length} sponsored campaign posts for ${deal.brandName} in Social Media Manager Calendar`,
      'brand_collaboration'
    );
    setStatusMessage(`Synced ${deal.deliverables.length} deliverables to Social Media Manager Calendar!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
              MODULE 7
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • Strategic Partnership, Deal Flow & Media Kit Engine
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Brand Collaboration Manager</h1>
        </div>

        {/* Global Stats */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Pipeline: <strong className="text-emerald-400 font-bold">$33,500 USD</strong></span>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Avg Sponsor Fit: <strong className="text-purple-300 font-bold">92%</strong></span>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Module Tabs */}
      <div className="flex items-center space-x-1 bg-slate-900/80 p-1 border border-slate-800 rounded-xl text-xs font-mono overflow-x-auto">
        {[
          { id: 'discovery', label: '1. Brand Discovery & Dossiers', icon: Search },
          { id: 'pitch_mediakit', label: '2. Pitch Studio & Media Kit', icon: FileText },
          { id: 'pipeline', label: '3. Deal Flow Pipeline', icon: Briefcase },
          { id: 'invoicing', label: '4. Invoicing & Milestone Payments', icon: DollarSign },
          { id: 'roi_reports', label: '5. Post-Campaign ROI & Analytics', icon: BarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRAND DISCOVERY & DOSSIERS */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Multi-Source Autonomous Brand Discovery Stream</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Continuously scrapes AspireIQ, Upfluence, competitor sponsorships, and brand developer partner portals.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs font-bold">
              {brandDossiers.length} Matched Opportunities
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Brand Cards List */}
            <div className="lg:col-span-5 space-y-3">
              {brandDossiers.map((brand) => (
                <div
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                    selectedBrand?.id === brand.id
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-950/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                      Source: {brand.discoverySource.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                      Fit: {brand.fitScore}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{brand.brandName}</h3>
                    <p className="text-xs text-slate-400 font-mono">{brand.industry}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">{brand.financialTier}</span>
                    <span className="text-emerald-400 font-bold uppercase">{brand.pitchStatus.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Detailed Selected Brand Dossier */}
            <div className="lg:col-span-7">
              {selectedBrand ? (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 font-mono text-xs">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold text-slate-100">{selectedBrand.brandName}</h2>
                        <a
                          href={selectedBrand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-emerald-400"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-slate-400 mt-0.5">{selectedBrand.industry} • {selectedBrand.financialTier}</p>
                    </div>

                    <div className="text-right">
                      <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-xl font-bold text-xs">
                        Strategic Fit: {selectedBrand.fitScore}%
                      </span>
                    </div>
                  </div>

                  {/* Mission & Fit Rationale */}
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                      Brand Mission:
                    </span>
                    <p className="text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      "{selectedBrand.missionStatement}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] text-emerald-300 uppercase tracking-wider block font-bold flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>LLM Strategic Fit Rationale:</span>
                    </span>
                    <p className="text-emerald-100 leading-relaxed bg-emerald-950/20 p-3 rounded-xl border border-emerald-800/40">
                      {selectedBrand.fitRationale}
                    </p>
                  </div>

                  {/* Target Demographics & Products */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Target Demographics:</span>
                      <p className="text-slate-300">{selectedBrand.targetDemographics}</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Flagship Product Portfolio:</span>
                      <p className="text-slate-300">{selectedBrand.productPortfolio.join(', ')}</p>
                    </div>
                  </div>

                  {/* Primary Decision Maker Contact */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Partnership Decision Maker:</span>
                    </span>
                    <div className="flex items-center justify-between text-slate-200">
                      <div>
                        <p className="font-bold">{selectedBrand.primaryContact.name}</p>
                        <p className="text-slate-400">{selectedBrand.primaryContact.role} • {selectedBrand.primaryContact.location}</p>
                      </div>
                      <span className="text-emerald-400 font-bold">{selectedBrand.primaryContact.email}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    {selectedBrand.matchedCompetitorCampaign && (
                      <span className="text-[11px] text-slate-400">
                        🔍 Ref: {selectedBrand.matchedCompetitorCampaign}
                      </span>
                    )}
                    <button
                      onClick={() => setActiveTab('pitch_mediakit')}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/30"
                    >
                      <span>Draft Commercial Pitch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 font-mono text-xs">
                  Select a brand dossier on the left to review strategic intelligence.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PITCH STUDIO & MEDIA KIT */}
      {activeTab === 'pitch_mediakit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Pitch Generator */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Commercial Pitch Generator for {selectedBrand?.brandName || 'Brand'}</span>
                  </h3>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    High-Converting Template
                  </span>
                </div>

                {/* Sponsorship Tier Selector */}
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2 font-bold">
                    Select Target Sponsorship Package Tier:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Bronze', 'Silver', 'Gold'] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setSelectedPitchPackage(tier)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          selectedPitchPackage === tier
                            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <p className="text-xs">{tier} Tier</p>
                        <p className="text-[10px] text-emerald-400 mt-0.5">
                          ${tier === 'Bronze' ? '3,500' : tier === 'Silver' ? '8,500' : '25,000'} USD
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Email Subject Line:
                  </label>
                  <input
                    type="text"
                    value={customPitchSubject}
                    onChange={(e) => setCustomPitchSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Pitch Body */}
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Personalized Commercial Body Copy:
                  </label>
                  <textarea
                    value={customPitchBody}
                    onChange={(e) => setCustomPitchBody(e.target.value)}
                    rows={12}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[11px]">
                    Includes attached Media Kit PDF
                  </span>
                  <button
                    onClick={handleSendPitchApproval}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Pitch to Approval Center</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Interactive Media Kit */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{mediaKit.creatorName}</h3>
                    <p className="text-emerald-400 text-[11px]">{mediaKit.niche}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                    Official Media Kit
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  "{mediaKit.tagline}"
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase">Network Reach</span>
                    <p className="text-base font-bold text-slate-100 mt-0.5">
                      {mediaKit.totalNetworkReach.toLocaleString()}+
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase">Avg Engagement</span>
                    <p className="text-base font-bold text-emerald-400 mt-0.5">{mediaKit.avgEngagementRate}%</p>
                  </div>
                </div>

                {/* Demographics Breakdown */}
                <div className="space-y-2">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                    Audience Demographics:
                  </span>
                  <div className="space-y-1.5">
                    {mediaKit.demographics.occupations.map((occ, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-slate-300">
                          <span>{occ.label}</span>
                          <span className="font-bold text-emerald-400">{occ.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${occ.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Case Studies */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                    Verified Past Case Studies:
                  </span>
                  {mediaKit.topContentCaseStudies.map((cs, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                        <span>{cs.title}</span>
                        <span className="text-emerald-400">{cs.engagement}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{cs.keyTakeaway}</p>
                    </div>
                  ))}
                </div>

                {/* Past Collaborators */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Trusted by:</span>
                  <span className="text-slate-200 font-bold">{mediaKit.pastBrandCollaborators.join(' • ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEAL FLOW PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Active Commercial Sponsorship Deals & Deliverables Pipeline</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Manage contracts, track milestone deliverables, and sync scheduled posts directly into the Social Media Manager.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {activeDeals.map((deal) => (
              <div
                key={deal.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 font-mono text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-100">{deal.brandName}</h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                        {deal.packageTier} Tier
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{deal.dealTitle}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px]">Contract Value:</span>
                      <p className="text-base font-bold text-emerald-400">${deal.contractValueUsd.toLocaleString()} USD</p>
                    </div>
                    <button
                      onClick={() => handleSyncToSocial(deal)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition shadow-md shadow-purple-600/20"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Sync to Social Calendar</span>
                    </button>
                  </div>
                </div>

                {/* Deliverables Checklist */}
                <div className="space-y-2">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                    Contract Deliverables ({deal.deliverables.length}):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {deal.deliverables.map((del) => (
                      <div
                        key={del.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 text-[10px] font-bold">
                              {del.platform} • {del.format.replace('_', ' ').toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                del.status === 'published'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : del.status === 'scheduled'
                                  ? 'bg-blue-950 text-blue-300'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {del.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-slate-200 font-bold mt-1.5">{del.title}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Due: {del.dueDate}</span>
                          {del.metrics && (
                            <span className="text-emerald-400 font-bold">
                              {del.metrics.impressions.toLocaleString()} views ({del.metrics.clicks} clicks)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoices and Communications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                      <span>Payment Milestone:</span>
                    </span>
                    {deal.invoices.map((inv) => (
                      <div key={inv.invoiceNumber} className="flex justify-between text-[11px]">
                        <span className="text-slate-300">{inv.invoiceNumber} ({inv.paymentTerms})</span>
                        <span className="font-bold text-emerald-400">
                          ${inv.amountUsd.toLocaleString()} ({inv.status.toUpperCase()})
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                      <FileCheck className="w-3 h-3 text-purple-400" />
                      <span>Latest Activity:</span>
                    </span>
                    <p className="text-[11px] text-slate-300">
                      {deal.communicationLog[deal.communicationLog.length - 1]?.summary || 'Deal initiated'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INVOICING & PAYMENTS */}
      {activeTab === 'invoicing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Commercial Invoice Generator & Payment Status Tracker</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Automated payment schedule calculations, Net 15/30 terms, and escrow/wire reconciliation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDeals.flatMap((d) => d.invoices.map((inv) => ({ ...inv, brandName: d.brandName }))).map((inv) => (
              <div
                key={inv.invoiceNumber}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{inv.invoiceNumber}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'paid'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {inv.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-200">{inv.brandName}</p>
                  <p className="text-slate-400 mt-0.5">Terms: {inv.paymentTerms}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Total Amount:</span>
                  <span className="text-base font-bold text-emerald-400">${inv.amountUsd.toLocaleString()} USD</span>
                </div>

                <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                  <span>Issued: {inv.issuedDate}</span>
                  <span>Due: {inv.dueDate}</span>
                </div>

                <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  Ref: {inv.paymentLinkOrWireInfo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: POST-CAMPAIGN ROI & ANALYTICS */}
      {activeTab === 'roi_reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 font-mono">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span>Post-Campaign ROI Attribution & Brand Partner Reports</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Automated UTM attribution, Earned Media Value (EMV), and creator hourly yield calculations.
              </p>
            </div>
          </div>

          {activeDeals[0]?.postCampaignReport && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Campaign Performance Audit: {activeDeals[0].brandName}
                  </h3>
                  <p className="text-slate-400">{activeDeals[0].dealTitle}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl font-bold">
                  Sponsor ROI: {activeDeals[0].postCampaignReport.estimatedRoiRatio}x Multiplier
                </span>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Total Impressions</span>
                  <p className="text-lg font-bold text-slate-100 mt-1">
                    {activeDeals[0].postCampaignReport.totalImpressions.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Engagements</span>
                  <p className="text-lg font-bold text-purple-300 mt-1">
                    {activeDeals[0].postCampaignReport.totalEngagements.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">UTM Portal Clicks</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">
                    {activeDeals[0].postCampaignReport.totalClicks.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Creator Yield Rate</span>
                  <p className="text-lg font-bold text-amber-400 mt-1">
                    ${activeDeals[0].postCampaignReport.creatorHourlyEarnedRate}/hr
                  </p>
                </div>
              </div>

              {/* BERT Sentiment & Comment Quotes */}
              <div className="space-y-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                  Audience Feedback & Sentiment Analysis:
                </span>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <span>Positive Sentiment: {activeDeals[0].postCampaignReport.sentimentBreakdown.positive}%</span>
                  </div>
                  {activeDeals[0].postCampaignReport.topCommentQuotes.map((quote, idx) => (
                    <p key={idx} className="text-slate-300 italic">
                      {quote}
                    </p>
                  ))}
                </div>
              </div>

              {/* Renewal Likelihood */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">
                  Client Renewal Likelihood: <strong className="text-emerald-400 font-bold">HIGH (95%)</strong>
                </span>
                <button
                  onClick={() => {
                    onRequestApproval(
                      `Export & Email Post-Campaign Performance PDF Report to ${activeDeals[0].contactEmail}`,
                      'brand_collaboration'
                    );
                    setStatusMessage('Report export routed to Approval Center!');
                    setTimeout(() => setStatusMessage(null), 4000);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/30"
                >
                  Export Branded Client Report (PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
