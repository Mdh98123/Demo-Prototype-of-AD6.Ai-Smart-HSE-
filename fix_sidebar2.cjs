const fs = require('fs');
let content = fs.readFileSync('components/Sidebar.tsx', 'utf8');
content = content.replace('fixed inset-y-0 start-0 z-50 bg-neutral-950 border-e border-white/5 transition-all duration-300 ease-in-out flex flex-col overflow-x-hidden', 'bg-neutral-950 border-e border-white/5 transition-all duration-300 ease-in-out flex flex-col overflow-x-hidden');
fs.writeFileSync('components/Sidebar.tsx', content);
