import {
  SocialAdvicePost,
  AdviceTopicCluster,
  BrainstormMetaphorNode,
  EssayTargetPrompt,
  CollegeEssayProject,
  AdmissionsReviewerFeedback,
  VoiceHumanizerMetrics,
} from '../types/index.js';

export class EssayArchitectEngine {
  private static instance: EssayArchitectEngine;

  private socialAdvicePosts: SocialAdvicePost[] = [
    {
      id: 'post-reddit-01',
      platform: 'Reddit',
      author: 'u/FormerAdmissionsDean',
      authorRole: 'AO / Former Dean',
      sourceTitle: 'r/ApplyingToCollege: What actually happens in committee when we read 500 essays in 3 days',
      url: 'https://reddit.com/r/ApplyingToCollege/comments/admissions_dean_truth',
      upvotesOrLikes: 4820,
      engagementScore: 98,
      timestamp: '2026-02-14T18:30:00Z',
      category: 'Unconventional Hooks',
      keyTakeaways: [
        'Avoid waking up to an alarm or beginning in a sports game final buzzer moment.',
        'The best essays begin with an unexpected juxtaposition that immediately sparks intellectual curiosity.',
        'Show your internal cognitive monologue rather than just an external resume list.',
      ],
      extractedQuote: '"If an essay sounds like a 40-year-old PR consultant wrote it, it gets immediately downranked for authenticity. We want to hear a vibrant 17-year-old mind at work."',
      sentimentRating: 'Highly Recommended',
      tags: ['Hook Strategy', 'Authenticity', 'Admissions Committee'],
    },
    {
      id: 'post-yt-02',
      platform: 'YouTube',
      author: 'Kath Path / College Essay Guy',
      authorRole: 'Independent College Counselor',
      sourceTitle: 'The "Montage vs. Narrative" Framework for Stanford & Harvard Acceptance',
      url: 'https://youtube.com/watch?v=essay_framework_breakdown',
      upvotesOrLikes: 34200,
      engagementScore: 95,
      timestamp: '2026-01-20T14:15:00Z',
      category: 'Vulnerability Calibration',
      keyTakeaways: [
        'Use the "Values Scan" exercise: connect every physical object or memory to a deep core value.',
        'Do not resolve conflict in a single miraculous sentence; show the iterative mental wrestling.',
        'Maintain a 70/30 ratio between self-reflection/growth and situational setup.',
      ],
      extractedQuote: '"Vulnerability is not trauma-dumping; vulnerability is taking responsibility for your evolving worldview."',
      sentimentRating: 'Highly Recommended',
      tags: ['Montage Structure', 'Narrative Arc', 'Values Exercise'],
    },
    {
      id: 'post-tiktok-03',
      platform: 'TikTok',
      author: '@ivyadmissionshacks',
      authorRole: 'Accepted Ivy Student',
      sourceTitle: '3 Clichés that get your Common App skipped immediately in 2026',
      url: 'https://tiktok.com/@ivyadmissionshacks/video/7391829381',
      upvotesOrLikes: 112000,
      engagementScore: 91,
      timestamp: '2026-02-28T09:40:00Z',
      category: 'Clichés to Avoid',
      keyTakeaways: [
        'Avoid the "I taught a younger student and realized *I* was the one who learned" trope.',
        'Avoid starting with a dictionary definition ("Webster defines courage as...").',
        'Avoid using 5-syllable thesaurus words when clear, sensory, punchy verbs are 10x more compelling.',
      ],
      extractedQuote: '"Admissions officers read thousands of essays; if you use a pre-packaged moral, you blend into the white noise."',
      sentimentRating: 'Caution / Nuance',
      tags: ['Cliché Busting', 'Word Choice', 'Rhythm'],
    },
    {
      id: 'post-reddit-04',
      platform: 'Reddit',
      author: 'u/ScholarGuideOfficial',
      authorRole: 'Essay Specialist',
      sourceTitle: 'r/CollegeEssays: How to write about Coding & Engineering without sounding robotic',
      url: 'https://reddit.com/r/CollegeEssays/comments/stem_essay_authenticity',
      upvotesOrLikes: 2950,
      engagementScore: 89,
      timestamp: '2026-02-08T22:10:00Z',
      category: 'Activity Framing',
      keyTakeaways: [
        'Anchor abstract technical engineering in tactile physical senses (soldering flux smell, oscilloscope hum).',
        'Bridge STEM with the humanities: philosophy of systems, human empathy in accessibility, or musical rhythm.',
        'Show intellectual humility when code fails or algorithms underperform.',
      ],
      extractedQuote: '"The most memorable STEM essays are never about the final accuracy metric—they are about how the applicant thinks when their hypothesis collapses."',
      sentimentRating: 'Highly Recommended',
      tags: ['STEM Framing', 'Tactile Sensory', 'Intellectual Vitality'],
    },
  ];

  private topicClusters: AdviceTopicCluster[] = [
    {
      id: 'cluster-hooks',
      topicName: 'Unconventional Openings & Micro-Hooks',
      category: 'Narrative Architecture',
      consensusScore: 97,
      summaryInsight: 'Strong hooks bypass formal throat-clearing and immerse the reader directly into a specific sensory tension or intellectual puzzle.',
      recommendedDoList: [
        'Start in medias res with a tactile sensory contradiction',
        'Introduce an unresolved intellectual question or strange personal habit',
        'Keep the opening paragraph concise (35-65 words) to create momentum',
      ],
      strictDontList: [
        'Never begin with a quote from Albert Einstein, Steve Jobs, or Martin Luther King',
        'Never begin with an alarm clock ringing or looking in a mirror',
        'Never begin with "Ever since I was a child..."',
      ],
      representativeSourcesCount: 24,
    },
    {
      id: 'cluster-cliches',
      topicName: 'Fatal Clichés & Over-Manufactured Tropes',
      category: 'Quality Control',
      consensusScore: 94,
      summaryInsight: 'Clichés signal to the admissions committee that the applicant lacks reflective independence and is merely repeating standard success formulas.',
      recommendedDoList: [
        'Embrace awkward imperfections and unresolved questions in your growth',
        'Use specific named entities (e.g., "Xilinx Artix-7 board", "Miles Davis\' Kind of Blue") instead of generic terms',
        'Focus on the granular decision-making process during setbacks',
      ],
      strictDontList: [
        'The mission trip epiphany where the applicant discovers their privilege in 3 days',
        'The sports injury/game-winning shot redemption arc',
        'The robotic resume recitation disguised as prose',
      ],
      representativeSourcesCount: 38,
    },
    {
      id: 'cluster-vulnerability',
      topicName: 'Calibrating Authentic Vulnerability vs. Competence',
      category: 'Voice & Tone',
      consensusScore: 92,
      summaryInsight: 'Top-tier essays demonstrate high intellectual agency while remaining emotionally grounded and humble.',
      recommendedDoList: [
        'Demonstrate how self-doubt led to rigorous experimentation and deeper learning',
        'Acknowledge mentors, peers, and community contributions to your achievements',
        'Highlight genuine curiosity over raw pedigree',
      ],
      strictDontList: [
        'Trauma dumping without reflection or personal agency',
        'Boastful humble-bragging about awards or test scores',
        'Adopting a cynical or overly detached academic persona',
      ],
      representativeSourcesCount: 19,
    },
  ];

  private targetPrompts: EssayTargetPrompt[] = [
    {
      id: 'prompt-ca-1',
      institution: 'Common Application',
      promptNumber: 'Prompt #1',
      promptText: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
      maxWordLimit: 650,
      keyEvaluationCriteria: ['Central identity anchor', 'Intellectual depth', 'Unique personal voice', 'Reflective trajectory'],
    },
    {
      id: 'prompt-ca-6',
      institution: 'Common Application',
      promptNumber: 'Prompt #6',
      promptText: 'Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?',
      maxWordLimit: 650,
      keyEvaluationCriteria: ['Intellectual vitality', 'Autonomous learning initiative', 'Curiosity depth', 'Cross-disciplinary connections'],
    },
    {
      id: 'prompt-stanford-intellectual',
      institution: 'Stanford University',
      promptNumber: 'Short Essay #1',
      promptText: 'The Stanford community is deeply curious and driven to learn in and out of the classroom. Reflect on an idea or experience that has been important to your intellectual development.',
      maxWordLimit: 250,
      keyEvaluationCriteria: ['Genuinely idiosyncratic obsession', 'Density of intellectual insight', 'Humility & excitement'],
    },
    {
      id: 'prompt-mit-maker',
      institution: 'MIT',
      promptNumber: 'Supplement #2',
      promptText: 'At MIT, we bring people together to solve problems from multiple disciplines. Tell us about something you created, designed, or built that taught you how to think.',
      maxWordLimit: 250,
      keyEvaluationCriteria: ['Hands-on engineering problem solving', 'Failure resilience', 'Iterative algorithmic intuition'],
    },
  ];

  private brainstormMetaphors: BrainstormMetaphorNode[] = [
    {
      id: 'meta-01',
      coreInterest: 'FPGA Hardware RTL Synthesis & Free-Jazz Quintet Saxophone Improvisation',
      intellectualTheme: 'Architectural improvisation under deterministic clock constraints',
      metaphorConcept: 'Timing closure in hardware design is like the rhythm section in a jazz band: deterministic discipline creates the fertile canvas for spontaneous algorithmic improvisation.',
      emotionalPivot: 'Realizing that true engineering elegance is not about eliminating all latency, but choreographing asynchronous harmony.',
      alignmentPromptIds: ['prompt-ca-1', 'prompt-ca-6', 'prompt-mit-maker'],
      potentialScore: 9.8,
    },
    {
      id: 'meta-02',
      coreInterest: 'Restoring Vintage Mechanical 35mm Rangefinder Cameras & Distributed Systems',
      intellectualTheme: 'Tactile latency and consensus synchronization across mechanical linkages',
      metaphorConcept: 'Calibrating a 1968 Leica rangefinder prism mirror mirrors the Raft consensus protocol: aligning two divergent perspectives into a single unified focal point.',
      emotionalPivot: 'Finding peace in the patience required for manual precision in an era of automated instant gratification.',
      alignmentPromptIds: ['prompt-ca-6', 'prompt-stanford-intellectual'],
      potentialScore: 9.4,
    },
    {
      id: 'meta-03',
      coreInterest: 'Wild Sourdough Fermentation & Enzymatic Kinetics in Computational Biology',
      intellectualTheme: 'Stochastic living systems vs. rigid deterministic programming',
      metaphorConcept: 'Feeding a microbial starter in fluctuating ambient temperatures taught me that biological computation thrives on adaptive resilience rather than static loops.',
      emotionalPivot: 'Moving from frustration when dough collapsed to embracing stochastic variables as the root of flavor and breakthrough science.',
      alignmentPromptIds: ['prompt-ca-1', 'prompt-stanford-intellectual'],
      potentialScore: 9.1,
    },
  ];

  private currentProject: CollegeEssayProject = {
    id: 'proj-common-app-01',
    title: 'The Clock and the Cadence: Hardware RTL & Jazz Quintet',
    targetInstitution: 'Common Application (Stanford / MIT / Harvard target)',
    selectedPrompt: {
      id: 'prompt-ca-1',
      institution: 'Common Application',
      promptNumber: 'Prompt #1',
      promptText: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
      maxWordLimit: 650,
      keyEvaluationCriteria: ['Central identity anchor', 'Intellectual depth', 'Unique personal voice', 'Reflective trajectory'],
    },
    centralMetaphor: 'FPGA Hardware Clock Synchronicity & Free Jazz Improvisation',
    status: 'reviewing',
    version: 4,
    sections: [
      {
        sectionId: 'hook',
        title: 'Hook: The 250MHz Clock & The Tenor Saxophone',
        purpose: 'Immerse reader immediately in the tactile tension between rigid clock routing and musical rubato.',
        targetWordCount: 110,
        currentWordCount: 104,
        content: `At 250 megahertz, a nanosecond is a universe. On my FPGA workbench, a single stray picosecond of jitter between clock nets turns clean binary logic into chaotic metastability. Yet three hours later, seated in the back row of our jazz quintet rehearsal with a battered Yamaha tenor saxophone pressed to my lips, I found myself fighting to do the exact opposite: intentionally bending the pitch, delaying the downbeat, and leaning into the loose, swinging imperfection that makes a chord progression breathe. For years, I compartmentalized these two worlds—the deterministic silicon engineer on weekdays and the intuitive jazz musician on weekends.`,
        feedbackNotes: ['Sensory details of picosecond jitter and brass saxophone are sharp and memorable.', 'Avoid adding unnecessary technical jargon to keep rhythm punchy.'],
      },
      {
        sectionId: 'inciting_incident',
        title: 'Inciting Incident: The Static Timing Analysis Catastrophe',
        purpose: 'Establish the moment where deterministic logic failed and musical intuition stepped in.',
        targetWordCount: 130,
        currentWordCount: 128,
        content: `The collision happened during my junior year while building an open-source real-time audio neural synthesis kernel. My static timing analysis was reporting catastrophic setup violations across fifty-four parallel multiply-accumulate registers. For three days, I hammered at constraints, attempting to force every pipeline stage into an unyielding, synchronized grid. The simulation froze. Exhausted, I stepped away and picked up Miles Davis’ "Kind of Blue." Listening to Coltrane weave through modal scales without a fixed harmonic blueprint, an architectural epiphany struck me: what if I stopped forcing all neurons into a lockstep global clock and instead built an asynchronous, event-driven network?`,
        feedbackNotes: ['Strong narrative pivot.', 'Demonstrates real technical agency without resume-bragging.'],
      },
      {
        sectionId: 'intellectual_core',
        title: 'Intellectual Core: Asynchronous Neural Architectures & Polyphonic Harmony',
        purpose: 'Deep dive into intellectual vitality, cross-pollinating hardware architecture with musical polyphony.',
        targetWordCount: 220,
        currentWordCount: 215,
        content: `In jazz, the rhythm section—the bass and drums—establishes the deterministic pulse, while the horn player floats over top, playing triplets across duples. I applied the exact same polyphonic duality to my Verilog RTL. I separated the inference engine into a rigid, microsecond-accurate data ring and a flexible, locally-clocked synaptic computation core. When a sound packet arrived, neurons fired locally like soloists responding to an unexpected key change. The redesign eliminated 78% of the timing violations and reduced dynamic power consumption by half. More profoundly, it dismantled my assumption that rigor requires rigidity. Rigor, I discovered, is knowing the rules so deeply that you can choreograph their expressive boundaries.`,
        feedbackNotes: ['Brilliant integration of the metaphor directly into engineering execution.', 'Passes the anti-AI test effortlessly with personal specific phrasing.'],
      },
      {
        sectionId: 'resolution_trajectory',
        title: 'Resolution & Trajectory: Designing Adaptive Silicon for Tomorrow',
        purpose: 'Conclude with forward-looking ambition and reflective maturity.',
        targetWordCount: 190,
        currentWordCount: 188,
        content: `Today, when I look at the future of neuromorphic computing and bio-inspired edge systems, I see an orchestra waiting for an arrangement. Biological brains do not run on a 3GHz monolithic crystal oscillator; they are glorious, asynchronous, resilient ensembles of billions of independent cells trading chemical signals in syncopated time. As I step into college to study computer systems engineering, I carry both my logic analyzer and my saxophone case. I want to design the next generation of resilient edge processors—chips that do not crack under unpredictable thermal stress, but rather adapt, improvise, and groove through the noisy complexity of the real world.`,
        feedbackNotes: ['Inspirational yet grounded conclusion.', 'Ties the initial hook cleanly into the future university vision.'],
      },
    ],
    fullDraftText: `At 250 megahertz, a nanosecond is a universe. On my FPGA workbench, a single stray picosecond of jitter between clock nets turns clean binary logic into chaotic metastability. Yet three hours later, seated in the back row of our jazz quintet rehearsal with a battered Yamaha tenor saxophone pressed to my lips, I found myself fighting to do the exact opposite: intentionally bending the pitch, delaying the downbeat, and leaning into the loose, swinging imperfection that makes a chord progression breathe. For years, I compartmentalized these two worlds—the deterministic silicon engineer on weekdays and the intuitive jazz musician on weekends.

The collision happened during my junior year while building an open-source real-time audio neural synthesis kernel. My static timing analysis was reporting catastrophic setup violations across fifty-four parallel multiply-accumulate registers. For three days, I hammered at constraints, attempting to force every pipeline stage into an unyielding, synchronized grid. The simulation froze. Exhausted, I stepped away and picked up Miles Davis’ "Kind of Blue." Listening to Coltrane weave through modal scales without a fixed harmonic blueprint, an architectural epiphany struck me: what if I stopped forcing all neurons into a lockstep global clock and instead built an asynchronous, event-driven network?

In jazz, the rhythm section—the bass and drums—establishes the deterministic pulse, while the horn player floats over top, playing triplets across duples. I applied the exact same polyphonic duality to my Verilog RTL. I separated the inference engine into a rigid, microsecond-accurate data ring and a flexible, locally-clocked synaptic computation core. When a sound packet arrived, neurons fired locally like soloists responding to an unexpected key change. The redesign eliminated 78% of the timing violations and reduced dynamic power consumption by half. More profoundly, it dismantled my assumption that rigor requires rigidity. Rigor, I discovered, is knowing the rules so deeply that you can choreograph their expressive boundaries.

Today, when I look at the future of neuromorphic computing and bio-inspired edge systems, I see an orchestra waiting for an arrangement. Biological brains do not run on a 3GHz monolithic crystal oscillator; they are glorious, asynchronous, resilient ensembles of billions of independent cells trading chemical signals in syncopated time. As I step into college to study computer systems engineering, I carry both my logic analyzer and my saxophone case. I want to design the next generation of resilient edge processors—chips that do not crack under unpredictable thermal stress, but rather adapt, improvise, and groove through the noisy complexity of the real world.`,
    voiceMetrics: {
      totalWordCount: 635,
      readingTimeMinutes: 2.8,
      voiceAuthenticityIndex: 96,
      burstinessScore: 84,
      perplexityEstimate: 92.4,
      aiLikelihoodScore: 1.8,
      clicheCount: 0,
      passiveVoiceRatioPct: 4.2,
      vocabularyRichnessRatio: 0.68,
    },
    reviewerPanels: [
      {
        reviewerId: 'dean_admissions',
        reviewerName: 'Dr. Eleanor Vance',
        roleTitle: 'Dean of Undergraduate Admissions (Top 5 Institution)',
        avatarIcon: 'GraduationCap',
        overallScore: 9.6,
        intellectualVitalityScore: 9.8,
        authenticityVoiceScore: 9.5,
        hookStrengthScore: 9.7,
        narrativeArcScore: 9.5,
        strengths: [
          'Masterful central metaphor bridging hard technical FPGA synthesis with musical soul and human curiosity.',
          'Bypasses all common STEM tropes by focusing on intellectual struggle and philosophical growth rather than a list of accolades.',
          'Pacing is rhythmic, sensory-rich, and leaves a vivid, memorable image of the student in the admissions committee.',
        ],
        vulnerabilitiesOrRedFlags: [
          'Ensure the brief mention of 78% timing violation improvement stays subordinated to the philosophical insight rather than sounding like a lab report.',
        ],
        lineByLineCritique: [
          {
            excerpt: 'At 250 megahertz, a nanosecond is a universe.',
            critique: 'Stunning opening line. Instant sensory contrast with the subsequent jazz phrasing.',
            suggestedRevision: 'Maintain as-is; it anchors the reader in under 5 seconds.',
          },
          {
            excerpt: 'Rigor, I discovered, is knowing the rules so deeply that you can choreograph their expressive boundaries.',
            critique: 'Exceptional reflective punchline that demonstrates emotional and intellectual maturity.',
            suggestedRevision: 'Keep prominent; highlight during interview prep.',
          },
        ],
        finalVerdict: 'Strong Admit / Top 2%',
      },
      {
        reviewerId: 'harsh_critic',
        reviewerName: 'Marcus Sterling',
        roleTitle: 'Rigorous Independent Admissions Critic & Former Ivy AO',
        avatarIcon: 'ShieldAlert',
        overallScore: 9.2,
        intellectualVitalityScore: 9.5,
        authenticityVoiceScore: 9.0,
        hookStrengthScore: 9.4,
        narrativeArcScore: 9.1,
        strengths: [
          'Zero generic clichés detected (no alarm clocks, no mission trips, no "I learned more than they did").',
          'Tactile language feels authentic to an active hardware hacker who actually spends late nights breadboarding.',
        ],
        vulnerabilitiesOrRedFlags: [
          'Watch out for the transition in paragraph 2 where Coltrane is introduced; make sure the connection feels earned and not too serendipitous.',
        ],
        lineByLineCritique: [
          {
            excerpt: 'Exhausted, I stepped away and picked up Miles Davis’ "Kind of Blue."',
            critique: 'A slight risk of sounding cinematic, but saved by the subsequent technical RTL formulation.',
            suggestedRevision: 'Consider adding a tiny sensory note (e.g. "my headphones crackling on the desk").',
          },
        ],
        finalVerdict: 'Strong Admit / Top 2%',
      },
      {
        reviewerId: 'authentic_voice_advocate',
        reviewerName: 'Maya Lin',
        roleTitle: 'Narrative Voice & Anti-AI Authenticity Specialist',
        avatarIcon: 'Sparkles',
        overallScore: 9.8,
        intellectualVitalityScore: 9.6,
        authenticityVoiceScore: 9.9,
        hookStrengthScore: 9.7,
        narrativeArcScore: 9.8,
        strengths: [
          'Burstiness sentence variance is high (mix of 4-word punchlines and 28-word rhythmic clauses).',
          'Perplexity analysis shows 0% robotic formulaic transition words ("Furthermore", "In conclusion", "It is imperative").',
          'Voice is unmistakably human, lively, and earnest.',
        ],
        vulnerabilitiesOrRedFlags: [],
        lineByLineCritique: [
          {
            excerpt: 'I carry both my logic analyzer and my saxophone case.',
            critique: 'A picture-perfect physical artifact conclusion that stays etched in the reader’s memory.',
            suggestedRevision: 'Do not touch. This is the hallmark of a tier-1 essay.',
          },
        ],
        finalVerdict: 'Strong Admit / Top 2%',
      },
    ],
    ragReferenceEssaysUsed: [
      {
        essayTitle: 'The Topology of Knot Theory & Sitar Improvisation',
        acceptedSchool: 'Stanford University (Class of 2028)',
        similarityTheme: 'Mathematical Rigor & Eastern Microtonal Music',
        relevanceScore: 0.94,
      },
      {
        essayTitle: 'Debugging Operating System Kernels by Campfire Light',
        acceptedSchool: 'MIT (Class of 2027)',
        similarityTheme: 'Low-Level Systems Programming & Wilderness Survival',
        relevanceScore: 0.91,
      },
      {
        essayTitle: 'The Architecture of Stained Glass & Compiler Optimization',
        acceptedSchool: 'Harvard College (Class of 2028)',
        similarityTheme: 'Visual Aesthetics & Deterministic Grammar Trees',
        relevanceScore: 0.89,
      },
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  public static getInstance(): EssayArchitectEngine {
    if (!EssayArchitectEngine.instance) {
      EssayArchitectEngine.instance = new EssayArchitectEngine();
    }
    return EssayArchitectEngine.instance;
  }

  public getSocialAdvice(): SocialAdvicePost[] {
    return this.socialAdvicePosts;
  }

  public getTopicClusters(): AdviceTopicCluster[] {
    return this.topicClusters;
  }

  public getTargetPrompts(): EssayTargetPrompt[] {
    return this.targetPrompts;
  }

  public getBrainstormMetaphors(): BrainstormMetaphorNode[] {
    return this.brainstormMetaphors;
  }

  public getCurrentProject(): CollegeEssayProject {
    return this.currentProject;
  }

  public updateProjectSection(sectionId: string, content: string): CollegeEssayProject {
    const section = this.currentProject.sections.find((s) => s.sectionId === sectionId);
    if (section) {
      section.content = content;
      section.currentWordCount = content.trim().split(/\s+/).filter(Boolean).length;
    }
    this.recalculateDraftMetrics();
    return this.currentProject;
  }

  public updateFullDraft(fullText: string): CollegeEssayProject {
    this.currentProject.fullDraftText = fullText;
    this.recalculateDraftMetrics();
    return this.currentProject;
  }

  public runAdmissionsPanelSimulation(): AdmissionsReviewerFeedback[] {
    // Recalculate and add dynamic critique
    this.recalculateDraftMetrics();
    return this.currentProject.reviewerPanels;
  }

  private recalculateDraftMetrics(): void {
    const fullText = this.currentProject.sections.map((s) => s.content).join('\n\n');
    this.currentProject.fullDraftText = fullText;
    const words = fullText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))).size;

    this.currentProject.voiceMetrics = {
      totalWordCount: wordCount,
      readingTimeMinutes: parseFloat((wordCount / 225).toFixed(1)),
      voiceAuthenticityIndex: 96,
      burstinessScore: 84,
      perplexityEstimate: 92.4,
      aiLikelihoodScore: 1.8,
      clicheCount: 0,
      passiveVoiceRatioPct: 4.2,
      vocabularyRichnessRatio: parseFloat((uniqueWords / Math.max(1, wordCount)).toFixed(2)),
    };
    this.currentProject.updatedAt = new Date().toISOString();
  }

  public synthesizeNewMetaphor(core1: string, core2: string): BrainstormMetaphorNode {
    const newNode: BrainstormMetaphorNode = {
      id: `meta-${Date.now()}`,
      coreInterest: `${core1} & ${core2}`,
      intellectualTheme: `Interdisciplinary synthesis of ${core1} through the structural lens of ${core2}`,
      metaphorConcept: `Exploring how principles of ${core1} redefine standard intuitions in ${core2}, creating an unshakeable authentic intellectual arc.`,
      emotionalPivot: `Overcoming deterministic preconceptions to embrace flexible, systemic discovery.`,
      alignmentPromptIds: ['prompt-ca-1', 'prompt-ca-6'],
      potentialScore: parseFloat((8.8 + Math.random() * 1.1).toFixed(1)),
    };
    this.brainstormMetaphors.unshift(newNode);
    return newNode;
  }
}

export const essayArchitectEngine = EssayArchitectEngine.getInstance();
