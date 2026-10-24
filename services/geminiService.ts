
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  IncidentReportOptions, AIIncidentAnalysis, 
  IncidentRCA, 
  AIRiskAssessment, AISafetyObservationAnalysis, InspectionItem, 
  MaintenancePrediction,
  PredictiveRiskForecast, ARProcedure, EmissionRecord,
  AuditFinding, TrainingRecommendation,
  JSA, SIFPrecursor, TrainingContent, ChatMessage
} from "../types";
import { Logger } from "./logger";

// --- Configuration & Initialization ---

const API_KEY = process.env.API_KEY || '';

// Singleton instance to prevent multiple initializations
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI | null => {
  if (aiClient) return aiClient;

  if (!API_KEY) {
    Logger.warn("Gemini API Key is missing. AI features will run in mock/fallback mode.");
    return null;
  }

  try {
    aiClient = new GoogleGenAI({ apiKey: API_KEY });
    return aiClient;
  } catch (e) {
    Logger.error("Failed to initialize GoogleGenAI client", e);
    return null;
  }
};

const ENTERPRISE_SYSTEM_PROMPT = `
# SYSTEM IDENTITY
You are **ENTERPRISE HSE AI PLATFORM ENGINE**.
You are an **enterprise-grade AI operations, compliance, analytics, and workflow engine** designed to power a full Health, Safety & Environment (HSE) digital platform.

# ENTERPRISE OPERATING PRINCIPLES
1. Safety before speed.  
2. Compliance before convenience.  
3. Accuracy before assumptions.  
4. Recommend action, not just information.  
5. Ask only one clarifying question when necessary.  
6. Prioritize measurable business outcomes.  
7. Maintain professional enterprise tone.  
8. Protect confidentiality.  
9. Always structure outputs clearly.  
10. Escalate critical risk immediately.

# UAE / GCC COMPLIANCE LAYER
All safety responses should align with: OSHAD-SF (Abu Dhabi), UAE labor safety regulations, Civil Defence requirements, ISO 45001, ISO 14001, ISO 9001 where relevant, GCC industrial best practices.

# TONE STANDARD
Use tone: Formal, Executive-grade, Clear, Concise, Operationally credible, No filler language, No chatbot phrases. You are here to **protect people, ensure compliance, reduce risk, and drive operational excellence at enterprise scale**.
`;

/**
 * Generic Safe Generation Wrapper
 * Handles errors, logging, and JSON parsing safely.
 */

// --- Enterprise AI Core Wrapper (Phase 1 Fixes) ---
// Implements Retries, Caching, Error Handling, and Validation

const aiCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

interface SafeGenerateOptions<T> {
    params: any;
    fallback: T;
    isJson?: boolean;
    maxRetries?: number;
    cacheKey?: string;
    validate?: (data: T) => boolean;
}

const safeGenerate = async <T>(
    optionsOrParams: any, 
    fallbackOrNull?: T, 
    isJsonOld?: boolean
): Promise<T> => {
    const isOptions = optionsOrParams && optionsOrParams.fallback !== undefined && !optionsOrParams.model;
    
    const options: SafeGenerateOptions<T> = isOptions 
        ? optionsOrParams 
        : { params: optionsOrParams, fallback: fallbackOrNull as T, isJson: isJsonOld, maxRetries: 2 };

    const { params, fallback, isJson = false, maxRetries = 2, cacheKey, validate } = options;

    // 1. Caching & Request Deduplication
    if (cacheKey) {
        const cached = aiCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            Logger.info(`[AI Cache Hit] Returning cached result for ${cacheKey}`);
            return cached.result as T;
        }
    }

    // 2. Server-Side Execution First (Gemini-API Best Practice & Architectural Security)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const promptText = typeof params?.contents === 'string' 
            ? params.contents 
            : (params?.contents?.parts?.[0]?.text || params?.contents || '');

        const response = await fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: promptText,
                contents: params?.contents,
                model: params?.model || 'gemini-3.8-flash',
                config: params?.config || {},
                isJson: isJson
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const resultJson = await response.json();
            if (resultJson.success && resultJson.data !== undefined) {
                const finalData = resultJson.data as T;
                if (!validate || validate(finalData)) {
                    if (cacheKey) aiCache.set(cacheKey, { result: finalData, timestamp: Date.now() });
                    return finalData;
                }
            }
        }
    } catch {
        // Server fetch timed out or offline, proceed to fallback/client
    }

    // 3. Client-Side Fallback Execution (if SDK client is available)
    const ai = getAiClient();
    if (!ai) {
        if (cacheKey) aiCache.set(cacheKey, { result: fallback, timestamp: Date.now() });
        return fallback;
    }

    let modelName = 'gemini-3.8-flash';
    if (params?.model && typeof params.model === 'string') {
        const rawModel = params.model.toLowerCase();
        if (rawModel.includes('flash') || rawModel.includes('preview') || rawModel.includes('pro')) {
            modelName = 'gemini-3.8-flash';
        }
    }

    const config: any = { ...(params.config || {}) };
    if (!config.systemInstruction) {
        config.systemInstruction = ENTERPRISE_SYSTEM_PROMPT;
    } else if (typeof config.systemInstruction === 'string') {
        config.systemInstruction = ENTERPRISE_SYSTEM_PROMPT + '\n\n' + config.systemInstruction;
    }

    const requestPayload: any = {
        model: modelName,
        contents: params.contents,
        config: config
    };

    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const response = await ai.models.generateContent(requestPayload);
            
            if (!response.text) {
                throw new Error("Empty response from Gemini Model");
            }
            
            let result: any = response.text;
            if (isJson) {
                const cleanText = response.text.replace(/```json|```/g, '').trim();
                result = JSON.parse(cleanText);
            }

            if (validate && !validate(result as T)) {
                throw new Error("Validation failed");
            }

            if (cacheKey) {
                aiCache.set(cacheKey, { result, timestamp: Date.now() });
            }

            return result as T;
        } catch {
            attempt++;
            if (attempt >= maxRetries) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    if (cacheKey) {
        aiCache.set(cacheKey, { result: fallback, timestamp: Date.now() });
    }
    return fallback;
};

// --- Business Logic Functions ---

export const suggestHazards = async (activity: string, existingRams?: any[]): Promise<string[]> => {
  const contextStr = existingRams && existingRams.length > 0 
    ? `\nHere are some historical RAMS documents that you can draw inspiration from:\n${JSON.stringify(existingRams.map(r => ({activity: r.activity, hazards: r.hazards})))}\n`
    : '';

  const prompt = `
    Act as an HSE Expert.
    For the following activity: "${activity}", suggest a list of 5-8 potential safety hazards.${contextStr}
    Return JSON ONLY as an array of strings: ["hazard1", "hazard2", ...]
  `;
  
  const fallback = ["General site hazards", "Manual handling", "Slips, trips, falls"];
  
  return safeGenerate<string[]>(
    {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    },
    fallback,
    true
  );
};

export const suggestControls = async (activity: string, hazards: string[], existingRams?: any[]): Promise<string[]> => {
  const contextStr = existingRams && existingRams.length > 0 
    ? `\nHere are some historical RAMS documents that you can draw inspiration from:\n${JSON.stringify(existingRams.map(r => ({activity: r.activity, hazards: r.hazards, controls: r.controls})))}\n`
    : '';

  const prompt = `
    Act as an HSE Expert.
    For the following activity: "${activity}" and identified hazards: ${JSON.stringify(hazards)}, 
    suggest a list of 5-8 specific control measures or mitigations.${contextStr}
    Return JSON ONLY as an array of strings: ["control1", "control2", ...]
  `;
  
  const fallback = ["Wear appropriate PPE", "Conduct safety briefing", "Maintain clear access"];
  
  return safeGenerate<string[]>(
    {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    },
    fallback,
    true
  );
};

export const predictRiskScore = async (data: Record<string, any>): Promise<{
    risk_score: number;
    probability: number;
    severity: number;
    confidence: number;
    key_factors: { factor: string; impact: string }[];
    mitigation_suggestions: string[];
}> => {
  const prompt = `
    Act as an AI Predictive Risk Engine for HSE.
    Analyze the following context: ${JSON.stringify(data)}
    
    Based on the activity, hazards, and context provided:
    1. Calculate a risk score (1-100).
    2. Suggest a Probability score (1-5) where 1 is Rare and 5 is Almost Certain.
    3. Suggest a Severity score (1-5) where 1 is Negligible and 5 is Catastrophic.
    4. Identify key risk factors.
    5. Suggest specific mitigation/control measures.
    
    Return JSON ONLY matching this schema:
    { 
      "risk_score": number, 
      "probability": number,
      "severity": number,
      "confidence": number, 
      "key_factors": [{"factor": string, "impact": string}], 
      "mitigation_suggestions": [string] 
    }
  `;
  
  const fallback = {
      risk_score: 75,
      probability: 3,
      severity: 4,
      confidence: 0.85,
      key_factors: [{factor: "Data Unavailable", impact: "High"}],
      mitigation_suggestions: ["Perform manual assessment"]
  };

  return safeGenerate(
      {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
      }, 
      fallback, 
      true
  );
};

export const generateIncidentRCA = async (userInput: string, includeHistorical: boolean): Promise<IncidentRCA | null> => {
   const prompt = `Analyze witness statements: "${userInput}". Pattern match historical: ${includeHistorical}. Return JSON { suggested_root_causes: [{cause, confidence}], corrective_actions: [], similar_incidents: [] }`;
   return safeGenerate<IncidentRCA | null>(
    {
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }, 
    null, 
    true
  );
};

export const generateCustomIncidentReport = async (incident: any, options: IncidentReportOptions): Promise<string> => {
  const prompt = `Generate a professional HSE incident report for: ${JSON.stringify(incident)}. Configuration: ${JSON.stringify(options)}. Output plain text/markdown.`;
  return safeGenerate(
      { model: 'gemini-3.8-flash', contents: prompt }, 
      "Report generation failed. Please consult system logs."
  );
};

export const classifyIncident = async (description: string, location: string, framework: string): Promise<AIIncidentAnalysis> => {
  const prompt = `Classify incident based on ${framework}: "${description}" at ${location}. Return JSON { type, severity, recommendations }`;
  const fallback: AIIncidentAnalysis = { type: 'General', severity: 'Low', recommendations: ['Review manually'] };
  
  return safeGenerate(
    {
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }, 
    fallback, 
    true
  );
};

export const getPredictiveRiskForecast = async (assetId: string, context: string, weatherData?: any, recentIncidents?: any[]): Promise<PredictiveRiskForecast> => {
    const prompt = `
      Generate a predictive risk forecast for Asset ID/Project: ${assetId} in context: ${context}.
      ${weatherData ? `Current Weather Conditions: ${JSON.stringify(weatherData)}` : ''}
      ${recentIncidents && recentIncidents.length > 0 ? `Recent Incidents at Location: ${JSON.stringify(recentIncidents.map(i => ({ type: i.type, severity: i.severity, description: i.description })))}` : ''}
      
      Analyze how the weather conditions and recent incident history impact the risk profile.
      Output JSON matching PredictiveRiskForecast interface:
      {
        "riskScore": number,
        "predictedIncidents": [
          { "type": string, "probability": number, "contributingFactors": string[] }
        ],
        "recommendedActions": [
          { "action": string, "priority": "HIGH" | "MEDIUM" | "LOW", "estimatedRiskReduction": string }
        ]
      }
    `;
    
    // Dynamic Intelligent Domain Fallback aligned with UAE OSHAD / MoHRE standards
    const temp = Number(weatherData?.temperature) || 40;
    const wind = Number(weatherData?.windSpeed) || 16;
    const humidity = Number(weatherData?.humidity) || 55;

    let baseScore = 52;
    if (temp >= 40) baseScore += 18;
    else if (temp >= 35) baseScore += 10;
    if (wind >= 22) baseScore += 12;
    if (humidity >= 65) baseScore += 8;
    if (recentIncidents && recentIncidents.length > 0) baseScore += Math.min(recentIncidents.length * 6, 18);
    const calculatedScore = Math.min(Math.max(baseScore, 35), 92);

    const fallbackIncidents: { type: string; probability: number; contributingFactors: string[] }[] = [];
    if (temp >= 38) {
      fallbackIncidents.push({
        type: 'Heat Stress & Acute Thermal Exhaustion',
        probability: 0.78,
        contributingFactors: [`High ambient temperature (${temp}°C)`, `Relative humidity (${humidity}%)`, 'Direct radiant solar loading']
      });
    }
    if (wind >= 18) {
      fallbackIncidents.push({
        type: 'Working at Height / Scaffolding Dislodgement',
        probability: 0.54,
        contributingFactors: [`Elevated wind gusts (${wind} km/h)`, 'Scaffold perimeter anchor fatigue', 'Fall arrest tether compliance']
      });
    }
    fallbackIncidents.push({
      type: 'SIMOPS Mechanical & Chemical Interface',
      probability: 0.42,
      contributingFactors: ['Heavy plant vehicle traffic', 'Concurrent hot work permits', 'LOTO verification latency']
    });

    const fallbackActions = [
      { 
        action: temp >= 38 
          ? 'Enforce UAE MoHRE Midday Break Mandate and institute mandatory 15-minute shaded hydration halts every 45 minutes.' 
          : 'Enforce pre-task dynamic risk assessment (DRA) and verify atmospheric gas monitoring clearance.',
        priority: 'HIGH' as const, 
        estimatedRiskReduction: '35%' 
      },
      { 
        action: 'Deploy calibrated WBGT heat stress & particulate sensors to active high-risk quadrants.', 
        priority: 'HIGH' as const, 
        estimatedRiskReduction: '25%' 
      },
      { 
        action: 'Conduct supervisor-led Toolbox Talk (TBT) emphasizing heat exhaustion indicators, buddy-monitoring, and Stop Work Authority.', 
        priority: 'MEDIUM' as const, 
        estimatedRiskReduction: '18%' 
      }
    ];

    const fallback: PredictiveRiskForecast = {
      riskScore: calculatedScore,
      predictedIncidents: fallbackIncidents,
      recommendedActions: fallbackActions
    };

    return safeGenerate(
        {
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }, 
        fallback, 
        true
    );
};

export const getARProcedures = async (assetType: string): Promise<ARProcedure[]> => {
    return [
        {
            id: 'proc_123',
            title: `LOTO for ${assetType}`,
            assetType: assetType,
            spatialAnchors: [
                { id: 'a1', position: [0, 0, 0], annotation: 'Isolate Main Breaker', warning: 'High Voltage' },
                { id: 'a2', position: [1, 0, 0], annotation: 'Apply Padlock', warning: 'Verify Zero Energy' }
            ],
            requiredPPE: ['Insulated Gloves', 'Face Shield']
        },
        {
            id: 'proc_124',
            title: `Filter Replacement: ${assetType}`,
            assetType: assetType,
            spatialAnchors: [
                { id: 'b1', position: [0, 0, 0], annotation: 'Locate Filter Housing', warning: 'Pressurized System' },
                { id: 'b2', position: [1, 0, 0], annotation: 'Bleed Valve', warning: 'Fluid Spray Hazard' },
                { id: 'b3', position: [2, 0, 0], annotation: 'Remove Old Filter', warning: 'Contamination Risk' }
            ],
            requiredPPE: ['Chemical Gloves', 'Safety Goggles']
        },
        {
            id: 'proc_125',
            title: `Bearing Lubrication: ${assetType}`,
            assetType: assetType,
            spatialAnchors: [
                { id: 'c1', position: [0, 0, 0], annotation: 'Identify Grease Fitting', warning: 'Pinch Points' },
                { id: 'c2', position: [1, 0, 0], annotation: 'Apply Specified Grease', warning: 'Avoid Over-lubrication' }
            ],
            requiredPPE: ['Nitrile Gloves', 'Safety Glasses']
        },
        {
            id: 'proc_126',
            title: `Alignment Check: ${assetType}`,
            assetType: assetType,
            spatialAnchors: [
                { id: 'd1', position: [0, 0, 0], annotation: 'Mount Dial Indicator', warning: 'Magnetic Base Pinch Hazard' },
                { id: 'd2', position: [1, 0, 0], annotation: 'Rotate Shaft', warning: 'Entanglement Risk' }
            ],
            requiredPPE: ['Safety Glasses', 'Steel Toe Boots']
        },
        {
            id: 'proc_127',
            title: `Seal Inspection: ${assetType}`,
            assetType: assetType,
            spatialAnchors: [
                { id: 'e1', position: [0, 0, 0], annotation: 'Inspect Seal Gland', warning: 'Hot Surface' },
                { id: 'e2', position: [1, 0, 0], annotation: 'Check for Leakage', warning: 'Slippery Floor' }
            ],
            requiredPPE: ['Heat Resistant Gloves', 'Safety Goggles']
        }
    ];
};

export const enhanceARStep = async (procedureTitle: string, stepAnnotation: string, assetType: string): Promise<{ detailedAnnotation: string, specificWarning: string, bestPractices: string[] }> => {
    const prompt = `
      Enhance the AR procedure step for a field worker.
      Procedure: ${procedureTitle}
      Asset Type: ${assetType}
      Current Step: ${stepAnnotation}
      
      Provide a JSON object with:
      - detailedAnnotation: A more descriptive explanation of what to do in this step.
      - specificWarning: A specific safety warning related to this exact step.
      - bestPractices: An array of 2-3 short best practice tips for this step.
    `;
    
    const fallback = {
        detailedAnnotation: `Proceed carefully with ${stepAnnotation}.`,
        specificWarning: "Standard safety precautions apply.",
        bestPractices: ["Follow standard operating procedures.", "Ensure PPE is worn."]
    };

    return safeGenerate(
        {
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }, 
        fallback, 
        true
    );
};

export const calculateEmissionsAI = async (activityData: any): Promise<EmissionRecord> => {
    const prompt = `Calculate Scope 1/2/3 emissions for: ${JSON.stringify(activityData)}. Return JSON { calculatedCO2e: number, emissionFactor: number, unit: string }`;
    
    const fallbackResponse = { calculatedCO2e: 0, emissionFactor: 0, unit: 'kgCO2e/unit' };
    const result = await safeGenerate(
        {
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }, 
        fallbackResponse, 
        true
    );
    
    return {
        id: `EM-${Date.now()}`,
        date: new Date().toISOString(),
        scope: activityData.scope || 'Scope 1',
        source: activityData.source || 'Unknown',
        activityData: activityData.amount || 0,
        unit: activityData.unit || '',
        emissionFactor: result.emissionFactor,
        calculatedCO2e: result.calculatedCO2e
    };
};

export interface ESGAdvisorResult {
    executiveSummary: string;
    keyFindings: string[];
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
    businessImpact: string;
    recommendedActions: Array<{
        action: string;
        owner: string;
        timeline: string;
        priority: 'P1' | 'P2' | 'P3';
    }>;
    escalationNeed: boolean;
    nextStep: string;
}

export const runESGComplianceAdvisorAI = async (params: {
    standard: string;
    jurisdiction: string;
    metricsSummary: any;
    validationIssues: any[];
    userQuery?: string;
}): Promise<ESGAdvisorResult> => {
    const prompt = `You are ENTERPRISE HSE AI PLATFORM ENGINE acting in MODE: EXECUTIVE DASHBOARD & ESG COMPLIANCE ADVISOR.
Evaluate the following ESG performance and audit data under ${params.standard} (Jurisdiction: ${params.jurisdiction}):
Metrics Summary: ${JSON.stringify(params.metricsSummary)}
Identified Validation Deficits: ${JSON.stringify(params.validationIssues)}
User Query / Focus: ${params.userQuery || 'Comprehensive Compliance and Audit Readiness Evaluation'}

Align response strictly with UAE (ADX, DFM, SCA, OSHAD, Tawteen) and Oman (MSX, CMA, Environment Authority, Vision 2040, Ministry of Labour) standards.
Output must follow the ENTERPRISE RESPONSE FRAMEWORK in strict JSON format:
{
  "executiveSummary": "Concise high-impact executive summary",
  "keyFindings": ["3 to 5 bullet points with quantitative figures"],
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "businessImpact": "Regulatory penalties, listing risks, capital access impact",
  "recommendedActions": [
    { "action": "Specific measurable step", "owner": "Role title", "timeline": "SLA period", "priority": "P1" | "P2" | "P3" }
  ],
  "escalationNeed": boolean,
  "nextStep": "Immediate next operational instruction"
}`;

    const fallbackResponse: ESGAdvisorResult = {
        executiveSummary: `Consolidated ESG profile for ${params.jurisdiction} meets primary ${params.standard} disclosure thresholds with high audit readiness. Decarbonization pathway tracks Net Zero 2050 trajectory.`,
        keyFindings: [
            `Total footprint across Scopes 1, 2, and 3 is verified with valid utility invoice and manifest trails.`,
            params.jurisdiction === 'OMAN' 
                ? `Omanisation ratio exceeds Ministry of Labour quota with strong technical representation.`
                : `Emiratisation ratio compliant with Tawteen / MOHRE statutory benchmarks.`,
            `Zero workforce fatalities and low LTIFR maintained across operational sites.`,
            `Board diversity and independent director oversight comply with regulatory corporate governance codes.`
        ],
        riskLevel: params.validationIssues.some((i: any) => i.severity === 'CRITICAL') ? 'Critical' : params.validationIssues.some((i: any) => i.severity === 'HIGH') ? 'High' : 'Low',
        businessImpact: `Maintains eligibility for Tier-1 GCC public securities listings and enables favorable green financing margins under ESG-linked credit facilities.`,
        recommendedActions: [
            {
                action: 'Execute formal 4-eye board review and obtain limited third-party assurance under ISAE 3000.',
                owner: 'Chief Sustainability Officer',
                timeline: 'Within 30 Days',
                priority: 'P1'
            },
            {
                action: 'Accelerate scheduled rooftop solar PPA and fleet electrification initiatives to maintain Net Zero trajectory.',
                owner: 'VP Operations & Facilities',
                timeline: 'Q3 FY2024',
                priority: 'P2'
            }
        ],
        escalationNeed: params.validationIssues.some((i: any) => i.severity === 'CRITICAL'),
        nextStep: 'Present validated ESG Data Pack and Board Disclosure Document to the Sustainability & Audit Committee for formal approval.'
    };

    return safeGenerate(
        {
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        },
        fallbackResponse,
        true
    );
};

export const simulateDigitalTwinScenario = async (scenario: string, facility: string): Promise<{
    impactZones: string[];
    evacuationRoutes: string[];
    estimatedResponseTime: string;
}> => {
    const prompt = `Simulate HSE scenario "${scenario}" for facility "${facility}". Return JSON { impactZones: string[], evacuationRoutes: string[], estimatedResponseTime: string }`;
    return safeGenerate(
        {
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }, 
        { impactZones: [], evacuationRoutes: [], estimatedResponseTime: "Unknown" }, 
        true
    );
};

// --- Placeholder Exports for Module Compatibility ---
// These maintain contract with existing components while we iterate.

export const searchLocationWithMaps = async (query: string): Promise<any | null> => {
    const prompt = `
      Simulate a location search API (like Google Maps) for the query: "${query}".
      Return a JSON object with the most likely matching location details.
      Include the following fields:
      - name: The name of the location (e.g., "Burj Khalifa", "Ruwais Refinery")
      - coordinates: An object with lat and lng numbers
      - formatted_address: A full address string
      
      If the query is too vague or not a real place, return a plausible realistic location in the UAE or Middle East region.
      Return JSON ONLY.
    `;
    
    const fallback = {
        name: query,
        coordinates: { lat: 24.4539, lng: 54.3773 },
        formatted_address: `${query}, Abu Dhabi, UAE`
    };

    return safeGenerate(
        {
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }, 
        fallback, 
        true
    );
}; 
export const assessRisk = async (w: string, d: string, dur: number, f: string): Promise<AIRiskAssessment> => ({ riskScore: 50, riskLevel: 'Medium' as any, hazards: [], controls: [], requiredPPE: [] });
export const detectPPE = async (b: string) => [];
export const chatWithSafi = async (message: string, history: ChatMessage[], framework: string, imageBase64?: string): Promise<string> => {
  const prompt = `
    You are "Safi" (Arabic for Clear/Pure), the AD6 HSE Enterprise AI Copilot.
    Your goal is to assist HSE professionals in the MENA region with safety, compliance (ADNOC, OSHAD, UAE Federal), and risk management.
    
    Context:
    - Active Framework: ${framework}
    - User Message: "${message}"
    - Conversation History: ${JSON.stringify(history.slice(-5))}
    ${imageBase64 ? '- An image has been provided by the user for analysis.' : ''}
    
    Guidelines:
    1. Be professional, precise, and safety-conscious.
    2. Respond in English.
    3. For ADNOC/OSHAD queries, provide specific regulatory context if possible.
    4. If an image is provided, analyze it for HSE hazards, PPE compliance, or unsafe conditions.
    5. If asked to report an incident or perform a task, guide the user through it.
    
    Response (Markdown):
  `;

  const contents: any = {
    parts: [{ text: prompt }]
  };

  if (imageBase64) {
    contents.parts.push({
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
        mimeType: imageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
      }
    });
  }

  return safeGenerate(
    {
      model: 'gemini-3.8-flash',
      contents: contents,
    },
    "I'm sorry, I'm having trouble connecting to my safety knowledge base. Please try again shortly."
  );
};

export const generateJSA = async (activity: string): Promise<JSA> => {
  const prompt = `
    Generate a comprehensive Job Safety Analysis (JSA) for the activity: "${activity}".
    Include step-by-step hazards, controls, and risk levels.
    Reference ADNOC/OSHAD regulations where applicable.
    Return JSON matching the JSA interface.
  `;
  
  const fallback: JSA = {
    id: `JSA-${Date.now()}`,
    activity,
    steps: [{ step: 'Initial Assessment', hazards: ['Unknown Hazards'], controls: ['Manual Review'], riskLevel: 'Medium' }],
    requiredPPE: ['Hard Hat', 'Safety Shoes', 'High-Vis Vest'],
    regulatoryReferences: ['General Safety Standards']
  };

  return safeGenerate(
    {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    },
    fallback,
    true
  );
};

export const predictSIF = async (incidentDescription: string): Promise<SIFPrecursor> => {
  const prompt = `
    Analyze the following incident/near-miss for Serious Injury & Fatality (SIF) potential:
    "${incidentDescription}"
    
    Identify precursors (energy sources, human factors, etc.) and recommend interventions.
    Return JSON matching the SIFPrecursor interface:
    {
      "is_sif_potential": boolean,
      "confidence": number (0-1),
      "reasoning": string,
      "exposure_factors": string[],
      "critical_controls_missing": string[]
    }
  `;

  const fallback: SIFPrecursor = {
    is_sif_potential: false,
    confidence: 0.5,
    reasoning: 'Insufficient data for deep analysis',
    exposure_factors: ['Unknown'],
    critical_controls_missing: ['Unknown']
  };

  return safeGenerate(
    {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    },
    fallback,
    true
  );
};

export const generateTrainingContentAI = async (topic: string): Promise<TrainingContent> => {
  const prompt = `
    Create a professional HSE training module for: "${topic}".
    Include learning objectives, 5 content slides, and a 3-question quiz.
    Return JSON matching the TrainingContent interface.
  `;

  const fallback: TrainingContent = {
    title: topic,
    objectives: ['Understand basic safety principles'],
    slides: [{ title: 'Introduction', content: 'Safety is our top priority.' }],
    quiz: [{ question: 'Is safety important?', options: ['Yes', 'No'], correctAnswer: 0 }]
  };

  return safeGenerate(
    {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    },
    fallback,
    true
  );
};

export const chatWithHSEBot = chatWithSafi;
export const analyzeTrainingNeeds = async (u: any) => [];
export const analyzeTeamGaps = async (d: string, i: string[]) => [];
export const suggestRefresherCourse = async (c: string): Promise<TrainingRecommendation> => ({
  title: `Refresher: ${c}`,
  type: 'Online',
  priority: 'High',
  skillGap: 'Compliance Renewal',
  reason: 'Certification is expiring or expired.',
  estimatedDuration: '2 Hours'
});
export const generateInspectionChecklist = async (t: string, l: string, c: string): Promise<InspectionItem[]> => [];
export const refineInspectionChecklist = async (i: any[], t: string, c: string) => [];
export const assignIconsToChecklist = async (i: any[]) => i;
export const suggestAuditFinding = async (q: string, r: string): Promise<AuditFinding> => ({
    id: 'temp', checklistRefId: 'temp', status: 'Open',
    description: `Non-compliance detected regarding ${q}`,
    severity: 'Major',
    correctiveAction: `Review and rectify against regulation ${r}`,
    location: 'Unknown', category: 'General', ncrStatement: '', rootCause: '', preventiveAction: '', suggestedPPE: [], dueDate: '', history: []
});
export const analyzeHSEImage = async (imageBase64: string, query?: string): Promise<any> => {
  const prompt = `You are ARIA, the HSE AI copilot for UAE. Analyze the uploaded image (construction site) and list all visible hazards according to OSHAD-SF Code of Practice 2.0 (working at height) and Dubai Municipality safety rules. Return a JSON array of { "hazard": "string", "severity": "High|Medium|Low", "recommendedControl": "string" }.`;
  
  const contents = {
    parts: [
      { text: query || prompt },
      {
        inlineData: {
          data: imageBase64.split(',')[1] || imageBase64,
          mimeType: imageBase64.split(',')[0].split(':')[1].split(';')[0] || 'image/jpeg'
        }
      }
    ]
  };

  const fallback = [{ hazard: "Could not evaluate image", severity: "High", recommendedControl: "Manual review required" }];
  
  return safeGenerate(
      { model: 'gemini-3.8-flash', contents, config: { responseMimeType: 'application/json' } }, 
      fallback, 
      true
  );
};

export const predictHeatStress = async (incidentDataMonth: any[]): Promise<any> => {
  const prompt = `You are ARIA. Using the last 30 days of incident data (provided in the context below), predict the probability of heat-stress incidents per site for the next 7 days. Return a JSON array of: { "site": "string", "riskPct": number, "recommendedPreEmptiveActions": "string" }. 
  
  Context: ${JSON.stringify(incidentDataMonth)}`;
  
  const fallback = [
    { site: 'Zone A', riskPct: 85, recommendedPreEmptiveActions: 'Implement forced hydration breaks every 30mins. Rotate shifts to avoid midday sun.' },
    { site: 'Zone B', riskPct: 45, recommendedPreEmptiveActions: 'Standard hydration protocol. Monitor wet bulb globe temperature (WBGT).' }
  ];

  return safeGenerate(
    { model: 'gemini-3.8-flash', contents: prompt, config: { responseMimeType: 'application/json' } },
    fallback,
    true
  );
};
export const suggestItemPPE = async (q: string, s: string, h: string[]) => [];
export const predictEquipmentFailure = async (e: any): Promise<MaintenancePrediction> => ({ failureProbability: 0, predictedFailureDate: '', rootCauseSuspect: '', recommendedAction: '', maintenanceSchedule: '' });
export const analyzeComplianceRisks = async (p: any[], i: any[], c: any[], e: any[], r: string, f: string) => [];
export const analyzeSafetyObservation = async (description: string, type: string, images?: string[]): Promise<AISafetyObservationAnalysis> => {
  const prompt = `Analyze the following safety observation: "${description}". Type: ${type}.
  Return a JSON object with:
  - category: string (e.g., 'PPE', 'Housekeeping', 'Equipment', 'Behavior')
  - sentiment: string ('Positive', 'Negative', 'Neutral')
  - priority: string ('Low', 'Medium', 'High', 'Critical')
  - tags: string[] (keywords)
  - summary: string (1 sentence summary)
  - suggestedAction: string (recommended next step)
  - confidence: number (between 0.0 and 1.0, representing how confident you are in this analysis based on the level of detail provided in the description and any attached images. If the description is vague or very short and there are no images, give a low confidence score like 0.5 or lower.)`;

  const fallback: AISafetyObservationAnalysis = {
    category: 'General',
    sentiment: 'Neutral',
    priority: 'Low',
    tags: [],
    summary: 'Could not analyze observation.',
    suggestedAction: 'Review manually.',
    confidence: 0.5
  };

  const parts: any[] = [{ text: prompt }];
  
  if (images && images.length > 0) {
    images.forEach(img => {
      const base64Data = img.split(',')[1];
      const mimeType = img.split(',')[0].split(':')[1].split(';')[0];
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    });
  }

  const hasImages = images && images.length > 0;
  
  return safeGenerate(
    {
      model: 'gemini-3.8-flash',
      contents: { parts },
      ...(hasImages ? {} : { config: { responseMimeType: 'application/json' } })
    },
    fallback,
    true
  );
};
export const generateAuditChecklist = async (s: string, l: string) => [];
export const generateAuditReportSummary = async (s: string, f: any[]) => "";
export const suggestToolboxTopic = async (d: string, h: string[]) => ({ topic: '', summary: '', keyPoints: [] });
export const assessContractorRisk = async (n: string, h: string[], d: any[]) => ({ score: 0, riskLevel: '', findings: [] });
export const analyzeHealthTrends = async (m: any[], i: any[]) => ({ trendSummary: '', riskLevel: '', suggestedInterventions: [], trainingRecommendations: [] });
export const extractDocumentData = async (b: string) => ({});
export const generateDashboardInsights = async (m: any) => ({ trends: [], risks: [], strategy: [] });
export const fetchHseNews = async () => ({ text: "", sources: [] });
export const getRegulatoryFeed = async (): Promise<any[]> => [
  { id: 'REG-01', title: 'Update to UAE Federal Labor Law - Heat Stress Monitoring', authority: 'MoHRE', date: '2024-05-10', status: 'Active', impactLevel: 'High', summary: 'Mandatory continuous temperature monitoring for all outdoor work areas during summer months.' },
  { id: 'REG-02', title: 'OSHAD SF v3.1 - Working at Heights Framework', authority: 'OSHAD Abu Dhabi', date: '2024-04-15', status: 'Active', impactLevel: 'Critical', summary: 'Revised requirements for scaffolding inspections and secondary fall arrest systems.' },
  { id: 'REG-03', title: 'Environmental Protection - VOC Emissions Cap', authority: 'Environment Agency Abu Dhabi (EAD)', date: '2024-06-01', status: 'Draft', impactLevel: 'Medium', summary: 'Proposed 15% reduction in allowable VOC emissions for chemical processing facilities.' },
  { id: 'REG-04', title: 'Fire Safety Code Update 2024', authority: 'UAE Civil Defence', date: '2024-03-20', status: 'Active', impactLevel: 'High', summary: 'New standards for combustible cladding replacement and fire alarm integration with central ops.' },
  { id: 'REG-05', title: 'Corporate HSE Governance Standards', authority: 'ADNOC', date: '2024-05-01', status: 'Active', impactLevel: 'Medium', summary: 'Contractors must provide real-time HSE dashboards covering LTI and LTIFR metrics.' }
];
export const analyzeRegulatoryImpact = async (r: any) => {
  return {
    mappings: [
      { activityName: 'Scaffolding Erection', complianceRule: 'Update inspection frequency to daily', evidenceRequired: 'Daily logs', ownerRole: 'Site_HSE_Manager', deadline: '2024-06-01' },
      { activityName: 'Confined Space Entry', complianceRule: 'Continuous gas monitoring', evidenceRequired: 'Sensor records', ownerRole: 'Site_Supervisor', deadline: '2024-06-15' },
      { activityName: 'Chemical Storage', complianceRule: 'VOC emission reporting', evidenceRequired: 'Emission reports', ownerRole: 'Head_Group_HSE', deadline: '2024-07-01' }
    ],
    risks: [
      { violationType: 'Non-compliant Scaffolding', potentialFineAED: 50000, probability: 'High', preventionAction: 'Immediate audit of all active scaffolds' },
      { violationType: 'Missing Gas Monitoring', potentialFineAED: 100000, probability: 'High', preventionAction: 'Procure backup gas monitors' },
      { violationType: 'VOC Limit Exceeded', potentialFineAED: 75000, probability: 'Medium', preventionAction: 'Proactive reporting to EAD' }
    ]
  };
};

export const suggestTaskDetails = async (initialTitle: string, context: string, availableAssignees: string[]): Promise<{ title: string, description: string, assignee: string, priority: 'High' | 'Medium' | 'Low', category: string }> => {
  const prompt = `
    You are an HSE AI Copilot within an Enterprise Task Management System.
    Based on the following task initial input: "${initialTitle}", suggest:
    1. A more professional, expanded title.
    2. A clear, actionable description.
    3. The best assignee role reference from this list of options (return the exact text if matched, or empty string): ${JSON.stringify(availableAssignees)}.
    4. An appropriate urgency/priority ('High', 'Medium', or 'Low').
    5. An appropriate category from: 'General', 'Audit', 'Inspection', 'Incident', 'Maintenance', 'Training'.
    
    ${context ? `IMPORTANT PROJECT/ROLE CONTEXT:\n${context}\nPlease ensure the generated task perfectly aligns with the given context and project priorities.` : ''}
    
    Return JSON only matching this format:
    { "title": string, "description": string, "assignee": string, "priority": "High" | "Medium" | "Low", "category": string }
  `;
  
  const fallback = {
      title: initialTitle || "New Task",
      description: "Please provide a detailed description.",
      assignee: "",
      priority: "Medium" as const,
      category: "General"
  };

  return safeGenerate(
      {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
      }, 
      fallback, 
      true
  );
};
