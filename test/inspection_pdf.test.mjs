import test from 'node:test';
import assert from 'node:assert/strict';
import { InspectionPdfReportService } from '../services/inspectionPdfReportService.ts';

test('InspectionPdfReportService generates complete statutory A4 PDF report with checklist, metadata, and photos', async () => {
  // 1x1 transparent PNG data URL for test signatures/photos
  const mockPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAArraybuffer';
  // Small valid JPEG 1x1 data URL
  const mockJpeg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

  const sampleRecord = {
    id: 'insp-rec-audit-902',
    templateId: 'scaffolding-daily-inspection',
    date: '2026-10-27T10:30:00.000Z',
    updatedAt: '2026-10-27T11:45:00.000Z',
    status: 'SYNCED',
    syncedAt: '2026-10-27T11:46:00.000Z',
    location: {
      lat: 23.5880,
      lng: 58.3829
    },
    data: {
      site: 'Duqm Refinery Processing Unit 3',
      inspector: 'Hamdan Al-Harthy',
      inspectorNotes: 'Routine morning structural scaffolding safety walkthrough before hot-work activities commenced.',
      answers: {
        'scaff-base-plates': 'PASS',
        'scaff-guardrails': 'DEFICIENCY',
        'scaff-guardrails_notes': 'Mid-rail missing on north elevation bay 3; yellow tag affixed.',
        'scaff-toe-boards': 'PASS',
        'scaff-green-tag': 'PASS'
      },
      photos: [
        mockJpeg
      ],
      photoDetails: [
        {
          id: 'photo-1',
          url: mockJpeg,
          timestamp: '2026-10-27T11:00:00.000Z',
          uploader: 'Hamdan Al-Harthy',
          caption: 'North elevation bay 3 missing mid-rail defect',
          tags: ['scaffolding', 'fall-protection', 'corrosion']
        }
      ],
      signatures: {
        'inspector-signoff': mockPng
      },
      tags: ['scaffolding', 'high-risk', 'refinery']
    }
  };

  const doc = await InspectionPdfReportService.generateInspectionPdf(sampleRecord, {
    inspectorName: 'Hamdan Al-Harthy',
    organizationName: 'AD6.Ai Industrial HSE Enterprise',
    facilityOrSite: 'Duqm Refinery Processing Unit 3',
    jurisdiction: 'Sultanate of Oman (MOL / PDO HSE Standard)'
  });

  assert.ok(doc, 'jsPDF instance must be returned');

  // Verify internal page dimensions
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  assert.equal(Math.round(width), 210, 'Width should be standard A4 (210mm)');
  assert.equal(Math.round(height), 297, 'Height should be standard A4 (297mm)');

  // Verify byte output
  const pdfBytes = doc.output('arraybuffer');
  assert.ok(pdfBytes.byteLength > 3000, `Generated PDF buffer must be substantial, got ${pdfBytes.byteLength} bytes`);
});
