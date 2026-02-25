
import React, { useState } from 'react';
import { ChemicalInventory } from '../types';
import { useUser } from '../contexts/UserContext';
import { 
  FlaskConical, AlertTriangle, FileText, Plus, Search, 
  Trash2, AlertOctagon, Download, Info, CheckCircle2 
} from 'lucide-react';

const ChemicalsModule: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'Inventory' | 'MSDS'>('Inventory');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [chemicals, setChemicals] = useState<ChemicalInventory[]>([
    { id: 'CH-001', name: 'Acetone', msdsRef: 'MSDS-ACT-01', location: 'Zone A Store', quantity: 50, unit: 'L', hazardClass: 'Flammable', expiryDate: '2025-10-01', compatibilityGroup: 'Solvents' },
    { id: 'CH-002', name: 'Sulfuric Acid 98%', msdsRef: 'MSDS-SUL-05', location: 'Zone B Acid Cab', quantity: 200, unit: 'L', hazardClass: 'Corrosive', expiryDate: '2024-12-15', compatibilityGroup: 'Acids' },
    { id: 'CH-003', name: 'Oxygen Cylinders', msdsRef: 'MSDS-OXY-02', location: 'Gas Rack 1', quantity: 12, unit: 'Cylinders', hazardClass: 'Oxidizer', expiryDate: '2026-01-01', compatibilityGroup: 'Gases' },
    { id: 'CH-004', name: 'Diesel Fuel', msdsRef: 'MSDS-DSL-88', location: 'Main Tank Farm', quantity: 5000, unit: 'L', hazardClass: 'Flammable', expiryDate: '2025-05-20', compatibilityGroup: 'Fuels' },
    { id: 'CH-005', name: 'Sodium Hypochlorite', msdsRef: 'MSDS-HYP-12', location: 'Water Treatment', quantity: 150, unit: 'L', hazardClass: 'Corrosive', expiryDate: '2024-11-30', compatibilityGroup: 'Bases' },
    { id: 'CH-006', name: 'Acetylene', msdsRef: 'MSDS-ACE-09', location: 'Gas Rack 2', quantity: 8, unit: 'Cylinders', hazardClass: 'Flammable', expiryDate: '2025-08-14', compatibilityGroup: 'Gases' },
    { id: 'CH-007', name: 'Methanol', msdsRef: 'MSDS-METH-03', location: 'Lab Store', quantity: 25, unit: 'L', hazardClass: 'Toxic', expiryDate: '2025-02-10', compatibilityGroup: 'Solvents' },
    { id: 'CH-008', name: 'Caustic Soda Beads', msdsRef: 'MSDS-CS-55', location: 'Warehouse B', quantity: 500, unit: 'kg', hazardClass: 'Corrosive', expiryDate: '2026-06-01', compatibilityGroup: 'Bases' },
    { id: 'CH-009', name: 'Hydraulic Oil ISO 68', msdsRef: 'MSDS-OIL-68', location: 'Maint. Shop', quantity: 205, unit: 'L', hazardClass: 'Flammable', expiryDate: '2027-01-15', compatibilityGroup: 'Oils' },
    { id: 'CH-010', name: 'Chlorine Gas', msdsRef: 'MSDS-CL-99', location: 'Secure Cage C', quantity: 5, unit: 'Cylinders', hazardClass: 'Toxic', expiryDate: '2024-09-30', compatibilityGroup: 'Gases' }
  ]);

  const getHazardColor = (cls: string) => {
      switch(cls) {
          case 'Flammable': return 'bg-red-50 text-red-600 border-red-100';
          case 'Corrosive': return 'bg-slate-100 text-slate-700 border-slate-300';
          case 'Toxic': return 'bg-purple-50 text-purple-700 border-purple-100';
          case 'Oxidizer': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
          default: return 'bg-slate-50 text-slate-500';
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-5">
            <div className="bg-purple-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-purple-500/20">
                <FlaskConical size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">HazMat Control</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-purple-500 pl-4">Chemical Inventory & MSDS Registry</p>
            </div>
          </div>
          <div className="flex gap-4">
              <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 transition">
                  <Plus size={16}/> Add Chemical
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Inventory List</h3>
                      <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                          <input 
                            type="text" 
                            placeholder="Search chemicals..." 
                            className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs font-bold border-none focus:ring-2 focus:ring-purple-500 w-48"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="space-y-4">
                      {chemicals.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(chem => (
                          <div key={chem.id} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-purple-200 transition-all group">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h4 className="font-black text-slate-800 text-base">{chem.name}</h4>
                                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{chem.location} • {chem.quantity} {chem.unit}</p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getHazardColor(chem.hazardClass)}`}>
                                      {chem.hazardClass}
                                  </span>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                  <div className="flex items-center gap-4">
                                      <button className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase hover:underline">
                                          <FileText size={12}/> View MSDS
                                      </button>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Exp: {chem.expiryDate}</span>
                                  </div>
                                  <button className="text-slate-300 hover:text-red-500 transition-colors">
                                      <Trash2 size={16}/>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><AlertOctagon size={120}/></div>
                  <h3 className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-6">Segregation Rules</h3>
                  <div className="space-y-4 relative z-10">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5"/>
                          <div>
                              <p className="text-xs font-bold text-white">Oxidizers + Flammables</p>
                              <p className="text-[10px] text-slate-400 mt-1">Must be separated by 6m or fire-wall.</p>
                          </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                          <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5"/>
                          <div>
                              <p className="text-xs font-bold text-white">Acids + Bases</p>
                              <p className="text-[10px] text-slate-400 mt-1">Store in separate secondary containment.</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                      <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100">
                          <Download size={14}/> Export Inventory
                      </button>
                      <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100">
                          <Info size={14}/> COSHH Guidelines
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ChemicalsModule;
