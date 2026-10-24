const fs = require('fs');

let content = fs.readFileSync('components/PermitForm.tsx', 'utf8');

// Replace the mock empty list view with a real list view
const listRender = `
        {viewState === 'List' && (
            <div className="space-y-4">
                {permits.map(permit => (
                    <div key={permit.id} className="glass-card rounded-md shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => { setActivePermit(permit); setViewState('Detail'); }}>
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                                <FileSignature size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800">{permit.id} - {permit.type}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <MapPin size={12} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500">{permit.location}</span>
                                    <span className="text-xs text-slate-300">|</span>
                                    <span className={\`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full \${permit.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : permit.status === 'HSE_Review' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}\`}>{permit.status.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300" />
                    </div>
                ))}
            </div>
        )}
        
        {viewState === 'Detail' && activePermit && (
            <div className="glass-card rounded-md shadow-xl border border-slate-100 p-8 space-y-8 animate-in slide-in-from-right-8 duration-300">
                <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                    <div>
                        <button onClick={() => setViewState('List')} className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 mb-4 flex items-center gap-1"><ChevronRight size={14} className="rotate-180"/> Back to Register</button>
                        <h3 className="text-2xl font-black text-slate-800">{activePermit.id} - {activePermit.type}</h3>
                        <p className="text-sm font-bold text-slate-500 mt-2">{activePermit.description}</p>
                    </div>
                    <span className={\`px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest \${activePermit.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : activePermit.status === 'HSE_Review' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}\`}>{activePermit.status.replace('_', ' ')}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Location & Timing</h4>
                            <div className="bg-slate-50 rounded-md p-4 space-y-3 border border-slate-100">
                                <div className="flex items-center gap-3"><MapPin size={16} className="text-slate-400"/><span className="text-sm font-bold text-slate-700">{activePermit.location}</span></div>
                                <div className="flex items-center gap-3"><Calendar size={16} className="text-slate-400"/><span className="text-sm font-bold text-slate-700">{new Date(activePermit.startTime).toLocaleString()}</span></div>
                                <div className="flex items-center gap-3"><Clock size={16} className="text-slate-400"/><span className="text-sm font-bold text-slate-700">Expires: {new Date(activePermit.endTime).toLocaleString()}</span></div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contractor Details</h4>
                            <div className="bg-slate-50 rounded-md p-4 space-y-3 border border-slate-100">
                                <div className="flex items-center gap-3"><Briefcase size={16} className="text-slate-400"/><span className="text-sm font-bold text-slate-700">{activePermit.contractor}</span></div>
                                <div className="flex items-center gap-3"><Users size={16} className="text-slate-400"/><span className="text-sm font-bold text-slate-700">Crew Size: {activePermit.crewSize}</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">AI Permit Reviewer</h4>
                                <AITag />
                            </div>
                            <div className="bg-indigo-50 border border-indigo-100 rounded-md p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={\`p-2 rounded-full \${activePermit.assessment.riskScore > 70 ? 'bg-red-100 text-red-600' : activePermit.assessment.riskScore > 30 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}\`}>
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculated Risk Score</p>
                                        <p className="text-xl font-black text-slate-800">{activePermit.assessment.riskScore} / 100 ({activePermit.assessment.riskLevel})</p>
                                    </div>
                                </div>
                                <div className="border-t border-indigo-200/50 pt-4">
                                    <p className="text-xs font-bold text-indigo-900 mb-2">AI Analysis & SIMOPS Check:</p>
                                    <p className="text-sm font-medium text-indigo-800/80 leading-relaxed">
                                        This {activePermit.type} permit at {activePermit.location} has been flagged for review. 
                                        {activePermit.type === 'Working at Height' ? " Ensure scaffolding tags are valid and harness points are certified. " : " Check for adjacent active permits to prevent SIMOPS conflicts. "}
                                        The RAMS reference ({activePermit.ramsRef}) appears valid. Require continuous gas monitoring due to the crew size of {activePermit.crewSize}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
`;

content = content.replace(
    /\{viewState === 'List' && \(\s*<div className="glass-card rounded-md shadow-xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-\[400px\]">[\s\S]*?<\/div>\s*\)\}/,
    listRender
);

fs.writeFileSync('components/PermitForm.tsx', content);

