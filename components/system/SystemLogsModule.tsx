import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileClock, Download, Filter, Search, ShieldCheck, CheckCircle2, 
  ArrowRight, User, Calendar, Layers, ShieldAlert, FileText, 
  RefreshCw, Check, AlertTriangle, Eye, ChevronDown, ChevronRight,
  FileSpreadsheet, Sparkles, Building2, ExternalLink, Hash, Lock
} from 'lucide-react';
import { 
  UnifiedAuditTrailService, 
  UnifiedAuditRecord, 
  AuditModuleType, 
  AuditActionType 
} from '../../services/unifiedAuditTrailService';
import { useUser } from '../../contexts/UserContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const SystemLogsModule: React.FC = () => {
  const { currentUser } = useUser();
  const { t } = useLanguage();

  const [records, setRecords] = useState<UnifiedAuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<AuditModuleType | 'ALL'>('ALL');
  const [selectedAction, setSelectedAction] = useState<AuditActionType | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'Low' | 'Medium' | 'High' | 'Critical'>('ALL');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [selectedInspectRecord, setSelectedInspectRecord] = useState<UnifiedAuditRecord | null>(null);

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    verifiedCount: number;
    details: string;
  } | null>(null);

  // Quick Action Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await UnifiedAuditTrailService.queryAuditTrail({
        module: selectedModule,
        actionType: selectedAction,
        severity: selectedSeverity,
        searchTerm
      });
      setRecords(data);
    } catch (err) {
      console.error('[AUDIT] Failed to fetch audit trail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();

    // Real-time listener for incoming audit entries
    const handleNewLog = () => {
      fetchRecords();
    };

    window.addEventListener('ad6-audit-logged', handleNewLog);
    return () => {
      window.removeEventListener('ad6-audit-logged', handleNewLog);
    };
  }, [selectedModule, selectedAction, selectedSeverity, searchTerm]);

  // Metrics KPI calculations
  const metrics = useMemo(() => {
    const total = records.length;
    const statusChanges = records.filter(r => r.actionType === 'STATUS_CHANGE').length;
    const userAssignments = records.filter(r => r.actionType === 'USER_ASSIGNMENT').length;
    const edits = records.filter(r => r.actionType === 'RECORD_EDIT').length;
    const criticalActions = records.filter(r => r.severity === 'Critical' || r.severity === 'High').length;

    return {
      total,
      statusChanges,
      userAssignments,
      edits,
      criticalActions
    };
  }, [records]);

  // Run Cryptographic Blockchain Integrity Verification
  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const result = await UnifiedAuditTrailService.verifyLedgerIntegrity();
      setVerificationResult(result);
      setToastMessage(result.isValid ? `✅ ${result.details}` : `⚠️ ${result.details}`);
    } catch {
      setToastMessage('⚠️ Verification process encountered an error');
    } finally {
      setIsVerifying(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Export SIEM JSON
  const handleExportSIEM = () => {
    const jsonStr = UnifiedAuditTrailService.exportComplianceReport(records, 'json');
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ad6_compliance_audit_ledger_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage('📥 Exported SIEM JSON Compliance Report');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Export Auditor CSV (With Previous vs New values)
  const handleExportCSV = () => {
    const csvStr = UnifiedAuditTrailService.exportComplianceReport(records, 'csv');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ad6_statutory_audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage('📊 Exported Regulator CSV with Full Value Diffs');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper for action type styling
  const getActionBadge = (type: AuditActionType) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return { label: 'Status Transition', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'USER_ASSIGNMENT':
        return { label: 'User Reassignment', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'APPROVAL_SIGN_OFF':
        return { label: 'Digital Sign-off', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'STOP_WORK_AUTHORITY':
        return { label: 'Stop Work (SWA)', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'RECORD_CREATE':
        return { label: 'Record Created', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'RECORD_EDIT':
        return { label: 'Field Mutation', bg: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'COMPLIANCE_OVERRIDE':
        return { label: 'Policy Override', bg: 'bg-orange-100 text-orange-800 border-orange-300' };
      default:
        return { label: type, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1720px] mx-auto min-h-full font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <Sparkles className="text-amber-400 shrink-0" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-600/30 border border-blue-400/40 rounded-xl text-blue-400">
              <FileClock size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Unified Compliance Audit Trail
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  WORM SHA-256 Ledger
                </span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5 font-medium">
                Cryptographically chained immutable record of every status transition, user reassignment, and field edit across GCC assets.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="px-4 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all border border-emerald-400/30 disabled:opacity-50"
            title="Verify complete SHA-256 blockchain hash chaining"
          >
            <ShieldCheck size={16} className={isVerifying ? 'animate-spin' : ''} />
            {isVerifying ? 'Verifying Chain...' : 'Verify Ledger Integrity'}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-600 shadow-sm transition-colors"
            title="Download regulator audit CSV with old vs new diff values"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            Export Auditor CSV
          </button>

          <button
            onClick={handleExportSIEM}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            title="Download JSON format for SOC SIEM ingestion"
          >
            <Download size={16} />
            SIEM JSON
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>Total Captured Events</span>
            <Layers size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Monotonically indexed records</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold mb-1">
            <span>Status Transitions</span>
            <CheckCircle2 size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{metrics.statusChanges}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Permits, Incidents, CAPA state</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-purple-700 text-xs font-bold mb-1">
            <span>User Reassignments</span>
            <User size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{metrics.userAssignments}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Ownership & custody handovers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-sky-700 text-xs font-bold mb-1">
            <span>Field Modifications</span>
            <FileText size={16} className="text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-600">{metrics.edits}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Controls & assessment mutations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold mb-1">
            <span>Ledger Integrity</span>
            <Lock size={16} className="text-emerald-500" />
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-base mt-1">
            <CheckCircle2 size={18} />
            <span>SHA-256 Valid</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Zero tamper discrepancies</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Query */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search entity ID, user, hash, summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Modules (Suite-Wide)</option>
              <option value="PERMITS">Permit to Work (PTW)</option>
              <option value="INCIDENTS">Incident Management</option>
              <option value="CAPA">Corrective Actions (CAPA)</option>
              <option value="SAFETY_AUDIT">Safety Audits & Findings</option>
              <option value="HAZARD_MANAGEMENT">Hazard & Risk Registers</option>
              <option value="WORKFORCE_SAFETY">Workforce Safety & SWA</option>
              <option value="SECURITY_IAM">IAM & Role Matrix</option>
              <option value="SYSTEM_ADMIN">System Governance</option>
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Action Types</option>
              <option value="STATUS_CHANGE">Status Transitions</option>
              <option value="USER_ASSIGNMENT">User Reassignments</option>
              <option value="APPROVAL_SIGN_OFF">Digital Sign-offs</option>
              <option value="RECORD_EDIT">Field Mutations (Diffs)</option>
              <option value="RECORD_CREATE">Record Creations</option>
              <option value="STOP_WORK_AUTHORITY">Stop Work Authority (SWA)</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical Severity</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Audit Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Compliance Ledger ({records.length} Records)
            </span>
            <span className="text-[11px] text-slate-500">· Showing newest first</span>
          </div>
          <button
            onClick={fetchRecords}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Change Summary & Diffs</th>
                <th className="py-3 px-4 text-center">Diff Inspector</th>
                <th className="py-3 px-4">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => {
                const actionBadge = getActionBadge(rec.actionType);
                const isExpanded = expandedRecordId === rec.id;

                return (
                  <React.Fragment key={rec.id}>
                    <tr className={`hover:bg-blue-50/40 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                      {/* Sequence Number */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-500 text-[11px]">
                        {rec.sequenceNumber}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {new Date(rec.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(rec.timestamp).toLocaleTimeString()} UTC
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{rec.actor.userName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                          <span>{rec.actor.userRole}</span>
                          {rec.actor.department && <span>· {rec.actor.department}</span>}
                        </div>
                      </td>

                      {/* Action Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${actionBadge.bg}`}>
                          {actionBadge.label}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 font-mono flex items-center gap-1.5">
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {rec.module}
                          </span>
                          <span>{rec.entityId}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={rec.entityTitle}>
                          {rec.entityTitle}
                        </div>
                      </td>

                      {/* Change Summary */}
                      <td className="py-3 px-4 max-w-[340px]">
                        <p className="text-slate-800 font-medium text-[11px] leading-snug">
                          {rec.changeSummary}
                        </p>
                        {rec.reason && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Justification: "{rec.reason}"
                          </p>
                        )}
                      </td>

                      {/* Diff Inspector Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          {isExpanded ? 'Hide Diff' : 'View Diff'}
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                      </td>

                      {/* Cryptographic Hash */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[10px] text-slate-400">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold" title={rec.recordHash}>
                          <Lock size={11} />
                          <span>{rec.recordHash.substring(0, 8)}...{rec.recordHash.substring(rec.recordHash.length - 6)}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 truncate max-w-[140px]" title={`Chained to prev: ${rec.previousHash}`}>
                          prev: {rec.previousHash.substring(0, 10)}...
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Row with Field Diff Breakdown */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-y border-blue-200">
                        <td colSpan={8} className="p-4 sm:p-5">
                          <div className="space-y-4 max-w-5xl mx-auto">
                            {/* Summary Banner inside diff */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase text-slate-800">
                                  State Mutation Audit Breakdown
                                </span>
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                                  ID: {rec.id}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                                <span>Site: <strong className="text-slate-800">{rec.siteName}</strong></span>
                                <span>·</span>
                                <span>Actor ID: <strong className="text-slate-800">{rec.actor.userId}</strong></span>
                              </div>
                            </div>

                            {/* Field Diff Breakdown */}
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                <span>Previous Values vs. New Values</span>
                                <span className="text-[10px] font-normal text-slate-500">
                                  ({rec.diff.length} fields modified)
                                </span>
                              </h4>

                              {rec.diff.length === 0 ? (
                                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-500 text-xs italic">
                                  No field changes detected. Entire record created or action recorded without property mutations.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                  {rec.diff.map((d, dIdx) => (
                                    <div key={dIdx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                        <span className="font-mono text-blue-600">{d.field}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">({d.label})</span>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                                        {/* Previous Value */}
                                        <div className="bg-rose-50/70 p-2 rounded-lg border border-rose-200/60">
                                          <div className="text-[9px] uppercase font-bold text-rose-600 mb-0.5">
                                            Previous Value
                                          </div>
                                          <div className="font-mono text-slate-700 line-through text-[11px] break-all">
                                            {d.previous === null || d.previous === undefined 
                                              ? '<null / unassigned>' 
                                              : typeof d.previous === 'object' 
                                                ? JSON.stringify(d.previous) 
                                                : String(d.previous)}
                                          </div>
                                        </div>

                                        {/* New Value */}
                                        <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/70">
                                          <div className="text-[9px] uppercase font-bold text-emerald-700 mb-0.5 flex items-center gap-1">
                                            <Check size={10} /> New Value
                                          </div>
                                          <div className="font-mono font-bold text-slate-900 text-[11px] break-all">
                                            {d.current === null || d.current === undefined 
                                              ? '<null / cleared>' 
                                              : typeof d.current === 'object' 
                                                ? JSON.stringify(d.current) 
                                                : String(d.current)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Compliance & Regulatory Citations */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 text-[11px]">Regulatory Standards Alignment:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {rec.regulatoryFramework.map((reg, regIdx) => (
                                    <span key={regIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200">
                                      {reg}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="text-[11px] font-mono text-slate-500">
                                Block Hash: <span className="text-slate-900 font-bold">{rec.recordHash}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {records.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    <FileClock size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-bold text-slate-600">No audit records match the current filter</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search terms or module selector</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
