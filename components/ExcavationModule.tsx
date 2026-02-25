
import React, { useState } from 'react';
import { 
  AlertTriangle, Shield, CheckCircle2, Info, 
  MapPin, Clock, User, HardHat, FileText,
  Plus, Search, Filter, Download, ChevronRight,
  AlertCircle, Loader2, Zap, BrainCircuit, X,
  Construction, Ruler, Droplets, Wind, Thermometer
} from 'lucide-react';

interface ExcavationPermit {
    id: string;
    location: string;
    depth: number;
    soilType: 'Stable Rock' | 'Type A' | 'Type B' | 'Type C';
    status: 'Active' | 'Pending' | 'Closed';
    lastInspection: string;
    hazards: string[];
    controls: string[];
}

const ExcavationModule: React.FC = () => {
    const [permits, setPermits] = useState<ExcavationPermit[]>([
        {
            id: 'EXC-2024-001',
            location: 'Sector 4 - Utility Trench',
            depth: 1.5,
            soilType: 'Type B',
            status: 'Active',
            lastInspection: '2024-05-24 08:00',
            hazards: ['Cave-in', 'Underground Utilities', 'Access/Egress'],
            controls: ['Shoring installed', 'Utility scan completed', 'Ladder every 25ft']
        },
        {
            id: 'EXC-2024-002',
            location: 'Foundation Pit - Block B',
            depth: 3.2,
            soilType: 'Type C',
            status: 'Pending',
            lastInspection: 'N/A',
            hazards: ['Cave-in', 'Water accumulation', 'Falling loads'],
            controls: ['Benching (1:1.5)', 'Dewatering pump on standby', 'Exclusion zone']
        }
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiInsights, setAiInsights] = useState<string | null>(null);

    const handleRunAIAnalysis = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setAiInsights("AI Analysis: Soil Type C detected with 3.2m depth. MANDATORY: Shoring or Shielding required as per OSHA 1926 Subpart P. High risk of water ingress due to recent rainfall data.");
            setIsAnalyzing(false);
        }, 2000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
                <div className="flex items-center space-x-5">
                    <div className="bg-orange-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-orange-500/20">
                        <Construction size={32} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Excavation Safety</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-orange-500 pl-4">Groundworks & Trenching Control</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Plus size={20} /> New Permit to Dig
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Permits', value: '12', icon: FileText, color: 'text-blue-600' },
                    { label: 'Deep Excavations', value: '3', icon: Ruler, color: 'text-orange-600' },
                    { label: 'Soil Type C Sites', value: '5', icon: AlertTriangle, color: 'text-red-600' },
                    { label: 'Inspections Today', value: '8', icon: CheckCircle2, color: 'text-emerald-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                        <stat.icon className={`${stat.color} mb-4`} size={24} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Permit Registry</h3>
                            <div className="flex gap-2">
                                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600"><Search size={18}/></button>
                                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600"><Filter size={18}/></button>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {permits.map(permit => (
                                <div key={permit.id} className="p-8 hover:bg-slate-50 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-start gap-5">
                                            <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                                <Construction size={24}/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[9px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{permit.id}</span>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                        permit.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>{permit.status}</span>
                                                </div>
                                                <h4 className="text-lg font-black text-slate-800 tracking-tight">{permit.location}</h4>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Ruler size={12}/> Depth: {permit.depth}m</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={12}/> {permit.soilType} Soil</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                            <Download size={20}/>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Hazards</p>
                                            <div className="flex flex-wrap gap-1">
                                                {permit.hazards.map((h, i) => <span key={i} className="text-[8px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded">{h}</span>)}
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Controls</p>
                                            <div className="flex flex-wrap gap-1">
                                                {permit.controls.map((c, i) => <span key={i} className="text-[8px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">{c}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10"><BrainCircuit size={120}/></div>
                        <h3 className="text-xs font-black text-orange-400 uppercase tracking-[0.2em] mb-6">AI Soil Analysis</h3>
                        <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">
                            Upload a photo of the excavation face or describe soil characteristics for AI-powered soil classification and shoring recommendations.
                        </p>
                        <button 
                            onClick={handleRunAIAnalysis}
                            disabled={isAnalyzing}
                            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-orange-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isAnalyzing ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18}/>} Run Diagnostic
                        </button>
                        {aiInsights && (
                            <div className="mt-6 p-5 bg-white/10 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                                <p className="text-[10px] font-bold text-orange-300 leading-relaxed italic">"{aiInsights}"</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Droplets size={16} className="text-blue-500"/> Site Conditions</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Water Table</span>
                                <span className="text-xs font-black text-slate-800">2.4m Below Grade</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Vibration Risk</span>
                                <span className="text-xs font-black text-red-600 uppercase">High (Nearby Traffic)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-3xl p-10 border-4 border-white animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">New Permit to Dig</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400"/></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                                <input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-sm text-slate-700 focus:border-orange-500 transition-all" placeholder="e.g. North Perimeter Fence" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Max Depth (m)</label>
                                    <input type="number" className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-sm text-slate-700 focus:border-orange-500 transition-all" placeholder="1.2" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Soil Type</label>
                                    <select className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-sm text-slate-700 focus:border-orange-500 transition-all">
                                        <option>Stable Rock</option>
                                        <option>Type A</option>
                                        <option>Type B</option>
                                        <option>Type C</option>
                                    </select>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition active:scale-95">
                                Submit for Approval
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcavationModule;
