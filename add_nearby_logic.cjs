const fs = require('fs');
let content = fs.readFileSync('components/pwa/MobileInspectionApp.tsx', 'utf8');

const targetState = `  const [inspections, setInspections] = useState<InspectionRecord[]>([]);`;
const replaceState = `  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
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
`;

content = content.replace(targetState, replaceState);

const targetImport = `import { Plus, ListChecks, MapPin, ChevronRight } from 'lucide-react';`;
const replaceImport = `import { Plus, ListChecks, MapPin, ChevronRight, AlertTriangle } from 'lucide-react';`;
content = content.replace(targetImport, replaceImport);

const targetRender = `          <SyncStatusBar />`;
const replaceRender = `          <SyncStatusBar />
          
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
`;
content = content.replace(targetRender, replaceRender);

fs.writeFileSync('components/pwa/MobileInspectionApp.tsx', content);
