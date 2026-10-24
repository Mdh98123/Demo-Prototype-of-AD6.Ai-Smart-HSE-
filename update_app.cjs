const fs = require('fs');
let content = fs.readFileSync('components/App.tsx', 'utf8');

// Header wrapper
content = content.replace(
  /<header className="h-16 px-6 flex items-center justify-between bg-white\/70 backdrop-blur-xl border border-white shadow-\[0_4px_24px_rgba\(0,0,0,0\.02\)\] rounded-2xl transition-all duration-300">/,
  '<header className="h-16 px-6 flex items-center justify-between bg-white border-b border-gray-200 transition-all duration-300">'
);
content = content.replace(
  /<div className="p-4 md:p-6 pb-2 shrink-0 z-40 sticky top-0">/g,
  '<div className="shrink-0 z-40 sticky top-0">'
);

// Breadcrumbs
content = content.replace(
  /<div className="hidden md:flex items-center text-\[13px\] font-bold text-neutral-400">\s*<div className="p-1\.5 bg-neutral-100 rounded-lg me-2">\s*<LayoutGrid size=\{14\} className="text-brand-500" \/>\s*<\/div>\s*<span className="hover:text-brand-600 cursor-pointer transition-colors">AD6\.AI<\/span>\s*<ChevronRight size=\{14\} className="mx-2 text-neutral-300"\/>\s*<span className="text-neutral-800 font-extrabold tracking-tight animate-fade-in">\{currentView\.replace\(\/_\/g, ' '\)\}<\/span>\s*<\/div>/,
  `<div className="hidden md:flex items-center text-[14px] font-medium text-slate-500">
                   <span className="hover:text-indigo-600 cursor-pointer transition-colors">App</span>
                   <ChevronRight size={14} className="mx-2 text-slate-400 stroke-2"/>
                   <span className="text-slate-900 font-black tracking-tight animate-fade-in uppercase">{currentView.replace(/_/g, ' ')}</span>
                </div>`
);

// Search Bar
content = content.replace(
  /className="hidden lg:flex items-center justify-between w-64 px-3 py-1\.5 bg-neutral-100\/60 hover:bg-neutral-100\/80 border border-transparent rounded-xl text-\[13px\] text-neutral-400 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-brand-500\/10 focus:border-brand-500\/30"/,
  'className="hidden lg:flex items-center justify-between w-80 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full text-[13px] text-slate-400 font-medium transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30"'
);

// AI Chat Button
content = content.replace(
  /<button \s*onClick=\{\(\) => window\.dispatchEvent\(new Event\('open-ai-chat'\)\)\}\s*className="hidden md:flex items-center gap-2 px-3 py-1\.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl shadow-\[0_0_15px_rgba\(59,130,246,0\.4\)\] transition-all duration-300 hover:scale-105 active:scale-95 group relative overflow-hidden"\s*>\s*<div className="absolute inset-0 bg-white\/20 animate-\[shimmer_2s_infinite\] -skew-x-12"><\/div>\s*<Zap size=\{14\} className="group-hover:animate-bounce relative z-10" fill="currentColor"\/>\s*<span className="text-\[13px\] font-bold tracking-wide relative z-10">Ask AI<\/span>\s*<\/button>/,
  ''
);

// Remove Dark mode
content = content.replace(
  /<button \s*onClick=\{\(\) => document\.documentElement\.classList\.toggle\('dark'\)\} \s*className="p-2 text-neutral-500 hover:text-brand-600 hover:bg-neutral-100 rounded-xl transition-all active:scale-95 border border-transparent hover:border-neutral-200"\s*title="Dark Mode \/ الوضع المظلم"\s*>\s*<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"\/><\/svg>\s*<\/button>/,
  `<button onClick={() => {}} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all active:scale-95 border border-transparent">
                    <HelpCircle size={20} />
                 </button>`
);

content = content.replace(
  /<div className="h-6 w-px bg-neutral-200 mx-1"><\/div>/,
  '<div className="h-6 w-px bg-slate-200 mx-1"></div>'
);

fs.writeFileSync('components/App.tsx', content);
