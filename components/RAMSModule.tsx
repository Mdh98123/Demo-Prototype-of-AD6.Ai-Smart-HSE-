
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { RAMS, RAMSRevision } from '../types';
import { 
  FileDigit, Plus, Shield, Search, Filter, 
  ChevronRight, Download, Users, CheckCircle2, 
  Activity, AlertTriangle, PenTool, Zap, History,
  LayoutGrid, List, AlertOctagon, Calculator,
  GitBranch, FileDiff, Save, X, Clock, Archive
} from 'lucide-react';

const RAMSModule: React.FC = () => {
  const { currentUser } = useUser();
  
  // Risk Matrix State for New RAMS
  const [newProb, setNewProb] = useState<1|2|3|4|5>(1);
  const [newSev, setNewSev] = useState<1|2|3|4|5>(1);
  const [showCalculator, setShowCalculator] = useState(false);

  // Version Control State
  const [selectedRams, setSelectedRams] = useState<RAMS | null>(null);
  const [changeDescription, setChangeDescription] = useState('');

  const calculateRisk = (prob: number, sev: number) => {
      const score = prob * sev;
      let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      if (score >= 15) level = 'Critical';
      else if (score >= 10) level = 'High';
      else if (score >= 5) level = 'Medium';
      return { score, level };
  };

  const currentRisk = calculateRisk(newProb, newSev);

  const [ramsList, setRamsList] = useState<RAMS[]>([
    {
        id: 'RAMS-201',
        title: 'Working at Height - Tower Crane Assembly',
        activity: 'Structural Installation',
        version: '1.5',
        status: 'Approved',
        probability: 4,
        severity: 4,
        riskScore: 16,
        riskLevel: 'Critical',
        hazards: ['Falls from height', 'Dropped objects', 'Wind loading'],
        controls: ['Full body harness', 'Exclusion zone', 'Anemometer monitoring'],
        briefingLogs: [
            { workerName: 'Rahul Gupta', signedAt: '2024-05-20 07:00', signatureHash: 'ax89-p21' },
            { workerName: 'Ahmed Salem', signedAt: '2024-05-20 07:05', signatureHash: 'bz44-q90' }
        ],
        revisionHistory: [
            { version: '1.4', date: '2024-05-15T10:00:00Z', changedBy: 'Sarah Jones', changeDescription: 'Updated wind speed limits for crane operation.', previousRiskScore: 16 },
            { version: '1.3', date: '2024-05-10T09:30:00Z', changedBy: 'Sarah Jones', changeDescription: 'Initial approval for Phase 2.', previousRiskScore: 12 }
        ]
    },
    {
        id: 'RAMS-202',
        title: 'Confined Space Entry - Tank C4',
        activity: 'Internal Coating',
        version: '2.0',
        status: 'Under Review',
        probability: 3,
        severity: 4,
        riskScore: 12,
        riskLevel: 'High',
        hazards: ['Oxygen deficiency', 'Toxic vapors', 'Engulfment'],
        controls: ['Gas testing', 'Forced ventilation', 'Standby man'],
        briefingLogs: [],
        revisionHistory: [
             { version: '1.9', date: '2024-05-18T14:00:00Z', changedBy: 'Marcus Chen', changeDescription: 'Added forced ventilation requirement based on latest gas test.', previousRiskScore: 20 }
        ]
    }
  ]);

  const handleCreateRevision = () => {
      if (!selectedRams || !changeDescription) return;

      const currentVer = parseFloat(selectedRams.version);
      const nextVer = (currentVer + 0.1).toFixed(1);

      // Create a snapshot of the current state to push to history
      const newRevision: RAMSRevision = {
          version: selectedRams.version,
          date: new Date().toISOString(),
          changedBy: currentUser.name,
          changeDescription: changeDescription,
          previousRiskScore: selectedRams.riskScore
      };

      const updatedRams: RAMS = {
          ...selectedRams,
          version: nextVer,
          status: 'Under Review', // Reset status on change
          revisionHistory: [newRevision, ...selectedRams.revisionHistory]
      };

      setRamsList(prev => prev.map(r => r.id === updatedRams.id ? updatedRams : r));
      setSelectedRams(null); // Close modal
      setChangeDescription('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-5">
            <div className="bg-teal-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-teal-500/20">
                <FileDigit size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">RAMS Manager</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-teal-500 pl-4">Activity Risk Assessment & Method Statements</p>
            </div>
          </div>
          <div className="flex gap-4">
              <button onClick={() => setShowCalculator(!showCalculator)} className="bg-white border-2 border-slate-100 text-slate-500 px-6 py-4 rounded-[2rem] flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] hover:text-indigo-600 transition-all">
                  <Calculator size={18}/> Risk Matrix
              </button>
              <button className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition-all active:scale-95">
                  <Plus size={20} /> Initiate RAMS
              </button>
          </div>
      </div>

      {showCalculator && (
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-3xl mb-8 animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-start mb-8">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3"><AlertOctagon size={24} className="text-teal-400"/> Risk Calculator</h3>
                  <div className={`px-6 py-2 rounded-2xl border font-black uppercase text-xs tracking-widest ${
                      currentRisk.level === 'Critical' ? 'bg-red-500 border-red-400' :
                      currentRisk.level === 'High' ? 'bg-orange-500 border-orange-400' :
                      currentRisk.level === 'Medium' ? 'bg-yellow-500 border-yellow-400 text-slate-900' :
                      'bg-emerald-500 border-emerald-400'
                  }`}>
                      Score: {currentRisk.score} ({currentRisk.level})
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Probability (Likelihood)</label>
                      <div className="flex justify-between bg-white/10 p-2 rounded-2xl">
                          {[1,2,3,4,5].map(v => (
                              <button key={v} onClick={() => setNewProb(v as any)} className={`w-12 h-12 rounded-xl font-black transition-all ${newProb === v ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{v}</button>
                          ))}
                      </div>
                      <p className="text-[9px] text-slate-400 text-right uppercase font-bold">1 = Rare | 5 = Almost Certain</p>
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity (Impact)</label>
                      <div className="flex justify-between bg-white/10 p-2 rounded-2xl">
                          {[1,2,3,4,5].map(v => (
                              <button key={v} onClick={() => setNewSev(v as any)} className={`w-12 h-12 rounded-xl font-black transition-all ${newSev === v ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{v}</button>
                          ))}
                      </div>
                      <p className="text-[9px] text-slate-400 text-right uppercase font-bold">1 = Negligible | 5 = Catastrophic</p>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                  {ramsList.map(rams => (
                      <div key={rams.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-50 hover:border-teal-500/30 transition-all group relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-2 h-full transition-all group-hover:w-3 ${rams.riskLevel === 'Critical' ? 'bg-red-600' : rams.riskLevel === 'High' ? 'bg-orange-500' : 'bg-teal-500'}`} />
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border-2 shadow-sm ${rams.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{rams.status}</span>
                                  <h4 className="text-xl font-black text-slate-800 mt-3 tracking-tighter uppercase leading-tight">{rams.title}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Activity: {rams.activity}</p>
                              </div>
                              <div className="text-right">
                                  <div className="flex flex-col items-end">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score</p>
                                      <div className={`text-3xl font-black ${rams.riskScore >= 15 ? 'text-red-600' : rams.riskScore >= 10 ? 'text-orange-500' : 'text-emerald-600'}`}>{rams.riskScore}</div>
                                      <span className="text-[9px] font-bold uppercase text-slate-400">{rams.riskLevel}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Critical Controls</p>
                                  <div className="flex flex-wrap gap-2">
                                      {rams.controls.map((c, i) => (
                                          <span key={i} className="bg-white px-2.5 py-1 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 uppercase">{c}</span>
                                      ))}
                                  </div>
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                  <div className="flex items-center gap-4 text-slate-400">
                                      <div className="flex items-center gap-1.5"><Users size={14}/><span className="text-[10px] font-black">{rams.briefingLogs.length} Signatures</span></div>
                                      <div className="flex items-center gap-1.5 font-mono"><Zap size={14}/><span className="text-[9px]">V{rams.version}</span></div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button 
                                        onClick={() => setSelectedRams(rams)}
                                        className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
                                      >
                                          <GitBranch size={14}/> Revise / History
                                      </button>
                                      <button className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 transition-all shadow-xl">
                                          <Download size={18}/>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><PenTool size={18} className="text-teal-600"/> Briefing Terminal</h3>
                  <p className="text-xs text-slate-500 mb-8 font-medium leading-relaxed italic border-l-4 border-teal-500/20 pl-6">
                      Deploy a digital signature terminal to site workers for mandatory activity briefings.
                  </p>
                  <div className="space-y-4">
                      <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex items-center justify-between group cursor-pointer hover:border-teal-500 transition-all">
                          <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Active Activity</p>
                              <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tight">Crane Lift Site A</p>
                          </div>
                          <div className="p-3 bg-white rounded-xl text-teal-600 shadow-sm"><CheckCircle2 size={20}/></div>
                      </div>
                  </div>
                  <button className="w-full mt-8 bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition-all active:scale-95">
                      Open Site Terminal
                  </button>
              </div>
          </div>
      </div>

      {/* REVISION MODAL */}
      {selectedRams && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col md:flex-row h-[80vh] border-4 border-white animate-in zoom-in-95 duration-300">
                  
                  {/* Left: Revision Actions */}
                  <div className="w-full md:w-1/2 p-10 bg-slate-50 flex flex-col">
                      <div className="mb-8">
                          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">Version Control</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Managing: {selectedRams.id}</p>
                      </div>

                      <div className="flex-1 space-y-8">
                          <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                              <div className="flex justify-between items-center mb-6">
                                  <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Version</p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-3xl font-black text-slate-800">{selectedRams.version}</p>
                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[9px] font-black uppercase border border-emerald-100">Active Head</span>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Revision</p>
                                      <p className="text-3xl font-black text-indigo-600">{(parseFloat(selectedRams.version) + 0.1).toFixed(1)}</p>
                                  </div>
                              </div>
                              <div className="h-px bg-slate-100 mb-6"></div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                  <FileDiff size={14}/> Change Description
                              </label>
                              <textarea 
                                  className="w-full h-32 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 resize-none shadow-inner placeholder:text-slate-400 placeholder:font-medium"
                                  placeholder="Describe updates to controls, hazards, or scope to create a new revision..."
                                  value={changeDescription}
                                  onChange={(e) => setChangeDescription(e.target.value)}
                              />
                          </div>
                      </div>

                      <div className="mt-8 flex gap-4">
                          <button onClick={() => setSelectedRams(null)} className="px-8 py-4 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Cancel</button>
                          <button 
                            onClick={handleCreateRevision}
                            disabled={!changeDescription}
                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                              <Save size={16}/> Commit Revision
                          </button>
                      </div>
                  </div>

                  {/* Right: History Timeline */}
                  <div className="w-full md:w-1/2 p-10 bg-white overflow-y-auto custom-scrollbar relative">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8 sticky top-0 bg-white py-2 z-10 flex items-center gap-3">
                          <History size={18} className="text-teal-600"/> Revision Timeline
                      </h4>
                      
                      <div className="relative space-y-8 pl-8">
                          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                          
                          {selectedRams.revisionHistory.length === 0 ? (
                              <div className="text-center py-20">
                                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No previous revisions recorded.</p>
                              </div>
                          ) : (
                              selectedRams.revisionHistory.map((rev, idx) => (
                                  <div key={idx} className="relative z-10">
                                      <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-200 border-4 border-slate-300 shadow-sm"></div>
                                      <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-50 hover:border-teal-100 transition-all group opacity-85 hover:opacity-100">
                                          <div className="flex justify-between items-start mb-3">
                                              <div className="flex items-center gap-2">
                                                  <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-slate-500">V{rev.version}</span>
                                                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-red-100 flex items-center gap-1">
                                                      <Archive size={10}/> Superseded
                                                  </span>
                                              </div>
                                              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                  <Clock size={10}/> {new Date(rev.date).toLocaleDateString()}
                                              </span>
                                          </div>
                                          <p className="text-xs font-bold text-slate-600 mb-3 leading-relaxed">"{rev.changeDescription}"</p>
                                          <div className="flex justify-between items-end border-t border-slate-200 pt-3">
                                              <span className="text-[9px] font-black text-slate-400 uppercase">Auth: {rev.changedBy}</span>
                                              <span className="text-[9px] font-black text-teal-600 uppercase">Risk Score: {rev.previousRiskScore}</span>
                                          </div>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RAMSModule;
