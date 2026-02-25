
import React, { useState } from 'react';
import { ConnectedWorker } from '../types';
import { 
  Users, HeartPulse, MapPin, Battery, AlertCircle, 
  Wifi, Search, UserCheck 
} from 'lucide-react';

const ConnectedWorkerDashboard: React.FC = () => {
  const [workers] = useState<ConnectedWorker[]>([
      { id: 'w1', name: 'Rahul Gupta', role: 'Welder', status: 'Active', heartRate: 88, bodyTemp: 37.2, location: { zone: 'Zone A', coords: [10, 10] }, lastSync: 'Now', hazards: [], battery: 85 },
      { id: 'w2', name: 'Sarah Jones', role: 'Supervisor', status: 'Active', heartRate: 72, bodyTemp: 36.8, location: { zone: 'Control Room', coords: [50, 50] }, lastSync: 'Now', hazards: [], battery: 92 },
      { id: 'w3', name: 'Ahmed Salem', role: 'Rigger', status: 'Distress', heartRate: 115, bodyTemp: 38.1, location: { zone: 'Tank Farm', coords: [80, 20] }, lastSync: '1m ago', hazards: ['Heat Stress'], battery: 45 }
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
            <div className="flex items-center gap-5">
                <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
                    <Users size={32} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Connected Worker</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-4 border-indigo-600 pl-4">Live Biometrics & Geo-Safety</p>
                </div>
            </div>
            <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase text-slate-500">Mesh Network: Online</span>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <span className="text-xs font-bold text-slate-800">{workers.length} Active Devices</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {workers.map(worker => (
                <div key={worker.id} className={`p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-xl relative overflow-hidden group ${
                    worker.status === 'Distress' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 hover:border-indigo-100'
                }`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                                worker.status === 'Distress' ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {worker.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-sm">{worker.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{worker.role}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                            worker.status === 'Distress' ? 'bg-red-600 text-white border-red-600 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                            {worker.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/60 p-3 rounded-xl border border-slate-200/50">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><HeartPulse size={10}/> Heart Rate</p>
                            <p className={`text-xl font-black ${worker.heartRate > 100 ? 'text-red-500' : 'text-slate-800'}`}>{worker.heartRate} bpm</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-xl border border-slate-200/50">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><MapPin size={10}/> Location</p>
                            <p className="text-sm font-bold text-slate-800">{worker.location.zone}</p>
                        </div>
                    </div>

                    {worker.hazards.length > 0 && (
                        <div className="mb-4 p-3 bg-red-100 rounded-xl border border-red-200 flex items-center gap-2 text-red-800">
                            <AlertCircle size={16}/>
                            <span className="text-[10px] font-bold uppercase">{worker.hazards.join(', ')} Detected</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase border-t border-slate-200/50 pt-4">
                        <span className="flex items-center gap-1"><Wifi size={10}/> Sync: {worker.lastSync}</span>
                        <span className="flex items-center gap-1"><Battery size={10}/> {worker.battery}%</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ConnectedWorkerDashboard;
