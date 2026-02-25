
import React, { useState } from 'react';
import { LiftPlan } from '../types';
import { useUser } from '../contexts/UserContext';
import { 
  ArrowUp, Anchor, Wind, Calculator, FileCheck, AlertTriangle, 
  CheckCircle2, Ruler, Weight, UserCheck, Shield, AlertCircle
} from 'lucide-react';

const LiftingModule: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'Calculator' | 'Plans'>('Calculator');
  
  // Calculator State
  const [weight, setWeight] = useState(0);
  const [radius, setRadius] = useState(0);
  const [capacity, setCapacity] = useState(0);
  const [utilization, setUtilization] = useState(0);
  
  // Validation State
  const [errors, setErrors] = useState<{ weight?: string; radius?: string; capacity?: string }>({});
  const [touched, setTouched] = useState<{ weight?: boolean; radius?: boolean; capacity?: boolean }>({});

  const [plans, setPlans] = useState<LiftPlan[]>([
      { id: 'LP-101', date: '2024-05-20', location: 'Zone A', loadDescription: 'Generator Set', weightKg: 2500, craneCapacityKg: 5000, radiusMeters: 12, boomLengthMeters: 24, utilizationPercent: 50, category: 'Simple', riggerId: 'u7', approverId: 'u4', status: 'Approved', windLimitSpeed: 10 },
      { id: 'LP-102', date: '2024-05-21', location: 'Site C', loadDescription: 'Steel Beams Bundle', weightKg: 4000, craneCapacityKg: 6000, radiusMeters: 15, boomLengthMeters: 30, utilizationPercent: 66.7, category: 'Simple', riggerId: 'u7', approverId: 'u4', status: 'Approved', windLimitSpeed: 9 },
      { id: 'LP-103', date: '2024-05-22', location: 'Habshan', loadDescription: 'Process Column Section', weightKg: 12000, craneCapacityKg: 15000, radiusMeters: 10, boomLengthMeters: 18, utilizationPercent: 80, category: 'Complex', riggerId: 'u5', approverId: 'u3', status: 'Draft', windLimitSpeed: 8 },
      { id: 'LP-104', date: '2024-05-23', location: 'Zone B', loadDescription: 'Pump Skid', weightKg: 1500, craneCapacityKg: 8000, radiusMeters: 18, boomLengthMeters: 32, utilizationPercent: 18.8, category: 'Simple', riggerId: 'u6', approverId: 'u4', status: 'Approved', windLimitSpeed: 12 },
      { id: 'LP-105', date: '2024-05-24', location: 'Ruwais Port', loadDescription: 'Container Box', weightKg: 3000, craneCapacityKg: 10000, radiusMeters: 20, boomLengthMeters: 40, utilizationPercent: 30, category: 'Simple', riggerId: 'u7', approverId: 'u4', status: 'Approved', windLimitSpeed: 10 },
      { id: 'LP-106', date: '2024-05-25', location: 'Site C', loadDescription: 'HVAC Chiller', weightKg: 3500, craneCapacityKg: 4000, radiusMeters: 22, boomLengthMeters: 45, utilizationPercent: 87.5, category: 'Complex', riggerId: 'u7', approverId: 'Pending', status: 'Draft', windLimitSpeed: 7 },
      { id: 'LP-107', date: '2024-05-26', location: 'Zone A', loadDescription: 'Pipe Spool 24"', weightKg: 800, craneCapacityKg: 5000, radiusMeters: 14, boomLengthMeters: 28, utilizationPercent: 16, category: 'Simple', riggerId: 'u6', approverId: 'u4', status: 'Approved', windLimitSpeed: 10 },
      { id: 'LP-108', date: '2024-05-27', location: 'Habshan', loadDescription: 'Tandem Lift - Vessel', weightKg: 45000, craneCapacityKg: 60000, radiusMeters: 12, boomLengthMeters: 30, utilizationPercent: 75, category: 'Complex', riggerId: 'u5', approverId: 'u2', status: 'Rejected', windLimitSpeed: 6 },
      { id: 'LP-109', date: '2024-05-28', location: 'Zone B', loadDescription: 'Scaffold Bundle', weightKg: 500, craneCapacityKg: 3000, radiusMeters: 8, boomLengthMeters: 15, utilizationPercent: 16.7, category: 'Simple', riggerId: 'u6', approverId: 'u4', status: 'Approved', windLimitSpeed: 12 },
      { id: 'LP-110', date: '2024-05-29', location: 'Ruwais Port', loadDescription: 'Marine Fender', weightKg: 2000, craneCapacityKg: 8000, radiusMeters: 16, boomLengthMeters: 35, utilizationPercent: 25, category: 'Simple', riggerId: 'u7', approverId: 'u4', status: 'Draft', windLimitSpeed: 10 }
  ]);

  const validate = (field: string, value: number) => {
      if (value <= 0) return "Value must be greater than 0";
      return "";
  }

  const handleBlur = (field: string, value: number) => {
      setTouched(prev => ({...prev, [field]: true}));
      setErrors(prev => ({...prev, [field]: validate(field, value)}));
  }

  const handleChange = (field: 'weight' | 'radius' | 'capacity', value: number) => {
      if (field === 'weight') setWeight(value);
      if (field === 'radius') setRadius(value);
      if (field === 'capacity') setCapacity(value);
      
      if (touched[field]) {
          setErrors(prev => ({...prev, [field]: validate(field, value)}));
      }
  }

  const calculateLift = () => {
      const weightErr = validate('weight', weight);
      const radiusErr = validate('radius', radius);
      const capacityErr = validate('capacity', capacity);
      
      setErrors({ weight: weightErr, radius: radiusErr, capacity: capacityErr });
      setTouched({ weight: true, radius: true, capacity: true });

      if (weightErr || radiusErr || capacityErr) return;

      if (capacity > 0) {
          const util = (weight / capacity) * 100;
          setUtilization(parseFloat(util.toFixed(1)));
      }
  };

  const handleSavePlan = () => {
      const newPlan: LiftPlan = {
          id: `LP-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          location: 'Site Location',
          loadDescription: 'New Load',
          weightKg: weight,
          craneCapacityKg: capacity,
          radiusMeters: radius,
          boomLengthMeters: 0,
          utilizationPercent: utilization,
          category: utilization > 80 ? 'Complex' : 'Simple',
          riggerId: currentUser.id,
          approverId: 'Pending',
          status: 'Draft',
          windLimitSpeed: 9.8
      };
      setPlans([newPlan, ...plans]);
      setActiveTab('Plans');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
            <div className="bg-yellow-500 p-4 rounded-2xl text-white shadow-xl shadow-yellow-500/20">
                <ArrowUp size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Lifting Ops</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Load Planning & Stability Analysis</p>
            </div>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('Calculator')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Calculator' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>Plan Calculator</button>
            <button onClick={() => setActiveTab('Plans')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Plans' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>Plan Registry</button>
        </div>
      </div>

      {activeTab === 'Calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2"><Calculator size={20}/> Load Dynamics</h3>
                  <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Load Weight (kg) <span className="text-red-500">*</span></label>
                          <div className="relative">
                              <Weight size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                              <input 
                                  type="number" 
                                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none transition-all ${errors.weight ? 'border-2 border-red-500 focus:ring-red-500 bg-red-50/10' : touched.weight && weight > 0 ? 'border-2 border-emerald-500 focus:ring-emerald-500 bg-emerald-50/5' : 'border-2 border-transparent focus:ring-2 focus:ring-yellow-500'}`}
                                  value={weight} 
                                  onChange={e => handleChange('weight', parseFloat(e.target.value))}
                                  onBlur={() => handleBlur('weight', weight)}
                              />
                          </div>
                          {errors.weight && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.weight}</p>}
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Crane Capacity at Radius (kg) <span className="text-red-500">*</span></label>
                          <div className="relative">
                              <Anchor size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                              <input 
                                  type="number" 
                                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none transition-all ${errors.capacity ? 'border-2 border-red-500 focus:ring-red-500 bg-red-50/10' : touched.capacity && capacity > 0 ? 'border-2 border-emerald-500 focus:ring-emerald-500 bg-emerald-50/5' : 'border-2 border-transparent focus:ring-2 focus:ring-yellow-500'}`}
                                  value={capacity} 
                                  onChange={e => handleChange('capacity', parseFloat(e.target.value))}
                                  onBlur={() => handleBlur('capacity', capacity)}
                              />
                          </div>
                          {errors.capacity && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.capacity}</p>}
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Operating Radius (m) <span className="text-red-500">*</span></label>
                          <div className="relative">
                              <Ruler size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                              <input 
                                  type="number" 
                                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none transition-all ${errors.radius ? 'border-2 border-red-500 focus:ring-red-500 bg-red-50/10' : touched.radius && radius > 0 ? 'border-2 border-emerald-500 focus:ring-emerald-500 bg-emerald-50/5' : 'border-2 border-transparent focus:ring-2 focus:ring-yellow-500'}`}
                                  value={radius} 
                                  onChange={e => handleChange('radius', parseFloat(e.target.value))}
                                  onBlur={() => handleBlur('radius', radius)}
                              />
                          </div>
                          {errors.radius && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.radius}</p>}
                      </div>
                      <button onClick={calculateLift} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-slate-800 transition active:scale-95">Calculate Integrity</button>
                  </div>
              </div>

              <div className="space-y-6">
                  <div className={`p-8 rounded-[2.5rem] shadow-xl border-4 flex flex-col items-center justify-center text-center transition-all duration-500 ${
                      utilization === 0 ? 'bg-slate-50 border-slate-100' :
                      utilization > 85 ? 'bg-red-50 border-red-500 text-red-800' : 
                      utilization > 75 ? 'bg-orange-50 border-orange-400 text-orange-800' : 
                      'bg-emerald-50 border-emerald-500 text-emerald-800'
                  }`}>
                      <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-60">Crane Utilization</p>
                      <div className="text-7xl font-black tracking-tighter mb-4">{utilization}%</div>
                      {utilization > 0 && (
                          <div className="flex items-center gap-2 text-sm font-bold uppercase">
                              {utilization > 85 ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
                              <span>{utilization > 85 ? 'Critical Lift Plan Required' : 'Standard Routine Lift'}</span>
                          </div>
                      )}
                  </div>
                  
                  {utilization > 0 && (
                      <button onClick={handleSavePlan} className="w-full bg-yellow-500 text-white py-5 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-yellow-600 transition active:scale-95 flex items-center justify-center gap-3">
                          <FileCheck size={20}/> Save Lift Plan
                      </button>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'Plans' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2"><FileCheck size={20}/> Plan Registry</h3>
              <div className="space-y-4">
                  {plans.map(plan => (
                      <div key={plan.id} className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 flex justify-between items-center hover:border-yellow-200 transition-all">
                          <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-black text-slate-800 text-sm uppercase">{plan.id}</h4>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                      plan.category === 'Complex' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-200 text-slate-600 border-slate-300'
                                  }`}>{plan.category}</span>
                              </div>
                              <p className="text-xs text-slate-500 font-bold">{plan.loadDescription} • {plan.utilizationPercent}% Util.</p>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wind Limit</p>
                              <p className="text-lg font-black text-slate-800 flex items-center gap-1 justify-end"><Wind size={14} className="text-blue-400"/> {plan.windLimitSpeed} m/s</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default LiftingModule;
