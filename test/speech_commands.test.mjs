import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChecklistVoiceIntent } from '../hooks/useChecklistSpeechRecognition.ts';

test('Web Speech API voice command parser recognizes English navigation and value commands', () => {
  // Navigation
  const nextRes = parseChecklistVoiceIntent('next', 'en-US');
  assert.strictEqual(nextRes.action, 'NAVIGATE_NEXT');
  assert.strictEqual(nextRes.isCommand, true);

  const nextStepRes = parseChecklistVoiceIntent('next step', 'en-US');
  assert.strictEqual(nextStepRes.action, 'NAVIGATE_NEXT');

  const backRes = parseChecklistVoiceIntent('back', 'en-US');
  assert.strictEqual(backRes.action, 'NAVIGATE_PREV');

  // Value commands
  const passRes = parseChecklistVoiceIntent('pass', 'en-US');
  assert.strictEqual(passRes.action, 'SET_PASS');

  const compliantRes = parseChecklistVoiceIntent('compliant', 'en-US');
  assert.strictEqual(compliantRes.action, 'SET_PASS');

  const failRes = parseChecklistVoiceIntent('fail', 'en-US');
  assert.strictEqual(failRes.action, 'SET_FAIL');

  const deficientRes = parseChecklistVoiceIntent('deficient', 'en-US');
  assert.strictEqual(deficientRes.action, 'SET_FAIL');

  const naRes = parseChecklistVoiceIntent('not applicable', 'en-US');
  assert.strictEqual(naRes.action, 'SET_NA');

  const clearRes = parseChecklistVoiceIntent('clear', 'en-US');
  assert.strictEqual(clearRes.action, 'CLEAR_TEXT');

  const urgentRes = parseChecklistVoiceIntent('urgent', 'en-US');
  assert.strictEqual(urgentRes.action, 'TOGGLE_URGENT');

  // Text dictation
  const dictationRes = parseChecklistVoiceIntent('Scaffolding handrail missing on west elevation', 'en-US');
  assert.strictEqual(dictationRes.action, 'DICTATE_TEXT');
  assert.strictEqual(dictationRes.text, 'Scaffolding handrail missing on west elevation');

  const notePrefixRes = parseChecklistVoiceIntent('Note: loose clamp on ladder access', 'en-US');
  assert.strictEqual(notePrefixRes.action, 'DICTATE_TEXT');
  assert.strictEqual(notePrefixRes.text, 'loose clamp on ladder access');
});

test('Web Speech API voice command parser recognizes Arabic navigation and value commands', () => {
  // Navigation
  const nextAr = parseChecklistVoiceIntent('التالي', 'ar-OM');
  assert.strictEqual(nextAr.action, 'NAVIGATE_NEXT');
  assert.strictEqual(nextAr.isCommand, true);

  const prevAr = parseChecklistVoiceIntent('السابق', 'ar-OM');
  assert.strictEqual(prevAr.action, 'NAVIGATE_PREV');

  const backAr = parseChecklistVoiceIntent('ارجع', 'ar-OM');
  assert.strictEqual(backAr.action, 'NAVIGATE_PREV');

  // Value commands
  const passAr = parseChecklistVoiceIntent('مطابق', 'ar-OM');
  assert.strictEqual(passAr.action, 'SET_PASS');

  const failAr = parseChecklistVoiceIntent('غير مطابق', 'ar-OM');
  assert.strictEqual(failAr.action, 'SET_FAIL');

  const naAr = parseChecklistVoiceIntent('غير منطبق', 'ar-OM');
  assert.strictEqual(naAr.action, 'SET_NA');

  const clearAr = parseChecklistVoiceIntent('امسح', 'ar-OM');
  assert.strictEqual(clearAr.action, 'CLEAR_TEXT');

  const urgentAr = parseChecklistVoiceIntent('عاجل', 'ar-OM');
  assert.strictEqual(urgentAr.action, 'TOGGLE_URGENT');

  // Arabic Dictation
  const dictationAr = parseChecklistVoiceIntent('سقالة الطابق الثالث غير مثبتة بإحكام', 'ar-OM');
  assert.strictEqual(dictationAr.action, 'DICTATE_TEXT');
  assert.strictEqual(dictationAr.text, 'سقالة الطابق الثالث غير مثبتة بإحكام');

  const noteAr = parseChecklistVoiceIntent('ملاحظة: وجود تسرب ديزل بالقرب من المولد', 'ar-OM');
  assert.strictEqual(noteAr.action, 'DICTATE_TEXT');
  assert.strictEqual(noteAr.text, 'وجود تسرب ديزل بالقرب من المولد');
});
