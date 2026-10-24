const fs = require('fs');
let content = fs.readFileSync('components/ui/button.tsx', 'utf8');

content = content.replace('bg-brand-600 text-white hover:bg-brand-700 shadow-md border border-brand-700', 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md border border-indigo-700');

fs.writeFileSync('components/ui/button.tsx', content);
