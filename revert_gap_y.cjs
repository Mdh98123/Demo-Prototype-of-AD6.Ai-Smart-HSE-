const fs = require('fs');
const path = require('path');

function revertGapY(content) {
    // Only revert gap-y- back to space-y-
    // because gap-y breaks on block elements, whereas space-y works perfectly on blocks.
    // space-y also works perfectly fine on flex-col.
    let result = content.replace(/\bgap-y-([0-9\.]+)\b/g, (match, p1) => {
        return `space-y-${p1}`;
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
            let content = fs.readFileSync(fullPath, 'utf8');
            const newContent = revertGapY(content);
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Reverted gap-y to space-y:', fullPath);
            }
        }
    }
}

walkPath('components');
walkPath('contexts');
