import React, { useState } from 'react';
import { SafetyAudit, AuditTemplate } from './AuditTypes';
import { Mic, Camera, FileText, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';

interface Props {
    audit: SafetyAudit;
    template?: AuditTemplate;
    onBack: () => void;
}

export const AuditExecution: React.FC<Props> = ({ audit, template, onBack }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [aiProcessing, setAiProcessing] = useState(false);
    const [showAiResult, setShowAiResult] = useState(false);

    const simulateAiVoice = () => {
        setIsRecording(true);
        setTimeout(() => {
            setIsRecording(false);
            setAiProcessing(true);
            setTimeout(() => {
                setAiProcessing(false);
                setShowAiResult(true);
            }, 1500);
        }, 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                <button 
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">EXECUTION MODE</span>
                        <h2 className="text-xl font-bold text-slate-800">{audit.title}</h2>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{audit.location} • {template?.name || 'General Template'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    {/* Questions Area */}
                    <div className="glass-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 glass-panel border-b border-slate-200 font-semibold text-slate-700">
                            Checklist Items
                        </div>
                        <div className="p-6 text-center text-slate-500">
                            {template ? (
                                <div className="space-y-6 text-left">
                                    {template.sections.map(sec => (
                                        <div key={sec.id} className="space-y-3">
                                            <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">{sec.name}</h4>
                                            {sec.questions.map((q, i) => (
                                                <div key={q.id} className="p-4 glass-panel rounded-lg border border-slate-200">
                                                    <p className="font-medium text-slate-800">{i + 1}. {q.question}</p>
                                                    <div className="flex gap-2 mt-4">
                                                        <button className="flex-1 py-2 glass-card border border-emerald-500 text-emerald-700 font-medium rounded-lg hover:bg-emerald-50 transition-colors">Pass</button>
                                                        <button className="flex-1 py-2 glass-card border border-red-500 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors">Fail</button>
                                                        <button className="px-3 py-2 glass-card border border-slate-300 text-slate-600 rounded-lg hover:glass-button transition-colors"><Camera size={18} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No template associated with this audit.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* AI Assistant Panel */}
                    <div className="bg-slate-900 rounded-xl p-5 shadow-sm text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldAlert size={80} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">AI Field Assistant</h3>
                        <p className="text-slate-400 text-sm mb-6">Capture findings instantly via voice or image analysis.</p>
                        
                        <div className="space-y-3 relative z-10">
                            <button 
                                onClick={simulateAiVoice}
                                disabled={isRecording || aiProcessing}
                                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : aiProcessing ? 'bg-indigo-500 text-white' : 'glass-card text-slate-900 hover:bg-slate-100'}`}
                            >
                                <Mic size={18} />
                                {isRecording ? 'Listening...' : aiProcessing ? 'Processing AI...' : 'Voice Entry'}
                            </button>
                            <button className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700">
                                <Camera size={18} />
                                Image Inspection
                            </button>
                        </div>
                    </div>

                    {showAiResult && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm animate-fade-in">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-semibold text-emerald-800 text-sm">AI Finding Generated</h4>
                                    <p className="text-xs text-emerald-700 mt-1">"Three workers are not wearing helmets near the excavation area."</p>
                                    <div className="mt-3 glass-card p-3 rounded-lg border border-emerald-100 text-xs space-y-1.5">
                                        <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-medium">PPE Violation</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Risk:</span><span className="font-medium text-red-600">High</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Action:</span><span className="font-medium text-slate-800 truncate pl-2">Stop activity and enforce PPE</span></div>
                                    </div>
                                    <button className="w-full mt-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 transition-colors">
                                        Save Finding
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
