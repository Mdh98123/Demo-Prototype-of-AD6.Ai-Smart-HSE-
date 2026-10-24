import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const geminiRouter = Router();

// Lazy / resilient initialization helper for GoogleGenAI
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[GEMINI ROUTER] Warning: GEMINI_API_KEY environment variable is not set. Requests will return graceful status.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'ad6-hse-platform',
      },
    },
  });
};

// System prompts for specialized HSE enterprise roles
const ROLE_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  hse_advisor: `You are the Lead HSE Statutory Compliance Advisor for the Enterprise HSE AI Platform.
Your focus: OSHAD-SF (Abu Dhabi Safety & Health Framework v3.1), UAE Federal Labor Law (MoHRE), UAE Civil Defence Fire Codes, and ISO 45001 / ISO 14001 / ISO 9001 standards.
Respond with:
1. Executive Summary
2. Statutory References & Code Mechanisms
3. Compliance Gap / Exposure Analysis
4. Required Controls & Evidence Documentation
5. Responsible Role & Mandatory Statutory Deadlines
Escalate High / Critical risks immediately. Maintain a formal, authoritative enterprise tone.`,

  rca_expert: `You are the Principal Incident Investigation & Root Cause Analysis (RCA) Expert.
Your methodology: 5-Whys, Fishbone (Ishikawa: People, Machine, Method, Material, Environment), TapRooT, and Barrier/Control Failure analysis.
Always analyze:
1. Incident Severity & Immediate Containment
2. Causal Factors & Root Causes (5-Why breakdown)
3. SIF Precursor (Serious Injury or Fatality potential)
4. Hierarchy of Controls (Elimination, Substitution, Engineering, Administrative, PPE)
5. SMART Corrective & Preventive Actions (CAPA) with owner and closure timeline.`,

  process_safety: `You are the Senior Process Safety & Industrial Risk Engineer.
Your focus: Major Accident Hazards (MAH), HAZOP, LOPA, Bowtie barrier analysis, SIMOPS conflicts, Hot Work ignition separation, Confined Space atmospheric limits, and LOTO zero-energy isolation.
Analyze risk using the 5x5 Matrix (Likelihood x Severity). Always calculate Initial Risk, Preventive Barriers, Mitigation Barriers, and Residual Risk.`,

  site_supervisor: `You are the Frontline Field Safety Supervisor & Permit to Work (PTW) Coordinator.
Your focus: Practical daily field controls, Toolbox Talks (TBT), pre-task Dynamic Risk Assessment (DRA), gas testing bump tests, scaffold tag clearance, Stop Work Authority (SWA) triggers, and shift handover communications.
Deliver clear, tactical, bulleted instructions for crews on the ground.`,

  executive_analyst: `You are the Executive QHSE Director & Intelligence Analyst.
Your focus: Enterprise safety metrics (TRIR, LTIFR, Near Miss-to-Incident ratios, CAPA aging SLA), multi-facility benchmarking, board-level risk exposure, contractor safety performance, and ESG/Scope 1-2 environmental governance.
Provide concise, decision-first executive summaries with measurable business outcomes and operational risk ROI.`
};

/**
 * Multi-turn Gemini Chatbot Endpoint
 * Supports models:
 * - gemini-3.1-pro-preview (Complex tasks)
 * - gemini-3.5-flash (General tasks)
 * - gemini-3.1-flash-lite (Fast tasks)
 * Built-in grounding:
 * - googleSearch: {} (Search Grounding via gemini-3.5-flash)
 * - googleMaps: {} (Maps Grounding via gemini-3.5-flash)
 */
geminiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { 
      messages, 
      role = 'hse_advisor', 
      model = 'gemini-3.5-flash', 
      useSearchGrounding = false, 
      useMapsGrounding = false,
      userLatLng,
      regionalMode = 'COMBINED'
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in environment (GEMINI_API_KEY).',
        text: 'The AI service is currently awaiting a configured GEMINI_API_KEY in Settings > Secrets. Please verify your API key in the AI Studio environment.'
      });
    }

    // Model selection validation
    // Allowed: gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite
    let targetModel = model;
    if (useMapsGrounding || useSearchGrounding) {
      // Maps and Search Grounding require gemini-3.5-flash as specified
      targetModel = 'gemini-3.5-flash';
    } else if (!['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'].includes(targetModel)) {
      targetModel = 'gemini-3.5-flash';
    }

    // Role system instruction with dynamic Regional Compliance Injection
    const baseInstruction = ROLE_SYSTEM_INSTRUCTIONS[role] || ROLE_SYSTEM_INSTRUCTIONS['hse_advisor'];
    let regionalDirective = '';
    if (regionalMode === 'UAE') {
      regionalDirective = `\n\n[REGIONAL COMPLIANCE SCOPE: UNITED ARAB EMIRATES (UAE)]
- Primary Framework: Abu Dhabi Occupational Safety & Health System Framework (OSHAD-SF v3.1), Abu Dhabi Public Health Centre (ADPHC), UAE Federal Decree-Law No. 33/2021 (Labour Relations).
- Mandatory Guidelines: ADNOC Codes of Practice (CoP v6.0), UAE Civil Defence Fire & Life Safety Code, MoHRE Midday Break (12:30-15:00 from June 15 to Sept 15; mandatory work stoppage when WBGT index reaches ≥32.2°C).
- Data Privacy: UAE Federal Decree-Law No. 45/2021 (PDPL).
- Currency: UAE Dirham (AED).
- Rule: Only cite and apply UAE laws. Do NOT mix or apply Sultanate of Oman regulations.`;
    } else if (regionalMode === 'OMAN') {
      regionalDirective = `\n\n[REGIONAL COMPLIANCE SCOPE: SULTANATE OF OMAN]
- Primary Framework: Oman Labour Law promulgated by Royal Decree No. 53/2023, Ministerial Decision No. 286/2008 (Regulations of Occupational Safety & Health).
- Mandatory Guidelines: Petroleum Development Oman (PDO) SP-1143 (PTW Specification), PDO SP-1170 (Thermal Stress Management - mandatory stop when TWL < 115 W/m², summer rest hours 12:30-15:30 June through August), Environment Authority Royal Decree 114/2001, Civil Defence & Ambulance Authority (CDAA).
- Data Privacy: Oman Personal Data Protection Law (Royal Decree 6/2022).
- Currency: Omani Rial (OMR).
- Rule: Only cite and apply Sultanate of Oman statutory requirements. Do NOT cite or apply OSHAD or UAE laws.`;
    } else {
      regionalDirective = `\n\n[REGIONAL COMPLIANCE SCOPE: COMBINED (UAE + SULTANATE OF OMAN)]
- Cross-border multi-jurisdictional operating mode. Support both UAE (OSHAD-SF v3.1, MoHRE, ADNOC CoPs) and Sultanate of Oman (RD 53/2023, MD 286/2008, PDO SP-1143/SP-1170) frameworks.
- Rule: Always clearly label and separate obligations under '🇦🇪 UAE Statutory Requirements' vs '🇴🇲 Oman Statutory Requirements'. Never assume that a rule or threshold from one jurisdiction applies to the other.`;
    }

    const systemInstruction = baseInstruction + regionalDirective;

    // Format contents for multi-turn history
    const contents: any[] = [];
    for (const msg of messages) {
      const parts: any[] = [];
      if (msg.image) {
        const mimeType = msg.image.includes(';') ? msg.image.split(';')[0].replace('data:', '') : 'image/jpeg';
        const base64Data = msg.image.includes(',') ? msg.image.split(',')[1] : msg.image;
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }
      if (msg.text) {
        parts.push({ text: msg.text });
      }
      contents.push({
        role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
        parts,
      });
    }

    // Build tools and toolConfig for grounding if enabled
    // Note from skill: googleMaps cannot be used together with googleSearch in the same request
    const tools: any[] = [];
    let toolConfig: any = undefined;

    if (useMapsGrounding) {
      tools.push({ googleMaps: {} });
      if (userLatLng && typeof userLatLng.latitude === 'number' && typeof userLatLng.longitude === 'number') {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLatLng.latitude,
              longitude: userLatLng.longitude,
            },
          },
        };
      }
    } else if (useSearchGrounding) {
      tools.push({ googleSearch: {} });
    }

    const config: any = {
      systemInstruction,
    };
    if (tools.length > 0) {
      config.tools = tools;
    }
    if (toolConfig) {
      config.toolConfig = toolConfig;
    }

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });
    } catch (genError: any) {
      console.error('[GEMINI CHAT ERROR]', genError);
      // Graceful fallback to gemini-3.5-flash if gemini-3.1-pro-preview hits quota or paid restriction
      if (targetModel === 'gemini-3.1-pro-preview') {
        console.warn('[GEMINI CHAT] Retrying with gemini-3.5-flash fallback...');
        targetModel = 'gemini-3.5-flash';
        response = await ai.models.generateContent({
          model: targetModel,
          contents,
          config,
        });
      } else {
        throw genError;
      }
    }

    const text = response?.text || 'No response generated.';
    const candidate = response?.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

    // Extract structured citations & map places
    const searchCitations: { title: string; uri: string }[] = [];
    const mapPlaces: { title: string; uri: string; address?: string; snippet?: string }[] = [];

    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        searchCitations.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri,
        });
      }
      if (chunk.maps?.uri) {
        const snippetObj = chunk.maps.placeAnswerSources?.reviewSnippets?.[0];
        const snippet = snippetObj
          ? (typeof snippetObj === 'string' ? snippetObj : (snippetObj as any).reviewText || (snippetObj as any).text || String(snippetObj))
          : undefined;
        mapPlaces.push({
          title: chunk.maps.title || 'Google Maps Location',
          uri: chunk.maps.uri,
          snippet,
        });
      }
    }

    return res.json({
      text,
      model: targetModel,
      role,
      grounding: {
        usedSearch: useSearchGrounding,
        usedMaps: useMapsGrounding,
        searchCitations,
        mapPlaces,
        webSearchQueries,
        rawChunks: groundingChunks,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[GEMINI ROUTE ERROR]', error);
    return res.status(500).json({
      error: error.message || 'Failed to process AI chat request',
      details: error.status || 'INTERNAL_ERROR',
    });
  }
});

/**
 * Audio Transcription Endpoint
 * Uses gemini-3.5-transcribe to transcribe recorded microphone audio
 */
geminiRouter.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const { audio, mimeType = 'audio/webm', prompt } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'Audio payload (base64 string) is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in environment (GEMINI_API_KEY).',
      });
    }

    // Clean audio base64 if it has data URL prefix
    const cleanBase64 = audio.includes(',') ? audio.split(',')[1] : audio;
    const cleanMime = audio.includes(';') ? audio.split(';')[0].replace('data:', '') : mimeType;

    const audioPart = {
      inlineData: {
        mimeType: cleanMime || 'audio/webm',
        data: cleanBase64,
      },
    };

    const textPrompt = prompt || 
      'Transcribe this spoken audio verbatim with high precision. If it is in Arabic or English, keep the exact spoken language. If safety observations, hazard descriptions, or incident details are spoken, ensure technical safety terminology (PPE, LOTO, OSHAD, PTW, hazard) is transcribed cleanly.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: textPrompt },
        ],
      },
    });

    const transcript = response?.text?.trim() || '';

    return res.json({
      success: true,
      text: transcript,
      model: 'gemini-3.5-transcribe',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[GEMINI TRANSCRIBE ERROR]', error);
    return res.status(500).json({
      error: error.message || 'Failed to transcribe audio',
      success: false,
    });
  }
});

/**
 * Dedicated Google Maps Grounding Endpoint
 * Model: gemini-3.5-flash with googleMaps tool
 * Use cases: Finding nearest industrial clinic, trauma hospital, Civil Defence fire station,
 * emergency assembly, environmental hazard dump, or spill response depot across UAE / GCC.
 */
geminiRouter.post('/maps-grounding', async (req: Request, res: Response) => {
  try {
    const { prompt, userLatLng, facilityContext = 'Al-Ruwais Industrial Complex, Abu Dhabi' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const fullPrompt = `You are the Geospatial Emergency & Facility Grounding Assistant for industrial HSE operations.
Facility Context: ${facilityContext}.
User Request: ${prompt}

Locate real, verified facilities, medical centers, civil defence stations, or hazmat response points.
Provide precise operational guidance with clear location details.`;

    const toolConfig = userLatLng && typeof userLatLng.latitude === 'number' && typeof userLatLng.longitude === 'number' ? {
      retrievalConfig: {
        latLng: {
          latitude: userLatLng.latitude,
          longitude: userLatLng.longitude,
        },
      },
    } : undefined;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: fullPrompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig,
      },
    });

    const text = response?.text || '';
    const groundingChunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const places: { title: string; uri: string; reviewSnippet?: string }[] = [];
    for (const chunk of groundingChunks) {
      if (chunk.maps?.uri) {
        const snippetObj = chunk.maps.placeAnswerSources?.reviewSnippets?.[0];
        const snippet = snippetObj
          ? (typeof snippetObj === 'string' ? snippetObj : (snippetObj as any).reviewText || (snippetObj as any).text || String(snippetObj))
          : undefined;
        places.push({
          title: chunk.maps.title || 'Google Maps Location',
          uri: chunk.maps.uri,
          reviewSnippet: snippet,
        });
      }
    }

    return res.json({
      text,
      model: 'gemini-3.5-flash',
      places,
      rawChunks: groundingChunks,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[GEMINI MAPS ERROR]', error);
    return res.status(500).json({
      error: error.message || 'Failed to query Google Maps grounding',
    });
  }
});

/**
 * Dedicated Google Search Grounding Endpoint
 * Model: gemini-3.5-flash with googleSearch tool
 * Use cases: Real-time statutory updates (MOHRE heat stress announcements, OSHAD bulletins,
 * UAE Civil Defence alerts, ISO standards updates, and regional weather/flood warnings).
 */
geminiRouter.post('/search-grounding', async (req: Request, res: Response) => {
  try {
    const { query, jurisdiction = 'United Arab Emirates / GCC' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const prompt = `You are the Real-Time Regulatory & Safety Intelligence Agent for ${jurisdiction}.
Query: ${query}

Retrieve up-to-date, verified information on recent statutory decisions, ministerial circulars, environmental alerts, or industrial safety best practices.
Summarize key findings, effective dates, potential penalties for non-compliance, and immediate action items.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response?.text || '';
    const groundingChunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = response?.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const sources: { title: string; uri: string }[] = [];
    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri,
        });
      }
    }

    return res.json({
      text,
      model: 'gemini-3.5-flash',
      sources,
      webSearchQueries,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[GEMINI SEARCH ERROR]', error);
    return res.status(500).json({
      error: error.message || 'Failed to query Google Search grounding',
    });
  }
});

/**
 * Enterprise Structured Generation Endpoint
 * Supports models: gemini-3.8-flash (primary), gemini-3.1-flash-lite (resilient fallback)
 * Handles JSON output, system prompt injection, and error recovery cleanly on the server
 */
geminiRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { 
      contents, 
      prompt, 
      model = 'gemini-3.8-flash', 
      config = {}, 
      isJson = false 
    } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured in environment.',
      });
    }

    const promptContent = contents || prompt;
    if (!promptContent) {
      return res.status(400).json({
        success: false,
        error: 'Either contents or prompt is required in request body.',
      });
    }

    // Prepare system instruction and config
    const finalConfig: any = { ...config };
    if (!finalConfig.systemInstruction) {
      finalConfig.systemInstruction = ROLE_SYSTEM_INSTRUCTIONS.hse_advisor;
    }

    if (isJson && !finalConfig.responseMimeType) {
      finalConfig.responseMimeType = 'application/json';
    }

    // Models to attempt: primary requested model first, then gemini-3.1-flash-lite as fallback
    const candidateModels = [
      model,
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    let lastError: any = null;
    let responseText: string | null = null;
    let successfulModel = '';

    for (const targetModel of candidateModels) {
      try {
        const resp = await ai.models.generateContent({
          model: targetModel,
          contents: promptContent,
          config: finalConfig,
        });

        if (resp && resp.text) {
          responseText = resp.text;
          successfulModel = targetModel;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[GEMINI GENERATE] Attempt with ${targetModel} encountered: ${err?.message || err}`);
      }
    }

    if (!responseText) {
      return res.status(200).json({
        success: false,
        error: lastError?.message || 'AI service temporarily unavailable',
        status: lastError?.status || 503,
      });
    }

    let parsedData: any = responseText;
    if (isJson) {
      try {
        const clean = responseText.replace(/```json|```/g, '').trim();
        parsedData = JSON.parse(clean);
      } catch (parseErr: any) {
        console.warn('[GEMINI GENERATE] JSON parse warning, returning raw text:', parseErr?.message);
      }
    }

    return res.json({
      success: true,
      model: successfulModel,
      text: responseText,
      data: parsedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[GEMINI GENERATE ROUTE ERROR]', error);
    return res.status(200).json({
      success: false,
      error: error?.message || 'Internal AI generation failure',
    });
  }
});

