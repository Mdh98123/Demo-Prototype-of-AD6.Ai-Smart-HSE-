const fs = require('fs');

let content = fs.readFileSync('components/contractors/ContractorPortal.tsx', 'utf8');

// The original script put these at root:
// category: 'Heavy Maintenance',
// incidentCount: X,
// permitComplianceRate: Y,
// lastAuditScore: Z,
// riskScore: 0,
// riskCategory: 'LOW'

content = content.replace(/category: 'Heavy Maintenance',\n/g, "registrationNumber: 'TRD-' + Math.floor(Math.random() * 1000000),\n    contactPerson: { name: 'Admin', email: 'admin@gulf.com', phone: '0501234567' },\n");

content = content.replace(/incidentCount: (\d+),\n\s*permitComplianceRate: (\d+),\n\s*lastAuditScore: (\d+),\n\s*riskScore: 0,\n\s*riskCategory: 'LOW'/g, (match, p1, p2, p3) => {
  return `performance: { incidentCount: ${p1}, inspectionAverage: ${p3}, trainingCompliance: ${p2} }`;
});

fs.writeFileSync('components/contractors/ContractorPortal.tsx', content);

content = fs.readFileSync('components/ContractorPortal.tsx', 'utf8');
content = content.replace(/status: '.*?',\n/g, ''); // just remove status since it's not valid
fs.writeFileSync('components/ContractorPortal.tsx', content);

