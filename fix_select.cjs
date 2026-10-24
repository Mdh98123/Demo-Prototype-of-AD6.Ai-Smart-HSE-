const fs = require('fs');
let content = fs.readFileSync('components/SignUpPage.tsx', 'utf8');

content = content.replace(/className={`w-full ps-14 pe-6 py-5 glass-panel border-2 rounded-2xl outline-none transition-all font-bold text-sm text-slate-800 placeholder:text-slate-300 placeholder:font-semibold appearance-none cursor-pointer \${[^`]*}`}/g, 'className={`w-full ps-14 pe-6 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-semibold appearance-none cursor-pointer hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${fieldErrors.department ? \'border-red-500 focus:ring-red-500/20 bg-red-50\' : touched.department && !fieldErrors.department ? \'border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50\' : \'\'}`}');

fs.writeFileSync('components/SignUpPage.tsx', content);
