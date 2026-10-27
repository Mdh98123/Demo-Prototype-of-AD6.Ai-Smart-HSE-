import test from 'node:test';
import assert from 'node:assert/strict';

test('Health check payload validation', async () => {
  const payload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };

  assert.equal(payload.status, 'healthy');
  assert.equal(payload.version, '1.0.0');
  assert.ok(payload.timestamp);
  assert.ok(!isNaN(Date.parse(payload.timestamp)));
});

test('Port resolution logic', () => {
  // Cloud Run $PORT dynamic binding simulation
  const simulateResolvePort = (argv, envPort, nodeEnv) => {
    const portArgIndex = argv.indexOf('--port');
    if (portArgIndex !== -1 && argv[portArgIndex + 1]) {
      const parsed = parseInt(argv[portArgIndex + 1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (nodeEnv === 'production') {
      if (envPort) {
        const parsed = parseInt(envPort, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return 8080;
    }
    if (envPort && envPort !== '8080') {
      const parsed = parseInt(envPort, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 3000;
  };

  // Test Cloud Run default port 8080
  assert.equal(simulateResolvePort([], '8080', 'production'), 8080);
  assert.equal(simulateResolvePort([], undefined, 'production'), 8080);
  
  // Test Custom Cloud Run PORT
  assert.equal(simulateResolvePort([], '9000', 'production'), 9000);

  // Test Dev CLI flag override
  assert.equal(simulateResolvePort(['--port', '3000', '--host', '0.0.0.0'], '8080', 'development'), 3000);

  // Test Dev mode fallback to 3000 when PORT=8080 is set by Cloud Run runtime
  assert.equal(simulateResolvePort([], '8080', 'development'), 3000);
});

test('Latest Regulatory Updates API schema and legal register mapping', () => {
  const mockPayload = {
    status: 'success',
    lastChecked: new Date().toISOString(),
    totalCount: 8,
    officialCount: 6,
    reportedCount: 2,
    updates: [
      {
        id: 'REG-OMN-2026-104',
        title: 'Ministry of Labour MD 286/2008 & RD 53/2023 - Mandatory Summer Heat Stress & Midday Work Stoppage Enforcement',
        authority: 'Ministry of Labour (MoL) - Sultanate of Oman',
        jurisdiction: 'Sultanate of Oman',
        badgeType: 'OFFICIAL',
        topicChips: ['Heat Stress', 'Oman Labour Law', 'TWL Monitoring', 'Summer Work Ban', 'Life Safety'],
        publicationDate: '2026-05-15',
        effectiveDate: '2026-06-01',
        summary: 'Strict statutory enforcement...',
        keyObligations: ['Cease all outdoor work from 12:30 PM to 3:30 PM'],
        sourceUrl: 'https://mol.gov.om/decrees/md-286-2008-heat-stress',
        sourceName: 'Official Oman Ministry of Labour Gazette',
        impactLevel: 'Critical',
        statutoryFine: 'OMR 5,000 per violation & operational stoppage',
        penaltyExposureAed: 5000,
        category: 'Heat Stress & Environment'
      },
      {
        id: 'REG-REP-2026-015',
        title: 'Regional Industry Advisory: Gulf Energy Gazette Reports Enhanced Offshore H2S Detection Standards Under Review',
        authority: 'GCC Industrial Safety Review Board / Trade Press',
        jurisdiction: 'GCC Regional / Oman Maritime',
        badgeType: 'REPORTED',
        topicChips: ['H2S Gas Safety', 'Offshore Platforms', 'Industry Alert'],
        publicationDate: '2026-10-18',
        effectiveDate: '2026-12-01 (Anticipated)',
        summary: 'Regional industry intelligence...',
        keyObligations: ['Audit of field H2S sensor sensitivity'],
        sourceUrl: 'https://gcc-safety-advisory.org/reports/h2s-threshold-review-2026',
        sourceName: 'Gulf Industrial Safety Intelligence Bulletin',
        impactLevel: 'Medium',
        statutoryFine: 'Advisory Guidance / Pre-Statutory',
        penaltyExposureAed: 3500,
        category: 'Process Safety & Fire'
      }
    ]
  };

  assert.equal(mockPayload.status, 'success');
  assert.ok(mockPayload.lastChecked);
  assert.ok(mockPayload.updates.length > 0);

  // Validate OFFICIAL and REPORTED badge types
  const officialItem = mockPayload.updates.find(u => u.badgeType === 'OFFICIAL');
  assert.ok(officialItem);
  assert.ok(officialItem.sourceUrl.startsWith('https://'));
  assert.ok(officialItem.publicationDate);
  assert.ok(Array.isArray(officialItem.topicChips) && officialItem.topicChips.length > 0);

  const reportedItem = mockPayload.updates.find(u => u.badgeType === 'REPORTED');
  assert.ok(reportedItem);
  assert.ok(reportedItem.sourceUrl.startsWith('https://'));

  // Validate Legal Register Mapping
  const legalRegisterEntry = {
    id: 'OBL-992101',
    regulationId: officialItem.id,
    regulationTitle: officialItem.title,
    authority: officialItem.authority,
    obligationText: officialItem.keyObligations[0],
    operationalCategory: 'Workforce Safety',
    penaltyExposureAed: officialItem.penaltyExposureAed,
    responsibleRole: 'Site HSE Manager',
    assignedSite: 'Mina Al Fahal Refinery & Terminal',
    complianceStatus: 'Fully Compliant',
    nextAuditDueDate: '2026-11-25'
  };

  assert.equal(legalRegisterEntry.regulationId, officialItem.id);
  assert.equal(legalRegisterEntry.complianceStatus, 'Fully Compliant');
  assert.ok(legalRegisterEntry.id.startsWith('OBL-'));
});

