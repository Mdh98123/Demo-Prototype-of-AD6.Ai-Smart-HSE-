const fs = require('fs');

function cleanFile(filePath) {
    if(!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // TIER 3 - Microsoft Enterprise Dashboard Cleanup
    content = content.replace(/rounded-\[.*?\]/g, 'rounded-md'); // Kill huge radii
    content = content.replace(/rounded-3xl/g, 'rounded-lg');
    content = content.replace(/rounded-2xl/g, 'rounded-md');
    
    // Change padding 6 and 8 to 4 for density (F-pattern logic)
    content = content.replace(/p-6/g, 'p-4');
    content = content.replace(/p-8/g, 'p-4');
    
    // Replace vibrant background blocks typically around icons with subtle neutral ones or specific solid colors for MS Fluent
    content = content.replace(/bg-indigo-50/g, 'bg-[#f3f2f1]');
    content = content.replace(/bg-teal-50/g, 'bg-[#f3f2f1]');
    // Also change dark banner colors to be more standard Enterprise neutral dark
    content = content.replace(/bg-neutral-900/g, 'bg-[#0f172a]'); // Slightly more corporate MS blue-gray instead of pure black padding
    
    // Grid adjustment for Executives
    // "For the Executive Dashboard KPI grid, arrange data in a dense 4-column grid rather than 3"
    // At line 461 in Dashboard.tsx: <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> -> grid-cols-1 lg:grid-cols-4
    // Be careful, this replaces all.
    content = content.replace(/grid-cols-1 lg:grid-cols-3/g, 'grid-cols-1 lg:grid-cols-4');
    
    // Fix nav layout alignment on inputs inside IncidentForm and PermitForm
    content = content.replace(/flex flex-col gap-2/g, 'flex flex-col md:flex-row md:items-center gap-2 md:gap-4');
    // Validation message colors to MS Red #a4262c
    content = content.replace(/text-red-500/g, 'text-[#a4262c]');
    content = content.replace(/text-red-600/g, 'text-[#a4262c]');
    content = content.replace(/bg-red-50\/10/g, 'bg-[#fde7e9]');
    content = content.replace(/border-red-500/g, 'border-[#a4262c]');
    content = content.replace(/border-emerald-500/g, 'border-[#107c41]'); // MS Green

    fs.writeFileSync(filePath, content);
}

cleanFile('components/Dashboard.tsx');
cleanFile('components/IncidentForm.tsx');
cleanFile('components/PermitForm.tsx');

console.log("Cleanup complete!");
