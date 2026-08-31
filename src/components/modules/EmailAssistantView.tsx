import React, { useState } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Sparkles,
  Bot,
  Tag,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Paperclip,
  Share2,
  Filter,
  Search,
  RefreshCw,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  UserCheck,
  PlusCircle,
  TrendingUp,
  Activity,
  Check,
  X,
  Code,
  Globe,
  Radio,
} from 'lucide-react';
import {
  NormalizedEmail,
  EmailCategory,
  EmailProcessingStatus,
  ExtractedActionItem,
  EmailDraftReply,
  PubSubWebhookLog,
} from '../../types/emailCalendarTypes';
import { EmailAssistantEngine } from '../../server/emailAssistantEngine';
import { GoogleWorkspaceHub } from '../GoogleWorkspaceHub';

interface EmailAssistantViewProps {
  onRequestApproval?: (summary: string, module: string) => void;
  onExportToPlanner?: (action: ExtractedActionItem) => void;
}

export const EmailAssistantView: React.FC<EmailAssistantViewProps> = ({
  onRequestApproval,
  onExportToPlanner,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<
    'smart_inbox' | 'thread_viewer' | 'action_items' | 'draft_studio' | 'pubsub_monitor' | 'workspace_hub'
  >('smart_inbox');

  const [emails, setEmails] = useState<NormalizedEmail[]>(EmailAssistantEngine.getInitialEmails());
  const [selectedEmailId, setSelectedEmailId] = useState<string>('email-001');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [webhookLogs, setWebhookLogs] = useState<PubSubWebhookLog[]>(EmailAssistantEngine.getInitialWebhookLogs());

  // Compose & Draft State
  const [activeTone, setActiveTone] = useState<'Warm Academic' | 'Formal Executive' | 'Collaborative Peer' | 'Concise Direct'>('Formal Executive');
  const [customDraftBody, setCustomDraftBody] = useState<string>('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState<boolean>(false);
  const [isSyncingGmail, setIsSyncingGmail] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // New Incoming Email Simulator
  const [simSubject, setSimSubject] = useState<string>('');
  const [simBody, setSimBody] = useState<string>('');
  const [simSender, setSimSender] = useState<string>('');

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleSelectEmail = (email: NormalizedEmail) => {
    setSelectedEmailId(email.id);
    if (!email.isRead) {
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
      );
    }
  };

  // Generate or Regenerate Draft with Tone
  const handleGenerateDraft = (email: NormalizedEmail, tone = activeTone) => {
    setIsGeneratingDraft(true);
    setTimeout(() => {
      const newDraft = EmailAssistantEngine.generateContextualDraft(email, tone);
      setEmails((prev) =>
        prev.map((e) =>
          e.id === email.id
            ? {
                ...e,
                draftReply: newDraft,
                processingStatus: 'DRAFT_GENERATED',
              }
            : e
        )
      );
      setCustomDraftBody(newDraft.bodyText);
      setIsGeneratingDraft(false);
      showToast(`AI draft synthesized using "${tone}" style profile.`);
    }, 600);
  };

  // Submit Draft to Human Approval Center
  const handleSubmitToApprovalCenter = (draft: EmailDraftReply) => {
    if (onRequestApproval) {
      onRequestApproval(
        `Email Reply to ${draft.to.join(', ')}: "${draft.subject}" (${draft.tone} tone)`,
        'email_assistant'
      );
    }
    setEmails((prev) =>
      prev.map((e) =>
        e.id === draft.emailId
          ? {
              ...e,
              draftReply: e.draftReply ? { ...e.draftReply, status: 'pending_approval' } : undefined,
            }
          : e
      )
    );
    showToast('Draft queued to Human Approval Center with cryptographic signature.');
  };

  // Mark as Sent
  const handleSendDraft = (draft: EmailDraftReply) => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === draft.emailId
          ? {
              ...e,
              isReplied: true,
              processingStatus: 'REPLIED',
              draftReply: e.draftReply ? { ...e.draftReply, status: 'sent' } : undefined,
            }
          : e
      )
    );
    showToast(`Email dispatched to ${draft.to.join(', ')} via Gmail API.`);
  };

  // Export Action Item to Planner
  const handleExportAction = (act: ExtractedActionItem) => {
    setEmails((prev) =>
      prev.map((e) => ({
        ...e,
        actionItems: e.actionItems.map((a) =>
          a.id === act.id ? { ...a, isExportedToPlanner: true, exportedTaskId: `task-wbs-${Date.now()}` } : a
        ),
      }))
    );
    if (onExportToPlanner) {
      onExportToPlanner(act);
    }
    showToast(`Action "${act.description.slice(0, 35)}..." mapped to WBS Planner.`);
  };

  // Simulate Gmail Push Notification Ingestion
  const handleSimulateNewEmail = () => {
    if (!simSubject.trim() || !simBody.trim()) {
      showToast('Please provide subject and body for incoming email simulation.');
      return;
    }
    const classification = EmailAssistantEngine.classifyEmailText(simSubject, simBody);
    const newId = `email-sim-${Date.now()}`;
    const newEmail: NormalizedEmail = {
      id: newId,
      messageId: `<sim-${Date.now()}@mail.atlas.ai>`,
      threadId: `th-sim-${Date.now()}`,
      fromAddress: simSender.trim() || 'collaborator@institution.edu',
      fromName: simSender.trim() || 'Dr. External Collaborator',
      toAddresses: ['junphookan@gmail.com'],
      ccAddresses: [],
      bccAddresses: [],
      subject: simSubject,
      bodyText: simBody,
      bodyHtml: `<p>${simBody.replace(/\n/g, '<br>')}</p>`,
      originalLanguage: 'en',
      sentDate: new Date().toISOString(),
      receivedDate: new Date().toISOString(),
      processingStatus: 'ACTIONS_PARSED',
      category: classification.category,
      categoryConfidence: classification.confidence,
      isImportant: true,
      isRead: false,
      isReplied: false,
      extractedEntities: classification.entities,
      actionItems: classification.actions,
      attachments: [],
      bounceStatus: 'none',
    };

    setEmails((prev) => [newEmail, ...prev]);
    setSelectedEmailId(newId);

    const newLog: PubSubWebhookLog = {
      id: `ps-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      provider: 'Gmail API',
      historyIdOrEvent: `hist_realtime_${Date.now()}`,
      emailAddress: 'junphookan@gmail.com',
      status: 'INGESTED',
      latencyMs: Math.floor(Math.random() * 100 + 120),
    };
    setWebhookLogs((prev) => [newLog, ...prev]);

    setSimSubject('');
    setSimBody('');
    setSimSender('');
    showToast(`New email ingested, classified as "${classification.category}" with ${Math.round(classification.confidence * 100)}% BERT confidence.`);
  };

  // Filtered emails
  const filteredEmails = emails.filter((e) => {
    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      e.category === selectedCategoryFilter ||
      (selectedCategoryFilter === 'unread' && !e.isRead) ||
      (selectedCategoryFilter === 'actions' && e.actionItems.length > 0) ||
      (selectedCategoryFilter === 'drafts' && !!e.draftReply);

    const matchesSearch =
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.bodyText.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categoryBadge = (cat: EmailCategory) => {
    switch (cat) {
      case 'opportunity':
        return { label: 'Opportunity ($500k+)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'professor_reply':
        return { label: 'Professor Reply', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'collaboration':
        return { label: 'Collaboration', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'action_required':
        return { label: 'Action Required', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'newsletter':
        return { label: 'Newsletter', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
      case 'personal':
        return { label: 'Personal / Event', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'spam':
        return { label: 'Filtered Spam', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    }
  };

  return (
    <div id="email-assistant-module" className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
              MODULE 10
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • BERT Intent Classifier • spaCy NER • Claude 3.5 Sonnet Drafting • Gmail API Pub/Sub
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Mail className="w-6 h-6 text-sky-400" />
            Email Assistant: Intelligent Inbox Management
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-sync-gmail"
            onClick={() => {
              setIsSyncingGmail(true);
              setTimeout(() => {
                setIsSyncingGmail(false);
                showToast('Gmail API mailbox synchronization complete. 0 new changes.');
              }, 800);
            }}
            disabled={isSyncingGmail}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin text-sky-400' : ''}`} />
            {isSyncingGmail ? 'Syncing Pub/Sub...' : 'Sync Mailbox'}
          </button>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Gmail API Live
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {feedbackToast && (
        <div className="p-3 bg-sky-950/80 border border-sky-700/60 rounded-xl text-xs font-mono text-sky-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-sky-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          id="tab-smart-inbox"
          onClick={() => setActiveTab('smart_inbox')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'smart_inbox'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Smart Inbox ({emails.filter((e) => !e.isRead).length} unread)
        </button>

        <button
          id="tab-action-items"
          onClick={() => setActiveTab('action_items')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'action_items'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Extracted Action Matrix (
          {emails.flatMap((e) => e.actionItems).filter((a) => !a.isExportedToPlanner).length} pending)
        </button>

        <button
          id="tab-draft-studio"
          onClick={() => setActiveTab('draft_studio')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'draft_studio'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          AI Reply Studio & Approval
        </button>

        <button
          id="tab-pubsub-monitor"
          onClick={() => setActiveTab('pubsub_monitor')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'pubsub_monitor'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          Pub/Sub & Ingestion Monitor
        </button>

        <button
          id="tab-workspace-hub"
          onClick={() => setActiveTab('workspace_hub')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'workspace_hub'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" />
          Google Workspace Hub (OAuth 2.0)
        </button>
      </div>

      {/* TAB 1: SMART INBOX & THREAD VIEWER SPLIT PANE */}
      {activeTab === 'smart_inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Inbox List */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Category Filter */}
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search emails, authors, subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'opportunity', label: 'Opportunities' },
                  { id: 'professor_reply', label: 'Professors' },
                  { id: 'collaboration', label: 'Collabs' },
                  { id: 'actions', label: 'Has Actions' },
                  { id: 'drafts', label: 'Draft Ready' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedCategoryFilter(f.id)}
                    className={`px-2 py-1 rounded transition ${
                      selectedCategoryFilter === f.id
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email List Cards */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredEmails.map((email) => {
                const isSelected = email.id === selectedEmailId;
                const badge = categoryBadge(email.category);

                return (
                  <div
                    key={email.id}
                    id={`email-item-${email.id}`}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-sky-500 shadow-md shadow-sky-950/30'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {!email.isRead && <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />}
                        <span
                          className={`text-xs font-semibold truncate max-w-[200px] ${
                            email.isRead ? 'text-slate-300' : 'text-white font-bold'
                          }`}
                        >
                          {email.fromName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(email.sentDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-medium text-slate-200 mt-1 line-clamp-1">{email.subject}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {email.bodyText.slice(0, 110)}...
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${badge.bg}`}>
                        {badge.label}
                      </span>

                      {email.actionItems.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {email.actionItems.length} Actions
                        </span>
                      )}

                      {email.draftReply && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Draft Ready
                        </span>
                      )}

                      {email.attachments.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 flex items-center gap-1">
                          <Paperclip className="w-2.5 h-2.5" />
                          {email.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredEmails.length === 0 && (
                <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl">
                  <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-mono">No emails match the selected filters.</p>
                </div>
              )}
            </div>

            {/* Ingestion Simulator Trigger */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-sky-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Test Push Webhook Ingestion
                </span>
                <span className="text-[10px] font-mono text-slate-500">BERT & NER Tester</span>
              </div>
              <input
                type="text"
                placeholder="Sender (e.g. director@nih.gov)"
                value={simSender}
                onChange={(e) => setSimSender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Subject (e.g. NIH R01 Bio-computing Award Update)"
                value={simSubject}
                onChange={(e) => setSimSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
              <textarea
                rows={2}
                placeholder="Body text with dates, funding amounts, requests..."
                value={simBody}
                onChange={(e) => setSimBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none resize-none"
              />
              <button
                id="btn-simulate-ingestion"
                onClick={handleSimulateNewEmail}
                className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 rounded text-xs font-mono font-bold text-white transition flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                Trigger Live Ingest & NLP Pipeline
              </button>
            </div>
          </div>

          {/* Right Column: Selected Thread Details, NER & Draft Generator */}
          <div className="lg:col-span-7 space-y-4">
            {selectedEmail ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          categoryBadge(selectedEmail.category).bg
                        }`}
                      >
                        {categoryBadge(selectedEmail.category).label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        BERT Confidence: {Math.round(selectedEmail.categoryConfidence * 100)}%
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-100 mt-1.5">{selectedEmail.subject}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      From: <span className="text-sky-300">{selectedEmail.fromName}</span> &lt;
                      {selectedEmail.fromAddress}&gt;
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      id="btn-generate-ai-reply"
                      onClick={() => handleGenerateDraft(selectedEmail)}
                      disabled={isGeneratingDraft}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isGeneratingDraft ? 'Generating Draft...' : 'Synthesize AI Draft'}
                    </button>
                  </div>
                </div>

                {/* Named Entity Recognition (NER) Banner */}
                {selectedEmail.extractedEntities.length > 0 && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-indigo-400 font-bold">
                        <Tag className="w-3 h-3" />
                        spaCy Named Entities Extracted
                      </span>
                      <span>{selectedEmail.extractedEntities.length} entities tagged</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEmail.extractedEntities.map((ent, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono flex items-center gap-1"
                        >
                          <span className="text-indigo-400 font-bold">[{ent.entityType}]</span>
                          {ent.entityText}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sanitized Message Body */}
                <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                    <span>RFC 2822 Message ID: {selectedEmail.messageId}</span>
                    <span>Received: {new Date(selectedEmail.receivedDate).toLocaleString()}</span>
                  </div>
                  <div
                    className="text-xs text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml || selectedEmail.bodyText }}
                  />
                </div>

                {/* Attachments Section */}
                {selectedEmail.attachments.length > 0 && (
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-sky-400" />
                      GCS Encrypted Attachments ({selectedEmail.attachments.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedEmail.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-300 truncate">{att.fileName}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {Math.round(att.fileSizeBytes / 1024)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items Extracted */}
                {selectedEmail.actionItems.length > 0 && (
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Extracted Action Items
                      </span>
                      <span className="text-slate-400 text-[10px]">Auto-linked to Planner WBS</span>
                    </div>

                    <div className="space-y-2">
                      {selectedEmail.actionItems.map((act) => (
                        <div
                          key={act.id}
                          className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5">
                            <p className="text-slate-200 font-medium">{act.description}</p>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                              <span className="text-amber-300">
                                Due: {act.deadline ? new Date(act.deadline).toLocaleDateString() : 'No deadline'}
                              </span>
                              <span>•</span>
                              <span>Target: {act.relatedEntity}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {act.isExportedToPlanner ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Mapped to WBS
                              </span>
                            ) : (
                              <button
                                id={`btn-export-act-${act.id}`}
                                onClick={() => handleExportAction(act)}
                                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-mono transition"
                              >
                                Export to WBS
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Draft Reply Preview & Tone Selector */}
                {selectedEmail.draftReply && (
                  <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-500/20 pb-2.5 gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-mono font-bold text-indigo-200">
                          Synthesized Reply Draft ({selectedEmail.draftReply.tone})
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-mono">
                        {(['Warm Academic', 'Formal Executive', 'Collaborative Peer', 'Concise Direct'] as const).map(
                          (tone) => (
                            <button
                              key={tone}
                              onClick={() => {
                                setActiveTone(tone);
                                handleGenerateDraft(selectedEmail, tone);
                              }}
                              className={`px-2 py-0.5 rounded transition ${
                                selectedEmail.draftReply?.tone === tone
                                  ? 'bg-indigo-600 text-white font-bold'
                                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {tone.split(' ')[0]}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Knowledge Workspace Context Pill */}
                    {selectedEmail.draftReply.knowledgeGraphContextUsed.length > 0 && (
                      <div className="text-[10px] font-mono text-slate-400 flex flex-wrap items-center gap-1.5">
                        <span className="text-indigo-300">KG Context Retrieved:</span>
                        {selectedEmail.draftReply.knowledgeGraphContextUsed.map((ctx, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                            {ctx}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p-3 bg-slate-950 border border-indigo-900/40 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {selectedEmail.draftReply.bodyText}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-2">
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>Formality: {selectedEmail.draftReply.formalityScore}%</span>
                        <span>Style Match: {selectedEmail.draftReply.styleMatchScore}%</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          id="btn-queue-approval"
                          onClick={() => handleSubmitToApprovalCenter(selectedEmail.draftReply!)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Queue to Approval Center
                        </button>

                        <button
                          id="btn-send-reply-direct"
                          onClick={() => handleSendDraft(selectedEmail.draftReply!)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send Now via Gmail
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-mono text-xs">
                Select an email from the inbox to inspect conversation and generate replies.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXTRACTED ACTION MATRIX */}
      {activeTab === 'action_items' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Structured Action Items Extracted from Inbound Emails
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Automatically parsed via LLM intent analyzer, mapped to WBS tasks with bidirectional traceability.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono font-bold">
              {emails.flatMap((e) => e.actionItems).length} Total Parsed Actions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emails.flatMap((e) => e.actionItems.map((act) => ({ act, email: e }))).map(({ act, email }) => (
              <div
                key={act.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        act.priority === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : act.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Priority: {act.priority}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Confidence: {Math.round(act.confidenceScore * 100)}%
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-100">{act.description}</h4>

                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    <p>
                      Source Email: <span className="text-slate-300">{email.subject}</span>
                    </p>
                    <p>
                      Sender: <span className="text-sky-300">{email.fromName}</span>
                    </p>
                    <p>
                      Deadline:{' '}
                      <span className="text-amber-300 font-bold">
                        {act.deadline ? new Date(act.deadline).toLocaleString() : 'Open / Unspecified'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">ID: {act.id}</span>
                  {act.isExportedToPlanner ? (
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Synchronized to WBS
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExportAction(act)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold transition flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Map to Planner WBS
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DRAFT STUDIO & APPROVAL QUEUE */}
      {activeTab === 'draft_studio' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Reply Drafting Studio & Approval Gate
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Multi-persona contextual response generator with historical tone matching and Human Approval Center linkage.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-mono">
              Claude 3.5 Sonnet / Gemini 2.5 Pro
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {emails.filter((e) => e.draftReply).map((email) => (
              <div
                key={email.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                      {email.draftReply?.tone}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Status: <span className="text-amber-400 uppercase">{email.draftReply?.status}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{email.draftReply?.subject}</h4>
                    <p className="text-[11px] font-mono text-slate-400">
                      To: {email.draftReply?.to.join(', ')}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {email.draftReply?.bodyText}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                    <span>Formality: {email.draftReply?.formalityScore}%</span>
                    <span>Style Match: {email.draftReply?.styleMatchScore}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleSubmitToApprovalCenter(email.draftReply!)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Queue to Approval Center
                  </button>

                  <button
                    onClick={() => handleSendDraft(email.draftReply!)}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send via Gmail API
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PUBSUB & INGESTION MONITOR */}
      {activeTab === 'pubsub_monitor' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Provider Status</span>
              <p className="text-base font-bold text-emerald-400 font-mono">Gmail API Push Active</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Pub/Sub Topic</span>
              <p className="text-base font-bold text-sky-400 font-mono">projects/atlas-ai/topics/gmail</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Ingestion Latency</span>
              <p className="text-base font-bold text-indigo-400 font-mono">142 ms</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Celery Ingestion Worker</span>
              <p className="text-base font-bold text-emerald-400 font-mono">celery@worker-email-01 (IDLE)</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Live Cloud Pub/Sub Webhook Ingestion Log Stream
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Near Instantaneous Webhooks</span>
            </div>

            <div className="space-y-2">
              {webhookLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold">
                      {log.provider}
                    </span>
                    <span className="text-slate-300">{log.historyIdOrEvent}</span>
                    <span className="text-slate-500">&lt;{log.emailAddress}&gt;</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400">{log.latencyMs} ms</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GOOGLE WORKSPACE OAUTH HUB */}
      {activeTab === 'workspace_hub' && (
        <div className="space-y-4">
          <GoogleWorkspaceHub />
        </div>
      )}
    </div>
  );
};
