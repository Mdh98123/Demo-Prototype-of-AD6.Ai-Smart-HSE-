const fs = require('fs');

let content = fs.readFileSync('components/ContractorPortal.tsx', 'utf8');
content = content.replace(/contactPerson: '.*?',\n/g, '');
content = content.replace(/email: '.*?',\n/g, '');
content = content.replace(/phone: '.*?',\n/g, '');
fs.writeFileSync('components/ContractorPortal.tsx', content);

