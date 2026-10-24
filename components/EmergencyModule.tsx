import React, { useState, useEffect } from 'react';
import { EmergencyDrill, Incident } from '../types';
import { 
  ShieldAlert, Flame, Biohazard, Activity, 
  Plus, Calendar, MapPin, CheckCircle2, History, Loader2, ArrowRight, AlertTriangle,
  ExternalLink, Compass, PhoneCall, Building2, Search, Sparkles
} from 'lucide-react';
import { GeminiClientService, MapPlace } from '../services/geminiClientService';

const GCC_FACILITIES = [
  { name: 'Ruwais Industrial Complex', lat: 24.1107, lng: 52.7306, country: 'UAE' },
  { name: 'Musaffah Industrial Zone', lat: 24.3394, lng: 54.4984, country: 'UAE' },
  { name: 'Habshan Gas Complex', lat: 23.9575, lng: 53.6822, country: 'UAE' },
  { name: 'Jebel Ali Free Zone', lat: 24.9857, lng: 55.0864, country: 'UAE' },
  { name: 'Fujairah Oil Terminal', lat: 25.1288, lng: 56.3265, country: 'UAE' },
];

const EmergencyModule: React.FC = () => {
  const [recentIncident, setRecentIncident] = useState<Incident | null>(null);

  // Maps Grounding State (gemini-3.5-flash with googleMaps)
  const [selectedFacility, setSelectedFacility] = useState(GCC_FACILITIES[0]);
  const [emergencyQueryType, setEmergencyQueryType] = useState('Nearest Trauma Hospital & Burn Emergency Center');
  const [isQueryingMaps, setIsQueryingMaps] = useState(false);
  const [mapsResultText, setMapsResultText] = useState<string | null>(null);
  const [groundedPlaces, setGroundedPlaces] = useState<MapPlace[]>([]);
  const [mapsError, setMapsError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hse_incident_registry');
    if (saved) {
      try {
        const incidents: Incident[] = JSON.parse(saved);
        if (incidents && incidents.length > 0) {
          incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRecentIncident(incidents[0]);
        }
      } catch (e) {
        console.error("Failed to parse incidents", e);
      }
    }
  }, []);

  const [drills] = useState<EmergencyDrill[]>([
    { id: '1', type: 'Confined Space Rescue', date: '2026-05-24', location: 'Musaffah Industrial Zone', outcome: 'Needs Improvement', timeTakenMinutes: 13, participants: 21 },
    { id: '2', type: 'Confined Space Rescue', date: '2026-06-04', location: 'Ruwais Refinery Complex', outcome: 'Needs Improvement', timeTakenMinutes: 3, participants: 12 },
    { id: '3', type: 'Fire Evacuation', date: '2026-05-20', location: 'Jebel Ali Construction Site', outcome: 'Successful', timeTakenMinutes: 11, participants: 47 },
    { id: '4', type: 'Confined Space Rescue', date: '2026-07-14', location: 'Habshan Gas Complex', outcome: 'Successful', timeTakenMinutes: 16, participants: 48 },
    { id: '5', type: 'Fire Evacuation', date: '2026-04-18', location: 'Abu Dhabi HQ', outcome: 'Needs Improvement', timeTakenMinutes: 16, participants: 45 },
    { id: '6', type: 'Fire Evacuation', date: '2026-06-22', location: 'Jebel Ali Construction Site', outcome: 'Successful', timeTakenMinutes: 6, participants: 21 },
    { id: '7', type: 'Chemical Spill', date: '2026-07-03', location: 'Musaffah Industrial Zone', outcome: 'Needs Improvement', timeTakenMinutes: 9, participants: 41 },
  ]);

  const handleQueryEmergencyMaps = async () => {
    setIsQueryingMaps(true);
    setMapsError(null);
    try {
      const prompt = `Locate the ${emergencyQueryType} for industrial personnel operating around ${selectedFacility.name}. Provide direct road response instructions, phone/dispatch guidance, and official Google Maps facility links.`;
      
      const res = await GeminiClientService.queryMapsGrounding({
        prompt,
        userLatLng: { latitude: selectedFacility.lat, longitude: selectedFacility.lng },
        facilityContext: `${selectedFacility.name}, ${selectedFacility.country}`
      });

      setMapsResultText(res.text);
      setGroundedPlaces(res.places || []);
    } catch (err: any) {
      console.error('Maps Grounding Error:', err);
      setMapsError(err.message || 'Unable to query Google Maps grounding service.');
    } finally {
      setIsQueryingMaps(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-x-5">
          <div className="bg-red-600 p-4 rounded-2xl text-white shadow-xl shadow-red-500/20">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Emergency Hub</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Drill Compliance, Incident Cascade & Geospatial Emergency Grounding
            </p>
            {recentIncident && (
              <div className="mt-3 flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100 w-fit">
                <AlertTriangle size={14} className="text-red-600" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Latest Incident: {recentIncident.type} @ {recentIncident.location}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">
            DECLARE EMERGENCY
          </button>
        </div>
      </div>

      {/* NEW: Gemini Maps Grounding Section */}
      <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 end-0 p-8 opacity-10">
          <Compass size={140} className="text-emerald-400" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Maps Grounding
                </span>
                <span className="text-xs font-mono text-slate-400">gemini-3.5-flash</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mt-1">
                Geospatial Emergency & Trauma Facility Locator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time verified hospital, Civil Defence & hazmat facility retrieval anchored to live Google Maps data.
              </p>
            </div>

            <button
              onClick={handleQueryEmergencyMaps}
              disabled={isQueryingMaps}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black uppercase tracking-wider text-xs flex items-center gap-2.5 transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50 shrink-0"
            >
              {isQueryingMaps ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>{isQueryingMaps ? 'Grounding...' : 'Locate Facilities'}</span>
            </button>
          </div>

          {/* Selector Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Current Asset / Concession Site
              </label>
              <select
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                value={selectedFacility.name}
                onChange={(e) => {
                  const match = GCC_FACILITIES.find(f => f.name === e.target.value);
                  if (match) setSelectedFacility(match);
                }}
              >
                {GCC_FACILITIES.map(f => (
                  <option key={f.name} value={f.name}>{f.name} ({f.country})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Emergency Facility Target
              </label>
              <select
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                value={emergencyQueryType}
                onChange={(e) => setEmergencyQueryType(e.target.value)}
              >
                <option value="Nearest Level-1 Trauma Hospital & Emergency ICU Center">Nearest Level-1 Trauma Hospital & ICU</option>
                <option value="UAE Civil Defence Fire Station & Industrial Hazmat Unit">Civil Defence Fire & Hazmat Station</option>
                <option value="Specialized Industrial Burn Treatment Clinic">Specialized Burn Treatment Unit</option>
                <option value="Approved Environmental Hazardous Waste & Chemical Spills Depot">Hazardous Chemical & Waste Depot</option>
              </select>
            </div>
          </div>

          {mapsError && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs">
              {mapsError}
            </div>
          )}

          {/* Results Display */}
          {mapsResultText && (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {mapsResultText}
              </div>

              {/* Clickable Grounded Places Links */}
              {groundedPlaces.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>Verified Google Maps Destinations (Click to open route)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groundedPlaces.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/60 transition-all flex items-start justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                            {p.title}
                          </h5>
                          {p.snippet && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.snippet}</p>
                          )}
                          <span className="text-[9px] text-emerald-400 font-mono mt-1 block">View in Google Maps →</span>
                        </div>
                        <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-400 shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <History size={16} /> Drill Execution Log
            </h3>
            <div className="grid gap-4">
              {drills.map(d => (
                <div key={d.id} className="p-6 rounded-[2rem] border-2 border-slate-50 flex items-center justify-between hover:border-indigo-100 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="glass-panel p-4 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {d.type.includes('Fire') ? <Flame size={28}/> : <Biohazard size={28}/>}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{d.type}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {d.location} • {d.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                      d.outcome === 'Successful' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {d.outcome}
                    </span>
                    <p className="text-xs font-black text-slate-800 mt-2">
                      {d.timeTakenMinutes}m <span className="text-[9px] text-slate-400 uppercase">Resp. Time</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <h3 className="font-black uppercase tracking-widest text-[10px] text-teal-400 mb-8">Crisis Management</h3>
            <div className="space-y-6">
              <div className="p-5 glass-card/5 border border-white/10 rounded-2xl cursor-pointer hover:glass-card/10 transition-colors">
                <p className="text-xs font-black uppercase mb-1">Evacuation Plans</p>
                <p className="text-[10px] text-slate-400">View current muster point GIS links.</p>
              </div>
              <div className="p-5 glass-card/5 border border-white/10 rounded-2xl cursor-pointer hover:glass-card/10 transition-colors">
                <p className="text-xs font-black uppercase mb-1">Incident Cascade</p>
                <p className="text-[10px] text-slate-400">Automated notification hierarchy.</p>
              </div>
            </div>
            <button className="w-full mt-8 bg-teal-500 text-slate-900 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              Initiate Mock Drill <ArrowRight size={16}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModule;
