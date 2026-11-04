import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, ChevronDown, ChevronUp, CheckCircle2, RotateCcw, XCircle, ShieldAlert } from 'lucide-react';
import { EncryptedQueueService } from '../../services/encryptedQueueService';

export const SyncStatusBar: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [failedItems, setFailedItems] = useState<Array<{ id: string; localId: string; entityType: string; reason: string }>>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Poll stats and monitor online/offline network events
  useEffect(() => {
    const updateStats = async () => {
      try {
        const stats = await EncryptedQueueService.getQueueStats();
        setPendingCount(stats.pendingCount);
        setFailedCount(stats.failedCount);
        setLastSync(stats.lastSyncTimestamp);
        setFailedItems(stats.failedItems);
      } catch (err) {
        console.warn('[SyncStatusBar] Stats load warning:', err);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 4000);

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Background Sync API where supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration: any) => {
        registration.sync?.register('hse-sync-queue').catch(() => {});
      }).catch(() => {});
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = async () => {
    if (isSyncing || !navigator.onLine) return;
    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const pending = await EncryptedQueueService.getPendingItems();
      if (pending.length === 0) {
        setIsSyncing(false);
        return;
      }

      const batchPayload = pending.map(item => ({
        localId: item.localId,
        idempotencyKey: item.idempotencyKey,
        entityType: item.entityType,
        deviceId: item.deviceId,
        clientTimestamp: item.clientTimestamp,
        payload: item.payload
      }));

      const res = await fetch('/api/v1/sync/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001'
        },
        body: JSON.stringify({ items: batchPayload })
      });

      const data = await res.json();
      if (res.ok && data?.data?.results) {
        for (const r of data.data.results) {
          if (r.status === 'SUCCESS') {
            await EncryptedQueueService.updateItemStatus(r.localId, 'SYNCED');
          } else if (r.status === 'REJECTED_SOD') {
            await EncryptedQueueService.updateItemStatus(r.localId, 'REJECTED_SOD', r.error);
          } else {
            await EncryptedQueueService.updateItemStatus(r.localId, 'FAILED', r.error);
          }
        }
        setSyncFeedback(`Sync complete: ${data.data.successes} synced, ${data.data.failures} flagged.`);
        setTimeout(() => setSyncFeedback(null), 5000);
      }
    } catch (err: any) {
      setSyncFeedback(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
      const stats = await EncryptedQueueService.getQueueStats();
      setPendingCount(stats.pendingCount);
      setFailedCount(stats.failedCount);
      setLastSync(stats.lastSyncTimestamp);
      setFailedItems(stats.failedItems);
    }
  };

  const retrySingleItem = async (localId: string) => {
    await EncryptedQueueService.updateItemStatus(localId, 'PENDING');
    triggerSync();
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 transition-all font-sans">
      {/* Drawer: Detailed Failed Items and Per-Item Error Reasons */}
      {isDrawerOpen && (
        <div className="bg-slate-900 border-t border-slate-700 p-6 text-white text-start space-y-4 max-h-80 overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                PWA Offline Sync Ledger & Conflict Exceptions
              </h4>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending Queue</span>
              <span className="text-lg font-black text-indigo-400">{pendingCount}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Failed / SoD Rejected</span>
              <span className="text-lg font-black text-red-400">{failedCount}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Reconnection</span>
              <span className="text-xs font-mono font-bold text-slate-300">
                {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Awaiting network'}
              </span>
            </div>
          </div>

          {/* Failed items list with per-item reason and manual retry */}
          {failedItems.length > 0 ? (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                Action Required on Rejected / Failed Submissions:
              </p>
              {failedItems.map(item => (
                <div key={item.id} className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-900 text-red-200 rounded text-[9px] font-mono font-bold uppercase">
                        {item.entityType}
                      </span>
                      <span className="font-mono text-xs text-slate-300">ID: {item.localId.slice(0, 12)}</span>
                    </div>
                    <p className="text-xs text-red-300 mt-1 font-medium">
                      Reason: {item.reason}
                    </p>
                  </div>
                  <button
                    onClick={() => retrySingleItem(item.localId)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw size={12}/> Retry
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-400 italic">
              All field queue items synchronized. No pending conflicts or SoD rejections.
            </div>
          )}
        </div>
      )}

      {/* Main Bottom Sync Status Bar */}
      <div className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-lg transition-colors ${
        !isOnline 
          ? 'bg-amber-600 text-white' 
          : failedCount > 0 
          ? 'bg-red-700 text-white' 
          : pendingCount > 0 
          ? 'bg-indigo-600 text-white' 
          : 'bg-slate-900 text-slate-200 border-t border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          {!isOnline ? (
            <div className="flex items-center gap-1.5">
              <WifiOff size={16} />
              <span>Offline (AES-256 Queue Active)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Wifi size={16} className="text-emerald-400" />
              <span>Connected (Oman Cloud Gateway)</span>
            </div>
          )}

          {lastSync && (
            <span className="hidden sm:inline text-[11px] opacity-80 font-mono">
              • Last synced: {new Date(lastSync).toLocaleTimeString()}
            </span>
          )}

          {syncFeedback && (
            <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded font-mono">
              {syncFeedback}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              {pendingCount} Pending
            </span>
          )}

          {failedCount > 0 && (
            <span className="bg-red-900/60 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-300/40">
              {failedCount} Rejected
            </span>
          )}

          {isOnline && (
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition active:scale-95 disabled:opacity-50"
              title="Manual Retry Sync"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}

          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-1 hover:bg-white/10 rounded-lg transition"
            title="Toggle Detailed Sync Ledger"
          >
            {isDrawerOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
