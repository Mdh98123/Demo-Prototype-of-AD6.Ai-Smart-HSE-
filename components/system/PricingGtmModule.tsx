import React, { useState, useEffect } from 'react';
import { AnalyticsTracking } from '../../services/AnalyticsTracking';
import { ProcurementExport } from '../../services/ProcurementExport';
import { CheckCircle, ShieldCheck, Download, Calculator, BarChart3, TrendingDown, ArrowRight, FileText } from 'lucide-react';

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    priceAed: 0,
    priceUsd: 0,
    priceSar: 0,
    description: 'Basic HSE incident logging and compliance management.',
    features: [
      { name: 'Incident Logging', isIncluded: true },
      { name: 'Basic Reporting', isIncluded: true },
      { name: 'Predictive AI Risk', isIncluded: false },
      { name: 'Contractor Portal', isIncluded: false },
      { name: 'Dedicated Account Manager', isIncluded: false }
    ]
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    priceAed: 45,
    priceUsd: 12,
    priceSar: 46,
    description: 'Advanced analytics and workflows for mid-sized teams.',
    features: [
      { name: 'Incident Logging', isIncluded: true },
      { name: 'Advanced BI Dashboards', isIncluded: true },
      { name: 'Contractor Portal', isIncluded: true },
      { name: 'Predictive AI Risk', isIncluded: true },
      { name: 'Executive AI Co-pilot', isIncluded: false }
    ]
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    priceAed: null, // Custom
    priceUsd: null,
    priceSar: null,
    description: 'Full GCC compliance suite with on-prem options.',
    features: [
      { name: 'Unlimited Contractors', isIncluded: true },
      { name: 'Executive AI Co-pilot', isIncluded: true },
      { name: 'ERP Integration (SAP/Oracle)', isIncluded: true },
      { name: 'White-labeling', isIncluded: true },
      { name: 'Dedicated Account Manager', isIncluded: true }
    ]
  }
];

export const PricingGtmModule: React.FC = () => {
  const [currency, setCurrency] = useState<'AED' | 'SAR' | 'USD'>('AED');
  const [prepHours, setPrepHours] = useState<number>(40);
  const [incidentCost, setIncidentCost] = useState<number>(50000);

  useEffect(() => {
    AnalyticsTracking.trackFunnelStep('Pricing_View', { currency });
  }, [currency]);

  const handleRequestQuote = () => {
    AnalyticsTracking.trackFunnelStep('Enterprise_Quote_Requested', { estimatedPrepHours: prepHours });
    alert('Quote request sent to sales team.');
  };

  const getPrice = (plan: typeof PLANS[0]) => {
    if (plan.priceAed === null) return 'Custom Pricing';
    if (currency === 'AED') return `AED ${plan.priceAed} /mo`;
    if (currency === 'SAR') return `SAR ${plan.priceSar} /mo`;
    return `$ ${plan.priceUsd} /mo`;
  };

  const roiSavings = Math.round((prepHours * 150 * 12 * 0.4) + (incidentCost * 2)); // Mock formula for ROI

  return (
    <div className="min-h-full glass-panel font-sans p-6 overflow-y-auto">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Scale Your Safety Intelligence</h1>
        <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Choose the right tier for your enterprise. Deployed via Azure UAE for full PDPL compliance.</p>
        
        <div className="mt-8 inline-flex glass-card rounded-xl shadow-sm border border-slate-200 p-1">
           {['AED', 'SAR', 'USD'].map(cur => (
             <button 
                key={cur}
                onClick={() => setCurrency(cur as any)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currency === cur ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
             >
               {cur}
             </button>
           ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
         {PLANS.map((plan, idx) => (
           <div key={plan.id} className={`glass-card rounded-3xl p-8 border ${plan.id === 'PROFESSIONAL' ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 relative transform scale-105' : 'border-slate-200 shadow-sm'}`}>
              {plan.id === 'PROFESSIONAL' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-black text-slate-800">{plan.name}</h3>
              <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{plan.description}</p>
              <div className="my-6">
                 <span className="text-4xl font-black text-slate-900">{getPrice(plan)}</span>
                 {plan.priceAed !== null && <span className="text-sm font-bold text-slate-400"> / user</span>}
              </div>
              <ul className="space-y-4 mb-8">
                 {plan.features.map((f, i) => (
                   <li key={i} className="flex items-center gap-3">
                      {f.isIncluded ? (
                        <CheckCircle size={20} className="text-indigo-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                          <div className="w-1.5 h-px bg-slate-300"></div>
                        </div>
                      )}
                      <span className={`text-sm font-bold ${f.isIncluded ? 'text-slate-700' : 'text-slate-400'}`}>{f.name}</span>
                   </li>
                 ))}
              </ul>
              <button 
                onClick={plan.id === 'ENTERPRISE' ? handleRequestQuote : undefined}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
                  plan.id === 'PROFESSIONAL' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg' :
                  plan.id === 'ENTERPRISE' ? 'bg-slate-900 text-white hover:bg-slate-800' :
                  'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {plan.id === 'ENTERPRISE' ? 'Request Quote' : 'Start Free Trial'}
              </button>
           </div>
         ))}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ROI Calculator */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
             <Calculator className="text-indigo-600" /> GCC ROI Calculator
           </h3>
           <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>Audit Prep Hours (Per Month)</span>
                  <span className="text-indigo-600">{prepHours} hrs</span>
                </label>
                <input type="range" min="10" max="200" value={prepHours} onChange={e => setPrepHours(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>Avg Cost per HSE Incident Drop (AED)</span>
                  <span className="text-indigo-600">AED {incidentCost.toLocaleString()}</span>
                </label>
                <input type="range" min="10000" max="500000" step="5000" value={incidentCost} onChange={e => setIncidentCost(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>

              <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                 <p className="text-emerald-800 font-bold text-sm uppercase tracking-wider">Estimated Annual Savings</p>
                 <p className="text-4xl font-black text-emerald-600 mt-2">AED {roiSavings.toLocaleString()}</p>
                 <p className="text-xs text-emerald-600/70 mt-2">*Based on 40% reduction in admin tasks and avoiding 2 incidents annually.</p>
              </div>
           </div>
        </div>

        {/* Procurement Hub */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white">
           <h3 className="text-xl font-black flex items-center gap-2 mb-6">
             <ShieldCheck className="text-indigo-400" /> Enterprise Procurement Hub
           </h3>
           <p className="text-slate-400 text-sm mb-8">Download security credentials, vendor questionnaires, and tender templates required for GCC vendor onboarding.</p>
           
           <div className="space-y-4">
              <button 
                onClick={() => ProcurementExport.generateSecurityStatement()}
                className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-700 transition-colors group"
              >
                 <div className="flex items-center gap-3">
                   <div className="bg-slate-700 p-2 rounded-lg text-slate-300 group-hover:text-white"><FileText size={20} /></div>
                   <div className="text-left">
                      <div className="font-bold text-sm">Security & Compliance</div>
                      <div className="text-xs text-slate-400 mt-1">SOC 2, ISO 27001, UAE PDPL</div>
                   </div>
                 </div>
                 <Download size={20} className="text-slate-500 group-hover:text-indigo-400" />
              </button>

              <button 
                onClick={() => ProcurementExport.generateTenderTemplate()}
                className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-700 transition-colors group"
              >
                 <div className="flex items-center gap-3">
                   <div className="bg-slate-700 p-2 rounded-lg text-slate-300 group-hover:text-white"><FileText size={20} /></div>
                   <div className="text-left">
                      <div className="font-bold text-sm">RFP Response Template</div>
                      <div className="text-xs text-slate-400 mt-1">Pre-filled GCC tech evaluations</div>
                   </div>
                 </div>
                 <Download size={20} className="text-slate-500 group-hover:text-indigo-400" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
