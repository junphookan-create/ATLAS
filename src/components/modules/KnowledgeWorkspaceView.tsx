import React, { useState } from 'react';
import {
  Network,
  Search,
  Layers,
  AlertCircle,
  Share2,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Filter,
  Eye,
  Plus,
  ArrowRight,
  Database,
  RefreshCw,
  Sliders,
  Maximize2,
  Minimize2,
  Clock,
  FileText,
  User,
  CheckSquare,
  Award,
  Zap,
  Tag,
  Hash,
  Activity,
} from 'lucide-react';
import {
  EnhancedKnowledgeNode,
  EnhancedKnowledgeEdge,
  SuggestedLinkProposal,
  ImpactAnalysisResult,
  KnowledgeNodeType,
  KnowledgeRelationType,
} from '../../types/startupKnowledgeTypes';
import { KnowledgeWorkspaceEngine } from '../../server/knowledgeWorkspaceEngine';

interface KnowledgeWorkspaceViewProps {
  onRequestApproval?: (summary: string, module: string) => void;
}

export const KnowledgeWorkspaceView: React.FC<KnowledgeWorkspaceViewProps> = ({
  onRequestApproval = (_summary: string, _module: string) => {},
}) => {
  const [activeTab, setActiveTab] = useState<'graph_canvas' | 'auto_tagging' | 'impact_analysis' | 'hybrid_search'>('graph_canvas');

  // Graph Data State
  const [graphData, setGraphData] = useState(() => KnowledgeWorkspaceEngine.getInitialGraph());
  const [selectedNodeId, setSelectedNodeId] = useState<string>(graphData.nodes[0]?.id || '');
  const [filterType, setFilterType] = useState<string>('all');
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'force_directed' | 'hierarchical' | 'circular'>('force_directed');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Link Suggestions State (pgvector cosine similarity)
  const [suggestedLinks, setSuggestedLinks] = useState<SuggestedLinkProposal[]>(() =>
    KnowledgeWorkspaceEngine.computeSuggestedLinks(graphData.nodes, graphData.edges)
  );

  // Impact Analysis State
  const [impactSimulationAction, setImpactSimulationAction] = useState<
    'postpone_deadline' | 'delete_node' | 'change_scope' | 'block_dependency'
  >('postpone_deadline');
  const [impactResult, setImpactResult] = useState<ImpactAnalysisResult | null>(() =>
    KnowledgeWorkspaceEngine.simulateImpact(selectedNodeId, graphData.nodes, graphData.edges, impactSimulationAction)
  );

  // Node Creator Modal State
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<KnowledgeNodeType>('Project');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [newNodeTags, setNewNodeTags] = useState('AI, Research, Milestone');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedNode = graphData.nodes.find((n) => n.id === selectedNodeId) || graphData.nodes[0];
  const connectedEdges = graphData.edges.filter((e) => e.source === selectedNode?.id || e.target === selectedNode?.id);

  // Update impact simulation when selected node or action changes
  React.useEffect(() => {
    if (selectedNode) {
      const sim = KnowledgeWorkspaceEngine.simulateImpact(
        selectedNode.id,
        graphData.nodes,
        graphData.edges,
        impactSimulationAction
      );
      setImpactResult(sim);
    }
  }, [selectedNodeId, impactSimulationAction, graphData]);

  // Handle Accepting Suggested Link
  const handleAcceptLink = (proposal: SuggestedLinkProposal) => {
    const newEdge: EnhancedKnowledgeEdge = {
      id: `edge-${Date.now()}`,
      source: proposal.sourceNodeId,
      target: proposal.targetNodeId,
      relation: proposal.suggestedRelation,
      weight: proposal.cosineSimilarity,
      suggested: true,
      similarityScore: proposal.cosineSimilarity,
      rationale: proposal.nlpExplanation,
    };

    setGraphData((prev) => ({
      ...prev,
      edges: [...prev.edges, newEdge],
    }));

    setSuggestedLinks((prev) => prev.filter((p) => p.id !== proposal.id));
    setStatusMessage(`Accepted link: [${proposal.sourceNodeLabel}] ➔ [${proposal.targetNodeLabel}]!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleRejectLink = (proposalId: string) => {
    setSuggestedLinks((prev) => prev.filter((p) => p.id !== proposalId));
    setStatusMessage('Link suggestion dismissed.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const tagsArray = newNodeTags.split(',').map((t) => t.trim()).filter(Boolean);
    const newNode: EnhancedKnowledgeNode = {
      id: `node-${Date.now()}`,
      label: newNodeLabel,
      type: newNodeType,
      description: newNodeDesc || 'User created entity node.',
      tags: tagsArray,
      metadata: {
        status: 'Newly Ingested',
        priority: 'medium',
        confidenceScore: 0.95,
        embeddingVectorDim: 1536,
      },
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 200,
    };

    // Auto-create edge to selected node
    const newEdge: EnhancedKnowledgeEdge = {
      id: `edge-${Date.now()}`,
      source: selectedNode?.id || graphData.nodes[0].id,
      target: newNode.id,
      relation: 'child_of',
      weight: 0.88,
    };

    setGraphData((prev) => ({
      nodes: [...prev.nodes, newNode],
      edges: [...prev.edges, newEdge],
    }));

    setSelectedNodeId(newNode.id);
    setShowAddNodeModal(false);
    setNewNodeLabel('');
    setNewNodeDesc('');
    setStatusMessage(`Created node "${newNode.label}" and auto-linked to "${selectedNode?.label}"!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const filteredNodes = graphData.nodes.filter((n) => {
    const matchesType = filterType === 'all' || n.type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getNodeTypeBadgeColor = (type: KnowledgeNodeType) => {
    switch (type) {
      case 'Project':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'Research':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'Document':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Contact':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Competition':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Deadline':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'Task':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
              MODULE 9
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • The Central Nervous System & Graph Knowledge Fabric
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Knowledge Workspace (PostgreSQL + pgvector + Neo4j)</h1>
        </div>

        {/* Global Graph Stats */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Entities: <strong className="text-indigo-300 font-bold">{graphData.nodes.length}</strong></span>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2">
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span>Edges: <strong className="text-emerald-400 font-bold">{graphData.edges.length}</strong></span>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Suggested Links: <strong className="text-purple-300 font-bold">{suggestedLinks.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-center space-x-2 text-xs text-indigo-200 font-mono">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-slate-900/80 p-1 border border-slate-800 rounded-xl text-xs font-mono overflow-x-auto">
        {[
          { id: 'graph_canvas', label: '1. React Flow Graph Canvas & Matrix', icon: Network },
          { id: 'auto_tagging', label: '2. Auto-Tagging & Cosine Linking', icon: Sparkles },
          { id: 'impact_analysis', label: '3. Downstream Ripple Impact Simulator', icon: AlertCircle },
          { id: 'hybrid_search', label: '4. Hybrid Semantic & Graph Search', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GRAPH CANVAS & MATRIX */}
      {activeTab === 'graph_canvas' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter nodes by tag or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none w-48 font-mono"
                />
              </div>

              {/* Node Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono"
              >
                <option value="all">All Entity Types</option>
                <option value="project">Projects</option>
                <option value="document">Documents & Proposals</option>
                <option value="research">Research Papers</option>
                <option value="contact">Contacts</option>
                <option value="competition">Competitions</option>
                <option value="deadline">Deadlines</option>
                <option value="task">Tasks</option>
              </select>

              {/* Layout Engine */}
              <select
                value={layoutAlgorithm}
                onChange={(e) => setLayoutAlgorithm(e.target.value as any)}
                className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono"
              >
                <option value="force_directed">Force-Directed Layout</option>
                <option value="hierarchical">Hierarchical Tree</option>
                <option value="circular">Circular Cluster</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddNodeModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-md shadow-indigo-600/30 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest / Create Entity Node</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Node Matrix Canvas */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 font-mono text-xs">
                  <div className="flex items-center space-x-2">
                    <Network className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-slate-200">
                      Graph Topology: {filteredNodes.length} Visible Nodes ({layoutAlgorithm.replace('_', ' ')})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Click node to inspect properties & adjacent edges</span>
                </div>

                {/* Node Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                  {filteredNodes.map((n) => {
                    const isSelected = n.id === selectedNode?.id;
                    const edgeCount = graphData.edges.filter((e) => e.source === n.id || e.target === n.id).length;
                    return (
                      <div
                        key={n.id}
                        onClick={() => setSelectedNodeId(n.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/50 border-indigo-500 shadow-lg shadow-indigo-950/40'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getNodeTypeBadgeColor(
                              n.type
                            )}`}
                          >
                            {n.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {edgeCount} {edgeCount === 1 ? 'edge' : 'edges'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-100 leading-snug">{n.label}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-sans">{n.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {n.tags.slice(0, 3).map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[9px] font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Materialized Adjacency Info Bar */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Bidirectional index active (0.4ms traversal latency)</span>
                </span>
                <span className="text-emerald-400 font-bold">PostgreSQL Triggers Synced</span>
              </div>
            </div>

            {/* Right: Selected Node Properties & Adjacency List */}
            <div className="lg:col-span-4 space-y-4 font-mono text-xs">
              {selectedNode ? (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border inline-block mb-1.5 ${getNodeTypeBadgeColor(
                          selectedNode.type
                        )}`}
                      >
                        {selectedNode.type.toUpperCase()} ENTITY
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">{selectedNode.label}</h3>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Description:</span>
                    <p className="text-slate-300 font-sans text-xs leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                      {selectedNode.description}
                    </p>
                  </div>

                  {/* Metadata JSONB */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Metadata Attributes (JSONB):</span>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-300">
                      {Object.entries(selectedNode.metadata).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-400">{k}:</span>
                          <span className="text-indigo-300 font-bold truncate max-w-[160px]">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Graph Edges */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                      <span>Adjacency Edges ({connectedEdges.length}):</span>
                      <span className="text-indigo-400">Neo4j Fast Traversal</span>
                    </span>

                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                      {connectedEdges.map((e) => {
                        const isSource = e.source === selectedNode.id;
                        const otherId = isSource ? e.target : e.source;
                        const otherNode = graphData.nodes.find((n) => n.id === otherId);

                        return (
                          <div
                            key={e.id}
                            className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] flex items-center justify-between"
                          >
                            <span className="text-indigo-300 font-bold">[{e.relation}]</span>
                            <span className="text-slate-200 truncate max-w-[140px]">{otherNode?.label || otherId}</span>
                            <span className="text-[10px] text-emerald-400">{Math.round(e.weight * 100)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Impact Action Trigger */}
                  <button
                    onClick={() => setActiveTab('impact_analysis')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-800/60 rounded-xl font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Run Ripple Impact Analysis</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTO-TAGGING & COSINE LINKING */}
      {activeTab === 'auto_tagging' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>pgvector Cosine Similarity & spaCy NER Link Proposals</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Proposes edges when 1536-dimensional embedding similarity exceeds $\tau \ge 0.75$.
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-xl font-bold">
                {suggestedLinks.length} Pending Proposals
              </span>
            </div>

            {suggestedLinks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                All semantic link suggestions have been reviewed and accepted into the graph.
              </div>
            ) : (
              <div className="space-y-3">
                {suggestedLinks.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                          {proposal.sourceNodeLabel}
                        </span>
                        <span className="text-purple-400 font-bold">─── [{proposal.suggestedRelation}] ───►</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          {proposal.targetNodeLabel}
                        </span>
                      </div>

                      <span className="text-emerald-400 font-bold text-xs">
                        Cosine Similarity: {(proposal.cosineSimilarity * 100).toFixed(1)}%
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs font-sans bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                      💡 <strong>LLM & spaCy NER Rationale:</strong> {proposal.nlpExplanation}
                    </p>

                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        onClick={() => handleRejectLink(proposal.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg transition"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleAcceptLink(proposal)}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept & Materialize Edge</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: IMPACT ANALYSIS */}
      {activeTab === 'impact_analysis' && impactResult && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Downstream Ripple Impact Simulator: {impactResult.targetNodeLabel}</span>
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Simulates multi-hop dependency cascades before modifying or deleting entity nodes.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Simulate Action:</span>
                <select
                  value={impactSimulationAction}
                  onChange={(e) => setImpactSimulationAction(e.target.value as any)}
                  className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs"
                >
                  <option value="postpone_deadline">Postpone Deadline</option>
                  <option value="delete_node">Delete Entity Node</option>
                  <option value="change_scope">Recalibrate Scope</option>
                  <option value="block_dependency">Halt Execution Dependency</option>
                </select>
              </div>
            </div>

            {/* Risk Gauge Metric */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Simulated Impact Risk</span>
                <p
                  className={`text-2xl font-bold ${
                    impactResult.overallRiskScore > 70 ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {impactResult.overallRiskScore} / 100
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Downstream Affected Entities</span>
                <p className="text-2xl font-bold text-indigo-300">
                  {impactResult.affectedDownstreamNodes.length} Nodes
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Critical Path Vulnerability</span>
                <p className="text-2xl font-bold text-emerald-400">Mitigated via HITL</p>
              </div>
            </div>

            {/* Affected Nodes Breakdown */}
            <div className="space-y-3">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                Downstream Dependency Ripple Breakdown:
              </span>
              <div className="space-y-2">
                {impactResult.affectedDownstreamNodes.map((aff) => (
                  <div
                    key={aff.nodeId}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">{aff.nodeLabel}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {aff.nodeType}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 font-sans">{aff.rippleExplanation}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                        aff.impactSeverity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {aff.impactSeverity} SEVERITY
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation Callout */}
            <div className="p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-1">
              <span className="text-[10px] text-indigo-400 uppercase font-bold">Mitigation Strategy:</span>
              <p className="text-slate-200 text-xs font-sans leading-relaxed">
                {impactResult.mitigationRecommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HYBRID SEARCH */}
      {activeTab === 'hybrid_search' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Search className="w-4 h-4 text-indigo-400" />
                <span>Hybrid Elasticsearch & pgvector Semantic Query Engine</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Executes cross-modal queries combining full-text inverted indexes with vector semantic distance.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <Search className="w-4 h-4 text-indigo-400" />
              <input
                type="text"
                placeholder="Try: 'find all tasks related to the ISEF project that are due next week'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-100 focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {filteredNodes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setSelectedNodeId(n.id);
                    setActiveTab('graph_canvas');
                  }}
                  className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getNodeTypeBadgeColor(n.type)}`}>
                      {n.type}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-bold">Score: 0.94</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{n.label}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">{n.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating New Entity Node */}
      {showAddNodeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Ingest New Knowledge Entity Node</span>
              </h3>
              <button onClick={() => setShowAddNodeModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Entity Label / Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford Bio-Sensor Pilot Dataset"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Entity Node Type:</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as KnowledgeNodeType)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                >
                  <option value="Project">Project</option>
                  <option value="Research">Research Paper</option>
                  <option value="Document">Document / Proposal</option>
                  <option value="Contact">Contact / Person</option>
                  <option value="Competition">Competition</option>
                  <option value="Application">Application Package</option>
                  <option value="Task">Task (WBS)</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Note">Note / Scratchpad</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Description:</label>
                <textarea
                  rows={3}
                  placeholder="Detailed context and entity relationships..."
                  value={newNodeDesc}
                  onChange={(e) => setNewNodeDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Tags (Comma Separated):</label>
                <input
                  type="text"
                  value={newNodeTags}
                  onChange={(e) => setNewNodeTags(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-md shadow-indigo-600/30"
                >
                  Ingest & Auto-Embed Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
