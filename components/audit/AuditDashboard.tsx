import React from 'react';
import { SafetyAudit, Finding } from './AuditTypes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AlertTriangle, CheckCircle2, Calendar, ClipboardList } from 'lucide-react';

interface Props {
    audits: SafetyAudit[];
}

export const AuditDashboard: React.FC<Props> = ({ audits }) => {
    const totalAudits = audits.length;
    const completed = audits.filter(a => a.status === 'Completed').length;
    const completionRate = totalAudits > 0 ? Math.round((completed / totalAudits) * 100) : 0;
    
    let allFindings: Finding[] = [];
    audits.forEach(a => allFindings = [...allFindings, ...a.findings]);
    
    const openFindings = allFindings.filter(f => !['Closed', 'Rejected'].includes(f.status)).length;
    const criticalFindings = allFindings.filter(f => f.severity === 'Critical' && !['Closed', 'Rejected'].includes(f.status)).length;

    const complianceTrend = [
        { month: 'Jan', score: 82 },
        { month: 'Feb', score: 85 },
        { month: 'Mar', score: 84 },
        { month: 'Apr', score: 88 },
        { month: 'May', score: 92 },
    ];

    const findingSeverity = [
        { name: 'Critical', value: allFindings.filter(f => f.severity === 'Critical').length, color: '#ef4444' },
        { name: 'High', value: allFindings.filter(f => f.severity === 'High').length, color: '#f97316' },
        { name: 'Medium', value: allFindings.filter(f => f.severity === 'Medium').length, color: '#eab308' },
        { name: 'Low', value: allFindings.filter(f => f.severity === 'Low').length, color: '#3b82f6' }
    ].filter(i => i.value > 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Safety Audit Command Center</h2>
                    <p className="text-sm text-slate-500">Real-time oversight of compliance audits and findings</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Audit Completion</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{completionRate}%</p>
                        <p className="text-xs text-brand-600 mt-1">{completed} of {totalAudits} Audits</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                        <CheckCircle2 size={24} />
                    </div>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Open Findings</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{openFindings}</p>
                        <p className="text-xs text-amber-600 mt-1">Pending Corrective Actions</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <ClipboardList size={24} />
                    </div>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Critical Risks</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{criticalFindings}</p>
                        <p className="text-xs text-red-600 mt-1">Requires immediate attention</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Upcoming Audits</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{audits.filter(a => a.status === 'Scheduled').length}</p>
                        <p className="text-xs text-blue-600 mt-1">Scheduled for next 7 days</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Calendar size={24} />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Compliance Score Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={complianceTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Findings Severity</h3>
                    <div className="h-64">
                        {findingSeverity.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={findingSeverity}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {findingSeverity.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No findings data</div>
                        )}
                        
                    </div>
                </div>
            </div>
            
            {/* AI Insights Panel */}
            <div className="bg-gradient-to-r from-brand-50 to-indigo-50 p-6 rounded-xl border border-brand-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertTriangle size={120} />
                </div>
                <h3 className="text-base font-semibold text-brand-900 mb-2 flex items-center gap-2">
                    <span className="bg-brand-600 text-white text-xs px-2 py-1 rounded-md font-bold">AI INSIGHT</span>
                    Predictive Risk Warning
                </h3>
                <p className="text-brand-800 mb-4 max-w-3xl">
                    Based on recent findings, there is a <strong>78% increased probability</strong> of a Working at Heights incident at Site B. Repeated scaffold tag violations detected over the last 3 audits.
                </p>
                <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                    Generate Targeted Audit Plan
                </button>
            </div>
        </div>
    );
};
