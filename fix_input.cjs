const fs = require('fs');
let content = fs.readFileSync('components/ui/input.tsx', 'utf8');
content = content.replace('glass-input', 'bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500');
fs.writeFileSync('components/ui/input.tsx', content);
