const fs = require('fs');
let content = fs.readFileSync('components/Sidebar.tsx', 'utf8');

if (!content.includes("view: View.FORMS_BUILDER")) {
  content = content.replace(
    /\{ id: 'dms', label: 'Document Control', view: View.DMS, icon: FileText \},/,
    "{ id: 'dms', label: 'Document Control', view: View.DMS, icon: FileText },\n        { id: 'forms-builder', label: 'Forms Builder', view: View.FORMS_BUILDER, icon: FileText },"
  );
}

fs.writeFileSync('components/Sidebar.tsx', content);

