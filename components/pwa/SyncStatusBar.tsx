import React, { useState, useEffect } from 'react';
import { SyncEngine } from '../../services/syncEngine';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export const SyncStatusBar: React.FC = () => {
  const [status, setStatus] = useState<'IDLE' | 'SYNCING' | 'ERROR'>('IDLE');
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Monitor Network
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    SyncEngine.initAutoSync();

    // Subscribe to Sync Engine updates
    const unsubscribe = SyncEngine.subscribe((newStatus, count) => {
      setStatus(newStatus);
      setPendingCount(count);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="bg-amber-100 text-amber-800 px-4 py-2 text-xs font-bold flex items-center justify-between">
        <div className="flex items-center gap-2">
           <WifiOff size={14} />
           <span>Working Offline</span>
        </div>
        <span>{pendingCount} Pending</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
         <div className="flex items-center gap-2">
            <RefreshCw size={14} className={status === 'SYNCING' ? 'animate-spin' : ''} />
            <span>{status === 'SYNCING' ? 'Syncing securely...' : 'Pending Sync'}</span>
         </div>
         <span>{pendingCount} item{pendingCount > 1 ? 's' : ''}</span>
      </div>
    );
  }

  return (
    <div className="bg-emerald-500 text-white px-4 py-1.5 text-xs font-bold flex items-center gap-2 justify-center transition-all duration-500 overflow-hidden h-0 opacity-0 data-[active=true]:h-auto data-[active=true]:py-2 data-[active=true]:opacity-100">
       <Wifi size={14} /> Synced automatically
    </div>
  );
};
