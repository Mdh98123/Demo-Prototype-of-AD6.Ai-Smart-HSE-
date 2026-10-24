const fs = require('fs');

function fixIncidentForm(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Any div containing block mb-X trailing that immediately contains a label and an input/textarea
    // Let's just find labels and add horizontal rules.
    content = content.replace(/<label className="([^"]+) block mb-(\d+)"/g, '<label className="$1 block md:w-1/4 shrink-0 mt-2 md:mt-4 mb-$2 md:mb-0"');
    content = content.replace(/<label className="([^"]+) block"/g, '<label className="$1 block md:w-1/4 shrink-0 mt-2 md:mt-4 md:mb-0"');
    
    // Now make sure the parents are flex-col md:flex-row if they are just wrapping div
    // An easy generic way to Microsoft Dynamics style:
    // .dynamics-field-group { @apply flex flex-col md:flex-row md:items-start gap-2 md:gap-6 w-full }
    
    fs.writeFileSync(filePath, content);
}

fixIncidentForm('components/IncidentForm.tsx');
console.log("Incident labels flexed!");
