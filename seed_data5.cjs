const fs = require('fs');

const sites = [
  "Mina Al Fahal Refinery Complex",
  "Jebel Ali Construction Site",
  "Musaffah Industrial Zone",
  "Habshan Gas Complex",
  "Muscat HQ"
];

let content = fs.readFileSync('components/ProjectsModule.tsx', 'utf8');
let startIdx = content.indexOf('const mockProjects: Project[] = [');
let endIdx = content.indexOf('];', startIdx) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  const projects = [];
  for (let i = 1; i <= 15; i++) {
    const loc = sites[Math.floor(Math.random() * sites.length)];
    const status = ['Active', 'Planning', 'Completed', 'Suspended'][Math.floor(Math.random() * 4)];
    const progress = Math.floor(Math.random() * 100);
    const score = Math.floor(Math.random() * 20) + 80;
    
    projects.push(`      {
        id: 'PRJ-2024-${i.toString().padStart(3, '0')}',
        name: 'Project Expansion Phase ${i}',
        client: 'Client ${i}',
        location: '${loc}',
        startDate: '2024-01-15',
        endDate: '2025-12-31',
        status: '${status}',
        manager: 'Manager ${i}',
        budget: 15000000,
        progress: ${progress},
        hseScore: ${score},
        openIncidents: ${Math.floor(Math.random() * 5)}
      }`);
  }
  content = content.substring(0, startIdx) + `const mockProjects: Project[] = [\n${projects.join(',\n')}\n    ];` + content.substring(endIdx);
  fs.writeFileSync('components/ProjectsModule.tsx', content);
}
