
import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, Navigation, X, Check, Crosshair, Loader2, Factory, Building, 
  Fuel, Truck, Warehouse, Map, Search, AlertCircle, Info, Activity, 
  ShieldAlert, Radio, Wind, Droplets, Zap, ChevronRight, BarChart3, Thermometer,
  Filter, Tag, Globe, CheckCircle2
} from 'lucide-react';
import { searchLocationWithMaps } from '../services/geminiService';

export interface PredefinedLocation {
  id: string;
  name: string;
  coords: string;
  type: 'Industrial' | 'Construction' | 'Office' | 'Gas' | 'Terminal' | 'Logistics' | 'Distribution';
  status: 'Normal' | 'High Risk' | 'Maintenance';
  description: string;
  hazards: string[];
  safetyRating: number; // 0-100
  telemetry: {
    windSpeed: string;
    h2sLevel: string;
    temp: string;
  }
}

export const PREDEFINED_LOCATIONS: PredefinedLocation[] = [
  { 
    id: 'ruwais-a', 
    name: 'Ruwais Refinery Zone A', 
    coords: '24.1302, 52.7306', 
    type: 'Industrial', 
    status: 'High Risk', 
    description: 'Main refining sector. High pressure steam and chemical hazards present.',
    hazards: ['H2S Gas', 'Thermal', 'High Pressure'],
    safetyRating: 92,
    telemetry: { windSpeed: '12 km/h', h2sLevel: '0.2 ppm', temp: '42°C' }
  },
  { 
    id: 'ruwais-b', 
    name: 'Ruwais Refinery Zone B', 
    coords: '24.1310, 52.7320', 
    type: 'Industrial', 
    status: 'Normal', 
    description: 'Storage hub and secondary processing units.',
    hazards: ['Flammable Vapors', 'Vehicle Traffic'],
    safetyRating: 98,
    telemetry: { windSpeed: '8 km/h', h2sLevel: '0.0 ppm', temp: '40°C' }
  },
  { 
    id: 'habshan', 
    name: 'Habshan Gas Complex', 
    coords: '23.7500, 53.5000', 
    type: 'Gas', 
    status: 'High Risk', 
    description: 'Critical sour gas processing facility. Specialized PPE mandatory.',
    hazards: ['Sour Gas (H2S)', 'High Temperature', 'Remote Work'],
    safetyRating: 88,
    telemetry: { windSpeed: '22 km/h', h2sLevel: '1.4 ppm', temp: '45°C' }
  },
  { 
    id: 'jebel-ali-c', 
    name: 'Jebel Ali Site C', 
    coords: '25.0409, 55.1187', 
    type: 'Construction', 
    status: 'Normal', 
    description: 'Civil works for phase 4 expansion project.',
    hazards: ['Dropped Objects', 'Dust', 'Noise'],
    safetyRating: 85,
    telemetry: { windSpeed: '15 km/h', h2sLevel: '0.0 ppm', temp: '38°C' }
  },
  { 
    id: 'fujairah', 
    name: 'Fujairah Oil Terminal', 
    coords: '25.1288, 56.3265', 
    type: 'Terminal', 
    status: 'Maintenance', 
    description: 'Marine terminal and storage tank farm.',
    hazards: ['Confined Spaces', 'Work Over Water'],
    safetyRating: 94,
    telemetry: { windSpeed: '18 km/h', h2sLevel: '0.1 ppm', temp: '36°C' }
  },
  { 
    id: 'hq-ad', 
    name: 'Abu Dhabi HQ', 
    coords: '24.4539, 54.3773', 
    type: 'Office', 
    status: 'Normal', 
    description: 'Corporate headquarters and training center.',
    hazards: ['Ergonomics'],
    safetyRating: 100,
    telemetry: { windSpeed: '5 km/h', h2sLevel: '0.0 ppm', temp: '24°C' }
  }
];

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  value, 
  onChange, 
  label = "Operational Site Zone",
  placeholder = "Search site zones or use map...",
  required = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingMaps, setIsSearchingMaps] = useState(false);
  const [mapsResult, setMapsResult] = useState<PredefinedLocation | null>(null);
  const [touched, setTouched] = useState(false);
  
  // Filtering States
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  const uniqueTypes = useMemo(() => Array.from(new Set(PREDEFINED_LOCATIONS.map(l => l.type))), []);
  const uniqueStatuses = useMemo(() => Array.from(new Set(PREDEFINED_LOCATIONS.map(l => l.status))), []);

  const filteredLocs = useMemo(() => {
    let list = PREDEFINED_LOCATIONS.filter(l => {
      const matchesSearch = searchTerm === '' || 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.hazards.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = !activeType || l.type === activeType;
      const matchesStatus = !activeStatus || l.status === activeStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
    
    if (mapsResult && (mapsResult.name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '')) {
        list = [mapsResult, ...list];
    }
    
    return list;
  }, [searchTerm, activeType, activeStatus, mapsResult]);

  const handleSelect = (locName: string) => {
    onChange(locName);
    setIsOpen(false);
    setIsMapOpen(false);
    setSearchTerm('');
    setActiveType(null);
    setActiveStatus(null);
    setTouched(true);
  };

  const handleMapsSearch = async () => {
      if (!searchTerm) return;
      setIsSearchingMaps(true);
      try {
          const result = await searchLocationWithMaps(searchTerm);
          if (result && result.name) {
              const newLoc: PredefinedLocation = {
                  id: `maps-${Date.now()}`,
                  name: result.name,
                  coords: `${result.coordinates?.lat}, ${result.coordinates?.lng}`,
                  type: 'Industrial', // Defaulting for MVP
                  status: 'Normal',
                  description: result.formatted_address || 'Location retrieved from Google Maps',
                  hazards: ['General Site Hazards'],
                  safetyRating: 100,
                  telemetry: { windSpeed: '5 km/h', h2sLevel: '0.0 ppm', temp: '30°C' }
              };
              setMapsResult(newLoc);
          }
      } catch (error) {
          console.error("Maps search failed", error);
      } finally {
          setIsSearchingMaps(false);
      }
  };

  const getTypeIcon = (type: string, size = 16) => {
      switch(type) {
          case 'Industrial': return <Factory size={size} />;
          case 'Construction': return <Truck size={size} />;
          case 'Gas': return <Fuel size={size} />;
          case 'Office': return <Building size={size} />;
          case 'Terminal': return <Zap size={size} />;
          default: return <MapPin size={size} />;
      }
  };

  const isValid = value && !error;

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Radio size={12} className={value ? "text-indigo-500 animate-pulse" : "text-slate-300"} />
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isValid && (
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 size={10}/> Location Locked
            </span>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className={error ? 'text-red-400' : isOpen || value ? 'text-indigo-500' : 'text-slate-400'} />
            </div>
            <input
                type="text"
                className={`w-full pl-12 pr-10 py-4 bg-white border rounded-2xl outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-bold ${
                    error 
                        ? 'border-red-500 focus:border-red-500 bg-red-50/10' 
                        : isOpen 
                            ? 'border-indigo-500 bg-white shadow-xl shadow-indigo-500/10 ring-4 ring-indigo-500/10' 
                            : value 
                                ? 'border-emerald-500 focus:border-emerald-500'
                                : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300'
                }`}
                placeholder={placeholder}
                value={isOpen ? searchTerm : value}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => { setIsOpen(true); setTouched(true); }}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />
            {value && !isOpen && (
                <button 
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-red-500 transition-colors"
                >
                    <X size={18} />
                </button>
            )}
        </div>
        <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className={`w-14 border-2 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 group/map ${
                error ? 'border-red-500 bg-red-500 text-white' : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
            }`}
            title="Visual Site Navigator"
        >
            <Map size={22} className="group-hover/map:scale-110 transition-transform" />
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
          <div className="flex items-center gap-1 mt-2 text-red-500 animate-in slide-in-from-top-1 ml-1">
              <AlertCircle size={12} />
              <p className="text-[10px] font-bold uppercase tracking-wide">{error}</p>
          </div>
      )}

      {/* Enhanced Typeahead Suggestions & Filters */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl max-h-[500px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 origin-top">
            <div className="p-4 sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-50 space-y-4">
                {searchTerm && (
                    <button 
                        onMouseDown={(e) => { e.preventDefault(); handleMapsSearch(); }}
                        disabled={isSearchingMaps}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        {isSearchingMaps ? <Loader2 size={14} className="animate-spin"/> : <Globe size={14}/>} 
                        Search "{searchTerm}" via Google Maps
                    </button>
                )}
                
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Filter size={10} className="text-indigo-500"/> Sector Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueTypes.map(t => (
                      <button
                        key={t}
                        onMouseDown={(e) => { e.preventDefault(); setActiveType(activeType === t ? null : t); }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                          activeType === t 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ShieldAlert size={10} className="text-indigo-500"/> Risk Profile
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueStatuses.map(s => (
                      <button
                        key={s}
                        onMouseDown={(e) => { e.preventDefault(); setActiveStatus(activeStatus === s ? null : s); }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                          activeStatus === s 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
            </div>
            
            <div className="p-2 space-y-1">
                {filteredLocs.length > 0 ? filteredLocs.map(loc => (
                    <button
                        key={loc.id}
                        type="button"
                        className={`w-full text-left px-4 py-4 hover:bg-slate-50 rounded-2xl flex items-center justify-between group transition-all border-2 ${
                            value === loc.name ? 'border-indigo-500/20 bg-indigo-50/20' : 'border-transparent'
                        }`}
                        onMouseDown={() => handleSelect(loc.name)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-all duration-300 ${
                                value === loc.name ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                            }`}>
                                {getTypeIcon(loc.type, 20)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-black text-slate-800 tracking-tight">{loc.name}</p>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-2 ${
                                      loc.status === 'High Risk' ? 'bg-red-50 text-red-600 border-red-100' :
                                      loc.status === 'Maintenance' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                      {loc.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{loc.type}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                    <div className="flex gap-1">
                                        {loc.hazards.slice(0, 2).map((h, i) => (
                                            <span key={i} className="text-[8px] font-bold text-slate-400 border border-slate-100 px-1 rounded uppercase tracking-tighter">{h}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {value === loc.name ? <Check size={20} className="text-indigo-600" /> : <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />}
                    </button>
                )) : (
                    <div className="p-12 text-center text-slate-300 italic text-xs uppercase font-bold tracking-widest">No matching sectors for selected filters</div>
                )}
            </div>
        </div>
      )}

      {/* Visual Site Navigator Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-6xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] border-4 border-white">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-2xl shadow-slate-900/20">
                            <Map size={28}/>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Visual Site Navigator</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Select an active sector to synchronize regulatory context</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMapOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all hover:rotate-90">
                        <X size={32} />
                    </button>
                </div>
                
                <div className="flex-1 bg-slate-50 overflow-y-auto p-8 relative flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                         {filteredLocs.map((loc) => {
                             const isSelected = value === loc.name;
                             const isHighRisk = loc.status === 'High Risk';
                             
                             return (
                                <button
                                    key={loc.id}
                                    onClick={() => handleSelect(loc.name)}
                                    className={`relative group rounded-[2.5rem] border-4 transition-all duration-500 flex flex-col p-8 text-left ${
                                        isSelected 
                                            ? 'bg-slate-900 border-indigo-500 text-white shadow-3xl scale-[1.02] z-10' 
                                            : 'bg-white border-slate-50 hover:border-indigo-500/50 text-slate-700 shadow-xl hover:shadow-indigo-500/10'
                                    }`}
                                >
                                    {isHighRisk && (
                                        <div className="absolute top-6 right-6 text-red-500 animate-pulse bg-red-50 p-2 rounded-xl border border-red-100 flex items-center gap-1.5">
                                            <ShieldAlert size={14} />
                                            <span className="text-[9px] font-black uppercase">Critical</span>
                                        </div>
                                    )}
                                    
                                    <div className={`mb-6 p-5 rounded-3xl transition-all duration-500 w-fit ${
                                        isSelected ? 'bg-indigo-500 shadow-lg' : 'bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                    }`}>
                                        {getTypeIcon(loc.type, 32)}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h5 className="font-black text-xl tracking-tighter mb-1 uppercase leading-none">{loc.name}</h5>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>
                                            {loc.type} Sector
                                        </p>
                                        
                                        <div className="grid grid-cols-3 gap-2 mb-6">
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center shadow-inner">
                                                <Wind size={14} className={`mx-auto mb-1 ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`} />
                                                <p className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>{loc.telemetry.windSpeed}</p>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center shadow-inner">
                                                <Droplets size={14} className={`mx-auto mb-1 ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`} />
                                                <p className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>{loc.telemetry.h2sLevel}</p>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center shadow-inner">
                                                <Thermometer size={14} className={`mx-auto mb-1 ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`} />
                                                <p className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>{loc.telemetry.temp}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {loc.hazards.map((h, i) => (
                                                <span key={i} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${isSelected ? 'border-white/20 bg-white/10' : 'border-slate-100 bg-slate-50'}`}>
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute -bottom-4 right-10 bg-indigo-500 text-white p-3 rounded-2xl shadow-3xl border-4 border-white">
                                            <Check size={24} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                             );
                         })}
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-200"></span> Standard Ops</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"></span> Critical Zone</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></span> Selected</div>
                   </div>
                   <button 
                        onClick={() => setIsMapOpen(false)}
                        className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 shadow-3xl transition-all active:scale-95"
                    >
                        Apply Sector Link
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
