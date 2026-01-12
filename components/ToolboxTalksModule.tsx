
import React, { useState } from 'react';
import { suggestToolboxTopic } from '../services/geminiService';
import { ToolboxTalk } from '../types';
import { 
  BookOpen, Sparkles, Loader2, Calendar, MapPin, 
  UserCheck, FileText, Send, CheckCircle2, ChevronRight, Wand2 
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const ToolboxTalksModule: React.FC = () => {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [topicData, setTopicData] = useState<{ topic: string; summary: string; keyPoints: string[] } | null>(null);
  const [history, setHistory] = useState<ToolboxTalk[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await suggestToolboxTopic(currentUser.department, ['High heat index', 'Lifting operations']);
      setTopicData(result);
    } catch (e) {
      alert("Failed to suggest TBT topic.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogTalk = () => {
    if (!topicData) return;
    const newTbt: ToolboxTalk = {
      id: `TBT-${Date.now()}`,
      topic: topicData.topic,
      location: currentUser.department,
      date: new Date().toLocaleDateString(),
      presenter: currentUser.name,
      attendeesCount: 24,
      summary: topicData.summary,
      aiSuggestedTopic: true
    };
    setHistory([newTbt, ...history]);
    setTopicData(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-2">
        <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-xl">
          <BookOpen size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Toolbox Talks</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Daily Safety Briefing Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 h-fit bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Wand2 size={16} className="text-indigo-600"/> Briefing Planner
              </h3>
              <p className="text-sm text-slate-600 mb-8 font-medium leading-relaxed">
                  Use the AD6.Ai Intelligence engine to generate a briefing topic tailored to current site hazards and seasonal UAE alerts.
              </p>
              <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                  {loading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                  Generate AI Safety Topic
              </button>
          </div>

          <div className="lg:col-span-7">
              {topicData ? (
                  <div className="bg-white rounded-[3rem] p-10 shadow-3xl border-2 border-indigo-100 animate-in slide-in-from-right-8 duration-500 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-5 text-indigo-600 pointer-events-none">
                          <BookOpen size={240} />
                      </div>
                      
                      <div className="flex justify-between items-start mb-8 relative z-10">
                          <div>
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">AI Blueprint Ready</span>
                              <h3 className="text-2xl font-black text-slate-800 mt-3 tracking-tight uppercase leading-none">{topicData.topic}</h3>
                          </div>
                      </div>

                      <div className="space-y-8 relative z-10 flex-1">
                          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Executive Summary</p>
                              <p className="text-sm font-bold text-slate-700 italic border-l-4 border-indigo-500 pl-6 py-1">{topicData.summary}</p>
                          </div>

                          <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mandatory Briefing Points</p>
                              <div className="grid gap-3">
                                  {topicData.keyPoints.map((point, i) => (
                                      <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:translate-x-2">
                                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">{i+1}</div>
                                          <p className="text-xs font-bold text-slate-800">{point}</p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-slate-100 flex gap-4">
                          <button 
                            onClick={handleLogTalk}
                            className="flex-1 bg-emerald-600 text-white py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-700 transition active:scale-95 flex items-center justify-center gap-2"
                          >
                              <CheckCircle2 size={18}/> Commit attendance & Close
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] h-full min-h-[400px] flex flex-col items-center justify-center text-center p-16">
                      <div className="bg-slate-50 p-8 rounded-full mb-6 animate-pulse">
                          <BookOpen size={64} className="opacity-20" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Awaiting Topic Definition</h3>
                      <p className="text-sm text-slate-400 mt-2 max-w-xs font-medium italic">Generate a briefing topic to begin capturing attendees and signatures.</p>
                  </div>
              )}
          </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recent Sessions</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-8 py-5">Topic</th>
                          <th className="px-8 py-5">Site Area</th>
                          <th className="px-8 py-5">Presenter</th>
                          <th className="px-8 py-5">Date</th>
                          <th className="px-8 py-5 text-center">Attendees</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {history.length > 0 ? history.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-8 py-6 font-black text-slate-800 text-sm">{t.topic}</td>
                              <td className="px-8 py-6 text-xs text-slate-500 font-bold uppercase">{t.location}</td>
                              <td className="px-8 py-6 text-xs text-slate-500 font-bold">{t.presenter}</td>
                              <td className="px-8 py-6 text-xs text-slate-500 font-mono">{t.date}</td>
                              <td className="px-8 py-6 text-center">
                                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">{t.attendeesCount}</span>
                              </td>
                          </tr>
                      )) : (
                          <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-300 italic font-medium uppercase tracking-widest text-xs">No briefing records for current shift</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default ToolboxTalksModule;
