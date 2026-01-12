
import React, { useState } from 'react';
import { EmergencyDrill } from '../types';
import { 
  ShieldAlert, Flame, Biohazard, Activity, 
  Plus, Calendar, MapPin, CheckCircle2, History, Loader2, ArrowRight 
} from 'lucide-react';

const EmergencyModule: React.FC = () => {
  const [drills] = useState<EmergencyDrill[]>([
    { id: '1', type: 'Fire', date: '2024-03-10', location: 'Office HQ', outcome: 'Successful', timeTakenMinutes: 4.5, participants: 120 },
    { id: '2', type: 'Chemical Spill', date: '2024-02-15', location: 'Ruwais Zone A', outcome: 'Needs Improvement', timeTakenMinutes: 12.0, participants: 45 }
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-5">
            <div className="bg-red-600 p-4 rounded-2xl text-white shadow-xl shadow-red-500/20">
                <ShieldAlert size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Emergency Hub</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Drill Compliance & Rapid Response Protocols</p>
            </div>
          </div>
          <div className="flex gap-2">
              <button className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">DECLARE EMERGENCY</button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2"><History size={16}/> Drill Execution Log</h3>
                  <div className="grid gap-4">
                      {drills.map(d => (
                          <div key={d.id} className="p-6 rounded-[2rem] border-2 border-slate-50 flex items-center justify-between hover:border-indigo-100 transition-all group">
                              <div className="flex items-center gap-6">
                                  <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                      {d.type === 'Fire' ? <Flame size={28}/> : <Biohazard size={28}/>}
                                  </div>
                                  <div>
                                      <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{d.type} Response Simulation</h4>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{d.location} • {d.date}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${d.outcome === 'Successful' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{d.outcome}</span>
                                  <p className="text-xs font-black text-slate-800 mt-2">{d.timeTakenMinutes}m <span className="text-[9px] text-slate-400 uppercase">Resp. Time</span></p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          
          <div className="space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                  <h3 className="font-black uppercase tracking-widest text-[10px] text-teal-400 mb-8">Crisis Management</h3>
                  <div className="space-y-6">
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
                          <p className="text-xs font-black uppercase mb-1">Evacuation Plans</p>
                          <p className="text-[10px] text-slate-400">View current muster point GIS links.</p>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
                          <p className="text-xs font-black uppercase mb-1">Incident Cascade</p>
                          <p className="text-[10px] text-slate-400">Automated notification hierarchy.</p>
                      </div>
                  </div>
                  <button className="w-full mt-8 bg-teal-500 text-slate-900 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">Initiate Mock Drill <ArrowRight size={16}/></button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default EmergencyModule;
