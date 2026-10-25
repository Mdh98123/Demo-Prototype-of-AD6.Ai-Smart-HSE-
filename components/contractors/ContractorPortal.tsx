import React, { useState, useEffect } from 'react';
import { ContractorProfile, ContractorStatus, ContractorRiskEngine, ERPIntegrationService } from '../../services/contractorCore';
import { Shield, ShieldAlert, Award, AlertTriangle, FileText, Upload, CheckCircle, Database, Plus } from 'lucide-react';
import { ContractorOnboarding } from './ContractorOnboarding';

const MOCK_CONTRACTORS: ContractorProfile[] = [
  {
    id: 'C-001',
    companyName: 'Al Jaber Heavy Lifting & Transport W.L.L.',
    registrationNumber: 'CN-1049281',
    contactPerson: { name: 'Eng. Tariq Al-Jaber', email: 'tariq.jaber@aljaber.ae', phone: '+968 2 555 4321' },
    status: 'ACTIVE',
    documents: [
      { id: 'DOC-AJ-01', title: 'Muscat DED Commercial License', filename: 'ded_license_aljaber.pdf', url: '#', version: 2, uploadDate: '2026-01-10', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2027-01-09' },
      { id: 'DOC-AJ-02', title: 'Workmen Compensation & Third Party Liability', filename: 'oman_insurance_aj.pdf', url: '#', version: 1, uploadDate: '2026-02-15', type: 'INSURANCE', status: 'VERIFIED', expiryDate: '2027-02-14' },
      { id: 'DOC-AJ-03', title: 'ISO 45001:2018 Certificate by DNV', filename: 'dnv_iso45001_aj.pdf', url: '#', version: 1, uploadDate: '2025-06-20', type: 'ISO_CERT', status: 'VERIFIED', expiryDate: '2028-06-19' }
    ],
    performance: { incidentCount: 0, inspectionAverage: 96, trainingCompliance: 98 }
  },
  {
    id: 'C-002',
    companyName: 'Target Engineering Construction Co. LLC',
    registrationNumber: 'CN-2083944',
    contactPerson: { name: 'Ziad Mansour', email: 'ziad.m@target.ae', phone: '+968 2 671 2200' },
    status: 'ACTIVE',
    documents: [
      { id: 'DOC-TG-01', title: 'Commercial Registration Certificate', filename: 'cr_target.pdf', url: '#', version: 3, uploadDate: '2026-01-05', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2026-12-31' },
      { id: 'DOC-TG-02', title: 'Contractor All Risks (CAR) Policy', filename: 'car_insurance_target.pdf', url: '#', version: 1, uploadDate: '2026-03-01', type: 'INSURANCE', status: 'VERIFIED', expiryDate: '2027-02-28' },
      { id: 'DOC-TG-03', title: 'ISO 14001:2015 Environmental System', filename: 'iso14001_target.pdf', url: '#', version: 1, uploadDate: '2025-08-14', type: 'ISO_CERT', status: 'VERIFIED', expiryDate: '2027-08-13' }
    ],
    performance: { incidentCount: 1, inspectionAverage: 91, trainingCompliance: 94 }
  },
  {
    id: 'C-003',
    companyName: 'Consolidated Contractors Company (CCC)',
    registrationNumber: 'CN-1829301',
    contactPerson: { name: 'Elias Khoury', email: 'ekhoury@ccc.net', phone: '+968 2 633 4455' },
    status: 'ACTIVE',
    documents: [
      { id: 'DOC-CC-01', title: 'Commercial License Grade Special', filename: 'ccc_trade_license.pdf', url: '#', version: 2, uploadDate: '2025-11-20', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2026-11-19' },
      { id: 'DOC-CC-02', title: 'Comprehensive General Liability $50M', filename: 'ccc_cgl_policy.pdf', url: '#', version: 2, uploadDate: '2026-01-15', type: 'INSURANCE', status: 'VERIFIED', expiryDate: '2027-01-14' },
      { id: 'DOC-CC-03', title: 'ISO 45001 & ISO 9001 Integrated System', filename: 'ccc_integrated_qhse.pdf', url: '#', version: 1, uploadDate: '2025-04-10', type: 'ISO_CERT', status: 'VERIFIED', expiryDate: '2028-04-09' }
    ],
    performance: { incidentCount: 0, inspectionAverage: 95, trainingCompliance: 97 }
  },
  {
    id: 'C-004',
    companyName: 'Dodsal Hydrocarbons & Industrial EPC LLC',
    registrationNumber: 'CN-3948271',
    contactPerson: { name: 'Rajeev Sharma', email: 'rsharma@dodsal.com', phone: '+968 4 332 9988' },
    status: 'PENDING_REVIEW',
    documents: [
      { id: 'DOC-DS-01', title: 'Sohar DED Commercial License', filename: 'dodsal_license.pdf', url: '#', version: 1, uploadDate: '2026-03-10', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2027-03-09' },
      { id: 'DOC-DS-02', title: 'Employer Liability Certificate', filename: 'dodsal_insurance.pdf', url: '#', version: 1, uploadDate: '2026-03-12', type: 'INSURANCE', status: 'PENDING', expiryDate: '2026-09-30' },
      { id: 'DOC-DS-03', title: 'ISO 45001 Surveillance Audit Due', filename: 'dodsal_iso.pdf', url: '#', version: 1, uploadDate: '2026-03-15', type: 'ISO_CERT', status: 'PENDING', expiryDate: '2026-06-30' }
    ],
    performance: { incidentCount: 1, inspectionAverage: 84, trainingCompliance: 88 }
  },
  {
    id: 'C-005',
    companyName: 'Petrofac Facilities Management Middle East',
    registrationNumber: 'CN-9081234',
    contactPerson: { name: 'Kieran Scott', email: 'kieran.scott@petrofac.com', phone: '+968 6 574 3300' },
    status: 'ACTIVE',
    documents: [
      { id: 'DOC-PF-01', title: 'Salalah Chamber & DED License', filename: 'petrofac_license.pdf', url: '#', version: 3, uploadDate: '2026-02-01', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2027-01-31' },
      { id: 'DOC-PF-02', title: 'Marsh Third Party Excess Insurance', filename: 'petrofac_marsh_cov.pdf', url: '#', version: 2, uploadDate: '2026-01-10', type: 'INSURANCE', status: 'VERIFIED', expiryDate: '2027-01-09' },
      { id: 'DOC-PF-03', title: 'Lloyds Register ISO 45001 / 14001', filename: 'lloyds_petrofac.pdf', url: '#', version: 1, uploadDate: '2025-05-18', type: 'ISO_CERT', status: 'VERIFIED', expiryDate: '2028-05-17' }
    ],
    performance: { incidentCount: 0, inspectionAverage: 97, trainingCompliance: 99 }
  },
  {
    id: 'C-006',
    companyName: 'Archirodon Marine Contractors N.V.',
    registrationNumber: 'CN-4728190',
    contactPerson: { name: 'Nikolaos Voulgaris', email: 'nvoulgaris@archirodon.net', phone: '+968 2 644 8822' },
    status: 'ACTIVE',
    documents: [
      { id: 'DOC-AR-01', title: 'Offshore & Marine Operations License', filename: 'archirodon_lic.pdf', url: '#', version: 2, uploadDate: '2026-01-18', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2027-01-17' },
      { id: 'DOC-AR-02', title: 'Marine Hull & Machinery and P&I Club Coverage', filename: 'pandi_marine_cov.pdf', url: '#', version: 1, uploadDate: '2026-02-20', type: 'INSURANCE', status: 'VERIFIED', expiryDate: '2027-02-19' },
      { id: 'DOC-AR-03', title: 'Bureau Veritas Marine HSE Management', filename: 'bv_marine_hse.pdf', url: '#', version: 1, uploadDate: '2025-09-12', type: 'ISO_CERT', status: 'VERIFIED', expiryDate: '2028-09-11' }
    ],
    performance: { incidentCount: 1, inspectionAverage: 92, trainingCompliance: 95 }
  },
  {
    id: 'C-007',
    companyName: 'Six Construct Engineering (BESIX Group)',
    registrationNumber: 'CN-5819203',
    contactPerson: { name: 'Francois Dubois', email: 'fdubois@besix.com', phone: '+968 4 509 2222' },
    status: 'ACTIVE',
    documents: [
      { id: 'DOC-SC-01', title: 'Engineering & General Contracting License', filename: 'sixco_license.pdf', url: '#', version: 2, uploadDate: '2026-01-22', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2027-01-21' },
      { id: 'DOC-SC-02', title: 'Global CAR & Professional Indemnity', filename: 'besix_pi_policy.pdf', url: '#', version: 1, uploadDate: '2026-02-18', type: 'INSURANCE', status: 'VERIFIED', expiryDate: '2027-02-17' },
      { id: 'DOC-SC-03', title: 'ISO 45001 Safety Management Certificate', filename: 'sixco_iso45001.pdf', url: '#', version: 1, uploadDate: '2025-07-30', type: 'ISO_CERT', status: 'VERIFIED', expiryDate: '2028-07-29' }
    ],
    performance: { incidentCount: 0, inspectionAverage: 94, trainingCompliance: 96 }
  },
  {
    id: 'C-008',
    companyName: 'Larsen & Toubro Hydrocarbon Engineering',
    registrationNumber: 'CN-6829104',
    contactPerson: { name: 'Subramanian Natarajan', email: 'snatarajan@lntenc.com', phone: '+968 6 513 1111' },
    status: 'ACTIVE',
    documents: [
      { id: 'DOC-LT-01', title: 'Commercial EPC License', filename: 'lnt_trade_license.pdf', url: '#', version: 3, uploadDate: '2026-02-05', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2027-02-04' },
      { id: 'DOC-LT-02', title: 'Workmen Compensation & Employer Liability', filename: 'lnt_insurance.pdf', url: '#', version: 1, uploadDate: '2026-02-28', type: 'INSURANCE', status: 'VERIFIED', expiryDate: '2027-02-27' },
      { id: 'DOC-LT-03', title: 'DNV ISO 45001 / ISO 14001', filename: 'dnv_lnt_hse.pdf', url: '#', version: 1, uploadDate: '2025-08-10', type: 'ISO_CERT', status: 'VERIFIED', expiryDate: '2028-08-09' }
    ],
    performance: { incidentCount: 0, inspectionAverage: 95, trainingCompliance: 97 }
  },
  {
    id: 'C-009',
    companyName: 'Arabian Rigging & Heavy Scaffolding Services',
    registrationNumber: 'CN-7492810',
    contactPerson: { name: 'Majid Al-Balushi', email: 'majid@arabianrigging.com', phone: '+968 2 550 9988' },
    status: 'SUSPENDED',
    documents: [
      { id: 'DOC-AR-01', title: 'Muscat Municipality Scaffolding Contractor', filename: 'adm_license_ar.pdf', url: '#', version: 1, uploadDate: '2025-10-14', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2026-10-13' },
      { id: 'DOC-AR-02', title: 'Third Party Liability Insurance (Lapsed)', filename: 'ar_insurance_lapsed.pdf', url: '#', version: 1, uploadDate: '2025-03-01', type: 'INSURANCE', status: 'REJECTED', expiryDate: '2026-03-01' },
      { id: 'DOC-AR-03', title: 'LEEA Association Membership Cert', filename: 'leea_ar.pdf', url: '#', version: 1, uploadDate: '2025-06-01', type: 'ISO_CERT', status: 'VERIFIED', expiryDate: '2026-06-01' }
    ],
    performance: { incidentCount: 2, inspectionAverage: 74, trainingCompliance: 82 }
  },
  {
    id: 'C-010',
    companyName: 'Apex Scaffolding Contracting LLC',
    registrationNumber: 'CN-8392019',
    contactPerson: { name: 'M. Rafiq', email: 'rafiq@apexscaff.com', phone: '+968 4 883 4567' },
    status: 'BLACKLISTED',
    documents: [
      { id: 'DOC-AP-01', title: 'Commercial Registration (Suspended)', filename: 'apex_cr.pdf', url: '#', version: 1, uploadDate: '2025-01-01', type: 'TRADE_LICENSE', status: 'REJECTED', expiryDate: '2025-12-31' },
      { id: 'DOC-AP-02', title: 'Insurance Certificate Counterfeit', filename: 'apex_ins_fake.pdf', url: '#', version: 1, uploadDate: '2025-01-01', type: 'INSURANCE', status: 'REJECTED', expiryDate: '2025-06-30' },
      { id: 'DOC-AP-03', title: 'ISO Cert Revoked', filename: 'apex_iso_revoked.pdf', url: '#', version: 1, uploadDate: '2025-01-01', type: 'ISO_CERT', status: 'REJECTED', expiryDate: '2025-01-10' }
    ],
    performance: { incidentCount: 5, inspectionAverage: 58, trainingCompliance: 64 }
  }
];

export const ContractorPortal: React.FC = () => {
  const [contractors, setContractors] = useState<ContractorProfile[]>([]);
  const [selectedContractor, setSelectedContractor] = useState<ContractorProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Calculate risk scores on load
    const processed = MOCK_CONTRACTORS.map(c => {
       const risk = ContractorRiskEngine.calculateRiskScore(c);
       return { ...c, riskScore: risk.score, riskCategory: risk.category };
    });
    setContractors(processed);
  }, []);

  const handleExportERP = () => {
     const sapData = ERPIntegrationService.exportToSAP(contractors);
     const blob = new Blob([sapData], { type: 'text/csv' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `SAP_Contractor_Export_${Date.now()}.csv`;
     a.click();
  };

  const getDayDifference = (expiryIso: string) => {
    const diffTime = Math.abs(new Date(expiryIso).getTime() - new Date().getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const renderStatusBadge = (status: string) => {
     const styles: Record<string, string> = {
       'ACTIVE': 'bg-emerald-100 text-emerald-800 border-emerald-200',
       'PENDING_REVIEW': 'bg-amber-100 text-amber-800 border-amber-200',
       'SUSPENDED': 'bg-red-100 text-red-800 border-red-200',
       'BLACKLISTED': 'bg-slate-800 text-white border-slate-900',
     };
     return <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg border ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="p-6 glass-panel min-h-full font-sans">
      {showOnboarding && (
        <ContractorOnboarding 
          onComplete={() => setShowOnboarding(false)} 
          onCancel={() => setShowOnboarding(false)} 
        />
      )}
      <div className="mb-8 border-b border-slate-200 pb-6 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <Shield className="text-indigo-600" size={32} />
             Contractor Pre-Qualification & Compliance
           </h1>
           <p className="text-slate-500 mt-2 font-medium">Monitor vendor lifecycles, risk scores, and document renewals via automated workflows.</p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExportERP} className="px-4 py-2 glass-card border border-slate-300 text-slate-700 rounded-lg font-bold hover:glass-button transition-colors flex items-center gap-2 text-sm shadow-sm">
             <Database size={16} /> Sync to SAP/Oracle ERP
           </button>
           <button onClick={() => setShowOnboarding(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm shadow-sm">
             <Upload size={16} /> Invite Contractor
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Contractor List */}
        <div className="xl:col-span-2 glass-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="glass-panel p-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
            <span>Vendor Directory</span>
            <div className="flex gap-2">
               <input type="text" placeholder="Search by name, trade license, or ICV..." className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg w-64 focus:outline-none focus:border-indigo-600" />
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
             <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase glass-panel font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Company</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Risk Category</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {contractors.map((vendor) => (
                        <tr key={vendor.id} className="border-b border-slate-100 hover:glass-button cursor-pointer transition-colors" onClick={() => setSelectedContractor(vendor)}>
                            <td className="px-6 py-4">
                               <div className="font-bold text-slate-800">{vendor.companyName}</div>
                               <div className="text-xs text-slate-500 font-mono mt-1">TRN: {vendor.registrationNumber} {vendor.pdoIcvNumber && `• ${vendor.pdoIcvNumber}`}</div>
                            </td>
                            <td className="px-6 py-4">
                               {renderStatusBadge(vendor.status)}
                            </td>
                            <td className="px-6 py-4">
                               <span className={`font-bold flex items-center gap-1 ${
                                  vendor.riskCategory === 'CRITICAL' ? 'text-red-600' :
                                  vendor.riskCategory === 'HIGH' ? 'text-amber-600' :
                                  vendor.riskCategory === 'MEDIUM' ? 'text-blue-600' :
                                  'text-emerald-600'
                               }`}>
                                  {vendor.riskCategory === 'CRITICAL' && <AlertTriangle size={14} />}
                                  {vendor.riskCategory} ({vendor.riskScore}/100)
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button className="text-indigo-600 font-bold hover:underline">View File</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Contractor Details panel */}
        {selectedContractor ? (
           <div className="glass-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
             <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="text-xl font-black text-slate-800">{selectedContractor.companyName}</h3>
                     <p className="text-sm font-mono text-slate-500 mt-1">{selectedContractor.id}</p>
                   </div>
                   {renderStatusBadge(selectedContractor.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                   <div className="glass-panel p-3 rounded-lg border border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact</div>
                      <div className="text-sm font-bold text-slate-800">{selectedContractor.contactPerson.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{selectedContractor.contactPerson.email}</div>
                   </div>
                   <div className="glass-panel p-3 rounded-lg border border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">HSE Audit Score</div>
                      <div className="text-2xl font-black text-indigo-600">{selectedContractor.performance.inspectionAverage}%</div>
                   </div>
                </div>
             </div>

             <div className="p-6 flex-1 overflow-y-auto">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase text-sm">
                  <FileText size={16} className="text-indigo-500" /> Compliance Documents
                </h4>
                
                <div className="space-y-3">
                   {selectedContractor.documents.map(doc => {
                     const daysToExpiry = getDayDifference(doc.expiryDate);
                     const isExpired = new Date(doc.expiryDate).getTime() < new Date().getTime();
                     const isExpiringSoon = !isExpired && daysToExpiry <= 30;

                     return (
                       <div key={doc.id} className={`p-3 rounded-xl border flex items-center justify-between ${isExpired ? 'bg-red-50 border-red-200' : isExpiringSoon ? 'bg-amber-50 border-amber-200' : 'glass-card border-slate-200'}`}>
                          <div>
                            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                               {doc.title}
                               <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">v{doc.version}</span>
                            </div>
                            <div className="text-xs font-medium text-slate-500 mt-1">
                               Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                             {isExpired ? (
                               <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={12}/> EXPIRED</span>
                             ) : isExpiringSoon ? (
                               <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><AlertTriangle size={12}/> in {daysToExpiry} days</span>
                             ) : (
                               <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={12}/> Active</span>
                             )}
                          </div>
                       </div>
                     )
                   })}
                </div>

                {selectedContractor.status === 'PENDING_REVIEW' && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase">Pending Actions</h4>
                    <div className="flex gap-3">
                       <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm shadow-sm transition-colors">Approve Vendor</button>
                       <button className="flex-1 glass-card border border-red-200 hover:bg-red-50 text-red-600 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors">Reject / Request Fix</button>
                    </div>
                  </div>
                )}
             </div>
           </div>
        ) : (
           <div className="glass-card rounded-2xl shadow-sm border border-slate-200 h-[700px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
             <Award size={48} className="mb-4 opacity-50" />
             <h3 className="text-lg font-bold text-slate-600">No Contractor Selected</h3>
             <p className="text-sm mt-2">Select a vendor from the directory to review their pre-qualification status, documents, and dynamic risk scoring.</p>
           </div>
        )}

      </div>
    </div>
  );
};
