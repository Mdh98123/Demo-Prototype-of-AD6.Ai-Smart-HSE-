const fs = require('fs');
let content = fs.readFileSync('components/SignUpPage.tsx', 'utf8');

// Container
content = content.replace('glass-panel', 'bg-slate-50');

// Left panel
content = content.replace('bg-slate-950', 'bg-slate-50');
content = content.replace('text-white overflow-hidden', 'text-slate-900 overflow-hidden');

// Overlays
content = content.replace(
  'bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen',
  'bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply'
);
content = content.replace(
  'bg-emerald-900/30 rounded-full blur-[100px] mix-blend-screen',
  'bg-emerald-500/10 rounded-full blur-[100px] mix-blend-multiply'
);

content = content.replace('fill-white/10', 'fill-white/20');
content = content.replace('text-white">AD6.Ai', 'text-brand-900">AD6.Ai');
content = content.replace('text-indigo-400', 'text-brand-600');
content = content.replace('<span className="text-white">Join the Future', '<span className="text-slate-900">Join the Future');
content = content.replace('from-indigo-400 via-emerald-200 to-white', 'from-brand-600 via-emerald-500 to-teal-500');
content = content.replace('text-slate-400', 'text-slate-600');
content = content.replace('text-white text-sm', 'text-slate-900 text-sm');

content = content.replace(
  'group glass-card/5 backdrop-blur-sm border border-white/5',
  'bg-white border border-slate-200 shadow-sm'
);
content = content.replace(
  'hover:glass-card/10 hover:border-white/10',
  'hover:shadow-md hover:border-slate-300'
);

content = content.replace('text-indigo-200/70', 'text-brand-600/70');
content = content.replace('border-white/5', 'border-slate-200');

// Right panel
content = content.replace('p-8 lg:p-24 glass-card relative', 'p-8 lg:p-24 bg-white lg:rounded-l-3xl shadow-2xl z-10 relative');

content = content.replace(/text-slate-500 font-medium text-lg/g, 'text-slate-600 font-medium text-lg');

// Labels
content = content.replace(/<Label>/g, '<Label className="text-slate-700">');

// Icons
content = content.replace(/text-slate-300 group-focus-within:text-indigo-600/g, 'text-slate-400 group-focus-within:text-brand-600');

// Inputs
content = content.replace(/className={`ps-14 \${fieldErrors\.name \? 'border-red-500 focus-visible:ring-red-500 bg-red-50\/10' : touched\.name && !fieldErrors\.name \? 'border-emerald-200 bg-emerald-50\/10 focus-visible:ring-emerald-500' : ''}`}/g, 'className={`bg-slate-50 border-slate-200 text-slate-900 ps-14 ${fieldErrors.name ? \'border-red-500 focus-visible:ring-red-500 bg-red-50\' : touched.name && !fieldErrors.name ? \'border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50\' : \'\'}`}');

content = content.replace(/className={`ps-14 \${fieldErrors\.email \? 'border-red-500 focus-visible:ring-red-500 bg-red-50\/10' : touched\.email && !fieldErrors\.email \? 'border-emerald-200 bg-emerald-50\/10 focus-visible:ring-emerald-500' : ''}`}/g, 'className={`bg-slate-50 border-slate-200 text-slate-900 ps-14 ${fieldErrors.email ? \'border-red-500 focus-visible:ring-red-500 bg-red-50\' : touched.email && !fieldErrors.email ? \'border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50\' : \'\'}`}');

content = content.replace(/className={`bg-slate-900\/5 border-white\/10 ps-14 \${fieldErrors\.department \? 'border-red-500 focus-visible:ring-red-500 bg-red-50\/10' : touched\.department && !fieldErrors\.department \? 'border-emerald-200 bg-emerald-50\/10 focus-visible:ring-emerald-500' : ''}`}/g, 'className={`bg-slate-50 border-slate-200 text-slate-900 ps-14 ${fieldErrors.department ? \'border-red-500 focus-visible:ring-red-500 bg-red-50\' : touched.department && !fieldErrors.department ? \'border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50\' : \'\'}`}');

// Buttons & Links
content = content.replace('hover:bg-slate-100', 'hover:bg-slate-50');
content = content.replace('text-indigo-600', 'text-brand-700');
content = content.replace('hover:text-indigo-800', 'hover:text-brand-900');

fs.writeFileSync('components/SignUpPage.tsx', content);
