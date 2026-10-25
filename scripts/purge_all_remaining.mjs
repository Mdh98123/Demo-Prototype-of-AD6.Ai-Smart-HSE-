import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  // Specific phrases
  { from: /Abu Dhabi Occupational Safety & Health System Framework \(OSHAD-SF v3\.1\)/gi, to: 'Oman Ministry of Labour Occupational Safety & Health Regulations (MD 286/2008 & RD 53/2023)' },
  { from: /Abu Dhabi Occupational Safety and Health System Framework/gi, to: 'Oman Ministry of Labour Occupational Safety and Health Regulations' },
  { from: /ADNOC Codes of Practice \(CoP v6\.0\)/gi, to: 'PDO HSE Specifications (SP-1143 / SP-1170)' },
  { from: /ADNOC Codes of Practice/gi, to: 'PDO HSE Specifications' },
  { from: /ADNOC Code of Practice/gi, to: 'PDO HSE Specifications' },
  { from: /ADNOC CoP/gi, to: 'PDO SP-1143' },
  { from: /ADNOC COP/gi, to: 'PDO SPECS' },
  { from: /ADNOC HSE-MS/gi, to: 'PDO HSE-MS' },
  { from: /ADNOC HSE Management System/gi, to: 'PDO HSE Management System' },
  { from: /ADNOC/g, to: 'PDO' },
  { from: /adnoc/gi, to: 'pdo' },
  { from: /ADOSH-SF/gi, to: 'Oman MoL MD 286/2008' },
  { from: /OSHAD-SF v3\.1/gi, to: 'Oman MoL MD 286/2008 & PDO Specifications' },
  { from: /OSHAD-SF/gi, to: 'Oman MoL MD 286/2008' },
  { from: /OSHAD SF/gi, to: 'Oman MoL MD 286/2008' },
  { from: /OSHAD/g, to: 'Oman MoL' },
  { from: /oshad/gi, to: 'omanMoL' },
  { from: /Abu Dhabi Securities Exchange \(ADX\)/gi, to: 'Muscat Stock Exchange (MSX)' },
  { from: /Dubai Financial Market \(DFM\)/gi, to: 'Muscat Stock Exchange (MSX)' },
  { from: /Abu Dhabi Public Health Center/gi, to: 'Oman MoL OSH Directorate' },
  { from: /Abu Dhabi HQ/gi, to: 'Muscat HQ' },
  { from: /Abu Dhabi/gi, to: 'Muscat' },
  { from: /Dubai/gi, to: 'Sohar' },
  { from: /Sharjah/gi, to: 'Salalah' },
  { from: /Ruwais Refinery Complex/gi, to: 'Mina Al Fahal Refinery Complex' },
  { from: /Ruwais Refinery Zone B/gi, to: 'Mina Al Fahal Refinery Zone 2' },
  { from: /Ruwais Workshop/gi, to: 'Mina Al Fahal Workshop' },
  { from: /Ruwais Zone A/gi, to: 'Mina Al Fahal Zone 1' },
  { from: /Ruwais/gi, to: 'Mina Al Fahal' },
  { from: /Al-Ruwais Polyolefin Asset \(UAE\)/gi, to: 'Mina Al Fahal Refinery Asset (Oman)' },
  { from: /Al-Ruwais Polyolefin Asset/gi, to: 'Mina Al Fahal Refinery Asset' },
  { from: /Al-Ruwais/gi, to: 'Mina Al Fahal' },
  { from: /Al Ruwais/gi, to: 'Mina Al Fahal' },
  { from: /UAE-RUW-03/gi, to: 'OMN-MAF-01' },
  { from: /Azure UAE \(Dubai\/Abu Dhabi\)/gi, to: 'Oman Sovereign Cloud (Muscat / Sohar)' },
  { from: /UAE IA Standard v2\.0/gi, to: 'Oman National Cybersecurity Framework' },
  { from: /MOHRE Emiratisation \(Tawteen & Nafis\)/gi, to: 'Ministry of Labour Omanisation Targets' },
  { from: /Emiratisation & Tawteen/gi, to: 'Omanisation Quotas' },
  { from: /Emiratisation/gi, to: 'Omanisation' },
  { from: /Tawteen/gi, to: 'Omanisation' },
  { from: /MoHRE/gi, to: 'MoL' },
  { from: /MOHRE/gi, to: 'MoL' },
  { from: /FANR/gi, to: 'Oman EA' },
  { from: /Emirates ID/gi, to: 'Oman Civil ID' },
  { from: /United Arab Emirates/gi, to: 'Sultanate of Oman' },
  { from: /Emirates/gi, to: 'Sultanate of Oman' },
  { from: /\+971 50 123 4567/g, to: '+968 91 123 456' },
  { from: /\+971/g, to: '+968' },
  { from: /\bAED\b/g, to: 'OMR' },
  { from: /Dirhams/gi, to: 'Omani Rials' },
  { from: /Dirham/gi, to: 'Omani Rial' },
  { from: /UAE/g, to: 'Oman' }
];

const TARGET_FILES = [
  'README.md',
  'RELEASE_BASELINE.md',
  'ARCHITECTURE_CURRENT_STATE.md',
  'FEATURE_PRESERVATION_REGISTER.md',
  'MANIFEST.json',
  'update_dash.cjs',
  'seed_data.cjs',
  'seed_data2.cjs',
  'seed_data3.cjs',
  'seed_data4.cjs',
  'seed_data5.cjs',
  'seed_data6.cjs',
  'seed_rest.cjs',
  'seed_rest2.cjs',
  'enterprise-architecture/00_Enterprise_HSE_Operations_Platform_Blueprint.md',
  'enterprise-architecture/03_Compliance_Mapping.md',
  'enterprise-architecture/04_AI_Architecture.md',
  'enterprise-architecture/README.md'
];

let totalCount = 0;
for (const file of TARGET_FILES) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const { from, to } of REPLACEMENTS) {
    if (from.test(content)) {
      content = content.replace(from, to);
      changed = true;
      totalCount++;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

console.log(`Purged all documentation and helper files. Total changes: ${totalCount}`);
