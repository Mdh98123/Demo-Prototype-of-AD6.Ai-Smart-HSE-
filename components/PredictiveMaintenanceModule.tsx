
import React, { useState } from 'react';
import { Equipment, MaintenancePrediction } from '../types';
import { predictEquipmentFailure } from '../services/geminiService';
import { 
  Activity, Thermometer, Gauge, Zap, AlertTriangle, CheckCircle, 
  Settings, Wrench, Calendar, BrainCircuit, Loader2, RefreshCcw, FileText
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useUser } from '../contexts/UserContext';

// Mock Data Generator for chart visualization
const generateMockHistory = (baseTemp: number, baseVib: number) => {
  return Array.from({ length: 10 }, (_, i) => ({
    time: `${i}:00`,
    temp: baseTemp + Math.random() * 5 - 2,
    vib: baseVib + Math.random() * 0.5 - 0.2,
  }));
};

const PredictiveMaintenanceModule: React.FC = () => {
  const { currentUser, equipment, updateEquipment } = useUser();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [mockChartData, setMockChartData] = useState<any[]>([]);

  // Permissions check
  const canAccess = ['ADMIN', 'Site_HSE_Manager', 'Regional_HSE_Director', 'Head_Group_HSE', 'Site_Supervisor'].includes(currentUser.role);

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12 text-center">
        <AlertTriangle size={48} className="mb-4 text-orange-400" />
        <h3 className="text-xl font-bold text-slate-600">Access Restricted</h3>
        <p>This module is restricted to authorized personnel.</p>
      </div>
    );
  }

  const handleSelectEquipment = (eq: Equipment) => {
    setSelectedEquipment(eq);
    // Generate fresh mock history based on current sensor readings for visualization
    setMockChartData(generateMockHistory(eq.sensors.temperature, eq.sensors.vibration));
  };

  const handleRunAnalysis = async () => {
    if (!selectedEquipment) return;
    setLoading(true);
    try {
      const prediction = await predictEquipmentFailure(selectedEquipment);
      
      const updatedEquipment = { ...selectedEquipment, prediction };
      
      // Update global state via context
      updateEquipment(updatedEquipment);
      setSelectedEquipment(updatedEquipment);
      
    } catch (err) {
      alert("Failed to generate predictive analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Predictive Maintenance</h2>
            <p className="text-slate-500 text-sm">AI-Driven Reliability & Health Monitoring</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase">System Status</p>
              <p className="text-emerald-600 font-bold flex items-center gap-1 justify-end"><Zap size={12}/> Online</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        
        {/* Left: Equipment List */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
            {equipment.map(eq => (
                <div 
                    key={eq.id}
                    onClick={() => handleSelectEquipment(eq)}
                    className={`bg-white p-4 rounded-xl border transition cursor-pointer hover:shadow-md relative overflow-hidden ${
                        selectedEquipment?.id === eq.id 
                            ? 'border-indigo-500 ring-1 ring-indigo-200 shadow-md' 
                            : 'border-slate-100'
                    }`}
                >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        eq.status === 'Critical' ? 'bg-red-500' :
                        eq.status === 'Warning' ? 'bg-orange-500' :
                        eq.status === 'Maintenance' ? 'bg-blue-500' :
                        'bg-emerald-500'
                    }`}></div>
                    
                    <div className="pl-3 flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-slate-800">{eq.name}</h4>
                            <p className="text-xs text-slate-500">{eq.type} • {eq.location}</p>
                        </div>
                        {eq.prediction && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <BrainCircuit size={10} /> AI Analyzed
                            </span>
                        )}
                    </div>
                    
                    <div className="pl-3 mt-3 grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 p-2 rounded">
                            <p className="text-[10px] text-slate-400 uppercase">Temp</p>
                            <p className={`text-sm font-semibold ${eq.sensors.temperature > 80 ? 'text-red-600' : 'text-slate-700'}`}>
                                {eq.sensors.temperature}°C
                            </p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                            <p className="text-[10px] text-slate-400 uppercase">Vibration</p>
                            <p className={`text-sm font-semibold ${eq.sensors.vibration > 5 ? 'text-red-600' : 'text-slate-700'}`}>
                                {eq.sensors.vibration} mm/s
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Right: Detailed View */}
        <div className="lg:col-span-8">
            {selectedEquipment ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden">
                    {/* Detail Header */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {selectedEquipment.name}
                                <span className={`text-xs px-2 py-0.5 rounded border uppercase ${
                                    selectedEquipment.status === 'Operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    selectedEquipment.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-orange-50 text-orange-700 border-orange-200'
                                }`}>{selectedEquipment.status}</span>
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                ID: {selectedEquipment.id} • Last Service: {selectedEquipment.lastMaintenanceDate} • {selectedEquipment.operationalHours} hrs
                            </p>
                        </div>
                        <button 
                            onClick={handleRunAnalysis}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                            Analyze Health
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        {/* Live Telemetry Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Thermometer size={16} className="text-orange-500" /> Temperature Trend
                                </h4>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockChartData}>
                                            <defs>
                                                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                            <XAxis dataKey="time" hide />
                                            <YAxis domain={['auto', 'auto']} width={30} tick={{fontSize: 10}} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                             <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Activity size={16} className="text-blue-500" /> Vibration Analysis
                                </h4>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={mockChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                            <XAxis dataKey="time" hide />
                                            <YAxis domain={['auto', 'auto']} width={30} tick={{fontSize: 10}} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="vib" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Incident History Context for AI */}
                        {selectedEquipment.relatedIncidents && selectedEquipment.relatedIncidents.length > 0 && (
                             <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                                <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                                    <FileText size={16} /> Related Incident History
                                </h4>
                                <ul className="list-disc list-inside text-xs text-orange-700 space-y-1">
                                    {selectedEquipment.relatedIncidents.map((inc, i) => (
                                        <li key={i}>{inc}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* AI Prediction Results */}
                        {selectedEquipment.prediction ? (
                            <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <BrainCircuit size={120} />
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">AI Predictive Model</p>
                                            <h3 className="text-2xl font-bold">Maintenance Analysis</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 text-xs">Failure Probability</p>
                                            <p className={`text-3xl font-bold ${
                                                selectedEquipment.prediction.failureProbability > 70 ? 'text-red-400' : 
                                                selectedEquipment.prediction.failureProbability > 40 ? 'text-orange-400' : 'text-emerald-400'
                                            }`}>
                                                {selectedEquipment.prediction.failureProbability}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                                            <div className="flex items-center gap-2 mb-2 text-indigo-300">
                                                <Calendar size={16} />
                                                <span className="text-xs font-bold uppercase">Predicted Failure</span>
                                            </div>
                                            <p className="font-semibold">{selectedEquipment.prediction.predictedFailureDate}</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                                            <div className="flex items-center gap-2 mb-2 text-orange-300">
                                                <AlertTriangle size={16} />
                                                <span className="text-xs font-bold uppercase">Root Cause Suspect</span>
                                            </div>
                                            <p className="font-semibold">{selectedEquipment.prediction.rootCauseSuspect}</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                                            <div className="flex items-center gap-2 mb-2 text-emerald-300">
                                                <Wrench size={16} />
                                                <span className="text-xs font-bold uppercase">Recommended Action</span>
                                            </div>
                                            <p className="font-semibold text-sm">{selectedEquipment.prediction.recommendedAction}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-indigo-600/20 p-4 rounded-lg border border-indigo-500/30">
                                        <Calendar size={20} className="text-indigo-400" />
                                        <div>
                                            <p className="text-xs text-indigo-300 font-bold uppercase">Suggested Schedule</p>
                                            <p className="font-medium">Schedule preventive maintenance by <span className="text-white font-bold">{selectedEquipment.prediction.maintenanceSchedule}</span></p>
                                        </div>
                                        <button className="ml-auto bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition">
                                            Schedule Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
                                <Activity size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-600">No Analysis Data</h3>
                                <p className="text-slate-500 text-sm mb-4">Run the AI analysis to detect potential failures based on sensor readings and incident history.</p>
                                <button onClick={handleRunAnalysis} className="text-indigo-600 font-semibold text-sm hover:underline">
                                    Start Analysis
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                    <Settings size={64} className="mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-slate-500">Select Equipment</h3>
                    <p className="max-w-sm mx-auto mt-2">Choose an asset from the list to view telemetry data and run predictive maintenance analysis.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default PredictiveMaintenanceModule;
