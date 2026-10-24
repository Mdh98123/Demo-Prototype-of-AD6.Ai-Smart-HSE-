
import { AITag } from './AITag';
import React, { useState, useEffect } from 'react';
import { getARProcedures, enhanceARStep } from '../services/geminiService';
import { ARProcedure } from '../types';
import { Camera, Maximize, AlertTriangle, CheckCircle2, ArrowRight, X, ChevronLeft, ChevronRight, List, Sparkles, Loader2, Info } from 'lucide-react';

const ARProcedureViewer: React.FC = () => {
  const [procedures, setProcedures] = useState<ARProcedure[]>([]);
  const [activeProcedure, setActiveProcedure] = useState<ARProcedure | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [showOverview, setShowOverview] = useState(false);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const [enhancedStepData, setEnhancedStepData] = useState<{ detailedAnnotation: string, specificWarning: string, bestPractices: string[] } | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
      const load = async () => {
          const data = await getARProcedures('Centrifugal Pump');
          setProcedures(data);
      };
      load();
  }, []);

  useEffect(() => {
      setEnhancedStepData(null);
  }, [stepIndex, activeProcedure]);

  const handleEnhanceStep = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!activeProcedure) return;
      setIsEnhancing(true);
      try {
          const currentStep = activeProcedure.spatialAnchors[stepIndex];
          const data = await enhanceARStep(activeProcedure.title, currentStep.annotation, activeProcedure.assetType);
          setEnhancedStepData(data);
      } catch (error) {
          console.error("Failed to enhance step", error);
      } finally {
          setIsEnhancing(false);
      }
  };

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
                            className="w-full p-4 glass-card/10 hover:glass-card/20 border border-white/10 rounded-2xl flex items-center justify-between transition-all backdrop-blur-md"
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
  const isLastStep = stepIndex === activeProcedure.spatialAnchors.length - 1;

  const handleNext = () => {
      if (isLastStep) {
          setActiveProcedure(null);
          setStepIndex(0);
      } else {
          setStepIndex(prev => prev + 1);
      }
  };

  const handlePrev = () => {
      setStepIndex(prev => Math.max(prev - 1, 0));
  };

  const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;
      
      if (isLeftSwipe) {
          handleNext();
      } else if (isRightSwipe) {
          handlePrev();
      }
  };

  return (
      <div className="relative h-[600px] rounded-[3rem] overflow-hidden bg-black border-8 border-slate-900 shadow-2xl select-none">
          {/* Simulated Camera Feed Background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
          
          {/* AR Overlay UI */}
          <div 
              className="absolute inset-0 z-10 flex flex-col justify-between p-6"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
          >
              <div className="flex flex-col gap-3">
                  <div className="flex justify-start">
                      <button 
                          onClick={() => { setActiveProcedure(null); setStepIndex(0); }} 
                          className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-white shadow-lg border border-white/10 transition-colors z-20"
                      >
                          <ChevronLeft size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Back to Procedures</span>
                      </button>
                  </div>
                  <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white max-w-[80%]">
                      <button 
                          onClick={(e) => { e.stopPropagation(); setShowOverview(true); }}
                          className="flex items-center gap-3 mb-2 hover:glass-card/10 p-2 -ms-2 rounded-xl transition-colors active:scale-95 group"
                      >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <List size={16} />
                          </div>
                          <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-indigo-300">Step {stepIndex + 1} of {activeProcedure.spatialAnchors.length}</p>
                              <div className="flex gap-1 mt-1">
                                  {activeProcedure.spatialAnchors.map((_, idx) => (
                                      <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === stepIndex ? 'w-4 bg-indigo-500' : 'w-1.5 glass-card/20'}`} />
                                  ))}
                              </div>
                          </div>
                      </button>
                      <h3 className="text-lg font-bold leading-tight mb-2">{currentStep.annotation}</h3>
                      
                      {!enhancedStepData ? (
                          <button 
                              onClick={handleEnhanceStep}
                              disabled={isEnhancing}
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:text-indigo-200 transition-colors bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30 disabled:opacity-50"
                          >
                              {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              {isEnhancing ? 'Enhancing...' : 'AI Enhance Step'}
                          </button>
                      ) : (
                          <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                              <p className="text-xs text-slate-300 leading-relaxed border-s-2 border-indigo-500 ps-3">
                                  {enhancedStepData.detailedAnnotation}
                              </p>
                              
                              {enhancedStepData.specificWarning && (
                                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                                      <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                      <p className="text-[10px] text-red-200 font-bold leading-tight">{enhancedStepData.specificWarning}</p>
                                  </div>
                              )}
                              
                              {enhancedStepData.bestPractices && enhancedStepData.bestPractices.length > 0 && (
                                  <div className="glass-card/5 rounded-lg p-2">
                                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                                          <Info size={10} /> Best Practices
                                      </p>
                                      <ul className="list-disc list-inside text-[10px] text-slate-300 space-y-0.5">
                                          {enhancedStepData.bestPractices.map((bp, i) => (
                                              <li key={i}>{bp}</li>
                                          ))}
                                      </ul>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              </div>

              {/* Overview Modal */}
              {showOverview && (
                  <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center mb-8">
                          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Procedure Overview</h3>
                          <button onClick={(e) => { e.stopPropagation(); setShowOverview(false); }} className="p-3 glass-card/10 hover:glass-card/20 rounded-full text-white transition-colors"><X size={20}/></button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pe-2">
                          {activeProcedure.spatialAnchors.map((step, idx) => (
                              <button
                                  key={idx}
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      setStepIndex(idx);
                                      setShowOverview(false);
                                  }}
                                  className={`w-full text-start p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                                      idx === stepIndex 
                                          ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                                          : 'glass-card/5 border-white/10 text-slate-300 hover:glass-card/10 hover:border-white/20'
                                  }`}
                              >
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-black text-xs shrink-0 ${
                                      idx === stepIndex ? 'bg-indigo-500 text-white' : 'glass-card/10 text-slate-400'
                                  }`}>
                                      {idx + 1}
                                  </div>
                                  <div>
                                      <p className={`font-bold text-sm mb-1 ${idx === stepIndex ? 'text-white' : 'text-slate-200'}`}>{step.annotation}</p>
                                      {step.warning && (
                                          <p className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1">
                                              <AlertTriangle size={10}/> {step.warning}
                                          </p>
                                      )}
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              )}

              {/* Spatial Anchor Simulation */}
              <div 
                  className="absolute top-1/2 start-1/2 transform rtl:translate-x-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-pulse cursor-pointer hover:scale-110 transition-transform active:scale-95 z-20"
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
              >
                  <div className="w-16 h-16 border-4 border-indigo-500 rounded-full flex items-center justify-center bg-indigo-500/20 shadow-lg shadow-indigo-500/20">
                      <div className="w-2 h-2 glass-card rounded-full"></div>
                  </div>
                  {currentStep.warning && (
                      <div className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                          <AlertTriangle size={14}/> {currentStep.warning}
                      </div>
                  )}
              </div>

              {/* Controls */}
              <div className="flex gap-4 items-end z-20">
                  <div className="flex-1 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Required PPE Check</p>
                      <div className="flex flex-wrap gap-2">
                          {activeProcedure.requiredPPE.map((ppe, i) => (
                              <span key={i} className="text-[9px] glass-card/20 px-2 py-1 rounded text-white font-bold">{ppe}</span>
                          ))}
                      </div>
                  </div>
                  
                  <div className="flex gap-2">
                      {stepIndex > 0 && (
                          <button 
                              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                              className="h-14 px-4 glass-card/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform"
                          >
                              <ChevronLeft size={24}/>
                          </button>
                      )}
                      
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleNext(); }}
                          className={`h-14 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all ${isLastStep ? 'bg-emerald-500 text-white' : 'glass-card text-slate-900'}`}
                      >
                          <span className="text-xs font-black uppercase tracking-widest">{isLastStep ? 'Finish' : 'Mark as Complete'}</span>
                          {isLastStep ? <CheckCircle2 size={18}/> : <ChevronRight size={18}/>}
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
};

export default ARProcedureViewer;
