import { GoogleGenAI } from '@google/genai';
import { RAGDataPipeline, RegulatoryDocument } from './ragDataPipeline';
import { ArabicNLPUtils } from './arabicNLPUtils';

export interface RAGResponse {
  text: string;
  sources: RegulatoryDocument[];
  confidence: number;
  language: 'en' | 'ar';
}

export class RAGOrchestrator {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateResponse(query: string, preferredLang?: 'en' | 'ar'): Promise<RAGResponse> {
    try {
      const isArabic = ArabicNLPUtils.isArabicText(query);
      const targetLang = preferredLang || (isArabic ? 'ar' : 'en');
      
      const normalizedQuery = targetLang === 'ar' ? ArabicNLPUtils.normalizeArabic(query) : query;

      // 1. Retrieve Knowledge
      const sources = await RAGDataPipeline.searchDomainKnowledge(normalizedQuery, targetLang);
      
      if (!sources || sources.length === 0) {
        return {
          text: targetLang === 'ar' 
             ? "عذراً، لا أستطيع العثور على معلومات تنظيمية متعلقة بهذا السؤال. يرجى الرجوع إلى اللائحة الرسمية." 
             : "I could not find specific regulatory information regarding this query. Please consult official regulations.",
          sources: [],
          confidence: 0,
          language: targetLang
        };
      }

      // 2. Build Context
      const contextStr = sources.map(s => `[${s.jurisdiction} Article ${s.articleNumber}]: ${s.contentEng}`).join('\n');
      
      // 3. Generate Answer 
      // Note: System Prompt ensures citation framing
      const prompt = `
You are an Enterprise HSE AI Compliance Assistant for Middle East procurement.
Your task is to answer the user's question using ONLY the provided regulatory context.
If asked to generate a document (like a CAPA plan), structure it formally.
You must cite the exact Article Number and Jurisdiction from the context.
If the context does not fully answer the question, add a disclaimer: "*Consult official regulation for full compliance.*"

CONTEXT:
${contextStr}

USER QUERY:
${query}

RESPOND IN: ${targetLang === 'ar' ? 'Arabic Language' : 'English Language'}
`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.2 }
      });

      const responseText = response.text || "An error occurred during generation.";
      
      // 4. Calculate Mock Confidence based on source match
      const confidence = sources.length > 0 ? 0.92 : 0.4;
      
      // 5. Guardrails
      let finalText = responseText;
      if (confidence < 0.85) {
         finalText += targetLang === 'ar' 
            ? "\n\n⚠️ **تنبيه:** يرجى تصعيد هذا الاستفسار إلى مدير الصحة والسلامة للحصول على تأكيد نهائي." 
            : "\n\n⚠️ **WARNING:** Confidence is below 85%. Please escalate to human HSE Manager for final confirmation.";
      }

      // 6. Audit
      RAGDataPipeline.logQueryAudit(query, finalText, sources.map(s => s.articleNumber));

      return {
        text: finalText,
        sources,
        confidence,
        language: targetLang
      };
    } catch (e: any) {
      console.error("[RAG Error]", e);
      return {
        text: "System encountered an error communicating with AI models. Please try again.",
        sources: [],
        confidence: 0,
        language: 'en'
      };
    }
  }
}
