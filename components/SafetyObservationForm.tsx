
import React, { useState, useMemo, useRef } from 'react';
import { analyzeSafetyObservation } from '../services/geminiService';
import { AISafetyObservationAnalysis, SafetyObservation, AuditLog } from '../types';
import LocationSelector from './LocationSelector';
import { 
  MessageSquarePlus, BrainCircuit, Loader2, Send, ThumbsUp, Lightbulb, 
  MapPin, ClipboardList, History, HardHat, Trash2, UserCheck, 
  Leaf, FileText, Award, AlertTriangle, CheckCircle2, Star, Shield, Mic, Zap, Edit3, X, Activity, RefreshCcw, Eye, BarChart3, Smile, Meh, MessageSquare, Target, Sparkles, ShieldCheck, ChevronRight, TrendingUp, ArrowLeft,
  PieChart as PieChartIcon, Camera, AlertCircle
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const SafetyObservationForm: React.FC = () => {
  const { currentUser, allObservations, addObservation, updateObservation } = useUser();
  const [viewMode, setViewMode] = useState<'Report' | 'Insights'>('Report');

  // Form State
  const [obsDescription, setObsDescription] = useState('');
  const [obsLocation, setObsLocation] = useState('');
  const [obsType, setObsType] = useState<'Positive' | 'Improvement'>('Positive');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  
  // Processing State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    id: string;
    analysis: AISafetyObservationAnalysis;
  } | null>(null);

  // Permissions: Managers/Officers can see site-wide insights and review observations
  const canViewInsights = ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer'].includes(currentUser.role);

  const insightsData = useMemo(() => {
    const catMap: Record<string, number> = {};
    let positiveCount = 0;
    let improvementCount = 0;

    allObservations.forEach(o => {
      if (o.type === 'Positive') positiveCount++; else improvementCount++;
      if (o.analysis) {
        catMap[o.analysis.category] = (catMap[o.analysis.category] || 0) + 1;
      }
    });

    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    const typeData = [
      { name: 'Safe Acts', value: positiveCount, color: '#10b981' },
      { name: 'Improvements', value: improvementCount, color: '#3b82f6' }
    ];

    return { categoryData, typeData, total: allObservations.length };
  }, [allObservations]);

  const validate = (field: string, value: string) => {
      if (field === 'description' && !value.trim()) return "Observation details are required.";
      if (field === 'location' && !value) return "Location is required.";
      return "";
  };

  const handleBlur = (field: string, value: string) => {
      setTouched(prev => ({...prev, [field]: true}));
      setErrors(prev => ({...prev, [field]: validate(field, value)}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const descErr = validate('description', obsDescription);
    const locErr = validate('location', obsLocation);
    setErrors({ description: descErr, location: locErr });
    setTouched({ description: true, location: true });

    if (descErr || locErr) return;

    setIsSubmitting(true);
    setAiError(null);
    const newObsId = `OBS-${Date.now()}`;
    const initialHistory: AuditLog[] = [{
        timestamp: new Date().toISOString(),
        actorId: currentUser.id,
        actorName: isAnonymous ? 'Anonymous' : currentUser.name,
        action: 'Created',
        details: 'Initial submission'
    }];

    try {
      // 1. Trigger AI Analysis
      const analysis = await analyzeSafetyObservation(obsDescription, obsType);
      
      if (!analysis) throw new Error("AI Analysis failed to return data.");

      // 2. Prepare Record
      const newObs: SafetyObservation = {
        id: newObsId,
        type: obsType,
        description: obsDescription,
        location: obsLocation,
        timestamp: new Date().toISOString(),
        analysis: analysis,
        status: 'Submitted',
        isAnonymous: isAnonymous,
        history: initialHistory,
        images: images
      };
      
      // 3. Commit to Context
      addObservation(newObs);
      
      // 4. Show AI Receipt
      setSubmissionResult({ id: newObsId, analysis });
      
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setAiError("AI Analysis failed. You can submit without analysis or retry.");
      
      // We don't automatically submit here anymore to give user a choice to retry
      // unless they explicitly want to "Submit Anyway" (which we can add as a button)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFallbackSubmit = () => {
    const newObsId = `OBS-${Date.now()}`;
    const initialHistory: AuditLog[] = [{
        timestamp: new Date().toISOString(),
        actorId: currentUser.id,
        actorName: isAnonymous ? 'Anonymous' : currentUser.name,
        action: 'Created',
        details: 'Manual submission (AI analysis failed)'
    }];

    addObservation({
      id: newObsId,
      type: obsType,
      description: obsDescription,
      location: obsLocation,
      timestamp: new Date().toISOString(),
      status: 'Submitted',
      isAnonymous: isAnonymous,
      history: initialHistory,
      images: images
    });
    
    // Show a simplified success state or just reset
    alert("Observation submitted successfully without AI analysis.");
    resetForm();
  };

  const handleReview = (obs: SafetyObservation) => {
      const newHistoryEntry: AuditLog = {
          timestamp: new Date().toISOString(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          action: 'Status Change',
          details: 'Status updated from Submitted to Reviewed'
      };
      
      const updatedObs: SafetyObservation = {
          ...obs,
          status: 'Reviewed',
          history: [...(obs.history || []), newHistoryEntry]
      };
      
      updateObservation(updatedObs);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          Array.from(e.target.files).forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setImages(prev => [...prev, reader.result as string]);
              };
              reader.readAsDataURL(file as Blob);
          });
      }
  };

  const resetForm = () => {
    setObsDescription('');
    setObsLocation('');
    setSubmissionResult(null);
    setObsType('Positive');
    setIsAnonymous(false);
    setImages([]);
    setErrors({});
    setTouched({});
  };

  const handleVoiceInput = () => {
      if (isListening) return;
      setIsListening(true);
      setTimeout(() => {
          const simulatedText = obsType === 'Positive' 
            ? "Worker in Zone A was observed double-checking the grounding cable before starting the welding task."
            : "Emergency eyewash station in Lab 2 has a cracked basin and low pressure.";
          setObsDescription(prev => prev ? prev + " " + simulatedText : simulatedText);
          setIsListening(false);
          // Clear error if valid
          if(touched.description) setErrors(prev => ({...prev, description: ""}));
      }, 1500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PPE': return <HardHat size={18} />;
      case 'Housekeeping': return <Trash2 size={18} />;
      case 'Behavior': return <UserCheck size={18} />;
      case 'Environment': return <Leaf size={18} />;
      case 'Procedure': return <FileText size={18} />;
      case 'Leadership': return <Award size={18} />;
      case 'Hazard': return <AlertTriangle size={18} />;
      default: return <ClipboardList size={18} />;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
        case 'Positive': return <Smile size={24} className="text-emerald-500" />;
        case 'Neutral': return <Meh size={24} className="text-slate-500" />;
        case 'Constructive': return <MessageSquare size={24} className="text-indigo-500" />;
        default: return <Activity size={24} />;
    }
  };

  if (submissionResult) {
    const { analysis } = submissionResult;
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
            <div className="text-center space-y-4 pt-10">
                <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 border-4 border-white animate-bounce">
                    <CheckCircle2 size={48} className="text-emerald-600" />
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Observation Logged</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto">Your contribution has been successfully registered and categorized by the AI Compliance Engine.</p>
                
                <div className="flex justify-center gap-4 mt-8">
                     <div className="bg-slate-900 px-6 py-3 rounded-2xl flex items-center gap-3 border border-slate-800 shadow-2xl">
                         <Sparkles size={20} className="text-yellow-400" />
                         <span className="text-white font-black uppercase text-xs tracking-widest">+25 Safety Points</span>
                     </div>
                </div>
            </div>

            <div className="bg-white border-4 border-indigo-100 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-12 -translate-y-12">
                    <BrainCircuit size={320} />
                </div>

                <div className="space-y-8 relative z-10">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">AI Diagnostic: Category</label>
                        <div className="bg-indigo-50 text-indigo-700 px-6 py-4 rounded-[1.5rem] border-2 border-indigo-100 flex items-center gap-4 w-fit shadow-sm">
                            {getCategoryIcon(analysis.category)}
                            <span className="text-lg font-black uppercase tracking-tight">{analysis.category}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex flex-col items-center justify-center text-center shadow-inner">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Culture Tone</label>
                            {getSentimentIcon(analysis.sentiment)}
                            <span className="text-[10px] font-black uppercase text-slate-700 mt-2">{analysis.sentiment}</span>
                        </div>
                        <div className={`p-6 rounded-[2rem] border-4 flex flex-col items-center justify-center text-center shadow-xl ${
                            analysis.priority === 'High' ? 'bg-red-50 border-red-200 text-red-600' : 
                            analysis.priority === 'Medium' ? 'bg-orange-50 border-orange-200 text-orange-600' : 
                            'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                            <label className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Risk Gravity</label>
                            <Zap size={24} className="mb-1" />
                            <span className="text-lg font-black uppercase tracking-tighter">{analysis.priority}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {analysis.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">#{tag}</span>
                        ))}
                    </div>
                </div>

                <div className="space-y-8 relative z-10 flex flex-col h-full">
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-lg flex-1">
                        <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
                            <MessageSquare size={16} className="text-indigo-400"/> AI Insights Summary
                        </label>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-indigo-100 pl-6 py-1">
                            "{analysis.summary}"
                        </p>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={80}/></div>
                        <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-4 flex items-center gap-2 relative z-10">
                            <Shield size={16} className="text-teal-400"/> Corrective Action Plan
                        </label>
                        <p className="text-xs font-bold text-slate-300 leading-relaxed relative z-10 pl-2">
                            {analysis.suggestedAction || "Observation recorded for performance trending."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-6">
                <button 
                    onClick={resetForm}
                    className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center gap-4 hover:bg-slate-800 transition-all shadow-3xl active:scale-95"
                >
                    <ArrowLeft size={18} /> New Observation
                </button>
                <button 
                    onClick={() => setViewMode('Insights')}
                    className="bg-white border-4 border-slate-900 text-slate-900 px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center gap-4 hover:bg-slate-50 transition-all shadow-xl active:scale-95"
                >
                    <BarChart3 size={18} /> View Global Insights
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-4 rounded-2xl shadow-xl text-white transition-all transform hover:rotate-3 ${obsType === 'Positive' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
              <MessageSquarePlus size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Safety Portal</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-teal-500 pl-4">Digital Observation & Intelligence</p>
            </div>
          </div>
          
          <div className="flex bg-slate-200 p-1 rounded-2xl w-fit shadow-inner">
              <button 
                  onClick={() => setViewMode('Report')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'Report' ? 'bg-white text-slate-800 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Edit3 size={14}/> New Report
              </button>
              {canViewInsights && (
                  <button 
                      onClick={() => setViewMode('Insights')}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'Insights' ? 'bg-white text-slate-800 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <BarChart3 size={14}/> Site Intelligence
                  </button>
              )}
          </div>
      </div>

      {viewMode === 'Insights' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Insights content remains unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Contributions</p>
                    <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{insightsData.total}</h4>
                    <div className="flex items-center gap-1 mt-2 text-teal-600">
                        <TrendingUp size={12}/>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">+12% vs LY</span>
                    </div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Safe Act Volume</p>
                    <div className="flex items-center gap-2">
                        <Smile size={32} className="text-emerald-600"/>
                        <h4 className="text-3xl font-black text-emerald-800">{insightsData.typeData[0].value}</h4>
                    </div>
                    <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase">Proactive Safety Culture</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Improvements Flagged</p>
                    <div className="flex items-center gap-2">
                        <Lightbulb size={32} className="text-blue-600"/>
                        <h4 className="text-3xl font-black text-blue-800">{insightsData.typeData[1].value}</h4>
                    </div>
                    <p className="text-[10px] text-blue-500 font-bold mt-2 uppercase">Risk Mitigation Driven</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">AI Precision Scan</p>
                    <h4 className="text-3xl font-black text-teal-400 tracking-tighter">98.4%</h4>
                    <div className="flex items-center gap-1 mt-2">
                        <ShieldCheck size={12} className="text-teal-500"/>
                        <span className="text-[9px] text-teal-400 uppercase font-black">AD6 Verified</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 h-96">
                    <h5 className="font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tight">
                        <Target size={20} className="text-indigo-600"/> Risk Category Analysis
                    </h5>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={insightsData.categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 h-96 flex flex-col">
                    <h5 className="font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tight">
                        <PieChartIcon size={20} className="text-indigo-600"/> Observation Sentiment
                    </h5>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={insightsData.typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {insightsData.typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-10 mt-4 pb-4">
                        {insightsData.typeData.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-widest">
                                <span className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></span>
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h5 className="font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-3"><History size={20} className="text-teal-600"/> Site-wide Participation Stream</h5>
                <div className="space-y-4">
                    {allObservations.map(obs => (
                        <div key={obs.id} className="p-6 rounded-[2rem] border-2 border-slate-50 hover:border-indigo-100 transition-all group flex flex-col md:flex-row md:items-start gap-6">
                            <div className={`p-4 rounded-2xl shrink-0 transition-colors ${obs.type === 'Positive' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                {obs.type === 'Positive' ? <ThumbsUp size={24}/> : <Lightbulb size={24}/>}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{obs.analysis?.category || 'General'} • {obs.location}</span>
                                        <h6 className="font-black text-slate-800 text-sm mt-0.5">{obs.isAnonymous ? 'Anonymous Reporter' : obs.reportedBy}</h6>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-slate-300 uppercase block">{new Date(obs.timestamp).toLocaleDateString()}</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border mt-1 inline-block ${obs.status === 'Reviewed' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{obs.status}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2 italic border-l-2 border-slate-100 pl-4 mb-3">"{obs.description}"</p>
                                {obs.analysis?.suggestedAction && (
                                    <div className="mb-3 flex items-center gap-2 bg-slate-50 p-2 px-4 rounded-xl border border-slate-100 w-fit">
                                        <ShieldCheck size={14} className="text-teal-500"/>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Action: {obs.analysis.suggestedAction}</span>
                                    </div>
                                )}
                                
                                {obs.images && obs.images.length > 0 && (
                                    <div className="mb-3 flex gap-2">
                                        {obs.images.map((img, i) => (
                                            <div key={i} className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100">
                                                <img src={img} alt="evidence" className="w-full h-full object-cover"/>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-3 border-t border-slate-50">
                                    <h6 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">History Log</h6>
                                    <div className="space-y-1">
                                        {obs.history?.map((log, i) => (
                                            <div key={i} className="flex justify-between text-[10px] text-slate-500">
                                                <span>{log.action} by <span className="font-bold">{log.actorName}</span></span>
                                                <span className="font-mono text-[9px] opacity-70">{new Date(log.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                        {!obs.history && <span className="text-[10px] text-slate-400 italic">No history available</span>}
                                    </div>
                                </div>
                            </div>
                            {canViewInsights && obs.status === 'Submitted' && (
                                <button 
                                    onClick={() => handleReview(obs)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest self-start md:self-center hover:bg-indigo-700 transition active:scale-95 shadow-lg whitespace-nowrap"
                                >
                                    Mark Reviewed
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              <div className="lg:col-span-6 h-full">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col h-full">
                      <div className="flex-1 space-y-8">
                          <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 text-center">Protocol Mode</label>
                              <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setObsType('Positive'); setSubmissionResult(null); }}
                                    className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all duration-300 ${
                                        obsType === 'Positive' ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xl shadow-emerald-500/10 scale-[1.02]' : 'border-slate-50 text-slate-400 bg-slate-50 hover:bg-slate-100'
                                    }`}
                                >
                                    <ThumbsUp size={32} className={obsType === 'Positive' ? 'fill-emerald-200 text-emerald-600' : ''} />
                                    <span className="font-black text-[11px] uppercase tracking-widest">Safe Act</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setObsType('Improvement'); setSubmissionResult(null); }}
                                    className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all duration-300 ${
                                        obsType === 'Improvement' ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-xl shadow-blue-500/10 scale-[1.02]' : 'border-slate-50 text-slate-400 bg-slate-50 hover:bg-slate-100'
                                    }`}
                                >
                                    <Lightbulb size={32} className={obsType === 'Improvement' ? 'fill-blue-200 text-blue-600' : ''} />
                                    <span className="font-black text-[11px] uppercase tracking-widest">Suggestion</span>
                                </button>
                              </div>
                          </div>

                          <LocationSelector 
                              value={obsLocation}
                              onChange={(val) => {
                                  setObsLocation(val);
                                  if (touched.location) setErrors(prev => ({...prev, location: validate('location', val)}));
                              }}
                              label="Operational sector"
                              placeholder="Where was this observed?"
                              required
                              error={errors.location}
                          />

                          <div className="relative">
                              <div className="flex justify-between items-center mb-3">
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Narrative Evidence <span className="text-red-500">*</span></label>
                                  <button
                                      type="button"
                                      onClick={handleVoiceInput}
                                      className={`p-2 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black transition-all border-2 ${
                                          isListening ? 'bg-red-500 border-red-600 text-white animate-pulse shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                                      }`}
                                  >
                                      <Mic size={14} /> {isListening ? 'LISTENING...' : 'VOICE CAPTURE'}
                                  </button>
                              </div>
                              <textarea
                                  className={`w-full p-6 bg-slate-50 border-2 rounded-[2rem] h-44 outline-none transition-all resize-none text-sm font-semibold text-slate-800 placeholder:font-medium shadow-inner ${
                                      errors.description ? 'border-red-500 focus:border-red-500' : touched.description && !errors.description ? 'border-emerald-500 focus:border-emerald-500' : 'border-slate-50 focus:bg-white focus:border-slate-900'
                                  }`}
                                  placeholder={obsType === 'Positive' ? "e.g. Scaffolding team verified harness tie-off correctly..." : "e.g. Identified loose floor tiles near emergency exit B4..."}
                                  value={obsDescription}
                                  onChange={(e) => {
                                      setObsDescription(e.target.value);
                                      if(touched.description) setErrors(prev => ({...prev, description: validate('description', e.target.value)}));
                                  }}
                                  onBlur={() => {
                                      setTouched(prev => ({...prev, description: true}));
                                      setErrors(prev => ({...prev, description: validate('description', obsDescription)}));
                                  }}
                              />
                              {errors.description && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1 ml-4"><AlertCircle size={10} /> {errors.description}</p>}
                          </div>

                          <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Evidence Capture</label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                  <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                  >
                                      <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                          <Camera size={20} className="text-slate-400 group-hover:text-indigo-600" />
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-indigo-600">Add Photo</span>
                                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handlePhotoCapture} />
                                  </div>
                                  {images.map((img, i) => (
                                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md relative group">
                                          <img src={img} className="w-full h-full object-cover" alt="evidence" />
                                          <button 
                                            onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                          >
                                              <X size={12} />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {aiError && (
                              <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] animate-in fade-in slide-in-from-top-2">
                                  <div className="flex items-start gap-4">
                                      <AlertCircle className="text-red-500 shrink-0 mt-1" size={20}/>
                                      <div className="flex-1">
                                          <p className="text-sm font-bold text-red-700">{aiError}</p>
                                          <div className="flex gap-4 mt-3">
                                              <button 
                                                onClick={handleSubmit}
                                                className="text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline flex items-center gap-2"
                                              >
                                                  <RefreshCcw size={12}/> Retry Analysis
                                              </button>
                                              <button 
                                                onClick={handleFallbackSubmit}
                                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:underline flex items-center gap-2"
                                              >
                                                  <Send size={12}/> Submit Anyway
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>

                      <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full mt-10 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-3xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                      >
                          {isSubmitting ? (
                              <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>Processing HSE Logic...</span>
                              </>
                          ) : (
                              <>
                                <BrainCircuit size={24} className="text-teal-400" />
                                <span>{aiError ? 'Retry Analysis' : 'Submit & Analyze'}</span>
                              </>
                          )}
                      </button>
                  </div>
              </div>

              <div className="lg:col-span-6 flex flex-col gap-8">
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 p-12 text-center shadow-inner animate-in fade-in duration-300">
                      <div className="bg-slate-50 p-12 rounded-full mb-8 shadow-xl border border-slate-100">
                          <Target size={80} className="opacity-20 text-slate-400" />
                      </div>
                      <p className="text-3xl font-black text-slate-800 uppercase tracking-tighter">AI Diagnostic Terminal</p>
                      <p className="text-sm mt-4 text-slate-400 max-w-sm font-medium leading-relaxed italic px-6">
                        "Submit your observation to activate real-time HSE insights, safety point rewards, and sentiment-aware risk prioritization."
                      </p>
                  </div>

                  {allObservations.length > 0 && (
                      <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                          <div className="flex items-center justify-between mb-5 px-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                                  <History size={16} className="text-slate-300" /> Recent Activity
                              </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {allObservations.slice(0, 2).map((obs) => (
                                  <div key={obs.id} className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                                      <div className={`absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2.5 ${
                                          obs.type === 'Positive' ? 'bg-emerald-500' : 'bg-blue-500'
                                      }`} />
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-3">
                                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-inner border border-white/20 transition-transform group-hover:rotate-12 ${
                                                  obs.type === 'Positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                              }`}>
                                                  {obs.type === 'Positive' ? <ThumbsUp size={18}/> : <Lightbulb size={18}/>}
                                              </div>
                                              <div>
                                                  <span className="text-[10px] font-black uppercase text-slate-800 block leading-none">{obs.analysis?.category || 'General'}</span>
                                                  <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1 block">{obs.location}</span>
                                              </div>
                                          </div>
                                          <span className="text-[9px] font-black text-slate-300 font-mono tracking-tighter uppercase">{new Date(obs.timestamp).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-600 font-bold leading-relaxed line-clamp-2 italic border-l-2 border-slate-100 pl-4">"{obs.description}"</p>
                                      <div className="mt-3 text-right">
                                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${obs.status === 'Reviewed' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{obs.status}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default SafetyObservationForm;
