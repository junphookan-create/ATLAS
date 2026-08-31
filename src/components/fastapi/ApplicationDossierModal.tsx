import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Edit3,
  Save,
  Send,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Layers,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ApplicationDossier, ApplicationDossierSection } from '../../types/apiTypes';
import { api } from '../../lib/api';

interface ApplicationDossierModalProps {
  isOpen: boolean;
  approvalId: string;
  onClose: () => void;
  onAuthorize: (id: string, modifications?: any) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const ApplicationDossierModal: React.FC<ApplicationDossierModalProps> = ({
  isOpen,
  approvalId,
  onClose,
  onAuthorize,
  onReject,
}) => {
  const [dossier, setDossier] = useState<ApplicationDossier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'nature_fit' | 'budget' | 'compliance'>('preview');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [selectedGoogleDoc, setSelectedGoogleDoc] = useState<string>('all');

  useEffect(() => {
    if (isOpen && approvalId) {
      loadDossier();
    }
  }, [isOpen, approvalId]);

  const loadDossier = async () => {
    setIsLoading(true);
    try {
      const data = await api.getApplicationDossier(approvalId);
      setDossier(data);
    } catch (e) {
      console.error('Failed to load application dossier:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (section: ApplicationDossierSection) => {
    setEditingSectionId(section.id);
    setEditedContent(section.content);
  };

  const handleSaveEdit = () => {
    if (!dossier || !editingSectionId) return;
    const updatedSections = dossier.sections.map((s) =>
      s.id === editingSectionId
        ? { ...s, content: editedContent, char_count: editedContent.length }
        : s
    );
    const updatedDossier = { ...dossier, sections: updatedSections };
    setDossier(updatedDossier);
    setEditingSectionId(null);
    api.updateApplicationDossier(updatedDossier).catch(console.error);
  };

  const handleAutoFillWithDocs = async () => {
    if (!dossier) return;
    setIsAutoFilling(true);
    try {
      const updated = await api.autoFillApplicationDossier(
        dossier.opportunity_id,
        selectedGoogleDoc === 'all' ? undefined : [selectedGoogleDoc]
      );
      setDossier(updated);
    } catch (e) {
      console.error('Auto fill failed:', e);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleAuthorizeAndSubmit = async () => {
    if (!dossier) return;
    setIsSubmitting(true);
    try {
      await onAuthorize(approvalId, { dossier_snapshot: dossier });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">
                  Pre-Flight Application Dossier & Form Auto-Filler
                </h2>
                <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                  MOD 0 INSPECTION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect every field filled from pre-accessible Google Docs before authorizing submission
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Navigation & Google Docs Auto-Filler Controls */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Application Form ({dossier?.sections.length || 0} Sections)
            </button>
            <button
              onClick={() => setActiveTab('nature_fit')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'nature_fit'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nature Fit & Google Docs Rationale
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'budget'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Institutional Budget
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'compliance'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Compliance Verification
            </button>
          </div>

          {/* Google Docs Source Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 flex items-center">
              <BookOpen className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Source:
            </span>
            <select
              value={selectedGoogleDoc}
              onChange={(e) => setSelectedGoogleDoc(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Accessible Google Docs (Bio + NSF + CV)</option>
              <option value="gdoc-bio-academic-2026">Google Doc: Master Academic CV & Publications</option>
              <option value="gdoc-prior-impact">Google Doc: NSF / DARPA Prior Impact Dossier</option>
              <option value="gdoc-startups">Google Doc: Creative & Commercial Projects</option>
            </select>

            <button
              onClick={handleAutoFillWithDocs}
              disabled={isAutoFilling}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isAutoFilling ? 'animate-spin' : ''}`} />
              <span>{isAutoFilling ? 'Re-adapting...' : 'Re-Adapt with Gemini'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
              <p className="text-xs">Assembling full pre-flight application dossier...</p>
            </div>
          ) : !dossier ? (
            <div className="py-12 text-center text-slate-500 text-xs">No dossier data available.</div>
          ) : (
            <>
              {/* Target Banner */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                      {dossier.target_agency}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Deadline: {dossier.submission_deadline}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1">{dossier.opportunity_title}</h3>
                </div>

                <div className="flex items-center space-x-3 text-xs bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Applicant:</span>
                    <span className="font-semibold text-slate-200">{dossier.applicant_profile.full_name}</span>
                  </div>
                  <div className="border-l border-slate-800 pl-3">
                    <span className="text-slate-500 block text-[10px]">Evaluation Tone:</span>
                    <span className="font-semibold text-emerald-400">{dossier.nature_analysis.competition_tone}</span>
                  </div>
                </div>
              </div>

              {/* TAB 1: FORM PREVIEW & SECTION EDITING */}
              {activeTab === 'preview' && (
                <div className="space-y-4">
                  {dossier.sections.map((section) => (
                    <div
                      key={section.id}
                      className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-xl space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-200">{section.title}</h4>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                              {section.confidence_score}% Confidence
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center">
                            <BookOpen className="w-3 h-3 mr-1 text-slate-500" />
                            Source: <span className="text-slate-300 ml-1">{section.source_doc_origin}</span>
                          </p>
                        </div>

                        {editingSectionId === section.id ? (
                          <button
                            onClick={handleSaveEdit}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(section)}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-xs font-medium cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Field</span>
                          </button>
                        )}
                      </div>

                      {/* Content Box */}
                      {editingSectionId === section.id ? (
                        <textarea
                          rows={6}
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full bg-slate-900 border border-indigo-500/80 rounded-lg p-3 text-xs text-slate-100 font-mono leading-relaxed outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans">
                          {section.content}
                        </div>
                      )}

                      {/* Nature Adaptation Note & Character count */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900 pt-2 font-mono">
                        <span className="text-indigo-400">
                          Nature Fit: {section.nature_adaptation_note}
                        </span>
                        <span>
                          {section.char_count} / {section.max_char_limit || 4000} chars
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: NATURE FIT & GOOGLE DOCS RATIONALE */}
              {activeTab === 'nature_fit' && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>Opportunity Nature & Evaluator Persona Analysis</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dossier.nature_analysis.doc_selection_rationale}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Key Evaluation Criteria:</span>
                      <div className="flex flex-col space-y-1">
                        {dossier.nature_analysis.key_evaluation_criteria.map((crit, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{crit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connected Google Docs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-200">
                      Pre-Accessible Google Docs Ingested & Extracted
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dossier.nature_analysis.selected_google_docs.map((doc, i) => (
                        <div key={i} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-100">{doc.doc_name}</span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                              {(doc.relevance_weight * 100).toFixed(0)}% Relevance
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-normal">
                            <strong className="text-slate-300">Extracted Highlights:</strong> {doc.extracted_focus}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BUDGET */}
              {activeTab === 'budget' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono">
                        <tr>
                          <th className="px-4 py-2.5">Category</th>
                          <th className="px-4 py-2.5">Expense Item</th>
                          <th className="px-4 py-2.5">Amount (USD)</th>
                          <th className="px-4 py-2.5">Institutional Justification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {dossier.budget_table.map((b, i) => (
                          <tr key={i} className="hover:bg-slate-900/30">
                            <td className="px-4 py-2.5 font-mono uppercase text-[10px] text-indigo-400">{b.category}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-100">{b.item}</td>
                            <td className="px-4 py-2.5 font-mono text-emerald-400 font-bold">${b.amount_usd.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-slate-400">{b.justification}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-medium">Total Institutional Budget Requested:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ${dossier.budget_table.reduce((acc, curr) => acc + curr.amount_usd, 0).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: COMPLIANCE */}
              {activeTab === 'compliance' && (
                <div className="space-y-3">
                  {dossier.compliance_checklist.map((c, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        {c.satisfied ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-200">{c.rule}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{c.verification_note}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          c.satisfied
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {c.satisfied ? 'SATISFIED' : 'REQUIRES ATTENTION'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onReject(approvalId)}
            className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Reject / Request Revision
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close Preview
            </button>
            <button
              onClick={handleAuthorizeAndSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Authorize & Transmit Submission</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
