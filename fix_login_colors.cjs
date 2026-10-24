const fs = require('fs');
let content = fs.readFileSync('components/LoginPage.tsx', 'utf8');

content = content.replace('<Label className="ms-1">', '<Label className="ms-1 text-slate-700">');
content = content.replace('className="flex-shrink-0 mx-4 text-slate-400', 'className="flex-shrink-0 mx-4 text-slate-500');
content = content.replace('text-xs text-slate-400 mb-2', 'text-xs text-slate-500 mb-2');

fs.writeFileSync('components/LoginPage.tsx', content);
