/**
 * Machine Learning Auto-Tagger Service for Mobile Field Inspections
 * Runs client-side TensorFlow.js MobileNet inference combined with edge computer vision
 * to automatically suggest HSE safety keywords ('scaffolding', 'PPE', 'corrosion', etc.)
 * for offline database storage and accelerated field searchability.
 */

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export interface MLPrediction {
  label: string;
  probability: number;
}

export interface AutoTagResult {
  suggestedTags: string[];
  confidenceScores: Record<string, number>;
  primaryCategory: string;
  detectedFeatures: {
    hasCorrosionSignature: boolean;
    hasHighVisSignature: boolean;
    hasLatticeStructure: boolean;
    rawPredictions: MLPrediction[];
  };
  inferenceTimeMs: number;
  engine: string;
}

// Comprehensive HSE Semantic Domain Mappings for MobileNet ImageNet classes
const HSE_KEYWORD_MAPPINGS: Record<string, { tags: string[]; category: string }> = {
  // Scaffolding & Working at Height
  'scaffold': { tags: ['scaffolding', 'work at height', 'elevated structure'], category: 'Working at Height' },
  'ladder': { tags: ['ladder', 'work at height', 'access equipment'], category: 'Working at Height' },
  'pier': { tags: ['scaffolding', 'structural column', 'framework'], category: 'Working at Height' },
  'bridge': { tags: ['scaffolding', 'steel structure', 'rigging'], category: 'Working at Height' },
  'drilling platform': { tags: ['drilling rig', 'working at height', 'process plant'], category: 'Process Plant' },
  'crane': { tags: ['crane', 'lifting operations', 'rigging', 'overhead load'], category: 'Lifting & Rigging' },
  'hook': { tags: ['lifting hook', 'rigging', 'tethering'], category: 'Lifting & Rigging' },
  'chain': { tags: ['slings', 'rigging', 'lashing'], category: 'Lifting & Rigging' },

  // Personal Protective Equipment (PPE)
  'helmet': { tags: ['PPE', 'hard hat', 'head protection'], category: 'Workforce PPE' },
  'crash helmet': { tags: ['PPE', 'safety helmet', 'hard hat'], category: 'Workforce PPE' },
  'mask': { tags: ['PPE', 'respiratory protection', 'face shield'], category: 'Workforce PPE' },
  'gasmask': { tags: ['PPE', 'breathing apparatus', 'gas mask', 'confined space'], category: 'Workforce PPE' },
  'vest': { tags: ['PPE', 'high-vis vest', 'reflective wear'], category: 'Workforce PPE' },
  'suit': { tags: ['PPE', 'coveralls', 'flame resistant'], category: 'Workforce PPE' },
  'boot': { tags: ['PPE', 'safety boots', 'footwear'], category: 'Workforce PPE' },
  'apron': { tags: ['PPE', 'chemical apron'], category: 'Workforce PPE' },
  'goggles': { tags: ['PPE', 'eye protection', 'safety glasses'], category: 'Workforce PPE' },

  // Corrosion, Piping & Asset Integrity
  'rust': { tags: ['corrosion', 'rust', 'surface degradation', 'pipe integrity'], category: 'Asset Integrity' },
  'pipe': { tags: ['pipeline', 'flange', 'corrosion risk'], category: 'Asset Integrity' },
  'barrel': { tags: ['drum storage', 'corrosion', 'chemical containment'], category: 'Chemical Safety' },
  'cask': { tags: ['storage vessel', 'corrosion', 'integrity'], category: 'Asset Integrity' },
  'tank': { tags: ['storage tank', 'confined space', 'integrity'], category: 'Process Plant' },
  'boiler': { tags: ['pressure vessel', 'corrosion', 'process safety'], category: 'Process Plant' },
  'radiator': { tags: ['heat exchanger', 'corrosion', 'maintenance'], category: 'Maintenance' },
  'valve': { tags: ['valve', 'piping', 'isolation point'], category: 'Control of Work' },

  // Fire & Emergency Safety
  'extinguisher': { tags: ['fire safety', 'fire extinguisher', 'emergency equipment'], category: 'Emergency' },
  'fire screen': { tags: ['fire barrier', 'hot work control'], category: 'Emergency' },

  // Electrical & Machinery Hazards
  'electric': { tags: ['electrical hazard', 'switchgear', 'LOTO'], category: 'Electrical Safety' },
  'generator': { tags: ['generator', 'power unit', 'LOTO'], category: 'Electrical Safety' },
  'switch': { tags: ['electrical panel', 'LOTO', 'isolation'], category: 'Electrical Safety' },
  'drill': { tags: ['power tool', 'hand tool', 'vibration'], category: 'Tools & Machinery' },
  'saw': { tags: ['machine guard', 'cutting tool', 'amputation risk'], category: 'Tools & Machinery' },
  'forklift': { tags: ['forklift', 'plant transport', 'pedestrian safety'], category: 'Transport & Logistics' },
  'tractor': { tags: ['heavy machinery', 'mobile equipment'], category: 'Transport & Logistics' }
};

class MLAutoTaggerService {
  private model: mobilenet.MobileNet | null = null;
  private isModelLoading: boolean = false;
  private modelLoadPromise: Promise<mobilenet.MobileNet | null> | null = null;
  private isTfReady: boolean = false;

  constructor() {
    this.initTf();
  }

  private async initTf() {
    if (typeof window === 'undefined') return;
    try {
      await tf.ready();
      this.isTfReady = true;
    } catch (err) {
      console.warn('[ML AutoTagger] TF ready initialization notice:', err);
    }
  }

  /**
   * Lazily loads the MobileNet model in the browser.
   * Model weights are cached by browser Cache API after first download.
   */
  public async loadModel(): Promise<mobilenet.MobileNet | null> {
    if (this.model) return this.model;
    if (this.modelLoadPromise) return this.modelLoadPromise;

    this.isModelLoading = true;
    this.modelLoadPromise = (async () => {
      try {
        if (!this.isTfReady) {
          await tf.ready();
          this.isTfReady = true;
        }
        // Load fast mobile-optimized version 2 (alpha 0.50 for <10MB memory footprint on mobile devices)
        const loadedModel = await mobilenet.load({
          version: 2,
          alpha: 0.50
        });
        this.model = loadedModel;
        return loadedModel;
      } catch (err) {
        console.warn('[ML AutoTagger] MobileNet load fallback:', err);
        return null;
      } finally {
        this.isModelLoading = false;
      }
    })();

    return this.modelLoadPromise;
  }

  /**
   * Primary Analysis Method: Accepts image data URL, HTMLImageElement, or Canvas
   * Executes dual-stage analysis:
   * 1. Edge-based pixel analysis (Rust/Corrosion hue, High-Vis fluorescence, Scaffolding lattice)
   * 2. Browser-side MobileNet classification via TensorFlow.js
   * Returns prioritized HSE tags ready for 1-click inspector acceptance.
   */
  public async autoTagImage(imageSource: string | HTMLImageElement | HTMLCanvasElement): Promise<AutoTagResult> {
    const startTime = performance.now();
    const tagSet = new Set<string>();
    const confidenceScores: Record<string, number> = {};
    const rawPredictions: MLPrediction[] = [];

    // 1. Prepare HTMLImageElement and Offscreen Canvas for pixel inspection
    const { imgElement, canvas, ctx } = await this.prepareImageAndCanvas(imageSource);

    // 2. Run Edge Vision Pixel Heuristics (instant, 100% offline without network delay)
    const pixelFeatures = this.analyzePixelFeatures(canvas, ctx);

    if (pixelFeatures.hasCorrosionSignature) {
      this.addTag(tagSet, confidenceScores, 'corrosion', 0.92);
      this.addTag(tagSet, confidenceScores, 'rust', 0.88);
      this.addTag(tagSet, confidenceScores, 'surface oxidation', 0.82);
    }

    if (pixelFeatures.hasHighVisSignature) {
      this.addTag(tagSet, confidenceScores, 'PPE', 0.95);
      this.addTag(tagSet, confidenceScores, 'high-vis', 0.90);
      this.addTag(tagSet, confidenceScores, 'safety gear', 0.85);
    }

    if (pixelFeatures.hasLatticeStructure) {
      this.addTag(tagSet, confidenceScores, 'scaffolding', 0.89);
      this.addTag(tagSet, confidenceScores, 'work at height', 0.84);
      this.addTag(tagSet, confidenceScores, 'steel structure', 0.78);
    }

    // 3. Execute TensorFlow.js MobileNet Deep Learning Classification
    try {
      const model = await this.loadModel();
      if (model && imgElement) {
        const predictions = await model.classify(imgElement, 5);
        for (const pred of predictions) {
          rawPredictions.push({
            label: pred.className,
            probability: Math.round(pred.probability * 100) / 100
          });

          // Match raw classification against HSE taxonomy
          const lowerClass = pred.className.toLowerCase();
          for (const [key, mapping] of Object.entries(HSE_KEYWORD_MAPPINGS)) {
            if (lowerClass.includes(key)) {
              for (const tag of mapping.tags) {
                const calculatedConfidence = Math.min(0.98, Math.max(0.70, pred.probability + 0.3));
                this.addTag(tagSet, confidenceScores, tag, calculatedConfidence);
              }
            }
          }
        }
      }
    } catch (tfErr) {
      console.warn('[ML AutoTagger] TensorFlow inference notice (relying on edge vision):', tfErr);
    }

    // Default fallback tags if photo was ambiguous
    if (tagSet.size === 0) {
      this.addTag(tagSet, confidenceScores, 'field evidence', 0.70);
      this.addTag(tagSet, confidenceScores, 'site inspection', 0.65);
    }

    // Sort tags by confidence score
    const sortedTags = Array.from(tagSet).sort((a, b) => (confidenceScores[b] || 0) - (confidenceScores[a] || 0));

    // Determine primary category
    let primaryCategory = 'General Inspection';
    if (sortedTags.includes('corrosion') || sortedTags.includes('rust')) {
      primaryCategory = 'Asset Integrity & Corrosion';
    } else if (sortedTags.includes('scaffolding') || sortedTags.includes('work at height')) {
      primaryCategory = 'Scaffolding & Working at Height';
    } else if (sortedTags.includes('PPE') || sortedTags.includes('hard hat')) {
      primaryCategory = 'Workforce Safety & PPE';
    } else if (sortedTags.includes('lifting operations') || sortedTags.includes('crane')) {
      primaryCategory = 'Lifting & Rigging';
    } else if (sortedTags.includes('electrical hazard') || sortedTags.includes('LOTO')) {
      primaryCategory = 'Electrical & Energy Isolation';
    }

    const duration = Math.round(performance.now() - startTime);

    return {
      suggestedTags: sortedTags.slice(0, 6),
      confidenceScores,
      primaryCategory,
      detectedFeatures: {
        hasCorrosionSignature: pixelFeatures.hasCorrosionSignature,
        hasHighVisSignature: pixelFeatures.hasHighVisSignature,
        hasLatticeStructure: pixelFeatures.hasLatticeStructure,
        rawPredictions
      },
      inferenceTimeMs: duration,
      engine: 'TensorFlow.js MobileNet v2 + Edge Vision'
    };
  }

  /**
   * Maps raw ML predictions into domain-specific HSE taxonomy tags and category
   */
  public mapPredictionsToHSE(predictions: { className: string; probability: number }[]): {
    tags: string[];
    category: string;
    scores: Record<string, number>;
  } {
    const tagSet = new Set<string>();
    const scores: Record<string, number> = {};

    for (const pred of predictions) {
      const lowerClass = (pred.className || '').toLowerCase();
      for (const [key, mapping] of Object.entries(HSE_KEYWORD_MAPPINGS)) {
        if (lowerClass.includes(key)) {
          for (const tag of mapping.tags) {
            const calculatedConfidence = Math.min(0.98, Math.max(0.70, pred.probability + 0.3));
            this.addTag(tagSet, scores, tag, calculatedConfidence);
          }
        }
      }
    }

    const sortedTags = Array.from(tagSet).sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    let category = 'General Inspection';
    if (sortedTags.includes('corrosion') || sortedTags.includes('rust')) {
      category = 'Asset Integrity';
    } else if (sortedTags.includes('scaffolding') || sortedTags.includes('work at height')) {
      category = 'Working at Height';
    } else if (sortedTags.includes('PPE') || sortedTags.includes('hard hat')) {
      category = 'Workforce PPE';
    } else if (sortedTags.includes('crane') || sortedTags.includes('lifting hook')) {
      category = 'Lifting & Rigging';
    }

    return {
      tags: sortedTags,
      category,
      scores
    };
  }

  private addTag(set: Set<string>, scores: Record<string, number>, tag: string, confidence: number) {
    set.add(tag);
    if (!scores[tag] || confidence > scores[tag]) {
      scores[tag] = Math.round(confidence * 100) / 100;
    }
  }

  /**
   * Helper to load an image into a DOM element and render to offscreen canvas
   */
  private async prepareImageAndCanvas(source: string | HTMLImageElement | HTMLCanvasElement): Promise<{
    imgElement: HTMLImageElement | null;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  }> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    if (source instanceof HTMLCanvasElement) {
      canvas.width = source.width;
      canvas.height = source.height;
      ctx.drawImage(source, 0, 0);

      // Create dummy img for tfjs
      const img = new Image();
      img.src = canvas.toDataURL();
      await new Promise(r => { img.onload = r; });
      return { imgElement: img, canvas, ctx };
    }

    if (source instanceof HTMLImageElement) {
      canvas.width = source.naturalWidth || source.width || 320;
      canvas.height = source.naturalHeight || source.height || 240;
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      return { imgElement: source, canvas, ctx };
    }

    // String Data URL
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = source;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => resolve(null);
    });

    canvas.width = img.width || 320;
    canvas.height = img.height || 240;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { imgElement: img, canvas, ctx };
  }

  /**
   * Fast client-side pixel heuristics:
   * - Corrosion / Rust: Detects reddish-brown iron oxide hue clustering
   * - High-Vis PPE: Detects neon lime/fluorescent safety orange reflectance
   * - Lattice: Detects scaffolding pole structural edges
   */
  private analyzePixelFeatures(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    let hasCorrosionSignature = false;
    let hasHighVisSignature = false;
    let hasLatticeStructure = false;

    try {
      const sampleWidth = Math.min(canvas.width, 160);
      const sampleHeight = Math.min(canvas.height, 120);
      const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
      const data = imgData.data;
      const totalPixels = sampleWidth * sampleHeight;

      let rustPixels = 0;
      let highVisPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Rust / Corrosion: Red > Green > Blue (R > 110, G: 40-110, B: < 60, R - G > 30)
        if (r > 105 && g > 40 && g < 115 && b < 70 && (r - g) > 25) {
          rustPixels++;
        }

        // High-Vis PPE: High brightness + saturated yellow-green or neon orange
        // Neon Yellow: R > 170, G > 180, B < 90
        // Safety Orange: R > 200, G: 80-140, B < 60
        const isNeonYellow = r > 160 && g > 170 && b < 95;
        const isSafetyOrange = r > 195 && g >= 75 && g <= 145 && b < 70;
        if (isNeonYellow || isSafetyOrange) {
          highVisPixels++;
        }
      }

      const rustRatio = rustPixels / totalPixels;
      const highVisRatio = highVisPixels / totalPixels;

      // Thresholds: > 2.5% of sampled frame
      hasCorrosionSignature = rustRatio > 0.025;
      hasHighVisSignature = highVisRatio > 0.020;

      // Simple grid edge density heuristic for scaffolding poles
      let edgeCount = 0;
      for (let y = 1; y < sampleHeight - 1; y += 4) {
        for (let x = 1; x < sampleWidth - 1; x += 4) {
          const idx = (y * sampleWidth + x) * 4;
          const leftIdx = (y * sampleWidth + (x - 1)) * 4;
          const diff = Math.abs(data[idx] - data[leftIdx]);
          if (diff > 45) edgeCount++;
        }
      }
      hasLatticeStructure = (edgeCount / (totalPixels / 16)) > 0.18;

    } catch (e) {
      console.warn('[ML AutoTagger] Pixel heuristic caught:', e);
    }

    return {
      hasCorrosionSignature,
      hasHighVisSignature,
      hasLatticeStructure
    };
  }
}

export const mlAutoTagger = new MLAutoTaggerService();
export default mlAutoTagger;
