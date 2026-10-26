/**
 * Client-Side Service for Enterprise Gemini AI Capabilities
 * Connects exclusively to server-side endpoints (/api/gemini/*)
 * Adheres strictly to security guidelines: No API keys exposed to browser bundle.
 */

export interface ChatMessagePayload {
  id?: string;
  role: 'user' | 'model' | 'assistant';
  text: string;
  image?: string;
  timestamp?: string | Date;
}

export type GeminiRoleType = 
  | 'hse_advisor' 
  | 'rca_expert' 
  | 'process_safety' 
  | 'site_supervisor' 
  | 'executive_analyst';

export type GeminiModelType = 
  | 'gemini-3.1-pro-preview' 
  | 'gemini-3.5-flash' 
  | 'gemini-3.1-flash-lite';

export interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
}

export interface MapPlace {
  title: string;
  uri: string;
  snippet?: string;
}

export interface ChatResponse {
  text: string;
  model: string;
  role: string;
  grounding?: {
    usedSearch: boolean;
    usedMaps: boolean;
    searchCitations: GroundingSource[];
    mapPlaces: MapPlace[];
    webSearchQueries?: string[];
  };
  timestamp: string;
  error?: string;
}

export interface TranscribeResponse {
  success: boolean;
  text: string;
  model: string;
  timestamp?: string;
  error?: string;
}

export interface MapsGroundingResponse {
  text: string;
  model: string;
  places: MapPlace[];
  error?: string;
}

export interface SearchGroundingResponse {
  text: string;
  model: string;
  sources: GroundingSource[];
  webSearchQueries?: string[];
  error?: string;
}

export class GeminiClientService {
  /**
   * Multi-turn chat with role-based system instruction, model selection, and optional grounding
   */
  static async sendChatMessage(params: {
    messages: ChatMessagePayload[];
    role?: GeminiRoleType;
    model?: GeminiModelType;
    useSearchGrounding?: boolean;
    useMapsGrounding?: boolean;
    userLatLng?: { latitude: number; longitude: number };
    regionalMode?: 'OMAN' | 'OMAN' | 'COMBINED';
  }): Promise<ChatResponse> {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    return await res.json();
  }

  /**
   * Transcribe recorded audio with gemini-3.5-transcribe
   */
  static async transcribeAudio(
    audioBlob: Blob, 
    customPrompt?: string
  ): Promise<TranscribeResponse> {
    const base64Audio = await this.blobToBase64(audioBlob);
    const mimeType = audioBlob.type || 'audio/webm';

    const res = await fetch('/api/gemini/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64Audio,
        mimeType,
        prompt: customPrompt,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Audio transcription failed with status ${res.status}`);
    }

    return await res.json();
  }

  /**
   * Query Maps Grounding using gemini-3.5-flash with googleMaps tool
   */
  static async queryMapsGrounding(params: {
    prompt: string;
    userLatLng?: { latitude: number; longitude: number };
    facilityContext?: string;
  }): Promise<MapsGroundingResponse> {
    const res = await fetch('/api/gemini/maps-grounding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Maps grounding failed with status ${res.status}`);
    }

    return await res.json();
  }

  /**
   * Query Google Search Grounding using gemini-3.5-flash with googleSearch tool
   */
  static async querySearchGrounding(params: {
    query: string;
    jurisdiction?: string;
  }): Promise<SearchGroundingResponse> {
    const res = await fetch('/api/gemini/search-grounding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Search grounding failed with status ${res.status}`);
    }

    return await res.json();
  }

  /**
   * Helper: Convert Blob to base64 string
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
