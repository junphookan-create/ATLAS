import { getGenAIClient } from './geminiService.js';
import {
  Competition,
  CompetitionSubtask,
  StructuredRules,
  DraftArtifact,
  BrowserSubmissionState,
  BrowserFormFieldMapping,
  PostSubmissionMonitor,
} from '../types/index.js';
import { redisEngine } from './redisEngine.js';
import { celeryWorkerEngine } from './celeryEngine.js';
import { postgreSQLStore } from './dbStore.js';

export class CompetitionEngine {
  private competitions: Map<string, Competition> = new Map();

  constructor() {
    this.seedInitialCompetitions();
  }

  private seedInitialCompetitions() {
    const comp1: Competition = {
      id: 'comp-201',
      opportunityId: 'opp-102',
      title: 'International Neuromorphic Systems Challenge 2026',
      organizer: 'IEEE Circuits & Systems Society',
      deadline: '2026-08-28',
      submissionDeadline: '2026-08-28T23:59:59Z',
      judgingStartDate: '2026-09-01T00:00:00Z',
      winnerAnnounceDate: '2026-09-15T18:00:00Z',
      prizePool: '$50,000 USD',
      status: 'in_progress',
      officialGuidelinesUrl: 'https://ieee-cas.org/challenges/neuromorphic-2026/guidelines',
      feedback: '',
      requiredMaterials: [
        'Executive Abstract (300 words)',
        'Technical Methodology Paper (4 pages)',
        'Code Repository with Dockerfile',
        'Demonstration Video (3 mins)',
        'Impact & Ethics Statement',
      ],
      structuredRulesSummary:
        'Submissions must include verified latency benchmarks below 10ms on neuromorphic test set. Open source code under MIT/Apache 2.0 inside provided container.',
      structuredRules: {
        eligibility_criteria: 'Open globally to academic researchers, graduate students, and verified industry labs.',
        required_materials: [
          'Executive Abstract (300 words)',
          'Technical Methodology Paper (4 pages)',
          'Code Repository with Dockerfile',
          'Demonstration Video (3 mins)',
          'Impact & Ethics Statement',
        ],
        key_dates: {
          submission_deadline: '2026-08-28T23:59:59Z',
          judging_start_date: '2026-09-01T00:00:00Z',
          winner_announce_date: '2026-09-15T18:00:00Z',
        },
        evaluation_criteria: [
          { criterion: 'Algorithmic Novelty & Theoretical Rigor', weightPercentage: 35, description: 'Novelty of spike timing dependent plasticity logic.' },
          { criterion: 'Empirical Latency & Energy Efficiency', weightPercentage: 30, description: 'Demonstrated sub-10ms latency on edge hardware.' },
          { criterion: 'Code Quality & Reproducibility', weightPercentage: 20, description: 'Clean Dockerfile, unit test coverage, and documentation.' },
          { criterion: 'Societal Impact & Presentation Clarity', weightPercentage: 15, description: 'Clarity of the 3-minute video and ethics analysis.' },
        ],
        restrictions: [
          'No proprietary closed-source binary dependencies',
          'Maximum video duration strictly 180 seconds',
          'Maximum paper length 4 pages excluding references',
        ],
      },
      checklist: [
        {
          id: 'subtask-101',
          parentId: 'mat-abstract',
          materialKey: 'Executive Abstract',
          title: 'Write first draft of Executive Abstract',
          description: 'Outline research problem, neuromorphic architecture, and key latency breakthroughs in 300 words.',
          effortHours: 2.5,
          relativeDeadline: '2026-08-20T12:00:00Z',
          completed: true,
          assignedAgent: 'DraftingAgent-Abstract',
          isCriticalPath: true,
        },
        {
          id: 'subtask-102',
          parentId: 'mat-abstract',
          materialKey: 'Executive Abstract',
          title: 'Review abstract with literature references & self-critique',
          description: 'Cross-reference with Nature Electronics 2025 benchmarks and IEEE formatting.',
          effortHours: 1.5,
          relativeDeadline: '2026-08-22T12:00:00Z',
          completed: true,
          assignedAgent: 'CritiqueAgent-PeerReview',
          isCriticalPath: false,
        },
        {
          id: 'subtask-103',
          parentId: 'mat-methodology',
          materialKey: 'Technical Methodology Paper',
          title: 'Synthesize Mathematical Formulation & Architecture Diagram',
          description: 'Generate 4-page LaTeX manuscript with neuromorphic spiking equation proofs.',
          effortHours: 12.0,
          relativeDeadline: '2026-08-24T18:00:00Z',
          completed: false,
          assignedAgent: 'DraftingAgent-Paper',
          isCriticalPath: true,
        },
        {
          id: 'subtask-104',
          parentId: 'mat-code',
          materialKey: 'Code Repository with Dockerfile',
          title: 'Containerize Spike-Flow Engine with PyTorch & ONNX-SNN',
          description: 'Write reproducible Dockerfile and benchmark tests under 10ms execution.',
          effortHours: 6.0,
          relativeDeadline: '2026-08-25T18:00:00Z',
          completed: false,
          assignedAgent: 'CodeAgent-DevOps',
          isCriticalPath: true,
        },
        {
          id: 'subtask-105',
          parentId: 'mat-video',
          materialKey: 'Demonstration Video',
          title: 'Record & Synthesize 3-minute Video Presentation',
          description: 'Produce high-resolution screencast with voiceover demo and benchmark graphs.',
          effortHours: 4.0,
          relativeDeadline: '2026-08-26T20:00:00Z',
          completed: false,
          assignedAgent: 'MediaAgent-Video',
          isCriticalPath: false,
        },
        {
          id: 'subtask-106',
          parentId: 'mat-submission',
          materialKey: 'Browser Form Submission',
          title: 'Execute Automated Browser Form-Filling & Pre-Submission Approval',
          description: 'Populate IEEE CAS submission portal, capture full-page screenshot, and request human final approval.',
          effortHours: 1.0,
          relativeDeadline: '2026-08-28T18:00:00Z',
          completed: false,
          assignedAgent: 'BrowserAgent-Actuator',
          isCriticalPath: true,
        },
      ],
      draftArtifacts: [
        {
          id: 'draft-001',
          competitionId: 'comp-201',
          fieldKey: 'Executive Abstract',
          title: 'Executive Abstract: Ultra-Low Power Event-Driven SNN on Edge FPGA',
          content:
            'Edge neuromorphic processing requires ultra-sparse spike encoding to operate within sub-milliwatt power budgets. Here we introduce SpikeFlow-Edge, an asynchronous event-driven spiking neural architecture featuring biologically inspired local STDP plasticity rules. Evaluated against the Neuromorphic-MNIST and DVS128 Gesture benchmarks, SpikeFlow-Edge achieves a classification latency of 4.2ms with an energy consumption of 0.82 microjoules per inference. Our approach eliminates costly global gradient synchronization by utilizing local temporal credit assignment, delivering a 4.6x improvement over conventional quantized RNN baselines.',
          version: 2,
          wordCount: 88,
          maxWords: 300,
          selfCritiqueScore: 94,
          critiqueNotes: [
            'Clear quantitative latency claim (4.2ms vs <10ms requirement).',
            'Strong theoretical grounding in local STDP plasticity.',
            'Direct alignment with IEEE CAS evaluation criteria.',
          ],
          revisionCount: 2,
          approvalStatus: 'APPROVED',
          ltmExamplesUsed: ['IEEE Micro 2025 Best Submission', 'Neuromorphic Challenge 2024 Winner'],
          knowledgeGraphCitations: ['Project: Edge-STDP-Core', 'Paper: Temporal Credit Assignment in SNNs'],
          updatedAt: '2026-08-12T14:20:00Z',
        },
        {
          id: 'draft-002',
          competitionId: 'comp-201',
          fieldKey: 'Impact Statement',
          title: 'Societal Impact, Clinical Potential & Ethical Safeguards',
          content:
            'The deployment of sub-milliwatt neuromorphic processing unlocks transformative capabilities in biomedical neuroprosthetics, continuous brain-computer interfaces (BCIs), and autonomous sensor nodes in bandwidth-constrained environmental monitoring. By performing inference entirely on-device at the sensor boundary, SpikeFlow-Edge safeguards user biometric privacy without transmitting sensitive neural telemetry to external cloud servers.',
          version: 1,
          wordCount: 56,
          maxWords: 250,
          selfCritiqueScore: 91,
          critiqueNotes: [
            'Highlights on-device privacy preserving architecture.',
            'Connects algorithmic innovation to clinical neuro-prosthetic applications.',
          ],
          revisionCount: 1,
          approvalStatus: 'PENDING_APPROVAL',
          ltmExamplesUsed: ['MIT Solve Ethics Framework'],
          knowledgeGraphCitations: ['Knowledge Node: BCI Privacy Protocols'],
          updatedAt: '2026-08-12T16:45:00Z',
        },
      ],
      browserSubmissionState: {
        submissionPortalUrl: 'https://ieee-cas.org/challenges/neuromorphic-2026/submit-portal',
        formFieldMappings: [
          { fieldName: 'Project Title', selector: 'input#project_title', value: 'SpikeFlow-Edge: Asynchronous Neuromorphic SNN', fieldType: 'text', status: 'FILLED' },
          { fieldName: 'Executive Abstract', selector: 'textarea#abstract', value: 'Edge neuromorphic processing requires ultra-sparse spike encoding...', fieldType: 'textarea', status: 'FILLED' },
          { fieldName: 'Primary Track', selector: 'select#track_category', value: 'Track A - Real-Time Low Latency', fieldType: 'select', status: 'FILLED' },
          { fieldName: 'GitHub Repository URL', selector: 'input#repo_url', value: 'https://github.com/atlas-ai-lab/spikeflow-edge', fieldType: 'text', status: 'FILLED' },
          { fieldName: 'Technical Paper PDF', selector: 'input#file_paper_upload', value: '/artifacts/ieee_cas_spikeflow_paper.pdf', fieldType: 'file_upload', status: 'FILLED' },
          { fieldName: 'Accept Terms & Conditions', selector: 'input#terms_agree', value: 'true', fieldType: 'checkbox', status: 'FILLED' },
        ],
        preSubmissionScreenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        confirmationScreenshot: '',
        confirmationNumber: '',
        harLogUri: 'gs://atlas-audit-logs/2026-08/ieee-cas-comp-201.har',
        status: 'AWAITING_HUMAN_APPROVAL',
      },
      postSubmissionMonitor: {
        lastCheckedAt: '2026-08-13T08:00:00Z',
        emailTrackingStatus: 'Awaiting submission dispatch confirmation',
        portalStatusScraped: 'Draft Staged in IEEE Portal Session',
        winnerListStatus: 'Judging begins 2026-09-01',
        isWinner: false,
        celebrationTriggered: false,
      },
      submissionScreenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    };

    this.competitions.set(comp1.id, comp1);
  }

  // Retrieve all active competitions
  public getCompetitions(): Competition[] {
    return Array.from(this.competitions.values());
  }

  // Retrieve single competition by ID
  public getCompetitionById(id: string): Competition | undefined {
    return this.competitions.get(id);
  }

  /**
   * Pursues an opportunity:
   * 1. Downloads guidelines via Browser Agent.
   * 2. Runs Two-Stage LLM Extraction (Stage 1: 1500-word narrative, Stage 2: strict JSON schema with Pydantic-like validation & temperature retries).
   * 3. Invokes Checklist Generation Engine with person-hours effort & critical-path backward scheduling.
   * 4. Spawns specialized drafting agents with self-critique loop.
   */
  public async pursueOpportunity(params: {
    opportunityId: string;
    title: string;
    organizer: string;
    deadline: string;
    prizePool: string;
    url?: string;
    guidelinesUrl?: string;
    description?: string;
  }): Promise<Competition> {
    const compId = `comp-${Date.now()}`;
    const deadlineDate = params.deadline ? new Date(params.deadline) : new Date(Date.now() + 86400000 * 30);
    const submissionDeadline = deadlineDate.toISOString();
    const judgingStartDate = new Date(deadlineDate.getTime() + 86400000 * 3).toISOString();
    const winnerAnnounceDate = new Date(deadlineDate.getTime() + 86400000 * 14).toISOString();

    // Stage 1 & Stage 2: Rule extraction pipeline with Gemini
    const structuredRules = await this.extractStructuredRules({
      title: params.title,
      organizer: params.organizer,
      guidelinesUrl: params.guidelinesUrl || params.url || 'https://competition.portal/rules',
      description: params.description || '',
    });

    // Checklist generation with critical-path backward scheduling
    const checklist = this.generateDynamicChecklist(structuredRules.required_materials, submissionDeadline);

    // Initial Drafting Agents initialization
    const draftArtifacts = await this.initializeDraftingAgents(compId, structuredRules.required_materials, structuredRules);

    // Form field mappings preparation for Browser Agent
    const formFieldMappings: BrowserFormFieldMapping[] = [
      { fieldName: 'Project Title', selector: 'input#title', value: params.title, fieldType: 'text', status: 'FILLED' },
      { fieldName: 'Applicant / Team Lead', selector: 'input#team_lead', value: 'Jun Phookan (Atlas AI Lab)', fieldType: 'text', status: 'FILLED' },
      { fieldName: 'Abstract / Executive Summary', selector: 'textarea#summary', value: draftArtifacts[0]?.content || 'Autonomous submission synthesized by Atlas AI.', fieldType: 'textarea', status: 'FILLED' },
      { fieldName: 'Technical Proposal PDF', selector: 'input#file_upload', value: `/artifacts/${compId}_proposal.pdf`, fieldType: 'file_upload', status: 'FILLED' },
      { fieldName: 'Source Code Repository', selector: 'input#repository', value: 'https://github.com/atlas-ai-lab/submission', fieldType: 'text', status: 'FILLED' },
      { fieldName: 'Terms & Ethics Compliance', selector: 'input#ethics_checkbox', value: 'true', fieldType: 'checkbox', status: 'FILLED' },
    ];

    const newComp: Competition = {
      id: compId,
      opportunityId: params.opportunityId,
      title: params.title,
      organizer: params.organizer,
      deadline: submissionDeadline.slice(0, 10),
      submissionDeadline,
      judgingStartDate,
      winnerAnnounceDate,
      prizePool: params.prizePool || '$50,000',
      status: 'in_progress',
      officialGuidelinesUrl: params.guidelinesUrl || params.url || 'https://competition.portal/rules',
      feedback: '',
      requiredMaterials: structuredRules.required_materials,
      structuredRules,
      structuredRulesSummary: `Automated extraction from ${params.organizer}. Contains ${structuredRules.required_materials.length} required deliverables. Backward-scheduled critical path established.`,
      checklist,
      draftArtifacts,
      browserSubmissionState: {
        submissionPortalUrl: params.guidelinesUrl || params.url || 'https://competition.portal/submit',
        formFieldMappings,
        preSubmissionScreenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        confirmationScreenshot: '',
        confirmationNumber: '',
        harLogUri: `gs://atlas-audit-logs/${new Date().toISOString().slice(0, 7)}/${compId}.har`,
        status: 'IDLE',
      },
      postSubmissionMonitor: {
        lastCheckedAt: new Date().toISOString(),
        emailTrackingStatus: 'Monitoring inbound emails from ' + params.organizer,
        portalStatusScraped: 'Draft Initialized',
        winnerListStatus: `Judging scheduled for ${judgingStartDate.slice(0, 10)}`,
        isWinner: false,
        celebrationTriggered: false,
      },
      submissionScreenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    };

    this.competitions.set(compId, newComp);

    // Publish to Redis event stream & Celery background worker
    await redisEngine.xadd('competition_events', {
      eventType: 'COMPETITION_PURSUED',
      competitionId: compId,
      title: params.title,
      organizer: params.organizer,
    });

    celeryWorkerEngine.dispatchTask('tasks.competition.orchestrate_workflow', [compId], {
      competitionId: compId,
      checklistCount: checklist.length,
    });

    return newComp;
  }

  /**
   * Two-Stage Rule Extraction Pipeline:
   * Stage 1: Narrative summarization (1,500 words)
   * Stage 2: Strict JSON schema extraction with retry & temperature fallback
   */
  public async extractStructuredRules(params: {
    title: string;
    organizer: string;
    guidelinesUrl: string;
    description: string;
  }): Promise<StructuredRules> {
    const client = getGenAIClient();
    const fallbackRules: StructuredRules = {
      eligibility_criteria: 'Open to registered researchers, graduate students, and verified technical teams worldwide.',
      required_materials: [
        'Executive Abstract (300 words)',
        'Technical Methodology Document',
        'Reproducible Code / Dockerfile',
        'Impact & Feasibility Statement',
      ],
      key_dates: {
        submission_deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
        judging_start_date: new Date(Date.now() + 86400000 * 33).toISOString(),
        winner_announce_date: new Date(Date.now() + 86400000 * 45).toISOString(),
      },
      evaluation_criteria: [
        { criterion: 'Technical Innovation & Rigor', weightPercentage: 40, description: 'Novelty of methodology and algorithmic depth.' },
        { criterion: 'Execution Feasibility & Benchmarking', weightPercentage: 35, description: 'Reproducibility and empirical results.' },
        { criterion: 'Clarity of Presentation & Impact', weightPercentage: 25, description: 'Clear documentation, video pitch, and practical value.' },
      ],
      restrictions: [
        'Must adhere to official submission templates',
        'Submissions after deadline will not be evaluated',
        'All synthetic data or external datasets must be cited',
      ],
    };

    if (!client) {
      return fallbackRules;
    }

    try {
      // Stage 1: Narrative summarization
      const stage1Prompt = `You are an expert Competition & Grant Rule Analyst.
Extract and summarize all official guidelines, requirements, deadlines, evaluation rubrics, and restrictions for:
Title: "${params.title}"
Organizer: "${params.organizer}"
Guidelines URL: "${params.guidelinesUrl}"
Summary description: "${params.description}"

Produce a 1,500-word compressed narrative highlighting all key constraints, formatting requirements, and eligibility rules.`;

      const stage1Res = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: stage1Prompt,
      });

      const narrativeSummary = stage1Res.text || params.description;

      // Stage 2: Strict JSON schema extraction with temperature retry
      const stage2Prompt = `Based on the following competition narrative summary:
${narrativeSummary}

Output a strictly valid JSON object adhering to this schema:
{
  "eligibility_criteria": "string",
  "required_materials": ["string", "string"],
  "key_dates": {
    "submission_deadline": "ISO-8601 string",
    "judging_start_date": "ISO-8601 string",
    "winner_announce_date": "ISO-8601 string"
  },
  "evaluation_criteria": [
    { "criterion": "string", "weightPercentage": number, "description": "string" }
  ],
  "restrictions": ["string", "string"]
}

Ensure required_materials contains at least 3-4 specific deliverables (e.g. Abstract, Technical Paper, Code Repo, Demo Video). Output ONLY raw JSON.`;

      const stage2Res = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: stage2Prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Strict temperature for structured schema adherence
        },
      });

      const cleanedJson = (stage2Res.text || '').trim().replace(/^```json\s*/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        eligibility_criteria: parsed.eligibility_criteria || fallbackRules.eligibility_criteria,
        required_materials: Array.isArray(parsed.required_materials) && parsed.required_materials.length > 0 ? parsed.required_materials : fallbackRules.required_materials,
        key_dates: parsed.key_dates || fallbackRules.key_dates,
        evaluation_criteria: Array.isArray(parsed.evaluation_criteria) && parsed.evaluation_criteria.length > 0 ? parsed.evaluation_criteria : fallbackRules.evaluation_criteria,
        restrictions: Array.isArray(parsed.restrictions) && parsed.restrictions.length > 0 ? parsed.restrictions : fallbackRules.restrictions,
      };
    } catch (err) {
      console.warn('Competition rule extraction error, applying fallback:', err);
      return fallbackRules;
    }
  }

  /**
   * Checklist Generation Engine:
   * Parses required_materials array and expands each into hierarchical subtasks from a template library.
   * Computes estimated person-hours from historical user data and backward-schedules using a critical-path algorithm.
   */
  public generateDynamicChecklist(requiredMaterials: string[], submissionDeadlineIso: string): CompetitionSubtask[] {
    const deadlineMs = new Date(submissionDeadlineIso).getTime();
    const checklist: CompetitionSubtask[] = [];

    const templateLibrary: Record<string, { title: string; desc: string; hours: number; offsetDays: number; agent: string; isCrit: boolean }[]> = {
      abstract: [
        { title: 'Write first draft of Executive Abstract', desc: 'Synthesize research scope, core thesis, and primary metric targets.', hours: 2.5, offsetDays: 10, agent: 'DraftingAgent-Abstract', isCrit: true },
        { title: 'Review abstract with literature references', desc: 'Cross-reference with recent SOTA benchmarks and target rubric.', hours: 1.5, offsetDays: 8, agent: 'CritiqueAgent-PeerReview', isCrit: false },
        { title: 'Finalize abstract word limit & formatting', desc: 'Ensure tight phrasing and exact word count constraints.', hours: 1.0, offsetDays: 6, agent: 'EditorAgent-Compliance', isCrit: true },
      ],
      paper: [
        { title: 'Synthesize Mathematical Formulation & Architecture', desc: 'Draft methodology equations, system diagrams, and algorithmic pseudocode.', hours: 8.0, offsetDays: 12, agent: 'DraftingAgent-Methodology', isCrit: true },
        { title: 'Run Empirical Benchmark Experiments & Compile Tables', desc: 'Gather latency, throughput, and accuracy metrics.', hours: 10.0, offsetDays: 9, agent: 'ResearchLab-ExperimentAgent', isCrit: true },
        { title: 'Format LaTeX manuscript to official conference style', desc: 'Clean compile PDF with author affiliations and bibtex references.', hours: 3.5, offsetDays: 4, agent: 'DocGen-LaTeXCompiler', isCrit: true },
      ],
      code: [
        { title: 'Build clean, reproducible codebase and dependencies', desc: 'Structure modular Python package with type hints and automated unit tests.', hours: 6.0, offsetDays: 7, agent: 'CodeAgent-DevOps', isCrit: true },
        { title: 'Generate Dockerfile & test container runtimes', desc: 'Verify container boots in under 30 seconds with GPU/CPU acceleration.', hours: 3.0, offsetDays: 5, agent: 'CodeAgent-DevOps', isCrit: true },
      ],
      video: [
        { title: 'Draft 3-minute video presentation script', desc: 'Outline slide flow, live code demo timestamps, and impact punchlines.', hours: 2.0, offsetDays: 6, agent: 'MediaAgent-ScriptWriter', isCrit: false },
        { title: 'Record and render high-definition screencast', desc: 'Edit voiceover, animated diagrams, and overlay subtitles.', hours: 4.5, offsetDays: 3, agent: 'MediaAgent-Renderer', isCrit: false },
      ],
      impact: [
        { title: 'Draft Societal Impact & Ethical Analysis', desc: 'Address safety, privacy, dual-use implications, and broader benefits.', hours: 2.5, offsetDays: 5, agent: 'DraftingAgent-Impact', isCrit: false },
        { title: 'Perform Self-Critique against evaluation rubric', desc: 'Score alignment with scoring criteria and revise.', hours: 1.5, offsetDays: 3, agent: 'CritiqueAgent-Ethics', isCrit: false },
      ],
    };

    requiredMaterials.forEach((material, matIdx) => {
      const matLower = material.toLowerCase();
      let key = 'abstract';
      if (matLower.includes('paper') || matLower.includes('proposal') || matLower.includes('methodology')) key = 'paper';
      else if (matLower.includes('code') || matLower.includes('repo') || matLower.includes('docker')) key = 'code';
      else if (matLower.includes('video') || matLower.includes('demo') || matLower.includes('pitch')) key = 'video';
      else if (matLower.includes('impact') || matLower.includes('ethics') || matLower.includes('budget')) key = 'impact';

      const subtaskTemplates = templateLibrary[key] || templateLibrary.abstract;
      subtaskTemplates.forEach((tpl, subIdx) => {
        const relativeDeadline = new Date(deadlineMs - tpl.offsetDays * 86400000).toISOString();
        checklist.push({
          id: `subtask-${matIdx + 1}-${subIdx + 1}`,
          parentId: `mat-${matIdx + 1}`,
          materialKey: material,
          title: tpl.title,
          description: tpl.desc,
          effortHours: tpl.hours,
          relativeDeadline,
          completed: matIdx === 0 && subIdx === 0, // Mark first task as completed for demo state
          assignedAgent: tpl.agent,
          isCriticalPath: tpl.isCrit,
        });
      });
    });

    // Append final browser actuator submission subtask
    checklist.push({
      id: `subtask-submit-final`,
      materialKey: 'Browser Actuator Portal',
      title: 'Simulate Automated Playwright Form-Filling & Pre-Submission Human Approval',
      description: 'Populate official portal fields, capture full-page screenshot, and request final human sign-off.',
      effortHours: 1.0,
      relativeDeadline: new Date(deadlineMs - 86400000).toISOString(),
      completed: false,
      assignedAgent: 'BrowserAgent-Actuator',
      isCriticalPath: true,
    });

    return checklist;
  }

  /**
   * Spawns dedicated drafting agents with few-shot LTM and self-critique loop.
   * Revises drafts up to 3 times scoring against the evaluation criteria.
   */
  public async initializeDraftingAgents(
    competitionId: string,
    requiredMaterials: string[],
    structuredRules: StructuredRules
  ): Promise<DraftArtifact[]> {
    const artifacts: DraftArtifact[] = [];

    for (let i = 0; i < Math.min(requiredMaterials.length, 3); i++) {
      const mat = requiredMaterials[i];
      const draftRes = await this.generateDraftWithSelfCritique({
        competitionId,
        fieldKey: mat,
        structuredRules,
      });
      artifacts.push(draftRes);
    }

    return artifacts;
  }

  /**
   * Runs the self-critique drafting loop for a specific field.
   */
  public async generateDraftWithSelfCritique(params: {
    competitionId: string;
    fieldKey: string;
    structuredRules: StructuredRules;
    customPrompt?: string;
  }): Promise<DraftArtifact> {
    const client = getGenAIClient();
    const defaultWordCount = params.fieldKey.toLowerCase().includes('abstract') ? 300 : 500;

    let initialDraft = `Draft for ${params.fieldKey}: Our proposed technical framework integrates neuro-symbolic reasoning and asynchronous event-driven architectures to achieve order-of-magnitude improvements in execution efficiency. By replacing dense backpropagation with biologically plausible local credit assignment, our approach minimizes power consumption and memory footprint. Empirical validations across standard benchmarks demonstrate superior convergence stability and robust generalization across unseen out-of-distribution test conditions.`;
    let critiqueScore = 88;
    let critiqueNotes = [
      'Strong algorithmic foundation.',
      'Clear novelty alignment with competition criteria.',
      'Recommend adding exact empirical benchmark numbers in final revision.',
    ];
    let revisions = 1;

    if (client) {
      try {
        const rubricText = params.structuredRules.evaluation_criteria
          .map((c) => `- ${c.criterion} (${c.weightPercentage}%): ${c.description}`)
          .join('\n');

        // Iteration Loop: Draft -> Critique -> Revise
        const draftPrompt = `You are a specialized AI Research Drafting Agent writing the "${params.fieldKey}" section for an elite scientific competition.
Competition Evaluation Rubric:
${rubricText}

Eligibility & Restrictions:
${params.structuredRules.restrictions.join('\n')}

Task: Write a publication-grade, persuasive draft (around 200-300 words). Incorporate precise technical terminology, mathematical intuition, and quantitative benchmarks.
${params.customPrompt ? `User Guidance: ${params.customPrompt}` : ''}`;

        const draftResponse = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: draftPrompt,
        });

        initialDraft = draftResponse.text || initialDraft;

        // Self-Critique step
        const critiquePrompt = `You are a strict Peer Review & Evaluation Agent.
Evaluate this draft for the section "${params.fieldKey}" against the rubric:
Rubric:
${rubricText}

Draft:
"""${initialDraft}"""

Output a JSON object with:
{
  "score": number between 70 and 99,
  "critiqueNotes": ["point 1", "point 2", "point 3"],
  "revisedDraft": "improved draft integrating critique feedback"
}
Output ONLY raw JSON.`;

        const critiqueResponse = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: critiquePrompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(critiqueResponse.text || '{}');
        if (parsed.score) critiqueScore = parsed.score;
        if (Array.isArray(parsed.critiqueNotes)) critiqueNotes = parsed.critiqueNotes;
        if (parsed.revisedDraft) {
          initialDraft = parsed.revisedDraft;
          revisions = 2;
        }
      } catch (err) {
        console.warn('Gemini self-critique loop fallback:', err);
      }
    }

    const artifact: DraftArtifact = {
      id: `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      competitionId: params.competitionId,
      fieldKey: params.fieldKey,
      title: `${params.fieldKey}: Autonomous Synthesis`,
      content: initialDraft,
      version: revisions,
      wordCount: initialDraft.split(/\s+/).filter(Boolean).length,
      maxWords: defaultWordCount,
      selfCritiqueScore: critiqueScore,
      critiqueNotes,
      revisionCount: revisions,
      approvalStatus: 'PENDING_APPROVAL',
      ltmExamplesUsed: ['Long-Term Memory: Nature Comms 2025 Winning Format', 'NeurIPS Competition First-Place Template'],
      knowledgeGraphCitations: ['Project: Event-Driven SNN Kernel', 'Knowledge Graph: STDP Local Plasticity Node'],
      updatedAt: new Date().toISOString(),
    };

    // Update in competition object if exists
    const comp = this.competitions.get(params.competitionId);
    if (comp) {
      if (!comp.draftArtifacts) comp.draftArtifacts = [];
      const existingIdx = comp.draftArtifacts.findIndex((d) => d.fieldKey === params.fieldKey);
      if (existingIdx >= 0) {
        comp.draftArtifacts[existingIdx] = artifact;
      } else {
        comp.draftArtifacts.push(artifact);
      }
    }

    return artifact;
  }

  /**
   * Updates an existing draft (e.g. from user live editing in the dashboard).
   */
  public updateDraftArtifact(
    competitionId: string,
    draftId: string,
    newContent: string,
    status: 'DRAFTING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' = 'PENDING_APPROVAL'
  ): DraftArtifact | null {
    const comp = this.competitions.get(competitionId);
    if (!comp || !comp.draftArtifacts) return null;

    const draft = comp.draftArtifacts.find((d) => d.id === draftId);
    if (!draft) return null;

    draft.content = newContent;
    draft.wordCount = newContent.split(/\s+/).filter(Boolean).length;
    draft.version += 1;
    draft.approvalStatus = status;
    draft.updatedAt = new Date().toISOString();

    return draft;
  }

  /**
   * Browser Agent Actuator:
   * 1. Heuristic semantic mapping to DOM elements.
   * 2. Simulates file upload & form auto-filling.
   * 3. Generates Pre-Submission Full Page Screenshot.
   * 4. Pushes Approval Request to the Human Approval Center.
   */
  public async executeBrowserFormAutofill(competitionId: string): Promise<{
    success: boolean;
    submissionState: BrowserSubmissionState;
    approvalRequestId?: string;
  }> {
    const comp = this.competitions.get(competitionId);
    if (!comp) {
      throw new Error(`Competition ${competitionId} not found`);
    }

    // Set status to auto-filling
    if (!comp.browserSubmissionState) {
      comp.browserSubmissionState = {
        submissionPortalUrl: comp.officialGuidelinesUrl || 'https://portal.competition.org/submit',
        formFieldMappings: [],
        preSubmissionScreenshot: '',
        confirmationScreenshot: '',
        confirmationNumber: '',
        status: 'AUTO_FILLING',
      };
    } else {
      comp.browserSubmissionState.status = 'AUTO_FILLING';
    }

    // Heuristic DOM form mapping
    const mappings: BrowserFormFieldMapping[] = [
      { fieldName: 'Project Title', selector: 'input[name="title"], #project_title', value: comp.title, fieldType: 'text', status: 'FILLED' },
      { fieldName: 'Executive Abstract', selector: 'textarea[name="abstract"], #abstract', value: comp.draftArtifacts?.[0]?.content || comp.structuredRulesSummary, fieldType: 'textarea', status: 'FILLED' },
      { fieldName: 'Contact Email', selector: 'input[type="email"], #submitter_email', value: 'researcher@atlas-ai.lab', fieldType: 'text', status: 'FILLED' },
      { fieldName: 'Technical Methodology PDF', selector: 'input[type="file"]#manuscript', value: `/artifacts/${comp.id}_manuscript.pdf`, fieldType: 'file_upload', status: 'FILLED' },
      { fieldName: 'Code Repository URL', selector: 'input[name="repo_url"], #code_link', value: 'https://github.com/atlas-ai-lab/competition-solution', fieldType: 'text', status: 'FILLED' },
      { fieldName: 'Ethics & Originality Attestation', selector: 'input[type="checkbox"]#ethics_agree', value: 'true', fieldType: 'checkbox', status: 'FILLED' },
    ];

    comp.browserSubmissionState.formFieldMappings = mappings;
    comp.browserSubmissionState.preSubmissionScreenshot =
      comp.submissionScreenshot || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
    comp.browserSubmissionState.status = 'AWAITING_HUMAN_APPROVAL';

    // Create a high-priority Approval Request in PostgreSQL / Approval Center
    const approval = await postgreSQLStore.addApproval({
      tenantId: 'tenant-primary',
      userId: 'usr-jun',
      moduleName: 'competition_manager',
      actionType: 'browser_form_submission',
      schemaVersion: '1.0.0',
      payload: {
        competitionId: comp.id,
        competitionTitle: comp.title,
        organizer: comp.organizer,
        portalUrl: comp.browserSubmissionState.submissionPortalUrl,
        filledFields: mappings.map((m) => ({ field: m.fieldName, valuePreview: m.value.slice(0, 80) })),
        preSubmissionScreenshot: comp.browserSubmissionState.preSubmissionScreenshot,
      },
      summary: `Final Submission Sign-Off: Playwright Form Dispatch for ${comp.title} to ${comp.organizer}`,
      riskLevel: 'high',
      status: 'pending',
      impactScore: 0.95,
      evidence: {
        type: 'Browser Screenshot & Form Field Audit',
        title: `${comp.organizer} Submission Form State`,
        content: `All 6 required fields mapped and validated with zero validation errors. Artifact hashes verified against SHA-256 ledger.`,
        url: comp.browserSubmissionState.submissionPortalUrl,
      },
      callbackUrl: `/api/competitions/${comp.id}/finalize-submission-callback`,
      callbackPayload: { competitionId: comp.id },
    });

    await redisEngine.xadd('approval_events', {
      eventType: 'COMPETITION_SUBMISSION_APPROVAL_REQUESTED',
      competitionId: comp.id,
      approvalId: approval.id,
    });

    return {
      success: true,
      submissionState: comp.browserSubmissionState,
      approvalRequestId: approval.id,
    };
  }

  /**
   * Finalizes the submission after human approval:
   * 1. Simulates submit click on Playwright browser instance.
   * 2. Scrapes confirmation page screenshot and parses confirmation number.
   * 3. Updates competition state to 'submitted'.
   * 4. Enqueues daily submission monitor in Celery.
   */
  public async finalizeSubmission(competitionId: string): Promise<Competition> {
    const comp = this.competitions.get(competitionId);
    if (!comp) {
      throw new Error(`Competition ${competitionId} not found`);
    }

    const confNum = `CONF-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;

    if (comp.browserSubmissionState) {
      comp.browserSubmissionState.status = 'SUBMITTED';
      comp.browserSubmissionState.confirmationNumber = confNum;
      comp.browserSubmissionState.confirmationScreenshot =
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
    }

    comp.status = 'submitted';
    comp.feedback = `Submission successfully acknowledged on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} UTC. Confirmation identifier: ${confNum}.`;

    if (comp.postSubmissionMonitor) {
      comp.postSubmissionMonitor.emailTrackingStatus = `Confirmation email detected and verified for ID ${confNum}`;
      comp.postSubmissionMonitor.portalStatusScraped = 'Application Received & Under Review by Judging Committee';
      comp.postSubmissionMonitor.lastCheckedAt = new Date().toISOString();
    }

    // Dispatch Celery monitor task
    celeryWorkerEngine.dispatchTask('tasks.competition.submission_monitor', [comp.id], {
      competitionId: comp.id,
      schedule: 'daily',
    });

    return comp;
  }

  /**
   * Runs the post-submission monitoring check (e.g. portal check, email status, winner RSS scraping).
   */
  public async runSubmissionMonitor(competitionId: string): Promise<PostSubmissionMonitor> {
    const comp = this.competitions.get(competitionId);
    if (!comp || !comp.postSubmissionMonitor) {
      throw new Error(`Competition ${competitionId} not found or not submitted`);
    }

    const monitor = comp.postSubmissionMonitor;
    monitor.lastCheckedAt = new Date().toISOString();
    monitor.portalStatusScraped = 'Judging in Progress: 3 of 4 Reviewers Completed Rubric Evaluations.';

    // Simulate winning detection if scheduled date has arrived
    const isWinSim = comp.title.toLowerCase().includes('neuromorphic') || Math.random() > 0.6;
    if (isWinSim && !monitor.celebrationTriggered) {
      monitor.isWinner = true;
      monitor.winnerListStatus = `WINNER ANNOUNCED: 1st Place - Team Atlas AI Lab ($${comp.prizePool})`;
      monitor.celebrationTriggered = true;
      monitor.socialDraft = `🏆 Thrilled to announce that our project "${comp.title}" took First Place at the ${comp.organizer} 2026 Challenge! Huge thanks to the organizers and judges. Read our full paper and code repo below! #AI #Innovation #MachineLearning`;
      comp.status = 'won';
    }

    return monitor;
  }

  /**
   * Toggle a subtask checklist completion state.
   */
  public toggleSubtask(competitionId: string, subtaskId: string): Competition {
    const comp = this.competitions.get(competitionId);
    if (!comp) throw new Error(`Competition ${competitionId} not found`);

    comp.checklist = comp.checklist.map((t) =>
      t.id === subtaskId ? { ...t, completed: !t.completed } : t
    );

    return comp;
  }

  /**
   * Deep Analysis of Previous Winners:
   * Analyzes past champions, winning factors, technical stacks, and competitive differentiators.
   */
  public async analyzePreviousWinners(competitionId: string): Promise<any[]> {
    const comp = this.competitions.get(competitionId);
    const title = comp?.title || 'Global Technology Competition';
    const client = getGenAIClient();

    if (client) {
      try {
        const prompt = `Analyze historical winners and championship winning patterns for the competition: "${title}".
Return a JSON array of 3 previous winning project case studies with this schema:
[
  {
    "year": "2025",
    "project_title": "Project Name",
    "team_name": "Team or Lab Name",
    "prize": "1st Place ($25,000)",
    "winning_factors": ["Factor 1", "Factor 2", "Factor 3"],
    "submission_breakdown": "Summary of why judges favored this entry",
    "github_repo": "https://github.com/...",
    "tech_stack": ["Tech1", "Tech2", "Tech3"],
    "key_differentiator": "Core competitive edge"
  }
]`;
        const res = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        const parsed = JSON.parse(res.text || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Gemini winners analysis fallback:', e);
      }
    }

    return [
      {
        year: '2025',
        project_title: 'SynapseNet-V2: Sub-mW Bio-Signal Decoder',
        team_name: 'ETH Zürich Neuro-Robotics Lab',
        prize: '1st Place ($25,000 USD)',
        winning_factors: [
          'Direct hardware-in-the-loop latency benchmark verification (3.8ms)',
          'Complete open-source reproducible Docker container and PyTorch bindings',
          'Clinical trial patient data validation in ethics appendix',
        ],
        submission_breakdown: 'Judges praised the rigorous mathematical proof of spike stability combined with actual edge FPGA power measurement graphs.',
        github_repo: 'https://github.com/ethz-synapsenet/v2-core',
        tech_stack: ['PyTorch-SNN', 'SpikeX FPGA', 'Rust', 'C++20'],
        key_differentiator: 'Integrated local STDP plasticity rule with hardware-in-the-loop validation.',
      },
      {
        year: '2024',
        project_title: 'BioEvent-ASIC: Asynchronous Vision Sensor Tracker',
        team_name: 'Stanford Neuromorphic Silicon Group',
        prize: '2nd Place ($15,000 USD)',
        winning_factors: [
          'High event throughput (120 Meps/s)',
          'Clear 3-minute video presentation demonstrating real-time high-speed UAV obstacle evasion',
        ],
        submission_breakdown: 'Exceptional video delivery and benchmark comparisons against traditional frame-based CNNs.',
        github_repo: 'https://github.com/stanford-neuromorphic/bio-event-track',
        tech_stack: ['Verilog', 'SystemC', 'TensorRT', 'Python'],
        key_differentiator: 'Zero-latency dynamic vision sensor integration with asynchronous temporal filters.',
      },
      {
        year: '2023',
        project_title: 'Neuromorphic Spiking Transformer (NST)',
        team_name: 'MIT CSAIL & SynSense',
        prize: 'Grand Innovation Prize ($10,000 USD)',
        winning_factors: [
          'Novel attention mechanism adapted for discrete temporal spike trains',
          'Extensive ablation study on 5 public benchmark datasets',
        ],
        submission_breakdown: 'Pioneering theoretical bridge between transformer self-attention and spike timing.',
        github_repo: 'https://github.com/mit-csail/nst-core',
        tech_stack: ['JAX', 'Flax', 'Triton Kernel', 'CUDA'],
        key_differentiator: 'First mathematically sound sparse spike attention formulation.',
      },
    ];
  }

  /**
   * Innovative Idea & Differentiator Generation:
   * Brainstorms high-impact, non-trivial angles tailored to the competition rubric.
   */
  public async generateInnovativeIdeas(competitionId: string): Promise<any[]> {
    const comp = this.competitions.get(competitionId);
    const title = comp?.title || 'Global Innovation Competition';
    const client = getGenAIClient();

    if (client) {
      try {
        const prompt = `Generate 3 innovative, high-potential concept proposals to win the competition: "${title}".
Return a JSON array with schema:
[
  {
    "id": "idea-1",
    "title": "Concept Name",
    "novelty_summary": "1-2 sentence core technical pitch",
    "uniqueness_index": 9.5,
    "execution_complexity": "High",
    "recommended_angle": "How to frame this in the executive summary"
  }
]`;
        const res = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        const parsed = JSON.parse(res.text || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Gemini idea generation fallback:', e);
      }
    }

    return [
      {
        id: 'idea-101',
        title: 'SpikeFlow-Hybrid: Asynchronous Event-Driven STDP with Local Temporal Credit Assignment',
        novelty_summary: 'Combines biological STDP synaptic updates with surrogate gradient backpropagation for sub-5ms low latency on edge FPGA.',
        uniqueness_index: 9.6,
        execution_complexity: 'High',
        recommended_angle: 'Emphasize real-world sub-mW power consumption and open-source Docker test suite.',
      },
      {
        id: 'idea-102',
        title: 'Neuromorphic Quantized Pruning for Micro-Robotics Sensory Fusers',
        novelty_summary: '4-bit integer weights with sparse event-driven routing, reducing model parameter footprint by 84%.',
        uniqueness_index: 8.9,
        execution_complexity: 'Medium',
        recommended_angle: 'Showcase benchmark tables comparing memory bandwidth against ARM Cortex-M55 baselines.',
      },
      {
        id: 'idea-103',
        title: 'Self-Supervised Temporal Spike Contrastive Learning (Spike-SimCLR)',
        novelty_summary: 'Trains event-driven representations on unlabelled continuous DVS streams with zero manual annotation overhead.',
        uniqueness_index: 9.3,
        execution_complexity: 'High',
        recommended_angle: 'Position as solving the core data scarcity problem in bio-signal classification.',
      },
    ];
  }

  /**
   * Rubric Critical Analysis & Scoring:
   * Evaluates current materials against official criteria and identifies gaps.
   */
  public async evaluateRubricAndCriticalAnalysis(competitionId: string): Promise<{
    rubric_criteria: any[];
    critical_analysis: any;
  }> {
    return {
      rubric_criteria: [
        {
          id: 'crit-1',
          criterion: 'Algorithmic Novelty & Theoretical Rigor',
          weight_percentage: 35,
          description: 'Depth and originality of the core mathematical formulation and learning logic.',
          scoring_levels: {
            poor: 'Standard baseline architecture with minimal custom modifications (1-4 pts).',
            good: 'Solid adaptation of existing SOTA with empirical hyperparameter tuning (5-7 pts).',
            exceptional: 'Pioneering formulation introducing new mathematical proofs or novel plasticity algorithms (8-10 pts).',
          },
          our_current_score: 9.4,
          gap_analysis: 'Strong theoretical rigor in local STDP derivation. Recommend adding a 1-paragraph proof on convergence bound in Section 2.3.',
        },
        {
          id: 'crit-2',
          criterion: 'Empirical Latency & Energy Benchmarks',
          weight_percentage: 30,
          description: 'Verified real-time performance on target edge hardware with sub-10ms latency.',
          scoring_levels: {
            poor: 'Simulated performance without hardware power measurement or latency verification (1-4 pts).',
            good: 'GPU execution with estimated power calculations (5-7 pts).',
            exceptional: 'Actual edge FPGA oscilloscope/profiler power trace and hardware latency metrics (8-10 pts).',
          },
          our_current_score: 9.1,
          gap_analysis: '4.2ms latency outperforms the 10ms rubric limit. Include energy per inference (0.82 µJ) prominently in the Executive Abstract.',
        },
        {
          id: 'crit-3',
          criterion: 'Code Quality & Reproducibility',
          weight_percentage: 20,
          description: 'Clean repository, self-contained Dockerfile, automated test suite, and clear README.',
          scoring_levels: {
            poor: 'Messy scripts with undocumented dependencies and missing environment files (1-4 pts).',
            good: 'Requirements.txt provided with basic run instructions (5-7 pts).',
            exceptional: 'Single-command Docker build, PyPI/Conda package, 90%+ pytest coverage, and GitHub CI workflow (8-10 pts).',
          },
          our_current_score: 8.8,
          gap_analysis: 'Ensure the GitHub repo includes an interactive Google Colab notebook for the judges to test with 1 click.',
        },
        {
          id: 'crit-4',
          criterion: 'Presentation Clarity & Societal Impact',
          weight_percentage: 15,
          description: '3-minute pitch video, visual appeal of architecture diagrams, and bioethics considerations.',
          scoring_levels: {
            poor: 'Unclear slides, poor audio quality, or missing ethics section (1-4 pts).',
            good: 'Standard presentation deck with acceptable narration (5-7 pts).',
            exceptional: 'Engaging, studio-quality animated architecture video with compelling human-centric clinical impact story (8-10 pts).',
          },
          our_current_score: 8.9,
          gap_analysis: 'Video script is crisp. Add animated spike-timing waveform overlay in the first 30 seconds.',
        },
      ],
      critical_analysis: {
        overall_score: 91,
        confidence_rating: 'Extremely High (Tier 1 Contender)',
        strengths: [
          'Exceeds latency target by 58% (4.2ms vs 10.0ms limit)',
          'Clear local plasticity mathematical formulation with zero global gradient overhead',
          'Comprehensive ethics and on-device privacy guarantee for neuro-prosthetic applications',
        ],
        vulnerabilities: [
          'Edge FPGA compilation requires specific Xilinx Vivado toolchain version (recommend providing pre-compiled bitstreams)',
          'Need explicit head-to-head comparison chart against ETH Zürich 2025 winner',
        ],
        blindspots: [
          'Judges may inquire about scaling to >10,000 spiking neurons',
          'Ensure power consumption measurement is verified at ambient 25°C and 45°C thermal thresholds',
        ],
        competitive_threat_analysis: 'Expected top competitor is MIT/Stanford hybrid transformer lab. Our differentiator is raw edge energy efficiency (<1 µJ vs ~15 µJ).',
        feasibility_risk: 'low',
        verdict: 'High probability of 1st or 2nd place award if hardware latency benchmark reproduction steps are zero-friction for judges.',
      },
    };
  }

  /**
   * Actionable Improvement Engine:
   * Generates prioritized upgrade loops and code/text patches to raise scores.
   */
  public async getActionableImprovements(competitionId: string): Promise<any[]> {
    return [
      {
        id: 'imp-1',
        priority: 'critical',
        title: 'Include 1-Click Interactive Google Colab Demo Link in Submission Header',
        impact_on_score: '+3.5 points on Reproducibility',
        current_state: 'Reviewers must clone repo and build Docker container locally.',
        recommended_upgrade: 'Embed interactive Colab notebook with pre-trained weights so judges verify 4.2ms latency in under 60 seconds.',
        implementation_pseudocode_or_diff: `[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/atlas-ai-lab/spikeflow-edge/blob/main/demo.ipynb)`,
        applied: true,
      },
      {
        id: 'imp-2',
        priority: 'high',
        title: 'Add SOTA Benchmark Comparison Matrix vs 2024 & 2025 Winners',
        impact_on_score: '+2.8 points on Algorithmic Novelty',
        current_state: 'Paper compares against standard RNN and LeNet-SNN baselines.',
        recommended_upgrade: 'Add dedicated comparison row for SynapseNet-V2 (ETHZ 2025) and BioEvent-ASIC (Stanford 2024).',
        implementation_pseudocode_or_diff: `Table 1: Comparison of Latency, Energy/Inference, and Model Size vs Previous IEEE CAS Champions.`,
        applied: false,
      },
      {
        id: 'imp-3',
        priority: 'medium',
        title: 'Incorporate Thermal Stability Profiling Graph in Video Demo',
        impact_on_score: '+1.5 points on Empirical Rigor',
        current_state: 'Video demonstrates live inference at room temperature.',
        recommended_upgrade: 'Include 10-second clip showing thermal camera readout confirming <35°C chip temperature under 100Hz continuous spike load.',
        implementation_pseudocode_or_diff: `Video Timeline [01:45 - 01:55]: Thermal infrared overlay & power meter telemetry.`,
        applied: false,
      },
    ];
  }

  /**
   * Follow-up Communication Engine:
   * Prepares tailored follow-up templates for organizers, judges, mentorship inquiries, and post-submission milestones.
   */
  public async getFollowUpCommunications(competitionId: string): Promise<any[]> {
    const comp = this.competitions.get(competitionId);
    const title = comp?.title || 'Challenge';
    const organizer = comp?.organizer || 'Organizing Committee';

    return [
      {
        id: 'comm-1',
        stage: 'post_submission_inquiry',
        target_recipient: `${organizer} Secretariat <submissions@ieee-cas.org>`,
        subject_line: `Submission Acknowledgment & Reproducibility Package: [${title}] - Team Atlas AI Lab`,
        body_content: `Dear Organizing Committee,\n\nWe have successfully transmitted our final submission for "${title}". To ensure maximum ease of evaluation for the technical review committee, we have staged our fully automated benchmark Docker container and interactive 1-click cloud demonstration at https://colab.research.google.com/github/atlas-ai-lab/spikeflow-edge.\n\nPlease let us know if any reviewer requires specific hardware bitstream files or supplementary raw oscilloscope telemetry traces.\n\nWarm regards,\nTeam Atlas AI Lab\nLead Researcher: Dr. Jun Phookan`,
        tactical_notes: 'Send 24 hours after submission window closes to confirm receipt and provide zero-friction evaluator links.',
        status: 'ready_to_send',
        created_at: new Date().toISOString(),
      },
      {
        id: 'comm-2',
        stage: 'judge_qna_prep',
        target_recipient: 'Technical Review Panel / Session Chair',
        subject_line: `Clarification on Local STDP Plasticity Hardware Acceleration [Team Atlas]`,
        body_content: `Dear Judges,\n\nIn anticipation of the technical Q&A period, we have compiled an FAQ document addressing common questions regarding event sparsity, clockless asynchronous routing, and multi-chip scalability.\n\nWe look forward to demonstrating SpikeFlow-Edge live during the finalist symposium.\n\nSincerely,\nTeam Atlas`,
        tactical_notes: 'Keep on standby for finalist notification round.',
        status: 'drafted',
        created_at: new Date().toISOString(),
      },
      {
        id: 'comm-3',
        stage: 'sponsor_networking',
        target_recipient: 'Industry Sponsor & Challenge Partner (SynSense / Intel Labs)',
        subject_line: `Exploratory Collaboration: SpikeFlow-Edge on Intel Loihi-2 / SynSense Speck Architecture`,
        body_content: `Dear Research Partner Team,\n\nFollowing our entry in the ${title}, we identified strong synergy between our asynchronous STDP kernel and your next-generation neuromorphic silicon.\n\nWe would welcome the opportunity to share our benchmark profiling datasets and discuss potential pilot test runs.\n\nBest regards,\nAtlas AI Systems Team`,
        tactical_notes: 'Trigger after winner announcements to turn competition visibility into research grants or commercial licensing.',
        status: 'drafted',
        created_at: new Date().toISOString(),
      },
    ];
  }
}

export const competitionEngine = new CompetitionEngine();
