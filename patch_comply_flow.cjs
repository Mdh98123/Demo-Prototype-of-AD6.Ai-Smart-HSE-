const fs = require('fs');
let content = fs.readFileSync('components/ComplyFlowModule.tsx', 'utf-8');

const reportingTab = `      {activeTab === 'Reporting' as any && (
          <div className="grid grid-cols-1 gap-8">
              <div className="glass-card p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-10">
                  <div className="flex-1 space-y-6">
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Automated Compliance Generation</h3>
                      <p className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed">
                          Utilize the AI Orchestration Engine to instantly compile cross-departmental data into audit-ready regulatory reports.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button className="glass-card bg-slate-50 hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-200 p-6 rounded-3xl transition-all text-start group">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <FileText size={24}/>
                              </div>
                              <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-wider">ISO 45001:2018</h4>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OH&S Performance</p>
                          </button>
                          <button className="glass-card bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-200 p-6 rounded-3xl transition-all text-start group">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <ScrollText size={24}/>
                              </div>
                              <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-wider">OSHA 300 Log</h4>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incident Summary</p>
                          </button>
                      </div>
                  </div>
                  
                  <div className="w-full md:w-80 shrink-0 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col justify-between">
                      <div>
                          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                              <BrainCircuit size={20} className="text-teal-400"/>
                          </div>
                          <h4 className="font-black text-lg mb-2">Ready to compile.</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">
                              The AI will aggregate data from Incidents, Audits, Training, and Observations over the last 12 months.
                          </p>
                      </div>
                      
                      <button className="w-full py-4 mt-8 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black rounded-2xl transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                          Generate Report <ArrowRight size={14} />
                      </button>
                  </div>
              </div>
          </div>
      )}`;

content = content.replace(
  '          </div>\n      )}\n    </div>',
  '          </div>\n      )}\n' + reportingTab + '\n    </div>'
);

fs.writeFileSync('components/ComplyFlowModule.tsx', content);
