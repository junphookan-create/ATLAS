import React, { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  UserPlus,
  BarChart2,
  Building,
  MapPin,
  Search,
  Zap,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Compass,
  ArrowRight,
  Filter,
  Check,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Award,
  Layers,
  Inbox,
  Sliders,
  History,
  FileText,
  Flame,
  CheckCircle,
  XCircle,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
} from 'lucide-react';
import {
  Contact,
  Campaign,
  PersonalizedEmailDraft,
  ContextualDiscoveryCandidate,
  OutreachAnalyticsData,
  ContactAuditEntry,
} from '../../types';

interface OutreachManagerViewProps {
  contacts: Contact[];
  campaigns: Campaign[];
  onAddContact: (c: Contact) => void;
  onRequestApproval: (summary: string, module: string) => void;
}

type TabType = 'campaigns' | 'crm' | 'discovery' | 'drafting' | 'sequences' | 'analytics';

export const OutreachManagerView: React.FC<OutreachManagerViewProps> = ({
  contacts: initialContacts,
  campaigns: initialCampaigns,
  onAddContact,
  onRequestApproval,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('campaigns');
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [drafts, setDrafts] = useState<PersonalizedEmailDraft[]>([]);
  const [contextualCandidates, setContextualCandidates] = useState<ContextualDiscoveryCandidate[]>([]);
  const [analytics, setAnalytics] = useState<OutreachAnalyticsData | null>(null);

  // Selected states
  const [selectedContactId, setSelectedContactId] = useState<string>(initialContacts[0]?.id || '');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(initialCampaigns[0]?.id || '');
  const [activeDraft, setActiveDraft] = useState<PersonalizedEmailDraft | null>(null);

  // Filters & Inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nlCampaignPrompt, setNlCampaignPrompt] = useState(
    'Reach out to professors in neuromorphic computing and STDP with h-index > 30 for summer research fellowship.'
  );
  const [isSynthesizingCampaign, setIsSynthesizingCampaign] = useState(false);

  // Discovery states
  const [discoveryQuery, setDiscoveryQuery] = useState('Spatial Transcriptomics Microglia');
  const [institutionTier, setInstitutionTier] = useState('Tier 1 R1 Universities');
  const [minHIndexInput, setMinHIndexInput] = useState(25);
  const [isSearchingTargeted, setIsSearchingTargeted] = useState(false);
  const [discoveredResults, setDiscoveredResults] = useState<Contact[]>([]);

  // Drafting states
  const [isDrafting, setIsDrafting] = useState(false);
  const [userBackgroundNote, setUserBackgroundNote] = useState(
    'Junior Research Fellow at Atlas AI specializing in neuromorphic edge computing, sparse STDP algorithms, and biological data systems.'
  );
  const [isSendingDraft, setIsSendingDraft] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // Follow-up & Simulation states
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [isSimulatingReply, setIsSimulatingReply] = useState(false);
  const [replySimulationType, setReplySimulationType] = useState<'positive' | 'neutral' | 'negative'>('positive');

  // Contact Modal / Creation
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactAffiliation, setNewContactAffiliation] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactTitle, setNewContactTitle] = useState('Associate Professor');
  const [newContactInterests, setNewContactInterests] = useState('Neuromorphic AI, Computational Neuroscience');

  // Load backend data
  useEffect(() => {
    fetchBackendData();
  }, []);

  const fetchBackendData = async () => {
    try {
      const [cntRes, cmpRes, candRes, dftRes, anaRes] = await Promise.all([
        fetch('/api/outreach/contacts').then((r) => r.json()),
        fetch('/api/outreach/campaigns').then((r) => r.json()),
        fetch('/api/outreach/discovery/contextual').then((r) => r.json()),
        fetch('/api/outreach/drafts').then((r) => r.json()),
        fetch('/api/outreach/analytics').then((r) => r.json()),
      ]);

      if (cntRes.contacts && cntRes.contacts.length > 0) {
        setContacts(cntRes.contacts);
        if (!selectedContactId) setSelectedContactId(cntRes.contacts[0].id);
      }
      if (cmpRes.campaigns && cmpRes.campaigns.length > 0) {
        setCampaigns(cmpRes.campaigns);
        if (!selectedCampaignId) setSelectedCampaignId(cmpRes.campaigns[0].id);
      }
      if (candRes.candidates) setContextualCandidates(candRes.candidates);
      if (dftRes.drafts) {
        setDrafts(dftRes.drafts);
        if (dftRes.drafts.length > 0 && !activeDraft) setActiveDraft(dftRes.drafts[0]);
      }
      if (anaRes.analytics) setAnalytics(anaRes.analytics);
    } catch (e) {
      console.error('Error fetching outreach data:', e);
    }
  };

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  // 1. Natural Language Campaign Synthesis
  const handleSynthesizeCampaign = async () => {
    if (!nlCampaignPrompt.trim()) return;
    setIsSynthesizingCampaign(true);
    try {
      const res = await fetch('/api/outreach/campaigns/nl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: nlCampaignPrompt,
          objective: 'Relationship Building & Academic Mentorship',
        }),
      });
      const data = await res.json();
      if (data.campaign) {
        setCampaigns((prev) => [data.campaign, ...prev]);
        setSelectedCampaignId(data.campaign.id);
        setActiveTab('campaigns');
      }
    } catch (e) {
      console.error('Failed to create campaign:', e);
    } finally {
      setIsSynthesizingCampaign(false);
    }
  };

  // 2. Targeted Contact Discovery
  const handleTargetedSearch = async () => {
    if (!discoveryQuery.trim()) return;
    setIsSearchingTargeted(true);
    try {
      const res = await fetch('/api/outreach/discovery/targeted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: discoveryQuery,
          institutionTier,
          minHIndex: minHIndexInput,
        }),
      });
      const data = await res.json();
      if (data.contacts) {
        setDiscoveredResults(data.contacts);
        setContacts((prev) => [...data.contacts, ...prev]);
        fetchBackendData();
      }
    } catch (e) {
      console.error('Targeted search error:', e);
    } finally {
      setIsSearchingTargeted(false);
    }
  };

  // 3. Import Contextual Candidate
  const handleImportCandidate = async (candidateId: string) => {
    try {
      const res = await fetch('/api/outreach/discovery/contextual/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();
      if (data.contact) {
        setContacts((prev) => [data.contact, ...prev]);
        setContextualCandidates((prev) => prev.filter((c) => c.id !== candidateId));
        setSelectedContactId(data.contact.id);
        onAddContact(data.contact);
      }
    } catch (e) {
      console.error('Failed to import contextual candidate:', e);
    }
  };

  // 4. Generate Bespoke 3-Hook Email Draft
  const handleGenerateDraft = async (contactToDraft?: Contact) => {
    const targetContact = contactToDraft || selectedContact;
    if (!targetContact) return;
    setIsDrafting(true);
    try {
      const res = await fetch('/api/outreach/email/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: targetContact.id,
          campaignId: selectedCampaignId,
          userBackground: userBackgroundNote,
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setActiveDraft(data.draft);
        setDrafts((prev) => [data.draft, ...prev]);
        setActiveTab('drafting');
      }
    } catch (e) {
      console.error('Failed to draft email:', e);
    } finally {
      setIsDrafting(false);
    }
  };

  // 5. Generate Follow-Up Draft
  const handleGenerateFollowUp = async () => {
    if (!activeDraft) return;
    setIsGeneratingFollowUp(true);
    try {
      const res = await fetch('/api/outreach/email/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialDraftId: activeDraft.id }),
      });
      const data = await res.json();
      if (data.draft) {
        setActiveDraft(data.draft);
        setDrafts((prev) => [data.draft, ...prev]);
      }
    } catch (e) {
      console.error('Failed to generate follow up:', e);
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  // 6. Send Email via Celery Worker Queue
  const handleSendDraft = async () => {
    if (!activeDraft) return;
    setIsSendingDraft(true);
    try {
      const res = await fetch('/api/outreach/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: activeDraft.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveDraft(data.draft);
        setSendSuccessMessage(data.queueStatus);
        setTimeout(() => setSendSuccessMessage(null), 6000);
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to send email:', e);
    } finally {
      setIsSendingDraft(false);
    }
  };

  // 7. Simulate Incoming Reply & NLP Sentiment
  const handleSimulateReply = async (type: 'positive' | 'neutral' | 'negative') => {
    if (!activeDraft) return;
    setIsSimulatingReply(true);
    try {
      const res = await fetch('/api/outreach/email/reply-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: activeDraft.id,
          sentiment: type,
          intent: type === 'positive' ? 'interested' : type === 'neutral' ? 'request_for_info' : 'not_interested',
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setActiveDraft(data.draft);
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to simulate reply:', e);
    } finally {
      setIsSimulatingReply(false);
    }
  };

  // 8. Add Manual Contact
  const handleAddManualContact = () => {
    if (!newContactName.trim() || !newContactEmail.trim()) return;
    const newC: Contact = {
      id: `cnt-${Date.now()}`,
      name: newContactName,
      title: newContactTitle,
      affiliation: newContactAffiliation || 'Independent',
      email: newContactEmail,
      location: 'United States',
      researchInterests: newContactInterests.split(',').map((s) => s.trim()),
      relationshipStrength: 0.2,
      lastContacted: 'Never',
      status: 'prospective',
      source: 'manual',
      profile: {
        hIndex: 20,
        citationCount: 2100,
        verifiedEmailScore: 92,
        emailDeliverability: 'valid',
        preferredTimeZone: 'America/New_York (EST)',
      },
      auditTrail: [
        {
          id: `adt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          changedField: 'created',
          oldValue: 'null',
          newValue: newContactName,
          changedBy: 'user_jun',
          complianceReason: 'Manual CRM Form Addition',
        },
      ],
    };

    setContacts((prev) => [newC, ...prev]);
    onAddContact(newC);
    setSelectedContactId(newC.id);
    setShowAddContactModal(false);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactAffiliation('');
  };

  // Filtered Contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.affiliation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.researchInterests.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                MODULE 5
              </span>
              <span className="text-xs text-slate-400 font-mono">• Intelligent Relationship Development & Campaign Orchestration</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Outreach Manager
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated multi-tenant CRM, dual-strategy contact discovery (Browser Agent + Semantic Scholar + Event Bus), 3-hook personalized cold drafting, and surgical 5–7 day follow-up sequences.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">CRM Contacts</span>
              <p className="text-lg font-bold text-indigo-400 font-mono">{contacts.length}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Open Rate</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{analytics?.openRate || 87}%</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Positive Reply</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{analytics?.positiveReplyRate || 75}%</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Meetings Booked</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{analytics?.meetingsBooked || 7}</p>
            </div>
          </div>
        </div>

        {/* Global Natural Language Campaign Prompt Bar */}
        <div className="mt-5 pt-5 border-t border-slate-800 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nlCampaignPrompt}
              onChange={(e) => setNlCampaignPrompt(e.target.value)}
              placeholder="State outreach intent in natural language (e.g. Reach out to professors in neuromorphic computing with h-index > 30)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
            />
          </div>
          <button
            onClick={handleSynthesizeCampaign}
            disabled={isSynthesizingCampaign}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shrink-0 cursor-pointer"
          >
            {isSynthesizingCampaign ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSynthesizingCampaign ? 'Synthesizing Campaign...' : 'Launch NL Campaign'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto scrollbar-none gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Campaign Orchestrator</span>
          <span className="px-1.5 py-0.2 bg-indigo-950 border border-indigo-700 text-indigo-300 text-[10px] font-bold rounded-full">
            {campaigns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'crm'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>CRM Dossiers & Contacts</span>
          <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-full">
            {contacts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('discovery')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'discovery'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Contact Discovery Engine</span>
          {contextualCandidates.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-bold rounded-full">
              {contextualCandidates.length} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('drafting')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'drafting'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Bespoke 3-Hook Drafter</span>
        </button>

        <button
          onClick={() => setActiveTab('sequences')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'sequences'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Follow-Up & Reply Sequences</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Performance & Analytics</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CAMPAIGN ORCHESTRATOR
      ========================================================================= */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                Multi-Strategy Campaign Engine & Dispatch Schedule
              </h3>
              <p className="text-xs text-slate-400">
                Celery worker queue rate-limiting (max 6-10 sends/day) • Priority formula: Prestige ($h$-index) × Responsiveness × Interest Alignment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Anti-Spam Daily Quotas Enforced
              </span>
            </div>
          </div>

          {/* Campaign Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {campaigns.map((cmp) => {
              const isSelected = selectedCampaignId === cmp.id;
              return (
                <div
                  key={cmp.id}
                  onClick={() => setSelectedCampaignId(cmp.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden space-y-4 ${
                    isSelected
                      ? 'bg-slate-900/90 border-indigo-500 shadow-xl'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        cmp.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : cmp.status === 'completed'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cmp.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Cadence: {cmp.followUpDays || 6}d Follow-up
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{cmp.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cmp.objective}</p>
                  </div>

                  {/* Progress & Metrics */}
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between font-mono text-slate-400 text-[11px]">
                      <span>Dispatched: {cmp.emailsSent}/{cmp.totalContacts}</span>
                      <span className="text-emerald-400 font-bold">
                        Replies: {cmp.repliesReceived} ({Math.round(cmp.positiveReplyRate * 100)}% +ve)
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                        style={{
                          width: `${Math.min(100, Math.round((cmp.emailsSent / (cmp.totalContacts || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span>Limit: {cmp.maxContactsPerDay || 6}/day</span>
                    <span>Role: {cmp.targetRole}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Campaign Detail & Contact Queue */}
          {selectedCampaign && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">ACTIVE ORCHESTRATION PIPELINE</span>
                  <h3 className="text-base font-bold text-white">{selectedCampaign.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('drafting');
                      handleGenerateDraft();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Next Campaign Draft</span>
                  </button>
                </div>
              </div>

              {/* Natural Language Intent Rationale */}
              {selectedCampaign.naturalLanguageIntent && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Natural Language Strategy:</span>
                  <p className="text-slate-300 italic font-mono text-[11px]">"{selectedCampaign.naturalLanguageIntent}"</p>
                </div>
              )}

              {/* Campaign Targets List */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">Queued High-Priority Targets:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {contacts.slice(0, 4).map((cnt) => (
                    <div
                      key={cnt.id}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-slate-200">{cnt.name}</h5>
                        <p className="text-[11px] text-slate-400">{cnt.title} • {cnt.affiliation}</p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                          <span>h-index: {cnt.profile?.hIndex || 30}</span>
                          <span>•</span>
                          <span className="text-emerald-400">Hunter: {cnt.profile?.verifiedEmailScore || 95}%</span>
                          <span>•</span>
                          <span>{cnt.profile?.preferredTimeZone?.split(' ')[0] || 'EST'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedContactId(cnt.id);
                          handleGenerateDraft(cnt);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                      >
                        <Mail className="w-3 h-3 text-indigo-400" />
                        <span>Draft</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: CRM DOSSIERS & CONTACTS
      ========================================================================= */}
      {activeTab === 'crm' && (
        <div className="space-y-6">
          {/* Top Bar: Search, Filters & Add Contact */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, institution, research interest..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="prospective">Prospective</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="collaborator">Collaborator</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddContactModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add CRM Lead</span>
            </button>
          </div>

          {/* CRM Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Contact Directory */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>RECORDS ({filteredContacts.length})</span>
                <span>SORT: STRENGTH DESC</span>
              </div>

              <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredContacts.map((cnt) => {
                  const isSelected = cnt.id === selectedContactId;
                  return (
                    <div
                      key={cnt.id}
                      onClick={() => setSelectedContactId(cnt.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-500 shadow-lg'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-100 text-sm">{cnt.name}</h4>
                        <span
                          className={`text-[10px] font-mono capitalize px-2 py-0.5 rounded ${
                            cnt.status === 'collaborator'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : cnt.status === 'replied'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : cnt.status === 'contacted'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {cnt.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">{cnt.title} • {cnt.affiliation}</p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                        <span>{cnt.location}</span>
                        <span className="text-indigo-400 font-bold">
                          Relationship: {Math.round(cnt.relationshipStrength * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Detailed Dossier */}
            {selectedContact ? (
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{selectedContact.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">
                        Source: {selectedContact.source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedContact.title} at {selectedContact.affiliation}</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('drafting');
                      handleGenerateDraft();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Draft Bespoke Outreach</span>
                  </button>
                </div>

                {/* Quantitative Academic & Deliverability Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">H-Index</span>
                    <p className="text-base font-bold text-indigo-400 font-mono">{selectedContact.profile?.hIndex || 35}</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Citations</span>
                    <p className="text-base font-bold text-sky-400 font-mono">{selectedContact.profile?.citationCount?.toLocaleString() || '7,400'}</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Email Verifier</span>
                    <p className="text-base font-bold text-emerald-400 font-mono">{selectedContact.profile?.verifiedEmailScore || 96}% Score</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Time Zone</span>
                    <p className="text-[11px] font-bold text-slate-200 font-mono truncate">{selectedContact.profile?.preferredTimeZone || 'America/New_York'}</p>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Contact Coordinates & Mailboxes:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                    <div>Primary: <strong className="text-sky-400">{selectedContact.email}</strong></div>
                    <div>Secondary: <span className="text-slate-400">{selectedContact.secondaryEmail || 'None'}</span></div>
                    <div>Phone: <span className="text-slate-400">{selectedContact.phone || '+1 (650) 723-XXXX'}</span></div>
                    <div>Location: <span className="text-slate-300">{selectedContact.location}</span></div>
                  </div>
                </div>

                {/* Research Interests */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">Research Interests & Semantic Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContact.researchInterests.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recent High-Impact Publications */}
                {selectedContact.profile?.recentPublications && selectedContact.profile.recentPublications.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase font-bold">Recent High-Impact Papers (for Contextual Hook):</span>
                    <div className="space-y-1.5">
                      {selectedContact.profile.recentPublications.map((p, i) => (
                        <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{p.title}</span>
                            <span className="text-[10px] font-mono text-indigo-400">{p.year}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">{p.journal} • {p.citations || 24} citations</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GDPR & Compliance Audit Trail */}
                {selectedContact.auditTrail && selectedContact.auditTrail.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-indigo-400" />
                      Compliance & Contact Audit Trail (GDPR Compliant):
                    </span>
                    <div className="space-y-1 font-mono text-[11px] text-slate-400 max-h-32 overflow-y-auto">
                      {selectedContact.auditTrail.map((adt) => (
                        <div key={adt.id} className="p-2 bg-slate-950/70 border border-slate-800/60 rounded-lg flex items-center justify-between gap-2">
                          <div>
                            <strong className="text-slate-300">{adt.changedField}:</strong> {adt.oldValue} ➔ <span className="text-emerald-400">{adt.newValue}</span>
                            <p className="text-[10px] text-slate-500">{adt.complianceReason}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(adt.timestamp).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CONTACT DISCOVERY ENGINE (TARGETED & CONTEXTUAL)
      ========================================================================= */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          {/* Targeted Search Bar */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-400" />
                Strategy 1: Targeted Faculty & Industry Directory Discovery
              </h3>
              <p className="text-xs text-slate-400">
                Crawls top university faculty pages, extracts Semantic Scholar citation metrics, heuristic email syntaxes, and validates with Hunter.io mailbox verifier.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Search Criteria / Domain:</label>
                <input
                  type="text"
                  value={discoveryQuery}
                  onChange={(e) => setDiscoveryQuery(e.target.value)}
                  placeholder="e.g. Spatial Transcriptomics, Asynchronous Neuromorphic..."
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Target Institution Tier:</label>
                <select
                  value={institutionTier}
                  onChange={(e) => setInstitutionTier(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <option>Tier 1 R1 Universities</option>
                  <option>Top 10 Global AI Labs</option>
                  <option>European Research Councils</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Min H-Index: ({minHIndexInput})</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={minHIndexInput}
                    onChange={(e) => setMinHIndexInput(Number(e.target.value))}
                    className="flex-1"
                  />
                  <button
                    onClick={handleTargetedSearch}
                    disabled={isSearchingTargeted}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    {isSearchingTargeted ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Crawl</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Candidates from Competitions & Literature Bus */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Strategy 2: Contextual Event & Literature Network Discovery
                </h4>
                <p className="text-xs text-slate-400">
                  Automatically listens to events from Module 2 (Competitions judges/winners) and Module 4 (Literature corresponding authors).
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                {contextualCandidates.length} Candidates Extracted
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contextualCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono uppercase font-bold">
                      {cand.sourceType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {Math.round(cand.confidenceScore * 100)}% Match Confidence
                    </span>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-white">{cand.name}</h5>
                    <p className="text-xs text-slate-400">{cand.role} • {cand.affiliation}</p>
                    <p className="text-[11px] font-mono text-sky-400 mt-0.5">Origin: {cand.sourceEntityName}</p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Suggested Collaboration Angle:</span>
                    <p className="text-slate-300 text-[11px]">{cand.suggestedCollaborationAngle}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-slate-400">Predicted Email: {cand.emailGuess}</span>
                    <button
                      onClick={() => handleImportCandidate(cand.id)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Import into CRM</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BESPOKE 3-HOOK DRAFTER & STYLE CHECKER
      ========================================================================= */}
      {activeTab === 'drafting' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Personalized 3-Hook Cold Email Drafter with Style-Matching
              </h3>
              <p className="text-xs text-slate-400">
                1. Specific Compliment (Publication/Breakthrough) • 2. Personal Technical Connection • 3. Low-Friction Concrete Ask.
              </p>
            </div>

            <button
              onClick={() => handleGenerateDraft()}
              disabled={isDrafting}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {isDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isDrafting ? 'Synthesizing Draft...' : 'Re-Generate Bespoke Draft'}</span>
            </button>
          </div>

          {activeDraft ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: 3-Hook Breakdown & Style Metrics */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                    3-Element Cold Outreach Architecture:
                  </span>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-950 border border-indigo-900/50 rounded-xl space-y-1">
                      <span className="font-mono text-[10px] text-indigo-400 uppercase font-bold flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-indigo-400" />
                        Hook 1: Specific Technical Compliment
                      </span>
                      <p className="text-slate-200">{activeDraft.personalizedCompliment}</p>
                    </div>

                    <div className="p-3 bg-slate-950 border border-sky-900/50 rounded-xl space-y-1">
                      <span className="font-mono text-[10px] text-sky-400 uppercase font-bold flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-sky-400" />
                        Hook 2: Connection to User Background
                      </span>
                      <p className="text-slate-200">{activeDraft.userBackgroundConnection}</p>
                    </div>

                    <div className="p-3 bg-slate-950 border border-emerald-900/50 rounded-xl space-y-1">
                      <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                        Hook 3: Low-Friction Concrete Ask
                      </span>
                      <p className="text-slate-200">{activeDraft.concreteAsk}</p>
                    </div>
                  </div>
                </div>

                {/* Style Checking Scorecard */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                    User Persona Style Matcher:
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Formality</span>
                      <p className="text-base font-bold text-emerald-400 font-mono">{activeDraft.styleScore.formalityMatch}%</p>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Conciseness</span>
                      <p className="text-base font-bold text-sky-400 font-mono">{activeDraft.styleScore.concisenessScore}%</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                    Tone: <strong className="text-indigo-400">{activeDraft.styleScore.toneAlignment}</strong>
                  </div>
                </div>
              </div>

              {/* Right: Email Draft Preview & Approval Queue */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">RECIPIENT & SUBJECT</span>
                    <h4 className="text-sm font-bold text-white">To: {activeDraft.contactName} ({activeDraft.recipientEmail})</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono uppercase">
                    Status: {activeDraft.approvalStatus}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Subject Line:</span>
                  <p className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100">
                    {activeDraft.subject}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Email Body Content:</span>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {activeDraft.body}
                  </div>
                </div>

                {/* Send status notice */}
                {sendSuccessMessage && (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{sendSuccessMessage}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleGenerateFollowUp}
                    disabled={isGeneratingFollowUp}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isGeneratingFollowUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>Draft 5–7 Day Follow-Up</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onRequestApproval(
                          `Dispatch personalized outreach email to ${activeDraft.contactName} (${activeDraft.recipientEmail})`,
                          'outreach_manager'
                        )
                      }
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Send to Approval Center</span>
                    </button>

                    <button
                      onClick={handleSendDraft}
                      disabled={isSendingDraft || activeDraft.approvalStatus === 'sent'}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      {isSendingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{activeDraft.approvalStatus === 'sent' ? 'Sent via Celery' : 'Direct Send via Celery'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <Mail className="w-10 h-10 text-slate-600" />
              <p className="text-sm text-slate-400">Select a contact and click "Generate Bespoke Draft" to inspect.</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: SEQUENCES & REPLY DETECTION
      ========================================================================= */}
      {activeTab === 'sequences' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Automated 2-Step Sequence Pipeline & Inbox Reply Classifier
              </h3>
              <p className="text-xs text-slate-400">
                Step 1: Initial Hook $\to$ Step 2 (Wait 6d): Low-Friction Check-in $\to$ Step 3: NLP Sentiment & Intent Routing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Simulate Inbox Reply:</span>
              <button
                onClick={() => handleSimulateReply('positive')}
                disabled={isSimulatingReply}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs font-mono transition-all cursor-pointer"
              >
                + Positive Reply
              </button>
              <button
                onClick={() => handleSimulateReply('neutral')}
                disabled={isSimulatingReply}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs font-mono transition-all cursor-pointer"
              >
                Neutral/Info
              </button>
              <button
                onClick={() => handleSimulateReply('negative')}
                disabled={isSimulatingReply}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs font-mono transition-all cursor-pointer"
              >
                Declined
              </button>
            </div>
          </div>

          {/* Sequence Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-indigo-400 font-bold">
                <span>STEP 1: INITIAL OUTREACH</span>
                <span>DAY 0</span>
              </div>
              <p className="text-slate-300 font-semibold">Hyper-Personalized 3-Hook Draft</p>
              <p className="text-slate-400 text-[11px]">Dispatched via Celery worker queue with time-zone optimization.</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-amber-400 font-bold">
                <span>STEP 2: GENTLE FOLLOW-UP</span>
                <span>DAY +6</span>
              </div>
              <p className="text-slate-300 font-semibold">Low-Friction Polite Check-In</p>
              <p className="text-slate-400 text-[11px]">Includes low-pressure exit option ("quick not interested is fine").</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-emerald-400 font-bold">
                <span>STEP 3: INTENT CLASSIFIER</span>
                <span>ON REPLY</span>
              </div>
              <p className="text-slate-300 font-semibold">Automated Meeting Coordination</p>
              <p className="text-slate-400 text-[11px]">Classifies positive intent $\to$ Triggers Calendar Intelligence.</p>
            </div>
          </div>

          {/* Active Reply Detection Card */}
          {activeDraft?.replyData?.detected && (
            <div className="p-5 bg-slate-900 border border-emerald-800/80 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">
                    Incoming Inbox Reply Detected from {activeDraft.contactName}
                  </h4>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                    activeDraft.replyData.sentiment === 'positive'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : activeDraft.replyData.sentiment === 'neutral'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  Sentiment: {activeDraft.replyData.sentiment} ({activeDraft.replyData.intent})
                </span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans text-slate-200 leading-relaxed italic">
                "{activeDraft.replyData.snippet}"
              </div>

              {activeDraft.replyData.sentiment === 'positive' && (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-900 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono text-emerald-300 font-bold">
                    Suggested Next Action: Schedule 15-min discovery call via Calendar Intelligence
                  </span>
                  <button
                    onClick={() =>
                      onRequestApproval(
                        `Schedule discovery meeting with ${activeDraft.contactName} for Thursday 2 PM EST`,
                        'calendar_intelligence'
                      )
                    }
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer shrink-0"
                  >
                    Launch Calendar Scheduler
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 6: PERFORMANCE & ANALYTICS
      ========================================================================= */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-400" />
                Aggregated Campaign Deliverability & Conversion Funnel
              </h3>
              <p className="text-xs text-slate-400">
                Measures read receipts, reply velocity, and meeting conversion rates across academic vs industry leads.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold">
              Spam Risk: {analytics.spamRiskScore}/100 (Safe)
            </span>
          </div>

          {/* Funnel Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Delivered</span>
              <p className="text-xl font-bold text-white font-mono">{analytics.totalDelivered}</p>
              <span className="text-[10px] text-emerald-400 font-mono">100% In-Box</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Open Rate</span>
              <p className="text-xl font-bold text-sky-400 font-mono">{analytics.openRate}%</p>
              <span className="text-[10px] text-slate-400 font-mono">Pixel & Read-Receipt</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Reply Rate</span>
              <p className="text-xl font-bold text-indigo-400 font-mono">{analytics.replyRate}%</p>
              <span className="text-[10px] text-slate-400 font-mono">Within 72 Hours</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Positive Sentiment</span>
              <p className="text-xl font-bold text-emerald-400 font-mono">{analytics.positiveReplyRate}%</p>
              <span className="text-[10px] text-emerald-400 font-mono">Interested / Synergies</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Meetings Booked</span>
              <p className="text-xl font-bold text-amber-400 font-mono">{analytics.meetingsBooked}</p>
              <span className="text-[10px] text-amber-400 font-mono">Converted Leads</span>
            </div>
          </div>

          {/* AI Optimization Recommendations */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">
              AI Continuous Learning & Optimization Recommendations:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-100">{rec.title}</h5>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                      {rec.potentialImpact}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{rec.insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD MANUAL CRM CONTACT
      ========================================================================= */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New CRM Contact</h3>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Full Name</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Prof. Rachel Adams"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Affiliation / Lab</label>
                <input
                  type="text"
                  value={newContactAffiliation}
                  onChange={(e) => setNewContactAffiliation(e.target.value)}
                  placeholder="e.g. MIT EECS / Broad Institute"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="e.g. radams@mit.edu"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Research Interests (comma separated)</label>
                <input
                  type="text"
                  value={newContactInterests}
                  onChange={(e) => setNewContactInterests(e.target.value)}
                  placeholder="e.g. Neuromorphic Computing, In-Situ Sequencing"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddContactModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualContact}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
