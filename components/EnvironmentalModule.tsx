
import React, { useState } from 'react';
import { EnvironmentalReading } from '../types';
import { 
  Leaf, Droplets, Wind, Activity, Thermometer, 
  AlertTriangle, CheckCircle, Search, Filter, Plus, ArrowUpRight 
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';

const KEZAD_LIMITS = {
    SO2_24H: 150, // ug/m3
    CO_1H: 30, // mg/m3
    NOISE_DAY: 85 // dB
};

const EnvironmentalModule: React.FC = () => {
  // Mocking real-time sensor data that includes a breach
  const [readings] = useState<EnvironmentalReading[]>([
    { id: '1', type: 'Air Quality', value: 32, unit: 'AQI', location: 'Ruwais Zone A', timestamp: '10:00', status: 'Within Limit' },
    { id: '2', type: 'Noise', value: 88, unit: 'dB', location: 'Zone B Excavation', timestamp: '10:15', status: 'Threshold Breach' },
    { id: '3', type: 'Emissions', value: 160, unit: 'SO2 ug/m3', location: 'Stack 4', timestamp: '10:30', status: 'Threshold Breach' } // Breach > 150
  ]);

  const mockHistory = [
    { time: '08:00', val: 72 }, { time: '09:00', val: 75 }, { time: '10:00', val: 88 }, { time: '11:00', val: 82 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-5">
            <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                <Leaf size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Eco Monitoring</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Air, Noise & Waste Intelligence</p>
            </div>
          </div>
          <div className="flex gap-2">
              <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus size={14}/> Log Measurement</button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <Wind className="text-blue-500 mb-4" size={32}/>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Air Index</span>
              <div className="text-3xl font-black text-slate-800">32<span className="text-xs ml-1">AQI</span></div>
              <p className="text-[10px] text-emerald-600 font-bold mt-2 uppercase">Optimal</p>
          </div>
          {/* Critical Violation State */}
          <div className="bg-red-50 p-6 rounded-[2rem] shadow-xl border-2 border-red-200 flex flex-col items-center text-center animate-pulse">
              <Activity className="text-red-600 mb-4" size={32}/>
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Noise Level</span>
              <div className="text-3xl font-black text-red-700">88<span className="text-xs ml-1">dB</span></div>
              <p className="text-[10px] text-red-600 font-black mt-2 uppercase flex items-center gap-1"><AlertTriangle size={12}/> Critical &gt; {KEZAD_LIMITS.NOISE_DAY}dB</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <Droplets className="text-teal-500 mb-4" size={32}/>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Effluent</span>
              <div className="text-3xl font-black text-slate-800">Neutral</div>
              <p className="text-[10px] text-emerald-600 font-bold mt-2 uppercase">Compliant</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex flex-col items-center text-center">
              <Leaf className="text-teal-400 mb-4" size={32}/>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sustainability</span>
              <div className="text-3xl font-black text-teal-400">A+</div>
              <p className="text-[10px] text-teal-400/60 font-bold mt-2 uppercase tracking-tighter">Carbon Rank: Prime</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-indigo-600"/> Real-time Telemetry Trend
              </h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockHistory}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={[0, 100]} hide />
                          <Tooltip />
                          <Area type="monotone" dataKey="val" stroke="#10b981" fill="#d1fae5" strokeWidth={3} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">KEZAD Violations</h3>
                  <div className="space-y-4">
                      {readings.filter(r => r.status !== 'Within Limit').map(r => (
                          <div key={r.id} className="p-4 bg-red-50 rounded-2xl border-2 border-red-100">
                              <div className="flex items-center gap-3 text-red-700 font-black text-xs uppercase tracking-tight mb-1">
                                  <AlertTriangle size={16}/> Regulatory Breach
                              </div>
                              <p className="text-[11px] font-bold text-red-900">{r.type} {r.value}{r.unit} exceeds limit.</p>
                              <button className="mt-3 w-full bg-red-600 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition">Log Incident &rarr;</button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default EnvironmentalModule;
