import {
  BrowserSessionInstance,
  BrowserAutonomousSession,
  BrowserNavigationStep,
  FormAutoFillMapping,
  InterceptedFormSubmission,
  WebScrapingJob,
} from '../types/index.js';

export class BrowserAgentEngine {
  private static instance: BrowserAgentEngine;

  private instances: BrowserSessionInstance[] = [
    {
      instanceId: 'inst-pw-01',
      status: 'idle',
      currentUrl: 'https://devpost.com/competitions/neuromorphic-2026',
      activeCookiesCount: 14,
      userAgentProfile: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      proxyRegion: 'US-East (Stealth Residential)',
      memoryUsageMb: 240,
      uptimeSeconds: 1840,
      isHeadless: true,
      stealthPatchesActive: true,
    },
    {
      instanceId: 'inst-pw-02',
      status: 'interacting',
      currentUrl: 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=505963',
      activeCookiesCount: 8,
      userAgentProfile: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36',
      proxyRegion: 'US-West (Datacenter)',
      memoryUsageMb: 310,
      uptimeSeconds: 920,
      isHeadless: true,
      stealthPatchesActive: true,
    },
  ];

  private activeSession: BrowserAutonomousSession = {
    sessionId: 'sess-nav-7721',
    goalPrompt: 'Find the submission portal for the Neuromorphic AI Hackathon, accept cookie consent, fill the abstract form, and prepare submission.',
    targetUrl: 'https://devpost.com/competitions/neuromorphic-2026/submit',
    status: 'paused_for_approval',
    currentStepIndex: 4,
    maxSteps: 8,
    steps: [
      {
        stepNumber: 1,
        timestamp: '2026-08-13T19:20:10Z',
        actionType: 'navigate',
        targetDescription: 'Initial Navigation to Target URL',
        targetSelector: 'https://devpost.com/competitions/neuromorphic-2026/submit',
        vlmRationale: 'Loaded target portal; detected cookie consent banner floating above viewport.',
        screenshotUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        domTreeSummary: '<div id="cookie-banner"><button id="accept-all-btn">Accept All</button></div><form id="submission-form">...</form>',
        executionStatus: 'success',
        latencyMs: 640,
      },
      {
        stepNumber: 2,
        timestamp: '2026-08-13T19:20:12Z',
        actionType: 'click',
        targetDescription: 'Dismiss Cookie Consent Banner',
        targetSelector: 'button#accept-all-btn',
        vlmRationale: 'Targeted visual banner button to eliminate overlay obscuring input fields.',
        screenshotUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        domTreeSummary: '<form id="submission-form"><input id="proj-title" /><textarea id="proj-abstract" /></form>',
        executionStatus: 'success',
        latencyMs: 310,
      },
      {
        stepNumber: 3,
        timestamp: '2026-08-13T19:20:15Z',
        actionType: 'fill',
        targetDescription: 'Fuzzy-Fill Project Title and Description',
        targetSelector: 'input[name="project_title"], textarea[name="project_overview"]',
        vlmRationale: 'Mapped Competition Manager fields (title, abstract, repository URL) into DOM form nodes using fuzzy semantic matching (98% confidence).',
        screenshotUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        domTreeSummary: '<form id="submission-form" data-state="filled"><input value="Neuromorphic Spike-Driven Edge Accelerator" /></form>',
        executionStatus: 'success',
        latencyMs: 520,
      },
      {
        stepNumber: 4,
        timestamp: '2026-08-13T19:20:18Z',
        actionType: 'vlm_reasoning',
        targetDescription: 'Intercept Final Submit & Handover to Human Approval Center',
        targetSelector: 'button#submit-final-entry',
        vlmRationale: 'Identified irreversible external action (Form Submission). Intercepted transaction; captured viewport screenshot and generated approval token.',
        screenshotUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
        domTreeSummary: '<button id="submit-final-entry" class="btn-primary">Submit Final Proposal</button>',
        executionStatus: 'waiting_user_input',
        latencyMs: 440,
      },
    ],
    liveDomSummary: `Document: Devpost Neuromorphic Submission Form\nFields: 5 filled, 0 missing\nAction Intercepted: Submit Button [ID: #submit-final-entry]\nSecurity Token: Authenticated Session Preserved`,
    currentScreenshotUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    captchaDetected: false,
    extractedResults: {
      competitionId: 'comp-devpost-2026',
      teamMembers: ['Jun Phookan', 'Atlas Sub-Agents'],
      submissionCategory: 'Edge AI / Hardware Acceleration',
    },
    harLogAvailable: true,
    startedAt: '2026-08-13T19:20:00Z',
  };

  private formMapping: FormAutoFillMapping = {
    formId: 'form-nsf-grant-fastlane',
    formTitle: 'NSF Proposal FastLane Cover Sheet (Form 1207)',
    targetUrl: 'https://www.research.gov/common/web/grant-proposal-intake',
    totalFieldsCount: 6,
    unmappedFieldsCount: 0,
    detectedFields: [
      {
        fieldId: 'f1',
        label: 'Principal Investigator Full Name',
        inferredType: 'text',
        matchedPayloadKey: 'pi_name',
        fuzzyConfidencePct: 99,
        proposedValue: 'Jun Phookan',
        isConditional: false,
        isFilled: true,
      },
      {
        fieldId: 'f2',
        label: 'Lead Academic Institution / Organization',
        inferredType: 'text',
        matchedPayloadKey: 'institution',
        fuzzyConfidencePct: 98,
        proposedValue: 'Neuromorphic Computing Lab / Global AI Institute',
        isConditional: false,
        isFilled: true,
      },
      {
        fieldId: 'f3',
        label: 'Requested Total Funding Budget ($USD)',
        inferredType: 'text',
        matchedPayloadKey: 'budget_usd',
        fuzzyConfidencePct: 97,
        proposedValue: '$650,000.00',
        isConditional: false,
        isFilled: true,
      },
      {
        fieldId: 'f4',
        label: 'Human Subjects / IRB Protocol Required?',
        inferredType: 'radio',
        matchedPayloadKey: 'has_human_subjects',
        fuzzyConfidencePct: 95,
        proposedValue: 'No (Synthetic Benchmark & Silicon Hardware Only)',
        isConditional: true,
        dependsOn: { parentFieldId: 'f2', conditionValue: 'Active' },
        isFilled: true,
      },
      {
        fieldId: 'f5',
        label: 'Executive Abstract & Specific Aims',
        inferredType: 'textarea',
        matchedPayloadKey: 'executive_abstract',
        fuzzyConfidencePct: 99,
        proposedValue: 'This investigation proposes an asynchronous spike-timing dependent plasticity (STDP) co-processor tailored for milliwatt robotics...',
        isConditional: false,
        isFilled: true,
      },
      {
        fieldId: 'f6',
        label: 'Project Description PDF Upload',
        inferredType: 'file_upload',
        matchedPayloadKey: 'project_description_pdf',
        fuzzyConfidencePct: 96,
        proposedValue: '/workspace/artifacts/NSF_Career_Neuromorphic_FullProposal_2026.pdf',
        isConditional: false,
        isFilled: true,
      },
    ],
  };

  private interceptedSubmissions: InterceptedFormSubmission[] = [
    {
      submissionId: 'sub-int-8821',
      formName: 'Neuromorphic 2026 Official Hackathon Submission',
      targetActionUrl: 'https://devpost.com/api/v2/submissions/entry_point',
      filledPayload: {
        title: 'Neuromorphic Spike-Driven Edge Accelerator',
        abstract: 'Milliwatt-scale neuromorphic computing architecture for ultra-low latency event cameras.',
        repository: 'https://github.com/atlas-ai/neuromorphic-edge-accelerator',
        demo_video: 'https://youtube.com/watch?v=neuromorphic_demo_2026',
      },
      finalScreenshotUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
      requiresUserApproval: true,
      approvalRequestId: 'apr-form-8821',
      approvalStatus: 'pending',
    },
  ];

  private scrapingJobs: WebScrapingJob[] = [
    {
      jobId: 'scrape-benchmarks-01',
      targetUrl: 'https://paperswithcode.com/sota/image-classification-on-imagenet',
      title: 'State-of-the-Art Neuromorphic & Vision Benchmark Extraction',
      status: 'completed',
      extractionSchema: [
        { field: 'model_name', selectorOrVlmRule: 'table.sota-table tr td:nth-child(2)' },
        { field: 'top1_accuracy', selectorOrVlmRule: 'table.sota-table tr td:nth-child(3)' },
        { field: 'energy_pj_per_op', selectorOrVlmRule: 'table.sota-table tr td:nth-child(5)' },
      ],
      totalRecordsExtracted: 8,
      scrapedItems: [
        { model: 'Spike-ResNet-101', top1_acc: '84.2%', energy_pj: '18.4 pJ/op', framework: 'PyTorch / SpikingJelly' },
        { model: 'Loihi-2 SNN-Transformer', top1_acc: '86.1%', energy_pj: '14.1 pJ/op', framework: 'Intel Lava' },
        { model: 'TrueNorth Synaptic-Net', top1_acc: '79.5%', energy_pj: '22.0 pJ/op', framework: 'Corelet' },
        { model: 'BrainScaleS-2 Hybrid', top1_acc: '81.8%', energy_pj: '16.7 pJ/op', framework: 'PyNN' },
      ],
      exportedJsonPreview: `[\n  {\n    "model": "Spike-ResNet-101",\n    "top1_acc": "84.2%",\n    "energy_pj": "18.4 pJ/op"\n  }\n]`,
      lastScrapedAt: '2026-08-13T18:50:00Z',
    },
  ];

  public static getInstance(): BrowserAgentEngine {
    if (!BrowserAgentEngine.instance) {
      BrowserAgentEngine.instance = new BrowserAgentEngine();
    }
    return BrowserAgentEngine.instance;
  }

  public getInstances(): BrowserSessionInstance[] {
    return this.instances;
  }

  public getActiveSession(): BrowserAutonomousSession {
    return this.activeSession;
  }

  public getFormMapping(): FormAutoFillMapping {
    return this.formMapping;
  }

  public getInterceptedSubmissions(): InterceptedFormSubmission[] {
    return this.interceptedSubmissions;
  }

  public getScrapingJobs(): WebScrapingJob[] {
    return this.scrapingJobs;
  }

  public launchAutonomousGoal(goalPrompt: string, targetUrl: string): BrowserAutonomousSession {
    const session: BrowserAutonomousSession = {
      sessionId: `sess-nav-${Date.now()}`,
      goalPrompt,
      targetUrl,
      status: 'in_progress',
      currentStepIndex: 1,
      maxSteps: 6,
      steps: [
        {
          stepNumber: 1,
          timestamp: new Date().toISOString(),
          actionType: 'navigate',
          targetDescription: `Navigating to ${targetUrl}`,
          targetSelector: targetUrl,
          vlmRationale: `VLM evaluated user goal "${goalPrompt}" and initiated stealth Playwright browser context.`,
          screenshotUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          domTreeSummary: `<html><head><title>Portal</title></head><body><div id="app">...</div></body></html>`,
          executionStatus: 'success',
          latencyMs: 580,
        },
      ],
      liveDomSummary: `Connected to ${targetUrl}. Awaiting VLM visual element localization.`,
      currentScreenshotUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      captchaDetected: false,
      harLogAvailable: true,
      startedAt: new Date().toISOString(),
    };

    this.activeSession = session;
    return session;
  }

  public approveAndSubmitForm(submissionId: string): InterceptedFormSubmission {
    const sub = this.interceptedSubmissions.find((s) => s.submissionId === submissionId) || this.interceptedSubmissions[0];
    sub.approvalStatus = 'submitted';
    sub.confirmationNumber = `CONF-DEVPOST-${Math.floor(100000 + Math.random() * 900000)}`;
    sub.submittedAt = new Date().toISOString();

    if (this.activeSession) {
      this.activeSession.status = 'completed';
      this.activeSession.steps.push({
        stepNumber: this.activeSession.steps.length + 1,
        timestamp: new Date().toISOString(),
        actionType: 'click',
        targetDescription: 'Execute Final Submission (User Approved)',
        targetSelector: 'button#submit-final-entry',
        vlmRationale: `Received cryptographically validated token from Human Approval Center. Final submission dispatched. Confirmation: ${sub.confirmationNumber}`,
        executionStatus: 'success',
        latencyMs: 380,
      });
    }

    return sub;
  }
}

export const browserAgentEngine = BrowserAgentEngine.getInstance();
