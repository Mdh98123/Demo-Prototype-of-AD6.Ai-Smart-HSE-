const fs = require('fs');
let content = fs.readFileSync('components/App.tsx', 'utf8');

content = content.replace(
  /<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-neutral-50\/50">\s*\{\/\* Decorative Background Glows \*\/\}\s*<div className="absolute top-0 start-0 w-\[500px\] h-\[500px\] bg-brand-500\/5 rounded-full blur-3xl pointer-events-none mix-blend-multiply"><\/div>\s*<div className="absolute top-0 end-0 w-\[500px\] h-\[500px\] bg-emerald-500\/5 rounded-full blur-3xl pointer-events-none mix-blend-multiply"><\/div>/,
  '<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">'
);
content = content.replace(
  /<div className="flex h-screen bg-neutral-100 font-sans text-neutral-800">/,
  '<div className="flex h-screen bg-white font-sans text-slate-800">'
);
content = content.replace(
  /<main className="flex-1 overflow-y-auto bg-neutral-50 custom-scrollbar dark:bg-neutral-900">/,
  '<main className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">'
);

fs.writeFileSync('components/App.tsx', content);
