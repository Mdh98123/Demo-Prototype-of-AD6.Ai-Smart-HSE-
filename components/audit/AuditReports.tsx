import React, { useState } from 'react';
import { SafetyAudit } from './AuditTypes';
import { FileText, FileSpreadsheet, Download, Filter, FileBarChart, CheckCircle2, AlertTriangle, Target, Clock, RefreshCw } from 'lucide-react';

interface Props {
    audits: SafetyAudit[];
}

export const AuditReports: React.FC<Props> = ({ audits }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'EXCEL' | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Mock mappings to regulations
    const regulatoryMappings = [
        { reg: 'Oman MoL MD 286/2008 v3.1', area: 'Working at Heights', complianceScore: 85, findings: 3, status: 'Needs Review' },
        { reg: 'PDO HSE Standard', area: 'Permit to Work', complianceScore: 92, findings: 1, status: 'Compliant' },
        { reg: 'ISO 45001', area: 'Hazard Identification', complianceScore: 78, findings: 5, status: 'At Risk' },
        { reg: 'PDO SP-1143 53', area: 'Contractor Management', complianceScore: 88, findings: 2, status: 'Compliant' },
    ];

    const generateReport = (format: 'PDF' | 'EXCEL') => {
        setSelectedFormat(format);
        setIsGenerating(true);
        setShowSuccess(false);
        
        // Simulate generation delay
        setTimeout(() => {
            setIsGenerating(false);
            setShowSuccess(true);
            
            // Hide success after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Report Engine</h2>
                    <p className="text-sm text-slate-500">Generate executive summaries and compliance gap analyses</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 glass-card border border-slate-300 text-slate-700 rounded-lg hover:glass-button transition-colors text-sm font-medium shadow-sm">
                        <Filter size={16} /> Filters
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 glass-card border border-slate-300 text-slate-700 rounded-lg hover:glass-button transition-colors text-sm font-medium shadow-sm">
                        <Clock size={16} /> Schedule
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer" onClick={() => generateReport('PDF')}>
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <FileText size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Executive Summary</h3>
                    <p className="text-xs text-slate-500">High-level PDF report for management review.</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600">
                        Generate PDF <Download size={14} />
                    </div>
                </div>

                <div className="glass-card border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer" onClick={() => generateReport('EXCEL')}>
                    <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <FileSpreadsheet size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Detailed Findings Register</h3>
                    <p className="text-xs text-slate-500">Complete Excel export of all raw audit data.</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600">
                        Generate Excel <Download size={14} />
                    </div>
                </div>

                <div className="glass-card border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer" onClick={() => generateReport('PDF')}>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Target size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Compliance Gap Analysis</h3>
                    <p className="text-xs text-slate-500">Mapped against regulatory frameworks.</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600">
                        Generate PDF <Download size={14} />
                    </div>
                </div>

                <div className="glass-card border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer" onClick={() => generateReport('PDF')}>
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <FileBarChart size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">CAPA Aging Report</h3>
                    <p className="text-xs text-slate-500">Status of all open corrective actions.</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600">
                        Generate PDF <Download size={14} />
                    </div>
                </div>
            </div>

            {/* Regulatory Mapping Status */}
            <div className="glass-card border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Regulatory Mapping Preview</h3>
                    <p className="text-sm text-slate-500">Current status mapped to local and international standards</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="glass-panel border-b border-slate-200">
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Framework / Standard</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Focus Area</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Score</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Findings</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {regulatoryMappings.map((mapping, idx) => (
                                <tr key={idx} className="hover:glass-button transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 text-sm">{mapping.reg}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{mapping.area}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                                                <div 
                                                    className={`h-2 rounded-full ${mapping.complianceScore >= 90 ? 'bg-emerald-500' : mapping.complianceScore >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{ width: `${mapping.complianceScore}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{mapping.complianceScore}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {mapping.findings}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${
                                            mapping.status === 'Compliant' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                            mapping.status === 'Needs Review' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                            'bg-red-100 text-red-800 border-red-200'
                                        }`}>
                                            {mapping.status === 'Compliant' && <CheckCircle2 size={12} className="mr-1" />}
                                            {mapping.status === 'Needs Review' && <AlertTriangle size={12} className="mr-1" />}
                                            {mapping.status === 'At Risk' && <AlertTriangle size={12} className="mr-1" />}
                                            {mapping.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generation Overlay */}
            {isGenerating && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card rounded-xl shadow-xl p-8 max-w-sm w-full text-center space-y-4 animate-scale-in">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <RefreshCw size={28} className="animate-spin" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Generating Report</h3>
                        <p className="text-sm text-slate-500">Compiling data, mapping findings to regulations, and applying {selectedFormat} template formatting...</p>
                    </div>
                </div>
            )}

            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed bottom-6 right-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-lg animate-fade-in flex items-start gap-3 max-w-md z-50">
                    <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="font-semibold text-emerald-800 text-sm">{selectedFormat} Report Generated Successfully</h4>
                        <p className="text-xs text-emerald-700 mt-1">The report has been compiled with the latest audit data and regulatory mappings. Download started.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
