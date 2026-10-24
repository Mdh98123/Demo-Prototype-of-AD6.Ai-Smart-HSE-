const fs = require('fs');
let content = fs.readFileSync('components/LoginPage.tsx', 'utf8');

content = content.replace('w-full gap-3 py-6 text-sm glass-card text-slate-700 border border-slate-200 hover:glass-button hover:text-slate-900 shadow-sm', 'w-full gap-3 py-6 text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm rounded-xl');

fs.writeFileSync('components/LoginPage.tsx', content);
