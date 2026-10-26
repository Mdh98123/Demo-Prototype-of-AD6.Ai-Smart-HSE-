import React, { useState } from 'react';
import { ChemicalInventory } from '../types';
import { useUser } from '../contexts/UserContext';
import { 
  FlaskConical, AlertTriangle, FileText, Plus, Search, 
  Trash2, AlertOctagon, Download, Info, CheckCircle2,
  Flame, Skull, Zap, Wind, Bomb, X, ShieldAlert, Droplet, Eye
} from 'lucide-react';

interface ChemicalDetail extends ChemicalInventory {
  casNumber?: string;
  firstAid?: string;
  ppeRequired?: string[];
  fireFighting?: string;
  unNumber?: string;
}

const INITIAL_CHEMICALS: ChemicalDetail[] = [
  { id: 'CH-001', name: 'Acetone Technical Grade', msdsRef: 'MSDS-ACT-01', location: 'Solvent Storage Zone A', quantity: 250, unit: 'L', hazardClass: 'Flammable', expiryDate: '2026-10-01', compatibilityGroup: 'Solvents', casNumber: '67-64-1', unNumber: 'UN 1090', firstAid: 'Flush eyes for 15 mins. Move to fresh air. Do not induce vomiting.', ppeRequired: ['Butyl rubber gloves', 'Safety goggles', 'Vapor respirator'], fireFighting: 'Use carbon dioxide or dry chemical powder. Water spray may be ineffective.' },
  { id: 'CH-002', name: 'Sulfuric Acid 98% AR Grade', msdsRef: 'MSDS-SUL-05', location: 'Zone B Acid Bunker', quantity: 800, unit: 'L', hazardClass: 'Corrosive', expiryDate: '2027-04-15', compatibilityGroup: 'Acids', casNumber: '7664-93-9', unNumber: 'UN 1830', firstAid: 'Immediately flood skin with deluge shower for at least 20 min. Remove contaminated clothing.', ppeRequired: ['Acid-resistant PVC suit', 'Full face shield', 'Neoprene boots'], fireFighting: 'Do not use water directly on acid (violent exothermic reaction). Smother with dry lime.' },
  { id: 'CH-003', name: 'Compressed Oxygen Cylinders (200 Bar)', msdsRef: 'MSDS-OXY-02', location: 'Gas Rack Cylinder Bay 1', quantity: 36, unit: 'Cylinders', hazardClass: 'Oxidizer', expiryDate: '2028-01-01', compatibilityGroup: 'Gases', casNumber: '7782-44-7', unNumber: 'UN 1072', firstAid: 'Hyperoxia therapy under medical oversight if prolonged exposure.', ppeRequired: ['Leather rigging gloves', 'Steel toe safety shoes', 'Cylinder valve safety cap'], fireFighting: 'Accelerates combustion. Cool cylinders with copious water fog from protected distance.' },
  { id: 'CH-004', name: 'Ultra-Low Sulfur Diesel Fuel (EN 590)', msdsRef: 'MSDS-DSL-88', location: 'Main Generator Tank Farm 3', quantity: 45000, unit: 'L', hazardClass: 'Flammable', expiryDate: '2026-12-31', compatibilityGroup: 'Fuels', casNumber: '68476-34-6', unNumber: 'UN 1202', firstAid: 'Do not induce vomiting. Seek immediate medical attention. If skin contact, wash with soap.', ppeRequired: ['Nitrile gloves', 'Chemical apron', 'Vapor safety glasses'], fireFighting: 'AFFF foam, dry chemical, CO2. Never use straight stream water.' },
  { id: 'CH-005', name: 'Sodium Hypochlorite Solution 12% (Bleach)', msdsRef: 'MSDS-HYP-12', location: 'Utility Water Treatment Shed', quantity: 1200, unit: 'L', hazardClass: 'Corrosive', expiryDate: '2025-11-30', compatibilityGroup: 'Bases', casNumber: '7681-52-9', unNumber: 'UN 1791', firstAid: 'Flush eyes and skin immediately. Inhalation: move to fresh air. Treat for pulmonary irritation.', ppeRequired: ['Chemical splash goggles', 'Heavy duty nitrile gauntlets', 'Rubber apron'], fireFighting: 'Non-flammable. Liberates toxic chlorine gas under fire conditions. Use water spray.' },
  { id: 'CH-006', name: 'Dissolved Acetylene Fuel Gas Cylinders', msdsRef: 'MSDS-ACE-09', location: 'Gas Rack Cylinder Bay 2', quantity: 18, unit: 'Cylinders', hazardClass: 'Flammable', expiryDate: '2026-08-14', compatibilityGroup: 'Gases', casNumber: '74-86-2', unNumber: 'UN 1001', firstAid: 'Move victim to uncontaminated atmosphere. Administer artificial respiration if needed.', ppeRequired: ['Flame retardant welding leathers', 'Flashback arrestors mandatory', 'Impact goggles'], fireFighting: 'Do not extinguish burning gas unless leak can be stopped safely. Cool shell with water.' },
  { id: 'CH-007', name: 'Methanol 99.85% Industrial Feedstock', msdsRef: 'MSDS-METH-03', location: 'Polyethylene Lab Store Bay 4', quantity: 600, unit: 'L', hazardClass: 'Toxic', expiryDate: '2026-07-20', compatibilityGroup: 'Solvents', casNumber: '67-56-1', unNumber: 'UN 1230', firstAid: 'FATAL IF SWALLOWED. Induce vomiting only if directed by medical authority. Ethanol antidote.', ppeRequired: ['Butyl gloves', 'Supplied air respirator if vapor >200ppm', 'Safety shield'], fireFighting: 'Alcohol-resistant foam, dry chemical, carbon dioxide.' },
  { id: 'CH-008', name: 'Caustic Soda Flakes (Sodium Hydroxide 99%)', msdsRef: 'MSDS-CS-55', location: 'Neutralization Chemical Warehouse B', quantity: 2400, unit: 'kg', hazardClass: 'Corrosive', expiryDate: '2027-06-01', compatibilityGroup: 'Bases', casNumber: '1310-73-2', unNumber: 'UN 1823', firstAid: 'Severe deep tissue burns. Flush continuously with water for at least 30 minutes.', ppeRequired: ['PVC chemical suit', 'Face shield', 'Rubber boots', 'Nitrile gauntlets'], fireFighting: 'Reacts violently with water generating intense heat. Smother with dry chemical.' },
  { id: 'CH-009', name: 'Zinc Free Hydraulic Oil ISO VG 68', msdsRef: 'MSDS-OIL-68', location: 'Heavy Plant Maintenance Shop', quantity: 1640, unit: 'L', hazardClass: 'Flammable', expiryDate: '2028-03-15', compatibilityGroup: 'Oils', casNumber: '64742-54-7', unNumber: 'N/A', firstAid: 'High pressure injection is a surgical emergency. Seek immediate specialist surgical review.', ppeRequired: ['Nitrile workshop gloves', 'Safety glasses', 'Steel toe boots'], fireFighting: 'Dry chemical, foam or CO2. Water spray to cool exposed drums.' },
  { id: 'CH-010', name: 'Liquefied Chlorine Gas Emergency Drums', msdsRef: 'MSDS-CL-99', location: 'Secure Hazardous Hazmat Cage C', quantity: 4, unit: 'Cylinders', hazardClass: 'Toxic', expiryDate: '2025-09-30', compatibilityGroup: 'Gases', casNumber: '7782-50-5', unNumber: 'UN 1017', firstAid: 'Lethal inhalation risk. Evacuate upwind. Administer 100% humidified oxygen. Seek ICU admission.', ppeRequired: ['Level A encapsulating gastight suit with self-contained breathing apparatus (SCBA)'], fireFighting: 'Does not burn but oxidizes vigorously. Apply water spray ONLY to keep containers cool.' },
  { id: 'CH-011', name: 'Monoethanolamine (MEA) 85% Sweetening Solvent', msdsRef: 'MSDS-MEA-44', location: 'Amine Absorption Unit Tank T-104', quantity: 18000, unit: 'L', hazardClass: 'Corrosive', expiryDate: '2026-11-15', compatibilityGroup: 'Bases', casNumber: '141-43-5', unNumber: 'UN 2491', firstAid: 'Wash skin thoroughly with soap and water for 15 minutes. Inhalation: remove to fresh air.', ppeRequired: ['Chemical goggles', 'Viton gloves', 'Half-mask with organic vapor/acid gas cartridge'], fireFighting: 'Alcohol-resistant foam, water spray or mist, dry chemical.' },
  { id: 'CH-012', name: 'Triethylene Glycol (TEG) 99% Dehydration Fluid', msdsRef: 'MSDS-TEG-19', location: 'Gas Dehydration Contactor Skids', quantity: 8500, unit: 'L', hazardClass: 'Toxic', expiryDate: '2027-08-30', compatibilityGroup: 'Solvents', casNumber: '112-27-6', unNumber: 'N/A', firstAid: 'In case of contact, immediately rinse skin and eyes. If ingested, rinse mouth thoroughly.', ppeRequired: ['PVC or nitrile gloves', 'Eye protection with side shields'], fireFighting: 'Water fog, foam, dry chemical powder.' }
];

const ChemicalsModule: React.FC = () => {
  const { currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [chemicals, setChemicals] = useState<ChemicalDetail[]>(() => {
    const saved = localStorage.getItem('hse_chemicals_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CHEMICALS;
      }
    }
    return INITIAL_CHEMICALS;
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMSDS, setSelectedMSDS] = useState<ChemicalDetail | null>(null);
  const [isCOSHHOpen, setIsCOSHHOpen] = useState(false);

  // New Chemical Form State
  const [formData, setFormData] = useState({
    name: '',
    casNumber: '',
    unNumber: '',
    hazardClass: 'Flammable' as ChemicalInventory['hazardClass'],
    location: 'Zone A Solvent Store',
    quantity: 100,
    unit: 'L',
    compatibilityGroup: 'Solvents',
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    firstAid: 'Flush with water for 15 minutes. Seek medical guidance.',
    ppeRequired: 'Nitrile gloves, Safety goggles',
    fireFighting: 'Dry chemical powder or CO2 extinguisher.'
  });

  const saveChemicals = (updated: ChemicalDetail[]) => {
    setChemicals(updated);
    localStorage.setItem('hse_chemicals_inventory', JSON.stringify(updated));
  };

  const getHazardColor = (cls: string) => {
    switch(cls) {
      case 'Flammable': return 'bg-red-50 text-red-600 border-red-200';
      case 'Corrosive': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Toxic': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Oxidizer': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Explosive': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getHazardIcon = (cls: string) => {
    switch(cls) {
      case 'Flammable': return <Flame size={14} className="me-1.5" />;
      case 'Corrosive': return <Zap size={14} className="me-1.5" />;
      case 'Toxic': return <Skull size={14} className="me-1.5" />;
      case 'Oxidizer': return <Wind size={14} className="me-1.5" />;
      case 'Explosive': return <Bomb size={14} className="me-1.5" />;
      default: return <AlertTriangle size={14} className="me-1.5" />;
    }
  };

  const getHazardCardStyle = (cls: string) => {
    switch(cls) {
      case 'Flammable': return 'border-red-100 hover:border-red-300 bg-gradient-to-br from-white to-red-50/30';
      case 'Corrosive': return 'border-orange-100 hover:border-orange-300 bg-gradient-to-br from-white to-orange-50/30';
      case 'Toxic': return 'border-purple-100 hover:border-purple-300 bg-gradient-to-br from-white to-purple-50/30';
      case 'Oxidizer': return 'border-blue-100 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50/30';
      case 'Explosive': return 'border-yellow-100 hover:border-yellow-300 bg-gradient-to-br from-white to-yellow-50/30';
      default: return 'border-slate-100 hover:border-slate-300 bg-white';
    }
  };

  const handleCreateChemical = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CH-${String(chemicals.length + 1).padStart(3, '0')}`;
    const newChem: ChemicalDetail = {
      id: newId,
      name: formData.name,
      msdsRef: `MSDS-${formData.name.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 80 + 10)}`,
      location: formData.location,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      hazardClass: formData.hazardClass,
      expiryDate: formData.expiryDate,
      compatibilityGroup: formData.compatibilityGroup,
      casNumber: formData.casNumber || 'N/A',
      unNumber: formData.unNumber || 'N/A',
      firstAid: formData.firstAid,
      ppeRequired: formData.ppeRequired.split(',').map(s => s.trim()),
      fireFighting: formData.fireFighting
    };

    saveChemicals([newChem, ...chemicals]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      casNumber: '',
      unNumber: '',
      hazardClass: 'Flammable',
      location: 'Zone A Solvent Store',
      quantity: 100,
      unit: 'L',
      compatibilityGroup: 'Solvents',
      expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      firstAid: 'Flush with water for 15 minutes. Seek medical guidance.',
      ppeRequired: 'Nitrile gloves, Safety goggles',
      fireFighting: 'Dry chemical powder or CO2 extinguisher.'
    });
  };

  const handleDeleteChemical = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this chemical record from active inventory?')) {
      saveChemicals(chemicals.filter(c => c.id !== id));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Chemical ID', 'Name', 'CAS Number', 'UN Number', 'Hazard Class', 'Location', 'Quantity', 'Unit', 'Compatibility Group', 'Expiry Date', 'MSDS Code'];
    const rows = chemicals.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.casNumber || 'N/A',
      c.unNumber || 'N/A',
      c.hazardClass,
      `"${c.location.replace(/"/g, '""')}"`,
      c.quantity,
      c.unit,
      c.compatibilityGroup,
      c.expiryDate,
      c.msdsRef
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enterprise_COSHH_Chemical_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = chemicals.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.hazardClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.casNumber && c.casNumber.includes(searchTerm))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-x-5">
          <div className="bg-purple-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-purple-500/20">
            <FlaskConical size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">HazMat & COSHH Control</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-purple-500 ps-4">
              Chemical Inventory, Segregation Matrix & GHS/MSDS Registry ({chemicals.length} items logged)
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download size={15}/> Export CSV
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 transition cursor-pointer"
          >
            <Plus size={16}/> Add Chemical
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Chemical Registry</h3>
                <p className="text-xs text-slate-400">Showing {filtered.length} of {chemicals.length} substances</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                  type="text" 
                  placeholder="Search name, CAS, hazard..." 
                  className="w-full ps-9 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No chemical substances matching query "{searchTerm}".
                </div>
              ) : (
                filtered.map(chem => {
                  const cardStyle = getHazardCardStyle(chem.hazardClass);
                  return (
                    <div key={chem.id} className={`p-6 rounded-[2rem] border-2 transition-all group relative overflow-hidden ${cardStyle}`}>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-800 text-base">{chem.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">{chem.id}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                            {chem.location} • <span className="text-slate-800 font-black">{chem.quantity} {chem.unit}</span>
                            {chem.casNumber && chem.casNumber !== 'N/A' && ` • CAS: ${chem.casNumber}`}
                          </p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border flex items-center shadow-sm ${getHazardColor(chem.hazardClass)}`}>
                          {getHazardIcon(chem.hazardClass)}
                          {chem.hazardClass}
                        </span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setSelectedMSDS(chem)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-purple-700 uppercase hover:underline cursor-pointer"
                          >
                            <FileText size={13}/> View GHS / MSDS Sheet
                          </button>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Expiry: {chem.expiryDate}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteChemical(chem.id, e)}
                          title="Delete Chemical"
                          className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded cursor-pointer"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Segregation Rules & Guidelines */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 end-0 p-8 opacity-10"><AlertOctagon size={120}/></div>
            <h3 className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-4">Mandatory Segregation Matrix</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Strict chemical barrier isolation rules aligned with Oman MoL MD 286/2008 & PDO Specifications CoP 14 and NFPA 400.
            </p>
            <div className="space-y-3.5 relative z-10 text-xs">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5"/>
                <div>
                  <p className="font-bold text-white">Oxidizers + Flammables</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Must be separated by min. 6m or 2-hour fire-rated wall.</p>
                </div>
              </div>
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5"/>
                <div>
                  <p className="font-bold text-white">Strong Acids + Bases</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Store in dedicated secondary containment sumps.</p>
                </div>
              </div>
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                <AlertTriangle size={18} className="text-purple-400 shrink-0 mt-0.5"/>
                <div>
                  <p className="font-bold text-white">Toxic Gases + Corrosives</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Gas cylinders chained in outdoor ventilated cages.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Operations</h3>
            <div className="space-y-3">
              <button 
                onClick={handleExportCSV}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
              >
                <Download size={14}/> Export Full COSHH Audit CSV
              </button>
              <button 
                onClick={() => setIsCOSHHOpen(true)}
                className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-indigo-200 transition cursor-pointer"
              >
                <Info size={14}/> View COSHH Assessment Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: View MSDS */}
      {selectedMSDS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-600">{selectedMSDS.msdsRef}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${getHazardColor(selectedMSDS.hazardClass)}`}>
                    {selectedMSDS.hazardClass}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedMSDS.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedMSDS(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">CAS Number</div>
                  <div className="font-bold text-slate-800">{selectedMSDS.casNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">UN Number</div>
                  <div className="font-bold text-slate-800">{selectedMSDS.unNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Compatibility Group</div>
                  <div className="font-bold text-slate-800">{selectedMSDS.compatibilityGroup}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Current Inventory</div>
                  <div className="font-bold text-slate-800">{selectedMSDS.quantity} {selectedMSDS.unit}</div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-black text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <AlertOctagon size={14} className="text-red-500" />
                  First Aid Emergency Measures
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed bg-red-50/50 p-3 rounded-xl border border-red-100">
                  {selectedMSDS.firstAid || 'Flush affected area with copious water for 15 minutes. In case of inhalation, move to fresh air. Obtain immediate medical assistance.'}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-black text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-indigo-600" />
                  Mandatory PPE Controls
                </h5>
                <div className="flex flex-wrap gap-2">
                  {(selectedMSDS.ppeRequired || ['Safety goggles', 'Nitrile chemical gauntlets', 'Chemical apron']).map((ppe, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold">
                      ✓ {ppe}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-black text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-500" />
                  Fire Fighting Protocol
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                  {selectedMSDS.fireFighting || 'Use foam, carbon dioxide (CO2), or dry chemical. Keep containers cool using water fog spray.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                <span>Storage Location: <strong className="text-slate-800">{selectedMSDS.location}</strong></span>
                <span>Audit Expiry Date: <strong className="text-slate-800">{selectedMSDS.expiryDate}</strong></span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedMSDS(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Chemical */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Plus size={18} className="text-purple-600"/> Add Chemical Substance
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleCreateChemical} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Substance Commercial Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Isopropanol 99.5%"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CAS Registry Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 67-63-0"
                    value={formData.casNumber}
                    onChange={(e) => setFormData({ ...formData, casNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">UN Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. UN 1219"
                    value={formData.unNumber}
                    onChange={(e) => setFormData({ ...formData, unNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hazard Classification *</label>
                  <select 
                    value={formData.hazardClass}
                    onChange={(e) => setFormData({ ...formData, hazardClass: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Flammable">Flammable</option>
                    <option value="Corrosive">Corrosive</option>
                    <option value="Toxic">Toxic</option>
                    <option value="Oxidizer">Oxidizer</option>
                    <option value="Explosive">Explosive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Compatibility Group</label>
                  <select 
                    value={formData.compatibilityGroup}
                    onChange={(e) => setFormData({ ...formData, compatibilityGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Solvents">Solvents</option>
                    <option value="Acids">Acids</option>
                    <option value="Bases">Bases</option>
                    <option value="Gases">Gases</option>
                    <option value="Fuels">Fuels</option>
                    <option value="Oils">Oils</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <select 
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    <option value="L">L</option>
                    <option value="kg">kg</option>
                    <option value="Cylinders">Cylinders</option>
                    <option value="Drums">Drums</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Storage Bunker / Location *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mina Al Fahal Chemical Bunker 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required PPE (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="Nitrile gloves, Safety goggles, Vapor mask"
                  value={formData.ppeRequired}
                  onChange={(e) => setFormData({ ...formData, ppeRequired: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Save Substance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: COSHH Guidelines */}
      {isCOSHHOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Info size={18} className="text-indigo-600"/> Enterprise COSHH Guidelines
              </h3>
              <button onClick={() => setIsCOSHHOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20}/>
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-indigo-900">
                <h4 className="font-black text-sm uppercase mb-1">Oman MoL MD 286/2008 & PDO Specifications Technical Guideline 14</h4>
                <p>All hazardous chemical substances brought to site must have an approved SDS registered within the platform no older than 3 years.</p>
              </div>

              <div>
                <h5 className="font-black text-slate-900 uppercase mb-1">1. Hierarchy of Control in HazMat</h5>
                <ol className="list-decimal list-inside space-y-1">
                  <li><strong>Elimination:</strong> Remove toxic solvents where water-based detergents suffice.</li>
                  <li><strong>Substitution:</strong> Substitute aromatic solvents (Benzene) with safer aliphatic compounds.</li>
                  <li><strong>Engineering Controls:</strong> Fume extraction arms, closed-loop decanting, secondary sumps.</li>
                  <li><strong>Administrative:</strong> Chemical handling licenses, 30-min exposure rotations.</li>
                  <li><strong>PPE:</strong> Level A/B/C certified suits, air purifying respirators, viton gauntlets.</li>
                </ol>
              </div>

              <div>
                <h5 className="font-black text-slate-900 uppercase mb-1">2. Spillage Response Protocol (SWIFT)</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Stop:</strong> Immediately cease pumping / isolate isolation valve.</li>
                  <li><strong>Warn:</strong> Alert personnel in immediate downwind path.</li>
                  <li><strong>Isolate:</strong> Barricade spill perimeter at minimum 15m radius.</li>
                  <li><strong>Fight:</strong> Deploy neutralizer socks, vermiculite, or hydrophobic booms.</li>
                  <li><strong>Transmit:</strong> File environmental event report within 2 hours.</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsCOSHHOpen(false)} 
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChemicalsModule;
