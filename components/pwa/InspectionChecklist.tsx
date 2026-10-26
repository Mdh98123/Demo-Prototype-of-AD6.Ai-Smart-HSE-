import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, MapPin, Send, AlertTriangle, ArrowRight, CameraOff, Image as ImageIcon, X, Zap } from 'lucide-react';
import { DeviceIntegration } from '../../utils/deviceIntegration';
import { offlineStorage } from '../../services/offlineStorage';
import { useLanguage } from '../../contexts/LanguageContext';

export const InspectionChecklist: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { dir, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<any>({});
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isUrgentSync, setIsUrgentSync] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Dynamic template based on Oman MoL MD 286/2008 requirements
  const questions = [
    { id: 'q1', type: 'select', title: 'Work Area Assessment', options: ['Safe', 'At Risk', 'Critical Danger'] },
    { id: 'q2', type: 'text', title: 'Observation Notes', voiceEnabled: true },
    { id: 'q3', type: 'photo', title: 'Photographic Evidence (Mandatory for Risk)' },
  ];

  useEffect(() => {
    // Auto-capture GPS on start
    DeviceIntegration.getCurrentLocation()
      .then(loc => setLocation(loc))
      .catch(err => console.warn('GPS Error', err));
  }, []);

  const handleVoiceInput = () => {
    if (isListening) return; // Normally you'd stop recognition if true, simplifying for demo
    
    setIsListening(true);
    DeviceIntegration.startSpeechRecognition(
      language === 'ar' ? 'ar-AE' : 'en-US',
      (transcript) => {
        setData((prev: any) => ({ ...prev, [questions[step].id]: (prev[questions[step].id] || '') + ' ' + transcript }));
      },
      (err) => { console.error(err); setIsListening(false); },
      () => setIsListening(false)
    );
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await DeviceIntegration.compressImage(file);
      // In a real PWA you would use IndexedDB or FileSystem API to store blobs.
      // Here we use Base64 for rapid local prototyping
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
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
      console.error("Error accessing camera", err);
      setIsCameraOpen(false);
      alert("Could not access camera. Ensure permissions are granted.");
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
        templateId: 'Oman MoL MD 286/2008_M7',
        status: 'DRAFT' as const,
        data: { ...data, photos },
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
      const payload = {
        id: recordId,
        templateId: 'Oman MoL MD 286/2008_M7',
        status: 'PENDING_SYNC' as const,
        priority: isUrgentSync ? ('URGENT' as const) : ('NORMAL' as const),
        data: { ...data, photos },
        location: finalLocation ? { lat: finalLocation.lat, lng: finalLocation.lng } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save locally First
      await offlineStorage.saveInspection(payload);

      // Queue for Background Sync with priority
      await offlineStorage.enqueueSyncItem({
        id: crypto.randomUUID(),
        action: 'SUBMIT_INSPECTION',
        entityType: 'INSPECTION',
        priority: isUrgentSync ? 'URGENT' : 'NORMAL',
        title: `Oman MoL MD 286/2008 M7 Field Inspection (${isUrgentSync ? '⚡ Urgent Priority' : 'Standard'})`,
        payload: payload,
        retryCount: 0,
        createdAt: new Date().toISOString()
      });

      // Force Sync Engine to process
      const { SyncEngine } = await import('../../services/syncEngine');
      SyncEngine.processQueue();

      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[step];

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] glass-panel ${dir === 'rtl' ? 'rtl font-arabic' : 'ltr font-sans'}`}>
       
       <div className="p-4 glass-card border-b border-slate-200">
         <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
            <span>Oman MoL MD 286/2008 Mechanism 7</span>
            <span>Step {step + 1} of {questions.length}</span>
         </div>
         <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${((step + 1)/questions.length) * 100}%` }}></div>
         </div>
       </div>

       <div className="flex-1 p-6 overflow-y-auto pb-40">
           <h2 className="text-2xl font-black text-slate-800 mb-6">{currentQ.title}</h2>
           
           {currentQ.type === 'select' && (
              <div className="space-y-3">
                 {currentQ.options?.map(opt => (
                   <button 
                     key={opt}
                     onClick={() => setData({ ...data, [currentQ.id]: opt })}
                     className={`w-full p-4 rounded-xl text-start font-bold border-2 transition-all ${data[currentQ.id] === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 glass-card text-slate-600 hover:border-slate-300'}`}
                   >
                     {opt}
                   </button>
                 ))}
                 
                 {data[currentQ.id] === 'Critical Danger' && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
                       <AlertTriangle className="shrink-0" />
                       <div className="text-sm font-bold">Root Cause Analysis + CAPA Auto-Initiated based on this selection.</div>
                    </div>
                 )}
              </div>
           )}

           {currentQ.type === 'text' && (
              <div className="space-y-4">
                 <div className="relative">
                    <textarea 
                      value={data[currentQ.id] || ''}
                      onChange={e => setData({...data, [currentQ.id]: e.target.value})}
                      className="w-full h-40 p-4 border-2 border-slate-200 rounded-xl glass-card resize-none focus:border-indigo-600 focus:outline-none"
                      placeholder="Start typing or use voice dictation..."
                    />
                    {currentQ.voiceEnabled && (
                       <button 
                         onClick={handleVoiceInput}
                         className={`absolute bottom-4 ${dir === 'rtl' ? 'start-4' : 'end-4'} p-3 rounded-full shadow-lg text-white transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                       >
                          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                       </button>
                    )}
                 </div>
              </div>
           )}

           {currentQ.type === 'photo' && (
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    {photos.map((p, i) => (
                       <div key={i} className="aspect-square bg-slate-200 rounded-xl relative overflow-hidden group border-2 border-slate-200">
                          <img src={p} alt="evidence" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md z-10 transition-colors"
                            title="Remove photo"
                          >
                            <X size={14} />
                          </button>
                       </div>
                    ))}
                    
                    <div className="aspect-square bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 gap-2">
                      <button 
                        onClick={startCamera}
                        className="flex flex-col items-center justify-center w-full hover:bg-slate-200 transition-colors py-2"
                      >
                        <Camera size={24} className="mb-1 text-indigo-500" />
                        <span className="text-[10px] font-bold font-sans uppercase">Live Camera</span>
                      </button>
                      <div className="w-full h-px bg-slate-200"></div>
                      <label className="flex flex-col items-center justify-center w-full cursor-pointer hover:bg-slate-200 transition-colors py-2">
                        <ImageIcon size={24} className="mb-1 text-emerald-500" />
                        <span className="text-[10px] font-bold font-sans uppercase">Upload File</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                      </label>
                    </div>
                 </div>
                 {location && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                       <MapPin size={14} className="text-emerald-500" />
                       GPS Attached ({location.accuracy.toFixed(1)}m precision)
                    </div>
                 )}
              </div>
           )}
       </div>

       {/* Thumb-Zone Navigation (Bottom 40% anchored) */}
       <div className="fixed bottom-0 inset-x-0 p-4 glass-card border-t border-slate-200 pb-safe z-40">
          <div className="max-w-md mx-auto">
             {step === questions.length - 1 && (
                <div 
                  onClick={() => setIsUrgentSync(!isUrgentSync)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border mb-3 cursor-pointer transition ${
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

             <div className="flex gap-4">
                {step > 0 && (
                   <button 
                     onClick={() => setStep(step - 1)}
                     className="px-6 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                   >
                     Back
                   </button>
                )}
                
                {step < questions.length - 1 ? (
                   <button 
                      onClick={() => setStep(step + 1)}
                      className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                   >
                      Next <ArrowRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                   </button>
                ) : (
                   <>
                     <button 
                        onClick={handleSaveDraft}
                        disabled={submitting}
                        className="px-4 py-4 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                     >
                        Draft
                     </button>
                     <button 
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                     >
                        <Send size={18} className={dir === 'rtl' ? 'rotate-180' : ''} /> 
                        {submitting ? 'Saving...' : 'Submit'}
                     </button>
                   </>
                )}
             </div>
          </div>
       </div>

       {/* Fullscreen Camera Modal */}
       {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent absolute top-0 inset-x-0 z-10">
            <button onClick={stopCamera} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
              <X size={24} />
            </button>
            <div className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
              Capture Evidence
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
              onClick={captureLivePhoto}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center glass-card/20 active:glass-button transition-colors"
            >
              <div className="w-16 h-16 glass-card rounded-full"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
