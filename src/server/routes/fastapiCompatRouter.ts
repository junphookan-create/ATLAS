import { Router, Request, Response } from 'express';
import { getGenAI } from '../aiClient.js';
import { memoryStore } from '../memoryStore.js';
import { gcwEngine } from '../gcwEngine.js';

export const fastApiCompatRouter = Router();

// In-memory store for FastAPI entities
let sseClients: { id: string; res: Response; userId: string }[] = [];

export function broadcastSSE(event: string, data: any, targetUserId?: string) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    if (!targetUserId || client.userId === targetUserId) {
      try {
        client.res.write(payload);
      } catch (e) {
        // Client disconnected
      }
    }
  });
}

// In-memory datasets for FastAPI endpoints
let gcwProjects: any[] = [
  {
    id: 'proj-nsf-career-2026',
    user_id: 'usr-jun',
    goal: 'Complete NSF CAREER Grant Proposal: Neuromorphic Spatial Intelligence',
    status: 'executing',
    current_phase: 'Action Execution',
    plan_tree: {
      root_goal: 'Submit $650,000 NSF CAREER proposal by deadline',
      nodes: [
        {
          id: 'step-1',
          title: 'Extract Literature & Stanford Dataset Precedents',
          type: 'subtask',
          status: 'completed',
          assigned_module: 'research_scientist',
          estimated_cost_usd: 0.12,
          output_summary: 'Synthesized 18 papers on sparse neuromorphic spike coding',
        },
        {
          id: 'step-2',
          title: 'Draft Section 3: Methodology and Experimental Benchmarking',
          type: 'subtask',
          status: 'in_progress',
          assigned_module: 'grant_writer',
          estimated_cost_usd: 0.45,
          children: [
            {
              id: 'step-2-1',
              title: 'Formulate Mathematical Sparse Coding Formulations',
              type: 'tool_call',
              status: 'completed',
            },
            {
              id: 'step-2-2',
              title: 'Generate High-Stakes Institutional Budget Approval',
              type: 'approval_gate',
              status: 'pending',
            },
          ],
        },
        {
          id: 'step-3',
          title: 'Conduct Peer-Review Rigor Critique & Compliance Verification',
          type: 'verification',
          status: 'pending',
          assigned_module: 'essay_architect',
        },
      ],
    },
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-icml-paper-2026',
    user_id: 'usr-jun',
    goal: 'Draft ICML 2026 Camera-Ready Paper on Event-Based Visual Odometry',
    status: 'planning',
    current_phase: 'Deliberate Planning',
    plan_tree: {
      root_goal: 'Produce 8-page full paper with statistical validation',
      nodes: [
        {
          id: 'step-icml-1',
          title: 'Benchmark against EV-IMO and MVSEC Datasets',
          type: 'subtask',
          status: 'completed',
        },
        {
          id: 'step-icml-2',
          title: 'Ablation Study on Temporal Attention Heads',
          type: 'subtask',
          status: 'in_progress',
        },
      ],
    },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let fastApiOpportunities: any[] = [
  {
    id: 'opp-101',
    title: 'NSF CAREER: Cyber-Physical and Autonomous Systems (CPAS)',
    source: 'Grants.gov Direct Scraper',
    match_score: 98,
    deadline: '2026-09-15',
    url: 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503214',
    status: 'new',
    description: '$650,000 5-year single investigator award for early-career faculty.',
    funding_amount: '$650,000',
  },
  {
    id: 'opp-102',
    title: 'DARPA Young Faculty Award (YFA): High-Density Neuromorphic Computing',
    source: 'FedBizOpps / Sam.gov',
    match_score: 95,
    deadline: '2026-10-01',
    url: 'https://www.darpa.mil/work-with-us/for-universities/young-faculty-award',
    status: 'new',
    description: 'Up to $1,000,000 research funding for transformative national security computing paradigms.',
    funding_amount: '$1,000,000',
  },
  {
    id: 'opp-103',
    title: 'OpenAI Superalignment Research Fellowship Grant',
    source: 'OpenAI Researcher Portal',
    match_score: 92,
    deadline: '2026-11-15',
    url: 'https://openai.com/research-fellowships',
    status: 'new',
    description: '$250,000 unrestricted grant + $100k Azure compute credits.',
    funding_amount: '$250,000',
  },
  {
    id: 'opp-104',
    title: 'Schmidt Science Polymath Award: Interdisciplinary AI Exploration',
    source: 'Schmidt Futures Fund',
    match_score: 89,
    deadline: '2026-12-01',
    url: 'https://schmidtfutures.com/our-work/polymath-program',
    status: 'new',
    description: '$500,000 per year for 5 years to pursue bold cross-disciplinary inquiries.',
    funding_amount: '$2,500,000',
  },
];

let fastApiCompetitions: any[] = [
  {
    id: 'comp-kaggle-2026',
    title: 'CVPR 2026 Event-Based Autonomous Vision Benchmark Challenge',
    status: 'discovered',
    url: 'https://kaggle.com/competitions/cvpr-dvs-vision-2026',
    rules: {
      eligibility: [
        'Open to academic research groups and independent AI practitioners globally',
        'Models must run with latency under 15ms per frame on Nvidia Jetson Orin',
        'Submissions must release reproducible PyTorch/TensorRT code upon winning',
      ],
      materials: [
        '5-page Methodology Technical Report',
        'Jupyter Notebook inference pipeline dockerized container',
        'Model weights checkpoint file (max 250MB)',
        'Signed reproducibility statement',
      ],
      deadlines: [
        'Registration & Team Merge: May 15, 2026',
        'Final Test Set Prediction Submission: June 01, 2026',
        'Winners Presentation at CVPR Seattle: June 22, 2026',
      ],
    },
    checklist_items: [
      { id: 'c1', title: 'Parse DVS Event Stream HDF5 format', completed: true },
      { id: 'c2', title: 'Implement Temporal Graph Attention backbone', completed: true },
      { id: 'c3', title: 'Verify Jetson Orin 12ms latency constraint', completed: false },
      { id: 'c4', title: 'Draft 5-page Technical Report statement', completed: false },
    ],
    drafted_materials: {
      'Technical Report Abstract':
        'We present a Spatio-Temporal Event Transformer (ST-ET) achieving 94.2% mean intersection over union on high-speed dynamic sensor streams with 11.4ms inference.',
    },
  },
];

let fastApiGrants: any[] = [
  {
    id: 'grant-nsf-career-2026',
    title: 'NSF CAREER: Bio-Inspired Neuromorphic Computing for Spatial Navigation',
    agency: 'National Science Foundation (CISE/CCF)',
    status: 'drafting',
    deadline: '2026-09-15',
    background_research:
      'Literature analysis confirms that conventional frame-based visual SLAM degrades catastrophically in high-speed and HDR conditions, whereas biological retinal ganglion cells achieve sub-millisecond asynchronous updates at <1mW power.',
    draft_sections: {
      'Project Summary':
        'This Faculty Early Career Development (CAREER) project establishes the theoretical and algorithmic foundations of asynchronous neuromorphic spatial intelligence.',
      'Intellectual Merit':
        'Pioneers event-driven temporal graph convolutions with mathematical convergence proofs on non-Euclidean manifold trajectories.',
      'Broader Impacts':
        'Direct curriculum integration of open-source event-camera labs reaching 400+ undergraduate and graduate engineering students.',
    },
    budget: {
      requested: 649850,
      directCosts: 426000,
      indirectCosts: 223850,
      currency: 'USD',
    },
  },
];

let fastApiResearchPapers: any[] = [
  {
    id: 'paper-1',
    title: 'Asynchronous Event-Based Graph Neural Networks for Dynamic Scene Flow Estimation',
    abstract:
      'We formulate scene flow directly on unbinned spike events using continuous-time graph attention networks, achieving 3.8x speedup over dense frame representations.',
    url: 'https://arxiv.org/abs/2603.11984',
    authors: ['Jun Phookan', 'Katherine Chen', 'David Marcus'],
    published_date: '2026-03-12',
    relevance_score: 97,
  },
  {
    id: 'paper-2',
    title: 'Sparse Spike-Timing-Dependent Plasticity in Multi-Modal Robot Locomotion',
    abstract:
      'Investigates decentralized local learning rules on Loihi-2 silicon controlling a quadruped robot across unstructured rocky terrain.',
    url: 'https://arxiv.org/abs/2602.08311',
    authors: ['Elena Rostova', 'Jun Phookan'],
    published_date: '2026-02-18',
    relevance_score: 92,
  },
];

let fastApiHypotheses: any[] = [
  {
    id: 'hyp-101',
    topic: 'Neuromorphic Optical Flow under Severe Motion Blur',
    hypothesis:
      'Continuous-time leaky integrate-and-fire event encoders maintain flow tracking accuracy above 90% at angular velocities exceeding 1200 deg/s where classical CMOS rolling shutters completely fail.',
    status: 'formulated',
    independent_variable: 'Sensor Angular Velocity (0 - 1500 deg/s)',
    dependent_variable: 'Endpoint Flow Error (EPE in pixels)',
    proposed_experiment:
      'Mount Prophesee EVK4 sensor on a high-speed servo turntable facing high-contrast checkerboards under 120,000 lux illumination.',
    confidence_score: 0.94,
    created_at: new Date().toISOString(),
  },
];

let fastApiContacts: any[] = [
  {
    id: 'con-1',
    name: 'Prof. Katherine Chen',
    email: 'kchen@stanford.edu',
    title: 'Associate Professor of Bioengineering & AI',
    affiliation: 'Stanford University / Stanford AI Lab',
    enriched_data: {
      h_index: 48,
      recent_papers: [
        'Spatial Transcriptomics in Cortical Motor Mapping (Nature 2025)',
        'Event-Driven Neural Decoding for Brain-Computer Interfaces (Neuron 2026)',
      ],
      linkedin: 'https://linkedin.com/in/katherine-chen-stanford',
      research_topics: ['Spatial Transcriptomics', 'Neuromorphic Decoding', 'Bio-inspired Vision'],
    },
  },
  {
    id: 'con-2',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@darpa.mil',
    title: 'Program Manager, Defense Sciences Office',
    affiliation: 'DARPA DSO',
    enriched_data: {
      h_index: 34,
      recent_papers: ['Autonomous Swarms in Denied RF Environments'],
      linkedin: 'https://linkedin.com/in/marcus-vance-darpa',
      research_topics: ['Edge Computing', 'Asynchronous Sensor Fusion'],
    },
  },
];

let fastApiCampaigns: any[] = [
  {
    id: 'camp-nsf-collab',
    name: 'NSF CAREER Co-PI & External Advisory Panel Outreach',
    target_audience: 'Leading Bioengineering & Neuromorphic Faculty',
    status: 'active',
    email_threads: [
      {
        id: 'th-1',
        recipient_name: 'Prof. Katherine Chen',
        recipient_email: 'kchen@stanford.edu',
        subject: 'Collaboration on NSF CAREER Proposal (Neuromorphic Spatial Intelligence)',
        status: 'replied',
        last_message_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: 'th-2',
        recipient_name: 'Prof. Hiroshi Tanaka',
        recipient_email: 'htanaka@u-tokyo.ac.jp',
        subject: 'Advisory Role on Bio-Inspired Event Vision Benchmarks',
        status: 'sent',
        last_message_at: new Date(Date.now() - 3600000 * 22).toISOString(),
      },
    ],
  },
];

let fastApiCalendarEvents: any[] = [
  {
    id: 'cal-1',
    title: 'Deep Work: NSF CAREER Section 3 Mathematical Formulations',
    start_time: '2026-08-17T09:00:00Z',
    end_time: '2026-08-17T12:00:00Z',
    type: 'deep_work',
    priority: 'high',
    module_link: 'grant_writer',
  },
  {
    id: 'cal-2',
    title: 'Grant Budget Justification Review with University SPO',
    start_time: '2026-08-17T14:00:00Z',
    end_time: '2026-08-17T15:00:00Z',
    type: 'meeting',
    priority: 'high',
  },
  {
    id: 'cal-3',
    title: 'CVPR Challenge Code Submission Deadline',
    start_time: '2026-08-19T23:59:00Z',
    end_time: '2026-08-19T23:59:00Z',
    type: 'deadline',
    priority: 'high',
    module_link: 'competition_manager',
  },
  {
    id: 'cal-4',
    title: 'Deep Work: ICML Ablation Experiment Analysis',
    start_time: '2026-08-18T10:00:00Z',
    end_time: '2026-08-18T13:00:00Z',
    type: 'deep_work',
    priority: 'medium',
  },
];

let fastApiSocialPosts: any[] = [
  {
    id: 'post-1',
    content:
      '🚀 Excited to release our benchmark results comparing classical CMOS cameras vs. Neuromorphic DVS event sensors at 1200 deg/s! Thread with code, datasets, and pretrained models below 👇 #AI #Neuromorphic #Robotics',
    scheduled_time: '2026-08-18T16:00:00Z',
    platform: 'twitter',
    status: 'scheduled',
    tags: ['#AI', '#Neuromorphic', '#Robotics'],
    engagement_estimate: 4200,
  },
  {
    id: 'post-2',
    content:
      'Why frame-based computer vision is hitting a physical latency wall in autonomous robotics — and how continuous-time spike graphs solve it.',
    scheduled_time: '2026-08-20T14:30:00Z',
    platform: 'linkedin',
    status: 'draft',
    tags: ['#DeepLearning', '#ComputerVision', '#Engineering'],
    engagement_estimate: 1800,
  },
];

let fastApiLandingPages: any[] = [
  {
    id: 'lp-1',
    title: 'CampusBookRent: Peer-to-Peer Textbook Rental for Indian Universities',
    slug: 'campus-book-rent',
    headline: 'Save 75% on Engineering & Medical Textbooks Every Semester',
    subheadline: 'Rent verified textbooks from seniors on your campus in under 2 hours via smart campus lockers.',
    conversion_features: [
      'Zero-deposit digital escrow with UPI integration',
      'Doorstep delivery or smart campus locker pickup',
      'Guaranteed buyback policy at end of semester',
    ],
    html_preview: `<!DOCTYPE html>
<html>
<head><style>body{font-family:sans-serif;background:#090d16;color:#f8fafc;padding:40px;text-align:center} .hero{max-width:800px;margin:0 auto} h1{color:#10b981;font-size:36px} .btn{background:#10b981;color:#022c22;padding:12px 28px;border-radius:8px;font-weight:bold;text-decoration:none;display:inline-block;margin-top:20px} .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:40px} .card{background:#1e293b;padding:20px;border-radius:12px}</style></head>
<body>
<div class="hero">
  <h1>Rent College Textbooks at 75% Less</h1>
  <p>Instant peer-to-peer textbook rentals across 120+ Indian engineering & medical campuses.</p>
  <a class="btn" href="#rent">Find Your Books on Campus</a>
  <div class="grid">
    <div class="card"><h3>⚡ 2-Hour Delivery</h3><p>Pickup directly from your campus locker or senior dorm.</p></div>
    <div class="card"><h3>💳 UPI Escrow</h3><p>Safe digital payments released upon book condition verification.</p></div>
    <div class="card"><h3>♻️ Guaranteed Buyback</h3><p>Sell your books back at semester end with 1-click.</p></div>
  </div>
</div>
</body>
</html>`,
    created_at: new Date().toISOString(),
  },
];

let fastApiPitchDecks: any[] = [
  {
    id: 'deck-1',
    title: 'CampusBookRent: Seed Round Pitch Deck ($1.2M)',
    tagline: 'Disrupting India’s $2.8B Academic Textbook Market via Micro-Campus Logistics',
    target_market_tam: '$2.8B Indian Higher Ed Textbooks Market',
    slides_outline: [
      { slide_number: 1, title: 'Title & Vision', key_points: ['CampusBookRent', 'Micro-hub textbook circulation for 38M Indian university students'] },
      { slide_number: 2, title: 'The Problem', key_points: ['Students spend ₹12,000/yr on textbooks that sit idle for 9 months', 'Pirated PDFs lack problem sets; secondhand physical bookshops are 15km off-campus'] },
      { slide_number: 3, title: 'The Solution', key_points: ['Peer-to-peer rental marketplace with smart IoT campus lockers', 'Senior-to-junior inventory cycle cuts prices by 75% while earning seniors 60% margin'] },
      { slide_number: 4, title: 'Market Opportunity (TAM/SAM/SOM)', key_points: ['TAM: $2.8B India Higher Ed Books', 'SAM: $820M Tier-1 & Tier-2 Engineering/Medical Colleges', 'SOM: $120M (150 Target Campuses)'] },
      { slide_number: 5, title: 'Product & Tech Moat', key_points: ['Dynamic pricing algorithm by syllabus edition', 'QR-code anti-counterfeit sticker tagging & escrow hold'] },
      { slide_number: 6, title: 'Business Model', key_points: ['18% marketplace commission on every rental transaction', '₹49/month CampusBookRent+ Prime locker pass'] },
      { slide_number: 7, title: 'Early Traction & Pilot Metrics', key_points: ['1,420 rented textbooks across 3 pilot campuses (IIT Delhi, DTU, NSUT)', '4.8★ user rating with 78% semester retention'] },
      { slide_number: 8, title: 'Go-to-Market Strategy', key_points: ['Campus Student Ambassador program across 50 engineering colleges', 'Orientation week sponsorship & faculty recommended list integration'] },
      { slide_number: 9, title: 'Unit Economics & Financial Projections', key_points: ['CAC: ₹85 per student; LTV: ₹940 (11x LTV:CAC)', 'Year 2 Projection: ₹14.5 Crore GMV at 22% net contribution margin'] },
      { slide_number: 10, title: 'The Ask & Use of Funds', key_points: ['$1.2M Seed Round to expand to 80 campuses, build IoT locker network, and scale engineering team'] },
    ],
    created_at: new Date().toISOString(),
  },
];

let fastApiModelRouterConfig = {
  available_models: [
    {
      id: 'gemini-3.5-pro',
      name: 'Gemini 3.5 Pro (Deep Deliberative Reasoning)',
      provider: 'Google AI',
      cost_per_1k_tokens: 0.00125,
      latency_ms: 680,
      capabilities: ['Complex Mathematical Reasoning', 'HTN Planning', 'Grant Writing', 'Scientific Synthesis'],
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash (Ultra-Low Latency)',
      provider: 'Google AI',
      cost_per_1k_tokens: 0.00015,
      latency_ms: 120,
      capabilities: ['Fast Sensory Parsing', 'NER Extraction', 'Real-Time Summarization', 'Social Copy'],
    },
    {
      id: 'llama-3-70b-local',
      name: 'Llama-3 70B Instruct (Air-Gapped Private Engine)',
      provider: 'Local Dedicated Cluster',
      cost_per_1k_tokens: 0.0,
      latency_ms: 340,
      capabilities: ['Confidential IP Analysis', 'Air-Gapped Processing', 'Code Execution'],
    },
  ],
  routing_rules: [
    { task_type: 'grant_drafting', preferred_model: 'gemini-3.5-pro', fallback_model: 'gemini-2.5-flash', max_cost_threshold: 0.05 },
    { task_type: 'sensory_perception', preferred_model: 'gemini-2.5-flash', fallback_model: 'llama-3-70b-local' },
    { task_type: 'counterfactual_simulation', preferred_model: 'gemini-3.5-pro', fallback_model: 'gemini-2.5-flash' },
    { task_type: 'social_copy', preferred_model: 'gemini-2.5-flash', fallback_model: 'gemini-3.5-pro' },
    { task_type: 'code_generation', preferred_model: 'gemini-3.5-pro', fallback_model: 'llama-3-70b-local' },
  ],
};

// ============================================================================
// 0. AUTHENTICATION (POST /auth/google & POST /auth/demo-login)
// ============================================================================

fastApiCompatRouter.post('/auth/google', (req: Request, res: Response) => {
  const { token } = req.body;
  const user = {
    id: 'usr-jun',
    email: 'junphookan@gmail.com',
    name: 'Jun Phookan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'admin' as const,
  };
  const access_token = `jwt_${Buffer.from(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 })).toString('base64')}`;
  res.json({ access_token, token_type: 'bearer', user });
});

fastApiCompatRouter.post('/auth/demo-login', (req: Request, res: Response) => {
  const { role = 'admin' } = req.body;
  const user = {
    id: role === 'admin' ? 'usr-jun' : role === 'approver' ? 'usr-approver' : 'usr-researcher',
    email: `${role}@atlas.ai`,
    name: role === 'admin' ? 'Jun Phookan (Admin)' : role === 'approver' ? 'Sarah Vance (Chief Approver)' : 'Dr. Alexander (Research Fellow)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    role,
  };
  const access_token = `jwt_${Buffer.from(JSON.stringify({ userId: user.id, role, exp: Date.now() + 86400000 })).toString('base64')}`;
  res.json({ access_token, token_type: 'bearer', user });
});

fastApiCompatRouter.get('/auth/me', (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (auth && auth.includes('jwt_')) {
    res.json({
      id: 'usr-jun',
      email: 'junphookan@gmail.com',
      name: 'Jun Phookan',
      role: 'admin',
    });
  } else {
    res.json({
      id: 'usr-jun',
      email: 'junphookan@gmail.com',
      name: 'Jun Phookan',
      role: 'admin',
    });
  }
});

// ============================================================================
// 1. COMMAND BAR & GCW PROJECTS (POST & GET /gcw/projects)
// ============================================================================

fastApiCompatRouter.post('/gcw/projects', async (req: Request, res: Response) => {
  try {
    const { goal, user_id = 'usr-jun' } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    const ai = getGenAI();
    const systemInstruction = `You are Atlas AI's GCW Project Planner. Decompose the high-level goal into a structured hierarchical plan tree of 3-5 distinct execution steps (subtask, tool_call, approval_gate, verification).
Return valid JSON with:
- root_goal: string
- nodes: { id: string, title: string, type: "subtask"|"tool_call"|"approval_gate"|"verification", status: "pending"|"in_progress"|"completed", assigned_module: string, estimated_cost_usd: number, children?: any[] }[]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Decompose goal: ${goal}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedPlan = JSON.parse(response.text || '{}');
    const newProject = {
      id: `proj-${Date.now().toString(36)}`,
      user_id,
      goal,
      status: 'executing',
      current_phase: 'Action Execution',
      plan_tree: parsedPlan.nodes ? parsedPlan : { root_goal: goal, nodes: [{ id: '1', title: 'Initiate Analysis', type: 'subtask', status: 'in_progress', assigned_module: 'general_cognitive_worker' }] },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    gcwProjects.unshift(newProject);

    // Broadcast SSE project updated
    broadcastSSE('project_updated', { project: newProject }, user_id);

    // If goal requires approval, generate approval request and broadcast
    if (goal.toLowerCase().includes('grant') || goal.toLowerCase().includes('budget') || goal.toLowerCase().includes('submission') || goal.toLowerCase().includes('fund')) {
      const approvalPayload = {
        id: `appr-${Date.now().toString(36)}`,
        user_id,
        module: 'grant_writer',
        action_type: 'GRANT_BUDGET_DISBURSEMENT',
        payload_summary: `Approve preliminary allocation and institutional sign-off for: "${goal}"`,
        risk_level: 'high',
        created_time: new Date().toISOString(),
        status: 'pending',
      };
      broadcastSSE('new_approval', approvalPayload, user_id);
    }

    res.json(newProject);
  } catch (err: any) {
    console.error('Error in POST /gcw/projects:', err);
    res.status(500).json({ error: err.message || 'Failed to create GCW project' });
  }
});

fastApiCompatRouter.get('/gcw/projects', (req: Request, res: Response) => {
  res.json(gcwProjects);
});

fastApiCompatRouter.get('/gcw/projects/:id', (req: Request, res: Response) => {
  const project = gcwProjects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// ============================================================================
// 2. APPROVAL CENTER (GET /approvals/pending & PATCH /approvals/:id)
// ============================================================================

fastApiCompatRouter.get('/approvals/pending', (req: Request, res: Response) => {
  const pending = memoryStore.getApprovals().filter((a) => a.status === 'pending');
  const mapped = pending.map((a) => ({
    id: a.id,
    user_id: a.userId || 'usr-jun',
    module: a.moduleName,
    action_type: a.actionType,
    payload_summary: a.summary,
    payload: a.payload,
    risk_level: a.riskLevel,
    created_time: a.createdAt,
    status: a.status,
  }));
  res.json(mapped);
});

fastApiCompatRouter.patch('/approvals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { approved, approved_by = 'usr-jun', modifications } = req.body;

  const decision = approved ? 'approved' : 'denied';
  const updated = memoryStore.recordDecision(id, decision, {
    justification: `FastAPI Decision: ${decision}`,
    executedBy: approved_by,
    modifications,
  });

  if (!updated) {
    return res.status(404).json({ error: 'Approval not found' });
  }

  const result = {
    id: updated.id,
    user_id: updated.userId,
    module: updated.moduleName,
    action_type: updated.actionType,
    payload_summary: updated.summary,
    risk_level: updated.riskLevel,
    created_time: updated.createdAt,
    status: updated.status,
    decision_by: approved_by,
    decision_time: new Date().toISOString(),
  };

  broadcastSSE('approval_decided', result);
  res.json(result);
});

// ============================================================================
// 4. OPPORTUNITIES (GET /opportunities & POST /opportunities/scan)
// ============================================================================

fastApiCompatRouter.get('/opportunities', (req: Request, res: Response) => {
  const { status, min_score = 0, limit = 50 } = req.query;
  let filtered = fastApiOpportunities;
  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }
  if (min_score) {
    filtered = filtered.filter((o) => o.match_score >= Number(min_score));
  }
  res.json(filtered.slice(0, Number(limit)));
});

fastApiCompatRouter.post('/opportunities/scan', async (req: Request, res: Response) => {
  try {
    const ai = getGenAI();
    const systemInstruction = `Generate 2 new high-match grant or fellowship opportunities for an AI/Robotics researcher.
Return valid JSON with:
- opportunities: { title: string, source: string, match_score: number, deadline: string, url: string, description: string, funding_amount: string }[]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Scan for latest AI and cyber-physical grants for Q3 2026',
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newItems = (parsed.opportunities || []).map((o: any) => ({
      id: `opp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: o.title,
      source: o.source || 'Autonomous Crawler',
      match_score: o.match_score || 94,
      deadline: o.deadline || '2026-11-30',
      url: o.url || 'https://grants.gov',
      status: 'new',
      description: o.description,
      funding_amount: o.funding_amount,
    }));

    fastApiOpportunities = [...newItems, ...fastApiOpportunities];

    // Broadcast SSE
    if (newItems.length > 0) {
      broadcastSSE('high_match_opportunity', newItems[0]);
    }

    res.json({ scanned_count: newItems.length, new_opportunities: newItems });
  } catch (err: any) {
    res.json({ scanned_count: 0, new_opportunities: [] });
  }
});

// ============================================================================
// 5. COMPETITIONS (GET /competitions, POST /competitions/:id/extract-rules, POST /draft)
// ============================================================================

fastApiCompatRouter.get('/competitions', (_req: Request, res: Response) => {
  res.json(fastApiCompetitions);
});

fastApiCompatRouter.post('/competitions/:id/extract-rules', async (req: Request, res: Response) => {
  const comp = fastApiCompetitions.find((c) => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Competition not found' });

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Extract detailed rules and requirements for competition: ${comp.title}`,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: `Return valid JSON with:
- eligibility: string[]
- materials: string[]
- deadlines: string[]
- checklist_items: { id: string, title: string, completed: boolean }[]`,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    comp.rules = {
      eligibility: parsed.eligibility || comp.rules?.eligibility,
      materials: parsed.materials || comp.rules?.materials,
      deadlines: parsed.deadlines || comp.rules?.deadlines,
    };
    if (parsed.checklist_items) {
      comp.checklist_items = parsed.checklist_items;
    }

    res.json(comp);
  } catch (e: any) {
    res.json(comp);
  }
});

fastApiCompatRouter.post('/competitions/:id/draft/:material_name', async (req: Request, res: Response) => {
  const comp = fastApiCompetitions.find((c) => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Competition not found' });
  const { material_name } = req.params;

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Draft submission material "${material_name}" for ${comp.title}`,
    });

    const content = response.text || `Drafted content for ${material_name}`;
    if (!comp.drafted_materials) comp.drafted_materials = {};
    comp.drafted_materials[material_name] = content;

    res.json({ material: material_name, content, competition: comp });
  } catch (e: any) {
    res.json({ material: material_name, content: 'Failed to draft material', competition: comp });
  }
});

// ============================================================================
// 6. GRANTS (GET /grants, POST /research, POST /draft, POST /budget)
// ============================================================================

fastApiCompatRouter.get('/grants', (_req: Request, res: Response) => {
  res.json(fastApiGrants);
});

fastApiCompatRouter.post('/grants/:id/research', async (req: Request, res: Response) => {
  const grant = fastApiGrants.find((g) => g.id === req.params.id);
  if (!grant) return res.status(404).json({ error: 'Grant not found' });

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Perform literature synthesis and state-of-the-art background research for proposal: ${grant.title}`,
    });
    grant.background_research = response.text || 'Synthesized literature review.';
    res.json(grant);
  } catch (e: any) {
    res.json(grant);
  }
});

fastApiCompatRouter.post('/grants/:id/draft', async (req: Request, res: Response) => {
  const grant = fastApiGrants.find((g) => g.id === req.params.id);
  if (!grant) return res.status(404).json({ error: 'Grant not found' });
  const { section_title = 'Intellectual Merit' } = req.body;

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Draft section "${section_title}" for grant proposal "${grant.title}" targeting ${grant.agency || 'NSF'}.`,
    });
    if (!grant.draft_sections) grant.draft_sections = {};
    grant.draft_sections[section_title] = response.text || 'Drafted narrative section.';
    res.json(grant);
  } catch (e: any) {
    res.json(grant);
  }
});

fastApiCompatRouter.post('/grants/:id/budget', async (req: Request, res: Response) => {
  const grant = fastApiGrants.find((g) => g.id === req.params.id);
  if (!grant) return res.status(404).json({ error: 'Grant not found' });

  grant.budget = {
    requested: 650000,
    directCosts: 425000,
    indirectCosts: 225000,
    currency: 'USD',
  };
  res.json(grant);
});

// ============================================================================
// 7. RESEARCH (GET /papers, GET /hypotheses, POST /hypothesis)
// ============================================================================

fastApiCompatRouter.get('/research/papers', (_req: Request, res: Response) => {
  res.json(fastApiResearchPapers);
});

fastApiCompatRouter.get('/research/hypotheses', (_req: Request, res: Response) => {
  res.json(fastApiHypotheses);
});

fastApiCompatRouter.post('/research/hypothesis', async (req: Request, res: Response) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  try {
    const ai = getGenAI();
    const systemInstruction = `You are a scientific AI. Formulate a testable, rigorous hypothesis on "${topic}".
Return valid JSON with:
- topic: string
- hypothesis: string
- independent_variable: string
- dependent_variable: string
- proposed_experiment: string
- confidence_score: number`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Hypothesis on: ${topic}`,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newHyp = {
      id: `hyp-${Date.now()}`,
      topic: parsed.topic || topic,
      hypothesis: parsed.hypothesis || `Testing interaction of ${topic}`,
      status: 'formulated' as const,
      independent_variable: parsed.independent_variable,
      dependent_variable: parsed.dependent_variable,
      proposed_experiment: parsed.proposed_experiment,
      confidence_score: parsed.confidence_score || 0.92,
      created_at: new Date().toISOString(),
    };

    fastApiHypotheses.unshift(newHyp);
    res.json(newHyp);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to generate hypothesis' });
  }
});

// ============================================================================
// 8. OUTREACH (GET & POST /contacts, GET & POST /campaigns)
// ============================================================================

fastApiCompatRouter.get('/outreach/contacts', (_req: Request, res: Response) => {
  res.json(fastApiContacts);
});

fastApiCompatRouter.get('/outreach/campaigns', (_req: Request, res: Response) => {
  res.json(fastApiCampaigns);
});

fastApiCompatRouter.post('/outreach/campaigns', (req: Request, res: Response) => {
  const { name, target_audience } = req.body;
  const newCamp = {
    id: `camp-${Date.now()}`,
    name: name || 'New Outreach Campaign',
    target_audience: target_audience || 'Researchers',
    status: 'draft' as const,
    email_threads: [],
  };
  fastApiCampaigns.unshift(newCamp);
  res.json(newCamp);
});

fastApiCompatRouter.post('/outreach/find-contacts', async (req: Request, res: Response) => {
  const { query } = req.body;
  const newContact = {
    id: `con-${Date.now()}`,
    name: `Dr. ${query?.slice(0, 10) || 'Elena Rostova'}`,
    email: 'e.rostova@mit.edu',
    title: 'Research Scientist',
    affiliation: 'MIT CSAIL',
    enriched_data: {
      h_index: 29,
      recent_papers: [`Recent advances in ${query || 'Autonomous Systems'}`],
      research_topics: [query || 'Robotics', 'Neuromorphic'],
    },
  };
  fastApiContacts.unshift(newContact);
  res.json([newContact]);
});

// ============================================================================
// 9. CALENDAR (GET /events, GET /schedule, POST /optimize)
// ============================================================================

fastApiCompatRouter.get('/calendar/events', (_req: Request, res: Response) => {
  res.json(fastApiCalendarEvents);
});

fastApiCompatRouter.get('/calendar/schedule', (_req: Request, res: Response) => {
  res.json({
    week_start: '2026-08-17',
    total_deep_work_hours: 18.5,
    total_meetings_hours: 6.0,
    events: fastApiCalendarEvents,
    optimization_score: 94,
    recommendations: [
      'Protected 3 uninterrupted morning deep work blocks for NSF CAREER drafting.',
      'Grouped collaborative outreach calls into Tuesday and Thursday afternoons.',
    ],
  });
});

fastApiCompatRouter.post('/calendar/optimize', (_req: Request, res: Response) => {
  res.json({
    week_start: '2026-08-17',
    total_deep_work_hours: 22.0,
    total_meetings_hours: 4.5,
    events: fastApiCalendarEvents,
    optimization_score: 98,
    recommendations: [
      'Successfully consolidated fragmented meetings to open an additional 3.5h research window.',
      'Synchronized grant deadlines with task milestone buffers.',
    ],
  });
});

// ============================================================================
// 10. KNOWLEDGE GRAPH (GET /knowledge/graph)
// ============================================================================

fastApiCompatRouter.get('/knowledge/graph', (req: Request, res: Response) => {
  const { filter_type } = req.query;
  const nodes = [
    { id: 'n1', label: 'Neuromorphic Spatial Navigation', type: 'concept' },
    { id: 'n2', label: 'NSF CAREER Proposal (2026)', type: 'grant' },
    { id: 'n3', label: 'Prof. Katherine Chen', type: 'contact' },
    { id: 'n4', label: 'Stanford Cortical Mapping Dataset', type: 'entity' },
    { id: 'n5', label: 'Event-Based Graph Attention Paper', type: 'paper' },
    { id: 'n6', label: 'CVPR DVS Challenge 2026', type: 'opportunity' },
  ];
  const edges = [
    { id: 'e1', source: 'n1', target: 'n2', relationship: 'CORE_RESEARCH_THEME' },
    { id: 'n2', source: 'n2', target: 'n3', relationship: 'FACULTY_ADVISOR' },
    { id: 'n3', source: 'n3', target: 'n4', relationship: 'CONTRIBUTED_DATASET' },
    { id: 'n4', source: 'n1', target: 'n5', relationship: 'PRODUCES_PUBLICATION' },
    { id: 'n5', source: 'n5', target: 'n6', relationship: 'BENCHMARKS_AGAINST' },
  ];

  let filteredNodes = nodes;
  if (filter_type && filter_type !== 'all') {
    filteredNodes = nodes.filter((n) => n.type === filter_type);
  }

  res.json({ nodes: filteredNodes, edges });
});

// ============================================================================
// 11. SOCIAL MEDIA (GET /posts, POST /generate)
// ============================================================================

fastApiCompatRouter.get('/social/posts', (_req: Request, res: Response) => {
  res.json(fastApiSocialPosts);
});

fastApiCompatRouter.post('/social/generate', async (req: Request, res: Response) => {
  const { topic = 'Neuromorphic Vision Paper', platform = 'twitter' } = req.body;

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Draft a high-engagement ${platform} post about: ${topic}`,
    });

    const newPost = {
      id: `post-${Date.now()}`,
      content: response.text || `Draft post about ${topic}`,
      scheduled_time: new Date(Date.now() + 86400000).toISOString(),
      platform: platform as any,
      status: 'draft' as const,
      tags: ['#AI', '#Research'],
      engagement_estimate: 2400,
    };

    fastApiSocialPosts.unshift(newPost);
    res.json(newPost);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to generate post' });
  }
});

// ============================================================================
// 12. STARTUP GROWTH (GET /landing-pages, GET /pitch-decks, POST /landing-page, POST /pitch-deck)
// ============================================================================

fastApiCompatRouter.get('/startup/landing-pages', (_req: Request, res: Response) => {
  res.json(fastApiLandingPages);
});

fastApiCompatRouter.get('/startup/pitch-decks', (_req: Request, res: Response) => {
  res.json(fastApiPitchDecks);
});

fastApiCompatRouter.post('/startup/landing-page', async (req: Request, res: Response) => {
  const { product_name = 'CampusBookRent', value_proposition = 'Textbook rentals for Indian universities' } = req.body;

  try {
    const ai = getGenAI();
    const systemInstruction = `Generate a high-converting landing page HTML preview and copy for "${product_name}" with value proposition "${value_proposition}".
Return valid JSON with:
- title: string
- headline: string
- subheadline: string
- conversion_features: string[]
- html_preview: string`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Landing page for ${product_name}`,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newPage = {
      id: `lp-${Date.now()}`,
      title: parsed.title || product_name,
      slug: product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      headline: parsed.headline || `Empowering ${product_name}`,
      subheadline: parsed.subheadline || value_proposition,
      conversion_features: parsed.conversion_features || ['Instant verification', '24/7 support'],
      html_preview: parsed.html_preview || `<div><h1>${product_name}</h1><p>${value_proposition}</p></div>`,
      created_at: new Date().toISOString(),
    };

    fastApiLandingPages.unshift(newPage);
    res.json(newPage);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to generate landing page' });
  }
});

fastApiCompatRouter.post('/startup/pitch-deck', async (req: Request, res: Response) => {
  const { product_name = 'CampusBookRent', problem = 'High textbook costs', market = '$2.8B India Higher Ed' } = req.body;

  try {
    const ai = getGenAI();
    const systemInstruction = `Generate a 10-slide VC Pitch Deck outline for "${product_name}" solving "${problem}" in "${market}".
Return valid JSON with:
- title: string
- tagline: string
- target_market_tam: string
- slides_outline: { slide_number: number, title: string, key_points: string[] }[]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Pitch deck outline for ${product_name}`,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newDeck = {
      id: `deck-${Date.now()}`,
      title: parsed.title || `${product_name} Pitch Deck`,
      tagline: parsed.tagline || `Disrupting ${market}`,
      target_market_tam: parsed.target_market_tam || market,
      slides_outline: parsed.slides_outline || [
        { slide_number: 1, title: 'Problem', key_points: [problem] },
        { slide_number: 2, title: 'Solution', key_points: [`Our solution: ${product_name}`] },
      ],
      created_at: new Date().toISOString(),
    };

    fastApiPitchDecks.unshift(newDeck);
    res.json(newDeck);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to generate pitch deck' });
  }
});

// ============================================================================
// 13. AI LAB (GET /ai-lab/models)
// ============================================================================

fastApiCompatRouter.get('/ai-lab/models', (_req: Request, res: Response) => {
  res.json(fastApiModelRouterConfig);
});

// ============================================================================
// 14. MOD 0: PRE-FLIGHT APPLICATION DOSSIER & GOOGLE DOCS AUTO-FILLER
// ============================================================================

let fastApiApplicationDossiers: Record<string, any> = {
  'appr-1': {
    id: 'dossier-nsf-career-2026',
    approval_id: 'appr-1',
    opportunity_id: 'opp-101',
    opportunity_title: 'NSF CAREER: Cyber-Physical and Autonomous Systems (CPAS)',
    opportunity_type: 'nsf_grant',
    target_agency: 'National Science Foundation (CISE/CCF)',
    submission_deadline: '2026-09-15',
    nature_analysis: {
      competition_tone: 'Rigorous Academic & Fundamental Science',
      key_evaluation_criteria: [
        'Intellectual Merit: Algorithmic novelty and theoretical convergence proofs',
        'Broader Impacts: Educational curriculum integration and open-source dissemination',
        'Early-Career Faculty Leadership and 5-Year Research Trajectory',
      ],
      doc_selection_rationale:
        'Matched and prioritized Academic CV & Publications doc over Commercial Startup pitch doc. Selected sparse coding theorems, ICML publications, and lab pedagogy over commercial monetization metrics.',
      selected_google_docs: [
        {
          doc_name: 'Google Doc: Jun Phookan Master Research Bio & Publications (2026)',
          doc_id: 'gdoc-bio-academic-2026',
          extracted_focus: 'Neuromorphic spike coding, 4 first-author papers, 18 citations, NSF reviewer track',
          relevance_weight: 0.95,
        },
        {
          doc_name: 'Google Doc: NSF / DARPA Prior Research Impact Dossier',
          doc_id: 'gdoc-prior-impact',
          extracted_focus: 'Prior NSF-funded sub-millisecond DVS benchmark dataset and university hardware testbeds',
          relevance_weight: 0.92,
        },
      ],
    },
    applicant_profile: {
      full_name: 'Dr. Jun Phookan',
      affiliation: 'Autonomous Perception & Neuromorphic Systems Lab',
      email: 'junphookan@gmail.com',
      biography:
        'Dr. Jun Phookan conducts fundamental research at the intersection of biological vision, event-based neuromorphic processing, and decentralized autonomous robotics. His lab pioneers event-driven graph neural networks operating at sub-millisecond latencies and milliwatt power budgets.',
      selected_publications: [
        'Phookan et al. "Asynchronous Event-Based Graph Neural Networks for Dynamic Scene Flow Estimation", arXiv:2603.11984 (2026)',
        'Rostova & Phookan. "Sparse Spike-Timing-Dependent Plasticity in Multi-Modal Robot Locomotion", IEEE Trans. Robotics (2026)',
      ],
      relevant_awards: [
        'Best Paper Runner-up, CVPR Neuromorphic Vision Workshop (2025)',
        'Stanford Neuromorphic Early Career Fellow (2024)',
      ],
      github_or_portfolio: 'https://github.com/atlas-ai/neuromorphic-flow',
    },
    sections: [
      {
        id: 'sec-1',
        title: 'Section 1: Project Summary & High-Level Abstract',
        field_key: 'project_summary',
        content:
          'This Faculty Early Career Development (CAREER) project establishes the theoretical and algorithmic foundations of asynchronous neuromorphic spatial intelligence. By replacing conventional frame-based visual representations with continuous-time spatio-temporal event graphs, this project enables autonomous micro-robotics to navigate dynamic, unstructured environments at speeds exceeding 1,200 deg/s.',
        char_count: 421,
        max_char_limit: 2500,
        source_doc_origin: 'Google Doc: Jun Phookan Master Research Bio (Section: Long-term Vision)',
        confidence_score: 98,
        nature_adaptation_note: 'Tailored specifically to CISE/CCF emphasis on foundational computing paradigms.',
      },
      {
        id: 'sec-2',
        title: 'Section 2: Intellectual Merit & Theoretical Breakthrough',
        field_key: 'intellectual_merit',
        content:
          'The intellectual merit lies in three interrelated breakthroughs: (1) Formulating continuous-time graph attention operators with formal asymptotic convergence proofs on non-Euclidean Riemannian manifolds; (2) Developing sparse spike-timing-dependent plasticity (STDP) adaptation rules that eliminate catastrophic forgetting during continuous online locomotion; and (3) Creating an event-driven asynchronous message passing protocol on Loihi-2 and Prophesee EVK4 silicon.',
        char_count: 512,
        max_char_limit: 4000,
        source_doc_origin: 'Google Doc: NSF / DARPA Prior Research Impact (Section: Theoretical Formalisms)',
        confidence_score: 96,
        nature_adaptation_note: 'Selected rigorous mathematical formulation over empirical heuristics.',
      },
      {
        id: 'sec-3',
        title: 'Section 3: Broader Impacts & Educational Outreach',
        field_key: 'broader_impacts',
        content:
          'The broader impacts are structured around three pillars: (1) Curriculum Innovation: Introducing a hands-on "Bio-Inspired Robotics & Neuromorphic Vision" laboratory course reaching 120+ undergraduates annually; (2) Open Science: Releasing open-source event-camera benchmarks (EV-SLAM-2026) and pre-trained PyTorch/TensorRT checkpoints; and (3) Broadening Participation: Mentoring underrepresented high school students through the Summer Science Research Institute.',
        char_count: 494,
        max_char_limit: 3000,
        source_doc_origin: 'Google Doc: Jun Phookan Master Research Bio (Section: Pedagogy & DEI Commitments)',
        confidence_score: 94,
        nature_adaptation_note: 'Highlighted undergraduate research mentorship and open-source lab kits.',
      },
    ],
    budget_table: [
      { item: 'Graduate Research Assistant (2 PhD Students, 5 Years)', category: 'personnel', amount_usd: 280000, justification: 'Direct tuition + stipend for core algorithm development and robotic testbed experiments.' },
      { item: 'Prophesee EVK4 HD Event Cameras & Jetson Orin Nodes', category: 'equipment', amount_usd: 64000, justification: 'High-speed event-based hardware validation testbeds.' },
      { item: 'Cloud GPU Compute Credits (A100/H100)', category: 'compute', amount_usd: 48000, justification: 'Distributed neural graph training and ablation validation.' },
      { item: 'Conference Travel & Dissemination (CVPR/ICRA/ICML)', category: 'travel', amount_usd: 34000, justification: 'Disseminating findings and organizing annual workshops.' },
      { item: 'University Indirect Costs (F&A @ 52.5%)', category: 'indirect', amount_usd: 223850, justification: 'Institutional facilities, administration, and compliance support.' },
    ],
    compliance_checklist: [
      { rule: 'NSF FastLane / Research.gov 15-Page Project Description limit', satisfied: true, verification_note: 'Current compiled PDF draft is 14.8 pages.' },
      { rule: 'Font size >= 10pt with 1-inch margins on all sides', satisfied: true, verification_note: 'Verified with LaTeX template nsf_career_2026.cls.' },
      { rule: 'Data Management Plan & Postdoctoral Mentoring Plan attached', satisfied: true, verification_note: 'DMP and Mentoring docs verified and bundled.' },
      { rule: 'Departmental Letter of Support from Dean / Department Chair', satisfied: true, verification_note: 'Signed letter received on 2026-08-10.' },
    ],
    status: 'pending_approval',
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  },
};

fastApiCompatRouter.get('/approvals/:id/application-dossier', (req: Request, res: Response) => {
  const { id } = req.params;
  const dossier = fastApiApplicationDossiers[id] || fastApiApplicationDossiers['appr-1'];
  res.json(dossier);
});

fastApiCompatRouter.put('/approvals/:id/application-dossier', (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedDossier = {
    ...req.body,
    last_modified: new Date().toISOString(),
  };
  fastApiApplicationDossiers[id] = updatedDossier;
  res.json(updatedDossier);
});

fastApiCompatRouter.post('/approvals/auto-fill-dossier', async (req: Request, res: Response) => {
  const { opportunity_id = 'opp-101', selected_docs } = req.body;
  try {
    const ai = getGenAI();
    const systemInstruction = `You are the Atlas AI Application Auto-Filler (Mod 0).
Given an opportunity, analyze the nature of the competition/grant (academic, hackathon, VC startup pitch, or creative grant).
Decide which achievements from the user's pre-accessible Google Docs are most suitable, explain the rationale, and fill out the full application fields with high precision.
Return valid JSON adhering to the ApplicationDossier schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a pre-flight application dossier for opportunity ${opportunity_id} with selected docs: ${JSON.stringify(selected_docs || ['Google Doc: Jun Phookan Master CV 2026'])}`,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newDossier = {
      id: `dossier-${Date.now()}`,
      opportunity_id,
      opportunity_title: parsed.opportunity_title || 'Application Submission',
      opportunity_type: parsed.opportunity_type || 'nsf_grant',
      target_agency: parsed.target_agency || 'Funding Agency',
      submission_deadline: parsed.submission_deadline || '2026-09-30',
      nature_analysis: parsed.nature_analysis || {
        competition_tone: 'Competitive & Rigorous',
        key_evaluation_criteria: ['Technical Depth', 'Feasibility', 'Impact'],
        doc_selection_rationale: 'Adapted technical papers and accomplishments matching the target evaluation matrix.',
        selected_google_docs: [
          { doc_name: 'Google Doc: Jun Phookan Master CV 2026', doc_id: 'gdoc-cv-2026', extracted_focus: 'Primary research & credentials', relevance_weight: 0.95 },
        ],
      },
      applicant_profile: parsed.applicant_profile || {
        full_name: 'Dr. Jun Phookan',
        affiliation: 'Autonomous Perception Lab',
        email: 'junphookan@gmail.com',
        biography: 'Specializes in neuromorphic computing and biological vision.',
        selected_publications: ['Phookan et al. 2026'],
        relevant_awards: ['National Science Fellowship 2025'],
        github_or_portfolio: 'https://github.com/atlas-ai',
      },
      sections: parsed.sections || [
        {
          id: 'sec-1',
          title: 'Section 1: Executive Summary',
          field_key: 'executive_summary',
          content: 'Proposed project for high-impact innovation.',
          char_count: 210,
          source_doc_origin: 'Google Doc: Jun Phookan Master CV',
          confidence_score: 95,
          nature_adaptation_note: 'Optimized for competition criteria.',
        },
      ],
      budget_table: parsed.budget_table || [
        { item: 'Core Personnel', category: 'personnel', amount_usd: 150000, justification: 'Principal Investigator and Lead Engineer.' },
      ],
      compliance_checklist: parsed.compliance_checklist || [
        { rule: 'All required sections completed', satisfied: true, verification_note: 'Verified with automated linter.' },
      ],
      status: 'draft',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    };

    fastApiApplicationDossiers[newDossier.id] = newDossier;
    res.json(newDossier);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to auto-fill application dossier' });
  }
});

// ============================================================================
// 15. MOD 1: MULTI-CHANNEL OPPORTUNITY SURVEILLANCE & TOOL DISPATCHER
// ============================================================================

let multiChannelOpportunities: any[] = [
  {
    id: 'mcopp-insta-1',
    title: 'Schmidt Science AI in Nature Fellowship ($500k/yr)',
    source: 'Instagram Search (@schmidt_science / Tech Creator Reels)',
    source_channel: 'instagram_search',
    creator_or_channel_name: '@schmidt_science & @biomimicry_institute',
    content_category: 'whimsical_creativity',
    match_score: 96,
    signal_quality_score: 98,
    brainrot_filtered: true,
    deadline: '2026-10-15',
    url: 'https://instagram.com/p/schmidt-polymath-2026',
    funding_amount: '$2,500,000',
    status: 'new',
    description:
      'Discovered via Instagram search on #AIResearch #Biomimicry: 5-year flexible fellowship funding wild, out-of-the-box interdisciplinary science inspired by natural organisms.',
    extracted_actionable_ideas: [
      'Slime mold Physarum polycephalum Steiner-tree routing for decentralized P2P logistics',
      'Mantis shrimp 16-channel hyperspectral polarization vision for sub-surface autonomous drones',
    ],
    actionable_winning_advice: [
      'Focus 60% of the narrative on the fundamental biological mystery, 40% on the computational paradigm shift.',
      'Explicitly outline how the project embraces high-risk, high-reward failure modes.',
    ],
    winner_intelligence: {
      winner_names: ['Dr. Sarah Lin (2025 Schmidt Fellow)', 'Prof. Marcus Vance (2024 Fellow)'],
      winning_project_titles: ['Tardigrade Desiccation Peptides for Cryo-Preservation Algorithms'],
      key_tactics: [
        'Recorded a 2-minute whiteboard video demonstrating the biological insight in action',
        'Directly addressed the philosophical question: "Why has nature solved this better than standard silicon?"',
      ],
      youtube_breakdown_urls: [
        { title: 'How Dr. Lin Won Schmidt Fellowship 2025', url: 'https://youtube.com/watch?v=schmidt-breakdown-2025', takeaway: 'Highlight failure resilience and interdisciplinary boldness.' },
      ],
      drafted_outreach_template:
        'Dear Dr. Lin, I deeply admired your 2025 Schmidt Polymath paper on tardigrade peptide computation. My lab is building a neuromorphic spatial perception engine inspired by retinal ganglion spike encoding. Would you be open to a 10-minute chat regarding how you framed interdisciplinary risk in your application?',
      post_mortem_notes: 'Committee strongly rejects standard incremental papers. Wants true paradigm shifts.',
    },
    deployable_tools: ['strawberry_browser', 'replit', 'n8n', 'codex', 'github_vercel'],
    deployment_status: [
      { tool: 'strawberry_browser', status: 'deployed', link: 'https://strawberry.atlas.ai/session/schmidt-fill' },
      { tool: 'replit', status: 'sandboxed', link: 'https://replit.com/@jun/biomimetic-slime-router' },
    ],
  },
  {
    id: 'mcopp-pinterest-2',
    title: 'Fast Forward Tech Non-Profit Accelerator ($100,000 Grant)',
    source: 'Pinterest Biomimetic & Creative Design Boards',
    source_channel: 'pinterest_board',
    creator_or_channel_name: 'Pinterest / @creative_tech_grants',
    content_category: 'non_profit_initiative',
    match_score: 92,
    signal_quality_score: 94,
    brainrot_filtered: true,
    deadline: '2026-09-20',
    url: 'https://pinterest.com/pin/ffwd-nonprofit-tech-2026',
    funding_amount: '$100,000',
    status: 'new',
    description:
      'Curated from Pinterest Creative Tech board: Open-source AI tools for biodiversity preservation and decentralized climate monitoring.',
    extracted_actionable_ideas: [
      'Solar-powered autonomous acoustic sensors detecting endangered avian calls using edge-CNNs',
      'Whimsical interactive map visualizing micro-pollinator flight vectors in real-time',
    ],
    actionable_winning_advice: [
      'Demonstrate clear open-source governance and non-profit community adoption metrics.',
    ],
    deployable_tools: ['n8n', 'codex', 'github_vercel', 'replit'],
  },
  {
    id: 'mcopp-snowday-3',
    title: 'Snowday & Youth Opportunities Global Venture Fellowship',
    source: 'Snowday.ai & Opportunities For Youth Digest',
    source_channel: 'snowday_portal',
    creator_or_channel_name: 'Snowday Curated Youth List & Substack Dispatch',
    content_category: 'entrepreneurship_advice',
    match_score: 94,
    signal_quality_score: 96,
    brainrot_filtered: true,
    deadline: '2026-10-01',
    url: 'https://snowday.ai/opps/youth-venture-2026',
    funding_amount: '$50,000',
    status: 'new',
    description:
      'Ingested from weekly Snowday newsletter: Seed grants and 1-on-1 mentorship from top founders for technical CS projects that rethink physical infrastructure.',
    extracted_actionable_ideas: [
      'CampusBookRent: Peer-to-peer textbook escrow lockers using smart QR validation',
      'Decentralized laboratory equipment sharing protocol for undergraduate researchers',
    ],
    actionable_winning_advice: [
      'Show working MVP metrics within the first 30 seconds of the pitch video.',
    ],
    deployable_tools: ['strawberry_browser', 'replit', 'codex', 'github_vercel'],
  },
];

fastApiCompatRouter.get('/opportunities/multi-channel', (_req: Request, res: Response) => {
  res.json(multiChannelOpportunities);
});

fastApiCompatRouter.post('/opportunities/multi-channel-scan', async (req: Request, res: Response) => {
  const { channels = ['instagram_search', 'pinterest_board', 'linkedin_research', 'email_newsletter', 'snowday_portal'], filter_brainrot = true } = req.body;

  try {
    const ai = getGenAI();
    const systemInstruction = `You are the Atlas AI Multi-Channel Surveillance Engine (Mod 1).
Search and synthesize new competitions, awards, non-profit initiatives, grants, CS projects, whimsical creative tech ideas, and entrepreneurship advice from channels: ${channels.join(', ')}.
STRICT ANTI-BRAINROT FILTER: Reject generic marketing slop, get-rich-quick schemes, or clickbait. Prioritize high-signal, creative, advanced technical ideas.
Return valid JSON array of MultiChannelOpportunity objects.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Scan feeds across ${channels.join(', ')} with anti_brainrot=${filter_brainrot} and extract new competitions and projects.`,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      multiChannelOpportunities = [...parsed, ...multiChannelOpportunities];
    }
    broadcastSSE('multi_channel_ingested', { count: multiChannelOpportunities.length });
    res.json(multiChannelOpportunities);
  } catch (err: any) {
    res.json(multiChannelOpportunities);
  }
});

fastApiCompatRouter.get('/opportunities/:id/winner-intelligence', (req: Request, res: Response) => {
  const opp = multiChannelOpportunities.find((o) => o.id === req.params.id) || multiChannelOpportunities[0];
  res.json(opp.winner_intelligence || {
    winner_names: ['Prior Winner Alex Rivers', 'Team NeuroVision (1st Place 2025)'],
    winning_project_titles: ['Sub-Millisecond Event Vision on Edge TPUs'],
    key_tactics: ['Open-sourced complete Docker container and clean benchmark reproduction script'],
    youtube_breakdown_urls: [{ title: 'How We Placed #1 in CVPR Challenge', url: 'https://youtube.com/watch?v=demo', takeaway: 'Optimize for latency constraints early.' }],
    drafted_outreach_template: 'Hi Alex, loved your submission last year. Reaching out to ask how you tuned hyperparameters for the test dataset.',
    post_mortem_notes: 'Judges placed 40% weight on code readability and clean documentation.',
  });
});

fastApiCompatRouter.post('/opportunities/:id/dispatch-tool', (req: Request, res: Response) => {
  const { tool = 'replit' } = req.body;
  const opp = multiChannelOpportunities.find((o) => o.id === req.params.id);

  const workspaceUrls: Record<string, string> = {
    strawberry_browser: 'https://strawberry.browser.internal/session/' + (opp?.id || 'live-session'),
    replit: 'https://replit.com/@jun/atlas-project-' + Date.now().toString(36),
    n8n: 'https://n8n.workflow.internal/workflow/atlas-trigger-2026',
    codex: 'https://codex.atlas.ai/workspace/project-builder',
    deepseek: 'https://deepseek.atlas.ai/r1-backend-codegen',
    github_vercel: 'https://github.com/atlas-ai/autonomous-venture-deploy',
    figma: 'https://figma.com/@atlas/whimsical-ui-canvas',
  };

  res.json({
    success: true,
    tool,
    status: 'deployed',
    workspace_url: workspaceUrls[tool] || 'https://atlas.ai/tools/executor',
    message: `Successfully connected and deployed project blueprint to ${tool.toUpperCase()} execution environment.`,
  });
});

// ============================================================================
// 16. RESEARCH SCIENTIST: BIOMIMICRY NATURE INSPIRATION & END-TO-END PROJECTS
// ============================================================================

let biomimicryProjects: any[] = [
  {
    id: 'bio-1',
    organism_name: 'Physarum polycephalum (True Slime Mold)',
    biological_kingdom: 'Protista (Amoebozoa)',
    natural_phenomenon:
      'Protoplasmic rhythmic oscillations create dynamically self-healing, minimum Steiner-tree networks without centralized control.',
    inquiry_question:
      'Can tubular hydrostatic pressure dynamics be mapped onto decentralized peer-to-peer edge routing to minimize packet latency under 60% node dropouts?',
    computational_translation:
      'Continuous differential flux model: Conductivity D_ij evolves as dD_ij/dt = f(|Q_ij|) - gamma * D_ij where Q_ij is current flow.',
    mathematical_formulation:
      '\\frac{dD_{ij}}{dt} = |Q_{ij}|^{\\mu} - \\gamma D_{ij}, \\quad \\sum_{j} Q_{ij} = I_i',
    pytorch_simulation_code: `# Physarum Polycephalum Adaptive Flow Solver in PyTorch
import torch
import torch.nn as nn

class SlimeMoldRouter(nn.Module):
    def __init__(self, num_nodes=100, mu=1.2, gamma=0.3):
        super().__init__()
        self.num_nodes = num_nodes
        self.mu = mu
        self.gamma = gamma
        self.D = nn.Parameter(torch.rand(num_nodes, num_nodes) + 0.1)
        
    def step_flow(self, flux_sources, dt=0.01):
        # Hydrostatic Laplace solver
        L = torch.diag(self.D.sum(dim=-1)) - self.D
        pinv_L = torch.pinverse(L + 1e-4 * torch.eye(self.num_nodes))
        pressures = torch.matmul(pinv_L, flux_sources)
        Q = self.D * (pressures.unsqueeze(1) - pressures.unsqueeze(0))
        dD = (torch.abs(Q) ** self.mu) - self.gamma * self.D
        self.D.data.add_(dD * dt).clamp_(min=1e-5)
        return Q, pressures
`,
    experimental_results_summary:
      'Simulation of 500 edge nodes demonstrates 99.4% packet delivery with 3.2x lower routing overhead compared to standard Dijkstra / OSPF routing under high packet loss.',
    latex_preprint_abstract:
      'Biological slime molds solve NP-hard topological routing through local hydrodynamic adaptation. We formulate the Physarum-Inspired Distributed Router (PIDR), proving asymptotic convergence to the minimum Steiner graph and benchmarking against IEEE 802.11s mesh networks.',
    verification_benchmarks: ['NS-3 Network Simulator', 'EV-IMO Real-World Topology', 'PyTorch Tensor Cores'],
    status: 'preprint_ready',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'bio-2',
    organism_name: 'Odontodactylus scyllarus (Peacock Mantis Shrimp)',
    biological_kingdom: 'Animalia (Crustacea)',
    natural_phenomenon:
      'Compound ommatidia with 16 distinct photoreceptor pigments sensitive to linear and circular polarization states across UV, visible, and near-IR.',
    inquiry_question:
      'Can circular polarization stokes-vector filtering be synthesized with event-camera asynchronous spiking to penetrate extreme turbidity and dense fog?',
    computational_translation:
      'Stokes parameter estimation on unbinned micro-polarizer event spikes: S_0, S_1, S_2, S_3 calculated per spatial quadrant.',
    mathematical_formulation:
      'S_0 = I_0 + I_{90}, \\quad S_1 = I_0 - I_{90}, \\quad S_2 = I_{45} - I_{135}, \\quad DoLP = \\frac{\\sqrt{S_1^2 + S_2^2}}{S_0}',
    pytorch_simulation_code: `# Mantis Shrimp Polarization Spiking Encoder
import torch

def compute_stokes_events(spike_quadrants):
    # spike_quadrants: (B, 4, H, W) containing [0deg, 45deg, 90deg, 135deg]
    I0, I45, I90, I135 = torch.chunk(spike_quadrants, 4, dim=1)
    S0 = I0 + I90 + 1e-6
    S1 = I0 - I90
    S2 = I45 - I135
    dolp = torch.sqrt(S1**2 + S2**2) / S0
    return dolp.clamp(0.0, 1.0)
`,
    experimental_results_summary:
      'Recovers 94.8% edge contrast in synthetic 200m dense fog simulations where standard RGB camera visibility falls to 12%.',
    latex_preprint_abstract:
      'We present MantisVision: An Asynchronous Stokes-Vector Event Spiking Network for zero-latency optical tracking in high-scattering oceanic and atmospheric media.',
    verification_benchmarks: ['AirSim Fog Simulation', 'Prophesee DVS Event Streams'],
    status: 'simulated',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

fastApiCompatRouter.get('/research/biomimicry-projects', (_req: Request, res: Response) => {
  res.json(biomimicryProjects);
});

fastApiCompatRouter.post('/research/biomimicry-projects', async (req: Request, res: Response) => {
  const { organism_name = 'Tardigrade (Hypsibius exemplaris)', inquiry_question = 'How do intrinsically disordered proteins protect molecular state during complete desiccation?' } = req.body;

  try {
    const ai = getGenAI();
    const systemInstruction = `You are the Atlas AI Lead Biomimetic Research Scientist.
Observe the natural biological phenomenon of the specified organism, ask a profound fundamental question, translate it into a computational mathematical model, generate PyTorch simulation code, and draft the scientific preprint abstract.
Return valid JSON adhering to BiomimicryResearchProject schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Formulate a complete end-to-end biomimetic project for ${organism_name}: "${inquiry_question}"`,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newProject = {
      id: `bio-${Date.now()}`,
      organism_name: parsed.organism_name || organism_name,
      biological_kingdom: parsed.biological_kingdom || 'Animalia',
      natural_phenomenon: parsed.natural_phenomenon || 'Biological state preservation mechanism.',
      inquiry_question: parsed.inquiry_question || inquiry_question,
      computational_translation: parsed.computational_translation || 'Translating biological mechanism to computational algorithm.',
      mathematical_formulation: parsed.mathematical_formulation || 'E(x) = \\sum w_i \\phi_i(x)',
      pytorch_simulation_code: parsed.pytorch_simulation_code || '# PyTorch implementation\nimport torch\n',
      experimental_results_summary: parsed.experimental_results_summary || 'Validation confirms 98% state recovery under sudden simulated power failure.',
      latex_preprint_abstract: parsed.latex_preprint_abstract || 'Abstract of the novel scientific discovery.',
      verification_benchmarks: parsed.verification_benchmarks || ['PyTorch Benchmarking', 'Memory Persistence Test'],
      status: 'simulated',
      created_at: new Date().toISOString(),
    };

    biomimicryProjects.unshift(newProject);
    broadcastSSE('biomimicry_simulated', newProject);
    res.json(newProject);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate biomimicry project' });
  }
});

// ============================================================================
// 17. AUTONOMOUS SIDE HUSTLES (DEEPSEEK BACKEND + GEMINI AI STUDIO)
// ============================================================================

let sideHustleAutonomousExecutions: any[] = [
  {
    id: 'hustle-1',
    title: 'BioSim-as-a-Service: Cloud Neuromorphic Simulator',
    tagline: 'High-speed synthetic event-camera stream generation for autonomous drone & robotics developers',
    category: 'biomimicry_saas',
    uniqueness_score: 97,
    deepseek_backend_architecture: {
      framework: 'FastAPI + DeepSeek R1 Inference Engine',
      core_routes: [
        { endpoint: '/api/v1/simulate-event-stream', method: 'POST', description: 'Converts standard mp4 or 3D blender scene to 10M events/sec DVS stream' },
        { endpoint: '/api/v1/stokes-polarization-filter', method: 'POST', description: 'Applies biomimetic mantis shrimp circular polarization filtering' },
        { endpoint: '/api/v1/stripe/webhook', method: 'POST', description: 'Instant token provisioning on subscription checkout' },
      ],
      python_backend_code: `# DeepSeek R1 + FastAPI Backend for BioSim SaaS
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import torch
import numpy as np

app = FastAPI(title="BioSim API (Powered by DeepSeek R1 & Google AI Studio)")

class SimulationRequest(BaseModel):
    video_fps: int = 1000
    contrast_threshold: float = 0.15
    polarization_mode: bool = True

@app.post("/api/v1/simulate-event-stream")
async def simulate_stream(req: SimulationRequest):
    # Asynchronous temporal intensity derivative calculation
    events_generated = int(req.video_fps * 12500 * (1.0 / req.contrast_threshold))
    return {
        "status": "success",
        "events_count": events_generated,
        "latency_ms": 4.2,
        "format": "HDF5 / ROS2 Bags compatible"
    }
`,
      gemini_ai_studio_scaffolding: `// Google AI Studio Gemini API Integration for BioSim
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Uses Gemini 3.5 Pro for synthesizing photorealistic 3D camera motion trajectories
`,
    },
    monetization_model: 'Usage-Based Subscription + API Credits',
    pricing_tiers: [
      { tier: 'Hobbyist', price: '$29/mo', features: ['100k simulated seconds', '1080p resolution', 'Standard DVS format'] },
      { tier: 'Robotics Pro', price: '$149/mo', features: ['Unlimited event generation', 'Stokes polarization filters', 'ROS2 live stream pipeline'] },
    ],
    target_mrr: '$12,500 MRR (Targeting 80 autonomous drone labs & startups)',
    live_status: 'deployed',
    created_at: new Date().toISOString(),
  },
  {
    id: 'hustle-2',
    title: 'GrantSherpa: Automated Grant Watchdog & Proposal Copilot',
    tagline: 'Autonomous AI agent that monitors 40+ grant databases and drafts winning institutional compliance proposals',
    category: 'grant_automation',
    uniqueness_score: 95,
    deepseek_backend_architecture: {
      framework: 'FastAPI + DeepSeek R1 + Google AI Studio Gemini 3.5',
      core_routes: [
        { endpoint: '/api/v1/crawl-grants-live', method: 'POST', description: 'Surveys Grants.gov, DARPA, and private foundations' },
        { endpoint: '/api/v1/draft-compliance-dossier', method: 'POST', description: 'Generates full 15-page NSF/NIH proposal drafts with budget breakdowns' },
      ],
      python_backend_code: `# GrantSherpa Automated Surveillance Daemon
from fastapi import FastAPI
import httpx

app = FastAPI(title="GrantSherpa Backend")

@app.post("/api/v1/crawl-grants-live")
async def crawl():
    return {"status": "scanned", "new_rfps_indexed": 42, "high_match_count": 6}
`,
      gemini_ai_studio_scaffolding: `// Gemini 3.5 Pro for multi-section institutional budget justifications`,
    },
    monetization_model: 'SaaS License ($99/mo per lab) + 1.5% success fee on won grants',
    pricing_tiers: [
      { tier: 'Single PI Lab', price: '$99/mo', features: ['Up to 5 simultaneous grant drafts', 'Daily email RFP alerts', 'Budget optimizer'] },
      { tier: 'University Department', price: '$499/mo', features: ['Unlimited faculty seats', 'Custom institutional compliance rules', 'Dedicated webhook API'] },
    ],
    target_mrr: '$19,800 MRR (200 academic labs)',
    live_status: 'code_generated',
    created_at: new Date().toISOString(),
  },
];

fastApiCompatRouter.get('/startup/side-hustles', (_req: Request, res: Response) => {
  res.json(sideHustleAutonomousExecutions);
});

fastApiCompatRouter.post('/startup/side-hustles/generate-deepseek-backend', async (req: Request, res: Response) => {
  const { title = 'Generative Biomimetic Shaders', category = 'generative_shaders', tagline = 'Procedural biological shaders for game studios' } = req.body;

  try {
    const ai = getGenAI();
    const systemInstruction = `You are the Atlas AI Venture Architect & Code Generator.
Design an out-of-the-box, advanced, unique, creative side hustle project.
Generate complete production-ready DeepSeek R1 Python FastAPI backend code and Google AI Studio Gemini API prompt scaffolding.
Return valid JSON adhering to SideHustleAutonomousExecution schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Create an autonomous side hustle for "${title}" (${category}): "${tagline}". Include complete DeepSeek backend python code and monetization strategy.`,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newHustle = {
      id: `hustle-${Date.now()}`,
      title: parsed.title || title,
      tagline: parsed.tagline || tagline,
      category: parsed.category || category,
      uniqueness_score: parsed.uniqueness_score || 94,
      deepseek_backend_architecture: parsed.deepseek_backend_architecture || {
        framework: 'FastAPI + DeepSeek R1',
        core_routes: [
          { endpoint: '/api/v1/generate', method: 'POST', description: 'Core generation route' },
        ],
        python_backend_code: '# FastAPI Backend\nfrom fastapi import FastAPI\napp = FastAPI()\n',
        gemini_ai_studio_scaffolding: '// Google AI Studio Integration\n',
      },
      monetization_model: parsed.monetization_model || 'Subscription SaaS',
      pricing_tiers: parsed.pricing_tiers || [
        { tier: 'Starter', price: '$49/mo', features: ['Full API Access'] },
      ],
      target_mrr: parsed.target_mrr || '$8,000 MRR',
      live_status: 'code_generated',
      created_at: new Date().toISOString(),
    };

    sideHustleAutonomousExecutions.unshift(newHustle);
    res.json(newHustle);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate DeepSeek side hustle backend' });
  }
});

// ============================================================================
// 18. MULTI-AI ENSEMBLE COGNITIVE CO-REASONING
// ============================================================================

let ensembleHistory: any[] = [
  {
    id: 'ens-1',
    inquiry_topic: 'Should we prioritize asynchronous event-based vision or spiking graph transformers for the CVPR benchmark?',
    context: 'Latency constraint is <15ms on Jetson Orin with severe motion blur at 1200 deg/s.',
    models_deliberating: [
      {
        model_name: 'ChatGPT (GPT-4o/o1)',
        perspective: 'Recommends hybrid Spatio-Temporal Graph Attention backbone due to strong temporal locality in DVS event clouds.',
        confidence_score: 0.94,
        critique_of_peers: 'DeepSeek’s pure MLP-mixer suggestion is fast but lacks topological invariance under sensor rotation.',
        key_proposal: 'Use 4-head temporal graph attention with linear kernel quantization.',
      },
      {
        model_name: 'DeepSeek (R1/V3)',
        perspective: 'Emphasizes extreme memory bandwidth optimization. Proposes unbinned continuous spike integration with integer quantization.',
        confidence_score: 0.96,
        critique_of_peers: 'Claude’s transformer proposal will exceed the 15ms latency limit on Jetson Orin unless tensor-RT fused.',
        key_proposal: 'Fuse sparse graph kernels directly into TensorRT custom plugins.',
      },
      {
        model_name: 'Claude (3.5 Sonnet)',
        perspective: 'Focuses on empirical generalization across novel lighting conditions and high dynamic range glare.',
        confidence_score: 0.91,
        critique_of_peers: 'Agrees with DeepSeek on latency constraints; proposes dual-branch asynchronous feature fusion.',
        key_proposal: 'Dual-path architecture: Fast asynchronous spike path (5ms) + periodic global context anchor (30ms).',
      },
      {
        model_name: 'Grok (2)',
        perspective: 'Advocates for real-world robustness against adversarial lens flare and sensor noise bursts.',
        confidence_score: 0.89,
        critique_of_peers: 'Points out that standard benchmarks fail to model rapid solar glare transitions.',
        key_proposal: 'Add adaptive noise thresholding tuned to ambient illuminance.',
      },
      {
        model_name: 'Perplexity (Sonar)',
        perspective: 'Provides real-time arXiv benchmark citations: Recent SOTA on MVSEC dataset achieves 94.2% mIoU using ST-GNN.',
        confidence_score: 0.93,
        critique_of_peers: 'Verifies that recent ICRA 2026 papers favor graph transformers over classical 3D convolutions.',
        key_proposal: 'Adopt ST-GNN architecture validated in recent literature.',
      },
      {
        model_name: 'Gemini (3.5 Pro)',
        perspective: 'Synthesizes mathematical convergence proofs and establishes formal error bounds on non-Euclidean manifolds.',
        confidence_score: 0.97,
        critique_of_peers: 'Unifies DeepSeek’s TensorRT kernel optimization with Claude’s dual-branch architecture.',
        key_proposal: 'Unified dual-branch Spatio-Temporal Graph Transformer compiled with TensorRT FP16 quantization.',
      },
    ],
    socratic_questions: [
      'What is the catastrophic failure mode if the sensor angular velocity exceeds 1500 deg/s for >200ms?',
      'How does quantization from FP32 to INT8 impact spike timing precision?',
      'Can the dual-branch architecture maintain deterministic latency guarantees under high spike load?',
    ],
    consensus_synthesis:
      'All 6 models agree on a Dual-Branch Spatio-Temporal Graph Attention architecture: Fast-path asynchronous spike updates run in 4.2ms via TensorRT fused kernels, while global context anchors update at 30Hz, guaranteeing <12ms latency on Jetson Orin.',
    unanimous_recommendation:
      'Implement TensorRT-fused Dual-Branch Graph Transformer (ST-GNN) and validate on the MVSEC 1200 deg/s dataset benchmark.',
    created_at: new Date().toISOString(),
  },
];

fastApiCompatRouter.post('/ai-lab/ensemble-deliberation', async (req: Request, res: Response) => {
  const { inquiry_topic = 'How should we structure our autonomous grant application?', context = 'Targeting NSF CAREER and DARPA YFA' } = req.body;

  try {
    const ai = getGenAI();
    const systemInstruction = `You are the Atlas AI Multi-Model Ensemble Orchestrator.
Simulate deep human-like co-reasoning, socratic questioning, and adversarial peer critique among leading AI models:
1. ChatGPT (GPT-4o/o1)
2. DeepSeek (R1/V3)
3. Claude (3.5 Sonnet)
4. Grok (2)
5. Perplexity (Sonar)
6. Gemini (3.5 Pro)
Each model must provide a distinct perspective, critique its peers, propose concrete solutions, ask Socratic questions, and arrive at a rigorous consensus synthesis.
Return valid JSON adhering to MultiAiEnsembleDeliberation schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Deliberate on: "${inquiry_topic}" with context: "${context}".`,
      config: { systemInstruction, responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newDeliberation = {
      id: `ens-${Date.now()}`,
      inquiry_topic: parsed.inquiry_topic || inquiry_topic,
      context: parsed.context || context,
      models_deliberating: parsed.models_deliberating || ensembleHistory[0].models_deliberating,
      socratic_questions: parsed.socratic_questions || ['How does this scale to larger workloads?'],
      consensus_synthesis: parsed.consensus_synthesis || 'Multi-model consensus achieved.',
      unanimous_recommendation: parsed.unanimous_recommendation || 'Proceed with unified plan.',
      created_at: new Date().toISOString(),
    };

    ensembleHistory.unshift(newDeliberation);
    res.json(newDeliberation);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to run multi-AI ensemble deliberation' });
  }
});

// SSE endpoint registration handler
export function handleSSEApprovals(req: Request, res: Response) {
  const userId = (req.query.user_id as string) || 'usr-jun';

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newClient = { id: clientId, res, userId };
  sseClients.push(newClient);

  // Send initial connected event
  res.write(`event: heartbeat\ndata: ${JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Periodic heartbeat
  const interval = setInterval(() => {
    try {
      res.write(`event: heartbeat\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
    } catch (e) {
      clearInterval(interval);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(interval);
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
}
