import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { GoogleWorkspaceHub } from '../GoogleWorkspaceHub.js';

export const DocumentGeneratorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preview' | 'latex' | 'workspace'>('preview');

  const latexCode = `\\documentclass[11pt,a4paper]{article}
\\usepackage{amsmath,graphicx,cite}
\\title{Sparse Attention via Biological Plasticity Mechanics}
\\author{Jun Phookan, Dr. Elena Rostova, Prof. Alan Vance}
\\begin{document}
\\maketitle
\\begin{abstract}
We formulate a biologically plausible plasticity operator for sparse transformer attention...
\\end{abstract}
\\end{document}`;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            MODULE 15
          </span>
          <span className="text-xs text-slate-400 font-mono">• LaTeX / Google Docs / Drive Document Studio</span>
        </div>
        <h1 className="text-xl font-bold text-slate-100 mt-1">Document Generator Studio</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg ${activeTab === 'preview' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
            >
              Document Preview
            </button>
            <button
              onClick={() => setActiveTab('latex')}
              className={`px-3 py-1.5 rounded-lg ${activeTab === 'latex' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
            >
              LaTeX Source
            </button>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-1.5 rounded-lg ${activeTab === 'workspace' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400'}`}
            >
              Google Docs & Drive Sync
            </button>
          </div>

          <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg flex items-center space-x-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export Compiled PDF</span>
          </button>
        </div>

        {activeTab === 'latex' && (
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            {latexCode}
          </pre>
        )}

        {activeTab === 'preview' && (
          <div className="p-8 bg-slate-950 border border-slate-800 rounded-xl max-w-3xl mx-auto space-y-4 text-slate-200 text-xs font-serif leading-relaxed shadow-inner">
            <h2 className="text-lg font-bold text-center font-sans text-white">Sparse Attention via Biological Plasticity Mechanics</h2>
            <p className="text-center font-mono text-[11px] text-slate-400">Jun Phookan, Dr. Elena Rostova, Prof. Alan Vance</p>
            <hr className="border-slate-800" />
            <p><strong>Abstract:</strong> We formulate a biologically plausible plasticity operator for sparse transformer attention, achieving 68% memory compression on long-context benchmarks while retaining full accuracy.</p>
          </div>
        )}

        {activeTab === 'workspace' && (
          <GoogleWorkspaceHub />
        )}
      </div>
    </div>
  );
};
