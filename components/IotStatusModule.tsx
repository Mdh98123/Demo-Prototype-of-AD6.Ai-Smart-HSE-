import React, { useState, useEffect } from 'react';
import { 
  Activity, Wifi, WifiOff, Camera, MapPin, 
  AlertTriangle, CheckCircle2, HeartPulse, Wind,
  Thermometer, Droplets, Maximize2
} from 'lucide-react';
import { AITag } from './AITag';

interface CameraFeed {
    id: string;
    name: string;
    location: string;
    imageUrl: string;
    detections: { label: string; confidence: number; color: string; rect: { x: number, y: number, w: number, h: number } }[];
    status: 'Normal' | 'Alert';
}

export const IotStatusModule: React.FC = () => {
  const [gasLevel, setGasLevel] = useState(12);
  const [noiseLevel, setNoiseLevel] = useState(65);
  const [dustLevel, setDustLevel] = useState(45);
  const [heartRate, setHeartRate] = useState(82);

  // Simulate drifting telemetry
  useEffect(() => {
      const interval = setInterval(() => {
          setGasLevel(prev => Math.max(0, prev + (Math.random() * 4 - 2)));
          setNoiseLevel(prev => Math.max(40, Math.min(120, prev + (Math.random() * 6 - 3))));
          setDustLevel(prev => Math.max(10, Math.min(200, prev + (Math.random() * 10 - 5))));
          setHeartRate(prev => Math.max(60, Math.min(160, prev + (Math.random() * 8 - 4))));
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  const [alertCycle, setAlertCycle] = useState(0);

  // Cycle alerts every 5 seconds for cameras
  useEffect(() => {
      const interval = setInterval(() => {
          setAlertCycle(prev => (prev + 1) % 3);
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  const feeds: CameraFeed[] = [
      {
          id: 'CAM-01',
          name: 'Main Gate Access',
          location: 'Zone A',
          imageUrl: 'https://images.unsplash.com/photo-1541888081628-9c60e3366fc8?q=80&w=600&auto=format&fit=crop', // Construction workers
          status: alertCycle === 1 ? 'Alert' : 'Normal',
          detections: alertCycle === 1 
            ? [{ label: 'Missing Hardhat', confidence: 0.92, color: 'border-red-500 text-red-500', rect: { x: 45, y: 15, w: 20, h: 25 } }]
            : [{ label: 'PPE Compliant', confidence: 0.98, color: 'border-emerald-500 text-emerald-500', rect: { x: 40, y: 10, w: 30, h: 60 } }]
      },
      {
          id: 'CAM-02',
          name: 'Scaffold Level 3',
          location: 'Tower B',
          imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356f12?q=80&w=600&auto=format&fit=crop',
          status: alertCycle === 2 ? 'Alert' : 'Normal',
          detections: alertCycle === 2
            ? [{ label: 'Restricted Area Breach', confidence: 0.88, color: 'border-amber-500 text-amber-500', rect: { x: 20, y: 30, w: 40, h: 50 } }]
            : []
      }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-x-5">
                <div className="bg-slate-900 p-5 rounded-md text-white shadow-2xl shadow-slate-900/20">
                    <Activity size={32} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Live Site Monitoring</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-slate-900 ps-4">Computer Vision & IoT Telemetry</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live Connection</span>
            </div>
        </div>

        {/* AI Computer Vision Feeds */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">AI Vision Analytics</h3>
                <AITag />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feeds.map(feed => (
                    <div key={feed.id} className={`glass-card overflow-hidden border-2 rounded-xl transition-all duration-300 ${feed.status === 'Alert' ? 'border-red-400 shadow-xl shadow-red-500/10' : 'border-slate-200'}`}>
                        <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Camera size={16} className="text-slate-400"/>
                                <span className="text-xs font-bold uppercase tracking-widest">{feed.id} - {feed.name}</span>
                            </div>
                            <Maximize2 size={14} className="text-slate-500 cursor-pointer hover:text-white" />
                        </div>
                        <div className="relative aspect-video bg-slate-100 w-full overflow-hidden">
                            <img src={feed.imageUrl} alt={feed.name} className="w-full h-full object-cover opacity-80" />
                            {feed.detections.map((det, i) => (
                                <div 
                                    key={i} 
                                    className={`absolute border-2 ${det.color} transition-all duration-500 ease-in-out`}
                                    style={{ left: `${det.rect.x}%`, top: `${det.rect.y}%`, width: `${det.rect.w}%`, height: `${det.rect.h}%` }}
                                >
                                    <span className={`absolute -top-6 left-0 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${det.color.replace('border-', 'text-')}`}>
                                        {det.label} ({Math.round(det.confidence * 100)}%)
                                    </span>
                                </div>
                            ))}
                            {feed.status === 'Alert' && (
                                <div className="absolute inset-0 border-4 border-red-500 animate-pulse pointer-events-none"></div>
                            )}
                        </div>
                        <div className="p-3 bg-white flex items-center gap-4">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{feed.location}</span>
                            <span className="mx-auto text-slate-300">|</span>
                            <span className="text-[10px] font-mono text-slate-400">30 FPS • 1080p</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Real-time IoT Telemetry */}
        <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">IoT Sensor Array</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Gas */}
                <div className="glass-card p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${gasLevel > 20 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Wind size={20} /></div>
                        <Wifi size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">H2S Gas Level</p>
                    <p className="text-3xl font-black text-slate-800 font-mono tracking-tighter">
                        {gasLevel.toFixed(1)} <span className="text-sm text-slate-400">ppm</span>
                    </p>
                </div>
                
                {/* Noise */}
                <div className="glass-card p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${noiseLevel > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Activity size={20} /></div>
                        <Wifi size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ambient Noise</p>
                    <p className="text-3xl font-black text-slate-800 font-mono tracking-tighter">
                        {noiseLevel.toFixed(0)} <span className="text-sm text-slate-400">dB</span>
                    </p>
                </div>

                {/* Dust */}
                <div className="glass-card p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${dustLevel > 150 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Droplets size={20} /></div>
                        <Wifi size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PM2.5 Dust</p>
                    <p className="text-3xl font-black text-slate-800 font-mono tracking-tighter">
                        {dustLevel.toFixed(0)} <span className="text-sm text-slate-400">µg/m³</span>
                    </p>
                </div>

                {/* Heart Rate */}
                <div className="glass-card p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${heartRate > 120 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><HeartPulse size={20} /></div>
                        <Wifi size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Worker HR</p>
                    <p className="text-3xl font-black text-slate-800 font-mono tracking-tighter">
                        {heartRate.toFixed(0)} <span className="text-sm text-slate-400">bpm</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};
export default IotStatusModule;
