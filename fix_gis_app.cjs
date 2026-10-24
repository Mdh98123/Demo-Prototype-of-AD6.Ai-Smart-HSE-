const fs = require('fs');

let typesContent = fs.readFileSync('types.ts', 'utf8');
typesContent = typesContent.replace(/export enum View {/g, "export enum View {\n  GIS_MAP = 'GIS_MAP',");
fs.writeFileSync('types.ts', typesContent);

let appContent = fs.readFileSync('components/App.tsx', 'utf8');
if (!appContent.includes('import { GISMapModule }')) {
  appContent = appContent.replace(/import { BusinessContinuityModule } from '\.\/BusinessContinuityModule';/, "import { BusinessContinuityModule } from './BusinessContinuityModule';\nimport { GISMapModule } from './GISMapModule';");
}
if (!appContent.includes('{currentView === View.GIS_MAP')) {
  appContent = appContent.replace(/\{currentView === View.BUSINESS_CONTINUITY && <BusinessContinuityModule \/>\}/, "{currentView === View.BUSINESS_CONTINUITY && <BusinessContinuityModule />}\n                {currentView === View.GIS_MAP && <GISMapModule />}");
}
fs.writeFileSync('components/App.tsx', appContent);

let sidebarContent = fs.readFileSync('components/Sidebar.tsx', 'utf8');
if (!sidebarContent.includes("view: View.GIS_MAP")) {
  sidebarContent = sidebarContent.replace(
    /\{ id: 'iot', label: 'IoT & Telemetry', view: View.IOT, icon: Activity \},/,
    "{ id: 'gis', label: 'GIS Map', view: View.GIS_MAP, icon: Navigation },\n        { id: 'iot', label: 'IoT & Telemetry', view: View.IOT, icon: Activity },"
  );
}
// wait, icon: Navigation might not be imported.
if (!sidebarContent.includes('Navigation')) {
    sidebarContent = sidebarContent.replace(/MapPin,/, "MapPin, Navigation,");
}
fs.writeFileSync('components/Sidebar.tsx', sidebarContent);

