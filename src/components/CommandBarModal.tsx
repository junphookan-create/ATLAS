import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Layers,
  Terminal,
} from 'lucide-react';
import { ModuleId } from '../types';

interface CommandBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateModule: (module: ModuleId) => void;
  onRequestApproval: (summary: string, module: ModuleId) => void;
}

export const CommandBarModal: React.FC<CommandBarModalProps> = ({
  isOpen,
  onClose,
  onNavigateModule,
  onRequestApproval,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process command');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err?.message || 'Failed to execute command');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Draft NSF grant proposal section and queue Stanford professor outreach',
    'Scan opportunities for $50k+ research grants with deadlines in next 30 days',
    'Generate Lean Canvas and prototype for AI literature digest SaaS idea',
    'Schedule Zoom meeting with Prof. Katherine Chen and resolve calendar conflicts',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Natural Language Command Bar</h3>
              <p className="text-[11px] text-slate-400">Direct AI Orchestrator & General Cognitive Worker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="p-5 border-b border-slate-800 bg-slate-900">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tell Atlas AI what goal or multi-module task to execute..."
              className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-2 top-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-slate-500 font-mono self-center mr-1">Examples:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md text-[11px] text-slate-400 hover:text-indigo-300 transition-colors truncate max-w-xs text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </form>

        {/* Modal Body / Results */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar bg-slate-950/40">
          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">Execution Error</p>
                <p className="mt-1 text-slate-300">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-semibold mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>DECOMPOSED EXECUTION PLAN</span>
                </div>
                <p className="text-sm font-medium text-slate-200">{result.intentSummary}</p>
              </div>

              {/* Action Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Module Action Plan ({result.actionSteps?.length || 0} Steps)
                </h4>
                <div className="space-y-2">
                  {result.actionSteps?.map((step: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex items-start justify-between space-x-3 text-xs"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-5 h-5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono font-bold shrink-0 mt-0.5 border border-indigo-800">
                          {step.step || i + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-200">{step.module}</span>
                            {step.requiresApproval && (
                              <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[9px] font-mono">
                                Requires HITL Approval
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 mt-0.5">{step.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const target = (step.module || '').toLowerCase().replace(/\s+/g, '_') as ModuleId;
                          onNavigateModule(target || 'executive_dashboard');
                          onClose();
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center space-x-1 shrink-0 transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow up & Trigger Approval */}
              {result.humanApprovalPrompt && (
                <div className="p-3.5 bg-amber-950/20 border border-amber-800/50 rounded-xl flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{result.humanApprovalPrompt}</span>
                  </div>
                  <button
                    onClick={() => {
                      onRequestApproval(result.humanApprovalPrompt, 'general_cognitive_worker');
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition-colors shrink-0"
                  >
                    Send to Approval Center
                  </button>
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="py-8 text-center text-slate-500 text-xs">
              <Layers className="w-8 h-8 mx-auto text-slate-700 mb-2" />
              <p>Type a multi-module request or select a quick example above.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Atlas AI will decompose your prompt into orchestrator actions across 20 modules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
