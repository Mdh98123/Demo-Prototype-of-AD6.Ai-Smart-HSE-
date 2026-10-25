import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, X, RefreshCw, Check, AlertTriangle, Image as ImageIcon, 
  MapPin, Trash2, Maximize2, Shield, Eye
} from 'lucide-react';
import { PhotoEvidence } from '../../types/mediaTypes';
import { compressImageClientSide } from '../../utils/imageCompression';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosCaptured: (newPhotos: PhotoEvidence[]) => void;
  uploaderName?: string;
  parentRecordId?: string;
  parentRecordType?: 'Inspection' | 'Observation' | 'NCR' | 'Incident' | 'CAPA' | 'Audit';
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotosCaptured,
  uploaderName = 'Field Inspector',
  parentRecordId = '',
  parentRecordType = 'Inspection'
}) => {
  const [sessionPhotos, setSessionPhotos] = useState<PhotoEvidence[]>([]);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [frozenPreview, setFrozenPreview] = useState<string | null>(null);
  const [previewGps, setPreviewGps] = useState<{ lat: number; lng: number; accuracy?: number } | undefined>(undefined);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'acquired' | 'denied'>('idle');
  const [activePhotoPreview, setActivePhotoPreview] = useState<PhotoEvidence | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks cleanly
  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('[Camera] Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Acquire optional GPS coordinates if permitted
  const fetchGpsCoordinates = useCallback(async () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return undefined;
    }
    setGpsStatus('acquiring');
    return new Promise<{ lat: number; lng: number; accuracy?: number } | undefined>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy)
          };
          setGpsStatus('acquired');
          resolve(coords);
        },
        (err) => {
          console.warn('[GPS] Geolocation permission denied or unavailable:', err.message);
          setGpsStatus('denied');
          resolve(undefined);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    });
  }, []);

  // Initialize camera stream
  const initCamera = useCallback(async () => {
    stopTracks();
    setCameraError(null);

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser or requires an HTTPS context.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.warn('[Camera Error]', err);
      let errorMsg = 'Could not access device camera. Please check permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. You can still upload photos from your device gallery below.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera device found on this system.';
      }
      setCameraError(errorMsg);
      setIsStreaming(false);
    }
  }, [facingMode, stopTracks]);

  // Handle open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      initCamera();
      fetchGpsCoordinates().then(coords => setPreviewGps(coords));
    } else {
      stopTracks();
      setSessionPhotos([]);
      setFrozenPreview(null);
    }

    return () => {
      stopTracks();
    };
  }, [isOpen, initCamera, stopTracks, fetchGpsCoordinates]);

  // Switch camera facing mode
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from live video
  const takeLiveSnapshot = async () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      // Freeze frame momentarily for feedback
      setFrozenPreview(rawDataUrl);

      // Compress client-side to max 1600px and 0.8 JPEG quality
      const compressed = await compressImageClientSide(rawDataUrl, {
        maxDimension: 1600,
        quality: 0.8
      });

      const newPhoto: PhotoEvidence = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        url: compressed.dataUrl,
        timestamp: new Date().toISOString(),
        uploader: uploaderName,
        gps: previewGps,
        caption: '',
        linkage: {
          parentType: parentRecordType,
          parentId: parentRecordId
        }
      };

      setSessionPhotos(prev => [...prev, newPhoto]);
    } catch (err) {
      console.error('[Capture Error]', err);
    } finally {
      setIsCapturing(false);
      // Brief freeze then resume live view
      setTimeout(() => setFrozenPreview(null), 350);
    }
  };

  // Retake / discard last snapshot
  const retakeLastSnapshot = () => {
    setSessionPhotos(prev => prev.slice(0, -1));
    setFrozenPreview(null);
  };

  // Fallback: handle file input / gallery upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const added: PhotoEvidence[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressed = await compressImageClientSide(file, {
          maxDimension: 1600,
          quality: 0.8
        });

        added.push({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          url: compressed.dataUrl,
          timestamp: new Date().toISOString(),
          uploader: uploaderName,
          gps: previewGps,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          linkage: {
            parentType: parentRecordType,
            parentId: parentRecordId
          }
        });
      } catch (err) {
        console.error('[File Upload Error]', err);
      }
    }

    if (added.length > 0) {
      setSessionPhotos(prev => [...prev, ...added]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove photo from current session
  const removeSessionPhoto = (photoId: string) => {
    setSessionPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  // Update caption
  const updatePhotoCaption = (photoId: string, caption: string) => {
    setSessionPhotos(prev => prev.map(p => p.id === photoId ? { ...p, caption } : p));
  };

  // Commit and close
  const handleFinishAndAttach = () => {
    if (sessionPhotos.length > 0) {
      onPhotosCaptured(sessionPhotos);
    }
    stopTracks();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none">
      
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <Camera size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Field Camera Capture
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {sessionPhotos.length} Captured
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{uploaderName}</span>
              {previewGps ? (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <MapPin size={10} /> GPS Active (±{previewGps.accuracy}m)
                </span>
              ) : (
                <span className="text-slate-500">No GPS</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sessionPhotos.length > 0 && (
            <button
              onClick={handleFinishAndAttach}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Attach ({sessionPhotos.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              stopTracks();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Close Camera"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-black min-h-0">
        {cameraError ? (
          /* Graceful Fallback When Camera Permission Denied or Unsupported */
          <div className="max-w-md w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Camera Unavailable</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cameraError}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <label className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                <ImageIcon size={16} />
                <span>Upload From Device / Files</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={initCamera}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                <span>Retry Permission</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live Camera Stream with Shutter */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain md:object-cover"
            />

            {frozenPreview && (
              <img
                src={frozenPreview}
                alt="Captured Snapshot"
                className="absolute inset-0 w-full h-full object-contain md:object-cover animate-fade-in pointer-events-none"
              />
            )}

            {/* In-View Controls (Switch Camera, Quick Upload) */}
            <div className="absolute top-4 end-4 flex flex-col gap-2 z-10">
              <button
                onClick={toggleFacingMode}
                className="p-3 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md transition-all active:scale-90 border border-white/20 shadow-lg"
                title="Switch Camera (Front / Back)"
              >
                <RefreshCw size={18} className="animate-spin-slow" />
              </button>

              <label
                className="p-3 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md transition-all active:scale-90 border border-white/20 shadow-lg cursor-pointer"
                title="Upload Photo from Gallery"
              >
                <ImageIcon size={18} />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* GPS Indicator Stamp */}
            {previewGps && (
              <div className="absolute bottom-3 start-4 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-white/10 flex items-center gap-1.5 shadow-sm">
                <MapPin size={11} />
                <span>{previewGps.lat}, {previewGps.lng}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Captured Session Strip (Unlimited multi-capture review) */}
      {sessionPhotos.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Session Evidence ({sessionPhotos.length})
            </span>
            <span className="text-[10px] text-slate-500">Tap to expand or caption</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
            {sessionPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative group shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shadow-sm"
              >
                <img
                  src={photo.url}
                  alt={`Capture ${idx + 1}`}
                  onClick={() => setActivePhotoPreview(photo)}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
                <button
                  onClick={() => removeSessionPhoto(photo.id)}
                  className="absolute top-1 end-1 p-1 rounded-full bg-red-600/90 hover:bg-red-500 text-white shadow-xs transition-colors"
                  title="Delete photo"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Shutter Controls */}
      <div className="px-6 py-4 bg-slate-950 border-t border-slate-900 flex items-center justify-between shrink-0 z-20">
        <div className="w-16 flex items-center">
          {sessionPhotos.length > 0 && (
            <button
              onClick={retakeLastSnapshot}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Retake Last
            </button>
          )}
        </div>

        {/* Shutter Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={takeLiveSnapshot}
            disabled={!isStreaming || isCapturing}
            className={`w-20 h-20 rounded-full border-4 border-white/90 p-1 flex items-center justify-center transition-all ${
              !isStreaming || isCapturing
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-blue-500/20'
            }`}
            title="Capture Photo"
          >
            <div className="w-full h-full rounded-full bg-white hover:bg-slate-100 transition-colors"></div>
          </button>
        </div>

        <div className="w-16 flex justify-end">
          {sessionPhotos.length > 0 ? (
            <button
              onClick={handleFinishAndAttach}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md"
            >
              Done ({sessionPhotos.length})
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">Tap circle</span>
          )}
        </div>
      </div>

      {/* Lightbox / Caption Modal for Captured Photo */}
      {activePhotoPreview && (
        <div className="fixed inset-0 z-[260] bg-black/95 flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-bold">Photo Evidence Preview</span>
            <button
              onClick={() => setActivePhotoPreview(null)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 min-h-0">
            <img
              src={activePhotoPreview.url}
              alt="Expanded preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          <div className="max-w-md mx-auto w-full space-y-2 pt-2">
            <input
              type="text"
              value={activePhotoPreview.caption || ''}
              onChange={(e) => {
                const newCaption = e.target.value;
                setActivePhotoPreview({ ...activePhotoPreview, caption: newCaption });
                updatePhotoCaption(activePhotoPreview.id, newCaption);
              }}
              placeholder="Add optional caption or location note..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  removeSessionPhoto(activePhotoPreview.id);
                  setActivePhotoPreview(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-600/30"
              >
                Delete Photo
              </button>
              <button
                onClick={() => setActivePhotoPreview(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
