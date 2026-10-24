const fs = require('fs');

const sites = [
  "Ruwais Refinery Complex",
  "Jebel Ali Construction Site",
  "Musaffah Industrial Zone",
  "Habshan Gas Complex",
  "Abu Dhabi HQ"
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

const now = new Date();
const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

// HealthMonitoringModule
try {
  let content = fs.readFileSync('components/HealthMonitoringModule.tsx', 'utf8');
  let startIdx = content.indexOf('const MOCK_RECORDS: HealthRecord[] = [');
  let endIdx = content.indexOf('];', startIdx) + 2;
  if (startIdx !== -1 && endIdx !== -1) {
    const records = [];
    for (let i = 1; i <= 15; i++) {
      const status = ['Fit for Work', 'Fit with Restrictions', 'Unfit'][Math.floor(Math.random() * 3)];
      records.push(`  {
    id: 'MED-${i.toString().padStart(3, '0')}',
    employeeId: 'EMP-${i}',
    employeeName: 'Employee ${i}',
    department: 'Department ${Math.floor(i % 3)}',
    lastCheckup: '${randomDate(ninetyDaysAgo, now).split('T')[0]}',
    nextDue: '${randomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)).split('T')[0]}',
    status: '${status}',
    bloodPressure: '120/80',
    heartRate: ${Math.floor(Math.random() * 40) + 60},
    temperature: 36.5 + Math.random()
  }`);
    }
    content = content.substring(0, startIdx) + `const MOCK_RECORDS: HealthRecord[] = [\n${records.join(',\n')}\n];` + content.substring(endIdx);
    fs.writeFileSync('components/HealthMonitoringModule.tsx', content);
  }
} catch (e) { console.error('HealthMonitoringModule failed', e); }

// TransportModule
try {
  let content = fs.readFileSync('components/TransportModule.tsx', 'utf8');
  let startIdx = content.indexOf('const [vehicles] = useState<Vehicle[]>(');
  let endIdx = content.indexOf(']);', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    const records = [];
    for (let i = 1; i <= 15; i++) {
      const type = ['Truck', 'Bus', 'SUV', 'Van'][Math.floor(Math.random() * 4)];
      const status = ['Active', 'Maintenance', 'Out of Service'][Math.floor(Math.random() * 3)];
      records.push(`    { id: 'V-${i.toString().padStart(3, '0')}', plateNumber: 'AD-${Math.floor(Math.random() * 90000) + 10000}', type: '${type}', status: '${status}', lastInspection: '${randomDate(ninetyDaysAgo, now).split('T')[0]}', nextInspection: '${randomDate(now, new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)).split('T')[0]}' }`);
    }
    content = content.substring(0, startIdx) + `const [vehicles] = useState<Vehicle[]>([\n${records.join(',\n')}\n  ` + content.substring(endIdx);
    fs.writeFileSync('components/TransportModule.tsx', content);
  }
} catch (e) { console.error('TransportModule failed', e); }

// PPEModule
try {
  let content = fs.readFileSync('components/PPEModule.tsx', 'utf8');
  let startIdx = content.indexOf('const [inventory] = useState<PPEItem[]>(');
  let endIdx = content.indexOf(']);', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    const records = [];
    for (let i = 1; i <= 15; i++) {
      const type = ['Hard Hat', 'Safety Glasses', 'Gloves', 'Safety Boots', 'Harness', 'Respirator'][Math.floor(Math.random() * 6)];
      records.push(`    { id: 'PPE-${i.toString().padStart(3, '0')}', name: '${type}', category: 'Category ${i%3}', stock: ${Math.floor(Math.random() * 100)}, required: ${Math.floor(Math.random() * 50) + 50}, lastRestocked: '${randomDate(ninetyDaysAgo, now).split('T')[0]}' }`);
    }
    content = content.substring(0, startIdx) + `const [inventory] = useState<PPEItem[]>([\n${records.join(',\n')}\n  ` + content.substring(endIdx);
    fs.writeFileSync('components/PPEModule.tsx', content);
  }
} catch (e) { console.error('PPEModule failed', e); }

// AuditModule
try {
  let content = fs.readFileSync('components/AuditModule.tsx', 'utf8');
  let startIdx = content.indexOf('const [audits, setAudits] = useState<Audit[]>(');
  let endIdx = content.indexOf(']);', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    const records = [];
    for (let i = 1; i <= 15; i++) {
      const type = ['Internal', 'External', 'ISO 45001', 'ISO 14001'][Math.floor(Math.random() * 4)];
      const status = ['Planned', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)];
      records.push(`    { id: 'AUD-${i.toString().padStart(3, '0')}', title: '${type} Audit ${i}', type: '${type}', status: '${status}', date: '${randomDate(ninetyDaysAgo, new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)).split('T')[0]}', auditor: 'Auditor ${i}', score: ${status === 'Completed' ? Math.floor(Math.random() * 20) + 80 : 0}, findings: ${status === 'Completed' ? Math.floor(Math.random() * 5) : 0} }`);
    }
    content = content.substring(0, startIdx) + `const [audits, setAudits] = useState<Audit[]>([\n${records.join(',\n')}\n  ` + content.substring(endIdx);
    fs.writeFileSync('components/AuditModule.tsx', content);
  }
} catch (e) { console.error('AuditModule failed', e); }

