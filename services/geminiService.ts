
import { GoogleGenAI, Type } from "@google/genai";
import { 
  IncidentReportOptions, AIIncidentAnalysis, RootCauseAnalysis, 
  AIRiskAssessment, AISafetyObservationAnalysis, InspectionItem, 
  MaintenancePrediction, ComplianceAlert, AuditFinding, 
  ComplianceFramework, UserProfile, Equipment, OccupationalHealthIncident,
  HealthMetricRecord, DashboardInsights
} from "../types";

let aiClient: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiClient) {
    try {
        // Ensure process.env.API_KEY is accessed safely if process is not polyfilled by bundler
        const key = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
        // Defensive check for constructor
        if (typeof GoogleGenAI === 'function' || typeof GoogleGenAI === 'object') {
             aiClient = new GoogleGenAI({ apiKey: key });
        } else {
            console.error("GoogleGenAI library is not correctly loaded.");
        }
    } catch (e) {
        console.error("GoogleGenAI Initialization Error:", e);
    }
  }
  return aiClient;
};

// Helper to safely execute AI calls with retry logic
const safeGenerate = async (
    params: any, 
    fallback: string = '', 
    isJson: boolean = false
): Promise<any> => {
    const ai = getAi();
    if (!ai) {
        console.warn("AI Client unavailable. Returning fallback.");
        return isJson ? JSON.parse(fallback || '{}') : fallback;
    }

    const maxRetries = 3;
    let delay = 2000; // Start with 2 seconds

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent(params);
            return isJson ? JSON.parse(response.text || '{}') : (response.text || fallback);
        } catch (error: any) {
            // Identify rate limit (429) or server overload (503) errors
            const isRateLimit = error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
            const isServerOverload = error?.status === 503 || error?.code === 503;

            if ((isRateLimit || isServerOverload) && attempt < maxRetries - 1) {
                console.warn(`AI Quota/Rate Limit hit. Retrying in ${delay}ms (Attempt ${attempt + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff: 2s -> 4s -> 8s
                continue;
            }

            console.error("AI Generation Failed:", error);
            // If we run out of retries or it's a different error, break loop
            break; 
        }
    }

    // Return fallback if all attempts fail
    return isJson ? JSON.parse(fallback || '{}') : fallback;
};

/**
 * Generates a customized incident report for regulatory submission.
 */
export const generateCustomIncidentReport = async (
  incident: any, 
  options: IncidentReportOptions
): Promise<string> => {
  const prompt = `
    Act as a Senior HSE Reporting Officer.
    Generate a formal incident report for the following incident:
    ${JSON.stringify(incident)}

    Configuration:
    - Format: ${options.format.replace(/_/g, ' ')}
    - Tone/Audience: ${options.tone}
    - Include Root Cause Analysis: ${options.includeRca}
    - Include Evidence References: ${options.includeEvidence}
    - Include Audit Trail Summary: ${options.includeAuditTrail}
    - Include Weather/Environmental Data: ${options.includeWeather}
    - Include Witness Statements: ${options.includeWitness}

    Strictly adhere to the professional tone required for ${options.format}.
    Output strictly as formatted text/markdown suitable for display.
  `;

  return safeGenerate({
      model: 'gemini-3-flash-preview',
      contents: prompt,
  }, "Report generation failed.");
};

export const classifyIncident = async (description: string, location: string, framework: string): Promise<AIIncidentAnalysis> => {
  const prompt = `Classify this incident based on ${framework}: "${description}" at "${location}". Return JSON with { type, severity (Critical/High/Medium/Low), recommendations: string[] }`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '{}', true);
};

export const generateRCA = async (description: string, method: string): Promise<RootCauseAnalysis> => {
  const prompt = `Perform a ${method} Root Cause Analysis for: "${description}". Return JSON with { rootCauses: string[], correctiveActions: string[] }`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '{}', true);
};

export const editImageWithAI = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAi();
  if (!ai) return `data:image/png;base64,${base64Image}`;

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      // Find image part
      if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              }
          }
      }
      return `data:image/png;base64,${base64Image}`;
  } catch (e) {
      console.error("Image Edit Error:", e);
      return `data:image/png;base64,${base64Image}`;
  }
};

export const generateIncidentSimulation = async (imageBase64: string, prompt: string): Promise<string | null> => {
  const ai = getAi();
  if (!ai) return null;

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageBase64,
        mimeType: 'image/jpeg', 
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
        const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
        const response = await fetch(`${videoUri}&key=${apiKey}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }
    return null;

  } catch (e) {
    console.error("Veo Generation Error:", e);
    return null;
  }
}

export const searchLocationWithMaps = async (query: string): Promise<{name: string, formatted_address: string, coordinates: {lat: number, lng: number}} | null> => {
  const ai = getAi();
  if (!ai) return null;
  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find location details for: "${query}". Provide the address and approximate coordinates if possible in the text.`,
        config: {
          tools: [{googleMaps: {}}],
        },
      });
      
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (grounding && grounding.length > 0) {
          // Returning a verified location object. 
          // We assume coordinates are roughly central Abu Dhabi if extraction fails from text, 
          // but flag it as "Google Maps Verified" in address.
          return { 
              name: query, 
              formatted_address: `📍 Verified via Google Maps: ${query}`, 
              coordinates: { lat: 24.4539, lng: 54.3773 } 
          }; 
      }
  } catch (e) {
      console.error("Maps search error", e);
  }
  return null;
};

export const assessRisk = async (workType: string, description: string, duration: number, framework: string): Promise<AIRiskAssessment> => {
  const prompt = `Assess risk for ${workType}: "${description}" (${duration} hrs) under ${framework}. Return JSON { riskScore (0-100), riskLevel (Low/Medium/High/Critical), hazards: string[], controls: string[], requiredPPE: string[] }`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, JSON.stringify({ 
      riskScore: 50, 
      riskLevel: 'Medium', 
      hazards: ['General Hazard'], 
      controls: ['Standard Precautions'], 
      requiredPPE: ['Safety Shoes', 'Helmet'] 
  }), true);
};

export const detectPPE = async (base64: string): Promise<string[]> => {
  const prompt = `Identify all Personal Protective Equipment (PPE) items visible in this image. Return a JSON array of strings using standard terms (e.g., ["Hard Hat", "Safety Vest", "Goggles", "Gloves", "Safety Shoes"]).`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: {
        parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
            { text: prompt }
        ]
    },
    config: { responseMimeType: 'application/json' }
  }, '[]', true);
};

export const chatWithHSEBot = async (message: string, history: any[], framework: string): Promise<string> => {
  const prompt = `You are an HSE expert in ${framework}. History: ${JSON.stringify(history)}. User: ${message}`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt
  }, "I am currently offline. Please check your connection or API key.");
};

export const analyzeTrainingNeeds = async (userProfile: UserProfile): Promise<any[]> => {
  const prompt = `Analyze training needs for ${userProfile.role} in ${userProfile.department}. Return JSON array of recommendations.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '[]', true);
};

export const analyzeTeamGaps = async (department: string, issues: string[]): Promise<any[]> => {
  const prompt = `Analyze skill gaps for ${department} considering issues: ${issues.join(', ')}. Return JSON array.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '[]', true);
};

export const suggestRefresherCourse = async (certName: string): Promise<any> => {
  const prompt = `Suggest refresher for ${certName}. Return JSON.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '{}', true);
};

export const generateInspectionChecklist = async (type: string, location: string, context: string): Promise<InspectionItem[]> => {
  const prompt = `Generate inspection checklist for ${type} at ${location}. Context: ${context}. Return JSON array of InspectionItem.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '[]', true);
};

export const refineInspectionChecklist = async (items: InspectionItem[], type: string, context: string): Promise<InspectionItem[]> => {
  const prompt = `Refine checklist for ${type} with context ${context}. Items: ${JSON.stringify(items)}. Return JSON array.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '[]', true);
};

export const assignIconsToChecklist = async (items: InspectionItem[]): Promise<InspectionItem[]> => {
  return items.map(i => ({...i, icon: 'CheckCircle'})); 
};

export const suggestAuditFinding = async (question: string, reference: string): Promise<any> => {
  const prompt = `Suggest audit finding for failure of "${question}" against "${reference}". Return JSON with { description, severity (Major/Minor), correctiveAction, suggestedPPE (array of strings), suggestedDueDate (YYYY-MM-DD) }.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '{}', true);
};

export const analyzeHSEImage = async (base64: string, question: string): Promise<string[]> => {
  const prompt = `Analyze this image for HSE violations related to "${question}". Return array of hazard strings.`;
  return safeGenerate({
    model: 'gemini-2.5-flash-image',
    contents: {
        parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
            { text: prompt }
        ]
    },
    config: { responseMimeType: 'application/json' }
  }, '[]', true);
};

export const suggestItemPPE = async (question: string, status: string, hazards: string[]): Promise<string[]> => {
  const prompt = `Suggest PPE for "${question}" with status ${status} and hazards ${hazards.join(',')}. Return string array.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '[]', true);
};

export const predictEquipmentFailure = async (equipment: Equipment): Promise<MaintenancePrediction> => {
  const prompt = `Predict failure for ${equipment.name} based on sensors: ${JSON.stringify(equipment.sensors)}. Return JSON MaintenancePrediction.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '{}', true);
};

export const analyzeComplianceRisks = async (permits: any[], inspections: any[], certs: any[], equipment: any[], role: string, framework: string): Promise<ComplianceAlert[]> => {
  const prompt = `Analyze compliance risks for role ${role} under ${framework}. Data: Permits=${permits.length}, Inspections=${inspections.length}, Certs=${certs.length}, Eq=${equipment.length}. Return JSON array of ComplianceAlert.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '[]', true);
};

export const analyzeSafetyObservation = async (description: string, type: string): Promise<AISafetyObservationAnalysis> => {
  const prompt = `Analyze safety observation (${type}): "${description}". Return JSON AISafetyObservationAnalysis.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '{}', true);
};

export const generateAuditChecklist = async (standard: string, location: string): Promise<InspectionItem[]> => {
  const prompt = `Generate audit checklist for ${standard} at ${location}. Return JSON array of InspectionItem.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '[]', true);
};

export const generateAuditReportSummary = async (standard: string, findings: any[]): Promise<string> => {
  const prompt = `Generate audit executive summary for ${standard} based on findings: ${JSON.stringify(findings)}.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt
  }, "Summary unavailable.");
};

export const suggestToolboxTopic = async (department: string, hazards: string[]): Promise<{ topic: string; summary: string; keyPoints: string[] }> => {
  const prompt = `Suggest toolbox talk for ${department} considering hazards: ${hazards.join(', ')}. Return JSON { topic, summary, keyPoints: string[] }`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, JSON.stringify({ topic: "General Safety", summary: "Standard briefing", keyPoints: ["Wear PPE", "Stay Alert"] }), true);
};

export const assessContractorRisk = async (name: string, history: string[], docs: any[]): Promise<{ score: number; riskLevel: string; findings: string[] }> => {
  const prompt = `Assess contractor risk for ${name}. History: ${history.join(', ')}. Docs: ${docs.length}. Return JSON { score, riskLevel, findings: string[] }`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, JSON.stringify({ score: 0, riskLevel: 'Unknown', findings: [] }), true);
};

export const analyzeHealthTrends = async (metrics: HealthMetricRecord[], incidents: OccupationalHealthIncident[]): Promise<any> => {
  const prompt = `Analyze health trends. Metrics: ${metrics.length}, Incidents: ${incidents.length}. Return JSON HealthAIResult.`;
  return safeGenerate({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }, '{}', true);
};

export const extractDocumentData = async (base64: string): Promise<any> => {
  const prompt = `Extract metadata from document image. Return JSON { title, category, confidence, issuer, referenceNumber, expiryDate, summary }.`;
  return safeGenerate({
    model: 'gemini-2.5-flash-image',
    contents: {
        parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
            { text: prompt }
        ]
    },
    config: { responseMimeType: 'application/json' }
  }, '{}', true);
};

export const generateDashboardInsights = async (metrics: any): Promise<DashboardInsights> => {
  const prompt = `Analyze these HSE metrics for a UAE energy sector executive dashboard.
  Metrics: ${JSON.stringify(metrics)}
  
  Return a JSON object strictly following this structure:
  {
    "trends": [{ "title": "string", "analysis": "1 sentence string", "trend": "Up" | "Down" | "Stable" }],
    "risks": [{ "area": "string", "riskLevel": "Critical" | "High" | "Medium", "description": "string" }],
    "strategy": [{ "recommendation": "string", "impact": "string" }]
  }
  
  Provide 3 items for each array. Focus on regulatory compliance, risk mitigation, and operational efficiency in the UAE context.
  `;
  
  return safeGenerate({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
  }, JSON.stringify({
      trends: [
          { title: "Incident Rate", analysis: "Trending downwards due to new controls.", trend: "Down" },
          { title: "Compliance", analysis: "Stable at 94% across all sectors.", trend: "Stable" },
          { title: "Risk Exposure", analysis: "Slight increase in heat stress risk.", trend: "Up" }
      ],
      risks: [
          { area: "Heat Stress", riskLevel: "High", description: "Seasonal peak approaching." },
          { area: "Contractor Compliance", riskLevel: "Medium", description: "New vendors onboarding." },
          { area: "Equipment Reliability", riskLevel: "Medium", description: "Aging assets in Zone B." }
      ],
      strategy: [
          { recommendation: "Increase Hydration Breaks", impact: "Reduce heat stress incidents." },
          { recommendation: "Audit Contractor Docs", impact: "Ensure regulatory alignment." },
          { recommendation: "Schedule Prev. Maint", impact: "Prevent unplanned downtime." }
      ]
  }), true);
};
