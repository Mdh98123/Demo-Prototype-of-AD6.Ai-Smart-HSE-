import React, { useState } from 'react';
import { 
  Mic, MicOff, Globe, Sparkles, Volume2, CheckCircle2, 
  AlertCircle, HelpCircle, ChevronDown, ChevronUp, Trash2, ArrowRight
} from 'lucide-react';
import { VoiceLanguage, VoiceCommandFeedback } from '../../hooks/useChecklistSpeechRecognition';

interface ChecklistVoiceControllerProps {
  isListening: boolean;
  language: VoiceLanguage;
  interimTranscript: string;
  commandFeedback: VoiceCommandFeedback | null;
  errorMessage: string | null;
  isSupported: boolean;
  onToggleListening: () => void;
  onChangeLanguage: (lang: VoiceLanguage) => void;
  targetFieldLabel?: string;
  className?: string;
}

export const ChecklistVoiceController: React.FC<ChecklistVoiceControllerProps> = ({
  isListening,
  language,
  interimTranscript,
  commandFeedback,
  errorMessage,
  isSupported,
  onToggleListening,
  onChangeLanguage,
  targetFieldLabel = 'Field Observations & Remarks',
  className = ''
}) => {
  const [showCommandsGuide, setShowCommandsGuide] = useState(false);
  const isArabic = language.startsWith('ar');

  if (!isSupported) {
    return (
      <div className={`p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2 ${className}`}>
        <AlertCircle size={15} className="text-amber-600 shrink-0" />
        <span>Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari for voice commands.</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Main Voice Control Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-lg flex flex-col gap-2.5 text-white">
        
        {/* Top Header Row: Status, Language Switcher, Guide Toggle */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
              {isListening ? (
                <span className="text-red-400 flex items-center gap-1.5">
                  <span className="inline-block animate-pulse">●</span>
                  {isArabic ? 'جاري الاستماع باللغة العربية...' : 'Listening in English...'}
                </span>
              ) : (
                <span>Web Speech API Controller</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Arabic vs English Language Toggle Pill */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-0.5 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onChangeLanguage('en-US')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  language === 'en-US'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch voice recognition to English (en-US)"
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeLanguage('ar-OM')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  isArabic
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch voice recognition to Arabic (ar-OM)"
              >
                <span>🇴🇲</span>
                <span>العربية</span>
              </button>
            </div>

            {/* Quick Voice Commands Guide Toggle */}
            <button
              type="button"
              onClick={() => setShowCommandsGuide(prev => !prev)}
              className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Show voice commands cheat sheet"
            >
              {showCommandsGuide ? <ChevronUp size={14} /> : <HelpCircle size={14} />}
            </button>
          </div>
        </div>

        {/* Center Row: Action Mic Button & Real-time Visualizer */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleListening}
            className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
              isListening
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-red-600/30 ring-2 ring-red-400/50'
                : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={16} className="animate-pulse" />
                <span>{isArabic ? 'إيقاف الاستماع (Tap to Stop)' : 'Stop Voice Dictation'}</span>
              </>
            ) : (
              <>
                <Mic size={16} />
                <span>{isArabic ? 'بدء الإملاء الصوتي (Tap to Speak)' : 'Start Voice Dictation & Commands'}</span>
              </>
            )}
          </button>
        </div>

        {/* Live Interim Transcript Bubble */}
        {interimTranscript && (
          <div className="bg-slate-950/90 border border-indigo-500/40 rounded-xl px-3 py-2 flex items-center gap-2 animate-fade-in">
            <Volume2 size={13} className="text-indigo-400 shrink-0 animate-bounce" />
            <p className="text-xs text-indigo-200 italic font-medium truncate">
              "{interimTranscript}..."
            </p>
          </div>
        )}

        {/* Voice Command Execution Feedback Banner */}
        {commandFeedback && (
          <div className="bg-emerald-950/90 border border-emerald-500/50 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-emerald-200 text-xs font-bold animate-fade-in shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{commandFeedback.label}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
        )}

        {/* Microphone Error Notification */}
        {errorMessage && (
          <div className="bg-red-950/90 border border-red-500/50 rounded-xl px-3 py-2 flex items-center gap-2 text-red-200 text-xs font-medium">
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Expandable Voice Commands Cheat Sheet */}
        {showCommandsGuide && (
          <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px] animate-fade-in">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span>Supported Voice Commands:</span>
              <span className="text-[10px] font-mono text-indigo-400">Arabic & English</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Populate Text Observation:</span>
                <span className="text-slate-200 font-medium">Speak freely or say:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[10px]">"Note: [observation]"</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[10px]">"ملاحظة: [الملاحظة]"</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Clear / Erase Text Field:</span>
                <span className="text-slate-200 font-medium">Say:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[10px]">"Clear" / "Delete"</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[10px]">"امسح" / "مسح"</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Step Navigation:</span>
                <span className="text-slate-200 font-medium">Say:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[10px]">"Next" / "Back"</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[10px]">"التالي" / "السابق"</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Boolean Questions:</span>
                <span className="text-slate-200 font-medium">Say:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[10px]">"Pass" / "Fail"</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[10px]">"مطابق" / "غير مطابق"</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChecklistVoiceController;
