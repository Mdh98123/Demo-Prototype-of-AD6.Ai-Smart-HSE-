/**
 * Web Speech API Hook for Mobile Inspection Checklist Fields
 * Provides hands-free voice command parsing and continuous text dictation
 * in both Arabic (ar-OM, ar-AE) and English (en-US).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArabicNLPUtils } from '../services/arabicNLPUtils';

export type VoiceLanguage = 'en-US' | 'ar-OM' | 'ar-AE';

export type VoiceAction = 
  | 'NAVIGATE_NEXT'
  | 'NAVIGATE_PREV'
  | 'CLEAR_TEXT'
  | 'SET_PASS'
  | 'SET_FAIL'
  | 'SET_NA'
  | 'TOGGLE_URGENT'
  | 'DICTATE_TEXT';

export interface ParsedVoiceIntent {
  action: VoiceAction;
  text?: string;
  matchedTrigger?: string;
  isCommand: boolean;
  rawTranscript: string;
}

export interface VoiceCommandFeedback {
  action: VoiceAction;
  label: string;
  timestamp: number;
}

/**
 * Pure parsing function to analyze transcripts in Arabic and English
 * and classify them into navigation/value voice commands or freeform dictation.
 */
export function parseChecklistVoiceIntent(
  rawTranscript: string, 
  lang: VoiceLanguage = 'en-US'
): ParsedVoiceIntent {
  const clean = rawTranscript.trim();
  if (!clean) {
    return { action: 'DICTATE_TEXT', text: '', isCommand: false, rawTranscript };
  }

  const lower = clean.toLowerCase();
  const isArabic = ArabicNLPUtils.isArabicText(clean) || lang.startsWith('ar');
  const normalized = isArabic ? ArabicNLPUtils.normalizeArabic(clean).trim() : lower;

  // 1. Navigation: Next Step
  // English: "next", "next step", "next question", "continue", "forward", "go next"
  // Arabic: "التالي", "تالي", "الخطوه التاليه", "تابع", "تقدم", "بعده", "سير"
  const nextTriggersEn = ['next', 'next step', 'next question', 'continue', 'forward', 'go next', 'advance'];
  const nextTriggersAr = ['التالي', 'تالي', 'الخطوه التاليه', 'تابع', 'تقدم', 'بعده', 'سير'];
  
  if (
    nextTriggersEn.includes(lower) || 
    nextTriggersAr.some(t => normalized === t || normalized === ArabicNLPUtils.normalizeArabic(t))
  ) {
    return { action: 'NAVIGATE_NEXT', isCommand: true, matchedTrigger: clean, rawTranscript };
  }

  // 2. Navigation: Previous Step
  // English: "back", "previous", "previous step", "go back", "return"
  // Arabic: "السابق", "سابق", "الخطوه السابقه", "ارجع", "رجوع", "قبل"
  const prevTriggersEn = ['back', 'previous', 'previous step', 'go back', 'return', 'step back'];
  const prevTriggersAr = ['السابق', 'سابق', 'الخطوه السابقه', 'ارجع', 'رجوع', 'قبل'];

  if (
    prevTriggersEn.includes(lower) || 
    prevTriggersAr.some(t => normalized === t || normalized === ArabicNLPUtils.normalizeArabic(t))
  ) {
    return { action: 'NAVIGATE_PREV', isCommand: true, matchedTrigger: clean, rawTranscript };
  }

  // 3. Clear Text Command
  // English: "clear", "clear text", "delete", "erase", "reset"
  // Arabic: "امسح", "مسح", "احذف", "حذف", "اعاده ضبط", "مسح النص"
  const clearTriggersEn = ['clear', 'clear text', 'delete', 'erase', 'reset', 'clear all'];
  const clearTriggersAr = ['امسح', 'مسح', 'احذف', 'حذف', 'اعاده ضبط', 'مسح النص'];

  if (
    clearTriggersEn.includes(lower) || 
    clearTriggersAr.some(t => normalized === t || normalized === ArabicNLPUtils.normalizeArabic(t))
  ) {
    return { action: 'CLEAR_TEXT', isCommand: true, matchedTrigger: clean, rawTranscript };
  }

  // 4. Boolean: Pass / Compliant
  // English: "pass", "compliant", "ok", "approved", "mark pass"
  // Arabic: "مطابق", "ناجح", "موافق", "سليم", "تمام", "اجتياز", "معتمد"
  const passTriggersEn = ['pass', 'compliant', 'approved', 'mark pass', 'compliant pass'];
  const passTriggersAr = ['مطابق', 'ناجح', 'موافق', 'سليم', 'تمام', 'اجتياز', 'معتمد'];

  if (
    passTriggersEn.includes(lower) || 
    passTriggersAr.some(t => normalized === t || normalized === ArabicNLPUtils.normalizeArabic(t))
  ) {
    return { action: 'SET_PASS', isCommand: true, matchedTrigger: clean, rawTranscript };
  }

  // 5. Boolean: Fail / Deficient
  // English: "fail", "deficient", "non-compliant", "non compliant", "defect", "rejected", "mark fail"
  // Arabic: "غير مطابق", "راسب", "مرفوض", "عيب", "خلل", "فاشل"
  const failTriggersEn = ['fail', 'deficient', 'non-compliant', 'non compliant', 'defect', 'rejected', 'mark fail'];
  const failTriggersAr = ['غير مطابق', 'راسب', 'مرفوض', 'عيب', 'خلل', 'فاشل'];

  if (
    failTriggersEn.includes(lower) || 
    failTriggersAr.some(t => normalized === t || normalized === ArabicNLPUtils.normalizeArabic(t))
  ) {
    return { action: 'SET_FAIL', isCommand: true, matchedTrigger: clean, rawTranscript };
  }

  // 6. Boolean: NA
  // English: "na", "n/a", "not applicable", "skip"
  // Arabic: "غير منطبق", "لا ينطبق", "تخطي"
  const naTriggersEn = ['na', 'n/a', 'not applicable', 'skip'];
  const naTriggersAr = ['غير منطبق', 'لا ينطبق', 'تخطي'];

  if (
    naTriggersEn.includes(lower) || 
    naTriggersAr.some(t => normalized === t || normalized === ArabicNLPUtils.normalizeArabic(t))
  ) {
    return { action: 'SET_NA', isCommand: true, matchedTrigger: clean, rawTranscript };
  }

  // 7. Toggle Urgent Sync Priority
  // English: "urgent", "priority", "mark urgent", "emergency"
  // Arabic: "عاجل", "طارئ", "اولويه", "اولويه قصوي"
  const urgentTriggersEn = ['urgent', 'priority', 'mark urgent', 'emergency'];
  const urgentTriggersAr = ['عاجل', 'طارئ', 'اولويه', 'اولويه قصوي'];

  if (
    urgentTriggersEn.includes(lower) || 
    urgentTriggersAr.some(t => normalized === t || normalized === ArabicNLPUtils.normalizeArabic(t))
  ) {
    return { action: 'TOGGLE_URGENT', isCommand: true, matchedTrigger: clean, rawTranscript };
  }

  // 8. Explicit Dictation Prefixes (e.g. "Note: ...", "ملاحظة: ...")
  const notePrefixesEn = ['note:', 'note', 'observation:', 'observation', 'remark:', 'remark', 'write:'];
  for (const prefix of notePrefixesEn) {
    if (lower.startsWith(prefix + ' ')) {
      const stripped = clean.slice(prefix.length).trim();
      return { action: 'DICTATE_TEXT', text: stripped, isCommand: true, matchedTrigger: prefix, rawTranscript };
    }
  }

  const notePrefixesAr = ['ملاحظة:', 'ملاحظة', 'ملاحظه:', 'ملاحظه', 'سجل:', 'سجل', 'اكتب:'];
  for (const prefix of notePrefixesAr) {
    if (clean.startsWith(prefix + ' ')) {
      const stripped = clean.slice(prefix.length).trim();
      return { action: 'DICTATE_TEXT', text: stripped, isCommand: true, matchedTrigger: prefix, rawTranscript };
    }
  }

  // 9. Standard Text Dictation (populated directly into the checklist text answer)
  return {
    action: 'DICTATE_TEXT',
    text: clean,
    isCommand: false,
    rawTranscript
  };
}

interface UseChecklistSpeechProps {
  initialLanguage?: VoiceLanguage;
  onPopulateText: (text: string, mode?: 'append' | 'replace') => void;
  onClearText?: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  onSetBooleanAnswer?: (val: 'PASS' | 'FAIL' | 'NA') => void;
  onToggleUrgent?: () => void;
}

export function useChecklistSpeechRecognition({
  initialLanguage = 'en-US',
  onPopulateText,
  onClearText,
  onNavigateNext,
  onNavigatePrev,
  onSetBooleanAnswer,
  onToggleUrgent
}: UseChecklistSpeechProps) {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<VoiceLanguage>(initialLanguage);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [commandFeedback, setCommandFeedback] = useState<VoiceCommandFeedback | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const feedbackTimeoutRef = useRef<any>(null);

  // Check if browser Web Speech API is present
  const isSupported = typeof window !== 'undefined' && 
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Display command execution toast/pill for 3 seconds
  const triggerCommandFeedback = useCallback((action: VoiceAction, label: string) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setCommandFeedback({ action, label, timestamp: Date.now() });
    feedbackTimeoutRef.current = setTimeout(() => {
      setCommandFeedback(null);
    }, 3200);
  }, []);

  const handleParsedIntent = useCallback((intent: ParsedVoiceIntent) => {
    switch (intent.action) {
      case 'NAVIGATE_NEXT':
        if (onNavigateNext) {
          triggerCommandFeedback('NAVIGATE_NEXT', language.startsWith('ar') ? 'تم الانتقال: الخطوة التالية' : 'Voice Command: Next Step');
          onNavigateNext();
        }
        break;

      case 'NAVIGATE_PREV':
        if (onNavigatePrev) {
          triggerCommandFeedback('NAVIGATE_PREV', language.startsWith('ar') ? 'تم الرجوع: الخطوة السابقة' : 'Voice Command: Previous Step');
          onNavigatePrev();
        }
        break;

      case 'CLEAR_TEXT':
        if (onClearText) {
          triggerCommandFeedback('CLEAR_TEXT', language.startsWith('ar') ? 'تم مسح حقل الملاحظات' : 'Voice Command: Field Cleared');
          onClearText();
        }
        break;

      case 'SET_PASS':
        if (onSetBooleanAnswer) {
          triggerCommandFeedback('SET_PASS', language.startsWith('ar') ? 'تم التحديد: مطابق (Pass)' : 'Voice Command: Compliant (Pass)');
          onSetBooleanAnswer('PASS');
        }
        break;

      case 'SET_FAIL':
        if (onSetBooleanAnswer) {
          triggerCommandFeedback('SET_FAIL', language.startsWith('ar') ? 'تم التحديد: غير مطابق (Fail)' : 'Voice Command: Deficient (Fail)');
          onSetBooleanAnswer('FAIL');
        }
        break;

      case 'SET_NA':
        if (onSetBooleanAnswer) {
          triggerCommandFeedback('SET_NA', language.startsWith('ar') ? 'تم التحديد: لا ينطبق (N/A)' : 'Voice Command: Not Applicable (N/A)');
          onSetBooleanAnswer('NA');
        }
        break;

      case 'TOGGLE_URGENT':
        if (onToggleUrgent) {
          triggerCommandFeedback('TOGGLE_URGENT', language.startsWith('ar') ? 'تم تفعيل أولوية المزامنة العاجلة' : 'Voice Command: Urgent Sync Toggled');
          onToggleUrgent();
        }
        break;

      case 'DICTATE_TEXT':
      default:
        if (intent.text) {
          onPopulateText(intent.text, 'append');
        }
        break;
    }
  }, [language, onClearText, onNavigateNext, onNavigatePrev, onPopulateText, onSetBooleanAnswer, onToggleUrgent, triggerCommandFeedback]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback((targetLang?: VoiceLanguage) => {
    const activeLang = targetLang || language;
    setErrorMessage(null);
    setInterimTranscript('');

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setErrorMessage(
        activeLang.startsWith('ar')
          ? 'واجهة التعرف على الصوت Web Speech API غير مدعومة في هذا المتصفح.'
          : 'Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = activeLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += chunk;
          } else {
            interimStr += chunk;
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
        }

        if (finalStr) {
          setInterimTranscript('');
          const parsed = parseChecklistVoiceIntent(finalStr, activeLang);
          handleParsedIntent(parsed);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[Checklist Speech API Error]', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            activeLang.startsWith('ar')
              ? 'تم حظر الميكروفون. يرجى تفعيل إذن الميكروفون في إعدادات المتصفح.'
              : 'Microphone access was denied. Please allow microphone permissions in browser.'
          );
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Normal timeout when silent, continuous mode can stay or auto-restart
        } else {
          setErrorMessage(
            activeLang.startsWith('ar')
              ? `تنبيه الصوت: ${event.error}`
              : `Speech warning: ${event.error}`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('[Checklist Speech Start Error]', err);
      setErrorMessage(err.message || 'Failed to start speech recognition.');
      setIsListening(false);
    }
  }, [handleParsedIntent, language]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Switch voice language
  const changeLanguage = useCallback((newLang: VoiceLanguage) => {
    setLanguage(newLang);
    if (isListening) {
      stopListening();
      setTimeout(() => {
        startListening(newLang);
      }, 150);
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    language,
    interimTranscript,
    commandFeedback,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    setLanguage: changeLanguage
  };
}
