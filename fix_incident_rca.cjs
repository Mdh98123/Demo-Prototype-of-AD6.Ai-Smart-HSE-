const fs = require('fs');
let content = fs.readFileSync('components/IncidentForm.tsx', 'utf8');

const target1 = `<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Hypothesis (5-Whys Analysis)</p>`;
const replacement1 = `<div className="flex items-center gap-2 mb-2"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Hypothesis (5-Whys Analysis)</p><AITag /></div>`;

const target2 = `<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">AI-Generated CAPA Recommendations</p>`;
const replacement2 = `<div className="flex items-center gap-2 mb-2"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI-Generated CAPA Recommendations</p><AITag /></div>`;

const target3 = `<h4 className="text-xl font-black text-slate-800 uppercase">SIF Precursor Prediction</h4>`;
const replacement3 = `<div className="flex justify-between items-center"><h4 className="text-xl font-black text-slate-800 uppercase">SIF Precursor Prediction</h4><AITag /></div>`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);
content = content.replace(target3, replacement3);

fs.writeFileSync('components/IncidentForm.tsx', content);
