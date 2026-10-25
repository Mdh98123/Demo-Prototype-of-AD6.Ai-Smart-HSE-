import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['components', 'services', 'routes', 'types'];
const SINGLE_FILES = ['types.ts', 'server.ts'];

const REPLACEMENTS = [
  // 1. High-priority frameworks & regulatory bodies
  { from: /Abu Dhabi OSH System Framework/g, to: 'Oman Ministry of Labour OSH Framework' },
  { from: /Abu Dhabi OSHAD-SF Mechanism 11\.0/gi, to: 'Oman MoL MD 286/2008 & PDO PR-1172' },
  { from: /Abu Dhabi OSHAD-SF Mechanism 11/gi, to: 'Oman MoL MD 286/2008 & PDO PR-1172' },
  { from: /Abu Dhabi OSHAD-SF/gi, to: 'Oman MoL MD 286/2008 & PDO SP-1143' },
  { from: /OSHAD-SF Mechanism 11\.0/gi, to: 'Oman MoL MD 286/2008 & PDO PR-1172' },
  { from: /OSHAD-SF Mechanism 11/gi, to: 'Oman MoL MD 286/2008 & PDO PR-1172' },
  { from: /OSHAD Mechanism 11\.0/gi, to: 'Oman MoL MD 286/2008 & PDO PR-1172' },
  { from: /OSHAD Mechanism 11/gi, to: 'Oman MoL MD 286/2008 & PDO PR-1172' },
  { from: /OSHAD-SF Framework Configuration Audit/gi, to: 'Oman Ministry of Labour & PDO Framework Audit' },
  { from: /OSHAD-SF Entity Performance Report/gi, to: 'Oman MoL (MD 286/2008) HSE Performance Return' },
  { from: /OSHAD-SF Workflow Engine/gi, to: 'Oman MoL & PDO Workflow Engine' },
  { from: /OSHAD-SF/g, to: 'Oman MoL MD 286/2008 & PDO Specifications' },
  { from: /OSHAD SF/g, to: 'Oman MoL MD 286/2008' },
  { from: /OSHAD_SF/g, to: 'OMAN_MOL_MD286' },
  { from: /OSHAD CoP 2\.0/gi, to: 'PDO SP-1143' },
  { from: /OSHAD CoP 14/gi, to: 'PDO SP-1231' },
  { from: /OSHAD CoP 21\.0/gi, to: 'PDO SP-1143' },
  { from: /OSHAD CoP/gi, to: 'PDO SP-1143' },
  { from: /OSHAD Form G/gi, to: 'Oman MoL Form MD 286' },
  { from: /OSHAD Form E/gi, to: 'Oman MoL Form MD 286' },
  { from: /OSHAD SF-7/gi, to: 'Oman MoL Annual HSE Return' },
  { from: /OSHAD/g, to: 'Oman MoL MD 286/2008' },
  { from: /oshadFormGSubmittedAt/g, to: 'molFormSubmittedAt' },
  { from: /oshadReference/g, to: 'molReference' },
  { from: /oshad/gi, to: 'omanMoL' },

  // 2. ADNOC replacements
  { from: /ADNOC Code of Practice/gi, to: 'PDO HSE Code of Practice (SP-1143)' },
  { from: /ADNOC CoP 2\.0/gi, to: 'PDO SP-1143 (PTW Specification)' },
  { from: /ADNOC CoP 14/gi, to: 'PDO SP-1231 (LOTO Specification)' },
  { from: /ADNOC CoP/gi, to: 'PDO SP-1143 Specification' },
  { from: /ADNOC COP V6\.0/gi, to: 'PDO SP-1143 / SP-1170 V6.0' },
  { from: /ADNOC COP/g, to: 'PDO HSE SPECS' },
  { from: /ADNOC_COP/g, to: 'PDO_SP' },
  { from: /ADNOC_Flash_Report/g, to: 'PDO_Flash_Report' },
  { from: /ADNOC_OSHAD/g, to: 'PDO_MOL_WORKFLOW' },
  { from: /ADNOC HSE Directorate/gi, to: 'PDO HSE Directorate' },
  { from: /ADNOC/g, to: 'PDO' },
  { from: /adnoc/gi, to: 'pdo' },

  // 3. Ministry of Human Resources and Emiratisation
  { from: /Ministry of Human Resources and Emiratisation/gi, to: 'Ministry of Labour (Sultanate of Oman)' },
  { from: /UAE Ministry of Human Resources/gi, to: 'Oman Ministry of Labour (MoL)' },
  { from: /Federal Decree-Law No\. 33\/2021/g, to: 'Oman Labour Law (Royal Decree No. 53/2023)' },
  { from: /Federal Decree-Law No\. 45\/2021/g, to: 'Oman Personal Data Protection Law (Royal Decree 6/2022)' },
  { from: /FEDERAL_MOHRE/g, to: 'OMAN_MOL_RD53' },
  { from: /MoHRE/g, to: 'Ministry of Labour (MoL)' },
  { from: /MOHRE/g, to: 'Oman Ministry of Labour' },
  { from: /mohre/gi, to: 'omanMoL' },

  // 4. Municipalities & Civil Defence
  { from: /Dubai Municipality/gi, to: 'Muscat Municipality' },
  { from: /DM Code/g, to: 'Oman Environment Authority' },
  { from: /DM_CODE/g, to: 'OMAN_EA' },
  { from: /Dubai Mun\./g, to: 'Muscat Mun.' },
  { from: /Abu Dhabi Civil Defence/gi, to: 'Civil Defence and Ambulance Authority (CDAA Oman)' },
  { from: /Civil Defence Abu Dhabi/gi, to: 'Civil Defence and Ambulance Authority (CDAA Oman)' },
  { from: /Emirates Civil Defence/gi, to: 'Civil Defence and Ambulance Authority (CDAA Oman)' },
  { from: /UAE Civil Defence/gi, to: 'Civil Defence and Ambulance Authority (CDAA Oman)' },

  // 5. Environmental & Health Agencies
  { from: /Environment Agency Abu Dhabi/gi, to: 'Environment Authority (Oman EA RD 114/2001)' },
  { from: /Abu Dhabi EPA/gi, to: 'Environment Authority (Oman EA)' },
  { from: /Abu Dhabi Public Health Center/gi, to: 'Ministry of Labour Occupational Safety & Health Directorate' },
  { from: /ADPHC/g, to: 'Oman MoL OSHD' },
  { from: /FANR/g, to: 'Ministry of Energy and Minerals (MEM Oman)' },

  // 6. Nationalisation & In-Country Value
  { from: /Emiratisation & Tawteen/gi, to: 'Omanisation Quotas (Ministry of Labour)' },
  { from: /Omanisation & Emiratisation/gi, to: 'Omanisation (Ministry of Labour)' },
  { from: /Emiratisation/g, to: 'Omanisation' },
  { from: /emiratisation/g, to: 'omanisation' },
  { from: /Emiratization/g, to: 'Omanisation' },
  { from: /emiratization/g, to: 'omanisation' },
  { from: /Tawteen/gi, to: 'Omanisation' },
  { from: /National ICV Program \(UAE MoIAT\)/gi, to: 'Oman In-Country Value Program (MEM / OIA)' },
  { from: /National ICV Program \(MoIAT UAE\)/gi, to: 'Oman In-Country Value Program (MEM / OIA)' },
  { from: /National ICV \(UAE\)/gi, to: 'Oman ICV Score (MEM / OIA)' },
  { from: /UAE ICV programmes/gi, to: 'Oman ICV programmes (MEM / OIA)' },
  { from: /UAE ICV/gi, to: 'Oman ICV' },
  { from: /icvUAE/g, to: 'icvOman' },

  // 7. Stock exchanges & utilities
  { from: /ADX_UAE/g, to: 'MSX_OMAN' },
  { from: /DFM_UAE/g, to: 'MSX_OMAN' },
  { from: /ADX \(31 Metrics\)/g, to: 'MSX Oman (32 Indicators)' },
  { from: /ADX UAE \(31 Metrics\)/g, to: 'MSX Oman (32 Indicators)' },
  { from: /UAE SCA/g, to: 'Oman CMA' },
  { from: /ADX/g, to: 'MSX' },
  { from: /DFM/g, to: 'MSX' },
  { from: /Tadweer Bolisat \(UAE\)/g, to: "Be'ah Portal (Oman)" },
  { from: /Tadweer_Bolisat_UAE/g, to: 'Beah_Manifest_Oman' },
  { from: /Tadweer/g, to: "Be'ah (Oman)" },
  { from: /EWEC/g, to: 'Nama Power' },
  { from: /DEWA \(Dubai\)/g, to: 'Nama Electricity (Oman)' },
  { from: /DEWA/g, to: 'Nama Power' },

  // 8. Locations & Concessions
  { from: /Abu Dhabi Corporate HQ & Tech Hub/g, to: 'Muscat Corporate HQ & Technology Center' },
  { from: /Abu Dhabi Regional Operations Center · UAE/g, to: 'Muscat Operational Concession Center · Oman' },
  { from: /Abu Dhabi Regional Operations Center/g, to: 'Muscat Operational Concession Center' },
  { from: /Abu Dhabi HQ/g, to: 'Muscat HQ' },
  { from: /Abu Dhabi Region/g, to: 'Muscat & Interior Concessions' },
  { from: /Abu Dhabi Concessions/g, to: 'Oman Industrial Concessions' },
  { from: /Abu Dhabi/g, to: 'Muscat' },
  { from: /abu dhabi/gi, to: 'Muscat' },
  { from: /AUH-HQ-01/g, to: 'MCT-HQ-01' },
  { from: /AUH/g, to: 'MCT' },

  { from: /Dubai Commercial Logistics Hub/g, to: 'Duqm Special Economic Zone Logistics Hub' },
  { from: /Dubai/g, to: 'Sohar' },
  { from: /dubai/gi, to: 'Sohar' },
  { from: /DXB/g, to: 'SOH' },

  { from: /Sharjah/g, to: 'Salalah' },
  { from: /sharjah/gi, to: 'Salalah' },
  { from: /SHJ/g, to: 'SLL' },

  { from: /Al-Ruwais Polyolefin Asset & Regional Concession Hub/g, to: 'Mina Al Fahal Refinery & Petrochemical Concession Hub' },
  { from: /Al-Ruwais Polyolefin Asset \(UAE\)/g, to: 'Mina Al Fahal Refinery & Petrochemical Asset (Oman)' },
  { from: /Al-Ruwais Polyolefin Asset/g, to: 'Mina Al Fahal Refinery Asset' },
  { from: /Al-Ruwais/g, to: 'Mina Al Fahal' },
  { from: /Al Ruwais Industrial Complex/g, to: 'Mina Al Fahal Industrial Complex' },
  { from: /Al Ruwais/g, to: 'Mina Al Fahal' },
  { from: /Ruwais Asset Expansion Phase 3/g, to: 'Mina Al Fahal Asset Expansion Phase 3' },
  { from: /Ruwais Zone A/g, to: 'Mina Al Fahal Zone 1' },
  { from: /Ruwais/g, to: 'Mina Al Fahal' },
  { from: /ruwais/gi, to: 'Mina Al Fahal' },
  { from: /RUW-REF-02/g, to: 'MAF-REF-02' },

  { from: /Habshan Gas Complex/g, to: 'Khazzan Tight Gas Complex Block 61' },
  { from: /Habshan/g, to: 'Khazzan Gas Asset' },
  { from: /Jebel Ali Marine Terminal/g, to: 'Duqm Maritime Port Terminal' },
  { from: /Jebel Ali/g, to: 'Duqm Industrial Port' },
  { from: /KEZAD Industrial Logistics Hub/g, to: 'Sohar Freezone Industrial Logistics Hub' },
  { from: /KEZAD/g, to: 'Sohar Freezone' },
  { from: /KZD-LOG-03/g, to: 'SOH-LOG-03' },
  { from: /Al Maryah Island/g, to: 'Mina Al Fahal Industrial Area' },

  // 9. Phone numbers, Currency, IDs, Certificates
  { from: /\+971 2 602 1088/g, to: '+968 24 602 1088' },
  { from: /\+971 2 602 0045/g, to: '+968 24 602 0045' },
  { from: /\+971 2 602 4412/g, to: '+968 24 602 4412' },
  { from: /\+971 2 602 3042/g, to: '+968 24 602 3042' },
  { from: /\+971 2 602 2104/g, to: '+968 24 602 2104' },
  { from: /\+971 4 390 1122/g, to: '+968 24 790 1122' },
  { from: /\+971/g, to: '+968' },
  { from: /AED 15,000/g, to: 'OMR 1,500' },
  { from: /AED 50,000/g, to: 'OMR 5,000' },
  { from: /AED 100,000/g, to: 'OMR 10,000' },
  { from: /AED 20,000/g, to: 'OMR 2,000' },
  { from: /AED 25,000/g, to: 'OMR 2,500' },
  { from: /113\.2M AED/g, to: '11.8M OMR' },
  { from: /In AED or OMR/g, to: 'In OMR' },
  { from: /AED/g, to: 'OMR' },
  { from: /Dirhams/gi, to: 'Omani Rials' },
  { from: /Dirham/gi, to: 'Omani Rial' },
  { from: /Emirates ID/gi, to: 'Oman Civil ID' },
  { from: /UAE Pass/gi, to: 'Oman PKI / Tam Digital Signature' },
  { from: /UAE Trade Licence/gi, to: 'Oman Commercial Registration (CR)' },
  { from: /UAE Trade License/gi, to: 'Oman Commercial Registration (CR)' },

  // 10. Country terms
  { from: /UAE Net Zero 2050/g, to: 'Oman Vision 2040 Decarbonization' },
  { from: /UAE and Oman/g, to: 'Sultanate of Oman' },
  { from: /UAE & Oman/g, to: 'Sultanate of Oman' },
  { from: /Oman & UAE/g, to: 'Sultanate of Oman' },
  { from: /Oman and UAE/g, to: 'Sultanate of Oman' },
  { from: /UAE, Oman, KSA/g, to: 'Sultanate of Oman' },
  { from: /UAE, Oman/g, to: 'Sultanate of Oman' },
  { from: /UAE Concessions/g, to: 'Oman Industrial Concessions' },
  { from: /UAE Operations/g, to: 'Oman Operations' },
  { from: /UAE Federal Law/g, to: 'Oman Royal Decrees & Labour Law' },
  { from: /UAE national/gi, to: 'Omani national' },
  { from: /UAE Nationals/gi, to: 'Omani Nationals' },
  { from: /UAE Federal/gi, to: 'Oman Statutory' },
  { from: /UAE_FACILITIES/g, to: 'OMAN_FACILITIES' },
  { from: /FAC-UAE-/g, to: 'FAC-OMN-' },
  { from: /INC-2026-UAE-/g, to: 'INC-2026-OMN-' },
  { from: /CAPA-UAE-/g, to: 'CAPA-OMN-' },
  { from: /HAZ-2026-UAE-/g, to: 'HAZ-2026-OMN-' },
  { from: /capa-uae-/g, to: 'capa-omn-' },
  { from: /'UAE'/g, to: "'OMAN'" },
  { from: /"UAE"/g, to: '"OMAN"' },
  { from: /`UAE`/g, to: '`OMAN`' },
  { from: /\bUAE\b/g, to: 'Oman' },
  { from: /Emirates/g, to: 'Sultanate of Oman' },
  { from: /emirates/gi, to: 'Oman' },
  { from: /Emirate/g, to: 'Governorate' }
];

const auditLog = [];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  let changed = false;

  for (const { from, to } of REPLACEMENTS) {
    if (from.test(content)) {
      const match = content.match(from);
      auditLog.push({
        file: filePath,
        original: match[0],
        action: 'REPLACE',
        replacement: to
      });
      content = content.replace(from, to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(ts|tsx|html|json)$/.test(file) && !file.includes('node_modules')) {
      processFile(fullPath);
    }
  }
}

console.log('Beginning Oman-Only Purge...');
for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) walkDir(dir);
}
for (const f of SINGLE_FILES) {
  if (fs.existsSync(f)) processFile(f);
}

fs.writeFileSync('scripts/purge_audit_log.json', JSON.stringify(auditLog, null, 2));
console.log(`Purge complete. Total modifications: ${auditLog.length}`);
