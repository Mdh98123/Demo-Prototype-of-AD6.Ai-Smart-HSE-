const fs = require('fs');
let content = fs.readFileSync('components/Sidebar.tsx', 'utf8');

const importRegex = /import\s+\{\s*([\s\S]*?)\s*\}\s+from\s+'lucide-react';/;
const match = content.match(importRegex);

if (match) {
    let imports = match[1];
    if (!imports.includes('FolderTree')) {
        imports += ', FolderTree';
        content = content.replace(importRegex, `import { ${imports} } from 'lucide-react';`);
        fs.writeFileSync('components/Sidebar.tsx', content);
        console.log("Added FolderTree to imports");
    }
}
