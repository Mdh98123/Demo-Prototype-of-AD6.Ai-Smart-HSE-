import test from 'node:test';
import assert from 'node:assert/strict';
import { offlineStorage } from '../services/offlineStorage.ts';

test('Dynamic Inspection Template schema supports text, boolean, photo, and signature fields', async () => {
  const customTemplate = {
    id: 'tmpl-test-dynamic',
    name: 'Flare System & Pipe Rack Audit',
    title: 'Flare System & Pipe Rack Audit',
    category: 'Plant & Machinery Integrity',
    regulatoryStandard: 'Oman MoL MD 286/2008 & RD 53/2023',
    version: '1.0.0',
    description: 'Dynamic checklist for flare header validation',
    status: 'ACTIVE',
    items: [
      {
        id: 'f1',
        label: 'Pipe Rack Tag ID',
        type: 'text',
        required: true
      },
      {
        id: 'f2',
        label: 'Are pipe hanger springs within calibration tolerance?',
        type: 'boolean',
        required: true,
        booleanTrueLabel: 'Compliant (Pass)',
        booleanFalseLabel: 'Deficient (Fail)',
        allowNA: false,
        requirePhotoOnFail: true
      },
      {
        id: 'f3',
        label: 'Photographic Evidence of Pipe Hanger Defect',
        type: 'photo',
        required: true
      },
      {
        id: 'f4',
        label: 'Field Inspector Electronic Signature',
        type: 'signature',
        required: true,
        signerRole: 'Lead Piping Inspector'
      }
    ]
  };

  await offlineStorage.saveTemplate(customTemplate);
  const retrieved = await offlineStorage.getTemplate('tmpl-test-dynamic');

  assert.ok(retrieved, 'Template was saved and retrieved successfully');
  assert.equal(retrieved.title, 'Flare System & Pipe Rack Audit');
  assert.equal(retrieved.items.length, 4);

  const types = retrieved.items.map(i => i.type);
  assert.deepEqual(types, ['text', 'boolean', 'photo', 'signature'], 'All 4 required field types are preserved');

  // Verify boolean specific options
  const boolItem = retrieved.items.find(i => i.type === 'boolean');
  assert.equal(boolItem.booleanTrueLabel, 'Compliant (Pass)');
  assert.equal(boolItem.requirePhotoOnFail, true);

  // Clean up
  await offlineStorage.deleteTemplate('tmpl-test-dynamic');
  const afterDelete = await offlineStorage.getTemplate('tmpl-test-dynamic');
  assert.equal(afterDelete, undefined, 'Template was cleaned up successfully');
});
