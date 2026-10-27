import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InspectionRecord, offlineStorage } from '../../services/offlineStorage';
import { 
  Camera, ArrowLeft, Image as ImageIcon, X, Sparkles, 
  MapPin, Mic, Calendar, User, FileText, CheckCircle2, 
  ShieldAlert, RefreshCw, ZoomIn, Eye, MessageSquare, Download,
  SwitchCamera, Trash2, StopCircle, PenTool
} from 'lucide-react';
import { PhotoEvidence, AIHazardItem, AIHazardAnalysisResult } from '../../types/mediaTypes';
import { CameraCaptureModal } from '../media/CameraCaptureModal';
import { VoiceDictationButton } from '../media/VoiceDictationButton';
import { AIHazardAnalysisCard } from '../media/AIHazardAnalysisCard';
import { useUser } from '../../contexts/UserContext';
import { EnterpriseDataStore } from '../../services/enterpriseDataStore';
import { compressImageClientSide } from '../../utils/imageCompression';
import { InspectionPdfReportService } from '../../services/inspectionPdfReportService';

interface InspectionDetailProps {
  record: any;
  onBack: () => void;
  onUpdate: () => void;
}

export const InspectionDetail: React.FC<InspectionDetailProps> = ({ record, onBack, onUpdate }) => {
  const { currentUser } = useUser();

  // Normalize existing photos (supporting backward compatibility for string[] or PhotoEvidence[])
  const normalizePhotos = useCallback((rawPhotos: any[] = []): PhotoEvidence[] => {
    if (!Array.isArray(rawPhotos)) return [];
    return rawPhotos.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          id: `photo-${idx}-${Date.now()}`,
          url: item,
          timestamp: record.updatedAt || record.date || new Date().toISOString(),
          uploader: currentUser?.name || 'Field Inspector',
          caption: '',
          linkage: { parentType: 'Inspection', parentId: record.id }
        };
      }
      return item as PhotoEvidence;
    });
  }, [currentUser?.name, record.id, record.updatedAt, record.date]);

  const [photos, setPhotos] = useState<PhotoEvidence[]>(() => 
    normalizePhotos(record.data?.photos || record.photos)
  );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoEvidence | null>(null);

  // Integrated Camera Viewfinder State
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFlash, setCapturedFlash] = useState(false);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);

  // Free-text field: Inspection observations / findings description
  const [inspectionNotes, setInspectionNotes] = useState<string>(
    record.data?.observations || record.data?.notes || record.data?.inspectorNotes || record.context || ''
  );

  // AI analysis states
  const [analyzingPhotoId, setAnalyzingPhotoId] = useState<string | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadPdfReport = async () => {
    setIsExportingPdf(true);
    try {
      await InspectionPdfReportService.downloadInspectionPdf(record, {
        inspectorName: currentUser?.name || 'Lead Safety Officer',
        facilityOrSite: record.data?.site || 'Industrial Site Zone 4'
      });
      setActionSuccessNotice('Formal Inspection PDF Report generated and downloaded successfully.');
    } catch (err: any) {
      console.error('[PDF Export Error]', err);
      alert('Failed to generate PDF report: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks cleanly
  const stopLiveCameraTracks = useCallback(() => {
    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('[Camera Cleanup] Track stop warning:', e);
        }
      });
      liveStreamRef.current = null;
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
  }, []);

  // Dispose of camera tracks on component unmount
  useEffect(() => {
    return () => {
      stopLiveCameraTracks();
    };
  }, [stopLiveCameraTracks]);

  // Start live camera stream
  const startLiveCamera = useCallback(async (mode?: 'environment' | 'user') => {
    stopLiveCameraTracks();
    setCameraError(null);

    const targetMode = mode || facingMode;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API (navigator.mediaDevices.getUserMedia) is not supported in this browser or requires an HTTPS context. Please use the device gallery upload option.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: targetMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      liveStreamRef.current = stream;

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        await liveVideoRef.current.play();
      }
      setIsLiveCameraActive(true);
    } catch (err: any) {
      console.warn('[Camera Access Error]', err);
      let errorMsg = 'Could not access device camera. Please check permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. You can still upload photos from your device gallery below.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera hardware found on this device.';
      }
      setCameraError(errorMsg);
      setIsLiveCameraActive(false);
    }
  }, [facingMode, stopLiveCameraTracks]);

  // Switch between front and back cameras
  const toggleFacingMode = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isLiveCameraActive) {
      await startLiveCamera(nextMode);
    }
  };

  // Capture photo from live camera feed
  const captureLivePhoto = async () => {
    if (!liveVideoRef.current) return;
    setIsCapturing(true);
    setCapturedFlash(true);
    setTimeout(() => setCapturedFlash(false), 200);

    try {
      const video = liveVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      // Client-side compression ensuring max 1600px width/dimension and 0.8 JPEG quality
      const compressed = await compressImageClientSide(rawDataUrl, {
        maxDimension: 1600,
        quality: 0.8
      });

      // Acquire GPS if permitted
      let coords: { lat: number; lng: number } | undefined;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000, maximumAge: 60000 });
          });
          coords = {
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6))
          };
        } catch {
          // GPS optional
        }
      }

      const newPhoto: PhotoEvidence = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        url: compressed.dataUrl,
        timestamp: new Date().toISOString(),
        uploader: currentUser?.name || 'Field Inspector',
        gps: coords,
        caption: '',
        linkage: {
          parentType: 'Inspection',
          parentId: record.id
        }
      };

      const merged = [...photos, newPhoto];
      setPhotos(merged);
      setSelectedPhotoIndex(merged.length - 1);
      await persistChanges(merged, inspectionNotes);
      showNotice('Photo captured and compressed successfully (max 1600px).');
    } catch (err: any) {
      console.error('[Live Capture Error]', err);
      showNotice('Failed to capture photo: ' + (err.message || 'Unknown error'));
    } finally {
      setIsCapturing(false);
    }
  };

  // Persist changes to offline storage
  const persistChanges = async (updatedPhotos: PhotoEvidence[], updatedNotes: string) => {
    try {
      const existingData = record.data || {};
      const updatedRecord: InspectionRecord = {
        ...record,
        data: {
          ...existingData,
          photos: updatedPhotos,
          observations: updatedNotes,
          inspectorNotes: updatedNotes
        },
        updatedAt: new Date().toISOString()
      };
      await offlineStorage.saveInspection(updatedRecord);
      onUpdate();
    } catch (err) {
      console.error('[InspectionDetail] Persistence error:', err);
    }
  };

  // Add captured photos from CameraCaptureModal
  const handlePhotosCaptured = async (newPhotos: PhotoEvidence[]) => {
    const merged = [...photos, ...newPhotos];
    setPhotos(merged);
    setSelectedPhotoIndex(merged.length - 1);
    await persistChanges(merged, inspectionNotes);
    showNotice(`Attached ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} to inspection.`);
  };

  // Fallback: Upload multiple photos via file input
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newEvidence: PhotoEvidence[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressed = await compressImageClientSide(file, {
          maxDimension: 1600,
          quality: 0.8
        });

        newEvidence.push({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          url: compressed.dataUrl,
          timestamp: new Date().toISOString(),
          uploader: currentUser?.name || 'Field Inspector',
          caption: file.name.replace(/\.[^/.]+$/, ''),
          linkage: { parentType: 'Inspection', parentId: record.id }
        });
      } catch (err) {
        console.error('[Upload Compression Error]', err);
      }
    }

    if (newEvidence.length > 0) {
      const merged = [...photos, ...newEvidence];
      setPhotos(merged);
      setSelectedPhotoIndex(merged.length - 1);
      await persistChanges(merged, inspectionNotes);
      showNotice(`Attached ${newEvidence.length} photo${newEvidence.length > 1 ? 's' : ''} (compressed to max 1600px).`);
    }

    if (galleryFileInputRef.current) {
      galleryFileInputRef.current.value = '';
    }
  };

  // Delete a photo
  const handleDeletePhoto = async (photoId: string) => {
    const filtered = photos.filter(p => p.id !== photoId);
    setPhotos(filtered);
    if (selectedPhotoIndex >= filtered.length) {
      setSelectedPhotoIndex(Math.max(0, filtered.length - 1));
    }
    await persistChanges(filtered, inspectionNotes);
    showNotice('Photo evidence removed.');
  };

  // Update caption on photo
  const handleUpdateCaption = async (photoId: string, caption: string) => {
    const updated = photos.map(p => p.id === photoId ? { ...p, caption } : p);
    setPhotos(updated);
    await persistChanges(updated, inspectionNotes);
  };

  // Attach voice narration note to specific photo
  const handleAttachPhotoVoiceNote = async (photoId: string, voiceText: string) => {
    const updated = photos.map(p => {
      if (p.id === photoId) {
        const current = p.voiceNote ? `${p.voiceNote} ${voiceText}` : voiceText;
        return { ...p, voiceNote: current };
      }
      return p;
    });
    setPhotos(updated);
    await persistChanges(updated, inspectionNotes);
    showNotice('Voice note attached to photo.');
  };

  // Analyze specific photo with AI (calling /api/gemini/analyze-hazard-image)
  const handleAnalyzePhoto = async (photo: PhotoEvidence) => {
    setAnalyzingPhotoId(photo.id);

    try {
      const res = await fetch('/api/gemini/analyze-hazard-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: photo.url,
          context: `Inspection ${record.templateId || record.type || 'Field Safety'} at ${record.data?.site || record.location || 'Industrial Site, Oman'}. Note: ${photo.caption || photo.voiceNote || 'General walkthrough'}`
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const updated = photos.map(p => p.id === photo.id ? { ...p, aiAnalysis: json.data } : p);
        setPhotos(updated);
        await persistChanges(updated, inspectionNotes);
        showNotice('AI Hazard Triage completed.');
      } else {
        showNotice('AI Vision Triage could not complete analysis. Check network or API settings.');
      }
    } catch (err: any) {
      console.error('[AI Analysis Error]', err);
      showNotice('AI Analysis error: ' + (err.message || 'Network failure'));
    } finally {
      setAnalyzingPhotoId(null);
    }
  };

  // Analyze all photos sequentially
  const handleAnalyzeAll = async () => {
    if (photos.length === 0) return;
    setIsAnalyzingAll(true);

    let updatedList = [...photos];
    for (let i = 0; i < updatedList.length; i++) {
      const photo = updatedList[i];
      setAnalyzingPhotoId(photo.id);

      try {
        const res = await fetch('/api/gemini/analyze-hazard-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: photo.url,
            context: `Inspection ${record.templateId || record.type || 'Field Safety'} photo ${i + 1}/${updatedList.length}`
          })
        });
        const json = await res.json();
        if (json.success && json.data) {
          updatedList[i] = { ...photo, aiAnalysis: json.data };
          setPhotos([...updatedList]);
        }
      } catch (e) {
        console.warn(`[Analyze All] Failed for photo ${photo.id}:`, e);
      }
    }

    await persistChanges(updatedList, inspectionNotes);
    setAnalyzingPhotoId(null);
    setIsAnalyzingAll(false);
    showNotice(`Completed AI analysis on ${updatedList.length} photo${updatedList.length > 1 ? 's' : ''}.`);
  };

  // One-click Action: Create NCR from AI finding
  const handleCreateNCR = (hazard: AIHazardItem, actionText: string) => {
    const currentPhoto = photos[selectedPhotoIndex];
    const ncrId = `NCR-${Date.now().toString().slice(-6)}`;
    const newNCR = {
      id: ncrId,
      inspectionId: record.id,
      itemId: currentPhoto?.id || 'PHOTO-EVIDENCE',
      description: `[Finding from Photo Evidence]: ${hazard.name} - ${hazard.location_in_image}. Category: ${hazard.category}`,
      severity: (hazard.severity === 'Critical' ? 'Critical' : hazard.severity === 'High' ? 'Major' : 'Minor') as any,
      assignedTo: currentUser?.name || 'Area Authority',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'Open' as const,
      correctiveAction: actionText
    };

    try {
      const existing = JSON.parse(localStorage.getItem('hse_ncrs') || '[]');
      localStorage.setItem('hse_ncrs', JSON.stringify([newNCR, ...existing]));
      window.dispatchEvent(new CustomEvent('ad6-ncrs-updated', { detail: newNCR }));
      showNotice(`Created Non-Conformance Report #${ncrId}. Assigned to ${newNCR.assignedTo}.`);
    } catch (e) {
      console.error('[Create NCR Error]', e);
    }
  };

  // One-click Action: Add as Safety Observation
  const handleAddObservation = (hazard: AIHazardItem, contextText: string) => {
    const currentPhoto = photos[selectedPhotoIndex];
    const newObs = {
      id: `OBS-${Date.now().toString().slice(-6)}`,
      type: 'Improvement' as const,
      description: `[Field Inspection ${record.templateId || record.type || 'Field Safety'}] ${hazard.name} located at ${hazard.location_in_image}. ${contextText.slice(0, 150)}...`,
      location: record.data?.site || record.data?.facility || record.location || 'Inspection Area, Oman',
      timestamp: new Date().toISOString(),
      status: 'Submitted' as const,
      isAnonymous: false,
      reportedBy: currentUser?.name || 'Field Inspector',
      images: currentPhoto ? [currentPhoto.url] : [],
      history: []
    };

    try {
      const existing = JSON.parse(localStorage.getItem('hse_observations') || '[]');
      localStorage.setItem('hse_observations', JSON.stringify([newObs, ...existing]));
      window.dispatchEvent(new CustomEvent('ad6-observations-updated', { detail: newObs }));
      showNotice(`Added Safety Observation #${newObs.id}.`);
    } catch (e) {
      console.error('[Add Observation Error]', e);
    }
  };

  // One-click Action: Create CAPA
  const handleCreateCapa = (hazard: AIHazardItem, actionText: string) => {
    const capaId = `CAPA-${Date.now().toString().slice(-6)}`;
    const newCapa = {
      id: capaId,
      title: `Remediate: ${hazard.name}`,
      description: `Corrective action triggered by inspection photo evidence. Requirement: ${actionText}. Location in frame: ${hazard.location_in_image}`,
      priority: (hazard.severity === 'Critical' ? 'P1 - High' : hazard.severity === 'High' ? 'P2 - High' : 'P3 - Medium') as any,
      status: 'Open' as const,
      sourceType: 'Inspection' as const,
      sourceId: record.id,
      ownerName: currentUser?.name || 'HSE Officer',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      actions: [{ text: actionText, completed: false }]
    };

    try {
      EnterpriseDataStore.createCapa(newCapa as any, currentUser || { id: 'u1', name: 'Inspector', role: 'Inspector' } as any);
      showNotice(`Created CAPA Corrective Action #${capaId}.`);
    } catch (e) {
      console.error('[Create CAPA Error]', e);
    }
  };

  // Apply auto-drafted narrative into inspection notes
  const handleApplyNarrative = async (narrative: string) => {
    const updatedNotes = inspectionNotes ? `${inspectionNotes}\n\n${narrative}` : narrative;
    setInspectionNotes(updatedNotes);
    await persistChanges(photos, updatedNotes);
    showNotice('Auto-drafted narrative saved to inspection record.');
  };

  const showNotice = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  const activePhoto = photos[selectedPhotoIndex] || null;

  return (
    <div className="flex flex-col h-full bg-slate-50/60 relative select-none">
      
      {/* Top Navigation & Context Header */}
      <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={onBack} 
            className="p-2 -ms-1 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            title="Return to inspections list"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight truncate">
              {record.templateId || record.type || 'Field Safety Inspection'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                {record.id}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(record.updatedAt || record.date || Date.now()).toLocaleDateString()}
              </span>
              {record.status && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {record.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global Photo & Report Actions in Header */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadPdfReport}
            disabled={isExportingPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Download Official Statutory PDF Report"
          >
            {isExportingPdf ? (
              <RefreshCw size={15} className="animate-spin text-emerald-400" />
            ) : (
              <Download size={15} className="text-emerald-400" />
            )}
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button
            onClick={() => setIsCameraModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Camera size={15} />
            <span className="hidden sm:inline">Launch Full Camera</span>
            <span className="sm:hidden">Camera</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessNotice && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-fade-in shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="truncate">{actionSuccessNotice}</span>
          </div>
          <button onClick={() => setActionSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* ========================================================================= */}
        {/* PHOTO EVIDENCE SECTION: CAMERA, THUMBNAILS, CAPTIONS, COMPRESSION          */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Camera size={16} className="text-blue-600" />
                Photo Evidence
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {photos.length} Captured
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Capture unlimited high-resolution photos with live camera, front/back switching, client-side 1600px compression, and thumbnail review
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Start/Stop Inline Camera */}
              <button
                onClick={() => {
                  if (isLiveCameraActive) {
                    stopLiveCameraTracks();
                  } else {
                    startLiveCamera();
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLiveCameraActive
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
                title={isLiveCameraActive ? 'Close live camera' : 'Open live camera viewfinder'}
              >
                {isLiveCameraActive ? (
                  <>
                    <StopCircle size={14} />
                    <span>Close Camera</span>
                  </>
                ) : (
                  <>
                    <Camera size={14} />
                    <span>Open Live Camera</span>
                  </>
                )}
              </button>

              {/* Analyze All (Multimodal AI) */}
              {photos.length > 1 && (
                <button
                  onClick={handleAnalyzeAll}
                  disabled={isAnalyzingAll}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Run AI vision hazard triage on all photos"
                >
                  {isAnalyzingAll ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Scanning All...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Analyze All ({photos.length})</span>
                    </>
                  )}
                </button>
              )}

              {/* Fallback File/Gallery Upload Option */}
              <label 
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Upload photos from device gallery (fallback for camera denied/unavailable)"
              >
                <ImageIcon size={14} className="text-emerald-600" />
                <span className="hidden sm:inline">Upload Photos</span>
                <span className="sm:hidden">Upload</span>
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Camera Error / Permission Denied Warning Banner */}
          {cameraError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950">Camera Permission or Hardware Notice</h4>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">{cameraError}</p>
                </div>
              </div>
              <button
                onClick={() => galleryFileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] shrink-0"
              >
                Choose Files
              </button>
            </div>
          )}

          {/* LIVE CAMERA VIEWFINDER (When Activated) */}
          {isLiveCameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-blue-500 shadow-lg animate-fade-in">
              {/* Shutter Flash Animation */}
              {capturedFlash && (
                <div className="absolute inset-0 bg-white/80 z-20 pointer-events-none transition-opacity duration-200" />
              )}

              {/* Live Video Element */}
              <div className="relative aspect-video max-h-[380px] w-full flex items-center justify-center bg-black">
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Overlay Controls */}
                <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
                  {/* Top Bar: Camera Mode Badge & Switch Camera Button */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/10 pointer-events-auto">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {facingMode === 'environment' ? 'Rear Camera (Environment)' : 'Front Camera (User)'}
                    </span>

                    <div className="flex items-center gap-2 pointer-events-auto">
                      <button
                        onClick={toggleFacingMode}
                        className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Switch between front and back camera"
                      >
                        <SwitchCamera size={14} className="text-blue-400" />
                        <span>Switch Camera</span>
                      </button>

                      <button
                        onClick={stopLiveCameraTracks}
                        className="p-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
                        title="Close live camera"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Bar: Capture Shutter Button */}
                  <div className="flex items-center justify-center gap-4 pb-2 pointer-events-auto">
                    <button
                      onClick={captureLivePhoto}
                      disabled={isCapturing}
                      className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer border-2 border-blue-500 ring-4 ring-blue-500/30 disabled:opacity-50"
                    >
                      <Camera size={18} className="text-blue-600" />
                      <span>{isCapturing ? 'Compressing...' : 'Capture Photo'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Viewfinder Footer Info */}
              <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Client-side compression: Resized to max 1600px width before storage.</span>
                <span className="text-blue-400 font-bold">{photos.length} captured in session</span>
              </div>
            </div>
          )}

          {/* Photo Thumbnails Grid */}
          {photos.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <Camera size={24} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">No Photo Evidence Attached Yet</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
                  Start the device camera to capture multi-angle evidence with live preview, or upload photos from your device storage.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => startLiveCamera()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera size={14} />
                  <span>Start Device Camera</span>
                </button>
                <button
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon size={14} />
                  <span>Select From Files</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Responsive Thumbnails Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {photos.map((photo, index) => {
                  const isSelected = selectedPhotoIndex === index;
                  const hasAI = !!photo.aiAnalysis;

                  return (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all border-2 group shadow-xs ${
                        isSelected 
                          ? 'border-blue-600 ring-2 ring-blue-500/30 scale-102' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Photo Badge Indicators */}
                      <div className="absolute top-1 start-1 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-black/70 text-white text-[9px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        {hasAI && (
                          <span className="p-0.5 rounded bg-blue-600 text-white shadow-xs" title="AI analyzed">
                            <Sparkles size={9} />
                          </span>
                        )}
                        {photo.voiceNote && (
                          <span className="p-0.5 rounded bg-red-600 text-white shadow-xs" title="Has voice note">
                            <Mic size={9} />
                          </span>
                        )}
                      </div>

                      {/* Quick Fullscreen Preview Icon on Hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxPhoto(photo);
                          setIsLightboxOpen(true);
                        }}
                        className="absolute bottom-1 start-1 p-1 rounded-md bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Preview Fullscreen"
                      >
                        <ZoomIn size={11} />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                        className="absolute top-1 end-1 p-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Delete photo"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}

                {/* Add Photo Trigger Tile */}
                <button
                  onClick={() => {
                    if (!isLiveCameraActive) {
                      startLiveCamera();
                    } else {
                      captureLivePhoto();
                    }
                  }}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 text-slate-500 hover:text-blue-600 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Capture more photos"
                >
                  <Camera size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                </button>
              </div>

              {/* Selected Photo Focus Card */}
              {activePhoto && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    
                    {/* Image Preview with Lightbox Trigger */}
                    <div className="relative w-full md:w-64 h-48 md:h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 group">
                      <img
                        src={activePhoto.url}
                        alt="Selected evidence"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setLightboxPhoto(activePhoto);
                          setIsLightboxOpen(true);
                        }}
                        className="absolute bottom-2 end-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View Fullscreen Preview"
                      >
                        <ZoomIn size={13} />
                        <span>Preview</span>
                      </button>

                      {activePhoto.gps && (
                        <div className="absolute top-2 start-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <MapPin size={10} />
                          <span>{activePhoto.gps.lat}, {activePhoto.gps.lng}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Controls */}
                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Photo #{selectedPhotoIndex + 1} Details
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-mono">
                              {new Date(activePhoto.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleDeletePhoto(activePhoto.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1 transition-colors"
                            >
                              <Trash2 size={11} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Caption Input */}
                        <div className="mt-1">
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Caption / Specific Location
                          </label>
                          <input
                            type="text"
                            value={activePhoto.caption || ''}
                            onChange={(e) => handleUpdateCaption(activePhoto.id, e.target.value)}
                            placeholder="e.g. Scaffolding Level 2 near Reactor 101 discharge line..."
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* FEATURE 2: Voice Narration Attached to this Photo */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <Mic size={12} className="text-red-500" />
                            Voice Narration for this Photo
                          </label>
                          <VoiceDictationButton
                            size="sm"
                            onTranscript={(text) => handleAttachPhotoVoiceNote(activePhoto.id, text)}
                          />
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 min-h-[38px] flex items-center justify-between">
                          <span className={activePhoto.voiceNote ? 'text-slate-900' : 'text-slate-400 italic'}>
                            {activePhoto.voiceNote || 'No voice note recorded for this photo. Tap mic above to dictate.'}
                          </span>
                          {activePhoto.voiceNote && (
                            <button
                              onClick={() => handleAttachPhotoVoiceNote(activePhoto.id, '')}
                              className="text-slate-400 hover:text-red-500 p-1"
                              title="Clear voice note"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* FEATURE 3: AI HAZARD IDENTIFICATION CARD FOR SELECTED PHOTO */}
                  <AIHazardAnalysisCard
                    photo={activePhoto}
                    analysis={activePhoto.aiAnalysis}
                    isLoading={analyzingPhotoId === activePhoto.id}
                    onAnalyze={() => handleAnalyzePhoto(activePhoto)}
                    onUpdateAnalysis={async (updated) => {
                      const updatedPhotos = photos.map(p => p.id === activePhoto.id ? { ...p, aiAnalysis: updated } : p);
                      setPhotos(updatedPhotos);
                      await persistChanges(updatedPhotos, inspectionNotes);
                    }}
                    onCreateNCR={handleCreateNCR}
                    onAddObservation={handleAddObservation}
                    onCreateCapa={handleCreateCapa}
                    onApplyNarrative={handleApplyNarrative}
                  />

                </div>
              )}

            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FEATURE 2: VOICE DESCRIPTION & OVERALL INSPECTION OBSERVATIONS             */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                Inspector Observations & Field Narrative
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dictate by voice (English or Arabic) or type free-text field findings
              </p>
            </div>

            {/* Voice Dictation Control with Live Speech & Gemini fallback */}
            <VoiceDictationButton
              size="md"
              buttonLabel="Dictate Finding"
              onTranscript={(text) => {
                const combined = inspectionNotes ? `${inspectionNotes} ${text}` : text;
                setInspectionNotes(combined);
                persistChanges(photos, combined);
              }}
            />
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={inspectionNotes}
              onChange={(e) => {
                setInspectionNotes(e.target.value);
                persistChanges(photos, e.target.value);
              }}
              placeholder="Record general inspection observations, housekeeping conditions, contractor compliance, or dictate using the microphone button above..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Changes persist automatically to encrypted offline storage.</span>
            <span className="font-mono">{inspectionNotes.length} characters</span>
          </div>
        </div>

        {/* Dynamic Inspection Checklist Form Data & Digital Signatures */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Dynamic Checklist Responses</span>
              </h3>
              {record.data?.regulatoryStandard && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Governed by: <span className="font-bold text-slate-700">{record.data.regulatoryStandard}</span>
                </p>
              )}
            </div>
            {record.data?.category && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                {record.data.category}
              </span>
            )}
          </div>

          {/* Form Answers (Text & Booleans) */}
          {record.data?.answers && Object.keys(record.data.answers).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(record.data.answers).map(([key, val]) => {
                const isPass = val === 'PASS' || val === 'Compliant' || val === 'Yes';
                const isFail = val === 'FAIL' || val === 'Deficient' || val === 'No';
                const isNA = val === 'NA' || val === 'N/A';

                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs gap-2">
                    <span className="font-bold text-slate-700">{key.replace(/^(item-|q\d+[-_]?)/, '').replace(/[-_]/g, ' ')}:</span>
                    {isPass ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
                        ✓ Pass / Compliant
                      </span>
                    ) : isFail ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-red-100 text-red-800 border border-red-300 w-fit">
                        ✕ Fail / Deficient
                      </span>
                    ) : isNA ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-slate-200 text-slate-700 w-fit">
                        N/A
                      </span>
                    ) : (
                      <span className="text-slate-900 font-medium bg-white px-3 py-1 rounded-lg border border-slate-200">
                        {String(val)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {Object.keys(record.data || {})
                .filter(k => !['photos', 'observations', 'inspectorNotes', 'notes', 'signatures', 'answers', 'templateId', 'templateName', 'category', 'regulatoryStandard'].includes(k))
                .map(key => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-slate-900 font-medium">{String(record.data[key])}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Captured Digital Signatures */}
          {record.data?.signatures && Object.keys(record.data.signatures).length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <PenTool size={13} className="text-indigo-600" />
                <span>Authorized Digital Sign-offs</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(record.data.signatures).map(([key, sigUrl]) => (
                  <div key={key} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 capitalize">
                        {key.replace(/^(item-|q\d+[-_]?)/, '').replace(/[-_]/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified Signature
                      </span>
                    </div>
                    <div className="h-24 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                      {typeof sigUrl === 'string' && sigUrl.startsWith('data:image') ? (
                        <img src={sigUrl} alt="Inspector signature" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs font-mono text-slate-400">Electronic Sign-off Recorded</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Statutory Formal PDF Report Generator Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 text-white shadow-md border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Statutory Output
              </span>
              <span className="text-xs text-slate-400 font-mono">ISO 45001 / GCC HSE Standard</span>
            </div>
            <h4 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
              <FileText size={16} className="text-emerald-400" />
              Formal HSE Inspection Audit PDF Report
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Generates a printable A4 PDF compliance document with timestamped metadata, GPS coordinates, checklist findings, annotated photographic evidence, and verified digital signatures.
            </p>
          </div>
          <button
            onClick={handleDownloadPdfReport}
            disabled={isExportingPdf}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isExportingPdf ? (
              <>
                <RefreshCw size={16} className="animate-spin text-slate-950" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} className="text-slate-950" />
                <span>Download Formal PDF Report</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Feature 1 Camera Capture Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onPhotosCaptured={handlePhotosCaptured}
          uploaderName={currentUser?.name || 'Field Inspector'}
          parentRecordId={record.id}
          parentRecordType="Inspection"
        />
      )}

      {/* Lightbox Modal for Full-Screen Review */}
      {isLightboxOpen && lightboxPhoto && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-white pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Photo Evidence High-Res Lightbox</span>
              {lightboxPhoto.gps && (
                <span className="text-[10px] font-mono text-emerald-400 bg-white/10 px-2 py-0.5 rounded">
                  GPS: {lightboxPhoto.gps.lat}, {lightboxPhoto.gps.lng}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setIsLightboxOpen(false);
                setLightboxPhoto(null);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 min-h-0">
            <img
              src={lightboxPhoto.url}
              alt="Expanded preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          <div className="max-w-xl mx-auto w-full pt-2 text-white text-xs space-y-1 text-center">
            {lightboxPhoto.caption && (
              <p className="font-bold">{lightboxPhoto.caption}</p>
            )}
            {lightboxPhoto.voiceNote && (
              <p className="text-blue-300 italic">"{lightboxPhoto.voiceNote}"</p>
            )}
            <p className="text-[10px] text-slate-400">
              Captured {new Date(lightboxPhoto.timestamp).toLocaleString()} by {lightboxPhoto.uploader || 'Inspector'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
export default InspectionDetail;
