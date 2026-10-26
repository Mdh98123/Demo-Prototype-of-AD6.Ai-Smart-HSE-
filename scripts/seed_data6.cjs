const fs = require('fs');

let content = fs.readFileSync('components/contractors/ContractorPortal.tsx', 'utf8');
let startIdx = content.indexOf('const MOCK_CONTRACTORS: ContractorProfile[] = [');
let endIdx = content.indexOf('];', startIdx) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  const contractors = [];
  for (let i = 1; i <= 15; i++) {
    const status = ['ACTIVE', 'PENDING_REVIEW', 'SUSPENDED', 'BLACKLISTED'][Math.floor(Math.random() * 4)];
    contractors.push(`  {
    id: 'C-00${i}',
    name: 'Gulf Technical Services ${i}',
    category: 'Heavy Maintenance',
    status: '${status}',
    documents: [
      { type: 'Commercial License', status: 'VALID', expiryDate: '2025-12-31' },
      { type: 'Workers Compensation', status: 'EXPIRING_SOON', expiryDate: '2024-08-15' },
      { type: 'ISO 45001 Certificate', status: 'EXPIRED', expiryDate: '2024-01-10' }
    ],
    incidentCount: ${Math.floor(Math.random() * 5)},
    permitComplianceRate: ${Math.floor(Math.random() * 20) + 80},
    lastAuditScore: ${Math.floor(Math.random() * 20) + 70},
    riskScore: 0,
    riskCategory: 'Low'
  }`);
  }
  content = content.substring(0, startIdx) + `const MOCK_CONTRACTORS: ContractorProfile[] = [\n${contractors.join(',\n')}\n];` + content.substring(endIdx);
  fs.writeFileSync('components/contractors/ContractorPortal.tsx', content);
}

content = fs.readFileSync('components/ContractorPortal.tsx', 'utf8');
startIdx = content.indexOf('const MOCK_CONTRACTORS: Contractor[] = [');
endIdx = content.indexOf('];', startIdx) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  const contractors = [];
  for (let i = 1; i <= 15; i++) {
    const status = ['Approved', 'Pending', 'Suspended'][Math.floor(Math.random() * 3)];
    contractors.push(`  {
    id: 'V-10${i}',
    name: 'Global Heavy Lifting Co ${i}',
    specialty: 'Crane Operations',
    status: '${status}',
    contactPerson: 'Jane Doe',
    email: 'contact@globalheavy${i}.com',
    phone: '+968 91 123 456',
    insuranceExpiry: '2025-11-30',
    tradeLicenseExpiry: '2026-02-15',
    activeWorkers: ${Math.floor(Math.random() * 100)},
    incidentsYTD: ${Math.floor(Math.random() * 3)},
    auditScore: ${Math.floor(Math.random() * 20) + 80}
  }`);
  }
  content = content.substring(0, startIdx) + `const MOCK_CONTRACTORS: Contractor[] = [\n${contractors.join(',\n')}\n];` + content.substring(endIdx);
  fs.writeFileSync('components/ContractorPortal.tsx', content);
}

