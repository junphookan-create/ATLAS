import crypto from 'crypto';
import { getGenAI } from './aiClient.js';
import { memoryStore } from './memoryStore.js';
import { toolRegistry } from './toolRegistry.js';
import {
  MemoryChunk,
  GCWState,
  SensoryEvent,
  EpisodicMemory,
  SemanticTriple,
  ProceduralSkill,
  CounterfactualSimulation,
  SensePlanActReflectCycle,
  ActionDispatcherLog,
} from '../types/index.js';

export class GeneralCognitiveWorkerEngine {
  /**
   * Attention Controller: Computes dynamic relevance and attention weights over Working Memory chunks
   */
  private computeAttentionWeights(objective: string, workingMemory: MemoryChunk[]): MemoryChunk[] {
    if (!workingMemory || workingMemory.length === 0) return [];

    const objWords = objective.toLowerCase().split(/\s+/);

    return workingMemory.map((chunk) => {
      let matchCount = 0;
      const contentLower = chunk.content.toLowerCase();
      objWords.forEach((word) => {
        if (word.length > 3 && contentLower.includes(word)) {
          matchCount++;
        }
      });

      const relevance = Math.min(1.0, 0.3 + matchCount * 0.2);
      return {
        ...chunk,
        relevance,
      };
    });
  }

  /**
   * 5.2.1 Sensory Layer: Multimodal Perception & Salience Filtering
   */
  async processSensoryInput(input: {
    inputType: 'text' | 'image' | 'audio' | 'structured';
    rawInput: string;
    source?: string;
  }): Promise<SensoryEvent> {
    const ai = getGenAI();
    const source = input.source || 'Sensory Ingestion Gateway';

    const systemPrompt = `You are Atlas AI's Sensory Layer Multimodal Perception Engine (Section 5.2.1).
Analyze the incoming input (${input.inputType}).
Perform tokenization, named entity recognition (people, organizations, dates, locations, concepts), relationship extraction (triples), schema inference (if structured), or VLM/OCR description (if image), and compute a salience attention score (0.0 to 1.0) to filter irrelevant noise.

Input payload:
"${input.rawInput}"

Respond in JSON format with:
- tokenCount: number
- entities: { people: string[], organizations: string[], dates: string[], locations: string[], concepts: string[] }
- relationships: { subject: string, predicate: string, object: string }[]
- vlmDescription?: string (if image)
- ocrExtractedText?: string (if image)
- whisperTranscript?: string (if audio)
- diarizedSpeakers?: { speaker: string, text: string, time: string }[] (if audio)
- inferredSchema?: Record<string, string> (if structured data)
- salienceScore: number (0.0 - 1.0)
- salienceSummary: string`;

    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Process sensory input: ${input.rawInput.slice(0, 1000)}`,
        config: { systemInstruction: systemPrompt, responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(resp.text || '{}');
      const sensoryEvent: SensoryEvent = {
        id: `sen-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        inputType: input.inputType,
        source,
        rawInput: input.rawInput,
        tokenCount: parsed.tokenCount || input.rawInput.split(/\s+/).length,
        entities: parsed.entities || { people: [], organizations: [], dates: [], locations: [], concepts: [] },
        relationships: parsed.relationships || [],
        vlmDescription: parsed.vlmDescription,
        ocrExtractedText: parsed.ocrExtractedText,
        whisperTranscript: parsed.whisperTranscript,
        diarizedSpeakers: parsed.diarizedSpeakers,
        inferredSchema: parsed.inferredSchema,
        salienceScore: parsed.salienceScore ?? 0.85,
        salienceSummary: parsed.salienceSummary || 'Extracted salient cognitive entities.',
      };

      // Add to GCW state
      const state = memoryStore.getGcwState();
      const updatedStream = [sensoryEvent, ...(state.sensoryStream || [])].slice(0, 30);
      
      // If salience score is high (> 0.7), convert into a working memory chunk
      let updatedWorkingMemory = [...state.workingMemory];
      if (sensoryEvent.salienceScore > 0.7) {
        const newChunk: MemoryChunk = {
          id: `wm-${Date.now()}`,
          type: 'observation',
          content: `${sensoryEvent.salienceSummary} [Source: ${source}]`,
          confidence: 0.95,
          source: `${input.inputType.toUpperCase()} Sensory Stream`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          relevance: sensoryEvent.salienceScore,
        };
        updatedWorkingMemory = [newChunk, ...updatedWorkingMemory].slice(0, 50);
      }

      memoryStore.updateGcwState({
        sensoryStream: updatedStream,
        workingMemory: updatedWorkingMemory,
      });

      return sensoryEvent;
    } catch (err) {
      console.error('Sensory layer perception failed, fallback to heuristic extraction:', err);
      const fallbackEvent: SensoryEvent = {
        id: `sen-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        inputType: input.inputType,
        source,
        rawInput: input.rawInput,
        tokenCount: input.rawInput.split(/\s+/).length,
        entities: { people: [], organizations: [], dates: [], locations: [], concepts: [input.rawInput.slice(0, 30)] },
        relationships: [],
        salienceScore: 0.8,
        salienceSummary: `Direct sensory ingestion: ${input.rawInput.slice(0, 60)}...`,
      };
      return fallbackEvent;
    }
  }

  /**
   * 5.2.2 Working Memory: Attention Controller Management (Pruning, Merging, Promotion, & LTM Forgetting)
   */
  async runAttentionController() {
    const state = memoryStore.getGcwState();
    const currentMemory = state.workingMemory || [];

    // Sort by relevance score
    const sorted = [...currentMemory].sort((a, b) => b.relevance - a.relevance);

    // Chunks beyond 50 or low relevance (< 0.25) are forgotten from Working Memory and archived to LTM Episodic Memory
    const activeChunks: MemoryChunk[] = [];
    const archivedToLtm: MemoryChunk[] = [];

    sorted.forEach((chunk, index) => {
      if (index < 40 && chunk.relevance >= 0.25) {
        activeChunks.push(chunk);
      } else {
        archivedToLtm.push(chunk);
      }
    });

    // Create episodic memory entry for archived chunks
    let updatedEpisodic = [...(state.longTermMemory?.episodic || [])];
    if (archivedToLtm.length > 0) {
      const newEpisode: EpisodicMemory = {
        id: `ep-${Date.now()}`,
        timestamp: new Date().toISOString().substring(0, 10),
        taskTitle: `Archived Working Context (${archivedToLtm.length} chunks)`,
        objective: state.activeGoal,
        inputState: archivedToLtm.map((c) => c.content).join(' | ').slice(0, 300),
        reasoningSteps: [`Pruned during attention controller cycle`],
        actionsTaken: [`Moved from Working Memory to LTM Episodic Memory`],
        outcome: 'Context preserved in long-term vector store',
        successScore: 0.9,
        clusterSummaryTag: 'Working Memory Offload',
        vectorEmbeddingSnippet: '[0.012, 0.443, -0.198, ...]',
      };
      updatedEpisodic = [newEpisode, ...updatedEpisodic];
    }

    const updatedState = memoryStore.updateGcwState({
      workingMemory: activeChunks,
      longTermMemory: {
        ...(state.longTermMemory || { episodic: [], semantic: [], procedural: [] }),
        episodic: updatedEpisodic,
      },
    });

    return {
      activeCount: activeChunks.length,
      prunedCount: archivedToLtm.length,
      workingMemory: activeChunks,
      archivedEpisodesCount: updatedEpisodic.length,
    };
  }

  /**
   * 5.2.3 Long-Term Memory (LTM) Retrieval & Semantic Graph Querying
   */
  async queryLtm(query: string) {
    const state = memoryStore.getGcwState();
    const ltm = state.longTermMemory || { episodic: [], semantic: [], procedural: [] };

    const queryLower = query.toLowerCase();

    // 1. Episodic analogical search
    const matchingEpisodes = ltm.episodic.filter(
      (ep) =>
        ep.taskTitle.toLowerCase().includes(queryLower) ||
        ep.objective.toLowerCase().includes(queryLower) ||
        ep.inputState.toLowerCase().includes(queryLower) ||
        (ep.clusterSummaryTag && ep.clusterSummaryTag.toLowerCase().includes(queryLower))
    );

    // 2. Semantic triples query
    const matchingTriples = ltm.semantic.filter(
      (t) =>
        t.subject.toLowerCase().includes(queryLower) ||
        t.predicate.toLowerCase().includes(queryLower) ||
        t.object.toLowerCase().includes(queryLower)
    );

    // 3. Procedural skills query
    const matchingSkills = ltm.procedural.filter(
      (sk) => sk.name.toLowerCase().includes(queryLower) || sk.description.toLowerCase().includes(queryLower)
    );

    return {
      query,
      episodicMatches: matchingEpisodes.length > 0 ? matchingEpisodes : ltm.episodic.slice(0, 2),
      semanticMatches: matchingTriples.length > 0 ? matchingTriples : ltm.semantic.slice(0, 3),
      proceduralSkills: matchingSkills.length > 0 ? matchingSkills : ltm.procedural,
    };
  }

  /**
   * 5.2.4 Deliberative Reasoning: HTN Decomposition & Counterfactual Simulation
   */
  async runCounterfactualAnalysis(objective: string) {
    const ai = getGenAI();
    const state = memoryStore.getGcwState();

    const systemInstruction = `You are Atlas AI's Deliberative Reasoning Engine (Section 5.2.4).
For the given objective, simulate 3 distinct candidate execution trajectories.
For each trajectory, compute:
- candidateAction: string
- simulatedOutcome: string
- riskScore: number (0.0 to 1.0)
- projectedReward: number (0.0 to 1.0)
- selected: boolean (true for the single highest utility trajectory)

Respond in JSON with an array of 3 trajectories named "counterfactuals".`;

    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Simulate counterfactuals for: ${objective}`,
        config: { systemInstruction, responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(resp.text || '{}');
      const simulations: CounterfactualSimulation[] = (parsed.counterfactuals || []).map((cf: any, idx: number) => ({
        id: `cf-${Date.now()}-${idx}`,
        candidateAction: cf.candidateAction || `Strategy ${idx + 1}`,
        simulatedOutcome: cf.simulatedOutcome || `Projected execution outcome`,
        riskScore: cf.riskScore ?? 0.2,
        projectedReward: cf.projectedReward ?? 0.85,
        selected: cf.selected ?? idx === 0,
      }));

      memoryStore.updateGcwState({ counterfactuals: simulations });
      return simulations;
    } catch (err) {
      console.error('Counterfactual simulation failed, using cached templates:', err);
      return state.counterfactuals;
    }
  }

  /**
   * 5.2.6 Meta-Cognitive Controller: Update Persona & Operational Mode
   */
  updateMetaCognitiveSettings(settings: {
    persona?: 'formal_professional' | 'startup_cofounder' | 'creative_strategist' | 'academic_researcher';
    operationalMode?: 'directed' | 'autonomous' | 'collaborative';
    modelTier?: 'Gemini 2.5 Flash (Fast/Cost-Optimized)' | 'Gemini 3.5 Pro (Deep Reasoning)' | 'Llama-3-Local';
  }) {
    const state = memoryStore.getGcwState();
    const currentMeta = state.metaCognitive || {
      persona: 'startup_cofounder',
      operationalMode: 'autonomous',
      resourceAllocation: { cpuUsagePct: 20, tokenBudgetRemaining: 800000, activeModelTier: 'Gemini 3.5 Pro (Deep Reasoning)', estimatedCostUsd: 1.20 },
      globalTaskQueue: [],
      selfEvaluation: { taskSuccessRatePct: 95, userSatisfactionScorePct: 97, efficiencyRatio: 4.5, totalCostSavingsPct: 40 },
      metaReasoning: { isStuck: false, confidenceScore: 0.92, strategyChangesCount: 0 },
    };

    const updatedMeta = {
      ...currentMeta,
      persona: settings.persona || currentMeta.persona,
      operationalMode: settings.operationalMode || currentMeta.operationalMode,
      resourceAllocation: {
        ...currentMeta.resourceAllocation,
        activeModelTier: settings.modelTier || currentMeta.resourceAllocation.activeModelTier,
      },
    };

    memoryStore.updateGcwState({ metaCognitive: updatedMeta });
    return updatedMeta;
  }

  /**
   * 5.6 Operational Walkthrough: Startup Co-Founder Engine (Indian Colleges Textbook Rental)
   */
  async advanceCofounderWalkthrough(targetDay?: number) {
    const state = memoryStore.getGcwState();
    const current = state.cofounderWalkthrough;
    const nextDay = targetDay ?? Math.min(7, (current?.currentDay || 1) + 1);

    const updatedWalkthrough = {
      ...current,
      currentDay: nextDay,
      dailyStandup: {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        yesterdayAccomplished: [
          `Day ${nextDay - 1} Stream 1: Market sizing & competitive vulnerability benchmarks finalized.`,
          `Day ${nextDay - 1} Stream 2: Rendered 10-slide VC Pitch Deck with financial projection models.`,
          `Day ${nextDay - 1} Stream 3: Executed automated integration test suite in containerized sandbox.`,
        ],
        plannedToday: [
          `Day ${nextDay} Task: Simulate 5 multi-tier student personas with willingness-to-pay validation.`,
          `Day ${nextDay} Task: Prepare end-to-end viability dossier and dispatch to Human Approval Center.`,
        ],
        blockers: ['None. Cognitive workers progressing on schedule.'],
      },
    };

    memoryStore.updateGcwState({ cofounderWalkthrough: updatedWalkthrough });
    return updatedWalkthrough;
  }

  /**
   * Execute a complete General Cognitive Worker (GCW) Cycle
   */
  async executeCycle(objective: string) {
    const currentState = memoryStore.getGcwState();
    const workingMemory = currentState.workingMemory || [];

    // 1. Perception Phase: Calculate Attention Weights over Working Memory
    const attendedMemory = this.computeAttentionWeights(objective, workingMemory);

    // 2. Deliberate Planning Phase: Run MCTS Simulation on candidate trajectories
    const candidateActions = [
      `Scan academic and market horizon for "${objective}"`,
      `Execute code sandbox verification for data schemas in "${objective}"`,
      `Traverse Knowledge Workspace graph links for "${objective}"`,
      `Synthesize draft deliverable and queue for peer critique`,
    ];

    const mctsResult = await toolRegistry.runMctsPlanner(objective, candidateActions);
    const chosenAction = mctsResult.data.bestAction.action;

    // 3. Action Execution Phase: Use Gemini to reason deeply and execute
    const ai = getGenAI();
    const persona = currentState.metaCognitive?.persona || 'startup_cofounder';
    const mode = currentState.metaCognitive?.operationalMode || 'autonomous';

    const systemInstruction = `You are Atlas AI's General Cognitive Worker (GCW) Meta-Agent Engine.
Active Persona: ${persona}.
Operational Mode: ${mode} (${mode === 'collaborative' ? 'Offer 3 strategic options/suggestions' : 'Execute autonomously'}).
Your active objective is: "${objective}".
Chosen MCTS Trajectory: "${chosenAction}".
Working Memory Context: ${JSON.stringify(attendedMemory.slice(0, 10))}.

Formulate the next step of execution and select appropriate tools.
Available tools: [searchWebHorizon, codeSandboxRunner, browserActuator, graphReasoner, documentCompiler].

Respond in valid JSON format with keys:
- activeGoal: string
- scratchpadNote: string (detailed step reasoning)
- toolToCall: string | null ("searchWebHorizon" | "codeSandboxRunner" | "browserActuator" | "graphReasoner" | "documentCompiler" | null)
- toolInput: string or object
- requiresApproval: boolean
- newMemoryChunk: { type: string, content: string, confidence: number, source: string } or null
- collaborativeOptions?: string[] (if in collaborative mode)
- finalOutputSummary: string`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Execute GCW cycle for objective: ${objective}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // 4. Tool Execution & Gatekeeping
    let toolResult: any = null;
    let isApprovalTriggered = false;

    if (parsed.toolToCall) {
      if (parsed.requiresApproval || parsed.toolToCall === 'browserActuator') {
        // Gatekeep through Human Approval Center
        const approvalReq = memoryStore.addApproval({
          tenantId: 'tenant-primary',
          userId: 'usr-jun',
          moduleName: 'general_cognitive_worker',
          actionType: parsed.toolToCall,
          payload: { objective, toolInput: parsed.toolInput, selectedTrajectory: chosenAction },
          summary: `GCW Action Authorization: Execute ${parsed.toolToCall} for "${objective.substring(0, 50)}..."`,
          riskLevel: 'high',
          status: 'pending',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        });

        isApprovalTriggered = true;
        toolResult = {
          status: 'QUEUED_FOR_APPROVAL',
          approvalId: approvalReq.id,
          message: 'Action placed in Cryptographic Human Approval Center queue awaiting signature.',
        };
      } else {
        // Directly execute tool
        switch (parsed.toolToCall) {
          case 'searchWebHorizon':
            toolResult = await toolRegistry.searchWebHorizon(
              typeof parsed.toolInput === 'string' ? parsed.toolInput : objective
            );
            break;

          case 'codeSandboxRunner':
            toolResult = await toolRegistry.codeSandboxRunner(
              typeof parsed.toolInput === 'string' ? parsed.toolInput : 'console.log("Verified execution");'
            );
            break;

          case 'graphReasoner':
            toolResult = await toolRegistry.graphReasoner(
              typeof parsed.toolInput === 'string' ? parsed.toolInput : 'AI'
            );
            break;

          case 'documentCompiler':
            toolResult = await toolRegistry.documentCompiler(
              typeof parsed.toolInput === 'string' ? parsed.toolInput : '\\documentclass{article}\\begin{document}Hello\\end{document}'
            );
            break;

          default:
            toolResult = { status: 'COMPLETED', details: 'Direct cognitive inference.' };
            break;
        }
      }
    }

    // 5. Memory Update & Reflection Phase
    if (parsed.newMemoryChunk) {
      memoryStore.addMemoryChunk({
        type: parsed.newMemoryChunk.type || 'observation',
        content: parsed.newMemoryChunk.content,
        confidence: parsed.newMemoryChunk.confidence || 0.95,
        source: parsed.newMemoryChunk.source || 'GCW Cognitive Inference',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        relevance: 1.0,
      });
    }

    // Record Action Dispatcher Audit Log
    const prevHash = currentState.dispatcherLogs?.[0]?.sha256Hash || '0000000000000000000000000000000000000000000000000000000000000000';
    const logId = `log-${Date.now()}`;
    const logData = `${logId}:${parsed.toolToCall || 'DeliberativeReasoning'}:${Date.now()}:${prevHash}`;
    const logHash = crypto.createHash('sha256').update(logData).digest('hex');

    const newDispatcherLog: ActionDispatcherLog = {
      id: logId,
      toolName: parsed.toolToCall || 'deliberativeReasoning',
      parameters: typeof parsed.toolInput === 'object' ? parsed.toolInput : { input: parsed.toolInput || objective },
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMs: 1850,
      status: isApprovalTriggered ? 'PENDING_APPROVAL' : 'SUCCESS',
      resultSummary: toolResult?.actionSummary || parsed.finalOutputSummary || 'Executed successfully',
      sha256Hash: logHash,
      prevHash,
    };

    // Record Sense-Plan-Act Cycle
    const newCycle: SensePlanActReflectCycle = {
      cycleIndex: (currentState.sensePlanActCycles?.length || 0) + 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      senseSummary: `Observed objective: ${objective.slice(0, 80)}...`,
      formulatedPlan: [chosenAction, parsed.scratchpadNote?.slice(0, 80) || 'Formulated next execution step'],
      executedAction: parsed.toolToCall ? `Tool: ${parsed.toolToCall}` : 'Cognitive Inference',
      reflectionNotes: parsed.finalOutputSummary || 'Cycle completed with verified convergence.',
      scratchpadText: parsed.scratchpadNote || `Evaluated MCTS trajectory: ${chosenAction}`,
    };

    const updatedState = memoryStore.updateGcwState({
      activeGoal: parsed.activeGoal || objective,
      currentPhase: isApprovalTriggered ? 'Action Execution' : 'Reflection',
      scratchpad: [...currentState.scratchpad, parsed.scratchpadNote || `Evaluated MCTS trajectory: ${chosenAction}`].slice(-20),
      actionLogs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          action: parsed.toolToCall ? `Tool: ${parsed.toolToCall}` : 'Deliberative Reasoning',
          result: isApprovalTriggered
            ? 'Queued in Human Approval Center'
            : toolResult?.actionSummary || parsed.finalOutputSummary || 'Cycle completed',
        },
        ...currentState.actionLogs,
      ].slice(0, 30),
      dispatcherLogs: [newDispatcherLog, ...(currentState.dispatcherLogs || [])].slice(0, 30),
      sensePlanActCycles: [newCycle, ...(currentState.sensePlanActCycles || [])].slice(0, 20),
    });

    return {
      success: true,
      objective,
      chosenMctsTrajectory: chosenAction,
      gcwState: updatedState,
      toolResult,
      approvalQueued: isApprovalTriggered,
      inferenceResult: parsed,
    };
  }
}

export const gcwEngine = new GeneralCognitiveWorkerEngine();

