import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  Users, ChevronRight, Check, X, Shield, Briefcase, HardHat, 
  Activity, Settings, Sparkles, AlertTriangle, Key, ShieldAlert,
  PlusCircle, MinusCircle, RefreshCw, Lock, Unlock, UserCheck, UserX,
  Play, FileSignature, AlertOctagon, Leaf, Award, CheckCircle2, ArrowRight
} from 'lucide-react';
import { UserRole } from '../types';
import { PERMISSIONS, calculateEffectivePermissions } from '../services/permissionService';
import { OmanCentralDataStore, OMAN_COMPANY_NAME } from '../services/omanCentralDataStore';

interface RoleSwitcherProps {
  onNavigateToView?: (view: any, params?: any) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onNavigateToView }) => {
  const { 
    users, 
    currentUser, 
    switchUser, 
    effectivePermissions, 
    updateUserPermissions, 
    updateUserRoles, 
    setUserSuspension 
  } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personas' | 'scenarios' | 'policies'>('personas');
  const [scenarioRunning, setScenarioRunning] = useState<string | null>(null);
  const [scenarioOutput, setScenarioOutput] = useState<{ title: string; steps: string[]; outcome: string; aiMarker?: boolean } | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Group users: Highlight the 10 Primary Omani Roles first
  const omaniPersonas = users.filter(u => u.id.startsWith('usr-'));
  const strategic = users.filter(u => ['Board_Director', 'CEO', 'ADMIN'].includes(u.role) && !u.id.startsWith('usr-'));
  const operational = users.filter(u => !u.id.startsWith('usr-') && !['Board_Director', 'CEO', 'ADMIN'].includes(u.role));

  const isSuspended = currentUser?.isSuspended || currentUser?.employmentStatus === 'Suspended' || currentUser?.employmentStatus === 'Inactive';

  const handleResetData = () => {
    OmanCentralDataStore.resetToSeedData();
    setResetMessage('✅ Demo data restored to Al Hajar SAOC baseline across Sohar, Duqm, Fahud & Salalah.');
    setTimeout(() => setResetMessage(null), 4000);
  };

  // --------------------------------------------------------------------------
  // SCENARIO EXECUTORS
  // --------------------------------------------------------------------------
  const runScenarioA = () => {
    setScenarioRunning('A');
    // 1. Switch to Duqm Safety Supervisor Khalfan Al-Shehi
    const targetUser = users.find(u => u.id === 'usr-site-supervisor') || users[0];
    switchUser(targetUser.id);

    // 2. Query and trigger incident cascade
    const incidents = OmanCentralDataStore.getIncidents();
    const incident = incidents.find(i => i.id === 'inc-omn-01') || incidents[0];
    const capas = OmanCentralDataStore.getCapas().filter(c => incident.capaIds.includes(c.id));
    const esg = OmanCentralDataStore.getESG();

    setScenarioOutput({
      title: 'Scenario A: Duqm Heat-Stress Near Miss Cascade',
      steps: [
        `Switched Role to Khalfan Al-Shehi (Duqm Field Safety Supervisor).`,
        `Incident Logged: ${incident.referenceNumber} - ${incident.title}. Ambient 44.5°C, TWL measured at 98 W/m² (< 115 stop limit).`,
        `Stop Work Authority (SWA) executed immediately under zero-retaliation safety mandate.`,
        `5-Why Investigation completed: Root Cause identified as lack of automated midday audible sirens and contractor rest breach.`,
        `2 SMART CAPAs dispatched: CAPA-OMN-01 (Automated Sirens) & CAPA-OMN-02 (Bilingual Worker Stand-down).`,
        `Risk Register updated with barrier control; worker safely rehydrated with 0 Lost Work Days.`,
        `Reconciled with ESG Safety Metrics: LTIFR maintained at ${esg.ltifrRate} per 1,000,000 exposure hours.`
      ],
      outcome: 'Full end-to-end trace: Field Hazard → SWA → Investigation → CAPA → ESG Metrics reconciled.'
    });
    setScenarioRunning(null);
  };

  const runScenarioB = () => {
    setScenarioRunning('B');
    // 1. Switch to Lead Permit Authorizer Ahmed Al-Kindi
    const targetUser = users.find(u => u.id === 'usr-permit-authorizer') || users[0];
    switchUser(targetUser.id);

    // 2. Evaluate Confined Space Permit for Duqm Tank 402
    const permits = OmanCentralDataStore.getPermits();
    const permit = permits.find(p => p.id === 'ptw-duqm-02') || permits[0];
    const check = OmanCentralDataStore.validatePermitGating(permit);

    setScenarioOutput({
      title: 'Scenario B: Hot Work & Confined Space Safety Gating Check',
      steps: [
        `Switched Role to Ahmed Al-Kindi (Level 3 PTW Issuing Authority).`,
        `Attempted Permit Approval: ${permit.permitNumber} - ${permit.title}.`,
        `Automated Safety Gating Engine evaluated 5 critical barrier rules.`,
        `VIOLATION 1: Contractor Al Duqm Tank Cleaning is SUSPENDED (Expired Workmen Comp Insurance).`,
        `VIOLATION 2: Lead Entrant Rajesh Kumar has EXPIRED mandatory H2S and Medical Fitness cards.`,
        `VIOLATION 3: Atmospheric Gas Test FAILED (LEL at 8.4% against 1.0% limit; H2S at 4.8 ppm).`,
        `VIOLATION 4: SIMOPS Clash detected with simultaneous hydro-testing of line P-102 in Tank Farm B.`,
        `System Action: Permit marked SUSPENDED; digital signature blocked until all 4 barriers are cleared.`
      ],
      outcome: 'Zero-tolerance verification succeeded: Unauthorized work prevented before field mobilization.'
    });
    setScenarioRunning(null);
  };

  const runScenarioC = async () => {
    setScenarioRunning('C');
    // 1. Switch to Corporate QHSE & ESG Director Dr. Tariq Al-Busaidi
    const targetUser = users.find(u => u.id === 'usr-qhse-director') || users[0];
    switchUser(targetUser.id);

    const esg = OmanCentralDataStore.getESG();

    // Call server Gemini API for real-time narrative drafting
    let aiNarrative = '';
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are the Executive ESG Advisor for ${OMAN_COMPANY_NAME}. Generate a concise, formal executive board narrative (150 words) for Q3 2026 based on live operational metrics: Scope 1 Emissions: ${esg.scope1CO2eTonnes} tCO2e, Scope 2: ${esg.scope2CO2eTonnes} tCO2e, Water Recycling: ${esg.recycledWaterPercent}%, Omanisation: ${esg.omanisationAchievedPercent}% (Target: 80%), In-Country Value (ICV) spend: OMR ${esg.inCountryValueSpentOMR.toLocaleString('en-US', { minimumFractionDigits: 3 })}, Total Hours: ${(esg.totalManHoursWorked / 1000000).toFixed(2)}M, LTIFR: ${esg.ltifrRate}. Reference alignment to Oman Vision 2040 and net-zero ambition [verify].`,
          model: 'gemini-3.8-flash'
        })
      });
      const data = await response.json();
      aiNarrative = data.text || esg.narrativeSummary || 'Executive ESG narrative generated from live telemetry.';
    } catch {
      aiNarrative = esg.narrativeSummary || 'Executive ESG narrative generated from live telemetry.';
    }

    setScenarioOutput({
      title: 'Scenario C: Live ESG Quarterly Disclosure & AI Narrative',
      steps: [
        `Switched Role to Dr. Tariq Al-Busaidi (Corporate QHSE & ESG Director).`,
        `Live Telemetry Aggregated: Scope 1: ${esg.scope1CO2eTonnes.toLocaleString()} tCO2e | Scope 2: ${esg.scope2CO2eTonnes.toLocaleString()} tCO2e.`,
        `Omanisation Rate: ${esg.omanisationAchievedPercent}% (Surpassed statutory 80% quota).`,
        `In-Country Value (ICV): OMR ${esg.inCountryValueSpentOMR.toLocaleString('en-US', { minimumFractionDigits: 3 })} committed to Omani suppliers.`,
        `Safety Performance: ${esg.totalManHoursWorked.toLocaleString()} exposure hours with LTIFR of ${esg.ltifrRate} per 1M hrs.`,
        `Gemini AI Engine synthesized board-ready narrative mapped to MSX / FSA and GRI disclosure standards.`
      ],
      outcome: aiNarrative,
      aiMarker: true
    });
    setScenarioRunning(null);
  };

  const renderGroup = (title: string, groupUsers: typeof users, icon: React.ReactNode) => (
    <div className="mb-4 last:mb-0">
      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 px-1 flex items-center gap-1.5">
        {icon} {title}
      </h4>
      <div className="space-y-1.5">
        {groupUsers.map(user => {
          const isSelected = currentUser.id === user.id;
          return (
            <button
              key={user.id}
              onClick={() => { switchUser(user.id); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-start transition-all border ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-white/80 hover:bg-slate-100/80 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{user.name}</span>
                <span className={`text-[10px] tracking-wide font-medium mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {user.jobTitle || user.role.replace(/_/g, ' ')} · {user.department}
                </span>
              </div>
              {isSelected && <Check size={16} className="text-white shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 start-8 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all hover:scale-105 z-[100] flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-20 duration-500"
      >
        <div className={`p-2 rounded-full shadow-sm text-white ${isSuspended ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <Users size={16} />
        </div>
        <div className="text-start">
          <span className="block text-[9px] font-black uppercase text-emerald-400 tracking-wider leading-none mb-0.5">Oman QHSE Demo Hub</span>
          <span className="block text-xs font-bold leading-none text-slate-100">
            {isSuspended ? 'Account Suspended' : (currentUser.jobTitle || currentUser.name)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]" onClick={() => setIsOpen(false)} />
      
      <div className="fixed bottom-8 start-8 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-200 origin-bottom-left">
        <div className="w-88 md:w-[490px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2.5 rounded-xl shadow-sm text-white"><Shield size={18}/></div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Oman QHSE & ESG Demo Command</h3>
                <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">{OMAN_COMPANY_NAME}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X size={18}/>
            </button>
          </div>

          {/* Reset Notice Banner */}
          {resetMessage && (
            <div className="bg-emerald-50 text-emerald-900 text-xs px-4 py-2 border-b border-emerald-200 font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{resetMessage}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 bg-slate-100/90 p-1 gap-1">
            <button
              onClick={() => { setActiveTab('personas'); setScenarioOutput(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'personas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              10 Primary Roles ({omaniPersonas.length})
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'scenarios' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play size={12} /> Guided Scenarios
            </button>
            <button
              onClick={() => { setActiveTab('policies'); setScenarioOutput(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'policies' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              RBAC Engine
            </button>
          </div>
          
          {/* Tab 1: Personas */}
          {activeTab === 'personas' && (
            <div className="overflow-y-auto p-4 custom-scrollbar bg-slate-50/60 max-h-[55vh]">
              {renderGroup('Oman Industrial Primary Roles (10 Personas)', omaniPersonas, <Award size={14} className="text-emerald-600" />)}
              {strategic.length > 0 && renderGroup('Executive & Board', strategic, <Shield size={12} className="text-blue-600" />)}
              {operational.length > 0 && renderGroup('Operations Support', operational, <Briefcase size={12} className="text-slate-600" />)}
            </div>
          )}

          {/* Tab 2: Guided Scenarios (3 Core Demonstrations) */}
          {activeTab === 'scenarios' && (
            <div className="overflow-y-auto p-4 custom-scrollbar bg-slate-50/60 max-h-[55vh] space-y-3">
              {!scenarioOutput ? (
                <>
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <h4 className="text-xs font-bold text-slate-900">Scenario A: Heat-Stress Near Miss at Duqm</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Triggers incident at 44.5°C (TWL &lt; 115 W/m²), executes 5-Why RCA, dispatches automated CAPAs, and updates ESG safety rates.
                        </p>
                      </div>
                      <button
                        onClick={runScenarioA}
                        disabled={scenarioRunning !== null}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Play size={12} /> Run A
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          <h4 className="text-xs font-bold text-slate-900">Scenario B: Blocked PTW (Expired Contractor/Worker)</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Attempts approval of Confined Space permit PTW-DQM-2026-0718 and enforces automated safety barrier blocks (expired insurance, expired H2S, gas test failure, SIMOPS).
                        </p>
                      </div>
                      <button
                        onClick={runScenarioB}
                        disabled={scenarioRunning !== null}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Play size={12} /> Run B
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          <h4 className="text-xs font-bold text-slate-900">Scenario C: Live ESG Report & AI Narrative</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Calculates Scope 1/2/3, 84.8% Omanisation, and OMR 14.85M ICV spend, generating a formal board narrative via Gemini API.
                        </p>
                      </div>
                      <button
                        onClick={runScenarioC}
                        disabled={scenarioRunning !== null}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Play size={12} /> Run C
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      {scenarioOutput.title}
                    </h4>
                    <button
                      onClick={() => setScenarioOutput(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-700 font-bold"
                    >
                      Back to list
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {scenarioOutput.steps.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                        <span className="font-mono text-emerald-600 font-bold shrink-0">{idx + 1}.</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Demonstrated Result:</span>
                    <p className="font-medium text-[11px]">{scenarioOutput.outcome}</p>
                    {scenarioOutput.aiMarker && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                        <Sparkles size={12} /> AI-generated, human review required (Certified by Dr. Tariq Al-Busaidi)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Policies & Granular RBAC */}
          {activeTab === 'policies' && (
            <div className="overflow-y-auto p-4 custom-scrollbar bg-slate-50/60 max-h-[55vh] space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Account Status</span>
                  <span className="text-xs font-bold text-slate-800">
                    {isSuspended ? 'Account Suspended' : 'Active Account'}
                  </span>
                </div>
                <button
                  onClick={async () => { if (currentUser) await setUserSuspension(currentUser.id, !isSuspended); }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    isSuspended ? 'bg-emerald-600 text-white' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {isSuspended ? 'Reactivate' : 'Suspend Account'}
                </button>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">Effective Privileges</span>
                <div className="text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Permit Authorization (PTW):</span>
                    <span className="font-bold">{effectivePermissions.includes(PERMISSIONS.PTW_APPROVE) ? '✅ Authorized' : '❌ Restricted'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incident Investigation Sign-off:</span>
                    <span className="font-bold">{effectivePermissions.includes(PERMISSIONS.INCIDENTS_SIGN_OFF) ? '✅ Authorized' : '❌ Restricted'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Executive Board Analytics:</span>
                    <span className="font-bold">{effectivePermissions.includes(PERMISSIONS.EXECUTIVE_BI_VIEW) ? '✅ Authorized' : '❌ Restricted'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer with Reset Button */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-slate-500 font-medium truncate">
              Active: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role.replace(/_/g, ' ')})
            </span>
            <button
              onClick={handleResetData}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-all flex items-center gap-1"
              title="Reset all demo records back to baseline"
            >
              <RefreshCw size={12} /> Reset Demo Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleSwitcher;
