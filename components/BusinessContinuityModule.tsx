import React, { useState } from 'react';
import { 
  ShieldCheck, Activity, FileText, AlertTriangle, CheckCircle, 
  RefreshCcw, Calendar, Users, Plus, X, Eye, Clock, ShieldAlert 
} from 'lucide-react';

interface BCPlan {
  id: string;
  name: string;
  department: string;
  status: 'Active' | 'Under Review' | 'Expired';
  lastUpdated: string;
  nextReview: string;
  owner: string;
  rtoHours: number; // Recovery Time Objective
  rpoHours: number; // Recovery Point Objective
  scope: string;
  drillFrequency: string;
}

const INITIAL_PLANS: BCPlan[] = [
  { id: 'BCP-001', name: 'Enterprise Cloud SCADA & IT Disaster Recovery', department: 'IT & OT Systems', status: 'Active', lastUpdated: '2026-01-15', nextReview: '2027-01-15', owner: 'Rashid Al-Kaabi', rtoHours: 2, rpoHours: 0.5, scope: 'Multi-region failover between Abu Dhabi and Dubai datacenter rings', drillFrequency: 'Bi-annual' },
  { id: 'BCP-002', name: 'Ruwais Refinery Emergency Flaring & Black Start Shutdown', department: 'Operations', status: 'Active', lastUpdated: '2026-03-20', nextReview: '2026-09-20', owner: 'Tariq Al-Hashemi', rtoHours: 12, rpoHours: 0, scope: 'Orderly hydrocarbon inventory depurging and inert gas sweep to zero pressure', drillFrequency: 'Annual' },
  { id: 'BCP-003', name: 'Supply Chain Maritime Port Redundancy & Catalyst Sourcing', department: 'Procurement', status: 'Active', lastUpdated: '2026-02-10', nextReview: '2027-02-10', owner: 'Amina Al-Mansouri', rtoHours: 48, rpoHours: 24, scope: 'Pre-qualified backup chemical catalysts stored at Jebel Ali Hub for Ruwais berths', drillFrequency: 'Annual' },
  { id: 'BCP-004', name: 'GCC Summer Heat Stress Operational Interruption Protocol', department: 'HSE Governance', status: 'Active', lastUpdated: '2026-04-01', nextReview: '2026-10-01', owner: 'Dr. Sarah Jenkins', rtoHours: 4, rpoHours: 1, scope: 'Dynamic shift splitting (night windows) when WBGT exceeds 32°C threshold', drillFrequency: 'Seasonal' },
  { id: 'BCP-005', name: 'Habshan High Pressure Sour Gas Wellhead Isolation Plan', department: 'Process Safety', status: 'Under Review', lastUpdated: '2025-11-15', nextReview: '2026-05-15', owner: 'Khalfan Al-Zaabi', rtoHours: 1, rpoHours: 0, scope: 'Subsurface safety valve (SSSV) closure and mutual aid toxic plume perimeter barricade', drillFrequency: 'Quarterly' },
  { id: 'BCP-006', name: 'Main Power Grid Tripping & Substation 33kV Islanding', department: 'Electrical', status: 'Active', lastUpdated: '2026-02-28', nextReview: '2027-02-28', owner: 'Hassan Mahmoud', rtoHours: 0.5, rpoHours: 0, scope: 'Black-start emergency diesel turbine auto-synchronization for critical life safety buses', drillFrequency: 'Bi-annual' },
  { id: 'BCP-007', name: 'Ras Al Khair Maritime Yard Tsunami & Storm Surge Plan', department: 'Marine Safety', status: 'Active', lastUpdated: '2026-01-08', nextReview: '2027-01-08', owner: 'Hamad Al-Dosari', rtoHours: 6, rpoHours: 2, scope: 'Emergency de-ballasting and drydock caisson lock-down during Persian Gulf storm squalls', drillFrequency: 'Annual' },
  { id: 'BCP-008', name: 'Civil Defence Major Chemical Spillage Mutual Aid Protocol', department: 'HSE Operations', status: 'Under Review', lastUpdated: '2025-12-10', nextReview: '2026-06-10', owner: 'Zainab Al-Mutawa', rtoHours: 3, rpoHours: 1, scope: 'Joint rapid response staging with Abu Dhabi Civil Defence and Environmental Agency', drillFrequency: 'Bi-annual' },
  { id: 'BCP-009', name: 'Subsea Fiber Cable Rupture & Telemetry Loss Contingency', department: 'Automation', status: 'Active', lastUpdated: '2026-03-05', nextReview: '2027-03-05', owner: 'Sultan Al-Ghafri', rtoHours: 4, rpoHours: 1, scope: 'Satellite low-earth-orbit (LEO) telemetry auto-switchover for Fahud well clusters', drillFrequency: 'Annual' },
  { id: 'BCP-010', name: 'Pandemic & Infectious Outbreak Camp Quarantine Protocol', department: 'Occupational Health', status: 'Active', lastUpdated: '2026-02-18', nextReview: '2027-02-18', owner: 'Dr. Layla Hassan', rtoHours: 24, rpoHours: 12, scope: 'Isolated residential quarters with negative-pressure medical clinic at Camp A', drillFrequency: 'Bi-annual' }
];

export const BusinessContinuityModule: React.FC = () => {
  const [plans, setPlans] = useState<BCPlan[]>(() => {
    const saved = localStorage.getItem('hse_bcp_plans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PLANS;
      }
    }
    return INITIAL_PLANS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BCPlan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    department: 'Operations',
    owner: 'Tariq Al-Hashemi',
    rtoHours: 4,
    rpoHours: 1,
    scope: '',
    drillFrequency: 'Annual',
    status: 'Active' as BCPlan['status']
  });

  const savePlans = (updated: BCPlan[]) => {
    setPlans(updated);
    localStorage.setItem('hse_bcp_plans', JSON.stringify(updated));
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `BCP-${String(plans.length + 1).padStart(3, '0')}`;
    const newPlan: BCPlan = {
      id: newId,
      name: formData.name,
      department: formData.department,
      status: formData.status,
      lastUpdated: new Date().toISOString().split('T')[0],
      nextReview: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      owner: formData.owner,
      rtoHours: Number(formData.rtoHours),
      rpoHours: Number(formData.rpoHours),
      scope: formData.scope,
      drillFrequency: formData.drillFrequency
    };

    savePlans([newPlan, ...plans]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      department: 'Operations',
      owner: 'Tariq Al-Hashemi',
      rtoHours: 4,
      rpoHours: 1,
      scope: '',
      drillFrequency: 'Annual',
      status: 'Active'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-x-5">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Business Continuity & Crisis Management</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              ISO 22301 Aligned Operational Resilience ({plans.length} Enterprise Plans)
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all shadow-md cursor-pointer"
        >
          <Plus size={16} /> New Continuity Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><CheckCircle size={24} /></div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Plans</p>
              <p className="text-3xl font-black text-slate-800">{plans.filter(p => p.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><RefreshCcw size={24} /></div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Under Review</p>
              <p className="text-3xl font-black text-slate-800">{plans.filter(p => p.status === 'Under Review').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Clock size={24} /></div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg Recovery RTO</p>
              <p className="text-3xl font-black text-slate-800">
                {Math.round(plans.reduce((acc, p) => acc + (p.rtoHours || 4), 0) / plans.length)} hrs
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Enterprise Continuity Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Plan ID & Name</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Department</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Target RTO / RPO</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Plan Owner</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Next Review</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400 shrink-0" />
                      <div>
                        <div>{p.name}</div>
                        <span className="text-[10px] font-mono text-indigo-600 font-normal">{p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-600 text-xs">{p.department}</td>
                  <td className="p-4 text-xs font-mono">
                    <span className="text-slate-800 font-bold">{p.rtoHours}h RTO</span>
                    <span className="text-slate-400"> / {p.rpoHours}h RPO</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-600 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-slate-400" /> {p.owner}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800 text-xs">
                    <span className={new Date(p.nextReview) < new Date() ? 'text-red-600' : 'text-slate-600'}>
                      {p.nextReview}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'Under Review' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedPlan(p)}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-wider cursor-pointer px-2.5 py-1 rounded hover:bg-indigo-50"
                    >
                      <Eye size={13} /> View Plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Plan Details */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600">{selectedPlan.id}</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedPlan.name}</h3>
              </div>
              <button onClick={() => setSelectedPlan(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Department:</span>
                  <span className="text-slate-800 font-bold">{selectedPlan.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Plan Owner:</span>
                  <span className="text-slate-800 font-bold">{selectedPlan.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Recovery Time Objective (RTO):</span>
                  <span className="text-indigo-600 font-black">{selectedPlan.rtoHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Recovery Point Objective (RPO):</span>
                  <span className="text-indigo-600 font-black">{selectedPlan.rpoHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Mandatory Drill Frequency:</span>
                  <span className="text-slate-800 font-bold">{selectedPlan.drillFrequency}</span>
                </div>
              </div>

              <div>
                <h5 className="font-black text-slate-700 uppercase mb-1">Operational Scope & Activation Criteria</h5>
                <p className="text-slate-600 leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  {selectedPlan.scope}
                </p>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Last Reviewed: {selectedPlan.lastUpdated}</span>
                <span>Next Statutory Review: {selectedPlan.nextReview}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" /> New Business Continuity Plan
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Critical Nitrogen Vapor Supply Interruption Plan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <select 
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Operations">Operations</option>
                    <option value="HSE Governance">HSE Governance</option>
                    <option value="IT & OT Systems">IT & OT Systems</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan Owner *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target RTO (Hours) *</label>
                  <input 
                    type="number" 
                    min="0.5" 
                    step="0.5"
                    value={formData.rtoHours}
                    onChange={(e) => setFormData({ ...formData, rtoHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target RPO (Hours) *</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.5"
                    value={formData.rpoHours}
                    onChange={(e) => setFormData({ ...formData, rpoHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Scope & Trigger Criteria</label>
                <textarea 
                  rows={2}
                  placeholder="Detail primary site, secondary site, standby generators, and escalation procedures..."
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 cursor-pointer shadow-md"
                >
                  Save Continuity Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessContinuityModule;
