const fs = require('fs');
const path = require('path');

function replaceSpaceX(content) {
    // Replace space-x-\d+ with gap-x-\d+
    let result = content.replace(/\bspace-x-([0-9\.]+)\b/g, (match, p1) => {
        return `gap-x-${p1}`;
    });
    // Replace space-y-\d+ with gap-y-\d+
    result = result.replace(/\bspace-y-([0-9\.]+)\b/g, (match, p1) => {
        return `gap-y-${p1}`;
    });
    return result;
}

function walkPath(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkPath(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const newContent = replaceSpaceX(content);
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Replaced space-x/y with gap:', fullPath);
            }
        }
    }
}

walkPath('components');
walkPath('contexts');
