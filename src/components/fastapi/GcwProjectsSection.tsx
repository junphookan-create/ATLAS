import React, { useState } from 'react';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  Code2,
  RefreshCw,
  GitCommit,
} from 'lucide-react';
import { GCWProject, GCWProjectPlanNode } from '../../types/apiTypes';

interface GcwProjectsSectionProps {
  projects: GCWProject[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const GcwProjectsSection: React.FC<GcwProjectsSectionProps> = ({
  projects,
  isLoading,
  onRefresh,
}) => {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );
  const [viewJsonId, setViewJsonId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'executing':
      case 'in_progress':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800 animate-pulse';
      case 'waiting_approval':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'failed':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const renderNode = (node: GCWProjectPlanNode, depth = 0) => {
    const statusIcon =
      node.status === 'completed' ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      ) : node.status === 'in_progress' ? (
        <Play className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
      ) : node.status === 'failed' ? (
        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      );

    return (
      <div key={node.id} className="space-y-1.5" style={{ marginLeft: `${depth * 16}px` }}>
        <div className="flex items-center space-x-2 p-2 rounded bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs">
          {statusIcon}
          <span className="font-mono text-[10px] text-slate-400 uppercase px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
            {node.type}
          </span>
          <span className="font-medium text-slate-200 flex-1">{node.title}</span>
          {node.assigned_module && (
            <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
              {node.assigned_module}
            </span>
          )}
          {node.estimated_cost_usd !== undefined && (
            <span className="font-mono text-[10px] text-emerald-400">
              ${node.estimated_cost_usd.toFixed(2)}
            </span>
          )}
        </div>
        {node.children && node.children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-slate-100">GCW Autonomous Project Pipelines</h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                {projects.length} PROJECTS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Hierarchical Task Network (HTN) execution trees (auto-refreshed every 10s via GET /gcw/projects)
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading && projects.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
          <p className="text-xs">Loading active projects from backend...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/50 border border-slate-800/60 rounded-lg">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No data yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Use the Command Bar above to dispatch a high-level goal and generate your first cognitive project plan tree.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => {
            const isExpanded = expandedProjectId === proj.id;
            const isJsonView = viewJsonId === proj.id;

            return (
              <div
                key={proj.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-xl overflow-hidden transition-all"
              >
                {/* Project Header */}
                <div
                  onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                  className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <button className="mt-0.5 text-slate-400 hover:text-slate-200">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100">{proj.goal}</span>
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                            proj.status
                          )}`}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400 font-mono">
                        <span>Phase: <strong className="text-indigo-300">{proj.current_phase}</strong></span>
                        <span>•</span>
                        <span>Created: {new Date(proj.created_at).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span className="text-slate-500">ID: {proj.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Plan Tree Body */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                        <GitCommit className="w-4 h-4 text-indigo-400" />
                        <span>Execution Hierarchy & Plan Tree</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewJsonId(isJsonView ? null : proj.id);
                        }}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800"
                      >
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isJsonView ? 'Visual Tree View' : 'Expandable JSON'}</span>
                      </button>
                    </div>

                    {isJsonView ? (
                      <pre className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
                        {JSON.stringify(proj.plan_tree, null, 2)}
                      </pre>
                    ) : (
                      <div className="space-y-2">
                        {proj.plan_tree?.nodes && proj.plan_tree.nodes.length > 0 ? (
                          proj.plan_tree.nodes.map((node) => renderNode(node, 0))
                        ) : (
                          <div className="p-3 text-xs font-mono text-slate-400 bg-slate-900 rounded border border-slate-800">
                            {JSON.stringify(proj.plan_tree)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
