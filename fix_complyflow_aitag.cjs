const fs = require('fs');
let content = fs.readFileSync('components/ComplyFlowModule.tsx', 'utf8');

const target = `<h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Automated Compliance Generation</h3>`;
const replacement = `<div className="flex items-center gap-3"><h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Automated Compliance Generation</h3><AITag /></div>`;

content = content.replace(target, replacement);

fs.writeFileSync('components/ComplyFlowModule.tsx', content);
