const fs = require('fs');
let content = fs.readFileSync('components/LoginPage.tsx', 'utf8');

content = content.replace('text-emerald-300', 'text-emerald-600');
content = content.replace('text-indigo-300', 'text-indigo-600');

fs.writeFileSync('components/LoginPage.tsx', content);
