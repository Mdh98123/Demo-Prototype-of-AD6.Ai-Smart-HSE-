
import React, { useState, useEffect } from 'react';
import { 
  getRegulatoryFeed, analyzeRegulatoryImpact 
} from '../services/geminiService';
import { RegulatoryUpdate, OperationalMapping, FineRisk } from '../types';
import { 
  LayoutDashboard, Scale, AlertTriangle, FileText, 
  CheckCircle2, Clock, Search, Filter, ArrowRight,
  Landmark, ShieldAlert, History, Bell, ChevronDown,
  BrainCircuit, Zap, Loader2, Calendar, ScrollText,
  Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const ComplyFlowModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Radar' | 'Matrix' | 'Fines'>('Radar');
  const [regulations, setRegulations] = useState<RegulatoryUpdate[]>([]);
  const [mappings, setMappings] = useState<OperationalMapping[]>([]);
  const [risks, setRisks] = useState<FineRisk[]>([]);
  const [selectedReg, setSelectedReg] = useState<RegulatoryUpdate | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = await getRegulatoryFeed();
      setRegulations(data);
      setLoading(false);
    };
    init();
  }, []);

  const handleAnalyze = async (reg: RegulatoryUpdate) => {
    setSelectedReg(reg);
    setAnalyzing(true);
    try {
      const result = await analyzeRegulatoryImpact(reg);
      // Enrich with IDs
      const newMappings = result.mappings.map((m, i) => ({
        ...m,
        id: `MAP-${Date.now()}-${i}`,
        regulationId: reg.id,
        status: 'At Risk' // Default new mappings to At Risk
      })) as OperationalMapping[];
      
      const newRisks = result.risks.map(r => ({
        ...r,
        regulationId: reg.id
      }));

      setMappings(prev => [...newMappings, ...prev]);
      setRisks(prev => [...newRisks, ...prev]);
      
      // Update reg status
      setRegulations(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'Acknowledged' } : r));
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-50 text-red-600 border-red-100';
      case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Medium': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-6">
          <div className="bg-teal-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-teal-500/20">
            <Scale size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">ComplyFlow UAE</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-4 border-teal-500 pl-4">Automated Regulatory Intelligence & Fine Prevention</p>
          </div>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {['Radar', 'Matrix', 'Fines'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-white text-teal-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Radar' && (
        <div className="space-y-8">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit size={120}/></div>
                <h3 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap size={14} className="animate-pulse"/> Intelligence Active
                </h3>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black tracking-tighter">12</span>
                    <span className="text-sm font-bold text-slate-400 mb-2">Sources Monitored</span>
                </div>
                <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold uppercase border border-white/10">DM: Online</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold uppercase border border-white/10">MoHRE: Online</span>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Pending Review</h3>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black text-slate-800 tracking-tighter">{regulations.filter(r => r.status === 'New').length}</span>
                    <span className="text-sm font-bold text-slate-400 mb-2">New Decrees</span>
                </div>
                <p className="text-[10px] text-orange-500 font-bold uppercase mt-2">Action required within 24h</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Compliance Health</h3>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black text-emerald-500 tracking-tighter">98%</span>
                    <span className="text-sm font-bold text-slate-400 mb-2">Site Score</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[98%]"></div>
                </div>
            </div>
          </div>

          {/* Regulation Feed */}
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Regulatory Radar</h3>
              <div className="flex gap-2">
                  <span className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Filter size={14}/> Filter Source
                  </span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                    <Loader2 className="animate-spin mb-4" size={32}/>
                    <p className="text-xs font-bold uppercase tracking-widest">Scanning Government Gazettes...</p>
                </div>
              ) : (
                regulations.map(reg => (
                  <div key={reg.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                      <div className="flex gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                            reg.impactLevel === 'Critical' ? 'bg-red-50 border-red-100 text-red-600' : 
                            reg.impactLevel === 'High' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                            'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}>
                            <Landmark size={28}/>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getImpactColor(reg.impactLevel)}`}>{reg.impactLevel} Impact</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{reg.sourceAuthority} • {reg.domain}</span>
                            </div>
                            <h4 className="text-lg font-black text-slate-800 leading-tight mb-2">{reg.title}</h4>
                            <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">{reg.summary}</p>
                            
                            <div className="flex items-center gap-6 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Calendar size={12}/> Effective: {reg.effectiveDate}</span>
                                {reg.actionRequired && <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> Action Required</span>}
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 min-w-[140px]">
                          {reg.status === 'New' || reg.status === 'Reviewing' ? (
                              <button 
                                onClick={() => handleAnalyze(reg)}
                                disabled={analyzing}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-teal-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                              >
                                  {analyzing && selectedReg?.id === reg.id ? <Loader2 className="animate-spin" size={14}/> : <BrainCircuit size={14}/>}
                                  Analyze Impact
                              </button>
                          ) : (
                              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                  <CheckCircle2 size={16}/> Mapped
                              </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Matrix' && (
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Compliance Operations Matrix</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Activity Mapping</p>
            </div>
            
            {mappings.length === 0 ? (
                <div className="p-20 text-center text-slate-400">
                    <LayoutDashboard size={48} className="mx-auto mb-4 opacity-20"/>
                    <p className="text-xs font-bold uppercase tracking-widest">No active mappings. Analyze regulations to generate operational links.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6">Operational Activity</th>
                                <th className="px-8 py-6">Compliance Rule</th>
                                <th className="px-8 py-6">Evidence Required</th>
                                <th className="px-8 py-6">Owner</th>
                                <th className="px-8 py-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mappings.map(map => (
                                <tr key={map.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Activity size={16}/></div>
                                            <span className="font-bold text-slate-800 text-sm">{map.activityName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-medium text-slate-600 max-w-xs">{map.complianceRule}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <FileText size={14}/> {map.evidenceRequired}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-slate-200">{map.ownerRole.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                                            map.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            'bg-red-50 text-red-700 border-red-100 animate-pulse'
                                        }`}>{map.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}

      {activeTab === 'Fines' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-3">
                      <ShieldAlert size={24} className="text-red-500"/> Fine Prevention Center
                  </h3>
                  
                  {risks.length === 0 ? (
                      <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
                          <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4"/>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No immediate fine risks detected.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {risks.map((risk, i) => (
                              <div key={i} className="p-6 bg-red-50 rounded-[2rem] border-2 border-red-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                  <div className="flex-1">
                                      <div className="flex items-center gap-2 text-red-600 mb-2">
                                          <AlertTriangle size={18}/>
                                          <span className="text-[10px] font-black uppercase tracking-widest">{risk.probability} Probability Risk</span>
                                      </div>
                                      <h4 className="text-base font-black text-red-900 leading-tight">{risk.violationType}</h4>
                                      <p className="text-xs font-medium text-red-800 mt-2">Prevention: {risk.preventionAction}</p>
                                  </div>
                                  <div className="text-right bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Potential Penalty</p>
                                      <p className="text-2xl font-black text-slate-900">AED {risk.potentialFineAED.toLocaleString()}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><ScrollText size={140}/></div>
                  <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.3em] mb-8">Savings Projection</h3>
                  
                  <div className="space-y-8 relative z-10">
                      <div>
                          <p className="text-4xl font-black tracking-tighter">AED 45,000</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Estimated Fines Avoided (YTD)</p>
                      </div>
                      
                      <div className="h-px bg-white/10 w-full"></div>
                      
                      <div className="space-y-4">
                          <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-300">MoHRE Compliance</span>
                              <span className="text-emerald-400">100%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full w-full"></div>
                          </div>
                          
                          <div className="flex justify-between text-xs font-bold mt-2">
                              <span className="text-slate-300">DM Site Code</span>
                              <span className="text-yellow-400">92%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-yellow-500 h-full w-[92%]"></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ComplyFlowModule;
