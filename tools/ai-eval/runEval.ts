/**
 * AI Safety Evaluation Harness CLI Runner (Phase 5 - Gap G4)
 * Command: npm run eval:ai
 *
 * Evaluates:
 * - 100 Golden Incidents for Classification (Threshold: >= 85%)
 * - 20 Historical Incidents for RCA Edit Distance (Threshold: <= 0.35)
 * - 50 Gulf-Dialect ASR Recordings (Clean <= 10%, Moderate <= 18%, Heavy <= 30%)
 * - 50 Statutory Regulatory Citations (Precision >= 95%)
 *
 * Produces structured report: tools/ai-eval/eval_report.json
 * If any threshold fails, exits with non-zero code and blocks enabling aiGates flag.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  evaluateClassificationAgreement,
  evaluateRcaQuality,
  evaluateAsrBenchmarks,
  evaluateCitationPrecision,
  EvaluationSuiteReport
} from './evaluator.js';

const DATASETS_DIR = path.resolve(process.cwd(), 'tools/ai-eval/datasets');
const REPORT_PATH = path.resolve(process.cwd(), 'tools/ai-eval/eval_report.json');

function loadJson(filename: string): any[] {
  const filePath = path.join(DATASETS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Golden dataset file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function runFullAiEvaluation(): EvaluationSuiteReport {
  console.log('=============================================================================');
  console.log('  AD6.Ai Smart HSE Platform — Phase 5 AI Safety Evaluation Harness');
  console.log('  Target Juridical Scope: Sultanate of Oman (MD 286/2008, RD 53/2023, PDO SP-1143)');
  console.log('=============================================================================\n');

  // 1. Load Golden Datasets
  const classificationData = loadJson('golden_incidents_classification.json');
  const rcaData = loadJson('golden_rca_quality.json');
  const asrData = loadJson('golden_asr_benchmarks.json');
  const citationData = loadJson('golden_regulatory_citations.json');

  console.log(`[DATASETS] Loaded:`);
  console.log(`  - 100 Golden Incidents for Classification (${classificationData.length} records)`);
  console.log(`  - 20 Historical Incidents for RCA Quality (${rcaData.length} records)`);
  console.log(`  - 50 Gulf-Dialect Audio Transcripts across 3 noise bands (${asrData.length} records)`);
  console.log(`  - 50 Statutory Regulatory Citations (${citationData.length} records)\n`);

  // 2. Compute Metrics
  const classMetric = evaluateClassificationAgreement(classificationData);
  const rcaMetric = evaluateRcaQuality(rcaData);
  const asrMetrics = evaluateAsrBenchmarks(asrData);
  const citationMetric = evaluateCitationPrecision(citationData);

  const metrics = {
    classification_agreement: classMetric,
    rca_edit_distance: rcaMetric,
    ...asrMetrics,
    statutory_citation_precision: citationMetric
  };

  // 3. Evaluate Thresholds
  const allPassed = Object.values(metrics).every(m => m.passed);

  console.log('-----------------------------------------------------------------------------');
  console.log('EVALUATION RESULTS & THRESHOLD VERIFICATION:');
  console.log('-----------------------------------------------------------------------------');

  for (const [key, m] of Object.entries(metrics)) {
    const symbol = m.passed ? '✅ PASS' : '❌ FAIL';
    const compStr = `${m.comparison} ${m.threshold}`;
    console.log(`[${symbol}] ${m.metricName}`);
    console.log(`       Measured: ${m.actual} (${m.unit}) | Threshold: ${compStr} | Samples: ${m.sampleCount}`);
  }

  console.log('-----------------------------------------------------------------------------');

  const report: EvaluationSuiteReport = {
    timestamp: new Date().toISOString(),
    overallPassed: allPassed,
    canEnableAiGates: allPassed,
    metrics
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[REPORT] Written to: ${REPORT_PATH}\n`);

  if (!allPassed) {
    console.error('❌ SAFETY GATE BLOCKED: One or more AI safety benchmarks breached thresholds.');
    console.error('   In accordance with Phase 5 criteria, aiGates feature flag MUST REMAIN FALSE.');
    return report;
  }

  console.log('✅ ALL AI SAFETY BENCHMARKS MET OR EXCEEDED THRESHOLDS.');
  console.log('   aiGates feature flag is CERTIFIED for activation in production.');
  return report;
}

// Execute when invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runFullAiEvaluation();
  if (!report.overallPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
