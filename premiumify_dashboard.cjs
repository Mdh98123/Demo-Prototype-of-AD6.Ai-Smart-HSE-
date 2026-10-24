const fs = require('fs');
const path = './components/Dashboard.tsx';

let code = fs.readFileSync(path, 'utf8');

// Replace standard rounded-md with rounded-2xl
code = code.replace(/rounded-md/g, 'rounded-2xl');

// Upgrade card styles
code = code.replace(/bg-white p-4 rounded-2xl shadow-card border border-slate-100/g, 'bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-float border border-white/50 dark:bg-neutral-900/50 dark:border-white/5');

// Upgrade inner cards
code = code.replace(/bg-slate-50/g, 'bg-slate-50/50 dark:bg-neutral-800/30');
code = code.replace(/border-slate-100/g, 'border-slate-200/50 dark:border-neutral-700/50');
code = code.replace(/border-slate-50/g, 'border-slate-200/50 dark:border-neutral-700/50');

// Typography polish
code = code.replace(/text-slate-800/g, 'text-slate-900 dark:text-neutral-100');
code = code.replace(/text-slate-700/g, 'text-slate-800 dark:text-neutral-200');
code = code.replace(/text-slate-500/g, 'text-slate-500 dark:text-neutral-400');
code = code.replace(/text-slate-400/g, 'text-slate-400 dark:text-neutral-500');

fs.writeFileSync(path, code);
console.log('Premiumized Dashboard classes.');
