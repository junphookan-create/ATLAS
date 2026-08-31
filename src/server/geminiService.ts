import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export interface LiveDiscoveredOpportunity {
  title: string;
  source: string;
  category: 'Grant' | 'Competition' | 'Scholarship' | 'Fellowship' | 'Hackathon';
  deadline: string;
  fundingAmount: string;
  eligibility: string;
  description: string;
  url: string;
  nerEntities: {
    organizations: string[];
    monetaryAmounts: string[];
    academicFields: string[];
    requiredSkills: string[];
    dates: string[];
  };
  eligibilityDeBERTa: {
    categories: string[];
    isEligible: boolean;
    restrictiveFlags: string[];
    confidence: number;
  };
  originalLanguage?: string;
  translatedText?: string;
}

/**
 * Searches the live web and generates realistic real-time AI opportunity listings
 * using Google Search Grounding with Gemini 2.5/3.0.
 */
export async function scanLiveWebOpportunities(
  query: string,
  sourceName: string
): Promise<LiveDiscoveredOpportunity[]> {
  const client = getGenAIClient();
  if (!client) {
    return [];
  }

  try {
    const prompt = `You are the Horizon Scanning AI of the Atlas AI Opportunity Discovery Engine.
Scan the web for real, active, or upcoming research grants, AI hackathons, competitions, or fellowships related to: "${query}" from source "${sourceName}".

Return a valid JSON array of 1 to 2 opportunities with this EXACT schema:
[
  {
    "title": "Exact Title of Grant/Competition",
    "source": "${sourceName}",
    "category": "Grant" | "Competition" | "Scholarship" | "Fellowship" | "Hackathon",
    "deadline": "YYYY-MM-DDTHH:MM:SSZ",
    "fundingAmount": "$100,000" or equivalent,
    "eligibility": "Clear eligibility criteria",
    "description": "2-3 sentences describing the technical scope, objectives, and application details",
    "url": "https://valid-or-real-domain.com/url",
    "originalLanguage": "en",
    "nerEntities": {
      "organizations": ["Org 1", "Org 2"],
      "monetaryAmounts": ["$100,000 USD"],
      "academicFields": ["Field 1", "Field 2"],
      "requiredSkills": ["Skill 1", "Skill 2"],
      "dates": ["YYYY-MM-DD Deadline"]
    },
    "eligibilityDeBERTa": {
      "categories": ["PhD / Postdoc", "Open Global"],
      "isEligible": true,
      "restrictiveFlags": [],
      "confidence": 0.98
    }
  }
]

Provide ONLY raw JSON without markdown code fences or conversational prose.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        // Enable search grounding for real-time web awareness
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleaned = text.trim().replace(/^```json\s*/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err: any) {
    console.warn('Gemini Live Web Horizon Scan error:', err?.message || err);
    return [];
  }
}

export const geminiService = {
  async generateText(prompt: string): Promise<string> {
    const client = getGenAIClient();
    if (!client) {
      return '';
    }
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || '';
    } catch (err) {
      console.warn('Gemini text generation warning:', err);
      return '';
    }
  }
};

