const fs = require('fs');
const glob = require('glob');

const components = glob.sync('components/*.tsx');

components.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('import {') && !content.includes('import { AITag }') && (content.includes('assessRisk') || content.includes('generate') || content.includes('analyze') || content.includes('predict') || content.includes('suggest') || content.includes('geminiService') || file.includes('ChatBot') || file.includes('Executive'))) {
        content = content.replace(/import React/, "import { AITag } from './AITag';\nimport React");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
    }
});
