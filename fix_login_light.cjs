const fs = require('fs');
let content = fs.readFileSync('components/LoginPage.tsx', 'utf8');

// Replace left panel text-white
content = content.replace('p-16 text-white', 'p-16 text-slate-900');

// Replace overlays
content = content.replace(
  '<div className="absolute inset-0 bg-gradient-to-br from-brand-900/95 via-brand-900/90 to-brand-800/80 mix-blend-multiply" />',
  '<div className="absolute inset-0 bg-gradient-to-br from-white/95 via-slate-50/95 to-brand-50/90 backdrop-blur-[2px]" />'
);
content = content.replace(
  '<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />',
  '<div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 via-transparent to-transparent opacity-60" />'
);

// Replace icon background
content = content.replace(
  'glass-card/10 backdrop-blur-md border border-white/20',
  'bg-white shadow-md border border-slate-200'
);
content = content.replace(
  '<span className="text-2xl font-bold tracking-tight text-white">AD6.Ai</span>',
  '<span className="text-2xl font-black tracking-tighter text-brand-900">AD6.Ai</span>'
);

content = content.replace(
  '<h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-6 drop-shadow-lg">',
  '<h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900">'
);
content = content.replace(
  '<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">',
  '<span className="text-brand-600">'
);
content = content.replace(
  '<p className="text-slate-200 text-lg max-w-lg leading-relaxed font-medium drop-shadow-md">',
  '<p className="text-slate-600 text-lg max-w-lg leading-relaxed font-medium">'
);

// Feature cards
content = content.replace(
  /glass-card\/10 border border-white\/10 backdrop-blur-md/g,
  'bg-white border border-slate-200 shadow-sm'
);
content = content.replace(
  /hover:glass-card\/15/g,
  'hover:shadow-md'
);
content = content.replace(
  /<h3 className="font-bold text-white text-base">/g,
  '<h3 className="font-bold text-slate-900 text-base">'
);
content = content.replace(
  /<p className="text-xs text-slate-300 mt-1 font-medium">/g,
  '<p className="text-xs text-slate-500 mt-1 font-medium">'
);

// Footer links
content = content.replace(
  'text-slate-400/80',
  'text-slate-500'
);
content = content.replace(
  /hover:text-white/g,
  'hover:text-brand-900'
);

fs.writeFileSync('components/LoginPage.tsx', content);
