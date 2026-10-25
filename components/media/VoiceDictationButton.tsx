import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, Globe, AlertCircle, Volume2, Check } from 'lucide-react';

interface VoiceDictationButtonProps {
  onTranscript: (text: string, isAppend?: boolean) => void;
  value?: string;
  mode?: 'append' | 'replace';
  onAudioCaptured?: (audioBase64: string, mimeType: string) => void;
  initialLanguage?: 'en-US' | 'ar-OM' | 'ar-AE';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  buttonLabel?: string;
  showLanguageToggle?: boolean;
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onTranscript,
  value,
  mode = 'replace',
  onAudioCaptured,
  initialLanguage = 'en-US',
  className = '',
  size = 'md',
  buttonLabel,
  showLanguageToggle = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingFallback, setIsProcessingFallback] = useState(false);
  const [language, setLanguage] = useState<'en-US' | 'ar-OM' | 'ar-AE'>(initialLanguage);
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Check Web Speech API support
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && 
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const emitTranscript = useCallback((textChunk: string) => {
    const trimmed = textChunk.trim();
    if (!trimmed) return;
    if (mode === 'append' && value) {
      onTranscript(`${value.trim()} ${trimmed}`, true);
    } else {
      onTranscript(trimmed, mode === 'append');
    }
  }, [mode, onTranscript, value]);

  // MediaRecorder Fallback -> Gemini /api/gemini/transcribe
  const startMediaRecorderFallback = useCallback(async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsProcessingFallback(true);
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            if (onAudioCaptured) {
              onAudioCaptured(base64Audio, 'audio/webm');
            }

            // Call server proxy
            try {
              const res = await fetch('/api/gemini/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audio: base64Audio,
                  mimeType: 'audio/webm',
                  prompt: language.startsWith('ar')
                    ? 'Transcribe this Arabic speech with high precision for field HSE inspection notes in Oman.'
                    : 'Transcribe this English speech with high precision for industrial HSE safety notes.'
                })
              });

              const result = await res.json();
              if (result.success && result.text) {
                emitTranscript(result.text);
              } else {
                setErrorMessage('Audio transcribed with low confidence. Please type directly.');
              }
            } catch (err) {
              console.warn('[Gemini Transcribe Fallback Error]', err);
              setErrorMessage('Cloud transcription unavailable. Please enter note manually.');
            } finally {
              setIsProcessingFallback(false);
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (err) {
          console.error('[Recorder OnStop Error]', err);
          setIsProcessingFallback(false);
        } finally {
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(t => t.stop());
            audioStreamRef.current = null;
          }
        }
      };

      recorder.start();
      setIsListening(true);
    } catch (err: any) {
      console.warn('[Mic Permission / MediaRecorder Error]', err);
      let msg = 'Microphone permission was denied or not supported.';
      if (err.name === 'NotAllowedError') {
        msg = 'Microphone access blocked. Please allow microphone access in your browser.';
      }
      setErrorMessage(msg);
      setIsListening(false);
    }
  }, [emitTranscript, language, onAudioCaptured]);

  // Start Native Web Speech API
  const startSpeechRecognition = useCallback(() => {
    setErrorMessage(null);
    setInterimText('');

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'ar-OM' ? 'ar-OM' : language === 'ar-AE' ? 'ar-AE' : 'en-US';

    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += transcriptPart;
        } else {
          interimStr += transcriptPart;
        }
      }

      if (interimStr) {
        setInterimText(interimStr);
      }

      if (finalStr) {
        emitTranscript(finalStr);
        setInterimText('');
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[SpeechRecognition Error]', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Please check site permissions.');
        setIsListening(false);
      } else if (event.error === 'network') {
        // Fall back to MediaRecorder + Gemini
        recognition.stop();
        startMediaRecorderFallback();
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn('[Speech Start Failed, falling back to MediaRecorder]', err);
      startMediaRecorderFallback();
    }
  }, [language, onTranscript, startMediaRecorderFallback]);

  // Toggle listening
  const handleToggle = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (isSpeechRecognitionSupported) {
        startSpeechRecognition();
      } else {
        startMediaRecorderFallback();
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en-US' ? 'ar-OM' : 'en-US');
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'px-2.5 py-1.5 text-xs',
    lg: 'px-3.5 py-2 text-sm'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      
      {/* Mic Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isProcessingFallback}
        className={`rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer select-none active:scale-95 ${
          sizeClasses[size]
        } ${
          isListening
            ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/30'
            : isProcessingFallback
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
        }`}
        title={
          isListening
            ? 'Recording... Tap to stop'
            : isProcessingFallback
            ? 'Transcribing audio via Gemini AI...'
            : 'Click to dictate voice note (English / Arabic)'
        }
      >
        {isProcessingFallback ? (
          <Loader2 size={14} className="animate-spin text-amber-700" />
        ) : isListening ? (
          <MicOff size={14} className="animate-bounce" />
        ) : (
          <Mic size={14} className="text-blue-600" />
        )}

        {buttonLabel && <span>{buttonLabel}</span>}
        {isListening && (
          <span className="text-[10px] font-mono tracking-tight font-extrabold uppercase">
            Listening...
          </span>
        )}
      </button>

      {/* Language Switcher Badge */}
      {showLanguageToggle && (
        <button
          type="button"
          onClick={toggleLanguage}
          disabled={isListening}
          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
          title={`Active Dictation Language: ${language === 'en-US' ? 'English (Click for Arabic)' : 'العربية (عُمان)'}`}
        >
          <Globe size={11} className="text-slate-400" />
          <span>{language === 'en-US' ? 'EN' : 'عربي'}</span>
        </button>
      )}

      {/* Live Interim Feedback Banner */}
      {interimText && (
        <span className="text-[11px] text-blue-700 italic bg-blue-50 px-2 py-0.5 rounded border border-blue-200 animate-pulse truncate max-w-[180px]">
          "{interimText}"
        </span>
      )}

      {/* Error Tooltip */}
      {errorMessage && (
        <span 
          className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1 cursor-pointer"
          onClick={() => setErrorMessage(null)}
          title="Dismiss warning"
        >
          <AlertCircle size={10} />
          <span className="truncate max-w-[150px]">{errorMessage}</span>
        </span>
      )}
    </div>
  );
};
