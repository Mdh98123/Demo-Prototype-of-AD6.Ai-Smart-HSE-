const fs = require('fs');

function fixSaveTasks(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add ' as Task['status']' to the status assignments in saveTasks
    content = content.replace(/status: 'Blocked'\}/g, "status: 'Blocked' as Task['status']}");
    content = content.replace(/status: 'ToDo'\}/g, "status: 'ToDo' as Task['status']}");

    fs.writeFileSync(filePath, content);
}

fixSaveTasks('components/TaskModule.tsx');
console.log("Fixed status types!");
