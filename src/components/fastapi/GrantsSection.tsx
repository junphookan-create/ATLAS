import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Microscope,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { FastApiGrant } from '../../types/apiTypes';

interface GrantsSectionProps {
  grants: FastApiGrant[];
  isLoading: boolean;
  onResearchBackground: (id: string) => Promise<void>;
  onGenerateDraft: (id: string, sectionTitle?: string) => Promise<void>;
  onGenerateBudget: (id: string) => Promise<void>;
}

export const GrantsSection: React.FC<GrantsSectionProps> = ({
  grants,
  isLoading,
  onResearchBackground,
  onGenerateDraft,
  onGenerateBudget,
}) => {
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('Project Summary');

  const handleAction = async (id: string, type: 'research' | 'draft' | 'budget') => {
    setActiveActionId(`${id}_${type}`);
    try {
      if (type === 'research') await onResearchBackground(id);
      if (type === 'draft') await onGenerateDraft(id, activeSection);
      if (type === 'budget') await onGenerateBudget(id);
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-slate-100">Grant & Fellowship Writer</h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                {grants.length} PROPOSALS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              NSF/DARPA narrative generator, literature synthesis & institutional budget tables (GET /grants)
            </p>
          </div>
        </div>
      </div>

      {isLoading && grants.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
          <p className="text-xs">Loading grant proposals from backend...</p>
        </div>
      ) : grants.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/50 border border-slate-800/60 rounded-lg">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No data yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No grant proposals currently in pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grants.map((grant) => (
            <div
              key={grant.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4"
            >
              {/* Proposal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-slate-100">{grant.title}</h3>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {grant.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-1">
                    {grant.agency && <span>Agency: <strong className="text-slate-300">{grant.agency}</strong></span>}
                    {grant.deadline && <span>• Deadline: {grant.deadline}</span>}
                    <span>• ID: {grant.id}</span>
                  </div>
                </div>

                {/* 3 Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleAction(grant.id, 'research')}
                    disabled={activeActionId === `${grant.id}_research`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {activeActionId === `${grant.id}_research` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    ) : (
                      <Microscope className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>Research background</span>
                  </button>

                  <button
                    onClick={() => handleAction(grant.id, 'draft')}
                    disabled={activeActionId === `${grant.id}_draft`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {activeActionId === `${grant.id}_draft` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Generate draft</span>
                  </button>

                  <button
                    onClick={() => handleAction(grant.id, 'budget')}
                    disabled={activeActionId === `${grant.id}_budget`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {activeActionId === `${grant.id}_budget` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Generate budget</span>
                  </button>
                </div>
              </div>

              {/* Background Research synthesis */}
              {grant.background_research && (
                <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-300 mb-1.5">
                    <Microscope className="w-3.5 h-3.5 text-indigo-400" />
                    <span>State-of-the-Art Literature Review</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{grant.background_research}</p>
                </div>
              )}

              {/* Draft Narrative Sections */}
              {grant.draft_sections && Object.keys(grant.draft_sections).length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Drafted Proposal Sections:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(grant.draft_sections).map(([secTitle, content]) => (
                      <div
                        key={secTitle}
                        className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 font-mono">{secTitle}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <p className="text-slate-400 line-clamp-4 leading-relaxed">{content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Table */}
              {grant.budget && (
                <div className="p-3.5 bg-slate-900/40 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 mb-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Institutional Cost Allocation Table ({grant.budget.currency})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Direct Costs</div>
                      <div className="text-sm font-mono font-bold text-slate-200">
                        ${grant.budget.directCosts.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Indirect (F&A)</div>
                      <div className="text-sm font-mono font-bold text-slate-200">
                        ${grant.budget.indirectCosts.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 bg-emerald-950/40 rounded border border-emerald-800/60">
                      <div className="text-[10px] text-emerald-400 uppercase font-semibold">Total Requested</div>
                      <div className="text-sm font-mono font-bold text-emerald-300">
                        ${grant.budget.requested.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
