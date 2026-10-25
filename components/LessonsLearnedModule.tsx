import React, { useState } from 'react';
import { BookOpen, Search, Filter, Tag, ArrowRight, BrainCircuit } from 'lucide-react';
import { AITag } from './AITag';

interface Lesson {
    id: string;
    title: string;
    module: string;
    tags: string[];
    date: string;
    summary: string;
    keyTakeaway: string;
}

const MOCK_LESSONS: Lesson[] = [
    {
        id: 'LL-001',
        title: 'Confined Space Ventilation Failure at Tank 42',
        module: 'Permit to Work',
        tags: ['Confined Space', 'Ventilation', 'Gas Testing', 'Mina Al Fahal'],
        date: '2026-03-15',
        summary: 'Primary ventilation fan failed mid-operation due to breaker trip. Standby blower was not staged within line of sight.',
        keyTakeaway: 'Always stage a secondary spark-proof pneumatic ventilation unit within 25m of active vessel manways with dual-circuit electrical supply.'
    },
    {
        id: 'LL-002',
        title: 'Scaffold Tagging Discrepancy during Shift Handover',
        module: 'Safety Audits',
        tags: ['Working at Height', 'Scaffolding', 'Contractor', 'Khazzan Gas Asset'],
        date: '2026-03-22',
        summary: 'Scaffold was modified by night crew but the green tag remained active, leading to pipefitters accessing an unbraced cantilever.',
        keyTakeaway: 'Implement dual-signature digital barcode handover protocol; any physical alteration automatically invalidates the permit.'
    },
    {
        id: 'LL-003',
        title: 'Late Evacuation due to Overlapping Sirens in SIMOPS Zone',
        module: 'Emergency Response',
        tags: ['Evacuation', 'Alarms', 'SIMOPS', 'Mina Zayed'],
        date: '2026-03-28',
        summary: 'Personnel in Zone B mistook a gas detection siren for a harbor vessel horn and delayed muster by 9 minutes.',
        keyTakeaway: 'Differentiate acoustic frequencies between marine berthing signals and toxic gas sirens; add omni-directional high-intensity strobe beacons.'
    },
    {
        id: 'LL-004',
        title: 'Crane Outrigger Sabkha Liquefaction Near Culvert Trench',
        module: 'Lifting Operations',
        tags: ['Heavy Lift', 'Geotechnical', 'Ground Bearing', 'NEOM Base'],
        date: '2026-04-01',
        summary: '150T mobile crane right rear outrigger punched through thin gravel cap into saturated sabkha during 28T precast module lift.',
        keyTakeaway: 'Mandate dynamic cone penetrometer (DCP) ground testing and double-layered interlocking steel matting within 30m of coastal water tables.'
    },
    {
        id: 'LL-005',
        title: 'Arc Flash Hazard During 33kV Grounding Stick Misalignment',
        module: 'Electrical Safety',
        tags: ['Electrical', 'Arc Flash', 'NFPA 70E', 'Mina Al Fahal'],
        date: '2026-04-03',
        summary: 'Technician reached across de-energized cubicle busbar without verifying zero potential on adjacent bus tie.',
        keyTakeaway: 'Enforce physical interlock barriers on adjacent energized sections and calibrate non-contact voltage test wands prior to touch.'
    },
    {
        id: 'LL-006',
        title: 'Acid Transfer Hose Burst Due to Wrong Elastomer Gasket',
        module: 'Chemical Safety',
        tags: ['Chemicals', 'COSHH', 'Material Compatibility', 'Duqm Industrial Port'],
        date: '2026-04-05',
        summary: 'Buna-N rubber seal installed instead of PTFE Viton on 32% HCl delivery pump skid, dissolving within 4 hours of transfer.',
        keyTakeaway: 'Implement laser-etched color-coded camlock couplings matched strictly to chemical compatibility charts with barcoded hose tagging.'
    },
    {
        id: 'LL-007',
        title: 'Deep Trench Sidewall Collapse Induced by Adjoining Heavy Haul Road',
        module: 'Excavation',
        tags: ['Excavation', 'Shoring', 'Traffic Vibration', 'Fahud'],
        date: '2026-04-07',
        summary: '4.2m drainage trench collapsed 30 seconds after twin 40-tonne aggregate tippers passed within 2.5m of unprotected trench lip.',
        keyTakeaway: 'Maintain minimum 5m vehicle exclusion berm with physical concrete New Jersey barriers along all deep excavation alignments.'
    },
    {
        id: 'LL-008',
        title: 'Midday Heat Stroke During Fast-Track Slab Concrete Pour',
        module: 'Occupational Health',
        tags: ['Heat Stress', 'WBGT', 'Oman Ministry of Labour Midday Break', 'Ras Al Khair'],
        date: '2026-04-09',
        summary: 'Three finishers suffered heat cramps and confusion after continuing slab troweling past 12:30 PM under 43°C ambient temperature.',
        keyTakeaway: 'Continuous electronic wet-bulb globe temperature (WBGT) telemetry; automatic work stoppage alarm triggered when WBGT reaches 32°C.'
    },
    {
        id: 'LL-009',
        title: 'Uncontrolled Nitrogen Purging Pocket in Low-Point Valve Pit',
        module: 'Hazard Management',
        tags: ['Asphyxiation', 'Nitrogen', 'Confined Space', 'Khazzan Gas Asset'],
        date: '2026-04-11',
        summary: 'Nitrogen gas bled into open concrete sump pit displacing oxygen to 14.2%; worker stepped down ladder without gas monitor.',
        keyTakeaway: 'Treat any open depression deeper than 1.2m as a confined space whenever inert purge lines are active within 15m radius.'
    },
    {
        id: 'LL-010',
        title: 'Dropped 4-Pound Spud Wrench Deflection off Flare Tower Deck',
        module: 'Incident Management',
        tags: ['DROPS', 'Tool Lanyards', 'Working at Height', 'Mina Zayed'],
        date: '2026-04-13',
        summary: 'Wrench tether snapped when dropped from 32m; tool ricocheted off intermediate platform into outer perimeter.',
        keyTakeaway: 'Deploy certified 2-to-1 dynamic shock-absorbing tool lanyards and double-layer fine mesh containment netting around work platforms.'
    }
];

export const LessonsLearnedModule: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState<string | null>(null);

    const modules = Array.from(new Set(MOCK_LESSONS.map(l => l.module)));

    const filteredLessons = MOCK_LESSONS.filter(l => 
        (selectedModule ? l.module === selectedModule : true) &&
        (l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         l.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-x-5">
                    <div className="bg-amber-500 p-5 rounded-md text-white shadow-2xl shadow-amber-500/20">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Lessons Learned</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-amber-500 ps-4">Knowledge Repository</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Search & Filter */}
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="relative">
                        <Search size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search lessons, tags..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full ps-10 pe-4 py-3 glass-card border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="glass-card p-5 rounded-xl border border-slate-100">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Filter size={14} /> Filter by Module
                        </h4>
                        <div className="space-y-2">
                            <button 
                                onClick={() => setSelectedModule(null)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${selectedModule === null ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                All Modules
                            </button>
                            {modules.map(mod => (
                                <button 
                                    key={mod}
                                    onClick={() => setSelectedModule(mod)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${selectedModule === mod ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {mod}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Insights Panel */}
                    <div className="glass-card p-5 rounded-xl border border-indigo-100 bg-indigo-50/50">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                <BrainCircuit size={14} /> Cross-Analysis
                            </h4>
                            <AITag />
                        </div>
                        <p className="text-xs font-medium text-indigo-900/80 leading-relaxed">
                            AI analysis shows a 30% overlap between Confined Space and SIMOPS incidents. Recommended action: Mandate cross-permit reviews for all Confined Space entries in active construction zones.
                        </p>
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 space-y-4">
                    {filteredLessons.map(lesson => (
                        <div key={lesson.id} className="glass-card p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[9px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-widest mb-2 inline-block">
                                        {lesson.module}
                                    </span>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{lesson.title}</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{lesson.date}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-4 leading-relaxed">{lesson.summary}</p>
                            
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Key Takeaway</p>
                                <p className="text-sm font-bold text-amber-900">{lesson.keyTakeaway}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {lesson.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-widest">
                                            <Tag size={10} /> {tag}
                                        </span>
                                    ))}
                                </div>
                                <button className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Read Full Report <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredLessons.length === 0 && (
                        <div className="p-12 text-center text-slate-400 font-medium">
                            No lessons found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default LessonsLearnedModule;
