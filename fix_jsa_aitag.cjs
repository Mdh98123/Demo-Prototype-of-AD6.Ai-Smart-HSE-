const fs = require('fs');
let content = fs.readFileSync('components/JSAModule.tsx', 'utf8');

const target1 = `<p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-blue-500 ps-4">AI-Powered Job Safety Analysis</p>`;
const replacement1 = `<div className="flex items-center gap-2 mt-2"><p className="text-slate-400 text-xs font-bold uppercase tracking-widest border-s-2 border-blue-500 ps-4">AI-Powered Job Safety Analysis</p><AITag /></div>`;

const target2 = `              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">              <Sparkles className="text-blue-500" size={20} /> Describe Activity            </h3>`;
const replacement2 = `              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">              <Sparkles className="text-blue-500" size={20} /> Describe Activity            </h3><AITag /></div>`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

fs.writeFileSync('components/JSAModule.tsx', content);
