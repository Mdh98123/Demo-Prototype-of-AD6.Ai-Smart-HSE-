import test from 'node:test';
import assert from 'node:assert/strict';
import { mlAutoTagger } from '../services/mlAutoTaggerService.ts';

test('ML Auto-Tagger semantic mapper accurately suggests keywords for scaffolding, PPE, and corrosion', async () => {
  // Test scaffolding mapping
  const scaffoldResult = mlAutoTagger.mapPredictionsToHSE([
    { className: 'scaffold', probability: 0.88 },
    { className: 'pier', probability: 0.42 }
  ]);
  assert.ok(scaffoldResult.tags.includes('scaffolding'), 'Expected scaffolding tag');
  assert.ok(scaffoldResult.tags.includes('work at height'), 'Expected work at height tag');
  assert.strictEqual(scaffoldResult.category, 'Working at Height');

  // Test PPE mapping
  const ppeResult = mlAutoTagger.mapPredictionsToHSE([
    { className: 'helmet, hard hat', probability: 0.94 },
    { className: 'vest', probability: 0.72 }
  ]);
  assert.ok(ppeResult.tags.includes('PPE'), 'Expected PPE tag');
  assert.ok(ppeResult.tags.includes('hard hat'), 'Expected hard hat tag');
  assert.strictEqual(ppeResult.category, 'Workforce PPE');

  // Test Corrosion mapping
  const corrosionResult = mlAutoTagger.mapPredictionsToHSE([
    { className: 'rust', probability: 0.91 },
    { className: 'pipe, pipeline', probability: 0.85 }
  ]);
  assert.ok(corrosionResult.tags.includes('corrosion'), 'Expected corrosion tag');
  assert.ok(corrosionResult.tags.includes('rust'), 'Expected rust tag');
  assert.strictEqual(corrosionResult.category, 'Asset Integrity');
});
