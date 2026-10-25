import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  { from: /Abu Dhabi Occupational Safety & Health System Framework \(OSHAD-SF v3\.1\)/gi, to: 'Oman Ministry of Labour Occupational Safety & Health Regulations (MD 286/2008 & RD 53/2023)' },
  { from: /Abu Dhabi Occupational Safety and Health System Framework/gi, to: 'Oman Ministry of Labour Occupational Safety and Health Regulations' },
  { from: /ADNOC Codes of Practice \(CoP v6\.0\)/gi, to: 'PDO HSE Specifications (SP-1143 / SP-1170)' },
  { from: /ADNOC Codes of Practice/gi, to: 'PDO HSE Specifications' },
  { from: /ADNOC Code of Practice/gi, to: 'PDO HSE Specifications' },
  { from: /ADNOC CoP/gi, to: 'PDO SP-1143' },
  { from: /ADNOC COP/gi, to: 'PDO SPECS' },
  { from: /ADNOC Life-Saving Rules/gi, to: 'PDO 12 Life-Saving Rules' },
  { from: /ADNOC Onshore/gi, to: 'Petroleum Development Oman (PDO)' },
  { from: /ADNOC/g, to: 'PDO' },
  { from: /adnoc/gi, to: 'pdo' },
  { from: /ADOSH-SF/gi, to: 'Oman MoL MD 286/2008' },
  { from: /OSHAD-SF v3\.1/gi, to: 'Oman MoL MD 286/2008 & PDO Specifications' },
  { from: /OSHAD-SF CoP 21\.0 PTW Clause 4\.2/gi, to: 'PDO SP-1143 PTW Specification Clause 4.2' },
  { from: /OSHAD-SF/gi, to: 'Oman MoL MD 286/2008' },
  { from: /OSHAD SF/gi, to: 'Oman MoL MD 286/2008' },
  { from: /Abu Dhabi OSHAD \(Al-Adaa\)/gi, to: 'Oman Ministry of Labour (MoL) Portal' },
  { from: /Abu Dhabi OSHAD Form G/gi, to: 'Oman MoL 24-Hour Notice Form (MD 286/2008 Annex 1)' },
  { from: /Abu Dhabi OSHAD Al-Adaa Portal/gi, to: 'Oman Ministry of Labour Digital Portal' },
  { from: /Abu Dhabi OSHAD/gi, to: 'Oman MoL' },
  { from: /OSHAD Form G/gi, to: 'Oman MoL Form MD 286' },
  { from: /OSHAD/g, to: 'Oman MoL' },
  { from: /oshad/gi, to: 'omanMoL' },
  { from: /Abu Dhabi Public Health Centre \(ADPHC\)/gi, to: 'Oman Ministry of Labour Occupational Safety & Health Directorate' },
  { from: /Abu Dhabi Public Health Center/gi, to: 'Oman MoL OSH Directorate' },
  { from: /Abu Dhabi HQ/gi, to: 'Muscat HQ' },
  { from: /Abu Dhabi/gi, to: 'Muscat' },
  { from: /Dubai/gi, to: 'Sohar' },
  { from: /Sharjah/gi, to: 'Salalah' },
  { from: /Al-Ruwais Polyolefin Asset LLC \(`UAE-RUW-02`, Extrusion & Reactor Train 2\)\. Currency: `AED`/gi, to: 'Mina Al Fahal Refinery Asset LLC (`OMN-MAF-01`, Distillation & Cracker Unit). Currency: `OMR`' },
  { from: /Al-Ruwais Polyolefin Asset/gi, to: 'Mina Al Fahal Refinery Asset' },
  { from: /Al-Ruwais/gi, to: 'Mina Al Fahal' },
  { from: /Ruwais/gi, to: 'Mina Al Fahal' },
  { from: /UAE-RUW-03/gi, to: 'OMN-MAF-01' },
  { from: /UAE-RUW-02/gi, to: 'OMN-MAF-01' },
  { from: /UAE-RUW-/gi, to: 'OMN-MAF-' },
  { from: /UAE-RUW/gi, to: 'OMN-MAF' },
  { from: /UAE Asset/gi, to: 'Oman Asset' },
  { from: /UAE MoHRE summer midday break rules/gi, to: 'Oman MoL MD 286/2008 summer midday work ban (12:30-15:30)' },
  { from: /MoHRE/gi, to: 'MoL' },
  { from: /MOHRE/gi, to: 'MoL' },
  { from: /FANR/gi, to: 'Oman EA' },
  { from: /Tawteen/gi, to: 'Omanisation' },
  { from: /Emiratisation/gi, to: 'Omanisation' },
  { from: /Emirates ID/gi, to: 'Oman Civil ID' },
  { from: /United Arab Emirates/gi, to: 'Sultanate of Oman' },
  { from: /Emirates/gi, to: 'Sultanate of Oman' },
  { from: /AED\/SAR Native Pricing Page/gi, to: 'OMR/SAR Native Pricing Page' },
  { from: /AED\/SAR/gi, to: 'OMR/SAR' },
  { from: /\bAED\b/g, to: 'OMR' },
  { from: /Dirhams/gi, to: 'Omani Rials' },
  { from: /Dirham/gi, to: 'Omani Rial' },
  { from: /\+971/g, to: '+968' },
  { from: /\b997\b/g, to: '9999' },
  { from: /\b998\b/g, to: '9999' },
  { from: /\bUAE\b/g, to: 'Oman' }
];

const DOC_FILES = [
  'AUDIT_REPORT.md',
  'docs/ARCHITECTURE.md',
  'docs/API.md',
  'docs/PROJECT_IMPLEMENTATION.md',
  'docs/DESIGN.md',
  'docs/FEATURE_DEVELOPMENT.md',
  'docs/DATABASE.md',
  'docs/INTEGRATIONS.md',
  'docs/PRD.md'
];

for (const file of DOC_FILES) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const { from, to } of REPLACEMENTS) {
    if (from.test(content)) {
      content = content.replace(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated doc: ${file}`);
  }
}
console.log('Docs purge completed.');
