const fs = require('fs');
let content = fs.readFileSync('components/system/ExecutiveDashboard.tsx', 'utf8');

if(!content.includes('import { AITag }')) {
    content = content.replace(/import React/, "import { AITag } from '../AITag';\nimport React");
}

const target = `<h3 className="font-bold text-lg text-indigo-50 flex items-center gap-2">\n                            AI Executive Insights`;
const replacement = `<h3 className="font-bold text-lg text-indigo-50 flex items-center gap-2">\n                            AI Executive Insights <AITag />`;

content = content.replace(target, replacement);

fs.writeFileSync('components/system/ExecutiveDashboard.tsx', content);
