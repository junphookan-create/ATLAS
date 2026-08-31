import {
  SystemAgentStatus,
  LiveStreamEvent,
  TimelineTaskHorizon,
  DashboardKPISummary,
  CommandBarActionIntent,
} from '../types/index.js';

export class ExecutiveDashboardEngine {
  private static instance: ExecutiveDashboardEngine;

  private agentStatuses: SystemAgentStatus[] = [
    {
      moduleId: 'grant_writer',
      moduleName: 'Grant Writer Studio',
      status: 'active',
      activeWorkers: 4,
      maxWorkers: 8,
      cpuUsagePct: 42,
      memoryUsageMb: 850,
      tokenConsumptionRate: 14200,
      avgLatencyMs: 620,
      lastHeartbeat: new Date().toISOString(),
      currentTaskSummary: 'Critique & refinement iteration on NSF Cyber-Physical proposal Section 3.2',
      errorBudgetRemainingPct: 99.4,
    },
    {
      moduleId: 'opportunity_discovery',
      moduleName: 'Opportunity Horizon Scanner',
      status: 'active',
      activeWorkers: 6,
      maxWorkers: 12,
      cpuUsagePct: 68,
      memoryUsageMb: 1240,
      tokenConsumptionRate: 28500,
      avgLatencyMs: 430,
      lastHeartbeat: new Date().toISOString(),
      currentTaskSummary: 'Scanning EU Horizon Europe, DARPA Young Faculty Award & Schmidt Sciences RSS',
      errorBudgetRemainingPct: 98.8,
    },
    {
      moduleId: 'ai_research_lab',
      moduleName: 'AI Research Lab & Model Router',
      status: 'active',
      activeWorkers: 8,
      maxWorkers: 16,
      cpuUsagePct: 75,
      memoryUsageMb: 2100,
      tokenConsumptionRate: 64200,
      avgLatencyMs: 380,
      lastHeartbeat: new Date().toISOString(),
      currentTaskSummary: 'Dynamic cost-latency routing across Claude 3.5, Gemini 3.1 Pro & DeepSeek V3',
      errorBudgetRemainingPct: 99.9,
    },
    {
      moduleId: 'browser_agent',
      moduleName: 'Autonomous Browser Agent',
      status: 'active',
      activeWorkers: 3,
      maxWorkers: 6,
      cpuUsagePct: 54,
      memoryUsageMb: 1680,
      tokenConsumptionRate: 18400,
      avgLatencyMs: 1450,
      lastHeartbeat: new Date().toISOString(),
      currentTaskSummary: 'Stealth headless portal session preparing Devpost neuromorphic hackathon registration',
      errorBudgetRemainingPct: 97.2,
    },
    {
      moduleId: 'project_builder',
      moduleName: 'Autonomous Project Builder',
      status: 'active',
      activeWorkers: 2,
      maxWorkers: 4,
      cpuUsagePct: 61,
      memoryUsageMb: 1450,
      tokenConsumptionRate: 22100,
      avgLatencyMs: 910,
      lastHeartbeat: new Date().toISOString(),
      currentTaskSummary: 'Running pytest verification in sandboxed Docker container for sparse attention kernel',
      errorBudgetRemainingPct: 99.1,
    },
    {
      moduleId: 'essay_architect',
      moduleName: 'Social Media & Essay Architect',
      status: 'active',
      activeWorkers: 3,
      maxWorkers: 6,
      cpuUsagePct: 35,
      memoryUsageMb: 720,
      tokenConsumptionRate: 16800,
      avgLatencyMs: 540,
      lastHeartbeat: new Date().toISOString(),
      currentTaskSummary: 'Synthesizing admissions review panel critique for Common App Metaphor arc',
      errorBudgetRemainingPct: 99.8,
    },
    {
      moduleId: 'outreach_manager',
      moduleName: 'Strategic Outreach & CRM',
      status: 'idle',
      activeWorkers: 1,
      maxWorkers: 5,
      cpuUsagePct: 18,
      memoryUsageMb: 420,
      tokenConsumptionRate: 4100,
      avgLatencyMs: 310,
      lastHeartbeat: new Date().toISOString(),
      currentTaskSummary: 'Waiting for HITL approval signature on 3 academic collaboration invitations',
      errorBudgetRemainingPct: 100.0,
    },
    {
      moduleId: 'general_cognitive_worker',
      moduleName: 'GCW Meta-Cognitive Engine',
      status: 'active',
      activeWorkers: 5,
      maxWorkers: 10,
      cpuUsagePct: 82,
      memoryUsageMb: 1890,
      tokenConsumptionRate: 45000,
      avgLatencyMs: 780,
      lastHeartbeat: new Date().toISOString(),
      currentTaskSummary: 'Deliberative dual-process tree-of-thought scheduling cross-module priorities',
      errorBudgetRemainingPct: 99.6,
    },
  ];

  private liveEvents: LiveStreamEvent[] = [
    {
      id: 'evt-101',
      timestamp: new Date(Date.now() - 45000).toISOString(),
      sourceModule: 'opportunity_discovery',
      severity: 'success',
      eventType: 'milestone_completed',
      message: 'Discovered high-impact $150,000 Hertz Foundation Graduate Fellowship opportunity matching 94.8% profile.',
      metadata: { relevance: 0.948, funding: '$150,000', deadline: '2026-10-28' },
    },
    {
      id: 'evt-102',
      timestamp: new Date(Date.now() - 32000).toISOString(),
      sourceModule: 'grant_writer',
      severity: 'info',
      eventType: 'agent_action',
      message: 'Automated Red Team critique completed for NSF Proposal Section 2 (Innovation & Impact): Score 9.4/10.',
      metadata: { score: 9.4, iterations: 4 },
    },
    {
      id: 'evt-103',
      timestamp: new Date(Date.now() - 21000).toISOString(),
      sourceModule: 'browser_agent',
      severity: 'warning',
      eventType: 'hitl_approval_required',
      message: 'Form submission intercepted: Neuromorphic Computing Challenge portal form pre-filled and halted at final submit step.',
      requiresAck: true,
      acknowledged: false,
      metadata: { riskLevel: 'medium', approvalId: 'apr-browser-771' },
    },
    {
      id: 'evt-104',
      timestamp: new Date(Date.now() - 11000).toISOString(),
      sourceModule: 'ai_research_lab',
      severity: 'info',
      eventType: 'decision_logged',
      message: 'Model Router rerouted 4,200 tokens from Claude 3.5 Sonnet to Gemini 3.6 Flash (Cache Hit 91.2%, saved $0.048).',
      metadata: { latencySavingsMs: 540 },
    },
    {
      id: 'evt-105',
      timestamp: new Date(Date.now() - 4000).toISOString(),
      sourceModule: 'essay_architect',
      severity: 'success',
      eventType: 'decision_logged',
      message: 'Simulated Admissions Panel rated central metaphor "Jazz Quintet & Sparse FPGA Timing" with 9.6/10 Authenticity.',
      metadata: { deanScore: 9.6, antiAiScore: 99.2 },
    },
  ];

  private timelineTasks: TimelineTaskHorizon[] = [
    {
      id: 'task-nsf-grant',
      title: 'NSF Cyber-Physical Systems Large Proposal ($500k)',
      category: 'Grant',
      priority: 'urgent',
      progressPct: 82,
      startDate: '2026-03-01',
      dueDate: '2026-04-15',
      assignedAgent: 'Grant Writer Studio + GCW',
      status: 'on_track',
      estimatedRemainingHours: 14,
      dependentTaskIds: ['task-collab-pi'],
    },
    {
      id: 'task-neuromorphic-comp',
      title: 'Global Neuromorphic AI Hackathon & Benchmark ($75k)',
      category: 'Competition',
      priority: 'high',
      progressPct: 65,
      startDate: '2026-03-10',
      dueDate: '2026-04-02',
      assignedAgent: 'Browser Agent + Project Builder',
      status: 'at_risk',
      bottleneckWarning: 'Pending human cryptographic signature on final portal submission',
      estimatedRemainingHours: 8,
    },
    {
      id: 'task-essay-commonapp',
      title: 'Common App Personal Statement (The Jazz & FPGA Metaphor)',
      category: 'Essay',
      priority: 'high',
      progressPct: 90,
      startDate: '2026-03-05',
      dueDate: '2026-04-10',
      assignedAgent: 'Essay Architect & Admissions Simulator',
      status: 'on_track',
      estimatedRemainingHours: 4,
    },
    {
      id: 'task-hertz-fellowship',
      title: 'Hertz Foundation Fellowship Application Drafting',
      category: 'Research',
      priority: 'medium',
      progressPct: 35,
      startDate: '2026-03-15',
      dueDate: '2026-05-01',
      assignedAgent: 'Research Scientist + Knowledge Workspace',
      status: 'on_track',
      estimatedRemainingHours: 28,
    },
    {
      id: 'task-collab-pi',
      title: 'Prof. Marcus Vance (MIT CSAIL) Collaborative Endorsement',
      category: 'Outreach',
      priority: 'medium',
      progressPct: 50,
      startDate: '2026-03-12',
      dueDate: '2026-03-30',
      assignedAgent: 'Outreach Manager',
      status: 'on_track',
      estimatedRemainingHours: 6,
    },
  ];

  public static getInstance(): ExecutiveDashboardEngine {
    if (!ExecutiveDashboardEngine.instance) {
      ExecutiveDashboardEngine.instance = new ExecutiveDashboardEngine();
    }
    return ExecutiveDashboardEngine.instance;
  }

  public getAgentStatuses(): SystemAgentStatus[] {
    // Refresh timestamps slightly for realism
    return this.agentStatuses.map((s) => ({
      ...s,
      lastHeartbeat: new Date().toISOString(),
    }));
  }

  public getLiveEvents(): LiveStreamEvent[] {
    return this.liveEvents;
  }

  public addLiveEvent(event: Omit<LiveStreamEvent, 'id' | 'timestamp'>): LiveStreamEvent {
    const newEvent: LiveStreamEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.liveEvents.unshift(newEvent);
    if (this.liveEvents.length > 50) {
      this.liveEvents.pop();
    }
    return newEvent;
  }

  public getTimelineTasks(): TimelineTaskHorizon[] {
    return this.timelineTasks;
  }

  public updateTimelineTask(id: string, updates: Partial<TimelineTaskHorizon>): TimelineTaskHorizon | null {
    const task = this.timelineTasks.find((t) => t.id === id);
    if (!task) return null;
    Object.assign(task, updates);
    return task;
  }

  public getKPISummary(): DashboardKPISummary {
    return {
      totalOpportunitiesDiscovered: 48,
      opportunitiesValueEstimate: '$1,850,000',
      grantsPipelineValue: '$650,000',
      competitionsActiveCount: 7,
      pendingApprovalsCount: 3,
      autonomousActionsPast24h: 342,
      computeTokensConsumedToday: 1248000,
      totalEstimatedSavingsUsd: 184.60,
      systemReliabilityScore: 99.8,
      overallSprintVelocity: 92.4,
    };
  }

  public parseAndExecuteCommand(command: string): CommandBarActionIntent {
    const lower = command.toLowerCase().trim();

    if (lower.includes('prioritize') || lower.includes('priority') || lower.includes('shift compute')) {
      return {
        rawQuery: command,
        parsedIntent: 'adjust_priority',
        targetModule: lower.includes('grant') ? 'grant_writer' : lower.includes('essay') ? 'essay_architect' : 'general_cognitive_worker',
        actionSummary: `Allocated maximum priority & worker pool quota to ${lower.includes('grant') ? 'Grant Writer Studio' : 'Active Critical Workflows'}.`,
        confidence: 0.96,
        suggestedActionPayload: {
          priorityMultiplier: 2.0,
          workerReallocation: { from: 'side_hustle_scraper', to: 'grant_writer', workerDelta: +3 },
        },
        executionStatus: 'executed',
        executionResultText: `Atlas successfully adjusted system priorities. +3 worker threads assigned to priority pipeline.`,
      };
    }

    if (lower.includes('approve') || lower.includes('sign') || lower.includes('authorize')) {
      return {
        rawQuery: command,
        parsedIntent: 'grant_approval',
        targetModule: 'approval_center',
        actionSummary: 'Pre-flight check verified; escalated to cryptographic HITL signature modal.',
        confidence: 0.94,
        executionStatus: 'requires_hitl',
        executionResultText: 'Approval payload staged with SHA-256 integrity hash. Awaiting biometric/PIN signature.',
      };
    }

    if (lower.includes('status') || lower.includes('health') || lower.includes('metrics')) {
      return {
        rawQuery: command,
        parsedIntent: 'query_status',
        targetModule: 'executive_dashboard',
        actionSummary: 'Queried real-time telemetry across all 20 Atlas autonomous engines.',
        confidence: 0.98,
        executionStatus: 'executed',
        executionResultText: 'All sub-modules operational. Global error budget: 99.6%. 3 pending approval gates active.',
      };
    }

    if (lower.includes('essay') || lower.includes('metaphor') || lower.includes('admissions')) {
      return {
        rawQuery: command,
        parsedIntent: 'trigger_workflow',
        targetModule: 'essay_architect',
        actionSummary: 'Triggered Admissions Officer simulation & burstiness humanizer audit on current draft.',
        confidence: 0.95,
        executionStatus: 'executed',
        executionResultText: 'Essay Architect executed 3-person admissions committee review. Composite score: 9.5/10.',
      };
    }

    return {
      rawQuery: command,
      parsedIntent: 'general_directive',
      targetModule: 'general_cognitive_worker',
      actionSummary: `Processed autonomous directive: "${command}" through GCW meta-planner.`,
      confidence: 0.88,
      executionStatus: 'executed',
      executionResultText: `Directive decomposed into 3 sub-tasks and queued into Celery asynchronous task stream.`,
    };
  }
}

export const executiveDashboardEngine = ExecutiveDashboardEngine.getInstance();
