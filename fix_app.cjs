const fs = require('fs');

let content = fs.readFileSync('components/App.tsx', 'utf8');

// Add import
if (!content.includes('import { DigitalFormsBuilderModule }')) {
  content = content.replace(/import { IotStatusModule } from '\.\/IotStatusModule';/, "import { IotStatusModule } from './IotStatusModule';\nimport { DigitalFormsBuilderModule } from './DigitalFormsBuilderModule';");
}

// Add route
if (!content.includes('{currentView === View.FORMS_BUILDER')) {
  content = content.replace(/\{currentView === View.DMS && <DMSModule \/>\}/, "{currentView === View.DMS && <DMSModule />}\n                {currentView === View.FORMS_BUILDER && <DigitalFormsBuilderModule />}");
}

fs.writeFileSync('components/App.tsx', content);

