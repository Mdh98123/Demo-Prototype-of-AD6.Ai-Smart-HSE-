const fs = require('fs');

let content = fs.readFileSync('components/contractors/ContractorPortal.tsx', 'utf8');

content = content.replace(/\{ type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2025-12-31' \}/g, "{ id: `DOC-${Math.random()}`, title: 'License', filename: 'license.pdf', url: '#', version: 1, uploadDate: '2024-01-01', type: 'TRADE_LICENSE', status: 'VERIFIED', expiryDate: '2025-12-31' }");
content = content.replace(/\{ type: 'INSURANCE', status: 'PENDING', expiryDate: '2024-08-15' \}/g, "{ id: `DOC-${Math.random()}`, title: 'Insurance', filename: 'insurance.pdf', url: '#', version: 1, uploadDate: '2024-01-01', type: 'INSURANCE', status: 'PENDING', expiryDate: '2024-08-15' }");
content = content.replace(/\{ type: 'ISO_CERT', status: 'REJECTED', expiryDate: '2024-01-10' \}/g, "{ id: `DOC-${Math.random()}`, title: 'ISO Cert', filename: 'iso.pdf', url: '#', version: 1, uploadDate: '2024-01-01', type: 'ISO_CERT', status: 'REJECTED', expiryDate: '2024-01-10' }");

fs.writeFileSync('components/contractors/ContractorPortal.tsx', content);

