import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Info, X, ShieldAlert, FileSignature, HardHat, AlertTriangle, Crosshair } from 'lucide-react';

interface MapPinData {
    id: string;
    type: 'Worker' | 'Permit' | 'Hazard' | 'MusterPoint';
    x: number; // Percentage
    y: number; // Percentage
    title: string;
    description: string;
    status: 'Active' | 'Warning' | 'Critical' | 'Safe';
}

export const GISMapModule: React.FC = () => {
    const [pins, setPins] = useState<MapPinData[]>([
        { id: 'p1', type: 'Worker', x: 25, y: 40, title: 'John Smith (Scaffold Tech)', description: 'Heart Rate: 82bpm. PPE Compliant.', status: 'Active' },
        { id: 'p2', type: 'Worker', x: 45, y: 60, title: 'Ali Hassan (Welder)', description: 'Heart Rate: 110bpm. Warning: Elevated HR.', status: 'Warning' },
        { id: 'p3', type: 'Permit', x: 70, y: 30, title: 'PTW-401: Hot Work', description: 'Active hot work. Ends at 17:00. Contractor 4.', status: 'Active' },
        { id: 'p4', type: 'Hazard', x: 60, y: 80, title: 'Chemical Spill Zone', description: 'Restricted area. Cleanup in progress.', status: 'Critical' },
        { id: 'p5', type: 'MusterPoint', x: 10, y: 10, title: 'Muster Point Alpha', description: 'Primary assembly area for North Sector.', status: 'Safe' },
        { id: 'p6', type: 'Permit', x: 80, y: 55, title: 'PTW-412: Confined Space', description: 'Active confined space entry. Gas monitor online.', status: 'Active' }
    ]);
    
    const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null);

    // Simulate worker movement
    useEffect(() => {
        const interval = setInterval(() => {
            setPins(currentPins => currentPins.map(pin => {
                if (pin.type === 'Worker') {
                    // Drift by +/- 1%
                    const newX = Math.max(5, Math.min(95, pin.x + (Math.random() * 2 - 1)));
                    const newY = Math.max(5, Math.min(95, pin.y + (Math.random() * 2 - 1)));
                    return { ...pin, x: newX, y: newY };
                }
                return pin;
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const getPinIcon = (type: string) => {
        switch(type) {
            case 'Worker': return <HardHat size={20} className="text-white" />;
            case 'Permit': return <FileSignature size={20} className="text-white" />;
            case 'Hazard': return <AlertTriangle size={20} className="text-white" />;
            case 'MusterPoint': return <Crosshair size={20} className="text-white" />;
            default: return <MapPin size={20} className="text-white" />;
        }
    };

    const getPinColor = (type: string, status: string) => {
        if (type === 'MusterPoint') return 'bg-emerald-600 shadow-emerald-500/50';
        if (type === 'Hazard') return 'bg-red-600 shadow-red-500/50 animate-pulse';
        if (status === 'Warning') return 'bg-amber-500 shadow-amber-500/50';
        if (status === 'Critical') return 'bg-red-600 shadow-red-500/50';
        return 'bg-indigo-600 shadow-indigo-500/50';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4 shrink-0">
                <div className="flex items-center gap-x-5">
                    <div className="bg-slate-900 p-4 rounded-md text-white shadow-2xl shadow-slate-900/20">
                        <Navigation size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">GIS Interactive Map</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 border-s-2 border-slate-900 ps-3">Live Asset & Personnel Tracking</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative glass-card rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex">
                {/* Map Area */}
                <div className="flex-1 relative bg-slate-100 overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop" 
                        alt="Site Map" 
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        style={{ filter: 'contrast(1.1) saturate(0.8)' }}
                    />
                    <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>

                    {/* Pins */}
                    {pins.map(pin => (
                        <button
                            key={pin.id}
                            onClick={() => setSelectedPin(pin)}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10 ${getPinColor(pin.type, pin.status)} ${selectedPin?.id === pin.id ? 'ring-4 ring-white ring-opacity-50 scale-110' : ''}`}
                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        >
                            {getPinIcon(pin.type)}
                            {pin.status === 'Warning' || pin.status === 'Critical' ? (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>

                {/* Detail Panel */}
                {selectedPin && (
                    <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col relative z-20 animate-in slide-in-from-right shrink-0">
                        <button onClick={() => setSelectedPin(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-xl text-white ${getPinColor(selectedPin.type, selectedPin.status)}`}>
                                {getPinIcon(selectedPin.type)}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedPin.type}</p>
                                <p className={`text-xs font-bold uppercase tracking-wider ${selectedPin.status === 'Critical' || selectedPin.status === 'Warning' ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {selectedPin.status}
                                </p>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-4">{selectedPin.title}</h3>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed">
                            {selectedPin.description}
                        </div>
                        
                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <button className="w-full py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                                View Full Record
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default GISMapModule;
