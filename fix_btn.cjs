const fs = require('fs');
let content = fs.readFileSync('components/ui/button.tsx', 'utf8');

content = content.replace('bg-brand-600/90 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 border-brand-500/50 backdrop-blur-md', 'bg-brand-600 text-white hover:bg-brand-700 shadow-md border border-brand-700');

fs.writeFileSync('components/ui/button.tsx', content);
