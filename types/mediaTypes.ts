/**
 * AD6 HSE Enterprise AI Platform — Media & AI Evidence Types
 * Supports multi-photo field evidence, voice narration, and Gemini multimodal hazard triage
 */

export interface AIHazardItem {
  name: string;
  category: string;
  location_in_image: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  likelihood: 'Low' | 'Medium' | 'High';
  confidence: number;
  accepted?: boolean; // Human-in-the-loop review state
  rejected?: boolean;
}

export interface AIHseContext {
  activity_or_operation: string;
  ppe_observed: string[];
  ppe_missing: string[];
  equipment: string[];
  housekeeping_issues: string[];
  environmental_issues: string[];
}

export interface AIRecommendedAction {
  action: string;
  priority: 'Immediate' | 'High' | 'Medium' | 'Low' | string;
  type: 'Immediate' | 'Corrective' | 'Preventive';
}

export interface AIHazardAnalysisResult {
  hazards: AIHazardItem[];
  hse_context: AIHseContext;
  guideline_description: string;
  recommended_actions: AIRecommendedAction[];
  suggested_record_type: 'Observation' | 'NCR' | 'Incident' | 'Near Miss';
  analyzedAt?: string;
  modelUsed?: string;
  uncertaintyNotice?: string;
}

export interface PhotoEvidence {
  id: string;
  url: string; // Base64 JPEG (max ~1600px, 0.8 quality)
  thumbnailUrl?: string;
  timestamp: string;
  uploader?: string;
  gps?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  caption?: string;
  voiceNote?: string; // Voice transcript attached to this photo
  audioBlobUrl?: string;
  aiAnalysis?: AIHazardAnalysisResult;
  linkage?: {
    parentType: 'Inspection' | 'Observation' | 'NCR' | 'Incident' | 'CAPA' | 'Audit';
    parentId: string;
  };
}

export interface VoiceNarrationData {
  transcript: string;
  language: 'en-US' | 'ar-OM' | 'ar-AE';
  timestamp: string;
  audioBase64?: string;
  durationSeconds?: number;
}
