const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixTranslations(content) {
    let newContent = content;
    
    // Fix messed up rtl:rtl:...
    newContent = newContent.replace(/rtl:rtl:(hover|group-hover):translate-x-([0-9\.]+) (hover|group-hover):-translate-x-([0-9\.]+) (hover|group-hover):translate-x-([0-9\.]+)/g, 'rtl:$1:-translate-x-$2 $3:translate-x-$2');

    newContent = newContent.replace(/rtl:rtl:(hover|group-hover|group-hover\/[a-zA-Z]+):translate-x-([0-9\.]+) (hover|group-hover|group-hover\/[a-zA-Z]+):-translate-x-([0-9\.]+) (hover|group-hover|group-hover\/[a-zA-Z]+):translate-x-([0-9\.]+)/g, 'rtl:$1:-translate-x-$2 $3:translate-x-$2');

    newContent = newContent.replace(/rtl:rtl:(hover|group-hover):-translate-x-([0-9\.]+) (hover|group-hover):translate-x-([0-9\.]+) (hover|group-hover):-translate-x-([0-9\.]+)/g, 'rtl:$1:translate-x-$2 $3:-translate-x-$2');

    return newContent;
}

function walkPath(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkPath(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = fixTranslations(content);

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Cleaned up translate in:', fullPath);
            }
        }
    }
}

walkPath('components');
