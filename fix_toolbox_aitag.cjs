const fs = require('fs');
let content = fs.readFileSync('components/ToolboxTalksModule.tsx', 'utf8');

const target1 = `<span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">AI Blueprint Ready</span>`;
const replacement1 = `<div className="flex items-center gap-2"><span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">AI Blueprint Ready</span><AITag /></div>`;

content = content.replace(target1, replacement1);

fs.writeFileSync('components/ToolboxTalksModule.tsx', content);
