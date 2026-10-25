import React, { useState } from 'react';
import { 
  Settings, Map, FileSignature, Database, FileText, CheckCircle, 
  AlertOctagon, Globe, Scale, Shield, History, Clock, ChevronDown, Check, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { DataResidency, PDPLCompliance } from '../../services/securityCompliance';
import { useRegionalCompliance } from '../../contexts/RegionalComplianceContext';
import { useUser } from '../../contexts/UserContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { RegionalComplianceMode, RegionalComplianceService, Jurisdiction, regionalComplianceService } from '../../services/regionalComplianceService';

export const GovernanceModule: React.FC = () => {
  const { 
    regionalMode, 
    isUaeMode, 
    isOmanMode, 
    isCombinedMode, 
    activeProfile, 
    openChangeModal, 
    auditHistory 
  } = useRegionalCompliance();
  const { currentUser, isDemoMode } = useUser();
  const { t } = useLanguage();
  const { clientConfigured, settingEnabled, serverStatus, setWorkflowEnabled } = useWorkflow();

  const [region, setRegion] = useState(DataResidency.getRegion());
  const [dsarEmail, setDsarEmail] = useState('');
  const [dsarStatus, setDsarStatus] = useState('');
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<RegionalComplianceMode>(regionalMode);

  React.useEffect(() => {
    setSelectedCandidate(regionalMode);
  }, [regionalMode]);

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleRegionChange = (newRegion: 'UAE' | 'GLOBAL') => {
    DataResidency.setRegion(newRegion);
    setRegion(newRegion);
  };

  const handleDSARDataReturn = () => {
    if (!dsarEmail) return;
    setDsarStatus('Gathering data across all linked tables...');
    setTimeout(() => {
       const data = PDPLCompliance.exportUserData(dsarEmail);
       
       const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(data);
       const downloadAnchorNode = document.createElement('a');
       downloadAnchorNode.setAttribute("href", dataStr);
       downloadAnchorNode.setAttribute("download", `DSAR_Export_${dsarEmail}.json`);
       document.body.appendChild(downloadAnchorNode);
       downloadAnchorNode.click();
       downloadAnchorNode.remove();
       
       setDsarStatus('Export Complete: Machine-readable JSON delivered within 72hr SLA requirement limits.');
    }, 1500);
  };

  return (
    <div className="p-6 glass-panel min-h-full font-sans space-y-8">
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
               Administrative Control
             </span>
             <span className="text-xs font-mono text-slate-500">
               Active: {activeProfile.flag} {activeProfile.label}
             </span>
           </div>
           <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <Settings className="text-indigo-600" size={32} />
             Enterprise Governance & Compliance
           </h1>
           <p className="text-slate-500 mt-2 font-medium">
             Regional Jurisdictional Frameworks, PDPL Data Privacy, Multi-Site Residency, and Statutory Assurances.
           </p>
        </div>
      </div>

      {isDemoMode && clientConfigured && (
        <section className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">{t('workflow.settings')}</h2>
            <p className="mt-1 text-xs text-slate-600">{t('workflow.demoOnly')}</p>
            {serverStatus === 'disabled' && <p className="mt-1 text-xs font-semibold text-amber-700">{t('workflow.serverDisabled')}</p>}
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={settingEnabled}
              onChange={event => setWorkflowEnabled(event.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
            {t('workflow.enabled')}
          </label>
        </section>
      )}

      {/* PRIMARY ADMINISTRATIVE SECTION: REGIONAL COMPLIANCE CONFIGURATION */}
      <div className="glass-card rounded-2xl shadow-sm border border-slate-300/80 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white">
        <div className="p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <Globe size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  System Administrator Settings
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {isAdmin ? 'ADMIN AUTHORIZED' : 'READ-ONLY ACCESS'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Regional Compliance Configuration
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuditHistory(!showAuditHistory)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <History size={14} className="text-blue-400" />
              <span>{showAuditHistory ? 'Hide Change Audit Log' : 'View Audit Trail'} ({auditHistory.length})</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            This administrative configuration sets the legal and regulatory framework governing the entire platform.
            It defines statutory notification deadlines (OSHAD vs Oman MoL), high-temperature work-stoppage rules
            (MoHRE midday break vs PDO SP-1170 TWL), electronic Permit to Work isolation criteria, and jurisdiction-isolated compliance scorecards.
          </p>

          {/* Configuration Dropdown Selector */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="gov-regional-compliance-dropdown" className="text-xs font-black uppercase tracking-wider text-slate-200 block">
                Regional Compliance Configuration
              </label>
              {!isAdmin && (
                <span className="text-[11px] text-amber-300 flex items-center gap-1">
                  <Shield size={13} /> Only authorized System Administrators can modify this setting
                </span>
              )}
            </div>

            <div className="relative">
              <select
                id="gov-regional-compliance-dropdown"
                disabled={!isAdmin}
                value={selectedCandidate}
                onChange={(e) => {
                  const target = e.target.value as RegionalComplianceMode;
                  setSelectedCandidate(target);
                  if (target !== regionalMode) {
                    openChangeModal(target);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer appearance-none"
              >
                <option value="UAE">United Arab Emirates (UAE)</option>
                <option value="OMAN">Sultanate of Oman (Oman)</option>
                <option value="COMBINED">UAE + Oman (Combined Compliance)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>

            {/* Interactive Jurisdiction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {[
                { 
                  id: 'UAE' as const, 
                  title: 'United Arab Emirates (UAE)', 
                  flag: '🇦🇪', 
                  law: 'OSHAD-SF v3.1 & MoHRE', 
                  desc: 'Form G 24h notice to ADPHC, WBGT ≥ 32.2°C work-stoppage', 
                  badge: 'OSHAD / ADNOC' 
                },
                { 
                  id: 'OMAN' as const, 
                  title: 'Sultanate of Oman', 
                  flag: '🇴🇲', 
                  law: 'RD 53/2023 & MD 286/2008', 
                  desc: 'MoL 24h Notification, PDO TWL < 115 W/m² stop work', 
                  badge: 'MoL / PDO SP-1170' 
                },
                { 
                  id: 'COMBINED' as const, 
                  title: 'UAE + Oman Combined', 
                  flag: '🇦🇪🇴🇲', 
                  law: 'Dual-Jurisdiction Engine', 
                  desc: 'Cross-border multi-tenant compliance across all GCC sites', 
                  badge: 'Multi-Tenant Dual' 
                }
              ].map((opt) => {
                const isSelected = selectedCandidate === opt.id;
                const isCurrentActive = regionalMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => {
                      setSelectedCandidate(opt.id);
                      if (opt.id !== regionalMode) {
                        openChangeModal(opt.id);
                      }
                    }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-900/40 border-blue-500 shadow-md ring-1 ring-blue-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{opt.flag}</span>
                        <span className="font-bold text-xs text-white">{opt.title}</span>
                      </div>
                      {isCurrentActive && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono font-bold text-blue-300">{opt.law}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Pending Change Bar with explicit Save Action */}
            {selectedCandidate !== regionalMode && (
              <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-500/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="text-xs text-blue-200">
                  <span className="font-bold text-white">Pending Configuration: </span>
                  Switching active jurisdiction from <strong>{regionalMode}</strong> to <strong>{selectedCandidate}</strong>.
                  <span className="text-blue-300 block text-[11px] mt-0.5">
                    Click 'Save Regional Compliance Configuration' to review impacts and confirm.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(regionalMode)}
                    className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => openChangeModal(selectedCandidate)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-1.5 transition-all"
                  >
                    <ShieldAlert size={14} />
                    <span>Save Regional Compliance Configuration</span>
                  </button>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              Current Mode: <strong className="text-white">{activeProfile.label}</strong> ({activeProfile.description})
            </p>
          </div>

          {/* Active Jurisdiction Regulatory Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Applicable Legislation</span>
              <p className="text-xs font-bold text-white line-clamp-2">
                {activeProfile.primaryLegislation.map(l => l.code).join(' • ')}
              </p>
              <p className="text-[11px] text-slate-400">
                {activeProfile.governingFrameworks.join(' • ')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Statutory Authorities</span>
              <p className="text-xs font-bold text-white line-clamp-2">
                {activeProfile.authorities.map(a => a.shortName || a.name).join(', ')}
              </p>
              <p className="text-[11px] text-slate-400">Direct portal reporting & audit oversight</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Heat Stress Regime</span>
              <p className="text-xs font-bold text-white">{activeProfile.heatStressRule.legalBasis}</p>
              <p className="text-[11px] text-slate-400">
                {activeProfile.heatStressRule.prohibitedHours} ({activeProfile.heatStressRule.monthsApplicable})
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Statutory Incident SLA</span>
              <p className="text-xs font-bold text-white">
                {activeProfile.incidentNotificationRule.immediateNotificationWindow} Notice
              </p>
              <p className="text-[11px] text-slate-400">{activeProfile.incidentNotificationRule.enforcingAuthority}</p>
            </div>
          </div>

          {/* Immutable Audit Trail Section (Expands if toggled) */}
          {showAuditHistory && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <History size={14} className="text-blue-400" />
                  Regional Compliance Configuration Change History (Immutable Ledger)
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  ISO 27001 / SOC 2 Type II Compliant
                </span>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Timestamp (UTC)</th>
                      <th className="px-4 py-2.5">Changed By</th>
                      <th className="px-4 py-2.5">Role</th>
                      <th className="px-4 py-2.5">Transition</th>
                      <th className="px-4 py-2.5">Reason / Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                    {auditHistory.map(item => (
                      <tr key={item.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-white">{item.actorName}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/60 text-blue-200 border border-blue-700/50">
                            {item.actorRole}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] whitespace-nowrap">
                          <span className="text-slate-400">{item.previousMode}</span>
                          <span className="mx-1.5 text-blue-400 font-bold">→</span>
                          <span className="text-emerald-400 font-bold">{item.newMode}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300 max-w-xs truncate" title={item.reason}>
                          {item.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Compliance Documentation Engine */}
         <div className="glass-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 glass-panel flex justify-between items-center">
               <h2 className="font-black text-slate-800 flex items-center gap-2">
                 <FileSignature className="text-indigo-500" size={18} /> Documentation Hub
               </h2>
            </div>
            <div className="p-6 space-y-4">
               <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText size={24} />
                     </div>
                     <div>
                        <div className="font-bold text-slate-800">SOC2 Type II Readiness Report</div>
                        <div className="text-xs text-slate-500">Auto-generates from existing RBAC and Immutable Ledger states.</div>
                     </div>
                  </div>
                  <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">Generate PDF</button>
               </div>

               <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText size={24} />
                     </div>
                     <div>
                        <div className="font-bold text-slate-800">ISO27001 Statement of Applicability</div>
                        <div className="text-xs text-slate-500">Filled template (Annex A Controls) mapping existing platform gates.</div>
                     </div>
                  </div>
                  <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">Generate PDF</button>
               </div>

               <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText size={24} />
                     </div>
                     <div>
                        <div className="font-bold text-slate-800">UAE PDPL - Data Processing Agreement</div>
                        <div className="text-xs text-slate-500">Standard DPA configured specifically under UAE Federal Decree Law No. 45 of 2021.</div>
                     </div>
                  </div>
                  <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">Generate PDF</button>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            {/* Data Residency Toggle */}
            <div className="glass-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 glass-panel flex justify-between items-center">
                  <h2 className="font-black text-slate-800 flex items-center gap-2">
                    <Map className="text-emerald-500" size={18} /> Infrastructure Boundary
                  </h2>
               </div>
               <div className="p-6">
                  <p className="text-sm font-medium text-slate-600 mb-6 flex items-start gap-3">
                     <Database className="shrink-0 text-slate-400 mt-1" size={16} /> 
                     Data Residency determines where physical compute and database clusters are instantiated.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => handleRegionChange('UAE')}
                       className={`p-4 rounded-xl border-2 text-left transition-all ${region === 'UAE' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
                     >
                        <div className="flex justify-between mb-2">
                           <span className="font-black text-slate-800">🇦🇪 Middle East</span>
                           {region === 'UAE' && <CheckCircle className="text-emerald-500" size={18} />}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">UAE North (Dubai). Full compliance with NESA/SIA frameworks.</div>
                     </button>

                     <button 
                       onClick={() => handleRegionChange('GLOBAL')}
                       className={`p-4 rounded-xl border-2 text-left transition-all ${region === 'GLOBAL' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}
                     >
                        <div className="flex justify-between mb-2">
                           <span className="font-black text-slate-800">🌍 Global</span>
                           {region === 'GLOBAL' && <CheckCircle className="text-blue-500" size={18} />}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">Auto-distributes edge nodes globally. Fails UAE data localization laws.</div>
                     </button>
                  </div>
               </div>
            </div>

            {/* DSAR Right to be Forgotten */}
            <div className="glass-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 glass-panel flex justify-between items-center">
                  <h2 className="font-black text-slate-800 flex items-center gap-2">
                    <AlertOctagon className="text-amber-500" size={18} /> Right of Access (DSAR)
                  </h2>
               </div>
               <div className="p-6">
                  <p className="text-sm text-slate-600 mb-4">Under PDPL/GDPR, users may formally request a machine-readable JSON export describing all internal system knowledge mapping to their unique identifier.</p>
                  
                  <div className="flex gap-2 mb-2">
                     <input 
                       type="email" 
                       placeholder="Enter Requesting User UID / Email"
                       className="flex-1 p-3 border border-slate-200 rounded-xl glass-panel focus:outline-none focus:border-amber-500"
                       value={dsarEmail}
                       onChange={e => setDsarEmail(e.target.value)}
                     />
                     <button 
                       onClick={handleDSARDataReturn}
                       disabled={!dsarEmail}
                       className="px-6 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 disabled:opacity-50 transition-colors"
                     >
                        Extract Array
                     </button>
                  </div>
                  {dsarStatus && <div className="text-xs font-bold text-amber-600 mt-3 bg-amber-50 p-3 rounded-lg border border-amber-200">{dsarStatus}</div>}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
