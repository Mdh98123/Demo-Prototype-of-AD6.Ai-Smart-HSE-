const fs = require('fs');

// Fix ContractorPortal.tsx
let content = fs.readFileSync('components/ContractorPortal.tsx', 'utf8');
content = content.replace(/specialty: '.*?',\n/g, '');
fs.writeFileSync('components/ContractorPortal.tsx', content);

// Fix contractors/ContractorPortal.tsx
content = fs.readFileSync('components/contractors/ContractorPortal.tsx', 'utf8');
content = content.replace(/name: '.*?',/g, (match) => {
  return match.replace('name:', 'companyName:');
});
fs.writeFileSync('components/contractors/ContractorPortal.tsx', content);

// Fix InspectionModule.tsx
content = fs.readFileSync('components/InspectionModule.tsx', 'utf8');
content = content.replace(/'In Progress'/g, "'Draft'");
fs.writeFileSync('components/InspectionModule.tsx', content);

// Fix ProjectsModule.tsx
content = fs.readFileSync('components/ProjectsModule.tsx', 'utf8');
content = content.replace(/'Suspended'/g, "'OnHold'");
fs.writeFileSync('components/ProjectsModule.tsx', content);

// Fix RAMSModule.tsx
content = fs.readFileSync('components/RAMSModule.tsx', 'utf8');
content = content.replace(/'Review'/g, "'Under Review'");
fs.writeFileSync('components/RAMSModule.tsx', content);

// Fix TaskModule.tsx
content = fs.readFileSync('components/TaskModule.tsx', 'utf8');
content = content.replace(/'InReview'/g, "'InProgress'");
content = content.replace(/'Incident'/g, "'General'");
fs.writeFileSync('components/TaskModule.tsx', content);

