
import React, { useState } from 'react';
import { DigitalTwinSensor } from '../types';
import { simulateDigitalTwinScenario } from '../services/geminiService';
import { 
  Box, Maximize, AlertTriangle, Wind, Thermometer, 
  Activity, Play, Loader2, Layers 
} from 'lucide-react';

const DigitalTwinViewer: React.FC = () => {
  const [sensors] = useState<DigitalTwinSensor[]>([
      { id: 'S1', type: 'Gas', label: 'H2S Sensor 01', value: 0.0, unit: 'ppm', status: 'Normal', coordinates: { x: 20, y: 30, z: 0 } },
      { id: 'S2', type: 'Temp', label: 'Pump A Temp', value: 65, unit: '°C', status: 'Warning', coordinates: { x: 50, y: 60, z: 0 } },
      { id: 'S3', type: 'Vibration', label: 'Turbine Vib', value: 2.1, unit: 'mm/s', status: 'Normal', coordinates: { x: 70, y: 20, z: 0 } }
  ]);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
      impactZones: string[]; evacuationRoutes: string[]; estimatedResponseTime: string;
  } | null>(null);

  const handleSimulate = async () => {
      setSimulating(true);
      try {
          const result = await simulateDigitalTwinScenario('H2S Leak - Zone A', 'Ruwais Complex');
          setSimulationResult(result);
      } catch (e) {
          console.error(e);
      } finally {
          setSimulating(false);
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Digital Twin</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Facility Replica</p>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={handleSimulate}
                    disabled={simulating}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                    {simulating ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>} Run Simulation
                </button>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
            <div className="lg:col-span-3 bg-slate-900 rounded-[3rem] relative overflow-hidden shadow-2xl border-4 border-slate-800 group">
                {/* Simulated 3D View Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581093588401-fbb072039136?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 pointer-events-none"></div>
                
                {/* Sensor Overlays */}
                {sensors.map(sensor => (
                    <div 
                        key={sensor.id}
                        className="absolute p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transform hover:scale-110 transition-all cursor-pointer group/sensor"
                        style={{ top: `${sensor.coordinates.y}%`, left: `${sensor.coordinates.x}%` }}
                    >
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${sensor.status === 'Normal' ? 'bg-emerald-500' : sensor.status === 'Warning' ? 'bg-orange-500' : 'bg-red-500'} animate-pulse`}></div>
                        <div className="flex items-center gap-3">
                            <div className="text-indigo-400">
                                {sensor.type === 'Gas' ? <Wind size={16}/> : sensor.type === 'Temp' ? <Thermometer size={16}/> : <Activity size={16}/>}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sensor.label}</p>
                                <p className="text-sm font-bold text-white">{sensor.value} {sensor.unit}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Simulation Overlay */}
                {simulationResult && (
                    <div className="absolute bottom-8 left-8 right-8 bg-red-900/90 backdrop-blur-xl p-6 rounded-[2rem] border border-red-500/30 animate-in slide-in-from-bottom-10">
                        <div className="flex items-start gap-6">
                            <div className="bg-red-500 p-4 rounded-2xl text-white animate-pulse">
                                <AlertTriangle size={32}/>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Simulation Result: H2S Release</h3>
                                <div className="flex gap-8 text-xs font-bold text-red-200">
                                    <span>Impact: {simulationResult.impactZones.join(', ')}</span>
                                    <span>Route: {simulationResult.evacuationRoutes.join(', ')}</span>
                                    <span>Est. Response: {simulationResult.estimatedResponseTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 h-full flex flex-col">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Layers size={16} className="text-indigo-600"/> Layer Control
                    </h3>
                    <div className="space-y-3">
                        {['Gas Detection', 'Thermal Map', 'Personnel', 'Evacuation Paths'].map(layer => (
                            <label key={layer} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500"/>
                                <span className="text-xs font-bold text-slate-700 uppercase">{layer}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DigitalTwinViewer;
