const fs = require('fs');
let content = fs.readFileSync('components/contractors/ContractorPortal.tsx', 'utf8');

content = content.replace(/filecompanyName:/g, 'filename:');

fs.writeFileSync('components/contractors/ContractorPortal.tsx', content);

