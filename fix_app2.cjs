const fs = require('fs');

let content = fs.readFileSync('components/App.tsx', 'utf8');

if (!content.includes('import { DigitalFormsBuilderModule }')) {
  content = content.replace(/import { IotStatusModule } from '\.\/IotStatusModule';/, "import { IotStatusModule } from './IotStatusModule';\nimport { DigitalFormsBuilderModule } from './DigitalFormsBuilderModule';\nimport { BusinessContinuityModule } from './BusinessContinuityModule';");
}

fs.writeFileSync('components/App.tsx', content);

let envContent = fs.readFileSync('components/EnvironmentalModule.tsx', 'utf8');
envContent = envContent.replace(/'Normal'/g, "'Within Limit'");
envContent = envContent.replace(/'Warning'/g, "'Threshold Breach'");
envContent = envContent.replace(/'Critical'/g, "'Threshold Breach'");
fs.writeFileSync('components/EnvironmentalModule.tsx', envContent);

