const fs = require('fs');
let content = fs.readFileSync('components/Sidebar.tsx', 'utf8');

// Container classes
content = content.replace(
  /group bg-neutral-950 border-e border-white\/5 transition-all duration-300 ease-in-out flex flex-col overflow-x-hidden\s*\n\s*\$\{isOpen \? 'translate-x-0 w-72' : 'translate-x-0 w-20 lg:w-20 hover:w-72'\} relative shadow-\[4px_0_24px_rgba\(0,0,0,0\.5\)\] lg:shadow-none bg-neutral-950 z-\[60\]/,
  "group bg-white border-e border-slate-200 transition-all duration-300 ease-in-out flex flex-col overflow-x-hidden ${isOpen ? 'translate-x-0 w-72' : 'translate-x-0 w-20 lg:w-20 hover:w-72'} relative shadow-[4px_0_12px_rgba(0,0,0,0.05)] lg:shadow-none z-[60]"
);

// Logo Header Area
content = content.replace(
  /<div className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-brand-500\/20 bg-gradient-to-b from-white\/5 to-transparent shrink-0">([\s\S]*?)<\/div>\s*\{onClose/g,
  `<div className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-slate-100 bg-white shrink-0">
            <div className={\`flex items-center gap-3 transition-opacity duration-300\`}>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                 <Zap size={20} className="text-white fill-white" />
              </div>
              <div className={\`flex flex-col whitespace-nowrap transition-opacity duration-300 \${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}>
                <span className="font-bold text-xl text-slate-900 tracking-tight leading-tight">AD6<span className="text-indigo-600">.Ai</span></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-tight">Enterprise HSE</span>
              </div>
            </div>
            {onClose`
);

// Mobile Hamburger hover
content = content.replace(
  /text-neutral-400 hover:text-white rounded-lg bg-white\/5 hover:bg-white\/10 border border-white\/5/g,
  "text-slate-400 hover:text-slate-900 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100"
);

// Nav section headers
content = content.replace(
  /text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2 whitespace-nowrap transition-opacity duration-300 \$\{isOpen \? 'opacity-100' : 'opacity-0 group-hover:opacity-100'\}/g,
  "text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}"
);
content = content.replace(
  /<div className="flex-1 h-px bg-gradient-to-r from-white\/5 to-transparent"><\/div>/g,
  ''
);

// Nav Buttons
content = content.replace(
  /\${ \s*isParentActive\s*\?\s*'bg-gradient-to-r from-brand-500\/20 to-transparent text-white shadow-\[inset_4px_0_0_rgba\(59,130,246,1\)\]'\s*:\s*'text-neutral-400 hover:text-neutral-100 hover:bg-white\/5'\s*\}/g,
  "${isParentActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}"
);

// Nav Icons
content = content.replace(
  /text-brand-400' : 'text-neutral-500 group-hover\/btn:text-neutral-300'/g,
  "text-white' : 'text-slate-400 group-hover/btn:text-indigo-600'"
);

// Badges
content = content.replace(
  /bg-brand-500\/20 text-brand-400 border border-brand-500\/30' : 'bg-white\/10 text-neutral-300'/g,
  "bg-white/20 text-white border border-white/30' : 'bg-indigo-100 text-indigo-600'"
);

// Children Container
content = content.replace(
  /border-s border-white\/5 space-y-1 mt-1 mb-2 animate-slide-up origin-top transition-opacity/g,
  "border-s-2 border-slate-100 space-y-1 mt-1 mb-2 animate-slide-up origin-top transition-opacity"
);

// Children buttons
content = content.replace(
  /'text-brand-400 bg-white\/5 shadow-sm' \s*:\s*'text-neutral-500 hover:text-neutral-200 hover:bg-white\/5'/g,
  "'text-indigo-600 bg-indigo-50 font-bold shadow-sm' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'"
);

// Bottom Section
content = content.replace(
  /<div className="p-4 lg:p-5 border-t border-white\/10 bg-neutral-900\/50 overflow-hidden">/g,
  '<div className="p-4 lg:p-5 border-t border-slate-100 bg-white overflow-hidden">'
);

// Contractors Card
content = content.replace(
  /<div className=\{`relative overflow-hidden rounded-2xl p-4 border border-white\/10 mb-5 group\/card transition-opacity duration-300 \$\{isOpen \? 'opacity-100' : 'opacity-0 hidden group-hover:block group-hover:opacity-100'\}`\}>\s*<div className="absolute inset-0 bg-gradient-to-br from-brand-600\/10 to-transparent"><\/div>\s*<div className="absolute inset-0 bg-\[url\('https:\/\/www.transparenttextures.com\/patterns\/cubes.png'\)\] opacity-10"><\/div>\s*<div className="flex items-center gap-3 relative z-10">\s*<div className="w-10 h-10 shrink-0 bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-xl flex items-center justify-center shadow-\[0_4px_20px_rgba\(59,130,246,0.4\)\] group-hover\/card:scale-105 transition-transform">\s*<ShieldCheck size=\{20\} \/>\s*<\/div>\s*<div className="whitespace-nowrap">\s*<h4 className="font-bold text-white text-\[13px\]">AD6 Contractors<\/h4>\s*<p className="text-\[10px\] text-brand-400 font-bold uppercase tracking-wide">Enterprise Level<\/p>\s*<\/div>\s*<\/div>\s*<\/div>/g,
  `<div className={\`relative overflow-hidden rounded-2xl p-4 border border-indigo-100 bg-indigo-50 mb-3 group/card transition-opacity duration-300 \${isOpen ? 'opacity-100' : 'opacity-0 hidden group-hover:block group-hover:opacity-100'}\`}>
             <div className="flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 shrink-0 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md group-hover/card:scale-105 transition-transform">
                 <ShieldCheck size={20} />
               </div>
               <div className="whitespace-nowrap">
                 <h4 className="font-bold text-indigo-900 text-[13px]">AD6 Contractors</h4>
                 <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">Enterprise License</p>
               </div>
             </div>
          </div>`
);

// User/Demo Access Profile part
// Based on the reference image, the bottom area has a generic profile, but wait - the actual user is at the top right in the ref image!
// The bottom left in the image is "Demo Access - Explore Personas"
content = content.replace(
  /<div className="flex items-center gap-3 px-1 group\/user cursor-default">[\s\S]*?<\/div>\s*<\/div>/g,
  `<div className={\`flex items-center gap-3 p-3 rounded-2xl bg-slate-900 text-white group/user cursor-pointer shadow-lg transition-all \${isOpen ? 'opacity-100' : 'opacity-0 hidden group-hover:flex group-hover:opacity-100'}\`}>
             <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white ring-2 ring-slate-800 transition-all shadow-md">
                <Users size={20} />
             </div>
             <div className="flex-1 min-w-0 transition-opacity duration-300 whitespace-nowrap">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Demo Access</p>
               <p className="text-[13px] font-bold text-white truncate">Explore Personas</p>
             </div>
          </div>
        </div>`
);

fs.writeFileSync('components/Sidebar.tsx', content);
