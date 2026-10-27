import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Mic, MicOff, Camera, MapPin, Send, AlertTriangle, ArrowRight, ArrowLeft,
  CheckCircle2, X, Zap, PenTool, CheckSquare, FileText, Image as ImageIcon,
  SlidersHorizontal, ShieldCheck, ChevronDown, Trash2, Sparkles, Volume2
} from 'lucide-react';
import { DeviceIntegration } from '../../utils/deviceIntegration';
import { offlineStorage, TemplateRecord, DynamicChecklistItem } from '../../services/offlineStorage';
import { useLanguage } from '../../contexts/LanguageContext';
import { SignatureCanvas } from './SignatureCanvas';
import { useChecklistSpeechRecognition } from '../../hooks/useChecklistSpeechRecognition';
import { ChecklistVoiceController } from './ChecklistVoiceController';

interface InspectionChecklistProps {
  onComplete: () => void;
  initialTemplateId?: string;
  onCancel?: () => void;
}

export const InspectionChecklist: React.FC<InspectionChecklistProps> = ({ 
  onComplete, 
  initialTemplateId,
  onCancel 
}) => {
  const { dir, language } = useLanguage();
  
  // Templates state
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || '');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Inspection flow state
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUrgentSync, setIsUrgentSync] = useState(false);

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load available dynamic templates from offline storage
  useEffect(() => {
    async function init() {
      setIsLoadingTemplates(true);
      try {
        const list = await offlineStorage.getTemplates();
        setTemplates(list);
        if (list.length > 0) {
          if (initialTemplateId && list.some(t => t.id === initialTemplateId)) {
            setSelectedTemplateId(initialTemplateId);
          } else {
            setSelectedTemplateId(list[0].id);
          }
        }
      } catch (err) {
        console.error('[Checklist] Error loading templates:', err);
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    init();
  }, [initialTemplateId]);

  // Active template
  const activeTemplate = useMemo<TemplateRecord | null>(() => {
    return templates.find(t => t.id === selectedTemplateId) || templates[0] || null;
  }, [templates, selectedTemplateId]);

  // Derived checklist questions from active template items
  const questions = useMemo<DynamicChecklistItem[]>(() => {
    if (activeTemplate?.items && activeTemplate.items.length > 0) {
      return activeTemplate.items;
    }
    // Fallback default questions if template items array is empty
    return [
      { id: 'q1', type: 'boolean', label: 'Are all work controls and life saving rules verified?', required: true, booleanTrueLabel: 'Compliant', booleanFalseLabel: 'Deficient' },
      { id: 'q2', type: 'text', label: 'Field Observations & Inspection Remarks', required: false },
      { id: 'q3', type: 'photo', label: 'Photographic Evidence (Mandatory)', required: true },
      { id: 'q4', type: 'signature', label: 'Lead Inspector Digital Sign-off', required: true, signerRole: 'Lead Inspector' }
    ];
  }, [activeTemplate]);

  // Ensure step is within valid bounds when questions change
  useEffect(() => {
    if (step >= questions.length) {
      setStep(Math.max(0, questions.length - 1));
    }
  }, [questions.length, step]);

  // Auto-capture GPS on start
  useEffect(() => {
    DeviceIntegration.getCurrentLocation()
      .then(loc => setLocation(loc))
      .catch(err => console.warn('GPS Error', err));
  }, []);

  // Current active question
  const currentQ = questions[step] || questions[0];

  // Web Speech API Voice Command & Dictation Integration (Arabic & English)
  const handlePopulateCurrentText = useCallback((dictatedText: string, mode: 'append' | 'replace' = 'append') => {
    if (!currentQ) return;
    const targetKey = currentQ.type === 'text' ? currentQ.id : `${currentQ.id}_notes`;
    setAnswers(prev => {
      const currentVal = prev[targetKey] || '';
      const updated = (mode === 'append' && currentVal)
        ? `${currentVal.trim()} ${dictatedText.trim()}`
        : dictatedText.trim();
      return { ...prev, [targetKey]: updated };
    });
  }, [currentQ]);

  const handleClearCurrentText = useCallback(() => {
    if (!currentQ) return;
    const targetKey = currentQ.type === 'text' ? currentQ.id : `${currentQ.id}_notes`;
    setAnswers(prev => ({ ...prev, [targetKey]: '' }));
  }, [currentQ]);

  const handleVoiceNext = useCallback(() => {
    setStep(prev => Math.min(questions.length - 1, prev + 1));
  }, [questions.length]);

  const handleVoicePrev = useCallback(() => {
    setStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleVoiceSetBoolean = useCallback((val: 'PASS' | 'FAIL' | 'NA') => {
    if (currentQ) {
      setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
    }
  }, [currentQ]);

  const handleVoiceToggleUrgent = useCallback(() => {
    setIsUrgentSync(prev => !prev);
  }, []);

  const speech = useChecklistSpeechRecognition({
    initialLanguage: language === 'ar' ? 'ar-OM' : 'en-US',
    onPopulateText: handlePopulateCurrentText,
    onClearText: handleClearCurrentText,
    onNavigateNext: handleVoiceNext,
    onNavigatePrev: handleVoicePrev,
    onSetBooleanAnswer: handleVoiceSetBoolean,
    onToggleUrgent: handleVoiceToggleUrgent
  });

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await DeviceIntegration.compressImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error(err);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera', err);
      setIsCameraOpen(false);
      alert('Could not access camera. Ensure permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureLivePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64Photo = canvas.toDataURL('image/jpeg', 0.8);
      setPhotos(prev => [...prev, base64Photo]);
    }
    stopCamera();
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      let finalLocation = location;
      if (!finalLocation) {
        try {
          finalLocation = await DeviceIntegration.getCurrentLocation();
        } catch (err) {
          console.warn('Failed to get current location', err);
        }
      }

      const recordId = crypto.randomUUID();
      const payload = {
        id: recordId,
        templateId: activeTemplate?.title || activeTemplate?.name || 'Dynamic Inspection',
        status: 'DRAFT' as const,
        priority: isUrgentSync ? ('URGENT' as const) : ('NORMAL' as const),
        data: {
          answers,
          signatures,
          photos,
          templateId: activeTemplate?.id,
          templateName: activeTemplate?.title || activeTemplate?.name,
          category: activeTemplate?.category,
          regulatoryStandard: activeTemplate?.regulatoryStandard
        },
        location: finalLocation ? { lat: finalLocation.lat, lng: finalLocation.lng } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await offlineStorage.saveInspection(payload);
      onComplete();
    } catch (err) {
      console.error(err);
      alert('Failed to save draft.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let finalLocation = location;
      try {
        finalLocation = await DeviceIntegration.getCurrentLocation();
      } catch (err) {
        console.warn('Failed to get current location on submit, using cached', err);
      }

      const recordId = crypto.randomUUID();
      const templateTitle = activeTemplate?.title || activeTemplate?.name || 'Dynamic Inspection';
      const payload = {
        id: recordId,
        templateId: templateTitle,
        status: 'PENDING_SYNC' as const,
        priority: isUrgentSync ? ('URGENT' as const) : ('NORMAL' as const),
        data: {
          answers,
          signatures,
          photos,
          templateId: activeTemplate?.id,
          templateName: templateTitle,
          category: activeTemplate?.category,
          regulatoryStandard: activeTemplate?.regulatoryStandard
        },
        location: finalLocation ? { lat: finalLocation.lat, lng: finalLocation.lng } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save locally first to IndexedDB
      await offlineStorage.saveInspection(payload);

      // Enqueue sync item with priority
      await offlineStorage.enqueueSyncItem({
        id: crypto.randomUUID(),
        action: 'SUBMIT_INSPECTION',
        entityType: 'INSPECTION',
        priority: isUrgentSync ? 'URGENT' : 'NORMAL',
        title: `${templateTitle} (${isUrgentSync ? '⚡ Urgent Priority' : 'Standard'})`,
        payload: payload,
        retryCount: 0,
        createdAt: new Date().toISOString()
      });

      // Force Sync Engine processing in background
      try {
        const { SyncEngine } = await import('../../services/syncEngine');
        SyncEngine.processQueue();
      } catch (e) {
        console.warn('[Checklist] SyncEngine trigger:', e);
      }

      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] glass-panel ${dir === 'rtl' ? 'rtl font-arabic' : 'ltr font-sans'}`}>
      {/* Top Header & Template Selector */}
      <div className="p-4 glass-card border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                title="Cancel Inspection"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Active Inspection Checklist
              </label>
              {/* Template Switcher Dropdown */}
              <div className="relative mt-0.5">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    setStep(0);
                  }}
                  disabled={isLoadingTemplates}
                  className="w-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold appearance-none pe-8 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title || t.name} {t.regulatoryStandard ? `(${t.regulatoryStandard.split(' ')[0]})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Hands-Free Voice Mode Button in Header */}
            <button
              type="button"
              onClick={speech.toggleListening}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
                speech.isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse ring-2 ring-red-400/40'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
              title={speech.isListening ? 'Stop Voice Commands' : 'Start Hands-Free Voice Commands & Dictation'}
            >
              {speech.isListening ? <MicOff size={13} /> : <Mic size={13} />}
              <span className="font-mono text-[10px] uppercase font-black">
                {speech.language === 'en-US' ? 'EN Voice' : 'صوتي'}
              </span>
            </button>

            <div className="text-end shrink-0">
              <span className="text-xs font-black text-indigo-600 block">
                Step {step + 1} of {questions.length}
              </span>
              {activeTemplate?.version && (
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  v{activeTemplate.version}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Dynamic Question Canvas */}
      <div className="flex-1 p-6 overflow-y-auto pb-44 space-y-6">
        {/* Hands-Free Voice Listening Notification Banner for non-text questions */}
        {speech.isListening && currentQ.type !== 'text' && (
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-md space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>
                  {speech.language.startsWith('ar') 
                    ? 'الأوامر الصوتية نشطة (قل: "مطابق"، "غير مطابق"، "التالي"، "السابق")' 
                    : 'Hands-Free Voice Active (Say: "Pass", "Fail", "Next", "Back")'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                  {speech.language === 'en-US' ? 'EN' : 'عربي'}
                </span>
                <button 
                  onClick={speech.toggleListening}
                  className="text-[10px] text-slate-400 hover:text-white underline font-mono"
                >
                  Stop
                </button>
              </div>
            </div>
            {speech.interimTranscript && (
              <p className="text-xs text-indigo-200 italic font-medium">"{speech.interimTranscript}..."</p>
            )}
            {speech.commandFeedback && (
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>{speech.commandFeedback.label}</span>
              </p>
            )}
          </div>
        )}

        <div>
          {currentQ.category && (
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {currentQ.category}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
            {currentQ.label}
            {currentQ.required && <span className="text-red-500 ms-1">*</span>}
          </h2>
          {currentQ.helpText && (
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              {currentQ.helpText}
            </p>
          )}
        </div>

        {/* Dynamic Type 1: Text / Observation Input with Web Speech API */}
        {currentQ.type === 'text' && (
          <div className="space-y-4">
            <ChecklistVoiceController
              isListening={speech.isListening}
              language={speech.language}
              interimTranscript={speech.interimTranscript}
              commandFeedback={speech.commandFeedback}
              errorMessage={speech.errorMessage}
              isSupported={speech.isSupported}
              onToggleListening={speech.toggleListening}
              onChangeLanguage={speech.setLanguage}
              targetFieldLabel={currentQ.label}
            />

            <div className="relative">
              <textarea 
                value={answers[currentQ.id] || ''}
                onChange={e => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                className="w-full h-44 p-4 border-2 border-slate-200 rounded-2xl bg-white resize-none focus:border-indigo-600 focus:outline-none text-xs text-slate-900 leading-relaxed font-sans shadow-xs"
                placeholder={speech.language.startsWith('ar')
                  ? "اكتب الملاحظات أو استخدم الأوامر الصوتية باللغتين العربية والإنجليزية (مثل: 'امسح' أو 'التالي')..."
                  : "Type observations, measurements, or speak using voice commands in English & Arabic (e.g. 'Clear' or 'Next')..."}
              />
              <div className={`absolute bottom-3 ${dir === 'rtl' ? 'start-3' : 'end-3'} flex items-center gap-2`}>
                <button
                  type="button"
                  onClick={handleClearCurrentText}
                  disabled={!answers[currentQ.id]}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 text-[11px] font-bold flex items-center gap-1 transition-all"
                  title="Clear text field (Voice: 'Clear' / 'امسح')"
                >
                  <Trash2 size={12} />
                  <span>{speech.language.startsWith('ar') ? 'مسح' : 'Clear'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-indigo-500" />
                <span>Web Speech API active ({speech.language === 'en-US' ? 'English (en-US)' : 'العربية (ar-OM)'})</span>
              </span>
              <span>{answers[currentQ.id]?.length || 0} characters</span>
            </div>
          </div>
        )}

        {/* Dynamic Type 2: Boolean (Pass / Fail / NA) */}
        {currentQ.type === 'boolean' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAnswers({ ...answers, [currentQ.id]: 'PASS' })}
                className={`p-4 rounded-2xl text-start font-black text-sm border-2 transition-all flex items-center justify-between ${
                  answers[currentQ.id] === 'PASS'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
                }`}
              >
                <span>✓ {currentQ.booleanTrueLabel || 'Compliant (Pass)'}</span>
                {answers[currentQ.id] === 'PASS' && <CheckCircle2 size={18} className="text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setAnswers({ ...answers, [currentQ.id]: 'FAIL' })}
                className={`p-4 rounded-2xl text-start font-black text-sm border-2 transition-all flex items-center justify-between ${
                  answers[currentQ.id] === 'FAIL'
                    ? 'border-red-600 bg-red-50 text-red-900 shadow-md ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-red-300'
                }`}
              >
                <span>✕ {currentQ.booleanFalseLabel || 'Deficient (Fail)'}</span>
                {answers[currentQ.id] === 'FAIL' && <AlertTriangle size={18} className="text-red-600" />}
              </button>
            </div>

            {currentQ.allowNA !== false && (
              <button
                type="button"
                onClick={() => setAnswers({ ...answers, [currentQ.id]: 'NA' })}
                className={`w-full py-2.5 rounded-xl font-bold text-xs border transition-all ${
                  answers[currentQ.id] === 'NA'
                    ? 'border-slate-500 bg-slate-700 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Not Applicable (N/A)
              </button>
            )}

            {answers[currentQ.id] === 'FAIL' && (
              <div className="p-4 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 space-y-3 animate-fade-in text-xs">
                <div className="font-black flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle size={15} className="text-amber-600" />
                  <span>Defect / Non-Conformance Detected</span>
                </div>
                <p className="text-amber-800/90 font-medium">
                  Please attach photo evidence and record specific defect remarks below for CAPA tracking.
                </p>

                {/* Voice Dictatable Defect Remarks Field */}
                <div className="space-y-1.5 pt-2 border-t border-amber-200/80">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                    <span>Defect Notes / Specific Observations:</span>
                    <button
                      type="button"
                      onClick={speech.toggleListening}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                        speech.isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-amber-200/90 hover:bg-amber-300 text-amber-900'
                      }`}
                    >
                      <Mic size={11} />
                      <span>{speech.isListening ? 'Listening...' : (speech.language.startsWith('ar') ? 'إملاء صوتي' : 'Voice Dictate')}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={answers[`${currentQ.id}_notes`] || ''}
                    onChange={e => setAnswers({ ...answers, [`${currentQ.id}_notes`]: e.target.value })}
                    placeholder={speech.language.startsWith('ar')
                      ? "أملِ أو اكتب تفاصيل الخلل الملاحظ (مثال: 'حاجز حماية متضرر')..."
                      : "Dictate or type defect details (e.g. 'Broken safety interlock on roller conveyer')..."}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Type 3: Photo Evidence */}
        {currentQ.type === 'photo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <div key={i} className="aspect-square bg-slate-200 rounded-2xl relative overflow-hidden group border-2 border-slate-200 shadow-xs">
                  <img src={p} alt="evidence" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-2 end-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md z-10 transition-colors"
                    title="Remove photo"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              
              <div className="aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 gap-2 p-3">
                <button 
                  type="button"
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center w-full hover:bg-slate-100 rounded-xl transition-colors py-2 active:scale-95"
                >
                  <Camera size={22} className="mb-1 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase text-indigo-700">Live Camera</span>
                </button>
                <div className="w-full h-px bg-slate-200" />
                <label className="flex flex-col items-center justify-center w-full cursor-pointer hover:bg-slate-100 rounded-xl transition-colors py-2 active:scale-95">
                  <ImageIcon size={22} className="mb-1 text-emerald-600" />
                  <span className="text-[10px] font-black uppercase text-emerald-700">Upload File</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                </label>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>{photos.length} Photo{photos.length !== 1 ? 's' : ''} compressed & attached offline</span>
              </div>
            )}

            {location && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <MapPin size={14} className="text-emerald-500" />
                <span>GPS Coordinates attached ({location.accuracy.toFixed(1)}m accuracy)</span>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Type 4: Digital Signature Canvas */}
        {currentQ.type === 'signature' && (
          <div className="space-y-4">
            <SignatureCanvas
              label={currentQ.label}
              required={currentQ.required}
              signerRole={currentQ.signerRole || 'Lead Inspector'}
              initialSignature={signatures[currentQ.id]}
              onChange={(sig) => {
                if (sig) {
                  setSignatures(prev => ({ ...prev, [currentQ.id]: sig }));
                } else {
                  setSignatures(prev => {
                    const copy = { ...prev };
                    delete copy[currentQ.id];
                    return copy;
                  });
                }
              }}
            />
          </div>
        )}

        {/* Dynamic Type 5: Select Dropdown */}
        {currentQ.type === 'select' && (
          <div className="space-y-3">
            {currentQ.options?.map(opt => (
              <button 
                key={opt}
                type="button"
                onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                className={`w-full p-4 rounded-xl text-start font-bold text-xs border-2 transition-all ${
                  answers[currentQ.id] === opt 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm' 
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thumb-Zone Navigation Footer (Bottom 40% anchored) */}
      <div className="fixed bottom-0 inset-x-0 p-4 glass-card border-t border-slate-200 pb-safe z-40 bg-white/95 backdrop-blur-md">
        <div className="max-w-md mx-auto space-y-3">
          {/* Urgent Priority Queue Toggle on Final Step */}
          {step === questions.length - 1 && (
            <div 
              onClick={() => setIsUrgentSync(!isUrgentSync)}
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition select-none ${
                isUrgentSync 
                  ? 'bg-amber-50 border-amber-300 text-amber-900' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap size={15} className={isUrgentSync ? 'text-amber-600 fill-amber-600' : 'text-slate-400'} />
                <div>
                  <div className="text-xs font-bold leading-tight">Flag as Urgent Sync Priority</div>
                  <div className="text-[10px] text-slate-500">Uploads at head of queue upon network recovery</div>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded transition ${
                isUrgentSync ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-600'
              }`}>
                {isUrgentSync ? 'URGENT' : 'NORMAL'}
              </span>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <button 
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
            )}
            
            {step < questions.length - 1 ? (
              <button 
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/20"
              >
                <span>Next Question</span>
                <ArrowRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
              </button>
            ) : (
              <>
                <button 
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="px-4 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-600/20"
                >
                  <Send size={15} className={dir === 'rtl' ? 'rotate-180' : ''} /> 
                  <span>{submitting ? 'Submitting...' : 'Submit Inspection'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Live Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent absolute top-0 inset-x-0 z-10">
            <button 
              type="button"
              onClick={stopCamera} 
              className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md"
            >
              <X size={24} />
            </button>
            <div className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
              Capture Evidence Photo
            </div>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-8 pb-12 bg-black flex justify-center items-center">
            <button 
              type="button"
              onClick={captureLivePhoto}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/40 transition-colors"
            >
              <div className="w-16 h-16 bg-white rounded-full" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionChecklist;
