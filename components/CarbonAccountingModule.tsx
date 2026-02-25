
import React, { useState } from 'react';
import { 
  Leaf, TrendingDown, Factory, Truck, Cloud, 
  BarChart3, Download, Plus, Zap, Fuel
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { calculateEmissionsAI } from '../services/geminiService';
import { EmissionRecord } from '../types';

const CarbonAccountingModule: React.FC = () => {
  const [activeScope, setActiveScope] = useState<'Overview' | 'Scope 1' | 'Scope 2' | 'Scope 3'>('Overview');
  const [emissions, setEmissions] = useState<EmissionRecord[]>([
      { id: '1', date: '2024-05-01', scope: 'Scope 1', source: 'Diesel Fleet', activityData: 5000, unit: 'L', emissionFactor: 2.68, calculatedCO2e: 13.4 },
      { id: '2', date: '2024-05-02', scope: 'Scope 2', source: 'Grid Electricity', activityData: 12000, unit: 'kWh', emissionFactor: 0.42, calculatedCO2e: 5.04 },
      { id: '3', date: '2024-05-05', scope: 'Scope 3', source: 'Waste Disposal', activityData: 200, unit: 'kg', emissionFactor: 0.5, calculatedCO2e: 0.1 }
  ]);

  const dataByScope = [
      { name: 'Scope 1 (Direct)', value: emissions.filter(e => e.scope === 'Scope 1').reduce((a, b) => a + b.calculatedCO2e, 0), color: '#ef4444' },
      { name: 'Scope 2 (Indirect)', value: emissions.filter(e => e.scope === 'Scope 2').reduce((a, b) => a + b.calculatedCO2e, 0), color: '#f59e0b' },
      { name: 'Scope 3 (Value Chain)', value: emissions.filter(e => e.scope === 'Scope 3').reduce((a, b) => a + b.calculatedCO2e, 0), color: '#3b82f6' }
  ];

  const handleAddRecord = async () => {
      // Mocking user input for now
      const newRecord = await calculateEmissionsAI({ scope: 'Scope 1', source: 'Generator B', amount: 1000, unit: 'L' });
      setEmissions([newRecord, ...emissions]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="flex items-center space-x-6">
                <div className="bg-emerald-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-emerald-500/20">
                    <Leaf size={32} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Net Zero Command</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-4 border-emerald-500 pl-4">ESG & Carbon Accounting Engine</p>
                </div>
            </div>
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                {['Overview', 'Scope 1', 'Scope 2', 'Scope 3'].map(scope => (
                    <button 
                        key={scope} 
                        onClick={() => setActiveScope(scope as any)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeScope === scope ? 'bg-white text-emerald-800 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {scope}
                    </button>
                ))}
            </div>
        </div>

        {activeScope === 'Overview' && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><Cloud size={120}/></div>
                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Total Footprint (YTD)</h3>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-black tracking-tighter">18.54</span>
                            <span className="text-sm font-bold text-slate-400 mb-2">tCO2e</span>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-emerald-400">
                            <TrendingDown size={16}/>
                            <span className="text-[10px] font-bold uppercase">-12% vs Target</span>
                        </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Emission Intensity</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-slate-800">0.87</span>
                            <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase">tCO2e / Unit</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-blue-500 w-[60%]"></div>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Industry Avg: 1.25</p>
                    </div>

                    <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-emerald-100 shadow-lg flex flex-col justify-center items-center text-center">
                        <div className="bg-white p-4 rounded-full shadow-md mb-4"><Leaf size={32} className="text-emerald-600"/></div>
                        <h3 className="text-xl font-black text-emerald-800 uppercase tracking-tight">Offset Status</h3>
                        <p className="text-sm font-bold text-emerald-600 mt-1">250 Trees Planted</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 h-96">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Emissions by Scope</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataByScope}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataByScope.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 h-96 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Recent Activity Log</h4>
                            <button onClick={handleAddRecord} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800">
                                <Plus size={12}/> Log Emission
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {emissions.map(e => (
                                <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${e.scope === 'Scope 1' ? 'bg-red-100 text-red-600' : e.scope === 'Scope 2' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {e.scope === 'Scope 1' ? <Factory size={16}/> : e.scope === 'Scope 2' ? <Zap size={16}/> : <Truck size={16}/>}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{e.source}</p>
                                            <p className="text-[10px] font-mono text-slate-400">{e.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-800">{e.calculatedCO2e} t</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{e.activityData} {e.unit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CarbonAccountingModule;
