import React, { useState } from 'react';
import { Shield, AlertTriangle, ArrowRight, Plus, Trash2, Zap, Activity, CheckCircle2, XCircle } from 'lucide-react';

interface Barrier {
  id: string;
  name: string;
  type: 'preventative' | 'mitigative';
  effectiveness: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Degraded' | 'Failed';
}

interface Cause {
  id: string;
  name: string;
  barriers: Barrier[];
}

interface Consequence {
  id: string;
  name: string;
  barriers: Barrier[];
}

const BowtieAnalysisTool: React.FC = () => {
  const [topEvent, setTopEvent] = useState('Loss of Containment (Hydrocarbon Release)');
  const [hazard, setHazard] = useState('High Pressure Gas Pipeline');
  
  const [causes, setCauses] = useState<Cause[]>([
    {
      id: 'c1',
      name: 'Corrosion (Internal/External)',
      barriers: [
        { id: 'b1', name: 'Corrosion Inhibitor Injection', type: 'preventative', effectiveness: 'High', status: 'Active' },
        { id: 'b2', name: 'Regular Pipeline Inspection (ILI)', type: 'preventative', effectiveness: 'Medium', status: 'Degraded' }
      ]
    },
    {
      id: 'c2',
      name: 'Third Party Excavation Damage',
      barriers: [
        { id: 'b3', name: 'Pipeline Markers & Signage', type: 'preventative', effectiveness: 'Low', status: 'Active' },
        { id: 'b4', name: 'Permit to Work System', type: 'preventative', effectiveness: 'High', status: 'Active' }
      ]
    }
  ]);

  const [consequences, setConsequences] = useState<Consequence[]>([
    {
      id: 'cq1',
      name: 'Fire / Explosion',
      barriers: [
        { id: 'b5', name: 'Fire & Gas Detection System', type: 'mitigative', effectiveness: 'High', status: 'Active' },
        { id: 'b6', name: 'Emergency Shutdown (ESD)', type: 'mitigative', effectiveness: 'High', status: 'Active' }
      ]
    },
    {
      id: 'cq2',
      name: 'Environmental Pollution',
      barriers: [
        { id: 'b7', name: 'Secondary Containment', type: 'mitigative', effectiveness: 'Medium', status: 'Degraded' },
        { id: 'b8', name: 'Spill Response Team', type: 'mitigative', effectiveness: 'High', status: 'Active' }
      ]
    }
  ]);

  const getEffectivenessColor = (eff: string) => {
    switch(eff) {
      case 'High': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Active': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'Degraded': return <AlertTriangle size={14} className="text-amber-500" />;
      case 'Failed': return <XCircle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-x-5">
          <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
            <Shield size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Bowtie Analysis</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-indigo-500 ps-4">Visual Barrier Management</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition-all active:scale-95">
            <Plus size={20} /> New Bowtie
          </button>
        </div>
      </div>

      <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-x-auto">
        <div className="min-w-[1200px] relative py-12">
          
          {/* Center: Hazard & Top Event */}
          <div className="absolute start-1/2 top-1/2 rtl:translate-x-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-xl border-4 border-slate-700 w-64 text-center mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hazard</p>
              <h3 className="text-sm font-bold">{hazard}</h3>
            </div>
            <div className="bg-red-600 text-white p-6 rounded-full shadow-2xl border-8 border-red-500/30 w-48 h-48 flex flex-col items-center justify-center text-center relative">
              <Zap size={32} className="mb-2 text-red-200" />
              <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Top Event</p>
              <h3 className="text-sm font-black leading-tight">{topEvent}</h3>
            </div>
          </div>

          <div className="flex justify-between items-stretch gap-32 relative">
            
            {/* Left Side: Causes & Preventative Barriers */}
            <div className="flex-1 space-y-12 relative">
              {causes.map((cause, i) => (
                <div key={cause.id} className="flex items-center justify-end gap-8 relative">
                  {/* Cause Box */}
                  <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl w-48 shadow-sm relative z-10">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Threat / Cause</p>
                    <h4 className="text-xs font-bold text-slate-800">{cause.name}</h4>
                  </div>

                  {/* Connection Line */}
                  <div className="absolute end-0 top-1/2 w-[calc(100%-12rem)] h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>

                  {/* Barriers */}
                  <div className="flex gap-4 relative z-10">
                    {cause.barriers.map(barrier => (
                      <div key={barrier.id} className="glass-card border-2 border-slate-200 p-3 rounded-xl w-40 shadow-md flex flex-col items-center text-center group hover:border-indigo-500 transition-colors cursor-pointer">
                        <div className={`w-full h-2 rounded-full mb-2 ${barrier.status === 'Active' ? 'bg-emerald-500' : barrier.status === 'Degraded' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                        <h5 className="text-[10px] font-bold text-slate-700 mb-2">{barrier.name}</h5>
                        <div className="flex items-center gap-2 mt-auto">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getEffectivenessColor(barrier.effectiveness)}`}>
                            {barrier.effectiveness}
                          </span>
                          {getStatusIcon(barrier.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Arrow to Top Event */}
                  <div className="w-16 flex items-center justify-center text-slate-300">
                    <ArrowRight size={24} />
                  </div>
                </div>
              ))}
            </div>

            {/* Spacer for Center Event */}
            <div className="w-64 shrink-0"></div>

            {/* Right Side: Mitigative Barriers & Consequences */}
            <div className="flex-1 space-y-12 relative">
              {consequences.map((consequence, i) => (
                <div key={consequence.id} className="flex items-center justify-start gap-8 relative">
                  
                  {/* Arrow from Top Event */}
                  <div className="w-16 flex items-center justify-center text-slate-300">
                    <ArrowRight size={24} />
                  </div>

                  {/* Connection Line */}
                  <div className="absolute start-0 top-1/2 w-[calc(100%-12rem)] h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>

                  {/* Barriers */}
                  <div className="flex gap-4 relative z-10">
                    {consequence.barriers.map(barrier => (
                      <div key={barrier.id} className="glass-card border-2 border-slate-200 p-3 rounded-xl w-40 shadow-md flex flex-col items-center text-center group hover:border-indigo-500 transition-colors cursor-pointer">
                        <div className={`w-full h-2 rounded-full mb-2 ${barrier.status === 'Active' ? 'bg-emerald-500' : barrier.status === 'Degraded' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                        <h5 className="text-[10px] font-bold text-slate-700 mb-2">{barrier.name}</h5>
                        <div className="flex items-center gap-2 mt-auto">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getEffectivenessColor(barrier.effectiveness)}`}>
                            {barrier.effectiveness}
                          </span>
                          {getStatusIcon(barrier.status)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Consequence Box */}
                  <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl w-48 shadow-sm relative z-10">
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Consequence</p>
                    <h4 className="text-xs font-bold text-slate-800">{consequence.name}</h4>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={16} className="text-indigo-500" /> Barrier Health Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700">Active / Healthy</span>
              <span className="text-sm font-black text-emerald-600">5</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-xs font-bold text-amber-700">Degraded</span>
              <span className="text-sm font-black text-amber-600">2</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
              <span className="text-xs font-bold text-red-700">Failed / Missing</span>
              <span className="text-sm font-black text-red-600">0</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap size={16} className="text-amber-400" /> AI Barrier Analysis
          </h3>
          <p className="text-sm leading-relaxed text-slate-300 mb-4">
            Based on recent incident data and maintenance logs, the <span className="text-amber-400 font-bold">Secondary Containment</span> barrier is showing signs of degradation. Recommend immediate inspection.
          </p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition">
            Generate Action Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default BowtieAnalysisTool;
