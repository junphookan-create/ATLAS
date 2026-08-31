import React, { useState } from 'react';
import { Sparkles, Terminal, Loader2, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GCWProject } from '../../types/apiTypes';

interface CommandBarSectionProps {
  onSubmitGoal: (goal: string) => Promise<GCWProject | null>;
  isCreating: boolean;
}

export const CommandBarSection: React.FC<CommandBarSectionProps> = ({
  onSubmitGoal,
  isCreating,
}) => {
  const [goalInput, setGoalInput] = useState('');
  const [lastCreated, setLastCreated] = useState<GCWProject | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim() || isCreating) return;
    const res = await onSubmitGoal(goalInput.trim());
    if (res) {
      setLastCreated(res);
      setGoalInput('');
    }
  };

  const quickGoals = [
    'Complete NSF CAREER Grant Proposal on Neuromorphic Spatial Intelligence',
    'Draft ICML 2026 Camera-Ready Paper on Event-Based Visual Odometry',
    'Launch CampusBookRent Seed Round Pitch Deck & 50-Campus Outreach Campaign',
    'Scan and apply for DARPA Young Faculty Award in High-Density Computing',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Universal Command Bar</h2>
            <p className="text-xs text-slate-400">
              Submit any high-level objective to dispatch across Atlas AI’s autonomous cognitive pipelines
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-1 font-mono text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          <Terminal className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span>POST /gcw/projects</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-2">
        <input
          type="text"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="Type a high-stakes goal (e.g., 'Draft grant background, synthesize 20 papers, and find Stanford collaborators')..."
          disabled={isCreating}
          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3.5 pl-4 pr-32 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all disabled:opacity-50"
        />
        <div className="absolute right-2 top-2">
          <button
            type="submit"
            disabled={!goalInput.trim() || isCreating}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-medium rounded-lg shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Planning...</span>
              </>
            ) : (
              <>
                <span>Execute</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Quick Prompts */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Quick Starters:
        </span>
        {quickGoals.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setGoalInput(q)}
            disabled={isCreating}
            className="text-xs bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 px-2.5 py-1 rounded-md transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Last Executed Project Result Feedback */}
      {lastCreated && (
        <div className="mt-4 p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-lg flex items-start justify-between">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-200">
                  Project Created & Dispatched
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  {lastCreated.id}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {lastCreated.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{lastCreated.goal}</p>
            </div>
          </div>
          <button
            onClick={() => setLastCreated(null)}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
