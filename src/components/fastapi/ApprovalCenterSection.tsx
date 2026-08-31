import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Clock,
  AlertTriangle,
  FileCode,
  Loader2,
  RefreshCw,
  Eye,
  FileCheck,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { FastApiApproval } from '../../types/apiTypes';
import { ApplicationDossierModal } from './ApplicationDossierModal';

interface ApprovalCenterSectionProps {
  approvals: FastApiApproval[];
  isLoading: boolean;
  onDecide: (id: string, approved: boolean, modifications?: any) => Promise<void>;
  onRefresh: () => void;
}

export const ApprovalCenterSection: React.FC<ApprovalCenterSectionProps> = ({
  approvals,
  isLoading,
  onDecide,
  onRefresh,
}) => {
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [inspectingApprovalId, setInspectingApprovalId] = useState<string | null>(null);

  const handleAction = async (id: string, approved: boolean, modifications?: any) => {
    setDecidingId(id);
    try {
      await onDecide(id, approved, modifications);
    } finally {
      setDecidingId(null);
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  const getRiskColor = (risk: string = 'medium') => {
    switch (risk.toLowerCase()) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'medium':
        return 'bg-yellow-950/60 text-yellow-300 border-yellow-800/80';
      default:
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Application Dossier Full Preview Modal (Mod 0) */}
      {inspectingApprovalId && (
        <ApplicationDossierModal
          isOpen={!!inspectingApprovalId}
          approvalId={inspectingApprovalId}
          onClose={() => setInspectingApprovalId(null)}
          onAuthorize={(id, modifications) => handleAction(id, true, modifications)}
          onReject={(id) => handleAction(id, false)}
        />
      )}

      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-950/80 border border-amber-800/50 rounded-lg text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-slate-100">Human-In-The-Loop Approval Center</h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                {pendingApprovals.length} PENDING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pre-flight application inspection with Google Docs auto-fill & cryptographic verification (PATCH /approvals/:id)
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading && pendingApprovals.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500 mb-2" />
          <p className="text-xs">Fetching pending authorizations from backend...</p>
        </div>
      ) : pendingApprovals.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/50 border border-slate-800/60 rounded-lg">
          <ShieldCheck className="w-10 h-10 text-emerald-500/80 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No data yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            All agent actions are currently authorized or no high-risk operations are pending review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingApprovals.map((req) => (
            <div
              key={req.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-lg p-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {req.module}
                    </span>
                    <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                      {req.action_type}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getRiskColor(
                        req.risk_level
                      )}`}
                    >
                      {req.risk_level || 'MEDIUM'} RISK
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-600" />
                      {new Date(req.created_time).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-100">{req.payload_summary}</p>
                </div>

                {/* Approve / Deny / Inspect Full Application Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setInspectingApprovalId(req.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-200 text-xs font-medium rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Inspect Full Form (Mod 0)</span>
                  </button>

                  <button
                    onClick={() => handleAction(req.id, false)}
                    disabled={decidingId === req.id}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {decidingId === req.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>Deny</span>
                  </button>

                  <button
                    onClick={() => handleAction(req.id, true)}
                    disabled={decidingId === req.id}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {decidingId === req.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Authorize</span>
                  </button>
                </div>
              </div>

              {/* Payload Expand Toggle & Pre-Flight Notes */}
              <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-mono cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{expandedId === req.id ? 'Hide Raw Payload' : 'View Payload Schema'}</span>
                  </button>
                  <span className="text-[11px] text-emerald-400 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Google Docs Auto-Fill Synced
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-600">ID: {req.id}</span>
              </div>

              {expandedId === req.id && req.payload && (
                <pre className="mt-2 p-3 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {JSON.stringify(req.payload, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

