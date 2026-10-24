const fs = require('fs');
let content = fs.readFileSync('components/ChatBot.tsx', 'utf8');

content = content.replace(
  /<button \s*onClick=\{\(\) => setIsOpen\(true\)\}\s*className="fixed bottom-6 end-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-110 z-50 flex items-center gap-2 group"\s*>\s*<div className="relative">\s*<MessageSquare size=\{24\} \/>\s*<div className="absolute -top-1 -end-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"><\/div>\s*<\/div>\s*<span className="font-bold tracking-tight">Ask Safi AI<\/span>\s*<Sparkles size=\{16\} className="text-amber-400 animate-pulse" \/>\s*<\/button>/g,
  `<button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 end-6 bg-slate-900 text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 z-50 flex items-center gap-2.5 group"
      >
        <MessageSquare size={20} className="text-white" />
        <span className="font-bold text-sm tracking-wide">Ask Safi AI</span>
        <Sparkles size={16} className="text-amber-400 group-hover:animate-spin" />
      </button>`
);

fs.writeFileSync('components/ChatBot.tsx', content);
