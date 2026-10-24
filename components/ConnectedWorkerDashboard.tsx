
import React, { useState } from 'react';
import { ConnectedWorker } from '../types';
import { 
  Users, HeartPulse, MapPin, Battery, AlertCircle, 
  Wifi, Search, UserCheck, ShieldCheck, Activity
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
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-4 border-indigo-600 ps-4">Live Biometrics & Geo-Safety</p>
                </div>
            </div>
            <div className="glass-card border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
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
                    worker.status === 'Distress' ? 'bg-red-50 border-red-200' : 'glass-card border-slate-100 hover:border-indigo-100'
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
                        <div className="glass-card/60 p-3 rounded-xl border border-slate-200/50">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><HeartPulse size={10}/> Heart Rate</p>
                            <p className={`text-xl font-black ${worker.heartRate > 100 ? 'text-red-500' : 'text-slate-800'}`}>{worker.heartRate} bpm</p>
                        </div>
                        <div className="glass-card/60 p-3 rounded-xl border border-slate-200/50">
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

        <div className="mt-12 bg-slate-900 rounded-[3rem] p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 end-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30">
                    <UserCheck size={24} className="text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Computer Vision & Ergonomics AI</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time CCTV Analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
                    <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldCheck size={16} /> PPE Compliance
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-300">Hard Hats</span>
                            <span className="text-sm font-black text-emerald-400">98%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full"><div className="w-[98%] bg-emerald-400 h-full rounded-full"></div></div>
                        
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs font-bold text-slate-300">Safety Glasses</span>
                            <span className="text-sm font-black text-amber-400">85%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full"><div className="w-[85%] bg-amber-400 h-full rounded-full"></div></div>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
                    <h4 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity size={16} /> Ergonomic Risks
                    </h4>
                    <div className="space-y-3">
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-slate-300">Improper Lifting Posture</p>
                                <p className="text-[10px] text-slate-500 uppercase mt-1">Zone C • 2 mins ago</p>
                            </div>
                            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px] font-black uppercase border border-red-500/30">High Risk</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-slate-300">Repetitive Motion Strain</p>
                                <p className="text-[10px] text-slate-500 uppercase mt-1">Assembly Line 1 • Ongoing</p>
                            </div>
                            <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-[10px] font-black uppercase border border-amber-500/30">Med Risk</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ConnectedWorkerDashboard;
