const fs = require('fs');

const sites = [
  "Ruwais Refinery Complex",
  "Jebel Ali Construction Site",
  "Musaffah Industrial Zone",
  "Habshan Gas Complex",
  "Abu Dhabi HQ"
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

const now = new Date();
const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

let content = fs.readFileSync('components/TaskModule.tsx', 'utf8');
let startIdx = content.indexOf('const initialTasks: Task[] = [');
let endIdx = content.indexOf('];', startIdx) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  const tasks = [];
  for (let i = 1; i <= 18; i++) {
    const category = ['Audit', 'Inspection', 'Incident', 'General'][Math.floor(Math.random() * 4)];
    const priority = ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)];
    const status = ['ToDo', 'InProgress', 'InReview', 'Done'][Math.floor(Math.random() * 4)];
    
    tasks.push(`            {
                id: 'T-1${i.toString().padStart(2, '0')}',
                title: 'Task for ${category} - ${i}',
                description: 'Generated task description for ${category}. Action required.',
                assignee: 'u${(i%5)+3}',
                priority: '${priority}',
                category: '${category}',
                status: '${status}',
                dueDate: '${randomDate(now, new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)).split('T')[0]}',
                createdAt: '${randomDate(ninetyDaysAgo, now)}',
                createdBy: 'System',
                dependencies: []
            }`);
  }
  content = content.substring(0, startIdx) + `const initialTasks: Task[] = [\n${tasks.join(',\n')}\n        ];` + content.substring(endIdx);
  fs.writeFileSync('components/TaskModule.tsx', content);
}
