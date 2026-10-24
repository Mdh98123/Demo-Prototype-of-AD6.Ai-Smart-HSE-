const fs = require('fs');
let content = fs.readFileSync('components/App.tsx', 'utf8');

content = content.replace(/<div className="flex h-screen bg-transparent font-sans text-slate-800">/, '<div className="flex h-screen bg-transparent font-sans text-slate-800" dir={dir}>');

fs.writeFileSync('components/App.tsx', content);
