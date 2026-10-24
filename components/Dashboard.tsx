import React, { useState } from 'react';
import { 
    AlertOctagon, ShieldCheck, CheckSquare, ClipboardCheck, Users, Eye, 
    TrendingDown, TrendingUp, AlertTriangle, FileText, 
    Activity, Clock, ShieldAlert, ArrowRight, CheckCircle2
} from 'lucide-react';
import { View } from '../types';

interface Props {
    onNavigate: (view: View, params?: Record<string, any>) => void;
}

const Dashboard: React.FC<Props> = ({ onNavigate }) => {
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">HSE Operations Command Center</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Daily operations monitoring and action management</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="glass-widget p-4 flex flex-col justify-between cursor-pointer hover:border-brand-300 transition-colors" onClick={() => onNavigate(View.INCIDENT_MANAGEMENT)}>
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2"><AlertOctagon size={16} /></div>
                    <p className="text-xs font-semibold text-slate-500">Active Incidents</p>
                    <h4 className="text-xl font-black text-slate-900 mt-1">3</h4>
                </div>
                <div className="glass-widget p-4 flex flex-col justify-between cursor-pointer hover:border-brand-300 transition-colors" onClick={() => onNavigate(View.INCIDENT_MANAGEMENT)}>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2"><AlertTriangle size={16} /></div>
                    <p className="text-xs font-semibold text-slate-500">Near Misses</p>
                    <h4 className="text-xl font-black text-slate-900 mt-1">12</h4>
                </div>
                <div className="glass-widget p-4 flex flex-col justify-between cursor-pointer hover:border-brand-300 transition-colors" onClick={() => onNavigate(View.VISUAL_INSPECTION)}>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2"><Eye size={16} /></div>
                    <p className="text-xs font-semibold text-slate-500">Inspections</p>
                    <h4 className="text-xl font-black text-slate-900 mt-1">45</h4>
                </div>
                <div className="glass-widget p-4 flex flex-col justify-between cursor-pointer hover:border-brand-300 transition-colors" onClick={() => onNavigate(View.SAFETY_AUDIT)}>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2"><ShieldCheck size={16} /></div>
                    <p className="text-xs font-semibold text-slate-500">Audits</p>
                    <h4 className="text-xl font-black text-slate-900 mt-1">8</h4>
                </div>
                <div className="glass-widget p-4 flex flex-col justify-between cursor-pointer hover:border-brand-300 transition-colors" onClick={() => onNavigate(View.PERMIT_TO_WORK)}>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2"><FileText size={16} /></div>
                    <p className="text-xs font-semibold text-slate-500">Active PTWs</p>
                    <h4 className="text-xl font-black text-slate-900 mt-1">24</h4>
                </div>
                <div className="glass-widget p-4 flex flex-col justify-between cursor-pointer hover:border-brand-300 transition-colors" onClick={() => onNavigate(View.WORKFORCE_SAFETY)}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><CheckSquare size={16} /></div>
                    <p className="text-xs font-semibold text-slate-500">Open Actions</p>
                    <h4 className="text-xl font-black text-slate-900 mt-1">156</h4>
                </div>
                <div className="glass-widget p-4 flex flex-col justify-between cursor-pointer hover:border-brand-300 transition-colors" onClick={() => onNavigate(View.TRAINING_COMPETENCY)}>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2"><Users size={16} /></div>
                    <p className="text-xs font-semibold text-slate-500">Training Expiring</p>
                    <h4 className="text-xl font-black text-slate-900 mt-1">42</h4>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Overview */}
                <div className="glass-card rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">Risk Overview</h3>
                        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">Real-time</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex gap-4">
                            <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center shrink-0 shadow-sm text-red-600"><AlertTriangle size={20} /></div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">High-Risk Activity: Confined Space</h4>
                                <p className="text-xs text-slate-600 mt-1">3 active permits in Zone B. Gas detection sensors indicate rising H2S levels. AI recommends immediate ventilation check.</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex gap-4">
                            <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center shrink-0 shadow-sm text-amber-600"><Activity size={20} /></div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Unsafe Trend: PPE Non-compliance</h4>
                                <p className="text-xs text-slate-600 mt-1">Visual inspection AI detected 15 hardhat violations in the last 48 hours at Site Alpha. Safety toolbox talk required.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Management */}
                <div className="glass-card rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">Action Management</h3>
                        <button className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1" onClick={() => onNavigate(View.WORKFORCE_SAFETY)}>
                            View All <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:glass-button transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0"><Clock size={14} /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Repair Scaffolding Platform</p>
                                    <p className="text-xs text-red-600 font-medium">Overdue by 2 days</p>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-slate-500 hover:text-brand-600">Review</button>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:glass-button transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><AlertTriangle size={14} /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Update Excavation RAMS</p>
                                    <p className="text-xs text-amber-600 font-medium">Due Today</p>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-slate-500 hover:text-brand-600">Review</button>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:glass-button transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><CheckCircle2 size={14} /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Verify Harness Certifications</p>
                                    <p className="text-xs text-blue-600 font-medium">Pending Verification</p>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-slate-500 hover:text-brand-600">Verify</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
