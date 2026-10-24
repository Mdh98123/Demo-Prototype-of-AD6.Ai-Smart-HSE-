const fs = require('fs');
let content = fs.readFileSync('components/Sidebar.tsx', 'utf8');

// Increase sidebar width when expanded
content = content.replace(/w-72/g, 'w-[320px]');

// Increase button height for better touch targets
content = content.replace(/h-\[38px\]/g, 'h-[44px]');

// Fix icon container width so icon perfectly centers when collapsed (88px width - 24px px-3 padding = 64px button width)
content = content.replace(/w-\[52px\]/g, 'w-[64px]');

// Fix submenu line alignment
content = content.replace(/ms-\[24px\]/g, 'ms-[32px]');

// Fix bottom section overlapping with nav
content = content.replace('absolute bottom-0 left-0 right-0 p-3', 'mt-auto p-4 z-20 shrink-0 w-full');

// Remove excessive padding from nav since bottom is no longer absolute
content = content.replace('pb-28', 'pb-4');

fs.writeFileSync('components/Sidebar.tsx', content);
console.log("Updated dimensions");
