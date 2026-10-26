const fs = require('fs');

const sites = [
  "Mina Al Fahal Refinery Complex",
  "Jebel Ali Construction Site",
  "Musaffah Industrial Zone",
  "Habshan Gas Complex",
  "Muscat HQ"
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

const now = new Date();
const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

let content = fs.readFileSync('components/RAMSModule.tsx', 'utf8');
let startIdx = content.indexOf('const INITIAL_RAMS: RAMS[] = [');
let endIdx = content.indexOf('];', startIdx) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  const rams = [];
  for (let i = 1; i <= 18; i++) {
    const activity = ['Structural Installation', 'Scaffolding', 'Excavation', 'Electrical Work', 'Confined Space Entry', 'Lifting'][Math.floor(Math.random() * 6)];
    const status = ['Draft', 'Review', 'Approved', 'Archived'][Math.floor(Math.random() * 4)];
    const prob = Math.floor(Math.random() * 5) + 1;
    const sev = Math.floor(Math.random() * 5) + 1;
    const score = prob * sev;
    const riskLevel = score >= 15 ? 'Critical' : score >= 10 ? 'High' : score >= 5 ? 'Medium' : 'Low';
    
    rams.push(`    {
        id: 'RAMS-2${i.toString().padStart(2, '0')}',
        title: '${activity} - Operations ${i}',
        activity: '${activity}',
        version: '1.${Math.floor(Math.random() * 5)}',
        status: '${status}',
        probability: ${prob},
        severity: ${sev},
        riskScore: ${score},
        riskLevel: '${riskLevel}',
        hazards: ['Generated hazard 1', 'Generated hazard 2'],
        controls: ['Generated control 1', 'Generated control 2'],
        briefingLogs: [],
        revisionHistory: []
    }`);
  }
  content = content.substring(0, startIdx) + `const INITIAL_RAMS: RAMS[] = [\n${rams.join(',\n')}\n];` + content.substring(endIdx);
  fs.writeFileSync('components/RAMSModule.tsx', content);
}
