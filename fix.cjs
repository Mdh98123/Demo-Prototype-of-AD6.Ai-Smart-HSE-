const fs = require('fs');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/<div className="flex flex-col md:flex-row md:items-start md:gap-6">\n\s*<label\n\s*/g, '<div className="flex flex-col md:flex-row md:items-start md:gap-6">\n');
    fs.writeFileSync(filePath, content);
}
fix('components/PermitForm.tsx');
console.log('Fixed broken label tags');
