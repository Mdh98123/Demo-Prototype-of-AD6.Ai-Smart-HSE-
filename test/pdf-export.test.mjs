import test from 'node:test';
import assert from 'node:assert/strict';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

test('PDF tables render through the supported AutoTable API', () => {
  const document = new jsPDF();
  autoTable(document, {
    head: [['Control', 'Status']],
    body: [['Permit review', 'Open']]
  });

  assert.ok(document.lastAutoTable.finalY > 0);
  assert.ok(document.output('arraybuffer').byteLength > 1000);
});
