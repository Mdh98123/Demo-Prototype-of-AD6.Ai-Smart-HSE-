const fs = require('fs');
const path = require('path');

function walkPath(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkPath(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Replace -translate-x-1/2 with rtl:translate-x-1/2 -translate-x-1/2
            let newContent = content.replace(/(?<!rtl:)-translate-x-1\/2(?! rtl:translate-x-1\/2)/g, 'rtl:translate-x-1/2 -translate-x-1/2');

            // Handle hover/group-hover translations left/right
            // e.g. group-hover:translate-x-1 -> rtl:group-hover:-translate-x-1 group-hover:translate-x-1
            newContent = newContent.replace(/\b(hover|group-hover):translate-x-([0-9\.]+)\b(?! rtl)/g, (match, state, val) => {
                return `rtl:${state}:-translate-x-${val} ${state}:translate-x-${val}`;
            });
            newContent = newContent.replace(/\b(hover|group-hover):-translate-x-([0-9\.]+)\b(?! rtl)/g, (match, state, val) => {
                return `rtl:${state}:translate-x-${val} ${state}:-translate-x-${val}`;
            });

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Fixed translate-x in:', fullPath);
            }
        }
    }
}

walkPath('components');
