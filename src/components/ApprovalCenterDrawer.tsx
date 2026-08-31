import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Code,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  Send,
} from 'lucide-react';
import { ApprovalRequest, RiskLevel } from '../types';

interface ApprovalCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  approvals: ApprovalRequest[];
  onDecision: (id: string, decision: 'approved' | 'denied', reason?: string) => void;
}

export const ApprovalCenterDrawer: React.FC<ApprovalCenterDrawerProps> = ({
  isOpen,
  onClose,
  approvals,
  onDecision,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState<{ [id: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  if (!isOpen) return null;

  const pending = approvals.filter((a) => a.status === 'pending');
  const history = approvals.filter((a) => a.status !== 'pending');

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'critical':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'high':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'medium':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Human Approval Center</h2>
              <p className="text-xs text-slate-400">Module 0 • Cryptographically Signed HITL Governance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-2 border-b border-slate-800 bg-slate-900 flex space-x-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Authorization ({pending.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Audit Trail ({history.length})</span>
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-950/30">
          {activeTab === 'pending' && pending.length === 0 && (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/80" />
              <p className="text-sm font-semibold text-slate-300">All Clear!</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No high-risk external actions currently pending human review.
              </p>
            </div>
          )}

          {(activeTab === 'pending' ? pending : history).map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 transition-all hover:border-slate-700"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between space-x-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.moduleName}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border ${getRiskBadge(
                          item.riskLevel
                        )}`}
                      >
                        {item.riskLevel} Risk
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100">{item.summary}</h4>
                  </div>

                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded capitalize ${
                      item.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.status === 'denied'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Details toggle */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <Key className="w-3 h-3 text-slate-500" />
                    <span>ID: {item.id}</span>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 text-[11px]"
                  >
                    <span>{isExpanded ? 'Hide Payload & Audit' : 'Inspect Payload'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Expanded Payload & Cryptographic Audit */}
                {isExpanded && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-3 animate-in fade-in text-xs font-mono">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                        <span className="flex items-center space-x-1">
                          <Code className="w-3 h-3" />
                          <span>Action Payload Schema (v2.1)</span>
                        </span>
                        <span>Action: {item.actionType}</span>
                      </div>
                      <pre className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-md overflow-x-auto text-slate-300 text-[11px] leading-relaxed">
                        {JSON.stringify(item.payload, null, 2)}
                      </pre>
                    </div>

                    {/* Cryptographic Chain */}
                    <div className="p-2 bg-slate-900/60 border border-slate-800/60 rounded text-[10px] space-y-1 text-slate-400">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Previous Hash:</span>
                        <span className="truncate max-w-[200px] text-slate-400">{item.previousHash}</span>
                      </div>
                      <div className="flex justify-between font-bold text-indigo-300">
                        <span>Current SHA-256 Hash:</span>
                        <span className="truncate max-w-[200px]">{item.hash}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action controls for pending items */}
                {item.status === 'pending' && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onDecision(item.id, 'approved')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorize & Execute</span>
                      </button>

                      <button
                        onClick={() => onDecision(item.id, 'denied', denialReason[item.id] || 'User rejected payload.')}
                        className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Deny</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
