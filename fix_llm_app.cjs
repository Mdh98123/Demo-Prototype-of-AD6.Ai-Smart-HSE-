const fs = require('fs');

let typesContent = fs.readFileSync('types.ts', 'utf8');
typesContent = typesContent.replace(/export enum View {/g, "export enum View {\n  LESSONS_LEARNED = 'LESSONS_LEARNED',");
fs.writeFileSync('types.ts', typesContent);

let appContent = fs.readFileSync('components/App.tsx', 'utf8');
if (!appContent.includes('const LessonsLearnedModule')) {
  appContent = appContent.replace(/const GISMapModule = React\.lazy\(\(\) => import\('\.\/GISMapModule'\)\.then\(m => \(\{ default: m\.GISMapModule \}\)\)\);/, "const GISMapModule = React.lazy(() => import('./GISMapModule').then(m => ({ default: m.GISMapModule })));\nconst LessonsLearnedModule = React.lazy(() => import('./LessonsLearnedModule').then(m => ({ default: m.LessonsLearnedModule })));");
}
if (!appContent.includes('{currentView === View.LESSONS_LEARNED')) {
  appContent = appContent.replace(/\{currentView === View\.GIS_MAP && <GISMapModule \/>\}/, "{currentView === View.GIS_MAP && <GISMapModule />}\n                {currentView === View.LESSONS_LEARNED && <LessonsLearnedModule />}");
}
fs.writeFileSync('components/App.tsx', appContent);

let sidebarContent = fs.readFileSync('components/Sidebar.tsx', 'utf8');
if (!sidebarContent.includes("view: View.LESSONS_LEARNED")) {
  sidebarContent = sidebarContent.replace(
    /\{ id: 'dms', label: 'Document Control', view: View\.DMS, icon: FileText \},/,
    "{ id: 'dms', label: 'Document Control', view: View.DMS, icon: FileText },\n        { id: 'lessons_learned', label: 'Lessons Learned', view: View.LESSONS_LEARNED, icon: BookOpen },"
  );
}
fs.writeFileSync('components/Sidebar.tsx', sidebarContent);

