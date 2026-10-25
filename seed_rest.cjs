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

// EmergencyModule
try {
  let content = fs.readFileSync('components/EmergencyModule.tsx', 'utf8');
  let startIdx = content.indexOf('const [drills] = useState<EmergencyDrill[]>(');
  let endIdx = content.indexOf(']);', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    const drills = [];
    for (let i = 1; i <= 15; i++) {
      const type = ['Fire Evacuation', 'Chemical Spill', 'Man Overboard', 'Medical Emergency', 'Confined Space Rescue'][Math.floor(Math.random() * 5)];
      const loc = sites[Math.floor(Math.random() * sites.length)];
      const outcome = ['Successful', 'Needs Improvement'][Math.floor(Math.random() * 2)];
      drills.push(`    { id: '${i}', type: '${type}', date: '${randomDate(ninetyDaysAgo, now).split('T')[0]}', location: '${loc}', outcome: '${outcome}', timeTakenMinutes: ${Math.floor(Math.random() * 15) + 3}, participants: ${Math.floor(Math.random() * 50) + 10} }`);
    }
    content = content.substring(0, startIdx) + `const [drills] = useState<EmergencyDrill[]>([\n${drills.join(',\n')}\n  ` + content.substring(endIdx);
    fs.writeFileSync('components/EmergencyModule.tsx', content);
  }
} catch (e) { console.error('EmergencyModule failed', e); }

// EnvironmentalModule
try {
  let content = fs.readFileSync('components/EnvironmentalModule.tsx', 'utf8');
  let startIdx = content.indexOf('const [readings] = useState<EnvironmentalReading[]>(');
  let endIdx = content.indexOf(']);', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    const readings = [];
    for (let i = 1; i <= 15; i++) {
      const type = ['Air Quality', 'Noise Level', 'Water Quality', 'Waste Volume'][Math.floor(Math.random() * 4)];
      const loc = sites[Math.floor(Math.random() * sites.length)];
      readings.push(`    { id: '${i}', type: '${type}', value: ${Math.floor(Math.random() * 100)}, unit: 'unit', location: '${loc}', timestamp: '${randomDate(ninetyDaysAgo, now)}', status: '${['Normal', 'Warning', 'Critical'][Math.floor(Math.random() * 3)]}' }`);
    }
    content = content.substring(0, startIdx) + `const [readings] = useState<EnvironmentalReading[]>([\n${readings.join(',\n')}\n  ` + content.substring(endIdx);
    fs.writeFileSync('components/EnvironmentalModule.tsx', content);
  }
} catch (e) { console.error('EnvironmentalModule failed', e); }

// TrainingModule
try {
  let content = fs.readFileSync('components/TrainingModule.tsx', 'utf8');
  let startIdx = content.indexOf('const [records, setRecords] = useState<TrainingRecord[]>(');
  let endIdx = content.indexOf(']);', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    const records = [];
    for (let i = 1; i <= 15; i++) {
      const course = ['H2S Awareness', 'Confined Space Entry', 'Working at Heights', 'Fire Fighting', 'First Aid'][Math.floor(Math.random() * 5)];
      const status = ['Active', 'Expiring Soon', 'Expired'][Math.floor(Math.random() * 3)];
      records.push(`    { id: 'TR-${i}', employeeName: 'Employee ${i}', courseName: '${course}', completionDate: '${randomDate(ninetyDaysAgo, now).split('T')[0]}', expiryDate: '${randomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)).split('T')[0]}', status: '${status}' }`);
    }
    content = content.substring(0, startIdx) + `const [records, setRecords] = useState<TrainingRecord[]>([\n${records.join(',\n')}\n  ` + content.substring(endIdx);
    fs.writeFileSync('components/TrainingModule.tsx', content);
  }
} catch (e) { console.error('TrainingModule failed', e); }

// MOCModule
try {
  let content = fs.readFileSync('components/MOCModule.tsx', 'utf8');
  let startIdx = content.indexOf('const MOCK_MOCS: MOCRecord[] = [');
  let endIdx = content.indexOf('];', startIdx) + 2;
  if (startIdx !== -1 && endIdx !== -1) {
    const records = [];
    for (let i = 1; i <= 15; i++) {
      const type = ['Process', 'Equipment', 'Personnel', 'Organizational'][Math.floor(Math.random() * 4)];
      const status = ['Draft', 'Review', 'Approved', 'Implemented', 'Closed'][Math.floor(Math.random() * 5)];
      records.push(`  {
    id: 'MOC-2024-${i.toString().padStart(3, '0')}',
    title: 'MOC for ${type} ${i}',
    type: '${type}',
    description: 'Description for MOC ${i}',
    originator: 'User ${i}',
    status: '${status}',
    riskLevel: '${['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}',
    dateRaised: '${randomDate(ninetyDaysAgo, now).split('T')[0]}',
    approvers: [],
    actionItems: []
  }`);
    }
    content = content.substring(0, startIdx) + `const MOCK_MOCS: MOCRecord[] = [\n${records.join(',\n')}\n];` + content.substring(endIdx);
    fs.writeFileSync('components/MOCModule.tsx', content);
  }
} catch (e) { console.error('MOCModule failed', e); }

