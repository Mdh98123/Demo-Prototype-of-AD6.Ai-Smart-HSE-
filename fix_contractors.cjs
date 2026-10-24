const fs = require('fs');

let content = fs.readFileSync('components/contractors/ContractorPortal.tsx', 'utf8');

// Fix types
content = content.replace(/'Low'/g, "'LOW'");
content = content.replace(/'Commercial License'/g, "'TRADE_LICENSE'");
content = content.replace(/'Workers Compensation'/g, "'INSURANCE'");
content = content.replace(/'ISO 45001 Certificate'/g, "'ISO_CERT'");
content = content.replace(/'VALID'/g, "'VERIFIED'");
content = content.replace(/'EXPIRING_SOON'/g, "'PENDING'");
content = content.replace(/'EXPIRED'/g, "'REJECTED'");

fs.writeFileSync('components/contractors/ContractorPortal.tsx', content);

