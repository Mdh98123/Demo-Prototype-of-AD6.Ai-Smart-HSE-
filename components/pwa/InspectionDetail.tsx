import React, { useState, useRef } from 'react';
import { InspectionRecord, offlineStorage } from '../../services/offlineStorage';
import { Camera, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { DeviceIntegration } from '../../utils/deviceIntegration';

interface InspectionDetailProps {
  record: InspectionRecord;
  onBack: () => void;
  onUpdate: () => void;
}

export const InspectionDetail: React.FC<InspectionDetailProps> = ({ record, onBack, onUpdate }) => {
  const [photos, setPhotos] = useState<string[]>(record.data?.photos || []);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await DeviceIntegration.compressImage(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Photo = reader.result as string;
        const newPhotos = [...photos, base64Photo];
        setPhotos(newPhotos);
        
        // Update record
        const updatedRecord = {
          ...record,
          data: { ...record.data, photos: newPhotos },
          updatedAt: new Date().toISOString()
        };
        await offlineStorage.saveInspection(updatedRecord);
        onUpdate();
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
      const newPhotos = [...photos, base64Photo];
      setPhotos(newPhotos);
      
      const updatedRecord = {
        ...record,
        data: { ...record.data, photos: newPhotos },
        updatedAt: new Date().toISOString()
      };
      await offlineStorage.saveInspection(updatedRecord);
      onUpdate();
    }
    stopCamera();
  };

  return (
    <div className="flex flex-col h-full glass-panel relative">
      <div className="p-4 glass-card border-b border-slate-200 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Inspection Details</h2>
          <p className="text-xs text-slate-500">{record.templateId} • {new Date(record.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Record info */}
        <div className="glass-card p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3">Data</h3>
          <div className="space-y-2">
            {Object.keys(record.data || {}).filter(k => k !== 'photos').map(key => (
              <div key={key}>
                <span className="text-xs text-slate-500 font-bold">{key}:</span>
                <p className="text-sm text-slate-800">{record.data[key]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Photos section */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center justify-between">
            Attached Photos
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{photos.length}</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {photos.map((p, i) => (
              <div key={i} className="aspect-square bg-slate-200 rounded-xl relative overflow-hidden group border-2 border-slate-200">
                <img src={p} alt="evidence" className="w-full h-full object-cover" />
                <button 
                  onClick={async () => {
                    const newPhotos = photos.filter((_, idx) => idx !== i);
                    setPhotos(newPhotos);
                    const updatedRecord = {
                      ...record,
                      data: { ...record.data, photos: newPhotos },
                      updatedAt: new Date().toISOString()
                    };
                    await offlineStorage.saveInspection(updatedRecord);
                    onUpdate();
                  }}
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
