import React, { useState } from 'react';
import { InspectionRecord, offlineStorage } from '../../services/offlineStorage';
import { SyncEngine } from '../../services/syncEngine';
import { ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

export const ConflictResolver: React.FC<{ record: InspectionRecord; onResolved: () => void }> = ({ record, onResolved }) => {
  const [resolving, setResolving] = useState(false);

  const handleMerge = async (strategy: 'KEEP_LOCAL' | 'KEEP_SERVER' | 'MANUAL') => {
    setResolving(true);
    try {
      let resolvedData = record.data;
      if (strategy === 'KEEP_SERVER') {
        resolvedData = record.serverData;
      }
      // If manual, we would open a diff UI. For simplicity, we just keep local or server.
      
      await SyncEngine.resolveConflict(record.id, resolvedData);
      onResolved();
    } finally {
      setResolving(false);
    }
  };

  if (!record.serverData) return null;

  return (
    <div className="glass-card rounded-xl shadow-lg border border-red-200 overflow-hidden mb-6">
       <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex items-center justify-between">
          <h3 className="font-bold text-red-700 flex items-center gap-2">
            <ShieldAlert size={18} />
            Data Conflict Detected
          </h3>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold">Action Required</span>
       </div>
       
       <div className="p-4 space-y-4 text-sm">
          <p className="text-slate-600">This inspection was modified on the server while you were offline. Please choose how to proceed.</p>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="glass-panel p-3 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-2">Your Device (Local)</div>
                <div className="text-xs text-slate-600 space-y-1 bg-white/70 p-2 rounded border border-slate-200">
                   {record.data && typeof record.data === 'object' ? (
                      Object.entries(record.data).slice(0, 3).map(([k, v]) => (
                         <div key={k} className="flex justify-between gap-1 text-[11px]">
                            <span className="font-semibold text-slate-500 truncate">{k}:</span>
                            <span className="font-mono text-slate-800 truncate">{typeof v === 'object' ? '[Attached Data]' : String(v)}</span>
                         </div>
                      ))
                   ) : (
                      <span className="text-slate-400 italic">No local payload</span>
                   )}
                </div>
                <button 
                  onClick={() => handleMerge('KEEP_LOCAL')}
                  disabled={resolving}
                  className="mt-3 w-full py-2 glass-card border border-slate-300 rounded-md text-xs font-bold hover:bg-slate-100"
                >
                  Overwrite Server
                </button>
             </div>
             
             <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <div className="font-bold text-indigo-800 mb-2">Cloud Server</div>
                <div className="text-xs text-indigo-700 space-y-1 bg-white/70 p-2 rounded border border-indigo-200">
                   {record.serverData && typeof record.serverData === 'object' ? (
                      Object.entries(record.serverData).slice(0, 3).map(([k, v]) => (
                         <div key={k} className="flex justify-between gap-1 text-[11px]">
                            <span className="font-semibold text-indigo-500 truncate">{k}:</span>
                            <span className="font-mono text-indigo-900 truncate">{typeof v === 'object' ? '[Server Data]' : String(v)}</span>
                         </div>
                      ))
                   ) : (
                      <span className="text-slate-400 italic">No cloud payload</span>
                   )}
                </div>
                <button 
                  onClick={() => handleMerge('KEEP_SERVER')}
                  disabled={resolving}
                  className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700"
                >
                  Accept Server Version
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};
