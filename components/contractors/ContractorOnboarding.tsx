import React, { useState } from 'react';
import { Upload, CheckCircle, ChevronRight, FileCheck, Building2, Fingerprint } from 'lucide-react';

export const ContractorOnboarding: React.FC<{ onComplete: () => void, onCancel: () => void }> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    tradeLicense: '',
    pdoIcv: '',
    contactName: '',
    contactEmail: ''
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center glass-panel">
           <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <Building2 className="text-indigo-600" /> Vendor Pre-Qualification
           </h2>
           <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 text-sm font-bold uppercase">Cancel</button>
        </div>

        <div className="p-6 overflow-y-auto">
           {/* Steps indicator */}
           <div className="flex items-center justify-between mb-8">
             {[1, 2, 3].map(s => (
               <div key={s} className="flex flex-col items-center flex-1">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                   {step > s ? <CheckCircle size={16} /> : s}
                 </div>
                 <span className="text-xs font-bold text-slate-500 mt-2 uppercase text-center">
                    {s === 1 ? 'Profile' : s === 2 ? 'Documents' : 'Review'}
                 </span>
               </div>
             ))}
           </div>

           {step === 1 && (
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Company Name</label>
                     <input type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} className="w-full border-2 border-slate-200 rounded-lg p-2 focus:border-indigo-600 focus:outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-600 mb-1 uppercase flex items-center gap-1">
                       <Fingerprint size={12} className="text-indigo-600" /> Trade License (TRN)
                     </label>
                     <input type="text" value={formData.tradeLicense} onChange={e => setFormData({ ...formData, tradeLicense: e.target.value })} className="w-full border-2 border-slate-200 rounded-lg p-2 focus:border-indigo-600 focus:outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">PDO ICV No. (Optional)</label>
                     <input type="text" value={formData.pdoIcv} onChange={e => setFormData({ ...formData, pdoIcv: e.target.value })} className="w-full border-2 border-slate-200 rounded-lg p-2 focus:border-indigo-600 focus:outline-none" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                   <div>
                     <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Contact Name</label>
                     <input type="text" value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} className="w-full border-2 border-slate-200 rounded-lg p-2 focus:border-indigo-600 focus:outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Contact Email</label>
                     <input type="email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full border-2 border-slate-200 rounded-lg p-2 focus:border-indigo-600 focus:outline-none" />
                   </div>
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 glass-panel hover:bg-slate-100 transition-colors cursor-pointer">
                   <Upload size={32} className="mb-2 text-indigo-500" />
                   <p className="font-bold text-sm">Upload Trade License</p>
                   <p className="text-xs">PDF or Image up to 5MB</p>
                </div>
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 glass-panel hover:bg-slate-100 transition-colors cursor-pointer">
                   <Upload size={32} className="mb-2 text-indigo-500" />
                   <p className="font-bold text-sm">Upload Oman MoL MD 286/2008 / ISO 45001 Certificate</p>
                   <p className="text-xs">Required for High Risk vendors</p>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-4 text-center">
                <FileCheck size={48} className="mx-auto text-emerald-500 mb-4" />
                <h3 className="text-lg font-black text-slate-800">Ready to Submit</h3>
                <p className="text-sm text-slate-500">Your profile and documents will be sent to the HSE team for review. This typically takes 2-3 business days.</p>
                <div className="glass-panel p-4 rounded-lg mt-4 text-left border border-slate-200">
                    <div className="text-xs font-bold text-slate-600 uppercase mb-2">Automated Checks Passed:</div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Trade License format valid</li>
                      <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Oman Ministry of Labour Integration (Stub) reachable</li>
                    </ul>
                </div>
             </div>
           )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 glass-panel">
           {step > 1 && (
             <button onClick={() => setStep(step - 1)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm">Back</button>
           )}
           {step < 3 ? (
             <button onClick={() => setStep(step + 1)} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2">Next <ChevronRight size={16} /></button>
           ) : (
             <button onClick={onComplete} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors text-sm flex items-center gap-2"><CheckCircle size={16} /> Submit Pre-Qualification</button>
           )}
        </div>
      </div>
    </div>
  );
};
