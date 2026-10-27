import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SyncStatusBar } from './SyncStatusBar';
import { InspectionChecklist } from './InspectionChecklist';
import { InspectionDetail } from './InspectionDetail';
import { ConflictResolver } from './ConflictResolver';
import { InspectionRecord, offlineStorage } from '../../services/offlineStorage';
import { HeatmapLayer, HeatmapMetric, METRIC_CONFIGS, METRIC_GRADIENTS } from './HeatmapLayer';
import { ImageAnnotationTool } from './ImageAnnotationTool';
import { InspectionTemplateBuilder } from './InspectionTemplateBuilder';
import { 
  Plus, ListChecks, MapPin, ChevronRight, AlertTriangle, Camera, Zap,
  Layers, RefreshCw, Eye, CheckCircle2, SlidersHorizontal, Info, ShieldCheck, Flame,
  SwitchCamera, X, Check, Image as ImageIcon, RotateCcw, Sparkles,
  Tag, Search, Filter, Cpu, Bot, Download
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DeviceIntegration } from '../../utils/deviceIntegration';
import { InspectionPdfReportService } from '../../services/inspectionPdfReportService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d * 1000;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export const MobileInspectionApp: React.FC = () => {
  const { dir } = useLanguage();
  const [view, setView] = useState<'LIST' | 'INSPECT' | 'DETAIL' | 'TEMPLATE_BUILDER'>('LIST');
  const [selectedInspectionTemplateId, setSelectedInspectionTemplateId] = useState<string | undefined>(undefined);
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [pdfDownloadingId, setPdfDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      pos => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => console.warn(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const nearbyPendingRecord = React.useMemo(() => {
    if (!userLoc) return null;
    const pendingRecords = inspections.filter(i => i.status === 'PENDING_SYNC' && i.location);
    for (const record of pendingRecords) {
      if (record.location) {
        const dist = getDistanceInMeters(userLoc.lat, userLoc.lng, record.location.lat, record.location.lng);
        if (dist <= 500) return record;
      }
    }
    return null;
  }, [userLoc, inspections]);


  const loadInspections = async () => {
    const list = await offlineStorage.getAllInspections();
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setInspections(list);
    
    // Update selected record if open
    if (selectedRecord) {
       const updated = list.find(i => i.id === selectedRecord.id);
       if (updated) setSelectedRecord(updated);
    }
  };

  useEffect(() => {
    loadInspections();
    // Poll for updates in case sync completes
    const interval = setInterval(loadInspections, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = () => {
    setView('LIST');
    loadInspections();
  };

  const handleViewDetail = (record: InspectionRecord) => {
    setSelectedRecord(record);
    setView('DETAIL');
  };

  // ==========================================
  // NATIVE CAMERA CAPTURE FOR INSPECTION EVIDENCE
  // ==========================================
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraTargetRecord, setCameraTargetRecord] = useState<InspectionRecord | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedCaption, setCapturedCaption] = useState<string>('');
  const [compressionStats, setCompressionStats] = useState<{ originalKb: number; compressedKb: number; savingsPct: number } | null>(null);
  const [isCompressingAndSaving, setIsCompressingAndSaving] = useState(false);
  const [capturedFlash, setCapturedFlash] = useState(false);
  const [cameraToast, setCameraToast] = useState<{ title: string; subtitle?: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackFileInputRef = useRef<HTMLInputElement>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { /* ignore */ }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCameraStream = useCallback(async (mode: 'environment' | 'user' = 'environment') => {
    stopCameraStream();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('WebRTC live camera streaming requires HTTPS or browser permission. You can still capture evidence using the native camera app below.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('[Camera] Autoplay caught:', e));
      }
      setIsStreaming(true);
    } catch (err: any) {
      console.warn('[Camera] getUserMedia failed:', err);
      setCameraError(err.message || 'Camera permission denied or camera device in use. Use system camera fallback below.');
      setIsStreaming(false);
    }
  }, [stopCameraStream]);

  const openNativeCamera = (record?: InspectionRecord) => {
    setCameraTargetRecord(record || null);
    setCapturedPreview(null);
    setCapturedCaption('');
    setCompressionStats(null);
    setIsCameraModalOpen(true);
    startCameraStream(facingMode);
  };

  const closeNativeCamera = () => {
    stopCameraStream();
    setIsCameraModalOpen(false);
    setCapturedPreview(null);
    setCameraTargetRecord(null);
    setCompressionStats(null);
    setIsCompressingAndSaving(false);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCameraStream(nextMode);
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      setCapturedFlash(true);
      setTimeout(() => setCapturedFlash(false), 200);

      stopCameraStream();
      setCapturedPreview(dataUrl);
    } catch (err) {
      console.error('[Camera] Capture frame error:', err);
    }
  };

  const handleNativeFallbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedPreview(reader.result as string);
      stopCameraStream();
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setCompressionStats(null);
    startCameraStream(facingMode);
  };

  const handleSaveCapturedEvidence = async (annotatedDataUrl?: string, customCaption?: string, tags?: string[]) => {
    const photoToSave = annotatedDataUrl || capturedPreview;
    if (!photoToSave) return;
    setIsCompressingAndSaving(true);

    try {
      let targetId = cameraTargetRecord?.id;
      if (!targetId) {
        const activeDraft = inspections.find(i => i.status === 'DRAFT');
        targetId = activeDraft ? activeDraft.id : `INSP-${Date.now().toString().slice(-6)}`;
      }

      const finalCaption = (customCaption !== undefined ? customCaption : capturedCaption).trim() || undefined;

      const result = await DeviceIntegration.compressAndStoreInspectionPhoto(
        targetId,
        photoToSave,
        {
          caption: finalCaption,
          tags: tags && tags.length > 0 ? tags : undefined,
          location: userLoc || undefined
        }
      );

      setCompressionStats({
        originalKb: result.originalSizeKb,
        compressedKb: result.compressedSizeKb,
        savingsPct: result.savingsPct
      });

      const tagsLabel = tags && tags.length > 0 ? ` • ML Tags: ${tags.slice(0, 3).join(', ')}` : '';
      setCameraToast({
        title: 'Evidence Auto-Tagged & Stored Offline',
        subtitle: `TensorFlow.js Edge ML: ${result.originalSizeKb} KB → ${result.compressedSizeKb} KB (${result.savingsPct}% saved)${tagsLabel}`
      });
      setTimeout(() => setCameraToast(null), 5000);

      await loadInspections();
      closeNativeCamera();
    } catch (err: any) {
      console.error('[Camera] Error saving evidence:', err);
      alert(err.message || 'Failed to compress and save evidence into offline database.');
    } finally {
      setIsCompressingAndSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  const handleQuickPhoto = async (record: InspectionRecord, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCameraTargetRecord(record);
      setCapturedPreview(reader.result as string);
      setIsCameraModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleUrgent = async (record: InspectionRecord) => {
    const isCurrentlyUrgent = record.priority === 'URGENT';
    await offlineStorage.setInspectionUrgentPriority(record.id, !isCurrentlyUrgent);
    loadInspections();
  };

  const [heatmapMetric, setHeatmapMetric] = useState<HeatmapMetric>('DENSITY');
  const [showLegend, setShowLegend] = useState(true);

  // Compute weighted heatmap points based on selected visualization metric
  const heatmapPoints = React.useMemo(() => {
    return inspections
      .filter(i => i.location && typeof i.location.lat === 'number' && typeof i.location.lng === 'number')
      .map(i => {
        let intensity = 1.0;
        if (heatmapMetric === 'URGENCY') {
          // Urgent priority gets maximum 1.0; normal gets 0.25
          intensity = i.priority === 'URGENT' ? 1.0 : 0.25;
        } else if (heatmapMetric === 'SYNC_STATUS') {
          // Conflict = 1.0, Pending sync = 0.8, Draft = 0.5, Synced = 0.15
          switch (i.status) {
            case 'CONFLICT': intensity = 1.0; break;
            case 'PENDING_SYNC': intensity = 0.8; break;
            case 'DRAFT': intensity = 0.5; break;
            case 'SYNCED': intensity = 0.15; break;
            default: intensity = 0.3;
          }
        } else if (heatmapMetric === 'RISK_SCORE') {
          // Non-conformance & defect severity
          const answers = i.data?.answers || {};
          const failedCount = Object.values(answers).filter((v: any) => v === 'NO' || v === 'FAIL' || v === false).length;
          intensity = failedCount > 0 ? Math.min(1.0, 0.4 + failedCount * 0.3) : 0.2;
        } else {
          // DENSITY: baseline equal weight
          intensity = 1.0;
        }
        return [i.location!.lat, i.location!.lng, intensity] as [number, number, number];
      });
  }, [inspections, heatmapMetric]);

  const mapCenter = inspections.find(i => i.location)?.location || { lat: 24.1107, lng: 52.7306 };

  // LIST VIEW
  const draftCount = inspections.filter(i => i.status === 'DRAFT').length;
  const pendingCount = inspections.filter(i => i.status === 'PENDING_SYNC').length;
  const urgentCount = inspections.filter(i => i.status === 'PENDING_SYNC' && i.priority === 'URGENT').length;
  const syncedCount = inspections.filter(i => i.status === 'SYNCED').length;

  // ML Keyword & Tag Search Filtering in Offline Database
  const [tagSearchQuery, setTagSearchQuery] = useState<string>('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');

  // Extract all unique tags present across offline records and photos
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    ['scaffolding', 'PPE', 'corrosion', 'electrical', 'work at height'].forEach(t => tagSet.add(t));
    
    inspections.forEach(record => {
      if (Array.isArray(record.data?.tags)) {
        record.data.tags.forEach((t: string) => {
          if (t && typeof t === 'string') tagSet.add(t.toLowerCase().trim());
        });
      }
      if (Array.isArray(record.data?.photos)) {
        record.data.photos.forEach((p: any) => {
          if (Array.isArray(p?.tags)) {
            p.tags.forEach((t: string) => {
              if (t && typeof t === 'string') tagSet.add(t.toLowerCase().trim());
            });
          }
        });
      }
    });
    return Array.from(tagSet).filter(Boolean);
  }, [inspections]);

  // Filtered records matching search query and active tag filter
  const filteredInspections = React.useMemo(() => {
    return inspections.filter(record => {
      if (record.status === 'CONFLICT') return false;

      // Tag filter
      if (selectedTagFilter !== 'ALL') {
        const recordTags: string[] = [
          ...(Array.isArray(record.data?.tags) ? record.data.tags : []),
          ...(Array.isArray(record.data?.photos) ? record.data.photos.flatMap((p: any) => p?.tags || []) : [])
        ].map(t => (typeof t === 'string' ? t.toLowerCase() : ''));

        const matchesTag = recordTags.some(t => t.includes(selectedTagFilter.toLowerCase()));
        if (!matchesTag) return false;
      }

      // Query search
      if (tagSearchQuery.trim()) {
        const query = tagSearchQuery.toLowerCase().trim();
        const inId = record.id.toLowerCase().includes(query);
        const inTemplate = (record.templateId || '').toLowerCase().includes(query);
        const inCaption = (record.data?.photoDetails?.caption || '').toLowerCase().includes(query);
        const recordTags = [
          ...(Array.isArray(record.data?.tags) ? record.data.tags : []),
          ...(Array.isArray(record.data?.photos) ? record.data.photos.flatMap((p: any) => p?.tags || []) : [])
        ].map(t => (typeof t === 'string' ? t.toLowerCase() : ''));
        const inTags = recordTags.some(t => t.includes(query));
        return inId || inTemplate || inCaption || inTags;
      }

      return true;
    });
  }, [inspections, selectedTagFilter, tagSearchQuery]);

  return (
    <div className={`flex flex-col h-full relative overflow-hidden ${dir === 'rtl' ? 'rtl font-arabic' : 'ltr font-sans'}`}>
       {/* List view and map wrapper */}
       <div className={`flex flex-col h-full transition-all duration-300 ${view !== 'LIST' ? 'pointer-events-none opacity-40 blur-[1px]' : ''}`}>
          <SyncStatusBar />
          
          <AnimatePresence>
            {cameraToast && (
              <motion.div 
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                className="mx-6 mt-4 p-4 bg-emerald-50/95 backdrop-blur-md border border-emerald-200 rounded-2xl shadow-xl flex items-start gap-3 z-50"
              >
                 <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-sm shrink-0">
                    <CheckCircle2 size={18} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="text-emerald-950 font-black text-xs uppercase tracking-wider">{cameraToast.title}</h4>
                    {cameraToast.subtitle && (
                      <p className="text-emerald-800/90 text-xs font-semibold mt-0.5 leading-relaxed">{cameraToast.subtitle}</p>
                    )}
                 </div>
                 <button 
                   onClick={() => setCameraToast(null)} 
                   className="p-1 text-emerald-600 hover:text-emerald-900 rounded-lg hover:bg-emerald-100 transition-colors"
                 >
                   <X size={15} />
                 </button>
              </motion.div>
            )}

            {nearbyPendingRecord && view === 'LIST' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-lg flex items-start gap-3 z-50 cursor-pointer"
                onClick={() => handleViewDetail(nearbyPendingRecord)}
              >
                 <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                    <AlertTriangle size={20} />
                 </div>
                 <div>
                    <h4 className="text-amber-800 font-black text-sm uppercase tracking-tight">Nearby Pending Record</h4>
                    <p className="text-amber-700/80 text-xs font-bold mt-1">You are within 500m of an unsynced inspection ({nearbyPendingRecord.templateId}). Tap to review.</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          
          <div className="p-6 pb-24 overflow-y-auto h-full">
             <div className="flex items-center justify-between gap-3 mb-6">
               <div>
                 <h1 className="text-2xl font-black text-slate-800 tracking-tight">Field Inspections</h1>
                 <p className="text-xs font-medium text-slate-500">Offline PWA with compressed photo evidence</p>
               </div>
               <div className="flex items-center gap-2 shrink-0">
                 <button
                   type="button"
                   onClick={() => setView('TEMPLATE_BUILDER')}
                   className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
                   title="Open dynamic checklist template builder"
                 >
                   <SlidersHorizontal size={14} className="text-indigo-600" />
                   <span className="hidden sm:inline">Template Builder</span>
                   <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.2 rounded border border-indigo-200">
                     Admin
                   </span>
                 </button>
                 <button
                   type="button"
                   onClick={() => openNativeCamera()}
                   className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 active:scale-95 transition-all shrink-0"
                   title="Open native camera for field evidence"
                 >
                   <Camera size={15} />
                   <span>Evidence Camera</span>
                 </button>
               </div>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col items-center justify-center">
                   <span className="text-2xl font-black text-indigo-600">{pendingCount}</span>
                   <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-1 text-center">Pending</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col items-center justify-center">
                   <span className="text-2xl font-black text-amber-600">{urgentCount}</span>
                   <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1 text-center flex items-center gap-1">
                     <Zap size={10} className="fill-amber-600" /> Urgent Queue
                   </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center justify-center">
                   <span className="text-2xl font-black text-emerald-600">{syncedCount}</span>
                   <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-1 text-center">Synced</span>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center">
                   <span className="text-2xl font-black text-slate-600">{draftCount}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 text-center">Drafts</span>
                </div>
             </div>

             {inspections.some(i => i.location) && (
               <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                  {/* Heatmap Visualization Metric Controls */}
                  <div className="p-3.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                     <div>
                        <div className="flex items-center gap-2">
                           <MapPin size={15} className="text-blue-600" />
                           <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                              GIS Spatial Analytics
                           </span>
                           <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-200/70">
                              {heatmapPoints.length} Geotagged Records
                           </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                           {METRIC_CONFIGS[heatmapMetric].description}
                        </p>
                     </div>

                     {/* Segmented Metric Switcher Controls */}
                     <div className="flex items-center p-1 bg-slate-200/70 rounded-xl gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setHeatmapMetric('DENSITY')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            heatmapMetric === 'DENSITY'
                              ? 'bg-white text-blue-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="View overall inspection density"
                        >
                          <Layers size={13} className={heatmapMetric === 'DENSITY' ? 'text-blue-600' : 'text-slate-400'} />
                          <span>Density</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setHeatmapMetric('URGENCY')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            heatmapMetric === 'URGENCY'
                              ? 'bg-white text-amber-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="View urgency priority clusters"
                        >
                          <Zap size={13} className={heatmapMetric === 'URGENCY' ? 'text-amber-600 fill-amber-500' : 'text-slate-400'} />
                          <span>Urgency Level</span>
                          {urgentCount > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setHeatmapMetric('SYNC_STATUS')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            heatmapMetric === 'SYNC_STATUS'
                              ? 'bg-white text-indigo-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="View offline sync state & backlog"
                        >
                          <RefreshCw size={13} className={heatmapMetric === 'SYNC_STATUS' ? 'text-indigo-600' : 'text-slate-400'} />
                          <span>Sync Status</span>
                          {pendingCount > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setHeatmapMetric('RISK_SCORE')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            heatmapMetric === 'RISK_SCORE'
                              ? 'bg-white text-red-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="View defect & risk severity hotspots"
                        >
                          <AlertTriangle size={13} className={heatmapMetric === 'RISK_SCORE' ? 'text-red-600' : 'text-slate-400'} />
                          <span>Risk Score</span>
                        </button>
                     </div>
                  </div>

                  {/* Leaflet Heatmap Canvas */}
                  <div className="h-64 sm:h-72 w-full relative z-0">
                     <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={13} className="h-full w-full">
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <HeatmapLayer 
                          points={heatmapPoints}
                          metric={heatmapMetric}
                          radius={30}
                          blur={20}
                        />
                        {inspections.filter(i => i.location).map(record => {
                          const isUrgent = record.priority === 'URGENT';
                          return (
                            <Marker key={record.id} position={[record.location!.lat, record.location!.lng]}>
                               <Popup>
                                  <div className="p-1 min-w-[190px]">
                                     <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-slate-900 truncate">
                                           {record.templateId}
                                        </span>
                                        {isUrgent ? (
                                           <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                                              Urgent
                                           </span>
                                        ) : (
                                           <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-bold">
                                              Normal
                                           </span>
                                        )}
                                     </div>

                                     <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                                        <span>Status:</span>
                                        <span className={`font-bold ${
                                           record.status === 'SYNCED' ? 'text-emerald-600' :
                                           record.status === 'PENDING_SYNC' ? 'text-indigo-600' :
                                           record.status === 'CONFLICT' ? 'text-red-600' : 'text-slate-600'
                                        }`}>
                                           {record.status}
                                        </span>
                                     </div>

                                     <div className="text-[10px] text-slate-400 mt-0.5">
                                        {new Date(record.updatedAt).toLocaleString()}
                                     </div>

                                     <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <button
                                           type="button"
                                           onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleUrgent(record);
                                           }}
                                           className="text-[10px] font-bold text-amber-700 hover:text-amber-900 underline"
                                        >
                                           {isUrgent ? 'Downgrade Priority' : 'Flag as Urgent'}
                                        </button>
                                        <button
                                           type="button"
                                           onClick={() => handleViewDetail(record)}
                                           className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                                        >
                                           Open Details →
                                        </button>
                                     </div>
                                  </div>
                               </Popup>
                            </Marker>
                          );
                        })}
                     </MapContainer>
                  </div>

                  {/* Dynamic Gradient Color Key / Legend Footer */}
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                           {METRIC_CONFIGS[heatmapMetric].shortLabel} Scale:
                        </span>
                        <div className="flex items-center gap-3">
                           {METRIC_CONFIGS[heatmapMetric].legend.map((stop, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                 <span 
                                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                                    style={{ backgroundColor: stop.color }}
                                 />
                                 <span className="text-[11px] font-medium text-slate-600">
                                    {stop.label}
                                 </span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="text-[10px] text-slate-400 font-medium">
                        Active metric: <span className="font-bold text-slate-700">{METRIC_CONFIGS[heatmapMetric].label}</span>
                     </div>
                  </div>
               </div>
             )}
             
             {/* TensorFlow.js ML Tag & Offline Database Search Bar */}
             <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
               <div className="flex items-center gap-2">
                 <div className="relative flex-1">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input
                     type="text"
                     value={tagSearchQuery}
                     onChange={(e) => setTagSearchQuery(e.target.value)}
                     placeholder="Search offline database by keyword, tag, or ID..."
                     className="w-full pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                   />
                   {tagSearchQuery && (
                     <button 
                       onClick={() => setTagSearchQuery('')}
                       className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                     >
                       <X size={13} />
                     </button>
                   )}
                 </div>
                 <div className="flex items-center gap-1.5 px-2.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-[11px] font-bold shrink-0">
                   <Bot size={13} className="text-indigo-600" />
                   <span>ML Auto-Tagger</span>
                 </div>
               </div>

               {/* Filter Tag Chips */}
               <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Filter:</span>
                 <button
                   type="button"
                   onClick={() => setSelectedTagFilter('ALL')}
                   className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                     selectedTagFilter === 'ALL'
                       ? 'bg-indigo-600 text-white shadow-xs'
                       : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                   }`}
                 >
                   All ({inspections.filter(i => i.status !== 'CONFLICT').length})
                 </button>
                 {availableTags.map(tag => {
                   const count = inspections.filter(i => {
                     const tags = [
                       ...(Array.isArray(i.data?.tags) ? i.data.tags : []),
                       ...(Array.isArray(i.data?.photos) ? i.data.photos.flatMap((p: any) => p?.tags || []) : [])
                     ].map(t => (typeof t === 'string' ? t.toLowerCase() : ''));
                     return tags.some(t => t.includes(tag.toLowerCase()));
                   }).length;

                   return (
                     <button
                       key={tag}
                       type="button"
                       onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? 'ALL' : tag)}
                       className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                         selectedTagFilter === tag
                           ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                           : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                       }`}
                     >
                       <Tag size={10} className={selectedTagFilter === tag ? 'text-white' : 'text-indigo-500'} />
                       <span>{tag}</span>
                       {count > 0 && (
                         <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                           selectedTagFilter === tag ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                         }`}>
                           {count}
                         </span>
                       )}
                     </button>
                   );
                 })}
               </div>
             </div>
             
             <div className="space-y-4">
               {inspections.filter(i => i.status === 'CONFLICT').map(record => (
                  <ConflictResolver key={record.id} record={record} onResolved={loadInspections} />
               ))}

               {filteredInspections.length === 0 && (
                  <div className="text-center py-12 text-slate-400 font-bold flex flex-col items-center glass-card rounded-2xl border border-slate-200/80 p-8">
                     <ListChecks size={42} className="mb-3 opacity-40 text-slate-500" />
                     <p className="text-sm text-slate-700 font-bold">No offline records match the selected tag or search.</p>
                     <button
                       onClick={() => { setSelectedTagFilter('ALL'); setTagSearchQuery(''); }}
                       className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors"
                     >
                       Clear Filters & Show All
                     </button>
                  </div>
               )}

               {filteredInspections.map(record => (
                  <div 
                     key={record.id} 
                     className="w-full glass-card p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2 hover:border-indigo-300 transition-colors group relative"
                   >
                     <div className="flex items-center justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => handleViewDetail(record)}>
                           <div className="font-bold text-slate-800">{record.templateId}</div>
                           <div className="text-xs text-slate-500">{new Date(record.updatedAt).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div>
                              {record.status === 'SYNCED' && <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Synced</span>}
                              {record.status === 'PENDING_SYNC' && <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Pending</span>}
                              {record.status === 'DRAFT' && <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Draft</span>}
                           </div>
                           <button 
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  setPdfDownloadingId(record.id);
                                  await InspectionPdfReportService.downloadInspectionPdf(record);
                                } catch (err: any) {
                                  alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
                                } finally {
                                  setPdfDownloadingId(null);
                                }
                              }}
                              disabled={pdfDownloadingId === record.id}
                              className="p-2 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-full transition-all text-slate-700 hover:text-slate-950 shadow-xs cursor-pointer disabled:opacity-50" 
                              title="Download Formal PDF Report"
                           >
                              {pdfDownloadingId === record.id ? (
                                <RefreshCw size={15} className="animate-spin text-emerald-600" />
                              ) : (
                                <Download size={15} />
                              )}
                           </button>
                           <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openNativeCamera(record);
                              }}
                              className="p-2 bg-indigo-50 hover:bg-indigo-100 active:scale-95 rounded-full transition-all text-indigo-600 shadow-xs" 
                              title="Capture Evidence Photo"
                           >
                              <Camera size={15} />
                           </button>
                           <ChevronRight size={18} className="text-slate-400 cursor-pointer" onClick={() => handleViewDetail(record)} />
                        </div>
                     </div>
                     {record.location && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1 cursor-pointer" onClick={() => handleViewDetail(record)}>
                           <MapPin size={12} className="text-indigo-400" />
                           {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                        </div>
                     )}
                     
                     {/* Show miniature photo preview gallery if there are photos */}
                     {record.data?.photos && record.data.photos.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                           <div className="flex items-center justify-between gap-2 mb-1.5 cursor-pointer" onClick={() => handleViewDetail(record)}>
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                 <Camera size={12} className="text-indigo-500" />
                                 {record.data.photos.length} Offline Evidence Photo{record.data.photos.length !== 1 ? 's' : ''}
                              </span>
                              <span className="text-[9px] text-emerald-600 font-extrabold uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                                 Compressed
                              </span>
                           </div>
                           <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                              {record.data.photos.map((p: any, idx: number) => {
                                 const src = typeof p === 'string' ? p : (p?.data || p?.url);
                                 return (
                                    <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-xs">
                                       <img src={src} alt={p?.caption || 'Evidence photo'} className="w-full h-full object-cover" />
                                       {p?.compressedKb && (
                                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center font-mono py-0.2">
                                             {p.compressedKb}K
                                          </span>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {/* ML Auto-Tagger Suggested Keywords & Badges */}
                     {((record.data?.tags && record.data.tags.length > 0) || (record.data?.photoDetails?.tags && record.data.photoDetails.tags.length > 0)) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                           <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <Tag size={10} className="text-indigo-500" />
                              ML Tags:
                           </span>
                           {Array.from(new Set([
                              ...(Array.isArray(record.data?.tags) ? record.data.tags : []),
                              ...(Array.isArray(record.data?.photoDetails?.tags) ? record.data.photoDetails.tags : [])
                           ])).map((tag: string, idx: number) => (
                              <span 
                                 key={idx} 
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTagFilter(selectedTagFilter.toLowerCase() === tag.toLowerCase() ? 'ALL' : tag);
                                 }}
                                 className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors border ${
                                    selectedTagFilter.toLowerCase() === tag.toLowerCase()
                                       ? 'bg-indigo-600 text-white border-indigo-600'
                                       : 'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100'
                                 }`}
                                 title={`Filter offline records by #${tag}`}
                              >
                                 #{tag}
                              </span>
                           ))}
                        </div>
                     )}

                     {/* Urgent Sync Priority Queue Banner & Controller */}
                     {record.status === 'PENDING_SYNC' && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                           <div className="flex items-center gap-1.5 text-[11px]">
                              {record.priority === 'URGENT' ? (
                                 <span className="inline-flex items-center gap-1 text-amber-700 font-black bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300">
                                    <Zap size={11} className="fill-amber-600 text-amber-600" />
                                    <span>⚡ URGENT SYNC PRIORITY (Head of Queue)</span>
                                 </span>
                              ) : (
                                 <span className="text-slate-400 text-[10px] font-semibold">Standard Queue Order</span>
                              )}
                           </div>
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleToggleUrgent(record);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition shadow-sm ${
                                 record.priority === 'URGENT'
                                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                                    : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800'
                              }`}
                              title="Toggle Urgent Sync priority for immediate upload upon network recovery"
                           >
                              <Zap size={11} className={record.priority === 'URGENT' ? 'fill-white' : ''} />
                              <span>{record.priority === 'URGENT' ? 'Prioritized' : 'Flag Urgent'}</span>
                           </button>
                        </div>
                     )}
                  </div>
               ))}
             </div>
          </div>

          {/* Floating Action Button within Thumb Range */}
          <button 
            onClick={() => setView('INSPECT')}
            className="fixed bottom-6 end-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-700 transition-transform active:scale-90 z-50"
          >
             <Plus size={24} />
          </button>
       </div>

       {/* Framer Motion Overlay Panels with Exit Animations */}
       <AnimatePresence>
         {view === 'TEMPLATE_BUILDER' && (
           <motion.div
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.98 }}
             transition={{ type: 'spring', damping: 25, stiffness: 220 }}
             className="absolute inset-0 glass-card z-[100] flex flex-col"
           >
              <SyncStatusBar />
              <InspectionTemplateBuilder 
                onBack={() => setView('LIST')}
                onSelectTemplateToInspect={(tmplId) => {
                  setSelectedInspectionTemplateId(tmplId);
                  setView('INSPECT');
                }}
              />
           </motion.div>
         )}

         {view === 'INSPECT' && (
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 30 }}
             transition={{ type: 'spring', damping: 25, stiffness: 220 }}
             className="absolute inset-0 glass-card z-[100] flex flex-col"
           >
              <SyncStatusBar />
              <InspectionChecklist 
                initialTemplateId={selectedInspectionTemplateId}
                onCancel={() => setView('LIST')}
                onComplete={handleComplete} 
              />
           </motion.div>
         )}

         {view === 'DETAIL' && selectedRecord && (
           <motion.div
             initial={{ x: '100%', opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: '100%', opacity: 0 }}
             transition={{ type: 'spring', damping: 26, stiffness: 210 }}
             className="absolute inset-0 glass-card z-[100] flex flex-col"
           >
              <InspectionDetail 
                record={selectedRecord} 
                onBack={() => setView('LIST')} 
                onUpdate={loadInspections}
              />
           </motion.div>
         )}
       </AnimatePresence>

       {/* Native Camera Capture & Offline Compression Modal */}
       <input 
         type="file" 
         ref={fallbackFileInputRef} 
         accept="image/*" 
         capture="environment" 
         className="hidden" 
         onChange={handleNativeFallbackChange} 
       />

       <AnimatePresence>
         {isCameraModalOpen && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[250] bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden select-none font-sans"
           >
             {capturedPreview ? (
               <ImageAnnotationTool
                 imageSrc={capturedPreview}
                 onSave={handleSaveCapturedEvidence}
                 onRetake={handleRetake}
                 onClose={closeNativeCamera}
                 isSaving={isCompressingAndSaving}
                 initialCaption={capturedCaption}
                 targetRecordTitle={cameraTargetRecord ? `Target: ${cameraTargetRecord.templateId}` : undefined}
               />
             ) : (
               <>
                 {/* Flash Effect Animation */}
                 {capturedFlash && (
                   <div className="absolute inset-0 bg-white z-[300] pointer-events-none animate-pulse" />
                 )}

                 {/* Modal Header */}
                 <div className="p-4 pt-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20">
                   <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                       <Camera size={18} />
                     </div>
                     <div>
                       <h3 className="text-white font-black text-sm tracking-wide flex items-center gap-2">
                         <span>Evidence Camera</span>
                         <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                           Offline DB
                         </span>
                       </h3>
                       <p className="text-slate-400 text-[11px] truncate max-w-[200px] sm:max-w-xs">
                         {cameraTargetRecord ? `Target: ${cameraTargetRecord.templateId}` : "Active Field Evidence"}
                       </p>
                     </div>
                   </div>

                   <div className="flex items-center gap-2">
                     <button
                       type="button"
                       onClick={toggleFacingMode}
                       className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all active:scale-90"
                       title="Switch Front/Rear Camera"
                     >
                       <SwitchCamera size={18} />
                     </button>
                     <button
                       type="button"
                       onClick={closeNativeCamera}
                       className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all active:scale-90"
                       title="Close Camera"
                     >
                       <X size={18} />
                     </button>
                   </div>
                 </div>

                 {/* Viewfinder Canvas Area */}
                 <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
                   <div className="relative w-full max-w-md aspect-[3/4] sm:aspect-[4/3] rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
                     {/* Live Video Stream */}
                     <video
                       ref={videoRef}
                       autoPlay
                       playsInline
                       muted
                       className="w-full h-full object-cover"
                     />

                     {/* Framing Reticle Overlays */}
                     <div className="absolute inset-6 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                       <div className="flex justify-between items-start">
                         <div className="w-6 h-6 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg" />
                         <div className="w-6 h-6 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg" />
                       </div>
                       <div className="flex items-center justify-center opacity-40">
                         <div className="w-8 h-8 rounded-full border border-dashed border-white" />
                       </div>
                       <div className="flex justify-between items-end">
                         <div className="w-6 h-6 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg" />
                         <div className="w-6 h-6 border-b-2 border-r-2 border-indigo-400 rounded-br-lg" />
                       </div>
                     </div>

                     {/* Geotag & Time Badge Overlay */}
                     <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[10px] text-white/80 font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                       <div className="flex items-center gap-1.5">
                         <MapPin size={11} className="text-indigo-400" />
                         <span>{userLoc ? `${userLoc.lat.toFixed(4)}, ${userLoc.lng.toFixed(4)}` : "Geotagging Ready"}</span>
                       </div>
                       <span>{new Date().toLocaleTimeString()}</span>
                     </div>

                     {/* Fallback & Permission Warning Overlay */}
                     {cameraError && (
                       <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center z-30">
                         <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
                           <AlertTriangle size={28} />
                         </div>
                         <h4 className="text-white font-bold text-sm mb-1">Direct Stream Unavailable</h4>
                         <p className="text-slate-400 text-xs max-w-xs mb-4 leading-relaxed">
                           {cameraError}
                         </p>
                         <button
                           type="button"
                           onClick={() => fallbackFileInputRef.current?.click()}
                           className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                         >
                           <Camera size={16} />
                           <span>Open Device Camera</span>
                         </button>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Modal Bottom Action Controls */}
                 <div className="p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-around z-20">
                   <button
                     type="button"
                     onClick={() => fallbackFileInputRef.current?.click()}
                     className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors"
                     title="Select from gallery or device"
                   >
                     <div className="w-11 h-11 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                       <ImageIcon size={18} />
                     </div>
                     <span className="text-[10px] font-bold">Fallback</span>
                   </button>

                   {/* Primary Shutter Button */}
                   <button
                     type="button"
                     onClick={handleCaptureFrame}
                     className="w-20 h-20 rounded-full border-4 border-white/80 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-2xl shadow-indigo-600/30"
                     title="Capture Photo"
                   >
                     <div className="w-full h-full rounded-full bg-white transition-all shadow-inner" />
                   </button>

                   <button
                     type="button"
                     onClick={toggleFacingMode}
                     className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors"
                     title="Flip camera"
                   >
                     <div className="w-11 h-11 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                       <SwitchCamera size={18} />
                     </div>
                     <span className="text-[10px] font-bold">Flip</span>
                   </button>
                 </div>
               </>
             )}
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};
