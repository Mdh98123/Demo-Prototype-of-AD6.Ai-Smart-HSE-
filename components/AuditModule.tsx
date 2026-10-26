import React, { useState } from 'react';
import { SafetyAudit } from './audit/AuditTypes';
import { MOCK_AUDITS, MOCK_AUDIT_TEMPLATES, MOCK_AUDITORS } from './audit/AuditMockData';
import { AuditDashboard } from './audit/AuditDashboard';
import { AuditPlanner } from './audit/AuditPlanner';
import { ChecklistEngine } from './audit/ChecklistEngine';
import { AuditFindings } from './audit/AuditFindings';
import { AuditExecution } from './audit/AuditExecution';
import { AuditReports } from './audit/AuditReports';
import { WorkflowRecordPanel } from './workflow/WorkflowRecordPanel';
import { LayoutDashboard, Calendar, ClipboardList, AlertTriangle, ShieldCheck, FileBarChart } from 'lucide-react';

const AuditModule: React.FC<{ initialWorkflowRecordId?: string }> = ({ initialWorkflowRecordId }) => {
    const [activeTab, setActiveTab] = useState<'Dashboard' | 'Planner' | 'Templates' | 'Findings' | 'Reports'>(initialWorkflowRecordId ? 'Findings' : 'Dashboard');
    const [audits, setAudits] = useState<SafetyAudit[]>(MOCK_AUDITS);
    const [executingAuditId, setExecutingAuditId] = useState<string | null>(null);

    const handleSchedule = (audit: Partial<SafetyAudit>) => {
        setAudits(prev => [audit as SafetyAudit, ...prev]);
        setActiveTab('Dashboard');
    };

    if (executingAuditId) {
        const audit = audits.find(a => a.id === executingAuditId);
        const template = MOCK_AUDIT_TEMPLATES.find(t => t.id === audit?.templateId);
        if (audit) {
            return (
                <div className="p-6 glass-panel h-full overflow-y-auto">
                    <AuditExecution audit={audit} template={template} onBack={() => setExecutingAuditId(null)} />
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col h-full glass-panel">
            {/* Header & Tabs */}
            <div className="glass-card border-b border-slate-200 px-6 py-4 shrink-0 z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                        <ShieldCheck className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Safety Audit Automation</h1>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">End-to-end audit planning, execution, and CAPA management</p>
                    </div>
                </div>

                <div className="flex gap-1 border-b border-slate-200">
                    <button 
                        onClick={() => setActiveTab('Dashboard')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <LayoutDashboard size={16} /> Command Center
                    </button>
                    <button 
                        onClick={() => setActiveTab('Planner')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Planner' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <Calendar size={16} /> Audit Planner
                    </button>
                    <button 
                        onClick={() => setActiveTab('Templates')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Templates' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <ClipboardList size={16} /> Checklist Engine
                    </button>
                    <button 
                        onClick={() => setActiveTab('Findings')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Findings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <AlertTriangle size={16} /> Findings & CAPA
                    </button>
                    <button 
                        onClick={() => setActiveTab('Reports')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Reports' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <FileBarChart size={16} /> Report Engine
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
                {initialWorkflowRecordId && <WorkflowRecordPanel recordType="Audit" recordId={initialWorkflowRecordId} />}
                {activeTab === 'Dashboard' && (
                    <div className="space-y-6">
                        <AuditDashboard audits={audits} />
                        
                        {/* Audit Execution Entry Point */}
                        <div className="glass-card rounded-xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-base font-semibold text-slate-800 mb-4">Start Field Audit</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {audits.filter(a => ['Scheduled', 'In Progress'].includes(a.status)).map(audit => (
                                    <div key={audit.id} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium rounded">{audit.status}</span>
                                            <span className="text-xs text-slate-400 font-medium">{audit.scheduledDate}</span>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 line-clamp-1">{audit.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{audit.location}</p>
                                        <button 
                                            onClick={() => setExecutingAuditId(audit.id)}
                                            className="w-full mt-4 py-2 glass-panel text-indigo-600 border border-slate-200 rounded-lg text-sm font-medium group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors"
                                        >
                                            Execute Audit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'Planner' && <AuditPlanner audits={audits} templates={MOCK_AUDIT_TEMPLATES} auditors={MOCK_AUDITORS} onSchedule={handleSchedule} />}
                {activeTab === 'Templates' && <ChecklistEngine templates={MOCK_AUDIT_TEMPLATES} />}
                {activeTab === 'Findings' && <AuditFindings audits={audits} />}
                {activeTab === 'Reports' && <AuditReports audits={audits} />}
            </div>
        </div>
    );
};

export default AuditModule;
