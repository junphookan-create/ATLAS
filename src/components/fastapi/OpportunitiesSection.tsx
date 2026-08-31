import React, { useState, useEffect } from 'react';
import {
  Compass,
  ExternalLink,
  Radar,
  Loader2,
  Calendar,
  DollarSign,
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Youtube,
  Send,
  Sliders,
  Filter,
  Play,
  Terminal,
  Layers,
  Award,
  CheckCircle2,
  Cpu,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { FastApiOpportunity, MultiChannelOpportunity, WinnerIntelligence } from '../../types/apiTypes';
import { api } from '../../lib/api';

interface OpportunitiesSectionProps {
  opportunities: FastApiOpportunity[];
  isLoading: boolean;
  onScan: () => Promise<void>;
}

export const OpportunitiesSection: React.FC<OpportunitiesSectionProps> = ({
  opportunities: legacyOpportunities,
  isLoading,
  onScan,
}) => {
  const [multiChannelOpps, setMultiChannelOpps] = useState<MultiChannelOpportunity[]>([]);
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('all');
  const [filterBrainrot, setFilterBrainrot] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState(false);
  const [inspectingWinnerOpp, setInspectingWinnerOpp] = useState<MultiChannelOpportunity | null>(null);
  const [dispatchingTool, setDispatchingTool] = useState<string | null>(null);
  const [dispatchResult, setDispatchResult] = useState<{ oppId: string; tool: string; url: string; msg: string } | null>(null);

  useEffect(() => {
    loadMultiChannelOpps();
  }, []);

  const loadMultiChannelOpps = async () => {
    try {
      const data = await api.getMultiChannelOpportunities();
      setMultiChannelOpps(data);
    } catch (e) {
      console.error('Failed to load multi channel opportunities:', e);
    }
  };

  const handleScanMultiChannel = async () => {
    setIsScanning(true);
    try {
      const updated = await api.runMultiChannelScan(
        ['instagram_search', 'pinterest_board', 'linkedin_research', 'email_newsletter', 'snowday_portal'],
        filterBrainrot
      );
      setMultiChannelOpps(updated);
      await onScan();
    } catch (e) {
      console.error('Multi channel scan failed:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDispatchTool = async (oppId: string, tool: string) => {
    setDispatchingTool(`${oppId}-${tool}`);
    try {
      const res = await api.dispatchOpportunityTool(oppId, tool);
      setDispatchResult({
        oppId,
        tool,
        url: res.workspace_url,
        msg: res.message,
      });
    } catch (e) {
      console.error('Tool dispatch failed:', e);
    } finally {
      setDispatchingTool(null);
    }
  };

  const filteredOpps = multiChannelOpps.filter((opp) => {
    if (activeChannelFilter !== 'all' && opp.source_channel !== activeChannelFilter) {
      return false;
    }
    if (filterBrainrot && !opp.brainrot_filtered) {
      return false;
    }
    return true;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'whimsical_creativity':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'non_profit_initiative':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'grant_funding':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'computer_science_project':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'entrepreneurship_advice':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-950/80 border border-emerald-800/50 rounded-lg text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-slate-100">
                Multi-Channel Opportunity Surveillance & Tool Dispatcher
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                {filteredOpps.length} HIGH-SIGNAL OPPs
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Surveillance across Instagram, Pinterest, LinkedIn, Snowday, Youth Opportunities & Grants with Anti-Brainrot filtering
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Anti-Brainrot Filter Toggle */}
          <button
            onClick={() => setFilterBrainrot(!filterBrainrot)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              filterBrainrot
                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/80 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${filterBrainrot ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span>Anti-Brainrot Filter: {filterBrainrot ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleScanMultiChannel}
            disabled={isScanning || isLoading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning All Feeds...</span>
              </>
            ) : (
              <>
                <Radar className="w-3.5 h-3.5" />
                <span>Surveil Feeds Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Channels' },
          { id: 'instagram_search', label: 'Instagram (@schmidt_science / Tech Reels)' },
          { id: 'pinterest_board', label: 'Pinterest (Creative Tech Boards)' },
          { id: 'snowday_portal', label: 'Snowday & Youth Opps' },
          { id: 'linkedin_research', label: 'LinkedIn Research Network' },
          { id: 'email_newsletter', label: 'Substack & Curated Newsletters' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChannelFilter(tab.id)}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeChannelFilter === tab.id
                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dispatch Notification Banner */}
      {dispatchResult && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-700/80 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="text-indigo-200">{dispatchResult.msg}</span>
          </div>
          <a
            href={dispatchResult.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shrink-0"
          >
            <span>Open {dispatchResult.tool.toUpperCase()} Workspace</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Opportunities List */}
      {filteredOpps.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/50 border border-slate-800/60 rounded-xl">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No opportunities found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click "Surveil Feeds Now" to search Instagram, Pinterest, Snowday, and newsletters for fresh high-signal grants and CS projects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpps.map((opp) => (
            <div
              key={opp.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700/90 rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-2.5">
                {/* Channel & Category Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {opp.source}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getCategoryColor(
                        opp.content_category
                      )}`}
                    >
                      {opp.content_category.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {opp.funding_amount && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 flex items-center font-bold">
                        <DollarSign className="w-2.5 h-2.5 mr-0.5" />
                        {opp.funding_amount}
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {opp.match_score}% MATCH
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-100">{opp.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{opp.description}</p>

                {/* Extracted Actionable CS / Creative Ideas */}
                {opp.extracted_actionable_ideas && opp.extracted_actionable_ideas.length > 0 && (
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] text-yellow-400 font-mono font-semibold flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Compiled Idea Blueprints:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {opp.extracted_actionable_ideas.map((idea, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-indigo-400 font-mono text-[10px]">•</span>
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actionable Winning Advice & Deployable Tools */}
              <div className="space-y-3 pt-2 border-t border-slate-900">
                {/* 1-Click External Tool Dispatcher */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">
                    Deploy Complete Project Blueprint to Tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['strawberry_browser', 'replit', 'n8n', 'codex', 'github_vercel'].map((tool) => (
                      <button
                        key={tool}
                        onClick={() => handleDispatchTool(opp.id, tool)}
                        disabled={dispatchingTool === `${opp.id}-${tool}`}
                        className="flex items-center space-x-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {dispatchingTool === `${opp.id}-${tool}` ? (
                          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                        ) : (
                          <Cpu className="w-3 h-3 text-indigo-400" />
                        )}
                        <span>{tool.replace('_', ' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Controls: Deadline, Winner Intel & Link */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center text-slate-500 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Due: {opp.deadline}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {opp.winner_intelligence && (
                      <button
                        onClick={() => setInspectingWinnerOpp(opp)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 text-amber-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Winner Intelligence</span>
                      </button>
                    )}

                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-medium text-xs"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Winner Intelligence Modal */}
      {inspectingWinnerOpp && inspectingWinnerOpp.winner_intelligence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-950 border border-amber-800 rounded-xl text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Winner Intelligence & Advice Dossier</h3>
                  <p className="text-xs text-slate-400">{inspectingWinnerOpp.title}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectingWinnerOpp(null)}
                className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Prior Winners */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-400">
                  Prior Winners & Winning Projects:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingWinnerOpp.winner_intelligence.winner_names.map((name, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-900 text-slate-200 rounded font-semibold border border-slate-800">
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Winning Tactics */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
                  Actionable Winning Tactics & Advice:
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {inspectingWinnerOpp.winner_intelligence.key_tactics.map((tactic, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* YouTube Breakdowns */}
              {inspectingWinnerOpp.winner_intelligence.youtube_breakdown_urls && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-rose-400 flex items-center">
                    <Youtube className="w-3.5 h-3.5 mr-1" />
                    Video Breakdowns & Interviews:
                  </span>
                  <div className="space-y-1.5">
                    {inspectingWinnerOpp.winner_intelligence.youtube_breakdown_urls.map((yt, i) => (
                      <a
                        key={i}
                        href={yt.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-slate-200 hover:text-white transition-colors"
                      >
                        <span className="font-semibold">{yt.title}</span>
                        <span className="text-slate-400 text-[11px]">{yt.takeaway}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Drafted Cold Outreach */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 flex items-center">
                    <Send className="w-3 h-3 mr-1" />
                    Drafted Winner Mentorship Cold Outreach:
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(inspectingWinnerOpp.winner_intelligence?.drafted_outreach_template || '')}
                    className="text-[10px] font-mono text-indigo-300 hover:text-white px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 cursor-pointer"
                  >
                    Copy Template
                  </button>
                </div>
                <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-300 leading-relaxed">
                  {inspectingWinnerOpp.winner_intelligence.drafted_outreach_template}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingWinnerOpp(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

