const fs = require('fs');

let content = fs.readFileSync('components/App.tsx', 'utf8');

if (!content.includes('const DigitalFormsBuilderModule')) {
  content = content.replace(/const IotStatusModule = React\.lazy\(\(\) => import\('\.\/IotStatusModule'\)\);/, "const IotStatusModule = React.lazy(() => import('./IotStatusModule'));\nconst DigitalFormsBuilderModule = React.lazy(() => import('./DigitalFormsBuilderModule').then(m => ({ default: m.DigitalFormsBuilderModule })));\nconst BusinessContinuityModule = React.lazy(() => import('./BusinessContinuityModule').then(m => ({ default: m.BusinessContinuityModule })));");
}

fs.writeFileSync('components/App.tsx', content);

