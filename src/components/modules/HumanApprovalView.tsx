import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Code,
  Shield,
  Clock,
  Lock,
  Edit3,
  MessageSquare,
  Radio,
  FileText,
  Eye,
  CheckSquare,
  Square,
  Settings,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';
import { ApprovalRequest, ApprovalPolicy } from '../../types';

interface HumanApprovalViewProps {
  approvals: ApprovalRequest[];
  onDecision: (
    id: string,
    decision: 'approved' | 'approved_with_modifications' | 'denied' | 'more_info_requested',
    justification?: string,
    modifications?: Record<string, any>
  ) => void;
  onBatchDecision?: (requestIds: string[], decision: 'approved' | 'denied', justification?: string) => void;
}

export const HumanApprovalView: React.FC<HumanApprovalViewProps> = ({
  approvals,
  onDecision,
  onBatchDecision,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'policies' | 'audit'>('requests');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'denied' | 'expired'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(approvals[0]?.id || null);

  // Decision Modals State
  const [denyModalId, setDenyModalId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  
  const [modifyModalId, setModifyModalId] = useState<string | null>(null);
  const [modifyJson, setModifyJson] = useState('');

  const [moreInfoModalId, setMoreInfoModalId] = useState<string | null>(null);
  const [moreInfoQuery, setMoreInfoQuery] = useState('');

  // Batch Selection
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);

  // SSE Stream Status
  const [sseStatus, setSseStatus] = useState<'connected' | 'connecting' | 'idle'>('connecting');
  
  // Audit Verification State
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isVerifyingAudit, setIsVerifyingAudit] = useState(false);

  // Policies State
  const [policies, setPolicies] = useState<ApprovalPolicy[]>([]);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

  // Collapsible panels state in inspector
  const [panelOpen, setPanelOpen] = useState({
    description: true,
    payload: true,
    evidence: true,
  });

  useEffect(() => {
    // SSE Stream setup
    const eventSource = new EventSource('/api/approval/events');
    eventSource.onopen = () => setSseStatus('connected');
    eventSource.onerror = () => setSseStatus('idle');
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.event === 'connected') setSseStatus('connected');
      } catch (err) {
        // ignore parsing errors
      }
    };

    // Load policies
    fetch('/api/approval/policies')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPolicies(data);
      })
      .catch(() => {});

    return () => {
      eventSource.close();
    };
  }, []);

  const handleVerifyAudit = async () => {
    setIsVerifyingAudit(true);
    try {
      const res = await fetch('/api/approval/audit-verify');
      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      setAuditResult({ chainValid: false, status: 'Failed to query audit verification endpoint.' });
    } finally {
      setIsVerifyingAudit(false);
    }
  };

  const filtered = approvals.filter((a) => {
    if (activeFilter === 'all') return true;
    return a.status === activeFilter;
  });

  // Priority queue sort: pending items top, ordered by expiry countdown asc
  const prioritySorted = [...filtered].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    const timeA = new Date(a.expiresAt).getTime();
    const timeB = new Date(b.expiresAt).getTime();
    return timeA - timeB;
  });

  const selected = approvals.find((a) => a.id === selectedId) || prioritySorted[0];

  const handleToggleSelectBatch = (id: string) => {
    setBatchSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchAuthorize = () => {
    if (batchSelectedIds.length === 0) return;
    if (onBatchDecision) {
      onBatchDecision(batchSelectedIds, 'approved', 'Batch human authorization');
    } else {
      batchSelectedIds.forEach((id) => onDecision(id, 'approved'));
    }
    setBatchSelectedIds([]);
  };

  const handleBatchReject = () => {
    if (batchSelectedIds.length === 0) return;
    if (onBatchDecision) {
      onBatchDecision(batchSelectedIds, 'denied', 'Batch human rejection');
    } else {
      batchSelectedIds.forEach((id) => onDecision(id, 'denied', 'Batch rejection'));
    }
    setBatchSelectedIds([]);
  };

  const submitDenial = () => {
    if (!denyModalId || !denyReason.trim()) return;
    onDecision(denyModalId, 'denied', denyReason);
    setDenyModalId(null);
    setDenyReason('');
  };

  const submitModification = () => {
    if (!modifyModalId || !modifyJson.trim()) return;
    try {
      const parsed = JSON.parse(modifyJson);
      onDecision(modifyModalId, 'approved_with_modifications', 'Payload modified prior to execution', parsed);
      setModifyModalId(null);
      setModifyJson('');
    } catch (err) {
      alert('Invalid JSON syntax in payload modification.');
    }
  };

  const submitMoreInfo = () => {
    if (!moreInfoModalId || !moreInfoQuery.trim()) return;
    onDecision(moreInfoModalId, 'more_info_requested', `Feedback: ${moreInfoQuery}`);
    setMoreInfoModalId(null);
    setMoreInfoQuery('');
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'EXPIRED';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              MODULE 0
            </span>
            <span className="text-xs text-slate-400 font-mono">• Human Approval Center (HITL)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 flex items-center space-x-2">
            <span>Governance, Safety & Audit Chain</span>
          </h1>
        </div>

        {/* Navigation Tabs & Real-time Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
            <Radio
              className={`w-3.5 h-3.5 ${
                sseStatus === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
              }`}
            />
            <span className={sseStatus === 'connected' ? 'text-emerald-300' : 'text-slate-400'}>
              {sseStatus === 'connected' ? 'SSE Live Event Stream' : 'Connecting SSE...'}
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 p-1 border border-slate-800 rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'requests'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Approval Queue
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'policies'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Policies
            </button>
            <button
              onClick={() => {
                setActiveTab('audit');
                handleVerifyAudit();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'audit'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Chain
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: APPROVAL QUEUE */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Sub-header Controls & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400">Filter Status:</span>
              {(['all', 'pending', 'approved', 'denied', 'expired'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                    activeFilter === tab
                      ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Batch Controls */}
            <div className="flex items-center space-x-3 text-xs font-mono">
              <button
                onClick={() => setBatchMode(!batchMode)}
                className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
                  batchMode
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{batchMode ? 'Exit Batch Mode' : 'Batch Select Mode'}</span>
              </button>

              {batchMode && batchSelectedIds.length > 0 && (
                <div className="flex items-center space-x-2 animate-fadeIn">
                  <span className="text-amber-400 font-bold">{batchSelectedIds.length} Selected:</span>
                  <button
                    onClick={handleBatchAuthorize}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg transition-all"
                  >
                    Authorize Batch
                  </button>
                  <button
                    onClick={handleBatchReject}
                    className="px-3 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg transition-all"
                  >
                    Reject Batch
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Split Layout: Request List vs Detail Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Queue List */}
            <div className="lg:col-span-5 space-y-3">
              {prioritySorted.map((item) => {
                const isSelected = selected?.id === item.id;
                const isBatchSelected = batchSelectedIds.includes(item.id);
                const timeStr = getTimeRemaining(item.expiresAt);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (batchMode) handleToggleSelectBatch(item.id);
                      else setSelectedId(item.id);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 relative ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-950/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {batchMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelectBatch(item.id);
                            }}
                            className="text-amber-400"
                          >
                            {isBatchSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                        )}
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                          {item.moduleName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                            item.status === 'approved' || item.status === 'approved_with_modifications'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : item.status === 'denied'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : item.status === 'expired'
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          }`}
                        >
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-100 leading-snug">{item.summary}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                      <span className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span>Risk: <strong className="text-slate-200">{item.riskLevel.toUpperCase()}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1 text-slate-400">
                        <Clock className="w-3 h-3 text-amber-500/80" />
                        <span className={timeStr.includes('EXPIRED') ? 'text-rose-400 font-bold' : ''}>
                          {timeStr}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Detail Inspector (3 Collapsible Panels) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {selected ? (
                <div className="space-y-6">
                  {/* Inspector Header */}
                  <div className="space-y-2 border-b border-slate-800 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>APPROVAL REQUEST ID: {selected.id}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(selected.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-100">{selected.summary}</h2>
                    <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                      <span>Origin: <strong className="text-indigo-300">{selected.moduleName}</strong></span>
                      <span>Action: <strong className="text-indigo-300">{selected.actionType}</strong></span>
                      <span>Risk: <strong className="text-amber-400">{selected.riskLevel.toUpperCase()}</strong></span>
                    </div>
                  </div>

                  {/* PANEL 1: Plain Language Description & Expiry Panel */}
                  <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setPanelOpen((p) => ({ ...p, description: !p.description }))}
                      className="w-full px-4 py-3 bg-slate-900/80 flex items-center justify-between text-xs font-mono font-bold text-slate-200 hover:bg-slate-900"
                    >
                      <span className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>1. Plain Language Operational Overview & Governance</span>
                      </span>
                      {panelOpen.description ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {panelOpen.description && (
                      <div className="p-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                        <p>{selected.summary}</p>
                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/50 rounded-lg text-slate-400 font-mono text-[11px]">
                          <div>
                            <span className="block text-slate-500">Tenant ID:</span>
                            <span className="text-slate-200">{selected.tenantId}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">User Context:</span>
                            <span className="text-slate-200">{selected.userId}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">Auto-Expiration Policy:</span>
                            <span className="text-amber-300">{getTimeRemaining(selected.expiresAt)}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">Callback Registered:</span>
                            <span className="text-indigo-300">{selected.callbackUrl || 'Internal Event Dispatcher'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PANEL 2: Structured JSON Payload Viewer */}
                  <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setPanelOpen((p) => ({ ...p, payload: !p.payload }))}
                      className="w-full px-4 py-3 bg-slate-900/80 flex items-center justify-between text-xs font-mono font-bold text-slate-200 hover:bg-slate-900"
                    >
                      <span className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-indigo-400" />
                        <span>2. Structured JSON Payload & Pydantic v2 Schema</span>
                      </span>
                      {panelOpen.payload ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {panelOpen.payload && (
                      <div className="p-4 space-y-2">
                        <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-60">
                          {JSON.stringify(selected.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* PANEL 3: Supporting Evidence Panel */}
                  <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setPanelOpen((p) => ({ ...p, evidence: !p.evidence }))}
                      className="w-full px-4 py-3 bg-slate-900/80 flex items-center justify-between text-xs font-mono font-bold text-slate-200 hover:bg-slate-900"
                    >
                      <span className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-indigo-400" />
                        <span>3. Supporting Evidence & Verification Proofs</span>
                      </span>
                      {panelOpen.evidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {panelOpen.evidence && (
                      <div className="p-4 space-y-3">
                        {selected.evidence ? (
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-300">{selected.evidence.title}</span>
                              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[10px]">
                                {selected.evidence.type}
                              </span>
                            </div>
                            <p className="text-slate-300 text-xs font-mono leading-relaxed">{selected.evidence.content}</p>
                            {selected.evidence.url && (
                              <a
                                href={selected.evidence.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-indigo-400 hover:underline text-[11px] font-mono pt-1"
                              >
                                <span>Verify External Proof</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 font-mono italic">
                            No external evidence bundle attached to this payload.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cryptographic Hash Block */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
                    <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                      <Lock className="w-4 h-4" />
                      <span>SHA-256 Audit Chain Entry</span>
                    </div>
                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <p>Prev Hash: <span className="text-slate-300 font-mono">{selected.previousHash}</span></p>
                      <p>Block Hash: <span className="text-indigo-300 font-bold font-mono">{selected.hash}</span></p>
                    </div>
                  </div>

                  {/* Decision Controls */}
                  {selected.status === 'pending' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <button
                        onClick={() => onDecision(selected.id, 'approved')}
                        className="py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorize</span>
                      </button>

                      <button
                        onClick={() => {
                          setModifyModalId(selected.id);
                          setModifyJson(JSON.stringify(selected.payload, null, 2));
                        }}
                        className="py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Modify</span>
                      </button>

                      <button
                        onClick={() => setDenyModalId(selected.id)}
                        className="py-3 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Deny</span>
                      </button>

                      <button
                        onClick={() => setMoreInfoModalId(selected.id)}
                        className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Ask Info</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">STATUS:</span>
                        <span className="capitalize text-amber-300">{selected.status.replace(/_/g, ' ')}</span>
                      </div>
                      {selected.justification && (
                        <div>
                          <span className="text-slate-500">Justification:</span> {selected.justification}
                        </div>
                      )}
                      {selected.executedBy && (
                        <div>
                          <span className="text-slate-500">Officer:</span> {selected.executedBy} at {selected.executedAt}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 text-xs font-mono">
                  Select an approval request to inspect payload and governance controls.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL POLICIES */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Approval Policies Configuration</h3>
              <p className="text-xs text-slate-400 font-mono">Define per-action TTLs, auto-expiration rules, and risk classifications.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((policy) => (
              <div key={policy.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400 uppercase">{policy.actionType}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                    Risk: {policy.riskLevel}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <p>Origin Module: <strong className="text-slate-200">{policy.moduleName}</strong></p>
                  <p>TTL Limit: <strong className="text-slate-200">{policy.ttlSeconds}s</strong> ({Math.round(policy.ttlSeconds / 3600)} hours)</p>
                  <p>Auto-Expire Action: <strong className="text-amber-300 uppercase">{policy.autoExpireAction}</strong></p>
                  <p>Require Justification: <strong className="text-slate-200">{policy.requireJustification ? 'YES' : 'NO'}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT CHAIN INSPECTOR */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">SHA-256 Cryptographic Audit Chain Inspector</h3>
              <p className="text-xs text-slate-400 font-mono">Append-only immutable record of all human approvals, modifications, and rejections.</p>
            </div>
            <button
              onClick={handleVerifyAudit}
              disabled={isVerifyingAudit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-xl flex items-center space-x-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingAudit ? 'animate-spin' : ''}`} />
              <span>Verify Chain Integrity</span>
            </button>
          </div>

          {auditResult && (
            <div className={`p-4 rounded-xl border font-mono text-xs ${
              auditResult.chainValid ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>{auditResult.status}</span>
              </div>
              <p className="mt-2 text-slate-300 text-[11px]">Total Blocks: {auditResult.totalBlocks} | Genesis Hash: {auditResult.genesisHash}</p>
            </div>
          )}

          <div className="space-y-3 font-mono text-xs">
            {approvals.map((appr, idx) => (
              <div key={appr.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Block #{approvals.length - idx} • {appr.id}</span>
                  <span className="text-indigo-400">{appr.createdAt}</span>
                </div>
                <p className="text-slate-200 font-bold">{appr.summary}</p>
                <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <p>Prev Hash: {appr.previousHash}</p>
                  <p className="text-indigo-300 font-bold">Hash: {appr.hash}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DENIAL JUSTIFICATION MODAL */}
      {denyModalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-rose-400 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Mandatory Denial Justification</span>
            </h3>
            <p className="text-xs text-slate-300">
              Governance policy requires a justification reason when rejecting an automated agent request.
            </p>
            <textarea
              rows={3}
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Enter rejection reason or safety violation notes..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDenyModalId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={submitDenial}
                disabled={!denyReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs font-mono disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODIFY PAYLOAD MODAL */}
      {modifyModalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-amber-300 flex items-center space-x-2">
              <Edit3 className="w-5 h-5" />
              <span>Approve with Payload Modifications</span>
            </h3>
            <p className="text-xs text-slate-300">
              Edit the JSON payload parameters directly before granting execution authorization.
            </p>
            <textarea
              rows={10}
              value={modifyJson}
              onChange={(e) => setModifyJson(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModifyModalId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={submitModification}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono"
              >
                Authorize Modified Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASK MORE INFO MODAL */}
      {moreInfoModalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-indigo-300 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Request More Information</span>
            </h3>
            <p className="text-xs text-slate-300">
              Send a clarification query back to the originating AI agent module.
            </p>
            <textarea
              rows={3}
              value={moreInfoQuery}
              onChange={(e) => setMoreInfoQuery(e.target.value)}
              placeholder="What additional details or proofs are needed?"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMoreInfoModalId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={submitMoreInfo}
                disabled={!moreInfoQuery.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs font-mono disabled:opacity-50"
              >
                Send Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
