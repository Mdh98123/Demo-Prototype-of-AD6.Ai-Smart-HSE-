const fs = require('fs');
const path = require('path');

const dir = 'components';

function replaceLogical(content) {
    let result = content;
    
    // Margins
    result = result.replace(/\bml-([0-9\.]+|auto)\b/g, 'ms-$1');
    result = result.replace(/\bmr-([0-9\.]+|auto)\b/g, 'me-$1');
    
    // Negative Margins
    result = result.replace(/\b-ml-([0-9\.]+)\b/g, '-ms-$1');
    result = result.replace(/\b-mr-([0-9\.]+)\b/g, '-me-$1');

    // Padding
    result = result.replace(/\bpl-([0-9\.]+)\b/g, 'ps-$1');
    result = result.replace(/\bpr-([0-9\.]+)\b/g, 'pe-$1');

    // Borders (border-l-xxx -> border-s-xxx)
    result = result.replace(/\bborder-l-([a-zA-Z0-9-]+)\b/g, 'border-s-$1');
    result = result.replace(/\bborder-r-([a-zA-Z0-9-]+)\b/g, 'border-e-$1');
    result = result.replace(/\bborder-l\b/g, 'border-s');
    result = result.replace(/\bborder-r\b/g, 'border-e');

    // Text Alignment
    result = result.replace(/\btext-left\b/g, 'text-start');
    result = result.replace(/\btext-right\b/g, 'text-end');

    // Positioning
    result = result.replace(/\bleft-([0-9\.]+|auto|full|1\/[234]|2\/[34]|3\/4|px)\b/g, 'start-$1');
    result = result.replace(/\bright-([0-9\.]+|auto|full|1\/[234]|2\/[34]|3\/4|px)\b/g, 'end-$1');
    
    // Negative Positioning
    result = result.replace(/\b-left-([0-9\.]+)\b/g, '-start-$1');
    result = result.replace(/\b-right-([0-9\.]+)\b/g, '-end-$1');

    // Rounded Corners
    // tl, tr, bl, br -> ss, se, es, ee (Start-Start, Start-End etc. In Tailwind it's ss, se, ee, es for top-left/top-right etc. Wait, rounded-l-md -> rounded-s-md)
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
                console.log('Fixed:', fullPath);
            }
        }
    }
}

walkPath(dir);
walkPath('contexts');
console.log('RTL conversion complete');
