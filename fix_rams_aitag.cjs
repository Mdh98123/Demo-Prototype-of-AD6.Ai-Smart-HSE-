const fs = require('fs');
let content = fs.readFileSync('components/RAMSModule.tsx', 'utf8');

const target1 = `<BrainCircuit size={12} /> AI Suggested for this activity`;
const replacement1 = `<BrainCircuit size={12} /> AI Suggested for this activity <AITag />`;

const target2 = `<BrainCircuit size={12} /> AI Suggestions (Click to Add)`;
const replacement2 = `<BrainCircuit size={12} /> AI Suggestions (Click to Add) <AITag />`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

fs.writeFileSync('components/RAMSModule.tsx', content);
