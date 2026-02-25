
import React, { useState, useEffect } from 'react';
import { getARProcedures } from '../services/geminiService';
import { ARProcedure } from '../types';
import { Camera, Maximize, AlertTriangle, CheckCircle2, ArrowRight, X } from 'lucide-react';

const ARProcedureViewer: React.FC = () => {
  const [procedures, setProcedures] = useState<ARProcedure[]>([]);
  const [activeProcedure, setActiveProcedure] = useState<ARProcedure | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
      const load = async () => {
          const data = await getARProcedures('Centrifugal Pump');
          setProcedures(data);
      };
      load();
  }, []);

  if (!activeProcedure) {
      return (
          <div className="p-8 bg-slate-900 rounded-[3rem] text-white h-[600px] flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
              <div className="relative z-10">
                  <div className="bg-indigo-600 p-6 rounded-3xl mb-6 shadow-2xl shadow-indigo-500/30 inline-block">
                      <Camera size={48} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">AR Safety Procedures</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Select a workflow to begin spatial guidance</p>
                  <div className="space-y-3 w-full max-w-md mx-auto">
                      {procedures.map(p => (
                          <button 
                            key={p.id}
                            onClick={() => setActiveProcedure(p)}
                            className="w-full p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-between transition-all backdrop-blur-md"
                          >
                              <span className="font-bold text-sm">{p.title}</span>
                              <ArrowRight size={16}/>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  const currentStep = activeProcedure.spatialAnchors[stepIndex];

  return (
      <div className="relative h-[600px] rounded-[3rem] overflow-hidden bg-black border-8 border-slate-900 shadow-2xl">
          {/* Simulated Camera Feed Background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
          
          {/* AR Overlay UI */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                  <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Step {stepIndex + 1}/{activeProcedure.spatialAnchors.length}</p>
                      <h3 className="text-lg font-bold leading-tight mt-1">{currentStep.annotation}</h3>
                  </div>
                  <button onClick={() => { setActiveProcedure(null); setStepIndex(0); }} className="p-3 bg-red-600 rounded-full text-white shadow-lg"><X size={20}/></button>
              </div>

              {/* Spatial Anchor Simulation */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 border-4 border-indigo-500 rounded-full flex items-center justify-center bg-indigo-500/20">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  {currentStep.warning && (
                      <div className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                          <AlertTriangle size={14}/> {currentStep.warning}
                      </div>
                  )}
              </div>

              {/* Controls */}
              <div className="flex gap-4 items-end">
                  <div className="flex-1 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Required PPE Check</p>
                      <div className="flex gap-2">
                          {activeProcedure.requiredPPE.map((ppe, i) => (
                              <span key={i} className="text-[9px] bg-white/20 px-2 py-1 rounded text-white font-bold">{ppe}</span>
                          ))}
                      </div>
                  </div>
                  <button 
                    onClick={() => setStepIndex(prev => (prev + 1) % activeProcedure.spatialAnchors.length)}
                    className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl active:scale-95 transition-transform"
                  >
                      <CheckCircle2 size={32}/>
                  </button>
              </div>
          </div>
      </div>
  );
};

export default ARProcedureViewer;
