import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, Plus, Filter, Search, CheckCircle, ShieldAlert, 
  Download, Eye, X, ArrowUpDown, Calendar, User, MapPin, SlidersHorizontal 
} from 'lucide-react';

export interface HazardRecord {
  id: string;
  title: string;
  description: string;
  category: 'Electrical' | 'Chemical' | 'Physical' | 'Biological' | 'Ergonomic' | 'Environmental' | 'Mechanical';
  site: string;
  location: string;
  identifiedBy: string;
  identifiedDate: string;
  inherentLikelihood: number; // 1-5
  inherentSeverity: number;   // 1-5
  inherentScore: number;      // L x S
  residualLikelihood: number; // 1-5
  residualSeverity: number;   // 1-5
  residualScore: number;
  existingControls: string[];
  additionalMitigationRequired?: string;
  actionOwner: string;
  reviewDate: string;
  status: 'Controlled' | 'Review Needed' | 'Action Required' | 'Escalated';
}

const INITIAL_HAZARDS: HazardRecord[] = [
  {
    id: 'HAZ-2026-001',
    title: 'High Voltage Cable Exposure Near Excavation',
    description: '11kV underground armored cable sleeve exposed after trench backfill erosion during heavy squall.',
    category: 'Electrical',
    site: 'Mina Al Fahal Industrial Complex',
    location: 'Sector 4, Polyethylene Line 2',
    identifiedBy: 'Tariq Al-Hashemi',
    identifiedDate: '2026-03-28',
    inherentLikelihood: 4,
    inherentSeverity: 5,
    inherentScore: 20,
    residualLikelihood: 2,
    residualSeverity: 4,
    residualScore: 8,
    existingControls: ['Physical concrete barricades', 'LOTO lockbox applied', 'Danger 11kV warning signs', 'Daily perimeter sweep'],
    additionalMitigationRequired: 'Permanent encasement conduit pouring scheduled for next shift',
    actionOwner: 'Hassan Mahmoud (Chief Electrical Engineer)',
    reviewDate: '2026-04-10',
    status: 'Controlled'
  },
  {
    id: 'HAZ-2026-002',
    title: 'Hydrocarbon Drain Sump Vapor Accumulation',
    description: 'Atmospheric pocket trap in drain sump B exhibiting LEL readings between 8% and 14% on calm afternoons.',
    category: 'Chemical',
    site: 'Khazzan Tight Gas Complex Block 61',
    location: 'Storage Facility B, Flare Header Interface',
    identifiedBy: 'Amina Al-Mansouri',
    identifiedDate: '2026-03-29',
    inherentLikelihood: 3,
    inherentSeverity: 5,
    inherentScore: 15,
    residualLikelihood: 1,
    residualSeverity: 4,
    residualScore: 4,
    existingControls: ['Secondary nitrogen sweep line', 'Fixed optical gas detector with alarm', 'Spill kit staging', 'No hot work radius of 30m'],
    additionalMitigationRequired: 'Upgrade vent riser height by 2.5m per engineering MOC',
    actionOwner: 'Khalfan Al-Zaabi (Process Safety Lead)',
    reviewDate: '2026-04-15',
    status: 'Controlled'
  },
  {
    id: 'HAZ-2026-003',
    title: 'Heat Stress Risk During Tower Flare Scaffolding',
    description: 'Work at 48m elevation during afternoon peak hours with ambient temperature exceeding 44°C and WBGT >32°C.',
    category: 'Physical',
    site: 'Mina Zayed Terminal',
    location: 'Zone C Berth 4 Marine Tank Farm',
    identifiedBy: 'Rajesh Nair',
    identifiedDate: '2026-04-01',
    inherentLikelihood: 5,
    inherentSeverity: 4,
    inherentScore: 20,
    residualLikelihood: 3,
    residualSeverity: 3,
    residualScore: 9,
    existingControls: ['Oman Ministry of Labour Midday Break Compliance enforced', 'Hydration station with electrolyte packets', 'Chilled air rest refuge on deck', 'Buddy system monitoring'],
    additionalMitigationRequired: 'Shift heavy structural lifts strictly to 20:00 - 04:00 night window',
    actionOwner: 'M. Al-Blooshi (Marine Safety Supt)',
    reviewDate: '2026-04-05',
    status: 'Review Needed'
  },
  {
    id: 'HAZ-2026-004',
    title: 'H2S Fugitive Emissions Near Wellhead Cluster 14',
    description: 'Sulfur scent and intermittent personal monitor bump alarms (3.5 ppm) around packing gland flange.',
    category: 'Chemical',
    site: 'Fahud Field Operation',
    location: 'Wellhead Pad WH-14B',
    identifiedBy: 'Sultan Al-Ghafri',
    identifiedDate: '2026-04-02',
    inherentLikelihood: 4,
    inherentSeverity: 5,
    inherentScore: 20,
    residualLikelihood: 2,
    residualSeverity: 5,
    residualScore: 10,
    existingControls: ['Positive pressure escape BA sets staged', 'Wind socks verified operational', 'Area barricaded at 50m perimeter'],
    additionalMitigationRequired: 'Flange repacking under emergency PTW with breathing apparatus mandatory',
    actionOwner: 'Nasser Al-Kindi (Production Supt)',
    reviewDate: '2026-04-08',
    status: 'Action Required'
  },
  {
    id: 'HAZ-2026-005',
    title: 'Heavy Mobile Plant & Pedestrian Co-mingling at Batching Plant',
    description: 'Ready-mix transit concrete trucks reversing across primary walkways without dedicated banksman.',
    category: 'Mechanical',
    site: 'NEOM Sindalah Island Base',
    location: 'Central Concrete Batching Plant 1',
    identifiedBy: 'Chloe Martin',
    identifiedDate: '2026-04-03',
    inherentLikelihood: 4,
    inherentSeverity: 4,
    inherentScore: 16,
    residualLikelihood: 2,
    residualSeverity: 3,
    residualScore: 6,
    existingControls: ['Speed limit 15 km/h enforced by radar', 'High-visibility class 3 vests required', 'Reversing auditory and strobe beepers'],
    additionalMitigationRequired: 'Install permanent modular pedestrian bridge and one-way traffic segregation loop',
    actionOwner: 'Fahad Al-Harbi (Logistics Safety Mgr)',
    reviewDate: '2026-04-18',
    status: 'Controlled'
  },
  {
    id: 'HAZ-2026-006',
    title: 'Unlabeled Secondary Chemical Solvent Decanting',
    description: 'Cleaning contractors using unlabelled 5-liter HDPE containers for xylene solvent degreaser.',
    category: 'Chemical',
    site: 'Duqm Industrial Port Logistics Hub',
    location: 'Maintenance Workshop Bay 3',
    identifiedBy: 'Arun Kumar',
    identifiedDate: '2026-04-04',
    inherentLikelihood: 4,
    inherentSeverity: 3,
    inherentScore: 12,
    residualLikelihood: 1,
    residualSeverity: 3,
    residualScore: 3,
    existingControls: ['COSHH cupboard access restricted to certified techs', 'Immediate seizure of unlabelled containers', 'GHS compliant pre-printed labels issued'],
    additionalMitigationRequired: 'Mandatory chemical stewardship re-induction for all 3P cleaners',
    actionOwner: 'Vikram Singh (Facility HSE Officer)',
    reviewDate: '2026-04-12',
    status: 'Controlled'
  },
  {
    id: 'HAZ-2026-007',
    title: 'Tandem Crane Lifting Blind Spot Interference',
    description: 'Tandem pick of 38-tonne pre-fabricated pipe rack module obstructed by structural boiler columns.',
    category: 'Mechanical',
    site: 'Ras Al Khair Maritime Yard',
    location: 'Drydock Basin Berth 2',
    identifiedBy: 'Omar Al-Subaie',
    identifiedDate: '2026-04-05',
    inherentLikelihood: 3,
    inherentSeverity: 5,
    inherentScore: 15,
    residualLikelihood: 1,
    residualSeverity: 5,
    residualScore: 5,
    existingControls: ['3D CAD lifting simulation completed', 'Dual licensed Appointed Persons on radio channel 7', 'Certified taglines (2 x 25m) deployed'],
    additionalMitigationRequired: 'Rigid pre-lift coordination meeting with third-party inspection surveyor',
    actionOwner: 'Hamad Al-Dosari (Lifting Specialist)',
    reviewDate: '2026-04-09',
    status: 'Controlled'
  },
  {
    id: 'HAZ-2026-008',
    title: 'Repetitive Strain & Vibration Exposure on Rebar Bending',
    description: 'Manual ironworkers reporting forearm numbness after sustained 8-hour shift on hydraulic rebar benders.',
    category: 'Ergonomic',
    site: 'Mina Al Fahal Industrial Complex',
    location: 'Civil Substation 03 Precast Yard',
    identifiedBy: 'Dr. Sarah Jenkins (Occupational Health)',
    identifiedDate: '2026-04-06',
    inherentLikelihood: 4,
    inherentSeverity: 2,
    inherentScore: 8,
    residualLikelihood: 2,
    residualSeverity: 2,
    residualScore: 4,
    existingControls: ['Anti-vibration certified gloves supplied', 'Job rotation protocol (max 2 hours continuous bending)'],
    additionalMitigationRequired: 'Procure semi-automated CNC bending table to eliminate operator clamp strain',
    actionOwner: 'K. Subramaniam (Precast Supervisor)',
    reviewDate: '2026-04-20',
    status: 'Review Needed'
  },
  {
    id: 'HAZ-2026-009',
    title: 'Legionella Pneumophila Risk in Cooling Tower Basin 2B',
    description: 'Biocide dosing pump solenoid failed over 72-hour holiday weekend; dipslide showed elevated CFU/ml.',
    category: 'Biological',
    site: 'Khazzan Tight Gas Complex Block 61',
    location: 'Utility Water Treatment Plant 2',
    identifiedBy: 'Noora Al-Suwaidi',
    identifiedDate: '2026-04-07',
    inherentLikelihood: 3,
    inherentSeverity: 4,
    inherentScore: 12,
    residualLikelihood: 1,
    residualSeverity: 4,
    residualScore: 4,
    existingControls: ['Shock chlorination hyper-dosing protocol completed', 'Access restricted to respiratory PPE badge holders', 'Daily third-party lab swab tests'],
    additionalMitigationRequired: 'Install redundant duplex dosing pump with telemetry failover alarm',
    actionOwner: 'Bilal Khan (Environmental Eng)',
    reviewDate: '2026-04-14',
    status: 'Controlled'
  },
  {
    id: 'HAZ-2026-010',
    title: 'Deep Trench Wall Collapse Without Adequate Shoring',
    description: '4.2m drainage trench dug in loose sabkha soil adjacent to vibrating heavy rail line without hydraulic jacks.',
    category: 'Physical',
    site: 'Mina Zayed Terminal',
    location: 'Access Corridor South Road',
    identifiedBy: 'Rashid Al-Kaabi',
    identifiedDate: '2026-04-08',
    inherentLikelihood: 4,
    inherentSeverity: 5,
    inherentScore: 20,
    residualLikelihood: 4,
    residualSeverity: 5,
    residualScore: 20,
    existingControls: ['STOP WORK AUTHORITY invoked immediately', 'All workers evacuated from trench trench box requested'],
    additionalMitigationRequired: 'Engineered trench box certified by third-party structural engineer before re-entry',
    actionOwner: 'Jassem Al-Mehairbi (HSE Inspector)',
    reviewDate: '2026-04-09',
    status: 'Escalated'
  },
  {
    id: 'HAZ-2026-011',
    title: 'Uncertified Scaffolding Tagged with Green Scafftag',
    description: 'Subcontractor crew placed counterfeit green tag on Cuplok tower missing intermediate guardrails and ledger braces.',
    category: 'Physical',
    site: 'NEOM Sindalah Island Base',
    location: 'Luxury Villas Cluster B',
    identifiedBy: 'Marcus Vance',
    identifiedDate: '2026-04-09',
    inherentLikelihood: 4,
    inherentSeverity: 4,
    inherentScore: 16,
    residualLikelihood: 1,
    residualSeverity: 4,
    residualScore: 4,
    existingControls: ['Immediate Red Do Not Use lock tags applied', 'Scafftag barcode serialisation audit initiated', 'Subcontractor supervisor suspended pending review'],
    additionalMitigationRequired: 'QR-code digital scaffolding verification system deployment',
    actionOwner: 'Elias Al-Otaibi (Site Safety Lead)',
    reviewDate: '2026-04-11',
    status: 'Controlled'
  },
  {
    id: 'HAZ-2026-012',
    title: 'Oily Water Separator Discharge Effluent Exceedance',
    description: 'Hydrocarbon content in discharge to marine outfall logged at 18 mg/L against EPA regulatory ceiling of 10 mg/L.',
    category: 'Environmental',
    site: 'Ras Al Khair Maritime Yard',
    location: 'Outfall Culvert OF-01',
    identifiedBy: 'Zainab Al-Mutawa',
    identifiedDate: '2026-04-10',
    inherentLikelihood: 4,
    inherentSeverity: 4,
    inherentScore: 16,
    residualLikelihood: 1,
    residualSeverity: 3,
    residualScore: 3,
    existingControls: ['Automatic divert valve tripped effluent to slop tank', 'Coalescing plate filters replaced', 'EPA notification transmitted within 2 hours per protocol'],
    additionalMitigationRequired: 'Continuous online TOC analyzer installation',
    actionOwner: 'Dr. Tariq Bitar (Environmental Compliance)',
    reviewDate: '2026-04-16',
    status: 'Controlled'
  }
];

export const HazardRegisterModule: React.FC = () => {
  const [hazards, setHazards] = useState<HazardRecord[]>(() => {
    const saved = localStorage.getItem('hse_hazard_register');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_HAZARDS;
      }
    }
    return INITIAL_HAZARDS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState<HazardRecord | null>(null);

  // New Hazard Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Physical' as HazardRecord['category'],
    site: 'Mina Al Fahal Industrial Complex',
    location: '',
    identifiedBy: 'Tariq Al-Hashemi',
    inherentLikelihood: 3,
    inherentSeverity: 4,
    residualLikelihood: 2,
    residualSeverity: 2,
    existingControls: '',
    additionalMitigationRequired: '',
    actionOwner: '',
    reviewDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'Action Required' as HazardRecord['status']
  });

  const saveHazards = (updated: HazardRecord[]) => {
    setHazards(updated);
    localStorage.setItem('hse_hazard_register', JSON.stringify(updated));
  };

  const getRiskBadge = (score: number) => {
    if (score >= 17) {
      return <span className="px-2.5 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-xs font-bold">Critical ({score})</span>;
    }
    if (score >= 10) {
      return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded text-xs font-bold">High ({score})</span>;
    }
    if (score >= 5) {
      return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded text-xs font-bold">Moderate ({score})</span>;
    }
    return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-bold">Low ({score})</span>;
  };

  const getStatusBadge = (status: HazardRecord['status']) => {
    switch (status) {
      case 'Controlled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={13} /> Controlled
          </span>
        );
      case 'Review Needed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={13} /> Review Needed
          </span>
        );
      case 'Action Required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <SlidersHorizontal size={13} /> Action Required
          </span>
        );
      case 'Escalated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <ShieldAlert size={13} /> Escalated
          </span>
        );
    }
  };

  const filteredHazards = useMemo(() => {
    return hazards.filter(h => {
      const matchSearch = 
        h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.actionOwner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'All' || h.category === selectedCategory;
      const matchStatus = selectedStatus === 'All' || h.status === selectedStatus;
      
      let matchTier = true;
      if (selectedRiskTier === 'Critical') matchTier = h.inherentScore >= 17;
      else if (selectedRiskTier === 'High') matchTier = h.inherentScore >= 10 && h.inherentScore < 17;
      else if (selectedRiskTier === 'Moderate') matchTier = h.inherentScore >= 5 && h.inherentScore < 10;
      else if (selectedRiskTier === 'Low') matchTier = h.inherentScore < 5;

      return matchSearch && matchCategory && matchStatus && matchTier;
    });
  }, [hazards, searchTerm, selectedCategory, selectedStatus, selectedRiskTier]);

  const handleCreateHazard = (e: React.FormEvent) => {
    e.preventDefault();
    const inherentScore = formData.inherentLikelihood * formData.inherentSeverity;
    const residualScore = formData.residualLikelihood * formData.residualSeverity;
    const newId = `HAZ-2026-${String(hazards.length + 1).padStart(3, '0')}`;
    
    const newRecord: HazardRecord = {
      id: newId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      site: formData.site,
      location: formData.location,
      identifiedBy: formData.identifiedBy,
      identifiedDate: new Date().toISOString().split('T')[0],
      inherentLikelihood: formData.inherentLikelihood,
      inherentSeverity: formData.inherentSeverity,
      inherentScore,
      residualLikelihood: formData.residualLikelihood,
      residualSeverity: formData.residualSeverity,
      residualScore,
      existingControls: formData.existingControls.split('\n').filter(s => s.trim().length > 0),
      additionalMitigationRequired: formData.additionalMitigationRequired,
      actionOwner: formData.actionOwner || 'HSE Compliance Lead',
      reviewDate: formData.reviewDate,
      status: formData.status
    };

    saveHazards([newRecord, ...hazards]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      category: 'Physical',
      site: 'Mina Al Fahal Industrial Complex',
      location: '',
      identifiedBy: 'Tariq Al-Hashemi',
      inherentLikelihood: 3,
      inherentSeverity: 4,
      residualLikelihood: 2,
      residualSeverity: 2,
      existingControls: '',
      additionalMitigationRequired: '',
      actionOwner: '',
      reviewDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'Action Required'
    });
  };

  const handleExportCSV = () => {
    const headers = ['Hazard ID', 'Title', 'Category', 'Site', 'Location', 'Inherent Risk', 'Residual Risk', 'Status', 'Owner', 'Review Date'];
    const rows = filteredHazards.map(h => [
      h.id,
      `"${h.title.replace(/"/g, '""')}"`,
      h.category,
      `"${h.site}"`,
      `"${h.location.replace(/"/g, '""')}"`,
      h.inherentScore,
      h.residualScore,
      h.status,
      `"${h.actionOwner}"`,
      h.reviewDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enterprise_Hazard_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Enterprise Hazard Register
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Centralized multi-site risk repository aligned with Oman MoL MD 286/2008 & PDO Specifications and ISO 45001 standards. Total logged: {hazards.length} hazards.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium transition"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition shadow-sm"
          >
            <Plus size={16} />
            Log Hazard
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hazards</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{hazards.length}</div>
          <div className="text-xs text-slate-400 mt-1">Across 6 primary facilities</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical Risk (17–25)</div>
          <div className="text-2xl font-bold text-red-700 mt-1">
            {hazards.filter(h => h.inherentScore >= 17).length}
          </div>
          <div className="text-xs text-red-600 mt-1 font-medium">Immediate escalation active</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">High Risk (10–16)</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {hazards.filter(h => h.inherentScore >= 10 && h.inherentScore < 17).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Secondary barrier enforced</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Controlled Rate</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {Math.round((hazards.filter(h => h.status === 'Controlled').length / (hazards.length || 1)) * 100)}%
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Within Oman MoL MD 286/2008 threshold</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by hazard, ID, location, or owner..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Chemical">Chemical</option>
              <option value="Physical">Physical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Biological">Biological</option>
              <option value="Ergonomic">Ergonomic</option>
              <option value="Environmental">Environmental</option>
            </select>

            <select
              value={selectedRiskTier}
              onChange={(e) => setSelectedRiskTier(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical (17–25)</option>
              <option value="High">High (10–16)</option>
              <option value="Moderate">Moderate (5–9)</option>
              <option value="Low">Low (1–4)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Controlled">Controlled</option>
              <option value="Review Needed">Review Needed</option>
              <option value="Action Required">Action Required</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>
        </div>

        {/* Hazard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs">
              <tr>
                <th className="px-5 py-3 font-semibold">Hazard ID & Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Site / Location</th>
                <th className="px-4 py-3 font-semibold">Inherent Risk</th>
                <th className="px-4 py-3 font-semibold">Residual Risk</th>
                <th className="px-4 py-3 font-semibold">Action Owner</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHazards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No hazards matched the search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredHazards.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{h.title}</div>
                      <div className="text-xs text-indigo-600 font-mono mt-0.5">{h.id}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {h.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-slate-800">{h.site}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px]">{h.location}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {getRiskBadge(h.inherentScore)}
                    </td>
                    <td className="px-4 py-3.5">
                      {getRiskBadge(h.residualScore)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-800 font-medium">{h.actionOwner}</div>
                      <div className="text-xs text-slate-400">Review: {h.reviewDate}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(h.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedHazard(h)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Details */}
      {selectedHazard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-xs font-mono font-semibold text-indigo-600">{selectedHazard.id}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedHazard.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedHazard(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Description & Context</div>
                <p className="mt-1 text-slate-700 leading-relaxed">{selectedHazard.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Facility & Location</div>
                  <div className="font-medium text-slate-900 mt-0.5">{selectedHazard.site}</div>
                  <div className="text-xs text-slate-500">{selectedHazard.location}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Reported By & Date</div>
                  <div className="font-medium text-slate-900 mt-0.5">{selectedHazard.identifiedBy}</div>
                  <div className="text-xs text-slate-500">{selectedHazard.identifiedDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-600">Inherent Risk (Uncontrolled)</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">Likelihood ({selectedHazard.inherentLikelihood}) × Severity ({selectedHazard.inherentSeverity})</span>
                    {getRiskBadge(selectedHazard.inherentScore)}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-600">Residual Risk (With Controls)</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">Likelihood ({selectedHazard.residualLikelihood}) × Severity ({selectedHazard.residualSeverity})</span>
                    {getRiskBadge(selectedHazard.residualScore)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 uppercase mb-2">Applied Control Measures</div>
                <ul className="space-y-1.5">
                  {selectedHazard.existingControls.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 text-xs">
                      <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedHazard.additionalMitigationRequired && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                  <div className="text-xs font-bold uppercase flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-600" />
                    Additional Mandatory Action
                  </div>
                  <p className="text-xs mt-1">{selectedHazard.additionalMitigationRequired}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
                <div>
                  <span className="font-semibold">Action Owner:</span> {selectedHazard.actionOwner}
                </div>
                <div>
                  <span className="font-semibold">Next Review:</span> {selectedHazard.reviewDate}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedHazard(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log New Hazard */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" />
                Log New Workplace Hazard
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateHazard} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hazard Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaffolding board displacement on Deck 3"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Physical">Physical</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Biological">Biological</option>
                    <option value="Ergonomic">Ergonomic</option>
                    <option value="Environmental">Environmental</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Site / Facility *</label>
                  <select
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Mina Al Fahal Industrial Complex">Mina Al Fahal Industrial Complex</option>
                    <option value="Khazzan Tight Gas Complex Block 61">Khazzan Tight Gas Complex Block 61</option>
                    <option value="Mina Zayed Terminal">Mina Zayed Terminal</option>
                    <option value="Fahud Field Operation">Fahud Field Operation</option>
                    <option value="NEOM Sindalah Island Base">NEOM Sindalah Island Base</option>
                    <option value="Ras Al Khair Maritime Yard">Ras Al Khair Maritime Yard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Location / Coordinate *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 2, Flare Header, Column 44"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Hazard Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe root conditions, potential consequences, and persons at risk..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {/* 5x5 Matrix scoring */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase mb-2">Inherent Risk Matrix (L × S)</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Likelihood (1–5): {formData.inherentLikelihood}</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={formData.inherentLikelihood}
                      onChange={(e) => setFormData({ ...formData, inherentLikelihood: parseInt(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Severity (1–5): {formData.inherentSeverity}</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={formData.inherentSeverity}
                      onChange={(e) => setFormData({ ...formData, inherentSeverity: parseInt(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-xs font-medium text-slate-600 mr-2">Inherent Score:</span>
                  {getRiskBadge(formData.inherentLikelihood * formData.inherentSeverity)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Controls (One per line)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Danger Signage&#10;Secondary Lanyard&#10;LOTO tag"
                  value={formData.existingControls}
                  onChange={(e) => setFormData({ ...formData, existingControls: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Action Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. Tariq Al-Hashemi"
                    value={formData.actionOwner}
                    onChange={(e) => setFormData({ ...formData, actionOwner: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Review Target Date</label>
                  <input
                    type="date"
                    value={formData.reviewDate}
                    onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
                >
                  Save Hazard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HazardRegisterModule;
