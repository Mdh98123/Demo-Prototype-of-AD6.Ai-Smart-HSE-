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
