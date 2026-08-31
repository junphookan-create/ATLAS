import React from 'react';
import {
  ShieldAlert,
  Search,
  Cpu,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { ModuleId, ApprovalRequest } from '../types';

interface HeaderProps {
  activeModule: ModuleId;
  pendingApprovals: ApprovalRequest[];
  onOpenApprovalDrawer: () => void;
  onOpenCommandBar: () => void;
  isGcwActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  pendingApprovals,
  onOpenApprovalDrawer,
  onOpenCommandBar,
  isGcwActive,
}) => {
  const pendingCount = pendingApprovals.filter((a) => a.status === 'pending').length;

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between text-slate-100 shrink-0 sticky top-0 z-30">
      {/* Brand & Module Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-md shadow-indigo-900/40">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              ATLAS AI
            </span>
            <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              Enterprise v5.2
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono hidden sm:block">
            Universal Cognitive Agent & Orchestration System
          </p>
        </div>
      </div>

      {/* Middle: Natural Language Command Bar Quick Trigger */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <button
          onClick={onOpenCommandBar}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-slate-400 hover:text-slate-200 transition-all text-xs group shadow-inner"
        >
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="font-mono text-slate-300">
              Type command or goal (e.g., "Draft NSF proposal & setup Stanford outreach")...
            </span>
          </div>
          <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            <Terminal className="w-3 h-3 mr-1" />
            <span>Ctrl + K</span>
          </div>
        </button>
      </div>

      {/* Right Actions: GCW Status, Human Approval Center Button */}
      <div className="flex items-center space-x-3">
        {/* GCW Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md">
          <div className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                isGcwActive ? 'bg-emerald-400 opacity-75' : 'bg-indigo-400 opacity-40'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isGcwActive ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
            ></span>
          </div>
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-mono text-slate-300">
            {isGcwActive ? 'GCW Active' : 'GCW Idle'}
          </span>
        </div>

        {/* Command Trigger Mobile */}
        <button
          onClick={onOpenCommandBar}
          className="p-2 md:hidden text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700"
          title="Open Command Bar"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Module 0: Human Approval Center Trigger */}
        <button
          onClick={onOpenApprovalDrawer}
          className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all border ${
            pendingCount > 0
              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <ShieldAlert
            className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}
          />
          <span className="hidden sm:inline">Human Approval Center</span>
          <span className="sm:hidden">Approval</span>
          {pendingCount > 0 ? (
            <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
              {pendingCount}
            </span>
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
          )}
        </button>
      </div>
    </header>
  );
};
