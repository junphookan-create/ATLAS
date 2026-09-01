import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes/apiRouter.js';
import { fastApiCompatRouter, handleSSEApprovals } from './src/server/routes/fastapiCompatRouter.js';
import { getGenAI } from './src/server/aiClient.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// CORS middleware for external frontend calls
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Mount FastAPI v1 Compatible Router & SSE endpoint
app.use('/api/v1', fastApiCompatRouter);
app.get('/sse/approvals', handleSSEApprovals);

// Mount Modular API Router
app.use('/api', apiRouter);

// API Health Check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Atlas AI Orchestrator Core', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Atlas AI Orchestrator Core', timestamp: new Date().toISOString() });
});

// API: Command Bar AI Orchestrator
app.post('/api/command', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();
    const systemInstruction = `You are Atlas AI's Command & Control Orchestrator. 
The user provides a high-level directive. Parse the intent, decompose it into actionable execution steps across Atlas AI's 20 modules, and indicate any actions that require Human Approval Center (HITL) authorization.
Respond in valid JSON format with keys:
- intentSummary: string
- targetModules: string[]
- actionSteps: { step: number, module: string, description: string, requiresApproval: boolean }[]
- humanApprovalPrompt: string or null
- recommendedFollowUp: string`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error in /api/command:', error);
    res.status(500).json({ error: error?.message || 'Failed to process command' });
  }
});

// API: Grant Proposal Section Drafting & Critique
app.post('/api/grant/draft', async (req, res) => {
  try {
    const { sectionTitle, grantTitle, agency, contextData } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are Atlas AI's Grant & Fellowship Writer module.
Draft a rigorous, grant-ready narrative section for the grant "${grantTitle}" targeting agency "${agency}".
Section requested: "${sectionTitle}".
Context provided: ${JSON.stringify(contextData || {})}.

Return valid JSON with:
- sectionTitle: string
- content: string
- wordCount: number
- critiqueScores: { clarity: number, significance: number, innovation: number, feasibility: number, alignment: number, overall: number }
- critiqueNotes: string[]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Draft the "${sectionTitle}" section with maximal scientific rigor and grant alignment.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error in /api/grant/draft:', error);
    res.status(500).json({ error: error?.message || 'Failed to draft grant section' });
  }
});

// API: Research Scientist Hypothesis Generator
app.post('/api/research/hypothesis', async (req, res) => {
  try {
    const { topic } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are Atlas AI's Research Scientist module.
Analyze the scientific topic "${topic}" and generate a highly novel, testable research hypothesis.
Return valid JSON with:
- title: string
- independentVariable: string
- dependentVariable: string
- rationale: string
- proposedExperiment: string
- confidenceScore: number (0 to 1)
- benchmarkDataset: string`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a novel hypothesis for: ${topic}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error in /api/research/hypothesis:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate hypothesis' });
  }
});

// API: Outreach Email Personalized Drafter
app.post('/api/outreach/email', async (req, res) => {
  try {
    const { contactName, title, affiliation, researchInterests, userBackground } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are Atlas AI's Outreach Manager module.
Craft a highly personalized, compelling email to ${contactName} (${title} at ${affiliation}).
Their research interests: ${Array.isArray(researchInterests) ? researchInterests.join(', ') : researchInterests}.
User's background: ${userBackground || 'AI Researcher working on sparse neuro-inspired models'}.

Requirements:
- Specific compliment on their research
- Concrete bridge to user's work
- Low-friction call to action (e.g. 15 min Zoom call)

Return valid JSON with:
- subject: string
- body: string
- personalizedElements: string[]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Draft outreach email for ${contactName}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error in /api/outreach/email:', error);
    res.status(500).json({ error: error?.message || 'Failed to draft outreach email' });
  }
});

// API: General Cognitive Worker (GCW) Step-by-Step Reasoner
app.post('/api/gcw/execute', async (req, res) => {
  try {
    const { objective, currentMemory } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are Atlas AI's Module 20: General Cognitive Worker (GCW), a Universal Intellectual Meta-Agent.
Given the objective: "${objective}".
And current Working Memory state: ${JSON.stringify(currentMemory || [])}.

Perform a full cycle of perception, deliberate planning, action execution, and reflection.
Return valid JSON with:
- activeGoal: string
- workingMemoryUpdate: { id: string, type: string, content: string, confidence: number, relevance: number }[]
- scratchpadNotes: string[]
- executedAction: { action: string, toolUsed: string, result: string }
- currentPhase: "Perception" | "Deliberate Planning" | "Action Execution" | "Reflection"
- finalOutput: string or null`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Execute GCW reasoning cycle for objective: ${objective}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error in /api/gcw/execute:', error);
    res.status(500).json({ error: error?.message || 'Failed to execute GCW cycle' });
  }
});

// API: Idea Incubator Lean Canvas & Prototype Generator
app.post('/api/incubator/canvas', async (req, res) => {
  try {
    const { idea } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are Atlas AI's Module 19: Autonomous Idea Incubator.
Given the startup idea: "${idea}".
Generate a complete Lean Canvas and a React/TypeScript code prototype snippet.

Return valid JSON with:
- leanCanvas: { problem: string[], solution: string[], valueProposition: string, unfairAdvantage: string, customerSegments: string[], channels: string[], revenueStreams: string[], costStructure: string[] }
- marketSizeEstimate: { TAM: string, SAM: string, SOM: string }
- prototypeCodeSnippet: string
- gtmSummary: string`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Build Lean Canvas and Prototype for: ${idea}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error in /api/incubator/canvas:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate startup canvas' });
  }
});

// Setup Vite or Static Server
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Atlas AI Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
