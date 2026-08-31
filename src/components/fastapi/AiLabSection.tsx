import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  DollarSign,
  Clock,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Users,
  MessageSquare,
  Scale,
  BrainCircuit,
  Loader2,
  ChevronRight,
  ShieldAlert,
  Award,
} from 'lucide-react';
import {
  FastApiModelRouterConfig,
  MultiAiDeliberationSession,
} from '../../types/apiTypes';
import { api } from '../../lib/api';

interface AiLabSectionProps {
  modelConfig: FastApiModelRouterConfig | null;
  isLoading: boolean;
}

export const AiLabSection: React.FC<AiLabSectionProps> = ({ modelConfig, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'ensemble' | 'models'>('ensemble');
  const [deliberations, setDeliberations] = useState<MultiAiDeliberationSession[]>([]);
  const [selectedDeliberation, setSelectedDeliberation] = useState<MultiAiDeliberationSession | null>(null);
  const [inquiryPrompt, setInquiryPrompt] = useState('');
  const [deliberationMode, setDeliberationMode] = useState<
    'consensus_building' | 'adversarial_redteam' | 'iterative_refinement' | 'scientific_peer_review'
  >('consensus_building');
  const [isDeliberating, setIsDeliberating] = useState(false);

  useEffect(() => {
    loadDeliberations();
  }, []);

  const loadDeliberations = async () => {
    try {
      const data = await api.getAiDeliberations();
      setDeliberations(data);
      if (data.length > 0) {
        setSelectedDeliberation(data[0]);
      }
    } catch (e) {
      console.error('Failed to load deliberations:', e);
    }
  };

  const handleStartDeliberation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryPrompt.trim() || isDeliberating) return;
    setIsDeliberating(true);
    try {
      const newSession = await api.createAiDeliberation({
        inquiry_prompt: inquiryPrompt.trim(),
        deliberation_mode: deliberationMode,
        ensemble_models: ['ChatGPT (GPT-4o)', 'DeepSeek (R1 Reasoner)', 'Claude 3.5 Sonnet', 'Grok 3 (xAI)', 'Perplexity Sonar Pro', 'Gemini 2.5 Pro'],
      });
      setDeliberations([newSession, ...deliberations]);
      setSelectedDeliberation(newSession);
      setInquiryPrompt('');
    } catch (e) {
      console.error('Failed to run AI deliberation:', e);
    } finally {
      setIsDeliberating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-slate-100">
                Multi-AI Ensemble Deliberation & Cognitive Router
              </h2>
              <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                GPT-4O + DEEPSEEK + CLAUDE + GROK + PERPLEXITY + GEMINI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Harmonize and cross-examine multi-model reasoning to eliminate blind spots and synthesize superhuman solutions
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('ensemble')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'ensemble'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Ensemble Deliberations ({deliberations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'models'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Model Router Matrix</span>
          </button>
        </div>
      </div>

      {activeTab === 'ensemble' ? (
        <div className="space-y-6">
          {/* Multi-AI Prompt Form */}
          <form
            onSubmit={handleStartDeliberation}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
          >
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Convene Multi-AI Deliberation Panel</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <select
                value={deliberationMode}
                onChange={(e: any) => setDeliberationMode(e.target.value)}
                disabled={isDeliberating}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="consensus_building">Consensus Building Protocol</option>
                <option value="adversarial_redteam">Adversarial Red-Teaming</option>
                <option value="scientific_peer_review">Scientific Peer Review</option>
                <option value="iterative_refinement">Iterative Step Refinement</option>
              </select>

              <input
                type="text"
                value={inquiryPrompt}
                onChange={(e) => setInquiryPrompt(e.target.value)}
                placeholder="Enter complex question, strategy debate, or architecture review..."
                disabled={isDeliberating}
                className="md:col-span-3 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                <span className="text-slate-500">Suggested Inquiries:</span>
                <button
                  type="button"
                  onClick={() => {
                    setInquiryPrompt(
                      'Design an autonomous zero-hallucination agentic architecture for auto-completing complex grant applications and research proposals'
                    );
                    setDeliberationMode('consensus_building');
                  }}
                  className="text-indigo-400 hover:underline"
                >
                  Grant Agent Architecture
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setInquiryPrompt(
                      'Red-team our neuromorphic event-camera slime mold routing algorithm for extreme corner cases'
                    );
                    setDeliberationMode('adversarial_redteam');
                  }}
                  className="text-indigo-400 hover:underline"
                >
                  Red-Team Algorithm
                </button>
              </div>

              <button
                type="submit"
                disabled={!inquiryPrompt.trim() || isDeliberating}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {isDeliberating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Concurring across 6 AI models...</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5" />
                    <span>Start Multi-AI Deliberation</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 2-Column Split: Deliberation Sessions & Deep Synthesis Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left list of Sessions */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Deliberation Records</span>
                <span className="text-[11px] font-mono text-slate-500">{deliberations.length} Sessions</span>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {deliberations.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDeliberation(d)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedDeliberation?.id === d.id
                        ? 'bg-indigo-950/70 border-indigo-600 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-100 text-xs flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                        {d.ensemble_models.length} AI Models
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-800">
                        {d.deliberation_mode.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium line-clamp-2 mb-2">
                      "{d.inquiry_prompt}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="text-emerald-400 font-bold">
                        {((d.consensus_synthesis.confidence_score || 0.95) * 100).toFixed(0)}% Confidence
                      </span>
                      <span>{d.consensus_synthesis.agreement_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Detailed Deliberation Workspace */}
            <div className="lg:col-span-7">
              {selectedDeliberation ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-indigo-400 uppercase">
                      <span>{selectedDeliberation.deliberation_mode.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{selectedDeliberation.ensemble_models.length} MODELS PARTICIPATING</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">
                      {selectedDeliberation.inquiry_prompt}
                    </h3>
                  </div>

                  {/* Consensus Synthesis Card */}
                  <div className="p-4 bg-indigo-950/40 border border-indigo-800/70 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-300 flex items-center">
                        <Award className="w-4 h-4 mr-1 text-yellow-400" />
                        Synthesized Consensus & Optimal Protocol:
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
                        {((selectedDeliberation.consensus_synthesis.confidence_score || 0.95) * 100).toFixed(0)}% CONFIDENCE
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {selectedDeliberation.consensus_synthesis.unified_solution}
                    </p>
                    <div className="pt-2 border-t border-indigo-900/60 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
                        Actionable Next Steps:
                      </span>
                      <ul className="text-[11px] text-slate-300 space-y-0.5">
                        {selectedDeliberation.consensus_synthesis.actionable_steps?.map((step, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-emerald-400 mr-1.5">✓</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Individual Model Contributions */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                      Cross-Model Deliberation Transcripts:
                    </span>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {selectedDeliberation.model_responses.map((mr, i) => (
                        <div key={i} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{mr.model_name}</span>
                            <span className="font-mono text-[10px] text-slate-500">{mr.provider}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {mr.perspective_summary}
                          </p>
                          {mr.critique && (
                            <div className="text-[10px] text-amber-400/90 font-mono bg-amber-950/40 p-1.5 rounded border border-amber-900/50">
                              Critique: {mr.critique}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs bg-slate-950 border border-slate-800 rounded-xl">
                  Select a deliberation session on the left or convene a new one.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MODEL ROUTER MATRIX TAB */
        <div className="space-y-6">
          {isLoading && !modelConfig ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading model routing configuration...</div>
          ) : !modelConfig ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
              No data yet
            </div>
          ) : (
            <div className="space-y-6">
              {/* Available Models Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Available Model Infrastructure ({modelConfig.available_models.length})</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {modelConfig.available_models.map((model) => (
                    <div
                      key={model.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-100">{model.name}</h4>
                          <p className="text-slate-400 font-mono text-[11px]">{model.provider}</p>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                          ${model.cost_per_1k_tokens}/1k
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-500" />
                          {model.latency_ms}ms
                        </span>
                        <span className="text-slate-500">ID: {model.id}</span>
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-900">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Specialized Roles:</div>
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.map((cap, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Task Routing Rules */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span>Active Cognitive Routing Policy Matrix</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Task Domain</th>
                        <th className="p-3">Preferred Primary Model</th>
                        <th className="p-3">Fallback Model</th>
                        <th className="p-3">Cost Threshold</th>
                        <th className="p-3">Health Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-mono">
                      {modelConfig.routing_rules.map((rule, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-slate-200">{rule.task_type}</td>
                          <td className="p-3 text-emerald-400">{rule.preferred_model}</td>
                          <td className="p-3 text-amber-400">{rule.fallback_model}</td>
                          <td className="p-3 text-slate-400">
                            {rule.max_cost_threshold ? `$${rule.max_cost_threshold}` : 'Unconstrained'}
                          </td>
                          <td className="p-3 text-emerald-400 flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ACTIVE</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

