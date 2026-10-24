const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Since we have git, it's easier to just git checkout the files and only apply the RTL conversion
execSync('git checkout -- components/ contexts/');

// Then re-run the RTL specific ones (margin left/right padding left/right)
const replaceLogical = (content) => {
    let result = content;
    result = result.replace(/\bml-([0-9\.]+|auto)\b/g, 'ms-$1');
    result = result.replace(/\bmr-([0-9\.]+|auto)\b/g, 'me-$1');
    result = result.replace(/\b-ml-([0-9\.]+)\b/g, '-ms-$1');
    result = result.replace(/\b-mr-([0-9\.]+)\b/g, '-me-$1');
    result = result.replace(/\bpl-([0-9\.]+)\b/g, 'ps-$1');
    result = result.replace(/\bpr-([0-9\.]+)\b/g, 'pe-$1');
    result = result.replace(/\bborder-l-([a-zA-Z0-9-]+)\b/g, 'border-s-$1');
    result = result.replace(/\bborder-r-([a-zA-Z0-9-]+)\b/g, 'border-e-$1');
    result = result.replace(/\bborder-l\b/g, 'border-s');
    result = result.replace(/\bborder-r\b/g, 'border-e');
    result = result.replace(/\btext-left\b/g, 'text-start');
    result = result.replace(/\btext-right\b/g, 'text-end');
    result = result.replace(/\bleft-([0-9\.]+|auto|full|1\/[234]|2\/[34]|3\/4|px)\b/g, 'start-$1');
    result = result.replace(/\bright-([0-9\.]+|auto|full|1\/[234]|2\/[34]|3\/4|px)\b/g, 'end-$1');
    result = result.replace(/\b-left-([0-9\.]+)\b/g, '-start-$1');
    result = result.replace(/\b-right-([0-9\.]+)\b/g, '-end-$1');
    result = result.replace(/\brounded-l-([a-zA-Z0-9-]+)\b/g, 'rounded-s-$1');
    result = result.replace(/\brounded-r-([a-zA-Z0-9-]+)\b/g, 'rounded-e-$1');
    result = result.replace(/\brounded-tl-([a-zA-Z0-9-]+)\b/g, 'rounded-ss-$1');
    result = result.replace(/\brounded-tr-([a-zA-Z0-9-]+)\b/g, 'rounded-se-$1');
    result = result.replace(/\brounded-bl-([a-zA-Z0-9-]+)\b/g, 'rounded-es-$1');
    result = result.replace(/\brounded-br-([a-zA-Z0-9-]+)\b/g, 'rounded-ee-$1');
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
            const newContent = replaceLogical(content);
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
            }
        }
    }
}

walkPath('components');
walkPath('contexts');
console.log('Reverted space-y and re-applied RTL.');
