import {
  ModelRegistryItem,
  ModelRoutingRequest,
  ModelRoutingDecision,
  ModelCandidateScore,
  DagWorkflowDefinition,
  DagWorkflowExecution,
  CostBudgetEntity,
  ModelTelemetry,
  VectorCacheItem,
  RoutingTaskType,
} from '../types/index.js';

export class AiResearchLabEngine {
  private static instance: AiResearchLabEngine;

  private models: ModelRegistryItem[] = [
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      tier: 'Flagship',
      capabilities: ['creative_writing', 'code_generation', 'complex_reasoning', 'multimodal_vision'],
      costPer1kInputTokens: 0.003,
      costPer1kOutputTokens: 0.015,
      avgLatencyMs: 980,
      currentLoadPct: 38,
      accuracyScore: 96,
      bleuScore: 94,
      userSatisfactionRating: 9.8,
      contextWindowTokens: 200000,
      isOnline: true,
      fallbackModelId: 'gemini-3.1-pro-preview',
      endpointUrl: 'https://api.anthropic.com/v1/messages',
      description: 'Supreme nuanced creative drafting, complex reasoning, and academic rhetoric synthesis.',
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro Preview',
      provider: 'Google',
      tier: 'Reasoning',
      capabilities: ['complex_reasoning', 'factual_research', 'code_generation', 'multimodal_vision', 'summarisation'],
      costPer1kInputTokens: 0.00125,
      costPer1kOutputTokens: 0.005,
      avgLatencyMs: 740,
      currentLoadPct: 24,
      accuracyScore: 95,
      bleuScore: 93,
      userSatisfactionRating: 9.6,
      contextWindowTokens: 1000000,
      isOnline: true,
      fallbackModelId: 'gemini-3.6-flash',
      endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro',
      description: '1M+ context window reasoning engine ideal for dense scientific cross-referencing and grant synthesis.',
    },
    {
      id: 'gemini-3.6-flash',
      name: 'Gemini 3.6 Flash',
      provider: 'Google',
      tier: 'Efficiency',
      capabilities: ['summarisation', 'translation', 'sentiment_analysis', 'factual_research', 'code_generation'],
      costPer1kInputTokens: 0.000075,
      costPer1kOutputTokens: 0.0003,
      avgLatencyMs: 240,
      currentLoadPct: 15,
      accuracyScore: 91,
      bleuScore: 89,
      userSatisfactionRating: 9.3,
      contextWindowTokens: 1000000,
      isOnline: true,
      fallbackModelId: 'llama-3-1-70b-local',
      endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash',
      description: 'Ultra-low latency sub-second router for real-time categorisation, extraction, and high-frequency tasks.',
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o Omnimodal',
      provider: 'OpenAI',
      tier: 'Flagship',
      capabilities: ['multimodal_vision', 'creative_writing', 'code_generation', 'complex_reasoning'],
      costPer1kInputTokens: 0.0025,
      costPer1kOutputTokens: 0.01,
      avgLatencyMs: 820,
      currentLoadPct: 42,
      accuracyScore: 95,
      bleuScore: 92,
      userSatisfactionRating: 9.5,
      contextWindowTokens: 128000,
      isOnline: true,
      fallbackModelId: 'gemini-3.1-pro-preview',
      endpointUrl: 'https://api.openai.com/v1/chat/completions',
      description: 'High-precision multimodal model driving browser visual DOM interpretation and code generation.',
    },
    {
      id: 'llama-3-1-70b-local',
      name: 'Llama 3.1 70B (Local Ollama/vLLM)',
      provider: 'Meta',
      tier: 'Local / Edge',
      capabilities: ['summarisation', 'translation', 'sentiment_analysis', 'factual_research'],
      costPer1kInputTokens: 0.0,
      costPer1kOutputTokens: 0.0,
      avgLatencyMs: 410,
      currentLoadPct: 55,
      accuracyScore: 89,
      bleuScore: 87,
      userSatisfactionRating: 8.9,
      contextWindowTokens: 128000,
      isOnline: true,
      fallbackModelId: 'gemini-3.6-flash',
      endpointUrl: 'http://localhost:11434/api/generate',
      description: 'Zero-marginal-cost airgapped local model for strict data privacy and bulk summarisation.',
    },
    {
      id: 'deepseek-v3-reasoner',
      name: 'DeepSeek-V3 Reasoner',
      provider: 'DeepSeek',
      tier: 'Reasoning',
      capabilities: ['code_generation', 'complex_reasoning', 'factual_research'],
      costPer1kInputTokens: 0.00055,
      costPer1kOutputTokens: 0.0022,
      avgLatencyMs: 1100,
      currentLoadPct: 62,
      accuracyScore: 94,
      bleuScore: 90,
      userSatisfactionRating: 9.2,
      contextWindowTokens: 64000,
      isOnline: true,
      fallbackModelId: 'gemini-3.1-pro-preview',
      endpointUrl: 'https://api.deepseek.com/v1/chat/completions',
      description: 'Cost-efficient deep mathematical deduction and algorithm design engine.',
    },
  ];

  private routingHistory: ModelRoutingDecision[] = [
    {
      requestId: 'req-route-901',
      timestamp: '2026-08-13T18:42:10Z',
      selectedModel: {} as ModelRegistryItem,
      fallbackChain: ['gemini-3.1-pro-preview', 'claude-3-5-sonnet', 'llama-3-1-70b-local'],
      candidateScores: [],
      decisionRationale: 'Task requires high-prestige creative proposal writing with quality level 9. Selected Claude 3.5 Sonnet.',
      decisionTreePath: ['Task: creative_writing', 'Quality >= 8.5', 'Budget allowance: High ($0.05/call)', 'Selected: Claude 3.5 Sonnet'],
      rlRewardScore: 0.94,
      executionOutcome: {
        success: true,
        actualLatencyMs: 920,
        tokensPrompt: 1420,
        tokensCompletion: 860,
        costUsd: 0.01716,
        outputPreview: 'The proposed neuromorphic spiking neural architecture demonstrates 10x energy efficiency...',
        usedFallback: false,
      },
    },
  ];

  private workflows: DagWorkflowDefinition[] = [
    {
      id: 'wf-article-synthesis',
      name: 'Quad-Model High-Impact Paper & Grant Synthesis',
      description: 'Asynchronous 4-step pipeline: Gemini for deep literature scan -> Claude for prose drafting -> GPT-4o for adversarial critique -> Llama 3.1 for polish.',
      category: 'Article Synthesis',
      mergeStrategy: 'critic_revision',
      isEnsemble: true,
      yamlConfig: `version: "2.4"
name: quad_model_article_synthesis
nodes:
  - id: research_node
    model: gemini-3.1-pro-preview
    role: Factual Researcher
    prompt: "Extract primary empirical claims and citations regarding spiking neuromorphic efficiency."
  - id: drafting_node
    model: claude-3-5-sonnet
    role: Chief Drafter
    inputs: [research_node]
    prompt: "Draft comprehensive 800-word introduction and methodology section."
  - id: critique_node
    model: gpt-4o
    role: Adversarial Reviewer
    inputs: [drafting_node]
    prompt: "Critique technical rigor, statistical validity, and clarity. Output structured revisions."
  - id: polish_node
    model: llama-3-1-70b-local
    role: Proofreader & Final Polisher
    inputs: [drafting_node, critique_node]
    prompt: "Integrate feedback and deliver publication-grade final deliverable."`,
      nodes: [
        {
          id: 'research_node',
          label: '1. Literature Discovery',
          modelId: 'gemini-3.1-pro-preview',
          role: 'Factual Researcher',
          promptTemplate: 'Extract primary empirical claims and citations regarding spiking neuromorphic efficiency.',
          inputDependencies: [],
          params: { temperature: 0.2, maxTokens: 2048 },
          status: 'completed',
          output: 'Identified 14 benchmark papers: TrueNorth (Merolla et al.), Loihi 2 (Davies et al.), showing 12-40pJ per synaptic event.',
          executionTimeMs: 1420,
          tokenCount: 2240,
          costUsd: 0.0035,
        },
        {
          id: 'drafting_node',
          label: '2. Narrative Synthesis',
          modelId: 'claude-3-5-sonnet',
          role: 'Chief Drafter',
          promptTemplate: 'Draft comprehensive introduction and methodology sections referencing research node facts.',
          inputDependencies: ['research_node'],
          params: { temperature: 0.7, maxTokens: 4096 },
          status: 'completed',
          output: 'Section 1: Introduction. Neuromorphic computing architectures emulate biological neural topologies to achieve ultra-low power edge computation...',
          executionTimeMs: 2310,
          tokenCount: 3450,
          costUsd: 0.0162,
        },
        {
          id: 'critique_node',
          label: '3. Adversarial Review',
          modelId: 'gpt-4o',
          role: 'Adversarial Reviewer',
          promptTemplate: 'Critique methodological rigor and highlight any unbacked claims.',
          inputDependencies: ['drafting_node'],
          params: { temperature: 0.3, maxTokens: 2048 },
          status: 'completed',
          output: 'Score: 9.1/10. Strengths: Clear historical progression. Recommendation: Explicitly quantify latency tradeoff against standard GPU tensor cores.',
          executionTimeMs: 1840,
          tokenCount: 1680,
          costUsd: 0.0084,
        },
        {
          id: 'polish_node',
          label: '4. Final Polish & Consensus',
          modelId: 'llama-3-1-70b-local',
          role: 'Proofreader & Polisher',
          promptTemplate: 'Incorporate critique revisions and finalize publication formatting.',
          inputDependencies: ['drafting_node', 'critique_node'],
          params: { temperature: 0.1, maxTokens: 4096 },
          status: 'completed',
          output: 'Consensus Final Output: Neuromorphic Computing: Scalable Ultra-Low Power Architecture for Edge Intelligence. [Full formatted draft compiled].',
          executionTimeMs: 890,
          tokenCount: 3820,
          costUsd: 0.0,
        },
      ],
      edges: [
        { id: 'e1', fromNodeId: 'research_node', toNodeId: 'drafting_node', dataTransform: 'extract_bullets' },
        { id: 'e2', fromNodeId: 'drafting_node', toNodeId: 'critique_node', dataTransform: 'raw_text' },
        { id: 'e3', fromNodeId: 'drafting_node', toNodeId: 'polish_node', dataTransform: 'raw_text' },
        { id: 'e4', fromNodeId: 'critique_node', toNodeId: 'polish_node', dataTransform: 'critique_scoring' },
      ],
    },
    {
      id: 'wf-ensemble-code-reasoning',
      name: 'Tri-Model Ensemble Consensus for High-Stakes Code Generation',
      description: 'Runs DeepSeek Reasoner, Gemini 3.1 Pro, and Claude 3.5 in parallel; synthesizes output using a recursive consensus algorithm.',
      category: 'Code System Architecture',
      mergeStrategy: 'recursive_consensus',
      isEnsemble: true,
      yamlConfig: `version: "2.4"
name: tri_model_code_consensus
merge_strategy: recursive_consensus
nodes:
  - id: deepseek_impl
    model: deepseek-v3-reasoner
    prompt: "Implement lock-free concurrent ring buffer in TypeScript with memory fencing."
  - id: gemini_impl
    model: gemini-3.1-pro-preview
    prompt: "Implement lock-free concurrent ring buffer in TypeScript with memory fencing."
  - id: claude_impl
    model: claude-3-5-sonnet
    prompt: "Implement lock-free concurrent ring buffer in TypeScript with memory fencing."`,
      nodes: [
        {
          id: 'deepseek_impl',
          label: 'DeepSeek Candidate A',
          modelId: 'deepseek-v3-reasoner',
          role: 'Algorithmic Optimization',
          promptTemplate: 'Implement lock-free concurrent ring buffer in TypeScript with memory fencing.',
          inputDependencies: [],
          params: { temperature: 0.1, maxTokens: 2048 },
          status: 'completed',
          output: 'class LockFreeRingBuffer<T> { private head = new Int32Array(new SharedArrayBuffer(4)); ... }',
          executionTimeMs: 1480,
          tokenCount: 1950,
          costUsd: 0.0021,
        },
        {
          id: 'gemini_impl',
          label: 'Gemini Candidate B',
          modelId: 'gemini-3.1-pro-preview',
          role: 'Defensive Architecture',
          promptTemplate: 'Implement lock-free concurrent ring buffer in TypeScript with memory fencing.',
          inputDependencies: [],
          params: { temperature: 0.2, maxTokens: 2048 },
          status: 'completed',
          output: 'export class SharedRingBuffer<T> { private buffer: SharedArrayBuffer; ... }',
          executionTimeMs: 1120,
          tokenCount: 1820,
          costUsd: 0.0028,
        },
        {
          id: 'claude_impl',
          label: 'Claude Candidate C',
          modelId: 'claude-3-5-sonnet',
          role: 'Type-Safety & Ergonomics',
          promptTemplate: 'Implement lock-free concurrent ring buffer in TypeScript with memory fencing.',
          inputDependencies: [],
          params: { temperature: 0.2, maxTokens: 2048 },
          status: 'completed',
          output: 'export class AtomicRingBuffer<T> implements AsyncIterable<T> { ... }',
          executionTimeMs: 1350,
          tokenCount: 2100,
          costUsd: 0.0095,
        },
      ],
      edges: [],
    },
  ];

  private activeExecution: DagWorkflowExecution | null = {
    runId: 'run-dag-8842',
    workflowId: 'wf-article-synthesis',
    workflowName: 'Quad-Model High-Impact Paper & Grant Synthesis',
    status: 'completed',
    startedAt: '2026-08-13T19:10:00Z',
    completedAt: '2026-08-13T19:10:06Z',
    totalTokens: 11190,
    totalCostUsd: 0.0281,
    totalDurationMs: 6460,
    nodeOutputs: {
      research_node: 'Extracted 14 peer-reviewed citations across 3 primary neuromorphic datasets.',
      drafting_node: 'Drafted 840 words covering introduction, problem statement, and algorithmic pipeline.',
      critique_node: 'Provided 3 actionable enhancements for experimental validation metrics.',
      polish_node: 'Unified final deliverable into formatted LaTeX and Markdown structure.',
    },
    finalConsensusOutput: `# Neuromorphic Computing: Scalable Ultra-Low Power Architecture for Edge Intelligence\n\n## Abstract\nBiological neural circuits compute with milliwatt-scale energy budgets. We present an event-driven spiking architecture achieving 14.2pJ per synaptic operation...`,
    consensusBreakdown: {
      candidateWeights: [
        { model: 'gemini-3.1-pro-preview', weight: 0.3, agreementPct: 94 },
        { model: 'claude-3-5-sonnet', weight: 0.45, agreementPct: 98 },
        { model: 'gpt-4o', weight: 0.25, agreementPct: 91 },
      ],
      synthesisMethod: 'Recursive Critic-Refinement Matrix (4 Iterations)',
    },
  };

  private budgets: CostBudgetEntity[] = [
    {
      id: 'b-mod-grant-writer',
      entityType: 'module',
      name: 'Grant Writer Module',
      allocatedBudgetUsd: 50.0,
      currentSpentUsd: 14.25,
      usagePct: 28.5,
      autoDowngradeThresholdPct: 85,
      alertThresholdPct: 90,
      status: 'optimal',
      dailyHistory: [
        { date: '2026-08-09', costUsd: 1.45, tokenCount: 42000 },
        { date: '2026-08-10', costUsd: 2.8, tokenCount: 95000 },
        { date: '2026-08-11', costUsd: 3.1, tokenCount: 112000 },
        { date: '2026-08-12', costUsd: 4.2, tokenCount: 154000 },
        { date: '2026-08-13', costUsd: 2.7, tokenCount: 98000 },
      ],
    },
    {
      id: 'b-mod-research-scientist',
      entityType: 'module',
      name: 'Research Scientist Module',
      allocatedBudgetUsd: 75.0,
      currentSpentUsd: 41.8,
      usagePct: 55.7,
      autoDowngradeThresholdPct: 85,
      alertThresholdPct: 90,
      status: 'optimal',
      dailyHistory: [
        { date: '2026-08-09', costUsd: 5.2, tokenCount: 190000 },
        { date: '2026-08-10', costUsd: 8.4, tokenCount: 310000 },
        { date: '2026-08-11', costUsd: 11.2, tokenCount: 420000 },
        { date: '2026-08-12', costUsd: 9.8, tokenCount: 360000 },
        { date: '2026-08-13', costUsd: 7.2, tokenCount: 280000 },
      ],
    },
    {
      id: 'b-mod-browser-agent',
      entityType: 'module',
      name: 'Browser Agent (VLM Vision)',
      allocatedBudgetUsd: 30.0,
      currentSpentUsd: 18.9,
      usagePct: 63.0,
      autoDowngradeThresholdPct: 85,
      alertThresholdPct: 90,
      status: 'optimal',
      dailyHistory: [
        { date: '2026-08-09', costUsd: 2.1, tokenCount: 55000 },
        { date: '2026-08-10', costUsd: 4.6, tokenCount: 120000 },
        { date: '2026-08-11', costUsd: 5.3, tokenCount: 140000 },
        { date: '2026-08-12', costUsd: 3.8, tokenCount: 98000 },
        { date: '2026-08-13', costUsd: 3.1, tokenCount: 82000 },
      ],
    },
    {
      id: 'b-user-jun',
      entityType: 'user',
      name: 'User: jun (Primary Developer)',
      allocatedBudgetUsd: 250.0,
      currentSpentUsd: 84.45,
      usagePct: 33.78,
      autoDowngradeThresholdPct: 85,
      alertThresholdPct: 90,
      status: 'optimal',
      dailyHistory: [
        { date: '2026-08-09', costUsd: 11.2, tokenCount: 380000 },
        { date: '2026-08-10', costUsd: 18.5, tokenCount: 620000 },
        { date: '2026-08-11', costUsd: 22.4, tokenCount: 780000 },
        { date: '2026-08-12', costUsd: 19.1, tokenCount: 680000 },
        { date: '2026-08-13', costUsd: 13.25, tokenCount: 490000 },
      ],
    },
  ];

  private telemetry: ModelTelemetry[] = [
    {
      modelId: 'gemini-3.6-flash',
      modelName: 'Gemini 3.6 Flash',
      totalCalls: 1842,
      errorRatePct: 0.12,
      latencyP50Ms: 220,
      latencyP99Ms: 460,
      avgBleuScore: 90.2,
      avgRougeScore: 91.5,
      humanSatisfactionPct: 97.4,
      activeDegradationAlert: false,
    },
    {
      modelId: 'gemini-3.1-pro-preview',
      modelName: 'Gemini 3.1 Pro Preview',
      totalCalls: 628,
      errorRatePct: 0.31,
      latencyP50Ms: 710,
      latencyP99Ms: 1420,
      avgBleuScore: 94.6,
      avgRougeScore: 95.1,
      humanSatisfactionPct: 98.8,
      activeDegradationAlert: false,
    },
    {
      modelId: 'claude-3-5-sonnet',
      modelName: 'Claude 3.5 Sonnet',
      totalCalls: 492,
      errorRatePct: 0.45,
      latencyP50Ms: 940,
      latencyP99Ms: 1980,
      avgBleuScore: 95.8,
      avgRougeScore: 96.2,
      humanSatisfactionPct: 99.2,
      activeDegradationAlert: false,
    },
    {
      modelId: 'gpt-4o',
      modelName: 'GPT-4o',
      totalCalls: 312,
      errorRatePct: 0.64,
      latencyP50Ms: 810,
      latencyP99Ms: 1890,
      avgBleuScore: 93.9,
      avgRougeScore: 94.4,
      humanSatisfactionPct: 96.9,
      activeDegradationAlert: false,
    },
    {
      modelId: 'llama-3-1-70b-local',
      modelName: 'Llama 3.1 70B Local',
      totalCalls: 890,
      errorRatePct: 0.05,
      latencyP50Ms: 380,
      latencyP99Ms: 820,
      avgBleuScore: 88.5,
      avgRougeScore: 89.2,
      humanSatisfactionPct: 94.1,
      activeDegradationAlert: false,
    },
  ];

  private vectorCache: VectorCacheItem[] = [
    {
      id: 'cache-vc-101',
      querySnippet: 'Summarize standard NSF Career proposal font and margin requirements (2026 PAPPG)',
      embeddingCosineSim: 0.984,
      modelId: 'llama-3-1-70b-local',
      cachedResponseSnippet: 'NSF PAPPG 2026 Guidelines: Minimum 10pt font (Computer Modern/Times/Arial), 1-inch margins, max 15 pages for Project Description.',
      hitCount: 38,
      tokensSaved: 42560,
      costSavedUsd: 0.34,
      lastHitAt: '2026-08-13T17:15:00Z',
    },
    {
      id: 'cache-vc-102',
      querySnippet: 'Classify incoming email sentiment and extract action items for grant committee',
      embeddingCosineSim: 0.962,
      modelId: 'gemini-3.6-flash',
      cachedResponseSnippet: 'Classification: action_required (99.1% conf). Action: review attached rubric before Friday 17:00.',
      hitCount: 54,
      tokensSaved: 61000,
      costSavedUsd: 0.05,
      lastHitAt: '2026-08-13T18:30:00Z',
    },
  ];

  public static getInstance(): AiResearchLabEngine {
    if (!AiResearchLabEngine.instance) {
      AiResearchLabEngine.instance = new AiResearchLabEngine();
    }
    return AiResearchLabEngine.instance;
  }

  // 1. Model Registry
  public getModels(): ModelRegistryItem[] {
    return this.models;
  }

  public registerModel(model: Partial<ModelRegistryItem>): ModelRegistryItem {
    const newModel: ModelRegistryItem = {
      id: model.id || `custom-model-${Date.now()}`,
      name: model.name || 'Custom Model Endpoint',
      provider: model.provider || 'Google',
      tier: model.tier || 'Efficiency',
      capabilities: model.capabilities || ['summarisation'],
      costPer1kInputTokens: model.costPer1kInputTokens ?? 0.0001,
      costPer1kOutputTokens: model.costPer1kOutputTokens ?? 0.0004,
      avgLatencyMs: model.avgLatencyMs || 350,
      currentLoadPct: model.currentLoadPct || 10,
      accuracyScore: model.accuracyScore || 90,
      bleuScore: model.bleuScore || 88,
      userSatisfactionRating: model.userSatisfactionRating || 9.0,
      contextWindowTokens: model.contextWindowTokens || 128000,
      isOnline: true,
      fallbackModelId: model.fallbackModelId || 'gemini-3.6-flash',
      endpointUrl: model.endpointUrl || 'https://api.custom-ai.org/v1',
      description: model.description || 'User-registered custom model endpoint.',
    };
    this.models.push(newModel);
    return newModel;
  }

  // 2. Intelligent Model Router (Decision-Tree + Scoring Matrix)
  public routeRequest(request: ModelRoutingRequest): ModelRoutingDecision {
    const candidateScores: ModelCandidateScore[] = this.models.map((m) => {
      const isCapable = m.capabilities.includes(request.taskType);
      const estCost =
        ((request.promptSnippet.length / 4) / 1000) * m.costPer1kInputTokens +
        (request.requiredOutputTokens / 1000) * m.costPer1kOutputTokens;

      const withinBudget = estCost <= request.maxAcceptableCostUsd;
      const withinLatency = m.avgLatencyMs <= request.maxAllowableLatencyMs;
      const meetsPrivacy = request.enforcePrivacyLocalOnly ? m.tier === 'Local / Edge' : true;

      let exclusionReason: string | undefined;
      if (!isCapable) exclusionReason = `Missing capability: ${request.taskType}`;
      else if (!withinBudget) exclusionReason = `Estimated cost ($${estCost.toFixed(4)}) exceeds limit ($${request.maxAcceptableCostUsd})`;
      else if (!withinLatency) exclusionReason = `Latency (${m.avgLatencyMs}ms) exceeds limit (${request.maxAllowableLatencyMs}ms)`;
      else if (!meetsPrivacy) exclusionReason = 'Local airgapped privacy required';

      const isEligible = isCapable && withinBudget && withinLatency && meetsPrivacy && m.isOnline;

      // Scoring Breakdown
      const performanceSubScore = ((m.accuracyScore * 0.5 + m.bleuScore * 0.3 + m.userSatisfactionRating * 10 * 0.2) / 100) * 40;
      const costEfficiencySubScore = Math.max(0, 30 - estCost * 500);
      const latencySubScore = Math.max(0, 20 - (m.avgLatencyMs / 100));
      const loadPenalty = (m.currentLoadPct / 100) * 8;

      const compositeScore = isEligible
        ? Math.max(0, Math.min(100, Math.round(performanceSubScore + costEfficiencySubScore + latencySubScore - loadPenalty)))
        : 0;

      return {
        modelId: m.id,
        modelName: m.name,
        provider: m.provider,
        compositeScore,
        performanceSubScore: Math.round(performanceSubScore),
        costEfficiencySubScore: Math.round(costEfficiencySubScore),
        latencySubScore: Math.round(latencySubScore),
        loadPenalty: Math.round(loadPenalty),
        rank: 0,
        isEligible,
        exclusionReason,
      };
    });

    candidateScores.sort((a, b) => b.compositeScore - a.compositeScore);
    candidateScores.forEach((c, idx) => (c.rank = idx + 1));

    const topEligible = candidateScores.find((c) => c.isEligible) || candidateScores[0];
    const selectedModel = this.models.find((m) => m.id === topEligible.modelId) || this.models[0];

    const fallbackChain = [
      selectedModel.fallbackModelId,
      'gemini-3.6-flash',
      'llama-3-1-70b-local',
    ].filter((id, i, arr) => id && arr.indexOf(id) === i && id !== selectedModel.id);

    const decisionTreePath = [
      `Task Type Evaluation: [${request.taskType}]`,
      `Quality Threshold: [${request.desiredQualityLevel}/10] => Min composite score calculated`,
      `Cost & Latency Constraints: max $${request.maxAcceptableCostUsd}, max ${request.maxAllowableLatencyMs}ms`,
      `Selected Primary: ${selectedModel.name} (Composite Score: ${topEligible.compositeScore})`,
    ];

    const decision: ModelRoutingDecision = {
      requestId: request.id || `req-route-${Date.now()}`,
      timestamp: new Date().toISOString(),
      selectedModel,
      fallbackChain,
      candidateScores,
      decisionRationale: `Selected ${selectedModel.name} for task '${request.taskType}'. Balanced performance (${topEligible.performanceSubScore}/40) and cost efficiency (${topEligible.costEfficiencySubScore}/30) against current cluster load (${selectedModel.currentLoadPct}%).`,
      decisionTreePath,
      rlRewardScore: 0.95,
      executionOutcome: {
        success: true,
        actualLatencyMs: selectedModel.avgLatencyMs + Math.floor(Math.random() * 80 - 40),
        tokensPrompt: Math.round(request.promptSnippet.length / 3.5),
        tokensCompletion: request.requiredOutputTokens,
        costUsd: (request.requiredOutputTokens / 1000) * selectedModel.costPer1kOutputTokens,
        outputPreview: `[${selectedModel.name}] Optimized execution outcome generated with high semantic coherence for '${request.taskType}'.`,
        usedFallback: false,
      },
    };

    this.routingHistory.unshift(decision);
    if (this.routingHistory.length > 50) this.routingHistory.pop();

    return decision;
  }

  public getRoutingHistory(): ModelRoutingDecision[] {
    return this.routingHistory;
  }

  // 3. Collaboration Workflows (DAGs)
  public getWorkflows(): DagWorkflowDefinition[] {
    return this.workflows;
  }

  public getActiveExecution(): DagWorkflowExecution | null {
    return this.activeExecution;
  }

  public executeWorkflow(workflowId: string): DagWorkflowExecution {
    const wf = this.workflows.find((w) => w.id === workflowId) || this.workflows[0];
    const runId = `run-dag-${Date.now()}`;

    const execution: DagWorkflowExecution = {
      runId,
      workflowId: wf.id,
      workflowName: wf.name,
      status: 'completed',
      startedAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + 4500).toISOString(),
      totalTokens: wf.nodes.reduce((acc, n) => acc + (n.tokenCount || 1500), 0),
      totalCostUsd: Number(wf.nodes.reduce((acc, n) => acc + (n.costUsd || 0.005), 0).toFixed(4)),
      totalDurationMs: wf.nodes.reduce((acc, n) => acc + (n.executionTimeMs || 1000), 0),
      nodeOutputs: wf.nodes.reduce((acc, n) => {
        acc[n.id] = n.output || `Output from ${n.role}`;
        return acc;
      }, {} as Record<string, string>),
      finalConsensusOutput: `# Consolidated Multi-Model Synthesis (${wf.name})\n\nExecuted through ${wf.nodes.length} asynchronous pipeline stages with ${wf.mergeStrategy} consensus resolution.\n\nKey Findings:\n- High statistical confidence across candidate runs\n- Formatted into publication-ready structural deliverable.`,
      consensusBreakdown: {
        candidateWeights: wf.nodes.map((n) => ({
          model: n.modelId,
          weight: Number((1 / wf.nodes.length).toFixed(2)),
          agreementPct: 92 + Math.floor(Math.random() * 7),
        })),
        synthesisMethod: `Recursive Ensemble Merging (${wf.mergeStrategy})`,
      },
    };

    this.activeExecution = execution;
    return execution;
  }

  // 4. Cost Management & Budgets
  public getBudgets(): CostBudgetEntity[] {
    return this.budgets;
  }

  public getTelemetry(): ModelTelemetry[] {
    return this.telemetry;
  }

  public getVectorCache(): VectorCacheItem[] {
    return this.vectorCache;
  }

  public queryVectorCache(query: string): VectorCacheItem | null {
    const qLower = query.toLowerCase();
    const match = this.vectorCache.find((c) =>
      c.querySnippet.toLowerCase().includes(qLower) || qLower.includes(c.querySnippet.toLowerCase().slice(0, 15))
    );
    if (match) {
      match.hitCount += 1;
      match.tokensSaved += 850;
      match.costSavedUsd += 0.008;
      match.lastHitAt = new Date().toISOString();
      return match;
    }
    return null;
  }
}

export const aiResearchLabEngine = AiResearchLabEngine.getInstance();
