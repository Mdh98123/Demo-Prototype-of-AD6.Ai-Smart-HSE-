const fs = require('fs');

let content = fs.readFileSync('components/ContractorPortal.tsx', 'utf8');

// I will just replace the entire mock array for `components/ContractorPortal.tsx`.
const startIdx = content.indexOf('const MOCK_CONTRACTORS: Contractor[] = [');
const endIdx = content.indexOf('];', startIdx) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  const contractors = [];
  for (let i = 1; i <= 15; i++) {
    contractors.push(`  {
    id: 'V-10${i}',
    name: 'Global Heavy Lifting Co ${i}',
    category: 'Crane Operations',
    riskScore: ${Math.floor(Math.random() * 50) + 10},
    complianceStatus: '${['Active', 'Probation', 'Suspended'][Math.floor(Math.random() * 3)]}',
    personnelCount: ${Math.floor(Math.random() * 100) + 10},
    documents: []
  }`);
  }
  content = content.substring(0, startIdx) + `const MOCK_CONTRACTORS: Contractor[] = [\n${contractors.join(',\n')}\n];` + content.substring(endIdx);
  fs.writeFileSync('components/ContractorPortal.tsx', content);
}

