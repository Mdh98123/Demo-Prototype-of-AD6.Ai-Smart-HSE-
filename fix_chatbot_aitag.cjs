const fs = require('fs');
let content = fs.readFileSync('components/ChatBot.tsx', 'utf8');

const headerTarget = `              <p className="text-indigo-100 text-[10px] uppercase tracking-widest font-bold mt-0.5">Enterprise AI Assistant</p>`;
const replacement = `              <p className="text-indigo-100 text-[10px] uppercase tracking-widest font-bold mt-0.5">Enterprise AI Assistant</p>\n              <div className="mt-2"><AITag /></div>`;

content = content.replace(headerTarget, replacement);
fs.writeFileSync('components/ChatBot.tsx', content);
