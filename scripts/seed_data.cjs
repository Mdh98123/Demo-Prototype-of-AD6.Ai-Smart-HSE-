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

// Generate 18 incidents
const incidents = [];
for (let i = 1; i <= 18; i++) {
  const type = ['Safety Hazard', 'Near Miss', 'Injury', 'Property Damage', 'Environmental', 'Equipment Failure'][Math.floor(Math.random() * 6)];
  const severity = ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)];
  const status = ['Open', 'Investigation', 'Review', 'Closed'][Math.floor(Math.random() * 4)];
  const loc = sites[Math.floor(Math.random() * sites.length)];
  
  incidents.push(`            { id: 'INC-8${i.toString().padStart(2, '0')}', type: '${type}', description: 'Generated incident description for ${type} at ${loc}. Requires review.', location: '${loc}', status: '${status}' as any, timestamp: '${randomDate(ninetyDaysAgo, now)}', reportedBy: 'u${(i%5)+3}', reportedByName: 'User ${i}', auditLog: [], images: [], reportDeadline: '${randomDate(now, new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000))}', severity: '${severity}' }`);
}

let content = fs.readFileSync('components/IncidentForm.tsx', 'utf8');
content = content.replace(
  /const initial: Incident\[\] = \[[^\]]*\];/, 
  `const initial: Incident[] = [\n${incidents.join(',\n')}\n        ];`
);
fs.writeFileSync('components/IncidentForm.tsx', content);

// Generate 18 permits
const permits = [];
for (let i = 1; i <= 18; i++) {
  const type = ['Hot Work', 'Confined Space', 'Working at Height', 'Electrical Work', 'Excavation', 'Lifting'][Math.floor(Math.random() * 6)];
  const status = ['Draft', 'HSE_Review', 'Pending_Authorization', 'Ready_to_Issue', 'Active', 'Suspended', 'Closed', 'Rejected'][Math.floor(Math.random() * 8)];
  const loc = sites[Math.floor(Math.random() * sites.length)];
  const riskScore = Math.floor(Math.random() * 100);
  const riskLevel = riskScore > 75 ? 'High' : riskScore > 40 ? 'Medium' : 'Low';
  
  permits.push(`    {
        id: 'PTW-4${i.toString().padStart(2, '0')}',
        type: '${type}',
        description: 'Permit for ${type} operations at ${loc}',
        location: '${loc}',
        startTime: '${randomDate(ninetyDaysAgo, now)}',
        endTime: '${randomDate(now, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))}',
        contractor: 'Contractor ${i}',
        crewSize: ${Math.floor(Math.random() * 10) + 1},
        requirements: ['Gas Testing'],
        ramsRef: 'RAMS-${200+i}',
        assessment: { riskScore: ${riskScore}, riskLevel: '${riskLevel}', hazards: [], controls: [], requiredPPE: [] },
        status: '${status}',
        applicant: { id: 'u${(i%5)+3}', name: 'User ${i}', time: '${randomDate(ninetyDaysAgo, now)}' },
        gasReadings: [],
        isolations: []
    }`);
}

content = fs.readFileSync('components/PermitForm.tsx', 'utf8');
content = content.replace(
  /const \[permits, setPermits\] = useState<ActivePermit\[\]>\(\[[^\]]*\]\);/s, 
  `const [permits, setPermits] = useState<ActivePermit[]>([\n${permits.join(',\n')}\n  ]);`
);
fs.writeFileSync('components/PermitForm.tsx', content);

// Generate observations
const observations = [];
for (let i = 1; i <= 18; i++) {
  const type = ['Unsafe Act', 'Unsafe Condition', 'Positive Observation'][Math.floor(Math.random() * 3)];
  const status = ['Pending', 'Actioned', 'Closed'][Math.floor(Math.random() * 3)];
  const loc = sites[Math.floor(Math.random() * sites.length)];
  const riskScore = Math.floor(Math.random() * 100);
  const severity = riskScore > 75 ? 'High' : riskScore > 40 ? 'Medium' : 'Low';
  
  observations.push(`    { id: 'OBS-5${i.toString().padStart(2, '0')}', type: '${type}', description: 'Observed ${type} at ${loc}', location: '${loc}', observer: 'User ${i}', date: '${randomDate(ninetyDaysAgo, now)}', status: '${status}', severity: '${severity}', immediateAction: 'Spoke to personnel', category: 'General Safety', department: 'Operations' }`);
}

content = fs.readFileSync('components/SafetyObservationForm.tsx', 'utf8');
content = content.replace(
  /const mockObservations: ObservationRecord\[\] = \[[^\]]*\];/s, 
  `const mockObservations: ObservationRecord[] = [\n${observations.join(',\n')}\n          ];`
);
fs.writeFileSync('components/SafetyObservationForm.tsx', content);

// Generate inspections
const inspections = [];
for (let i = 1; i <= 18; i++) {
  const type = ['Heavy Machinery', 'Fire Safety', 'Scaffolding', 'Electrical Tools', 'Vehicle Fleet'][Math.floor(Math.random() * 5)];
  const status = ['Draft', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)];
  const loc = sites[Math.floor(Math.random() * sites.length)];
  const score = Math.floor(Math.random() * 40) + 60;
  
  inspections.push(`              { id: 'INSP-6${i.toString().padStart(2, '0')}', type: '${type}', location: '${loc}', inspector: 'User ${i}', date: '${randomDate(ninetyDaysAgo, now)}', score: ${score}, status: '${status}', items: [] }`);
}

content = fs.readFileSync('components/InspectionModule.tsx', 'utf8');
content = content.replace(
  /const mockHistory: InspectionRecord\[\] = \[[^\]]*\];/s, 
  `const mockHistory: InspectionRecord[] = [\n${inspections.join(',\n')}\n          ];`
);
fs.writeFileSync('components/InspectionModule.tsx', content);

