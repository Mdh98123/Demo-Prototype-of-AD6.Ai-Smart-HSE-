const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

// Dashboard Header (Executive Overview, Buttons)
content = content.replace(
  /<div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g,
  content.match(/<div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)[0]
); // Actually let's just do targeted replacements.

// The buttons and title are around line 793
content = content.replace(
  /bg-white border border-neutral-200 text-neutral-600 rounded-md px-5 py-2\.5 text-xs font-bold shadow-sm hover:bg-neutral-50/g,
  'bg-white border border-slate-200 text-slate-700 rounded-full px-5 py-2 text-xs font-bold hover:bg-slate-50 shadow-sm'
);

content = content.replace(
  /bg-indigo-600 text-white rounded-md px-5 py-2\.5 text-xs font-bold shadow-lg hover:bg-indigo-700/g,
  'bg-indigo-600 text-white rounded-full px-5 py-2 text-xs font-bold border border-indigo-600 hover:bg-indigo-700 shadow-sm'
);

// Hero stats section
content = content.replace(
  /<div className="bg-\[#0f172a\] rounded-md p-4 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">/g,
  '<div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">'
);

content = content.replace(
  /<div className="bg-emerald-500 p-4 rounded-md shadow-lg shadow-emerald-500\/30 animate-pulse-soft">/g,
  '<div className="bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-500/30">'
);

// Pilly shapes for lagging
content = content.replace(
  /p-4 rounded-md border border-neutral-100 shadow-sm flex flex-col items-center justify-center/g,
  'p-3 rounded-2xl flex flex-col items-center justify-center'
);

content = content.replace(
  /shadow-xl border border-neutral-100/g,
  'shadow-sm border border-slate-100 rounded-3xl'
);
content = content.replace(
  /bg-white\/70 backdrop-blur-xl p-6 rounded-3xl shadow-float border border-white\/50/g,
  'bg-white p-6 rounded-3xl shadow-sm border border-slate-100'
);

fs.writeFileSync('components/Dashboard.tsx', content);
