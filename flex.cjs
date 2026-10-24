const fs = require('fs');

function flexLabels(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convert <div><label>... <input/select/textarea>... </div> 
    // This is tricky using regex due to attributes, so we apply a global class modification 
    // If we find:  <div>\n\s*<label 
    // We replace the wrapping div if possible, OR we make a more robust match:
    // We'll replace '<label className="' with '<label className="md:w-1/3 shrink-0 ' 
    // And to the parent container we will add 'flex flex-col md:flex-row md:items-center'
    
    // Instead of complex pure regex, I will do a regex that finds label block:
    content = content.replace(/(<div>|<div>(\s*)<label)/g, '<div className="flex flex-col md:flex-row md:items-start md:gap-6">\n$2<label');
    
    // Give labels width on desktop and remove mb-X
    content = content.replace(/<label className="([^"]+) mb-\d+"/g, '<label className="$1 md:w-1/4 shrink-0 mt-2 md:mt-4"');
    content = content.replace(/<label className="([^"]+)"/g, (match, classes) => {
        if (!classes.includes('md:w-1/3') && !classes.includes('md:w-1/4')) {
             return `<label className="${classes} md:w-1/4 shrink-0 mt-2 md:mt-4"`;
        }
        return match;
    });

    // Inputs inside need to take full remaining width:
    // They are usually w-full anyway.

    fs.writeFileSync(filePath, content);
}

flexLabels('components/PermitForm.tsx');
// Re-running on IncidentForm might break custom <div> alignments, let's just do targeted replacements if PermitForm works.
console.log("Flex rules applied!");
