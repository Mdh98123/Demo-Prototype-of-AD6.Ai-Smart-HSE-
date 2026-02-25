
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

/**
 * Generic Safe Generation Wrapper
 * Handles errors, logging, and JSON parsing safely.
 */
const safeGenerate = async <T>(
    params: any, 
    fallback: T, 
    isJson: boolean = false
): Promise<T> => {
    const ai = getAiClient();
    
    // Fail fast if no client
    if (!ai) {
        return fallback;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent(params);
        
        if (!response.text) {
            throw new Error("Empty response from Gemini Model");
        }

        if (isJson) {
            // sanitize markdown code blocks if present
            const cleanText = response.text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanText) as T;
        }
        
        return response.text as unknown as T;

    } catch (error) {
        Logger.error("AI Generation Failed", error, { paramsModel: params.model });
        return fallback;
    }
};

// --- Business Logic Functions ---

export const predictRiskScore = async (data: Record<string, any>): Promise<{
    risk_score: number;
    confidence: number;
    key_factors: { factor: string; impact: string }[];
    mitigation_suggestions: string[];
}> => {
  const prompt = `
    Act as an AI Predictive Risk Engine for HSE.
    Analyze the following context: ${JSON.stringify(data)}
    Calculate a risk score (1-100).
    Return JSON ONLY matching this schema:
    { "risk_score": number, "confidence": number, "key_factors": [{"factor": string, "impact": string}], "mitigation_suggestions": [string] }
  `;
  
  const fallback = {
      risk_score: 75,
      confidence: 0.85,
      key_factors: [{factor: "Data Unavailable", impact: "High"}],
      mitigation_suggestions: ["Perform manual assessment"]
  };

  return safeGenerate(
      {
          model: 'gemini-3-flash-preview',
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
        model: 'gemini-3-pro-preview',
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
      { model: 'gemini-3-flash-preview', contents: prompt }, 
      "Report generation failed. Please consult system logs."
  );
};

export const classifyIncident = async (description: string, location: string, framework: string): Promise<AIIncidentAnalysis> => {
  const prompt = `Classify incident based on ${framework}: "${description}" at ${location}. Return JSON { type, severity, recommendations }`;
  const fallback: AIIncidentAnalysis = { type: 'General', severity: 'Low', recommendations: ['Review manually'] };
  
  return safeGenerate(
    {
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }, 
    fallback, 
    true
  );
};

export const getPredictiveRiskForecast = async (assetId: string, context: string): Promise<PredictiveRiskForecast> => {
    const prompt = `
      Generate a predictive risk forecast for Asset ID: ${assetId} in context: ${context}.
      Output JSON matching PredictiveRiskForecast interface.
    `;
    
    // Robust Mock Fallback
    const fallback: PredictiveRiskForecast = {
        riskScore: 50,
        predictedIncidents: [],
        recommendedActions: [{ action: "Manual Inspection Required", priority: "HIGH", estimatedRiskReduction: "Unknown" }]
    };

    return safeGenerate(
        {
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }, 
        fallback, 
        true
    );
};

export const getARProcedures = async (assetType: string): Promise<ARProcedure[]> => {
    // In a real app, this might rely on a vector DB retrieval, currently simplified.
    // Using a static return for stability in AR module if API fails.
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
        }
    ];
};

export const calculateEmissionsAI = async (activityData: any): Promise<EmissionRecord> => {
    const prompt = `Calculate Scope 1/2/3 emissions for: ${JSON.stringify(activityData)}. Return JSON { calculatedCO2e: number, emissionFactor: number, unit: string }`;
    
    const fallbackResponse = { calculatedCO2e: 0, emissionFactor: 0, unit: 'kgCO2e/unit' };
    const result = await safeGenerate(
        {
            model: 'gemini-3-flash-preview',
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

export const simulateDigitalTwinScenario = async (scenario: string, facility: string): Promise<{
    impactZones: string[];
    evacuationRoutes: string[];
    estimatedResponseTime: string;
}> => {
    const prompt = `Simulate HSE scenario "${scenario}" for facility "${facility}". Return JSON { impactZones: string[], evacuationRoutes: string[], estimatedResponseTime: string }`;
    return safeGenerate(
        {
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        }, 
        { impactZones: [], evacuationRoutes: [], estimatedResponseTime: "Unknown" }, 
        true
    );
};

// --- Placeholder Exports for Module Compatibility ---
// These maintain contract with existing components while we iterate.

export const searchLocationWithMaps = async (query: string): Promise<any | null> => null; 
export const assessRisk = async (w: string, d: string, dur: number, f: string): Promise<AIRiskAssessment> => ({ riskScore: 50, riskLevel: 'Medium' as any, hazards: [], controls: [], requiredPPE: [] });
export const detectPPE = async (b: string) => [];
export const chatWithSafi = async (message: string, history: ChatMessage[], framework: string): Promise<string> => {
  const prompt = `
    You are "Safi" (Arabic for Clear/Pure), the AD6 HSE Enterprise AI Copilot.
    Your goal is to assist HSE professionals in the MENA region with safety, compliance (ADNOC, OSHAD), and risk management.
    
    Context:
    - Active Framework: ${framework}
    - User Message: "${message}"
    - Conversation History: ${JSON.stringify(history.slice(-5))}
    
    Guidelines:
    1. Be professional, precise, and safety-conscious.
    2. Support both English and Arabic. If the user speaks Arabic, respond in Arabic.
    3. For ADNOC/OSHAD queries, provide specific regulatory context if possible.
    4. If asked to report an incident or perform a task, guide the user through it.
    
    Response (Markdown):
  `;

  return safeGenerate(
    {
      model: 'gemini-3-flash-preview',
      contents: prompt,
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
      model: 'gemini-3-flash-preview',
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
    Return JSON matching the SIFPrecursor interface.
  `;

  const fallback: SIFPrecursor = {
    probability: 0.1,
    confidence: 0.5,
    precursors: ['Insufficient data for deep analysis'],
    recommendedInterventions: ['Conduct thorough investigation']
  };

  return safeGenerate(
    {
      model: 'gemini-3-pro-preview',
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
      model: 'gemini-3-flash-preview',
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
export const analyzeHSEImage = async (b: string, q: string) => [];
export const suggestItemPPE = async (q: string, s: string, h: string[]) => [];
export const predictEquipmentFailure = async (e: any): Promise<MaintenancePrediction> => ({ failureProbability: 0, predictedFailureDate: '', rootCauseSuspect: '', recommendedAction: '', maintenanceSchedule: '' });
export const analyzeComplianceRisks = async (p: any[], i: any[], c: any[], e: any[], r: string, f: string) => [];
export const analyzeSafetyObservation = async (d: string, t: string): Promise<AISafetyObservationAnalysis> => ({ category: 'General', sentiment: 'Neutral', priority: 'Low', tags: [], summary: '', suggestedAction: '' });
export const generateAuditChecklist = async (s: string, l: string) => [];
export const generateAuditReportSummary = async (s: string, f: any[]) => "";
export const suggestToolboxTopic = async (d: string, h: string[]) => ({ topic: '', summary: '', keyPoints: [] });
export const assessContractorRisk = async (n: string, h: string[], d: any[]) => ({ score: 0, riskLevel: '', findings: [] });
export const analyzeHealthTrends = async (m: any[], i: any[]) => ({ trendSummary: '', riskLevel: '', suggestedInterventions: [], trainingRecommendations: [] });
export const extractDocumentData = async (b: string) => ({});
export const generateDashboardInsights = async (m: any) => ({ trends: [], risks: [], strategy: [] });
export const fetchHseNews = async () => ({ text: "", sources: [] });
export const getRegulatoryFeed = async () => [];
export const analyzeRegulatoryImpact = async (r: any) => ({ mappings: [], risks: [] });
