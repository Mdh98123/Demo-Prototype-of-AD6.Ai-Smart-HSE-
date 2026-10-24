const fs = require('fs');
let content = fs.readFileSync('components/IncidentForm.tsx', 'utf8');

const target1 = `<h4 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">SIF Potential Analysis</h4>`;
const replacement1 = `<div className="flex items-center gap-3 justify-center mb-2"><h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">SIF Potential Analysis</h4><AITag /></div>`;

const target2 = `<div>\n                                                                  <p className={\`text-[10px] font-black uppercase tracking-widest mb-1 \${sifResult.is_sif_potential ? 'text-red-400' : 'text-emerald-400'}\`}>SIF Potential Status</p>`;
const replacement2 = `<div>\n                                                                  <div className="flex items-center gap-2"><p className={\`text-[10px] font-black uppercase tracking-widest mb-1 \${sifResult.is_sif_potential ? 'text-red-400' : 'text-emerald-400'}\`}>SIF Potential Status</p><AITag /></div>`;


const target3 = `<h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Incident Assessment Report</h4>`;
const replacement3 = `<div className="flex items-center justify-between mb-4"><h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Incident Assessment Report</h4><AITag /></div>`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);
content = content.replace(target3, replacement3);

fs.writeFileSync('components/IncidentForm.tsx', content);
