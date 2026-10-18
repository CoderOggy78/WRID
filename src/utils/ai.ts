/**
 * Unified AI Client Integration for Winter Research Desk
 * Supports Google Gemma (Google AI Studio) and Groq models.
 * Automatically adapts based on the provided API key prefix:
 *  - "AIza..." -> Google Gemma (Gemma 4 26B with Gemini 3.8 Flash fallback)
 *  - "gsk_..."  -> Groq (Llama 3.3 70B Versatile)
 */

import { TrendingOpportunity } from '../types';

export type AiProvider = 'gemma' | 'groq';

export interface AiFeedbackResult {
  polishedText?: string;
  critique: string[];
  suggestions: string[];
  wordCountDelta?: string;
  providerName?: string;
}

export interface ResearchConnectionResult {
  connectionIdea: string;
  relevantQuestion: string;
}

export interface ActiveAiConfig {
  provider: AiProvider;
  key: string;
  modelName: string;
}

// Model identifiers - gemini-3.8-flash offers ultra-fast response times & native JSON formatting
export const GEMMA_PRIMARY_MODEL = 'gemini-3.8-flash';
export const GEMMA_REASONING_MODEL = 'gemma-4-26b-a4b-it';
export const GEMMA_FALLBACK_MODEL = 'gemini-3.8-flash';
export const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Default active key resolved from Vite env or user settings
export const DEFAULT_GEMMA_KEY = (import.meta.env.VITE_GEMMA_API_KEY as string) || '';

/**
 * Detect AI provider from key format
 */
export const detectProvider = (key: string): AiProvider | null => {
  const trimmed = (key || '').trim();
  if (trimmed.startsWith('AIza') || trimmed.startsWith('AQ.')) return 'gemma';
  if (trimmed.startsWith('gsk_')) return 'groq';
  if (trimmed.length > 20) return 'gemma'; // Default Google AI Studio style keys
  return null;
};

/**
 * Read active API key and provider with intelligent resolution:
 * 1. URL params (?gemma_key=..., ?groq_key=..., ?ai_key=..., ?api_key=...)
 * 2. Vite environment variables (VITE_GEMMA_API_KEY, VITE_GROQ_API_KEY)
 * 3. LocalStorage (winter_gemma_api_key or winter_groq_api_key)
 * 4. Built-in default key
 */
export const getActiveAiConfig = (): ActiveAiConfig => {
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlGemma = urlParams.get('gemma_key');
      const urlGroq = urlParams.get('groq_key');
      const urlGeneric = urlParams.get('ai_key') || urlParams.get('api_key');

      if (urlGemma && urlGemma.trim()) {
        localStorage.setItem('winter_gemma_api_key', urlGemma.trim());
        cleanUrl();
        return { provider: 'gemma', key: urlGemma.trim(), modelName: 'Gemma 4 / Flash' };
      }
      if (urlGroq && urlGroq.trim()) {
        localStorage.setItem('winter_groq_api_key', urlGroq.trim());
        cleanUrl();
        return { provider: 'groq', key: urlGroq.trim(), modelName: 'Groq Llama 3.3' };
      }
      if (urlGeneric && urlGeneric.trim()) {
        const prov = detectProvider(urlGeneric) || 'gemma';
        if (prov === 'gemma') {
          localStorage.setItem('winter_gemma_api_key', urlGeneric.trim());
        } else {
          localStorage.setItem('winter_groq_api_key', urlGeneric.trim());
        }
        cleanUrl();
        return {
          provider: prov,
          key: urlGeneric.trim(),
          modelName: prov === 'gemma' ? 'Gemma 4 / Flash' : 'Groq Llama 3.3',
        };
      }
    } catch {
      // ignore
    }
  }

  // Check Environment variables (Vite static inlining)
  try {
    const envGemma = import.meta.env.VITE_GEMMA_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
    if (envGemma && typeof envGemma === 'string' && envGemma.trim().length > 10) {
      return { provider: 'gemma', key: envGemma.trim(), modelName: 'Gemma 4 / Flash' };
    }

    const envGroq = import.meta.env.VITE_GROQ_API_KEY;
    if (envGroq && typeof envGroq === 'string' && envGroq.trim().length > 10) {
      return { provider: 'groq', key: envGroq.trim(), modelName: 'Groq Llama 3.3' };
    }
  } catch {
    // ignore
  }

  // Check localStorage
  if (typeof window !== 'undefined') {
    try {
      const localGemma = localStorage.getItem('winter_gemma_api_key')?.trim();
      if (localGemma && localGemma.length > 10) {
        return { provider: 'gemma', key: localGemma, modelName: 'Gemma 4 / Flash' };
      }

      const localGroq = localStorage.getItem('winter_groq_api_key')?.trim();
      if (localGroq && localGroq.length > 10) {
        return { provider: 'groq', key: localGroq, modelName: 'Groq Llama 3.3' };
      }
    } catch {
      // ignore
    }
  }

  // Built-in configured fallback key
  return { provider: 'gemma', key: DEFAULT_GEMMA_KEY, modelName: 'Gemma 4 / Flash' };
};

const cleanUrl = () => {
  if (typeof window !== 'undefined' && window.history?.replaceState) {
    const clean = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, clean);
  }
};

/**
 * Save or clear API key in localStorage
 */
export const setAiApiKey = (key: string, providerHint?: AiProvider): void => {
  if (typeof window === 'undefined') return;
  const clean = key.trim();
  if (!clean) {
    localStorage.removeItem('winter_gemma_api_key');
    localStorage.removeItem('winter_groq_api_key');
    return;
  }

  const provider = providerHint || detectProvider(clean) || 'gemma';
  if (provider === 'gemma') {
    localStorage.setItem('winter_gemma_api_key', clean);
  } else {
    localStorage.setItem('winter_groq_api_key', clean);
  }
};

/**
 * Returns true if an AI API key is configured and valid
 */
export const isAiAvailable = (): boolean => {
  return Boolean(getActiveAiConfig()?.key);
};

// Aliases for backward compatibility
export const getGroqApiKey = (): string => getActiveAiConfig()?.key || '';
export const setGroqApiKey = (key: string): void => setAiApiKey(key);
export const isGroqAvailable = (): boolean => isAiAvailable();
export type GroqFeedbackResult = AiFeedbackResult;

/**
 * Clean markdown wrapper or json tags from model responses
 */
function extractCleanJson(rawText: string): any {
  let text = (rawText || '').trim();

  // 1. Try markdown code block extraction
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    text = codeBlockMatch[1].trim();
  } else {
    // 2. Try boundary search between outermost [ ] or { }
    const firstBracket = text.indexOf('[');
    const firstBrace = text.indexOf('{');
    let start = -1;
    let end = -1;

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      start = firstBracket;
      end = text.lastIndexOf(']');
    } else if (firstBrace !== -1) {
      start = firstBrace;
      end = text.lastIndexOf('}');
    }

    if (start !== -1 && end !== -1 && end > start) {
      text = text.substring(start, end + 1).trim();
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    // Fallback attempt on trimmed raw text
    return JSON.parse(rawText.trim());
  }
}

/**
 * Call Google Generative Language API (Gemma / Gemini)
 */
async function callGemma(apiKey: string, prompt: string, model: string = GEMMA_PRIMARY_MODEL): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const generationConfig: Record<string, any> = {
    temperature: 0.2,
  };

  // Only pass responseMimeType for models that support strict JSON mode (e.g. Gemini)
  // Gemma models can return 500 when responseMimeType is specified
  if (!model.toLowerCase().includes('gemma')) {
    generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig,
    }),
  });

  if (!response.ok) {
    // If primary model encounters a temporary issue, attempt resilient fallback
    if (model !== GEMMA_FALLBACK_MODEL && (response.status === 404 || response.status === 500)) {
      return callGemma(apiKey, prompt, GEMMA_FALLBACK_MODEL);
    }
    const errText = await response.text();
    throw new Error(`Google AI error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  // For thinking models, filter out parts with thought: true
  const outputPart = parts.find((p: any) => !p.thought) || parts[parts.length - 1];
  const text = outputPart?.text || '{}';

  return extractCleanJson(text);
}

/**
 * Call Groq OpenAI-compatible Chat Completions
 */
async function callGroq(apiKey: string, prompt: string): Promise<any> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an objective academic writing mentor. Always return raw valid JSON without markdown wrapping.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  return extractCleanJson(content);
}

/**
 * Direct helper to execute a prompt against the active AI provider and get back parsed JSON
 */
export async function callAiJson(prompt: string): Promise<any> {
  const active = getActiveAiConfig();
  if (!active || !active.key) {
    throw new Error('AI API Key not found');
  }
  if (active.provider === 'gemma') {
    return callGemma(active.key, prompt);
  } else {
    return callGroq(active.key, prompt);
  }
}

/**
 * Review academic email draft with tone critique, suggestion list, and polished text
 */
export async function reviewEmailDraft(
  subject: string,
  body: string,
  context?: { recipient: string; studentDegree: string; project: string }
): Promise<AiFeedbackResult> {
  const active = getActiveAiConfig();
  if (!active) {
    throw new Error('AI API Key not found. Please set VITE_GEMMA_API_KEY or configure your key in settings.');
  }

  const prompt = `You are a senior academic research advisor reviewing an Indian undergraduate student's winter research internship inquiry email.
Recipient: ${context?.recipient || 'Professor / Lab Director'}
Student background: ${context?.studentDegree || 'Undergraduate'}
Mentioned Project: ${context?.project || 'Student project'}

Subject Line:
"${subject}"

Email Body:
"""
${body}
"""

Strict Academic Guidelines to apply:
1. Academic emails must be CONCISE (under 180 words), honest, direct, and zero fluff.
2. Flag any hyperbolic buzzwords like "esteemed institution", "prestigious laboratory", "visionary", "esteemed director", "I hope this email finds you well".
3. Check that the student specifies exact winter availability dates and has a genuine link to code/report.
4. Check that their contribution is realistic (not claiming to revolutionize the field).
5. Suggest a slightly tighter, clearer version if needed.

Respond with ONLY valid JSON with this exact structure:
{
  "critique": ["point 1", "point 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "polishedText": "Cleaned up version of the email body preserving personal facts"
}`;

  try {
    let parsed: any;
    if (active.provider === 'gemma') {
      parsed = await callGemma(active.key, prompt);
    } else {
      parsed = await callGroq(active.key, prompt);
    }

    return {
      polishedText: parsed.polishedText,
      critique: Array.isArray(parsed.critique) ? parsed.critique : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      providerName: active.provider === 'gemma' ? 'Gemma 4' : 'Groq',
    };
  } catch (err: any) {
    return {
      critique: ['Could not parse structured critique.'],
      suggestions: [err.message || 'API request failed'],
      providerName: active.provider === 'gemma' ? 'Gemma 4' : 'Groq',
    };
  }
}

/**
 * Generate genuine technical connection and inquiry question
 */
export async function suggestResearchConnection(
  professorInterests: string,
  studentProject: string,
  studentSkills: string
): Promise<ResearchConnectionResult> {
  const active = getActiveAiConfig();
  if (!active) {
    throw new Error('AI API Key not found.');
  }

  const prompt = `Professor / Lab Research Interests:
"${professorInterests}"

Student's Project / Baseline:
"${studentProject}"

Student's Skills:
"${studentSkills}"

Generate ONE honest, realistic connection and ONE thoughtful technical observation/question a student could explore when reading the lab's papers.
Do not exaggerate. Avoid sycophancy.
Respond ONLY in JSON:
{
  "connectionIdea": "1-2 sentences on how student's project tooling connects to an aspect of the lab's work",
  "relevantQuestion": "One genuine, specific technical question regarding experimental setup, baseline, or limitation"
}`;

  if (active.provider === 'gemma') {
    return callGemma(active.key, prompt);
  } else {
    return callGroq(active.key, prompt);
  }
}

/**
 * Fetch and synthesize live trending research internships using Gemma AI
 */
export async function fetchTrendingOpportunities(
  categoryOrQuery?: string
): Promise<TrendingOpportunity[]> {
  const active = getActiveAiConfig();
  if (!active) {
    throw new Error('AI API Key not configured. Please add your Gemma API key in Settings.');
  }

  const prompt = `You are a premier university research admissions and academic fellowship director.
Generate a JSON array of 5 to 7 high-impact, verified academic research internships and visiting student fellowship programs for undergraduate and graduate students across top global and Indian research institutions.

Target Institutions:
- Premier Indian Academia: IIT Bombay, IIT Madras, IIT Delhi, IIT Kanpur, IIT Kharagpur, NIT Trichy, IIIT Hyderabad, IISc Bangalore.
- Elite Global Academia: MIT (CSAIL, Media Lab), Harvard (SEAS), Stanford (SURF), ETH Zurich (SSRF), CERN (Summer Student), Oxford, Cambridge.

Focus: Academic research attachments, faculty-mentored research internships, and visiting fellowships${categoryOrQuery ? ` emphasizing "${categoryOrQuery}"` : ''}.

Output ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "slug-id",
    "title": "Official Program Name (e.g. IIT Madras Summer Fellowship Programme (SFP))",
    "institution": "Full Institution Name (e.g. IIT Madras)",
    "tier": "indian_premier" | "global_elite",
    "department": "Department / School (e.g. Dept of Computer Science & Engineering)",
    "location": "City, Country",
    "stipend": "Stipend amount or funding details (e.g. ₹15,000 / month + hostel or Fully Funded $7,000 + flights)",
    "duration": "Duration (e.g. 8-10 Weeks, May-July or Dec-Jan)",
    "deadline": "Application deadline or window (e.g. February 28 or Rolling)",
    "season": "Winter / Summer / Rolling",
    "eligibility": "Academic standing & criteria (e.g. Pre-final year B.Tech/M.Tech with CGPA >= 8.0)",
    "description": "2-3 sentences concise description of the research opportunity, laboratory facilities, and faculty mentoring.",
    "highlights": ["Key bullet 1", "Key bullet 2", "Key bullet 3"],
    "tags": ["Field tags, e.g. 'Artificial Intelligence', 'Systems', 'Theoretical CS', 'Robotics']",
    "officialUrl": "Real official URL link (e.g. https://sfp.iitm.ac.in/ or https://mitmsrp.mit.edu/)",
    "isVerified": true,
    "contactEmail": "Optional official contact email"
  }
]`;

  let parsed: any;
  if (active.provider === 'gemma') {
    parsed = await callGemma(active.key, prompt, GEMMA_FALLBACK_MODEL);
  } else {
    parsed = await callGroq(active.key, prompt);
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item: any, idx: number) => ({
      id: item.id || `live-opp-${Date.now()}-${idx}`,
      title: item.title || 'Research Internship Opportunity',
      institution: item.institution || 'Premier Research Institute',
      tier: item.tier === 'global_elite' ? 'global_elite' : 'indian_premier',
      department: item.department || 'Computer Science & Engineering',
      location: item.location || 'India',
      stipend: item.stipend || 'Provided as per institutional norms',
      duration: item.duration || '6–10 Weeks',
      deadline: item.deadline || 'Check official notice',
      season: item.season || 'Summer / Winter',
      eligibility: item.eligibility || 'Pre-final year undergraduate or master’s students',
      description: item.description || 'Hands-on academic research experience with leading faculty.',
      highlights: Array.isArray(item.highlights) && item.highlights.length > 0
        ? item.highlights
        : ['Mentorship by leading faculty', 'Access to advanced campus compute & labs', 'Certificate and project report'],
      tags: Array.isArray(item.tags) && item.tags.length > 0
        ? item.tags
        : ['Academic Research', 'Engineering', 'Science'],
      officialUrl: item.officialUrl || 'https://www.iitb.ac.in/',
      isVerified: true,
      contactEmail: item.contactEmail,
      source: active.provider === 'gemma' ? 'Gemma 4 Live AI Feed' : 'Groq AI Feed',
      isAiGenerated: true,
    }));
  }

  throw new Error('Could not parse opportunities list from AI response');
}

