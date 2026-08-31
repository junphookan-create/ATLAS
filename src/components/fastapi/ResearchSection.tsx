import React, { useState, useEffect } from 'react';
import {
  Microscope,
  BookOpen,
  Lightbulb,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
  Percent,
  Play,
  Code,
  FileText,
  Dna,
  Binary,
  Layers,
  FlaskConical,
  Zap,
} from 'lucide-react';
import { FastApiResearchPaper, FastApiHypothesis, BiomimicryResearchProject } from '../../types/apiTypes';
import { api } from '../../lib/api';

interface ResearchSectionProps {
  papers: FastApiResearchPaper[];
  hypotheses: FastApiHypothesis[];
  isLoading: boolean;
  onGenerateHypothesis: (topic: string) => Promise<void>;
}

export const ResearchSection: React.FC<ResearchSectionProps> = ({
  papers,
  hypotheses,
  isLoading,
  onGenerateHypothesis,
}) => {
  const [activeTab, setActiveTab] = useState<'biomimicry' | 'literature'>('biomimicry');
  const [biomimicryProjects, setBiomimicryProjects] = useState<BiomimicryResearchProject[]>([]);
  const [organismInput, setOrganismInput] = useState('');
  const [inquiryInput, setInquiryInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedBioProject, setSelectedBioProject] = useState<BiomimicryResearchProject | null>(null);
  const [topicInput, setTopicInput] = useState('');
  const [isGeneratingHypothesis, setIsGeneratingHypothesis] = useState(false);

  useEffect(() => {
    loadBiomimicryProjects();
  }, []);

  const loadBiomimicryProjects = async () => {
    try {
      const data = await api.getBiomimicryProjects();
      setBiomimicryProjects(data);
      if (data.length > 0) {
        setSelectedBioProject(data[0]);
      }
    } catch (e) {
      console.error('Failed to load biomimicry projects:', e);
    }
  };

  const handleCreateBiomimicryProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organismInput.trim() || !inquiryInput.trim() || isSimulating) return;
    setIsSimulating(true);
    try {
      const newProj = await api.createBiomimicryProject(
        organismInput.trim(),
        inquiryInput.trim()
      );
      setBiomimicryProjects([newProj, ...biomimicryProjects]);
      setSelectedBioProject(newProj);
      setOrganismInput('');
      setInquiryInput('');
    } catch (e) {
      console.error('Failed to generate biomimicry project:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSubmitHypothesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isGeneratingHypothesis) return;
    setIsGeneratingHypothesis(true);
    try {
      await onGenerateHypothesis(topicInput.trim());
      setTopicInput('');
    } finally {
      setIsGeneratingHypothesis(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-400">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-slate-100">
                Autonomous Research Scientist & Biomimicry Engine
              </h2>
              <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                BIOLOGICAL QUESTIONING & COMPLETE PROJECTS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Notice nature inspiration, formulate fundamental physics/biology questions, and complete PyTorch simulations & preprints
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('biomimicry')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'biomimicry'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Biomimicry Projects ({biomimicryProjects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('literature')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'literature'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Literature & Hypotheses</span>
          </button>
        </div>
      </div>

      {activeTab === 'biomimicry' ? (
        <div className="space-y-6">
          {/* Biomimicry Exploration & Question Form */}
          <form
            onSubmit={handleCreateBiomimicryProject}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
          >
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Observe Nature Phenomenon & Formulate End-to-End Project</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={organismInput}
                onChange={(e) => setOrganismInput(e.target.value)}
                placeholder="Organism (e.g. 'Tardigrade', 'Mantis Shrimp', 'Gecko')..."
                disabled={isSimulating}
                className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              <input
                type="text"
                value={inquiryInput}
                onChange={(e) => setInquiryInput(e.target.value)}
                placeholder="Inquiry Question (e.g. 'How do desiccation proteins preserve molecular state?')..."
                disabled={isSimulating}
                className="md:col-span-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                <span className="text-slate-500">Quick Inspirations:</span>
                <button
                  type="button"
                  onClick={() => {
                    setOrganismInput('Physarum polycephalum (Slime Mold)');
                    setInquiryInput('Can tubular hydrostatic pressure solve P2P mesh network routing with zero packet collisions?');
                  }}
                  className="text-indigo-400 hover:underline"
                >
                  Slime Mold Routing
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setOrganismInput('Odontodactylus scyllarus (Mantis Shrimp)');
                    setInquiryInput('Can circular polarization stokes vectors enable sub-surface event vision in dense fog?');
                  }}
                  className="text-indigo-400 hover:underline"
                >
                  Mantis Shrimp Vision
                </button>
              </div>

              <button
                type="submit"
                disabled={!organismInput.trim() || !inquiryInput.trim() || isSimulating}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Math & PyTorch Simulation...</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Execute Biomimicry Discovery</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 2-Column Split: Project Cards & In-Depth Simulation Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left list of Biomimicry Projects */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Discovered Biological Blueprints</span>
                <span className="text-[11px] font-mono text-slate-500">{biomimicryProjects.length} Projects</span>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {biomimicryProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedBioProject(p)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedBioProject?.id === p.id
                        ? 'bg-indigo-950/70 border-indigo-600 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-100 text-xs flex items-center">
                        <Dna className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        {p.organism_name}
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-800">
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium italic line-clamp-2 mb-2">
                      "{p.inquiry_question}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{p.biological_kingdom}</span>
                      <span className="text-emerald-400 font-bold">PyTorch Simulated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Detailed Scientific Simulation & Preprint Workspace */}
            <div className="lg:col-span-7">
              {selectedBioProject ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-indigo-400 uppercase">
                      <span>{selectedBioProject.biological_kingdom}</span>
                      <span>•</span>
                      <span>{selectedBioProject.organism_name}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">
                      {selectedBioProject.inquiry_question}
                    </h3>
                  </div>

                  {/* Biological Mechanism & Mathematical Translation */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">
                        Natural Biological Phenomenon:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{selectedBioProject.natural_phenomenon}</p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block mb-1">
                        Mathematical Translation & Differential Model:
                      </span>
                      <div className="p-2 bg-slate-950 rounded font-mono text-xs text-indigo-200 border border-slate-800 mb-2">
                        {selectedBioProject.mathematical_formulation}
                      </div>
                      <p className="text-slate-300 leading-relaxed">{selectedBioProject.computational_translation}</p>
                    </div>
                  </div>

                  {/* PyTorch Simulation Code Viewer */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-yellow-400 font-bold uppercase flex items-center">
                        <Code className="w-3.5 h-3.5 mr-1" />
                        PyTorch Simulation Engine:
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedBioProject.pytorch_simulation_code)}
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-200 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded cursor-pointer"
                      >
                        Copy PyTorch Module
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
                      {selectedBioProject.pytorch_simulation_code}
                    </pre>
                  </div>

                  {/* Experimental Results & LaTeX Preprint Abstract */}
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-indigo-300">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Scientific Preprint Abstract (LaTeX Ready)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {selectedBioProject.latex_preprint_abstract}
                    </p>
                    <div className="pt-1 text-[10px] font-mono text-emerald-400">
                      Benchmarks: {selectedBioProject.verification_benchmarks.join(' | ')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs bg-slate-950 border border-slate-800 rounded-xl">
                  Select a biomimicry project on the left or generate a new one.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LITERATURE & HYPOTHESES TAB */
        <div className="space-y-6">
          <form onSubmit={handleSubmitHypothesis} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Formulate Novel Scientific Hypothesis</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Enter research inquiry (e.g., 'Spike-timing dependent plasticity in robot locomotion')..."
                disabled={isGeneratingHypothesis}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={!topicInput.trim() || isGeneratingHypothesis}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {isGeneratingHypothesis ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Formulating...</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Generate hypothesis</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Recent Papers */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Recent Literature Feed ({papers.length})</span>
              </div>

              {papers.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-slate-100">{p.title}</h4>
                    {p.relevance_score && (
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 shrink-0">
                        {p.relevance_score}% Rel
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 line-clamp-3 leading-relaxed">{p.abstract}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{p.authors?.join(', ') || 'Various Authors'}</span>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
                    >
                      <span>Read on arXiv</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Hypotheses */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span>Formulated Hypotheses ({hypotheses.length})</span>
              </div>

              {hypotheses.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                      {h.topic}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400">
                      Confidence: {((h.confidence_score || 0.9) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="font-medium text-slate-200 leading-relaxed italic">
                    "{h.hypothesis}"
                  </p>

                  {h.proposed_experiment && (
                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-slate-400 text-[11px]">
                      <strong className="text-slate-300 block mb-0.5">Proposed Validation Protocol:</strong>
                      {h.proposed_experiment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

