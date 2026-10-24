const fs = require('fs');

let typesContent = fs.readFileSync('types.ts', 'utf8');
typesContent = typesContent.replace(/export enum View {/g, "export enum View {\n  BUSINESS_CONTINUITY = 'BUSINESS_CONTINUITY',");
fs.writeFileSync('types.ts', typesContent);

let appContent = fs.readFileSync('components/App.tsx', 'utf8');
if (!appContent.includes('import { BusinessContinuityModule }')) {
  appContent = appContent.replace(/import { DigitalFormsBuilderModule } from '\.\/DigitalFormsBuilderModule';/, "import { DigitalFormsBuilderModule } from './DigitalFormsBuilderModule';\nimport { BusinessContinuityModule } from './BusinessContinuityModule';");
}
if (!appContent.includes('{currentView === View.BUSINESS_CONTINUITY')) {
  appContent = appContent.replace(/\{currentView === View.FORMS_BUILDER && <DigitalFormsBuilderModule \/>\}/, "{currentView === View.FORMS_BUILDER && <DigitalFormsBuilderModule />}\n                {currentView === View.BUSINESS_CONTINUITY && <BusinessContinuityModule />}");
}
fs.writeFileSync('components/App.tsx', appContent);

let sidebarContent = fs.readFileSync('components/Sidebar.tsx', 'utf8');
if (!sidebarContent.includes("view: View.BUSINESS_CONTINUITY")) {
  sidebarContent = sidebarContent.replace(
    /\{ id: 'emergency', label: 'Emergency Hub', view: View.EMERGENCY, icon: ShieldAlert \},/,
    "{ id: 'emergency', label: 'Emergency Hub', view: View.EMERGENCY, icon: ShieldAlert },\n        { id: 'business-continuity', label: 'Business Continuity', view: View.BUSINESS_CONTINUITY, icon: ShieldAlert },"
  );
}
fs.writeFileSync('components/Sidebar.tsx', sidebarContent);

