import React, { useState } from 'react';
import { AuditTemplate, AuditSection, AuditQuestion } from './AuditTypes';
import { Plus, Edit2, Trash2, Save, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
    templates: AuditTemplate[];
}

export const ChecklistEngine: React.FC<Props> = ({ templates }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<AuditTemplate | null>(null);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-14rem)] animate-fade-in">
            {/* Sidebar */}
            <div className="w-full lg:w-80 glass-card rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
                <div className="p-4 border-b border-slate-200 glass-panel flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">Templates</h3>
                    <button className="p-1 text-brand-600 hover:bg-brand-50 rounded">
                        <Plus size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {templates.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setSelectedTemplate(t)}
                            className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-start gap-3 ${selectedTemplate?.id === t.id ? 'bg-brand-50 border border-brand-200' : 'hover:glass-button border border-transparent'}`}
                        >
                            <FileText className={selectedTemplate?.id === t.id ? 'text-brand-600' : 'text-slate-400'} size={20} />
                            <div>
                                <div className={`text-sm font-medium ${selectedTemplate?.id === t.id ? 'text-brand-900' : 'text-slate-700'}`}>{t.name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{t.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 glass-card rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {selectedTemplate ? (
                    <>
                        <div className="p-5 border-b border-slate-200 glass-panel flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{selectedTemplate.name}</h2>
                                <p className="text-sm text-slate-500 mt-1">{selectedTemplate.description}</p>
                                <div className="flex gap-2 mt-3">
                                    {selectedTemplate.frameworks.map(f => (
                                        <span key={f} className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-md">{f}</span>
                                    ))}
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {selectedTemplate.sections.map((section, sIndex) => (
                                <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="bg-slate-100 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                                        <h3 className="font-semibold text-slate-800">Section {sIndex + 1}: {section.name}</h3>
                                        <div className="flex gap-2">
                                            <button className="p-1.5 text-slate-500 hover:text-brand-600 hover:glass-card rounded"><Edit2 size={16} /></button>
                                            <button className="p-1.5 text-slate-500 hover:text-red-600 hover:glass-card rounded"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {section.questions.map((q, qIndex) => (
                                            <div key={q.id} className="p-4 hover:glass-button transition-colors group">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{qIndex + 1}. {q.question}</p>
                                                        <p className="text-xs text-slate-500 mt-1">Guidance: {q.guidance}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded border border-slate-200">
                                                            {q.type}
                                                        </span>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                            <button className="p-1 text-slate-400 hover:text-brand-600"><Edit2 size={14} /></button>
                                                            <button className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-3 glass-panel text-center">
                                            <button className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
                                                <Plus size={16} /> Add Question
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:glass-button hover:border-slate-400 hover:text-slate-700 transition-all flex items-center justify-center gap-2">
                                <Plus size={20} /> Add New Section
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                        <CheckCircle2 size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-700">Digital Checklist Builder</h3>
                        <p className="text-sm mt-2 max-w-md">Select a template from the left to view or edit its structure, or create a new one. Templates support dynamic question types, weighting, and compliance mapping.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
