const fs = require('fs');
let content = fs.readFileSync('components/LoginPage.tsx', 'utf8');

// Update main wrapper
content = content.replace('min-h-screen w-full flex glass-panel font-sans text-slate-900 overflow-hidden', 'min-h-screen w-full flex bg-slate-50 font-sans text-slate-900 overflow-hidden');

// Update Left Panel overlay to look more light/enterprise or keep it dark but clean. Usually enterprise is dark navy.
// Let's keep the dark left panel but make it more navy/professional
content = content.replace('from-slate-900/90 via-slate-900/80 to-indigo-900/40', 'from-brand-900/95 via-brand-900/90 to-brand-800/80');

// Update Right panel from glass-card to solid white
content = content.replace('w-full lg:w-1/2 flex items-center justify-center p-8 glass-card', 'w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:rounded-l-3xl shadow-2xl z-10');

// Update text colors for visibility
content = content.replace('text-slate-500 mt-3', 'text-slate-600 mt-3');

// Update input styles
content = content.replace('className={`ps-14 ${fieldErrors.email ? \'border-red-500 focus-visible:ring-red-500 bg-red-50/5\' : touched.email && !fieldErrors.email ? \'border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50/5\' : \'\'}`}', 'className={`bg-slate-50 border-slate-200 text-slate-900 ps-14 ${fieldErrors.email ? \'border-red-500 focus-visible:ring-red-500 bg-red-50\' : touched.email && !fieldErrors.email ? \'border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50\' : \'\'}`}');

content = content.replace('text-slate-400 group-focus-within:text-indigo-600', 'text-slate-400 group-focus-within:text-brand-600');

content = content.replace('text-indigo-600 font-bold hover:text-indigo-800', 'text-brand-700 font-bold hover:text-brand-900');
content = content.replace('bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100', 'bg-brand-50 border border-brand-100 text-brand-700 hover:bg-brand-100');

fs.writeFileSync('components/LoginPage.tsx', content);
