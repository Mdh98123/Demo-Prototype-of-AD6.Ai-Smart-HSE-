const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

content = content.replace(
  /bg-\[#f3f2f1\]0 rounded-sm/g,
  'bg-indigo-500 rounded-sm'
);

fs.writeFileSync('components/Dashboard.tsx', content);
