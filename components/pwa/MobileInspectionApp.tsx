import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SyncStatusBar } from './SyncStatusBar';
import { InspectionChecklist } from './InspectionChecklist';
import { InspectionDetail } from './InspectionDetail';
import { ConflictResolver } from './ConflictResolver';
import { InspectionRecord, offlineStorage } from '../../services/offlineStorage';
import { HeatmapLayer, HeatmapMetric, METRIC_CONFIGS, METRIC_GRADIENTS } from './HeatmapLayer';
import { 
  Plus, ListChecks, MapPin, ChevronRight, AlertTriangle, Camera, Zap,
  Layers, RefreshCw, Eye, CheckCircle2, SlidersHorizontal, Info, ShieldCheck, Flame
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DeviceIntegration } from '../../utils/deviceIntegration';
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
  const [view, setView] = useState<'LIST' | 'INSPECT' | 'DETAIL'>('LIST');
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);

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

  const handleQuickPhoto = async (record: InspectionRecord, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await DeviceIntegration.compressImage(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Photo = reader.result as string;
        const updatedRecord = {
          ...record,
          data: {
             ...record.data,
             photos: [...(record.data?.photos || []), base64Photo]
          },
          updatedAt: new Date().toISOString()
        };
        await offlineStorage.saveInspection(updatedRecord);
        loadInspections();
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error(err);
    }
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

  return (
    <div className={`flex flex-col h-full relative overflow-hidden ${dir === 'rtl' ? 'rtl font-arabic' : 'ltr font-sans'}`}>
       {/* List view and map wrapper */}
       <div className={`flex flex-col h-full transition-all duration-300 ${view !== 'LIST' ? 'pointer-events-none opacity-40 blur-[1px]' : ''}`}>
          <SyncStatusBar />
          
          <AnimatePresence>
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
             <h1 className="text-2xl font-black text-slate-800 mb-6">Field Inspections</h1>
             
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
             
             <div className="space-y-4">
               {inspections.filter(i => i.status === 'CONFLICT').map(record => (
                  <ConflictResolver key={record.id} record={record} onResolved={loadInspections} />
               ))}

               {inspections.filter(i => i.status !== 'CONFLICT').length === 0 && (
                  <div className="text-center py-12 text-slate-400 font-bold flex flex-col items-center">
                     <ListChecks size={48} className="mb-4 opacity-50" />
                     No offline records. Tap + to begin.
                  </div>
               )}

               {inspections.filter(i => i.status !== 'CONFLICT').map(record => (
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
                           {record.status === 'DRAFT' && (
                              <label className="cursor-pointer p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600" title="Quick Photo">
                                 <Camera size={16} />
                                 <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleQuickPhoto(record, e)} />
                              </label>
                           )}
                           <ChevronRight size={18} className="text-slate-400 cursor-pointer" onClick={() => handleViewDetail(record)} />
                        </div>
                     </div>
                     {record.location && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1 cursor-pointer" onClick={() => handleViewDetail(record)}>
                           <MapPin size={12} className="text-indigo-400" />
                           {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                        </div>
                     )}
                     
                     {/* Show miniature photo preview dots if there are photos */}
                     {record.data?.photos?.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 cursor-pointer" onClick={() => handleViewDetail(record)}>
                           <Camera size={12} className="text-slate-400" />
                           <span className="text-[10px] text-slate-500 font-bold">{record.data.photos.length} Photo{record.data.photos.length !== 1 ? 's' : ''} Attached</span>
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
         {view === 'INSPECT' && (
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 30 }}
             transition={{ type: 'spring', damping: 25, stiffness: 220 }}
             className="absolute inset-0 glass-card z-[100] flex flex-col"
           >
              <SyncStatusBar />
              <InspectionChecklist onComplete={handleComplete} />
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
    </div>
  );
};
