import React, { useState, useEffect } from 'react';
import { 
  WifiOff, Wifi, RefreshCw, AlertCircle, CheckCircle2, 
  Database, ArrowUpRight, CloudOff, X 
} from 'lucide-react';
import { SyncEngine, SyncNotification } from '../../services/syncEngine';
import { offlineStorage } from '../../services/offlineStorage';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'ERROR'>('IDLE');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [recentNotification, setRecentNotification] = useState<SyncNotification | null>(null);
  const [showRestoredToast, setShowRestoredToast] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [queueItems, setQueueItems] = useState<any[]>([]);

  // Effective online status considering simulation
  const effectiveOnline = isOnline && !isSimulatedOffline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      SyncEngine.processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize auto sync
    SyncEngine.initAutoSync();

    // Subscribe to SyncEngine notifications
    const unsubscribe = SyncEngine.subscribe((status, count, notification) => {
      setSyncStatus(status);
      setPendingCount(count);
      if (notification) {
        setRecentNotification(notification);
        setShowRestoredToast(true);
        setTimeout(() => setShowRestoredToast(false), 6000);
      }
    });

    // Listen to custom hse-sync-complete event
    const handleSyncComplete = (e: any) => {
      setRecentNotification(e.detail);
      setShowRestoredToast(true);
      setTimeout(() => setShowRestoredToast(false), 6000);
    };
    window.addEventListener('hse-sync-complete', handleSyncComplete);

    // Initial queue count
    offlineStorage.getPendingCount().then(c => setPendingCount(c)).catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('hse-sync-complete', handleSyncComplete);
      unsubscribe();
    };
  }, []);

  const loadQueueDetails = async () => {
    try {
      const items = await offlineStorage.getSyncQueue();
      setQueueItems(items);
      setIsDetailsOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSync = async () => {
    if (!effectiveOnline) return;
    await SyncEngine.processQueue();
    const items = await offlineStorage.getSyncQueue();
    setQueueItems(items);
  };

  return (
    <>
      {/* 1. Offline Field Execution Banner - Sticky at the very top of viewport */}
      {!effectiveOnline && (
        <aside 
          aria-label="Offline Mode Status Banner"
          className="sticky top-0 z-[100] w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2.5 shadow-lg border-b border-amber-400 flex items-center justify-between transition-all duration-300 animate-slide-down"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-40"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <WifiOff className="w-4 h-4 text-slate-950" />
            </div>

            <div className="text-xs sm:text-sm font-semibold tracking-wide truncate">
              Working Offline — Changes will synchronize automatically when connection is restored.
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ms-3">
            {pendingCount > 0 && (
              <button
                onClick={loadQueueDetails}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 text-amber-300 text-xs font-bold hover:bg-slate-900 transition shadow-sm"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{pendingCount} Queued</span>
              </button>
            )}

            <button
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              title="Toggle simulated offline mode for field testing"
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-400/80 hover:bg-amber-400 text-slate-950 transition border border-amber-300"
            >
              {isSimulatedOffline ? 'Resume Live' : 'Test Mode'}
            </button>
          </div>
        </aside>
      )}

      {/* 2. Connection Restored & Sync Success Toast */}
      {effectiveOnline && showRestoredToast && recentNotification && (
        <aside 
          aria-label="Connection Restored Notification"
          className="fixed top-4 end-4 z-[110] max-w-md w-full bg-slate-900 text-white border border-emerald-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-slide-in-right flex items-start gap-3"
        >
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Connection Restored</h4>
              <button 
                onClick={() => setShowRestoredToast(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-200 mt-1">
              {recentNotification.message}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Enterprise ledger synchronized via Background Sync</span>
            </div>
          </div>
        </aside>
      )}

      {/* 3. Syncing In Progress Ambient Status Bar */}
      {effectiveOnline && syncStatus === 'SYNCING' && (
        <div className="sticky top-0 z-[95] w-full bg-indigo-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Synchronizing offline field queue with cloud ledger...</span>
          </div>
          <span className="text-[11px] opacity-80">{pendingCount} item{pendingCount > 1 ? 's' : ''} remaining</span>
        </div>
      )}

      {/* 4. Queue Inspection Modal for HSE Field Technicians */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Offline IndexedDB Queue</h3>
              </div>
              <button 
                onClick={() => setIsDetailsOpen(false)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {queueItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Offline submission queue is currently empty.
                </div>
              ) : (
                queueItems.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-800/70 border border-slate-700 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{item.title || item.action}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        {item.status || 'QUEUED'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Type: {item.entityType || 'Checklist/Record'}</span>
                      <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {effectiveOnline ? 'Device is online' : 'Device is offline'}
              </span>
              <div className="flex items-center gap-2">
                {effectiveOnline && (
                  <button
                    onClick={handleManualSync}
                    disabled={syncStatus === 'SYNCING' || queueItems.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                    Sync Now
                  </button>
                )}
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
