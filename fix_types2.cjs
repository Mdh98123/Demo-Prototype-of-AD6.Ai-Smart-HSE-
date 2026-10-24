const fs = require('fs');

let content = fs.readFileSync('types.ts', 'utf8');
content = content.replace(/FORMS_BUILDER = 'FORMS_BUILDER',\n/g, ''); // cleanup if exists
content = content.replace(/export enum View {/g, "export enum View {\n  FORMS_BUILDER = 'FORMS_BUILDER',");
fs.writeFileSync('types.ts', content);

