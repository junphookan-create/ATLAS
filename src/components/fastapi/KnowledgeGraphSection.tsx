import React, { useState } from 'react';
import {
  Network,
  Filter,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';
import { FastApiKnowledgeGraph } from '../../types/apiTypes';

interface KnowledgeGraphSectionProps {
  graph: FastApiKnowledgeGraph | null;
  isLoading: boolean;
  onFilterChange: (type?: string) => void;
  selectedFilter?: string;
}

export const KnowledgeGraphSection: React.FC<KnowledgeGraphSectionProps> = ({
  graph,
  isLoading,
  onFilterChange,
  selectedFilter = 'all',
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const filterOptions = [
    { label: 'All Entities', value: 'all' },
    { label: 'Concepts', value: 'concept' },
    { label: 'Grants', value: 'grant' },
    { label: 'Papers', value: 'paper' },
    { label: 'Contacts', value: 'contact' },
    { label: 'Opportunities', value: 'opportunity' },
  ];

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'concept':
        return 'border-indigo-500 bg-indigo-950/80 text-indigo-200';
      case 'grant':
        return 'border-emerald-500 bg-emerald-950/80 text-emerald-200';
      case 'paper':
        return 'border-blue-500 bg-blue-950/80 text-blue-200';
      case 'contact':
        return 'border-amber-500 bg-amber-950/80 text-amber-200';
      case 'opportunity':
        return 'border-purple-500 bg-purple-950/80 text-purple-200';
      default:
        return 'border-slate-600 bg-slate-800 text-slate-200';
    }
  };

  const activeNode = graph?.nodes.find((n) => n.id === activeNodeId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Tripartite Knowledge Graph</h2>
            <p className="text-xs text-slate-400">
              Neo4j-style semantic entity triples & relationships (GET /knowledge/graph)
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value === 'all' ? undefined : opt.value)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                (opt.value === 'all' && (!selectedFilter || selectedFilter === 'all')) ||
                selectedFilter === opt.value
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (!graph || graph.nodes.length === 0) ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading knowledge graph...</div>
      ) : !graph || graph.nodes.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/50 border border-slate-800/60 rounded-lg">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No data yet</h3>
          <p className="text-xs text-slate-400 mt-1">No entities match the active filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Graph Node Grid / Canvas */}
          <div className="lg:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[320px] flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center justify-between">
              <span>Interactive Graph Entities ({graph.nodes.length} Nodes, {graph.edges.length} Edges)</span>
              <span className="text-[11px] font-mono text-slate-500">Click node to inspect relationships</span>
            </div>

            {/* Nodes Visual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {graph.nodes.map((node) => {
                const isSelected = activeNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveNodeId(isSelected ? null : node.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${getNodeColor(
                      node.type
                    )} ${isSelected ? 'ring-2 ring-indigo-400 scale-[1.02]' : 'hover:border-slate-500'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/60">
                        {node.type}
                      </span>
                      <span className="text-[10px] font-mono opacity-60">{node.id}</span>
                    </div>
                    <h4 className="text-xs font-semibold">{node.label}</h4>
                  </div>
                );
              })}
            </div>

            {/* Edges List Visual */}
            <div className="border-t border-slate-900 pt-3">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">Relational Edges:</div>
              <div className="flex flex-wrap gap-2">
                {graph.edges.map((edge) => (
                  <div
                    key={edge.id}
                    className="p-1.5 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono flex items-center space-x-1 text-slate-300"
                  >
                    <span className="text-indigo-400">{edge.source}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                    <span className="text-amber-400 font-bold">[{edge.relationship}]</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                    <span className="text-emerald-400">{edge.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Node Inspector Panel */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
            <h3 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Entity Inspector</span>
            </h3>

            {activeNode ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-indigo-400 font-bold">
                    {activeNode.type}
                  </div>
                  <div className="text-sm font-semibold text-slate-100">{activeNode.label}</div>
                  <div className="text-[10px] font-mono text-slate-500">ID: {activeNode.id}</div>
                </div>

                <div>
                  <div className="font-semibold text-slate-300 text-[11px] mb-1">Connected Triples:</div>
                  <div className="space-y-1">
                    {graph.edges
                      .filter((e) => e.source === activeNode.id || e.target === activeNode.id)
                      .map((e) => (
                        <div key={e.id} className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300">
                          {e.source === activeNode.id ? (
                            <span>
                              Connects to <strong className="text-emerald-400">{e.target}</strong> via <span className="text-amber-400 font-mono">[{e.relationship}]</span>
                            </span>
                          ) : (
                            <span>
                              Targeted by <strong className="text-indigo-400">{e.source}</strong> via <span className="text-amber-400 font-mono">[{e.relationship}]</span>
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select any entity node from the graph to inspect its relational graph triples.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
