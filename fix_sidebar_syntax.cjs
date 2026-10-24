const fs = require('fs');
let content = fs.readFileSync('components/Sidebar.tsx', 'utf8');

content = content.replace("];];", "];");

fs.writeFileSync('components/Sidebar.tsx', content);
console.log("Fixed syntax error");
