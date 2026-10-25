import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  X, 
  ArrowRight, 
  Clock, 
  Scale, 
  Building2, 
  Flame, 
  FileText, 
  AlertOctagon, 
  History, 
  UserCheck, 
  CheckCircle2, 
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  Jurisdiction, 
  RegionalComplianceMode, 
  toRegionalMode, 
  toJurisdiction, 
  JURISDICTION_PROFILES,
  JurisdictionProfile
} from '../../services/regionalComplianceService';

export interface RegionalConfigConfirmDialogProps {
  isOpen: boolean;
  currentMode: RegionalComplianceMode | Jurisdiction;
  targetMode: RegionalComplianceMode | Jurisdiction | null;
  onConfirm: (reason: string) => Promise<boolean | void> | boolean | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  currentUser?: {
    name?: string;
    role?: string;
    email?: string;
  };
  initialReason?: string;
}

const COMMON_REASONS = [
  'Scheduled annual HSE compliance & statutory realignment',
  'Concession expansion / Sultanate of Oman multi-site operations launch',
  'Statutory alignment with Oman Ministry of Labour MD 286/2008 & CDAA mandates',
  'Alignment with Oman Labour Law RD 53/2023 & PDO SP-1170 / SP-1143 standards',
  'External Ministry of Labour & PDO compliance audit preparation'
];

export const RegionalConfigConfirmDialog: React.FC<RegionalConfigConfirmDialogProps> = ({
  isOpen,
  currentMode,
  targetMode,
  onConfirm,
  onCancel,
  isSubmitting = false,
  error = null,
  currentUser,
  initialReason = ''
}) => {
  const [reason, setReason] = useState(initialReason);
  const [hasAcknowledgedImpact, setHasAcknowledgedImpact] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'legal' | 'heat' | 'incidents'>('summary');

  useEffect(() => {
    if (isOpen) {
      setReason(initialReason || '');
      setHasAcknowledgedImpact(false);
      setLocalError(null);
      setActiveTab('summary');
    }
  }, [isOpen, initialReason]);

  if (!isOpen || !targetMode) return null;

  const currentModeNorm = toRegionalMode(currentMode);
  const targetModeNorm = toRegionalMode(targetMode);

  const currentProfile: JurisdictionProfile = JURISDICTION_PROFILES[currentModeNorm] || JURISDICTION_PROFILES.COMBINED;
  const targetProfile: JurisdictionProfile = JURISDICTION_PROFILES[targetModeNorm] || JURISDICTION_PROFILES.COMBINED;

  const isTransitioningToUae = targetModeNorm === 'UAE';
  const isTransitioningToOman = targetModeNorm === 'OMAN';
  const isTransitioningToCombined = targetModeNorm === 'COMBINED';

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setLocalError('Administrative justification is required for the immutable compliance audit ledger.');
      return;
    }
    if (!hasAcknowledgedImpact) {
      setLocalError('You must acknowledge the operational and regulatory impact before proceeding.');
      return;
    }
    setLocalError(null);
    await onConfirm(reason.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="regional-confirm-title"
    >
      <div 
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white px-6 py-5 shrink-0 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Governance Gate • Administrative Authorization
                  </span>
                  <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    CONFIRMATION REQUIRED
                  </span>
                </div>
                <h2 id="regional-confirm-title" className="text-lg font-black text-white mt-0.5">
                  Confirm Regional Compliance Configuration Switch
                </h2>
              </div>
            </div>

            <button
              onClick={onCancel}
              disabled={isSubmitting}
              aria-label="Close dialog"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Transition Visualizer */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Current */}
            <div className="flex-1 w-full bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Current Configuration
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" role="img" aria-label="Current flag">{currentProfile.flag}</span>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{currentProfile.label}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{currentProfile.shortLabel} Framework</p>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black">
              <ArrowRight size={18} />
            </div>

            {/* Target */}
            <div className="flex-1 w-full bg-blue-50/60 rounded-xl p-3.5 border border-blue-200/90 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">
                Proposed New Configuration
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" role="img" aria-label="Target flag">{targetProfile.flag}</span>
                <div>
                  <h4 className="text-sm font-black text-blue-950">{targetProfile.label}</h4>
                  <p className="text-[11px] text-blue-700 font-medium">{targetProfile.shortLabel} Framework</p>
                </div>
              </div>
            </div>
          </div>

          {/* High-Impact Governance Alert */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-950">
              <AlertTriangle size={17} className="text-amber-700 shrink-0" />
              <span>Statutory & Operational Governance Notice:</span>
            </div>
            <p className="leading-relaxed font-medium">
              Switching the active compliance jurisdiction modifies live regulatory thresholds, statutory notification deadlines, 
              work-stoppage rules, and official inspectorate reporting formats across all enterprise modules.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-semibold text-[11px] text-amber-900">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>Zero Data Loss: Historical tags & audits preserved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>Immediate sync across active user sessions</span>
              </div>
            </div>
          </div>

          {/* Detail Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'summary' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Operational Scope
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('legal')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'legal' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Governing Laws & Decrees
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('heat')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'heat' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Heat Stress & Work Stoppage
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('incidents')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'incidents' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Incident Escalation SLAs
              </button>
            </div>

            {/* Tab 1: Operational Scope */}
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500">Supervisory Authorities</span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {targetProfile.authorities.map((auth, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                        {auth.shortName || auth.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">Official statutory agencies oversight</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500">Permit to Work Standard</span>
                  <strong className="text-slate-900 block font-bold text-xs">{targetProfile.permitRule.standard}</strong>
                  <p className="text-[11px] text-slate-500">{targetProfile.permitRule.permitClassifications.slice(0, 3).join(', ')}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500">Isolation & SIMOPS Standards</span>
                  <strong className="text-slate-900 block font-bold text-xs">{targetProfile.permitRule.isolationProtocol}</strong>
                  <p className="text-[11px] text-slate-500">{targetProfile.permitRule.simopsClashStandard}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500">Cross-Jurisdiction Filtering</span>
                  <strong className="text-slate-900 block font-bold text-xs">
                    {isTransitioningToCombined ? 'Dual-Nation View Active' : `Restricted to ${targetProfile.shortLabel} Sites`}
                  </strong>
                  <p className="text-[11px] text-slate-500">Workflow queues automatically align to scope</p>
                </div>
              </div>
            )}

            {/* Tab 2: Governing Laws */}
            {activeTab === 'legal' && (
              <div className="space-y-2 text-xs animate-in fade-in duration-150">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Primary Statutory Frameworks Activated
                  </span>
                  <p className="font-bold text-slate-900">
                    {targetProfile.governingFrameworks.join(' • ')}
                  </p>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {targetProfile.primaryLegislation.map((leg, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-[11px]">
                      <div>
                        <strong className="text-blue-900 font-bold block">{leg.code} — {leg.title}</strong>
                        <span className="text-slate-500">{leg.summary}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[9px] shrink-0 border border-emerald-200">
                        {leg.authority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Heat Stress */}
            {activeTab === 'heat' && (
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Flame size={15} className="text-amber-700" />
                    Heat Stress Regime: {targetProfile.heatStressRule.legalBasis}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Metric: {targetProfile.heatStressRule.measurementMetric}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Prohibited Midday Hours</span>
                    <strong className="text-slate-900">{targetProfile.heatStressRule.prohibitedHours}</strong>
                    <p className="text-[10px] text-slate-500 mt-0.5">Applicable: {targetProfile.heatStressRule.monthsApplicable}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Mandatory Work Stoppage</span>
                    <strong className="text-red-700">{targetProfile.heatStressRule.redThreshold}</strong>
                    <p className="text-[10px] text-slate-500 mt-0.5">Amber warning: {targetProfile.heatStressRule.amberThreshold}</p>
                  </div>
                </div>
                <p className="text-[11px] text-amber-900 font-medium">
                  {targetProfile.heatStressRule.notes}
                </p>
              </div>
            )}

            {/* Tab 4: Incident SLAs */}
            {activeTab === 'incidents' && (
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 text-xs space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-950 flex items-center gap-1.5">
                    <AlertOctagon size={15} className="text-red-700" />
                    Statutory Incident Reporting SLAs
                  </span>
                  <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                    {targetProfile.incidentNotificationRule.enforcingAuthority}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-lg border border-red-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Immediate Verbal / Portal Notice</span>
                    <strong className="text-red-900 text-xs">{targetProfile.incidentNotificationRule.immediateNotificationWindow}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-red-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Formal Written Submission</span>
                    <strong className="text-slate-900 text-xs">{targetProfile.incidentNotificationRule.formalSubmissionDeadline}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-700">
                  <span className="font-bold">Required Statutory Forms: </span>
                  <span>{targetProfile.incidentNotificationRule.requiredForms.join(' • ')}</span>
                </div>
                <p className="text-[10px] text-red-700 italic">
                  Penalties: {targetProfile.incidentNotificationRule.penalties}
                </p>
              </div>
            )}
          </div>

          {/* Justification Input Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="compliance-change-reason" 
                className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
              >
                <FileText size={14} className="text-blue-600" />
                Change Justification / Administrative Reason <span className="text-red-600">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Recorded in Immutable Audit Trail</span>
            </div>

            <textarea
              id="compliance-change-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Specify the business or legal requirement (e.g. Concession concessioning in Fahud Block 6, annual OSHAD v3.1 realignment, or executive audit)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium resize-none"
            />

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_REASONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(preset)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors"
                >
                  + {preset.slice(0, 38)}...
                </button>
              ))}
            </div>
          </div>

          {/* Authenticated Actor Stamp */}
          {currentUser && (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-[11px]">
              <div className="flex items-center gap-2">
                <UserCheck size={14} className="text-emerald-600" />
                <span>Authorized Administrator: <strong>{currentUser.name || 'System Administrator'}</strong></span>
                <span className="text-slate-400">({currentUser.role || 'ADMIN'})</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
              </span>
            </div>
          )}

          {/* Statutory Checkbox Gate */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <input
              id="compliance-acknowledge-checkbox"
              type="checkbox"
              checked={hasAcknowledgedImpact}
              onChange={(e) => setHasAcknowledgedImpact(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label 
              htmlFor="compliance-acknowledge-checkbox" 
              className="text-xs text-slate-700 font-semibold cursor-pointer select-none leading-relaxed"
            >
              I confirm that I possess system administrator authority to alter the enterprise regional compliance 
              configuration. I acknowledge that all statutory SLAs, heat stress monitoring rules, and authority portals 
              will immediately realign to <strong>{targetProfile.label}</strong>.
            </label>
          </div>

          {/* Error Banner */}
          {(localError || error) && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertOctagon size={16} className="shrink-0 text-red-600" />
              <span>{localError || error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-medium">
            This action creates an immutable audit record in the SOC 2 ledger.
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50"
            >
              Cancel & Retain {currentProfile.shortLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !hasAcknowledgedImpact}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
              <span>Confirm & Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Aliased export for flexibility
export const RegionalComplianceConfirmModal = RegionalConfigConfirmDialog;
export default RegionalConfigConfirmDialog;
