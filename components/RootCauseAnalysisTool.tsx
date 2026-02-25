
import React, { useState } from 'react';
import { 
  GitMerge, ArrowRight, Save, Plus, Trash2, 
  BrainCircuit, FileText, CheckCircle2 
} from 'lucide-react';

const RootCauseAnalysisTool: React.FC = () => {
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  const [problem, setProblem] = useState('');
  const [rootCause, setRootCause] = useState('');

  const updateWhy = (index: number, val: string) => {
      const newWhys = [...whys];
      newWhys[index] = val;
      setWhys(newWhys);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex items-center gap-5 border-b border-slate-200 pb-6">
            <div className="bg-orange-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-orange-500/20">
                <GitMerge size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">RCA Engine</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-4 border-orange-500 pl-4">Structured Root Cause Analysis (5-Whys)</p>
            </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Problem Statement</label>
                <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-orange-500 transition-all"
                    placeholder="Describe the incident or failure..."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                />
            </div>

            <div className="space-y-4 relative">
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100 -z-10"></div>
                {whys.map((why, i) => (
                    <div key={i} className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0 border-4 border-white">
                            {i+1}
                        </div>
                        <div className="flex-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Why did this happen?</label>
                            <input 
                                type="text"
                                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-medium text-slate-700 outline-none focus:border-indigo-500 transition-all shadow-sm"
                                placeholder="Enter cause..."
                                value={why}
                                onChange={(e) => updateWhy(i, e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-emerald-100">
                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16}/> Root Cause Conclusion
                </h3>
                <textarea 
                    className="w-full p-4 bg-white border-2 border-emerald-100 rounded-2xl font-bold text-slate-800 outline-none h-32 resize-none"
                    placeholder="Summarize the root cause identified..."
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                />
                <button className="mt-4 bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition active:scale-95 flex items-center gap-2">
                    <Save size={16}/> Save Analysis
                </button>
            </div>
        </div>
    </div>
  );
};

export default RootCauseAnalysisTool;
