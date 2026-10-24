import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, ShieldCheck, AlertTriangle, Building2, 
  CheckCircle2, ArrowRight, ShieldAlert, Award
} from 'lucide-react';
import { 
  RegulatoryIntelligenceService, 
  ComplianceScorecard 
} from '../../services/regulatoryIntelligenceService';

export const ComplianceScorecards: React.FC = () => {
  const [scorecards] = useState<ComplianceScorecard[]>(() => 
    RegulatoryIntelligenceService.getComplianceScorecards()
  );
  const [selectedFacility, setSelectedFacility] = useState<ComplianceScorecard>(scorecards[0]);

  const avgOverall = Math.round(
    scorecards.reduce((sum, s) => sum + s.overallScore, 0) / scorecards.length * 10
  ) / 10;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Multi-Site Governance Index
            </span>
            <span className="text-xs text-slate-400 font-mono">Q3 2026 Audit Cycle</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight uppercase mt-1">
            Enterprise Statutory Compliance Scorecard
          </h3>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Standardized index measuring alignment against OSHAD-SF, UAE MoHRE, Civil Defence, and Oman Ministry of Labour standards across all active operating concessions.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Group Index</span>
            <span className="text-3xl font-black text-emerald-400">{avgOverall}%</span>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Audit Status</span>
            <span className="text-xs font-black text-white uppercase bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800 mt-1 block">
              Audit Ready
            </span>
          </div>
        </div>
      </div>

      {/* Facility Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scorecards.map(sc => {
          const isSelected = selectedFacility.facilityId === sc.facilityId;
          return (
            <div
              key={sc.facilityId}
              onClick={() => setSelectedFacility(sc)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'glass-card border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">
                    {sc.facilityId}
                  </span>
                  <h4 className="font-black text-sm text-slate-800 tracking-tight mt-0.5 leading-snug">
                    {sc.facilityName.split('(')[0]}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  sc.riskTier === 'Low Risk' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {sc.riskTier}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-800">
                  {sc.overallScore}%
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp size={12} /> {sc.trend}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full ${
                    sc.overallScore >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${sc.overallScore}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Gaps: {sc.unresolvedGaps} open</span>
                <span className="font-bold text-indigo-600">Inspect Details →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Facility Domain Breakdown */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-base font-black text-slate-800 tracking-tight uppercase">
              {selectedFacility.facilityName} — Domain Compliance Audit
            </h4>
            <p className="text-xs text-slate-500">
              Granular scoring across statutory pillars mandated by local authority frameworks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Selected Concession:</span>
            <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-xs">
              {selectedFacility.overallScore}% Overall
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              1. Labor & MoHRE Law
            </span>
            <div className="text-2xl font-black text-slate-800">{selectedFacility.laborScore}%</div>
            <p className="text-[10px] text-slate-500 font-medium">Midday ban, wages protection & thermal welfare.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              2. Civil Defence Fire Safety
            </span>
            <div className="text-2xl font-black text-slate-800">{selectedFacility.fireSafetyScore}%</div>
            <p className="text-[10px] text-slate-500 font-medium">Hassantuk telemetry & deluge certification.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              3. Environmental & ESG
            </span>
            <div className="text-2xl font-black text-slate-800">{selectedFacility.environmentalEsgScore}%</div>
            <p className="text-[10px] text-slate-500 font-medium">EAD chemical manifest & air emissions limits.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              4. Workforce Certification
            </span>
            <div className="text-2xl font-black text-slate-800">{selectedFacility.workforceCertScore}%</div>
            <p className="text-[10px] text-slate-500 font-medium">H2S, AGT, scaffolding & first-aid passports.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              5. Contractor Vetting
            </span>
            <div className="text-2xl font-black text-slate-800">{selectedFacility.contractorScore}%</div>
            <p className="text-[10px] text-slate-500 font-medium">Pre-qualification, insurance & PTW clearance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
