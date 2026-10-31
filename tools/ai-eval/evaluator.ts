/**
 * AI Safety Evaluation Metrics Engine (Phase 5 - Gap G4)
 *
 * Implements:
 * 1. Categorical Agreement Rate vs. Certified Lead Investigators
 * 2. Normalized Levenshtein Edit Distance for RCA Quality
 * 3. Word Error Rate (WER) across Industrial Noise Bands (Clean, Moderate, Heavy)
 * 4. Regulatory Citation Precision against GCC Legal Compendiums
 */

export interface MetricResult {
  metricName: string;
  actual: number;
  threshold: number;
  unit: string;
  comparison: '>=' | '<=';
  passed: boolean;
  sampleCount: number;
  details?: Record<string, any>;
}

export interface EvaluationSuiteReport {
  timestamp: string;
  overallPassed: boolean;
  canEnableAiGates: boolean;
  metrics: Record<string, MetricResult>;
}

/**
 * Computes standard Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Computes normalized string edit distance in range [0, 1]
 */
export function normalizedEditDistance(str1: string, str2: string): number {
  if (!str1 && !str2) return 0;
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 0;
  return levenshteinDistance(str1, str2) / maxLen;
}

/**
 * Word Error Rate (WER) calculation on tokenized word sequences
 */
export function computeWordErrorRate(ref: string, hyp: string): number {
  const refWords = ref.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const hypWords = hyp.toLowerCase().trim().split(/\s+/).filter(Boolean);

  if (refWords.length === 0) return hypWords.length === 0 ? 0 : 1;

  const m = refWords.length;
  const n = hypWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = refWords[i - 1] === hypWords[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n] / m;
}

/**
 * Evaluates 100 incident classifications
 */
export function evaluateClassificationAgreement(dataset: any[]): MetricResult {
  const threshold = 0.85; // 85% required
  let matches = 0;

  for (const item of dataset) {
    const catMatch = item.ground_truth.category === item.model_prediction.category;
    const sevMatch = item.ground_truth.severity === item.model_prediction.severity;
    if (catMatch && sevMatch) {
      matches++;
    }
  }

  const rate = matches / dataset.length;
  return {
    metricName: 'Classification Agreement vs. Certified Investigator',
    actual: Number(rate.toFixed(4)),
    threshold,
    unit: 'ratio',
    comparison: '>=',
    passed: rate >= threshold,
    sampleCount: dataset.length,
    details: { matches, total: dataset.length, agreementPercent: `${(rate * 100).toFixed(1)}%` }
  };
}

/**
 * Evaluates 20 historical RCA causal drafts
 */
export function evaluateRcaQuality(dataset: any[]): MetricResult {
  const threshold = 0.35; // Maximum 0.35 edit distance allowed
  let totalDistance = 0;

  for (const item of dataset) {
    const truthText = `${item.investigator_ground_truth.root_cause} ${item.investigator_ground_truth.five_whys.join(' ')}`;
    const draftText = `${item.ai_draft.root_cause} ${item.ai_draft.five_whys.join(' ')}`;
    const dist = normalizedEditDistance(truthText, draftText);
    totalDistance += dist;
  }

  const avgDistance = totalDistance / dataset.length;
  return {
    metricName: 'RCA Edit Distance after Review',
    actual: Number(avgDistance.toFixed(4)),
    threshold,
    unit: 'norm_edit_distance',
    comparison: '<=',
    passed: avgDistance <= threshold,
    sampleCount: dataset.length,
    details: { avgEditDistance: Number(avgDistance.toFixed(4)), threshold }
  };
}

/**
 * Evaluates 50 Gulf-dialect ASR transcripts across 3 noise bands
 */
export function evaluateAsrBenchmarks(dataset: any[]): Record<string, MetricResult> {
  const cleanItems = dataset.filter(d => d.noise_band === 'clean');
  const modItems = dataset.filter(d => d.noise_band === 'moderate');
  const heavyItems = dataset.filter(d => d.noise_band === 'heavy');

  const calcBandWer = (items: any[]) => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, curr) => acc + computeWordErrorRate(curr.ground_truth_verbatim, curr.model_transcript), 0);
    return sum / items.length;
  };

  const cleanWer = Number(calcBandWer(cleanItems).toFixed(4));
  const modWer = Number(calcBandWer(modItems).toFixed(4));
  const heavyWer = Number(calcBandWer(heavyItems).toFixed(4));

  return {
    wer_clean: {
      metricName: 'WER — Clean Audio (SNR >= 25dB)',
      actual: cleanWer,
      threshold: 0.10,
      unit: 'ratio',
      comparison: '<=',
      passed: cleanWer <= 0.10,
      sampleCount: cleanItems.length
    },
    wer_moderate: {
      metricName: 'WER — Moderate Industrial Noise (15-25dB)',
      actual: modWer,
      threshold: 0.18,
      unit: 'ratio',
      comparison: '<=',
      passed: modWer <= 0.18,
      sampleCount: modItems.length
    },
    wer_heavy: {
      metricName: 'WER — Heavy Industrial Noise (< 15dB)',
      actual: heavyWer,
      threshold: 0.30,
      unit: 'ratio',
      comparison: '<=',
      passed: heavyWer <= 0.30,
      sampleCount: heavyItems.length
    }
  };
}

/**
 * Evaluates 50 regulatory statutory citations
 */
export function evaluateCitationPrecision(dataset: any[]): MetricResult {
  const threshold = 0.95; // 95% precision required
  let matches = 0;

  for (const item of dataset) {
    const isExact = item.retrieved_citation.law === item.expected_statute &&
                    item.retrieved_citation.article === item.expected_article;
    if (isExact) {
      matches++;
    }
  }

  const precision = matches / dataset.length;
  return {
    metricName: 'Statutory Citation Precision',
    actual: Number(precision.toFixed(4)),
    threshold,
    unit: 'ratio',
    comparison: '>=',
    passed: precision >= threshold,
    sampleCount: dataset.length,
    details: { matches, total: dataset.length, precisionPercent: `${(precision * 100).toFixed(1)}%` }
  };
}
