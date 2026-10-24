import React, { useState } from 'react';
import { SafetyAudit, AuditTemplate, AuditorProfile } from './AuditTypes';
import { Plus, Calendar, MapPin, Clock, ArrowRight, BrainCircuit } from 'lucide-react';

interface Props {
    audits: SafetyAudit[];
    templates: AuditTemplate[];
    auditors: AuditorProfile[];
    onSchedule: (audit: Partial<SafetyAudit>) => void;
}

export const AuditPlanner: React.FC<Props> = ({ audits, templates, auditors, onSchedule }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<SafetyAudit>>({
        status: 'Scheduled',
        department: 'Construction',
        score: 0,
        findings: []
    });

    const scheduledAudits = audits.filter(a => ['Draft', 'Scheduled'].includes(a.status));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSchedule({
            ...formData,
            id: `SA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        });
        setShowForm(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Audit Planner & Scheduler</h2>
                    <p className="text-sm text-slate-500">Schedule audits manually or review AI recommendations</p>
                </div>
                <button 
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Schedule Audit
                </button>
            </div>

            {/* AI Recommendation Card */}
            <div className="glass-card border border-indigo-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <BrainCircuit size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-800">AI Scheduling Recommendation</h3>
                        <p className="text-sm text-slate-600 mt-1">Based on previous incidents and overdue actions, it is recommended to schedule a <strong>Fire Safety Audit</strong> at <strong>Warehouse A</strong> within the next 7 days.</p>
                        <div className="mt-4 flex gap-3">
                            <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium rounded-md transition-colors border border-indigo-200">
                                Apply Recommendation
                            </button>
                            <button className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="glass-card p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">New Audit Schedule</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Audit Title</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title || ''}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="e.g. Q3 Site Inspection"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Audit Template</label>
                            <select 
                                required
                                value={formData.templateId || ''}
                                onChange={e => setFormData({...formData, templateId: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            >
                                <option value="">Select Template...</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                            <input 
                                type="text" 
                                required
                                value={formData.location || ''}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="e.g. Zone B"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                            <input 
                                type="date" 
                                required
                                value={formData.scheduledDate || ''}
                                onChange={e => setFormData({...formData, scheduledDate: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Assign Auditor</label>
                            <select 
                                required
                                value={formData.auditorId || ''}
                                onChange={e => {
                                    const auditor = auditors.find(a => a.id === e.target.value);
                                    setFormData({...formData, auditorId: e.target.value, auditorName: auditor?.name});
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            >
                                <option value="">Select Auditor...</option>
                                {auditors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2 flex justify-end gap-3 mt-4">
                            <button 
                                type="button" 
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                            >
                                Schedule
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 glass-panel">
                    <h3 className="font-semibold text-slate-800">Upcoming Audits</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {scheduledAudits.length > 0 ? scheduledAudits.map(audit => (
                        <div key={audit.id} className="p-4 sm:p-6 hover:glass-button transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                    <Calendar className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{audit.title}</h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {audit.location}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {audit.scheduledDate}</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-700">{audit.auditorName}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="flex items-center justify-center gap-1 px-3 py-1.5 text-brand-600 hover:bg-brand-50 rounded-lg text-sm font-medium transition-colors">
                                Edit <ArrowRight size={16} />
                            </button>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-slate-500">
                            No upcoming audits scheduled.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
