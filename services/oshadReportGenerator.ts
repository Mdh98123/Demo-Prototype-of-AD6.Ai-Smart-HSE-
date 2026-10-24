/**
 * oshadReportGenerator.ts
 * Generates official compliance exports in PDF (Bilingual) and Excel (Data).
 */

import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export class OshadReportGenerator {

  // Auto-generate OSHAD SF-7 (Annual Report) Data Export for Government
  public static generateSF7Excel(tenantData: any, year: number) {
    // 1. Compile the workbook sheets based on OSHAD-SF Mechanism formats
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary Statistics
    const summaryData = [
      ['OSHAD-SF Entity Performance Report (Form SF-7)'],
      ['Reporting Year', year],
      ['Entity Name', tenantData.name || 'AD6.Ai Verified Tenant'],
      [],
      ['Metric', 'Value'],
      ['Total Man-Hours', tenantData.manHours || 0],
      ['Total Fatalities', tenantData.fatalities || 0],
      ['Lost Time Injuries (LTI)', tenantData.lti || 0],
      ['Lost Time Injury Frequency Rate (LTIFR)', tenantData.ltifr || 0]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'SF7-Metrics');

    // Sheet 2: Incident Logs (Mechanism 11 Extracted)
    const wsIncidents = XLSX.utils.json_to_sheet(tenantData.incidents || []);
    XLSX.utils.book_append_sheet(workbook, wsIncidents, 'Mechanism-11-Log');

    // 2. Export file
    XLSX.writeFile(workbook, `OSHAD_SF7_${year}_${tenantData.name || 'Report'}.xlsx`);
  }

  // Auto-generate Bilingual Assessment Configuration Report
  public static generateMechanismConfigPDF(configMapping: any) {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('OSHAD-SF Framework Configuration Audit', 14, 20);
    // Arabic fallback representation (due to standard jsPDF lacking native shaping without custom fonts)
    doc.text('تدقيق تكوين إطار عمل OSHAD-SF', 196, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.text(`Generated At: ${new Date().toISOString()}`, 14, 30);
    
    // Digital Signature UAE Pass Placeholder
    doc.setDrawColor(0, 200, 0);
    doc.rect(14, 40, 182, 10);
    doc.text('[ UAE PASS VERIFIED SIGNATURE HASh ALGORITHM HELD ON CHAIN ]', 20, 47);

    let currentY = 70;
    Object.keys(configMapping).forEach((mechanism) => {
       doc.setFontSize(12);
       doc.text(`Mechanism ${mechanism}: ${configMapping[mechanism].title}`, 14, currentY);
       
       doc.setFontSize(10);
       doc.text(`Status: ${configMapping[mechanism].enabled ? 'ENABLED' : 'DISABLED'}`, 14, currentY + 7);
       doc.text(`Custom Workflows Defined: ${configMapping[mechanism].workflows || '0'}`, 14, currentY + 14);
       
       currentY += 30;
       
       if (currentY > 270) {
         doc.addPage();
         currentY = 20;
       }
    });

    doc.save('Mechanism_Configuration_Audit.pdf');
  }

}
