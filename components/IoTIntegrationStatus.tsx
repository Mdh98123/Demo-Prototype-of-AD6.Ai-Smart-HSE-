
import React from 'react';
import { 
  Database, RefreshCw, CheckCircle2, AlertTriangle, 
  Activity, Server, Wifi, ArrowRightLeft
} from 'lucide-react';

const IoTIntegrationStatus: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Integration Hub</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 border-l-4 border-indigo-600 pl-4">Enterprise Connector Health</p>
            </div>
            <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-1"><Wifi size={10}/> Mesh Online</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SAP Connector */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Database size={80}/></div>
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl"><Server size={24}/></div>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-emerald-100">Connected</span>
                </div>
                <h3 className="text-xl font-black text-slate-800">SAP EHS</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Bidirectional Sync</p>
                <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Latency</span>
                        <span>45ms</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Last Sync</span>
                        <span>Just now</span>
                    </div>
                </div>
            </div>

            {/* IoT Broker */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={80}/></div>
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl"><Wifi size={24}/></div>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-emerald-100">Active</span>
                </div>
                <h3 className="text-xl font-black text-slate-800">MQTT Broker</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Sensor Mesh Ingestion</p>
                <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Throughput</span>
                        <span>1.2k msg/s</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Devices</span>
                        <span>452 Online</span>
                    </div>
                </div>
            </div>

            {/* Legacy System */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><ArrowRightLeft size={80}/></div>
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-orange-50 text-orange-700 rounded-2xl"><RefreshCw size={24}/></div>
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-orange-100">Syncing</span>
                </div>
                <h3 className="text-xl font-black text-slate-800">Maximo</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Asset Registry</p>
                <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Queue</span>
                        <span>14 Pending</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-orange-400 h-full w-[60%] animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Live Stream Simulation */}
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl font-mono text-xs overflow-hidden h-64 relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <p className="text-slate-500 mb-4 uppercase tracking-widest font-sans font-black text-[10px]">Live Event Stream</p>
            <div className="space-y-2 opacity-80">
                <p><span className="text-emerald-400">[10:42:01]</span> MQTT_INGEST: Sensor ID: H2S-04 | Value: 0.0ppm | Status: OK</p>
                <p><span className="text-emerald-400">[10:42:02]</span> SAP_SYNC: Work Order #4921 updated successfully.</p>
                <p><span className="text-yellow-400">[10:42:05]</span> ANOMALY_DETECT: Vibration spike on Pump-101 (Cluster B).</p>
                <p><span className="text-emerald-400">[10:42:08]</span> MQTT_INGEST: Wearable ID: W-99 | HR: 88bpm | Loc: Zone A</p>
                <p><span className="text-blue-400">[10:42:12]</span> AUTH_LOG: User 'Sarah Jones' accessed Secure Document Vault.</p>
            </div>
        </div>
    </div>
  );
};

export default IoTIntegrationStatus;
