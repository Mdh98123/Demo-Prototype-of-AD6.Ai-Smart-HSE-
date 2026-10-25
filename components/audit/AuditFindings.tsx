import React, { useEffect, useState } from 'react';
import { Finding, SafetyAudit } from './AuditTypes';
import { AlertTriangle, CheckCircle2, Clock, Search, Filter, ShieldAlert, ArrowRight } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { WorkflowRecordPanel } from '../workflow/WorkflowRecordPanel';

interface Props {
    audits: SafetyAudit[];
}

export const AuditFindings: React.FC<Props> = ({ audits }) => {
    const { currentUser } = useUser();
    const { enabled: workflowEnabled, workItems, createForRecord } = useWorkflow();
    const [workflowError, setWorkflowError] = useState<string | null>(null);
    let allFindings: Finding[] = [];
    audits.forEach(a => {
        a.findings.forEach(f => {
            allFindings.push({ ...f, auditId: a.id }); // Ensure auditId is present
        });
    });

    useEffect(() => {
        if (!workflowEnabled || !currentUser) return;
        const openFindings = audits.flatMap(audit => audit.findings.map(finding => ({ ...finding, auditId: audit.id })))
            .filter(finding => finding.status !== 'Closed' && finding.status !== 'Rejected');
        openFindings.forEach(finding => {
            if (workItems.some(item => item.recordId === finding.id)) return;
            void createForRecord({
                recordType: 'Audit',
                recordId: finding.id,
                title: finding.description.slice(0, 100),
                priority: finding.severity,
                siteId: 'site-sohar',
                department: currentUser.department
            }).catch(cause => {
                setWorkflowError(cause instanceof Error ? cause.message : 'Workflow task creation failed.');
            });
        });
    }, [audits, createForRecord, currentUser, workItems, workflowEnabled]);

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-slate-100 text-slate-800 border-slate-200';
            case 'Assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Under Action': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'Pending Verification': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Closed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {workflowError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{workflowError}</p>}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Findings & Corrective Actions</h2>
                    <p className="text-sm text-slate-500">Track and manage audit non-conformances and CAPA workflows</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search findings..." 
                            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 glass-card border border-slate-300 text-slate-700 rounded-lg hover:glass-button transition-colors text-sm font-medium shadow-sm">
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </div>

            <div className="glass-card border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="glass-panel border-b border-slate-200">
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID / Category</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allFindings.map(finding => (
                                <tr key={finding.id} className="hover:glass-button transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 text-sm">{finding.id}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{finding.category}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-slate-800 line-clamp-2 max-w-md">{finding.description}</div>
                                        {finding.rca && (
                                            <div className="flex items-center gap-1 text-xs font-medium text-brand-600 mt-1">
                                                <ShieldAlert size={12} /> AI RCA Available
                                            </div>
                                        )}
                                        <WorkflowRecordPanel recordType="Audit" recordId={finding.id} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getSeverityColor(finding.severity)}`}>
                                            {finding.severity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(finding.status)}`}>
                                            {finding.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <Clock size={14} className="text-slate-400" />
                                            {finding.dueDate}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-brand-600 hover:text-brand-800 text-sm font-medium inline-flex items-center gap-1">
                                            Manage <ArrowRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {allFindings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        No findings recorded.
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
