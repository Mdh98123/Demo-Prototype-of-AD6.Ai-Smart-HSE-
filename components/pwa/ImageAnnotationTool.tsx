import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowUpRight, Circle, Edit3, Tag, RotateCcw, Trash2, Check,
  Camera, AlertOctagon, Sparkles, Layers, ShieldAlert,
  ChevronDown, ZoomIn, Cpu, Bot, Plus, X, CheckCircle2,
  SlidersHorizontal, HardHat
} from 'lucide-react';
import { mlAutoTagger, AutoTagResult } from '../../services/mlAutoTaggerService';

export type ToolType = 'arrow' | 'circle' | 'freehand' | 'tag';

export interface DefectAnnotation {
  id: string;
  type: ToolType;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  points?: { x: number; y: number }[];
  color: string;
  lineWidth: number;
  label?: string;
}

interface ImageAnnotationToolProps {
  imageSrc: string;
  onSave: (annotatedDataUrl: string, caption: string, tags?: string[]) => Promise<void> | void;
  onRetake: () => void;
  onClose?: () => void;
  isSaving?: boolean;
  initialCaption?: string;
  targetRecordTitle?: string;
}

const COLOR_OPTIONS = [
  { label: 'Safety Hazard Red', value: '#EF4444', class: 'bg-red-500 ring-red-400' },
  { label: 'Warning Amber', value: '#F59E0B', class: 'bg-amber-500 ring-amber-400' },
  { label: 'High-Vis Yellow', value: '#EAB308', class: 'bg-yellow-400 ring-yellow-300' },
  { label: 'Industrial Cyan', value: '#06B6D4', class: 'bg-cyan-500 ring-cyan-400' },
  { label: 'Contrast White', value: '#FFFFFF', class: 'bg-white ring-slate-300' },
];

const STROKE_OPTIONS = [
  { label: 'Thin', value: 3, dotSize: 'w-1.5 h-1.5' },
  { label: 'Medium', value: 6, dotSize: 'w-2.5 h-2.5' },
  { label: 'Bold', value: 10, dotSize: 'w-3.5 h-3.5' },
];

const PRESET_DEFECT_TAGS = [
  'MISSING GUARD',
  'LEAK / SPILL',
  'ELECTRICAL HAZARD',
  'TRIP / FALL HAZARD',
  'LOTO VIOLATION',
  'STRUCTURAL CRACK',
  'PPE DEFECT',
  'CORROSION / RUST'
];

export const ImageAnnotationTool: React.FC<ImageAnnotationToolProps> = ({
  imageSrc,
  onSave,
  onRetake,
  onClose,
  isSaving = false,
  initialCaption = '',
  targetRecordTitle
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Tool state
  const [activeTool, setActiveTool] = useState<ToolType>('arrow');
  const [selectedColor, setSelectedColor] = useState<string>('#EF4444'); // Default Safety Red
  const [selectedLineWidth, setSelectedLineWidth] = useState<number>(6);
  const [selectedTagLabel, setSelectedTagLabel] = useState<string>('DEFECT');
  const [caption, setCaption] = useState<string>(initialCaption);

  // Drawing state
  const [annotations, setAnnotations] = useState<DefectAnnotation[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const currentAnnotationRef = useRef<DefectAnnotation | null>(null);
  const [currentAnnotationState, setCurrentAnnotationState] = useState<DefectAnnotation | null>(null);

  // ML Auto-Tagger state (TensorFlow.js Edge)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(true);
  const [mlResult, setMlResult] = useState<AutoTagResult | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [showAllTags, setShowAllTags] = useState<boolean>(false);

  // Load the captured image into an HTMLImageElement
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      setImageElement(img);
    };
  }, [imageSrc]);

  // Run TensorFlow.js MobileNet + Edge Vision auto-tagger on captured frame
  useEffect(() => {
    let isCancelled = false;
    const runAutoTagger = async () => {
      setIsAnalyzingImage(true);
      try {
        const result = await mlAutoTagger.autoTagImage(imageSrc);
        if (!isCancelled) {
          setMlResult(result);
          // Automatically check the top suggested tags
          setSelectedTags(result.suggestedTags || []);
        }
      } catch (err) {
        console.warn('[AutoTagger UI] Analysis notice:', err);
      } finally {
        if (!isCancelled) {
          setIsAnalyzingImage(false);
        }
      }
    };

    runAutoTagger();
    return () => {
      isCancelled = true;
    };
  }, [imageSrc]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customTagInput.trim().toLowerCase();
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags(prev => [...prev, clean]);
      setCustomTagInput('');
    }
  };

  // Redraw canvas whenever annotations, active image, or current drag change
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageElement) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw base photo
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    // Helper for drop shadow / high contrast border
    const applySafetyStyle = (strokeColor: string, width: number) => {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = strokeColor;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    // 2. Draw Arrow
    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) => {
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      const headLength = Math.max(18, width * 3.2);

      ctx.save();
      applySafetyStyle(color, width);

      // Shaft
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Sharp Arrowhead
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // 3. Draw Circle / Ellipse
    const drawCircle = (fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) => {
      const cx = (fromX + toX) / 2;
      const cy = (fromY + toY) / 2;
      const rx = Math.max(Math.abs(toX - fromX) / 2, 8);
      const ry = Math.max(Math.abs(toY - fromY) / 2, 8);

      ctx.save();
      applySafetyStyle(color, width);

      // Outer bounding ellipse
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // Subtle semi-transparent crosshair center guide for precision
      ctx.restore();
    };

    // 4. Draw Freehand
    const drawFreehand = (points: { x: number; y: number }[], color: string, width: number) => {
      if (points.length < 2) return;
      ctx.save();
      applySafetyStyle(color, width);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    };

    // 5. Draw Defect Tag Stamp
    const drawTag = (x: number, y: number, text: string, color: string) => {
      ctx.save();
      ctx.font = 'bold 18px "Inter", system-ui, sans-serif';
      const textMetrics = ctx.measureText(text);
      const padding = 10;
      const boxWidth = textMetrics.width + padding * 2;
      const boxHeight = 32;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Tag background
      ctx.fillStyle = color;
      ctx.beginPath();
      // Rounded rect
      const r = 6;
      const bx = x - boxWidth / 2;
      const by = y - boxHeight / 2;
      ctx.roundRect(bx, by, boxWidth, boxHeight, r);
      ctx.fill();

      // White border
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Text
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = color === '#FFFFFF' ? '#000000' : '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    // Draw all stored annotations
    for (const ann of annotations) {
      if (ann.type === 'arrow') {
        drawArrow(ann.startX, ann.startY, ann.endX, ann.endY, ann.color, ann.lineWidth);
      } else if (ann.type === 'circle') {
        drawCircle(ann.startX, ann.startY, ann.endX, ann.endY, ann.color, ann.lineWidth);
      } else if (ann.type === 'freehand' && ann.points) {
        drawFreehand(ann.points, ann.color, ann.lineWidth);
      } else if (ann.type === 'tag') {
        drawTag(ann.startX, ann.startY, ann.label || 'DEFECT', ann.color);
      }
    }

    // Draw current in-progress annotation
    const current = currentAnnotationRef.current;
    if (current) {
      if (current.type === 'arrow') {
        drawArrow(current.startX, current.startY, current.endX, current.endY, current.color, current.lineWidth);
      } else if (current.type === 'circle') {
        drawCircle(current.startX, current.startY, current.endX, current.endY, current.color, current.lineWidth);
      } else if (current.type === 'freehand' && current.points) {
        drawFreehand(current.points, current.color, current.lineWidth);
      } else if (current.type === 'tag') {
        drawTag(current.startX, current.startY, current.label || 'DEFECT', current.color);
      }
    }
  }, [imageElement, annotations]);

  // Adjust canvas resolution to match source photo dimensions on load
  useEffect(() => {
    if (!imageElement || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = imageElement.naturalWidth || 1280;
    canvas.height = imageElement.naturalHeight || 720;
    renderCanvas();
  }, [imageElement, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [annotations, currentAnnotationState, renderCanvas]);

  // Transform screen client coordinates to canvas coordinate space
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Pointer event handlers with pointer capture for touchscreens & mouse
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);

    if (activeTool === 'tag') {
      // Instant stamp placement
      const newTag: DefectAnnotation = {
        id: `tag-${Date.now()}`,
        type: 'tag',
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color: selectedColor,
        lineWidth: selectedLineWidth,
        label: selectedTagLabel
      };
      setAnnotations(prev => [...prev, newTag]);
      setIsDrawing(false);
      return;
    }

    const newAnnotation: DefectAnnotation = {
      id: `ann-${Date.now()}`,
      type: activeTool,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      points: activeTool === 'freehand' ? [{ x, y }] : undefined,
      color: selectedColor,
      lineWidth: selectedLineWidth,
      label: selectedTagLabel
    };

    currentAnnotationRef.current = newAnnotation;
    setCurrentAnnotationState(newAnnotation);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotationRef.current) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);

    if (currentAnnotationRef.current.type === 'freehand') {
      const pts = currentAnnotationRef.current.points || [];
      pts.push({ x, y });
      currentAnnotationRef.current = {
        ...currentAnnotationRef.current,
        points: pts,
        endX: x,
        endY: y
      };
    } else {
      currentAnnotationRef.current = {
        ...currentAnnotationRef.current,
        endX: x,
        endY: y
      };
    }

    setCurrentAnnotationState({ ...currentAnnotationRef.current });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    setIsDrawing(false);
    if (currentAnnotationRef.current) {
      // Filter out tiny accidental taps for arrows/circles
      const { startX, startY, endX, endY, type } = currentAnnotationRef.current;
      const dist = Math.hypot(endX - startX, endY - startY);
      if (type !== 'freehand' && dist < 12) {
        // Tap with circle creates a default radius highlight around defect
        if (type === 'circle') {
          const autoCircle: DefectAnnotation = {
            ...currentAnnotationRef.current,
            startX: startX - 35,
            startY: startY - 35,
            endX: startX + 35,
            endY: startY + 35
          };
          setAnnotations(prev => [...prev, autoCircle]);
        }
      } else {
        setAnnotations(prev => [...prev, currentAnnotationRef.current!]);
      }
      currentAnnotationRef.current = null;
      setCurrentAnnotationState(null);
    }
  };

  const handlePointerCancel = () => {
    setIsDrawing(false);
    currentAnnotationRef.current = null;
    setCurrentAnnotationState(null);
  };

  const handleUndo = () => {
    setAnnotations(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (annotations.length === 0) return;
    setAnnotations([]);
  };

  const handleSaveAnnotatedImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export final canvas (photo + annotations rendered) to high quality JPEG data URL
    const finalDataUrl = canvas.toDataURL('image/jpeg', 0.94);
    await onSave(finalDataUrl, caption, selectedTags);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white select-none overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
            <ShieldAlert size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-black text-xs uppercase tracking-wider">
                Safety Defect Annotator
              </h3>
              {annotations.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                  {annotations.length} defect mark{annotations.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[11px] truncate max-w-[200px] sm:max-w-xs">
              Draw red arrows or circles to highlight defects before saving
            </p>
          </div>
        </div>

        {/* Undo & Clear Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={annotations.length === 0 || isSaving}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
            title="Undo last annotation"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={annotations.length === 0 || isSaving}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-red-400 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
            title="Clear all annotations"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Interactive Drawing Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative min-h-0 bg-black flex items-center justify-center p-2 sm:p-4 overflow-hidden touch-none"
      >
        <div className="relative max-w-full max-h-full flex items-center justify-center rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className="cursor-crosshair max-w-full max-h-[50vh] sm:max-h-[58vh] object-contain touch-none select-none block"
            style={{ touchAction: 'none' }}
          />

          {/* Interactive Tool Guidance Pill */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
            <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-bold text-slate-200 flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
              <span className="uppercase tracking-wider">
                {activeTool === 'arrow' && 'Drag to draw Red Arrow'}
                {activeTool === 'circle' && 'Drag or tap to draw Red Circle'}
                {activeTool === 'freehand' && 'Sketch defect boundary'}
                {activeTool === 'tag' && `Tap to stamp "${selectedTagLabel}"`}
              </span>
            </div>
            {targetRecordTitle && (
              <div className="px-2 py-0.5 rounded-md bg-slate-900/80 text-[10px] text-slate-400 border border-slate-800">
                {targetRecordTitle}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tool Selection Toolbar */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 shrink-0 space-y-3">
        {/* Row 1: Primary Drawing Tools (Red Arrow, Red Circle, Freehand, Tag) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 flex-1">
            {/* Arrow Tool */}
            <button
              type="button"
              onClick={() => setActiveTool('arrow')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTool === 'arrow'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Red Defect Arrow"
            >
              <ArrowUpRight size={15} />
              <span>Arrow</span>
            </button>

            {/* Circle Tool */}
            <button
              type="button"
              onClick={() => setActiveTool('circle')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTool === 'circle'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Red Defect Circle"
            >
              <Circle size={15} />
              <span>Circle</span>
            </button>

            {/* Freehand Tool */}
            <button
              type="button"
              onClick={() => setActiveTool('freehand')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTool === 'freehand'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Freehand Defect Outline"
            >
              <Edit3 size={15} />
              <span>Pen</span>
            </button>

            {/* Tag Stamp Tool */}
            <button
              type="button"
              onClick={() => setActiveTool('tag')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTool === 'tag'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Hazard Stamp"
            >
              <Tag size={15} />
              <span>Tag</span>
            </button>
          </div>

          {/* Stroke Width Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 shrink-0">
            {STROKE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedLineWidth(opt.value)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  selectedLineWidth === opt.value
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`${opt.label} stroke width`}
              >
                <div className={`rounded-full bg-current ${opt.dotSize}`} />
              </button>
            ))}
          </div>

          {/* Color Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 shrink-0">
            {COLOR_OPTIONS.slice(0, 3).map(col => (
              <button
                key={col.value}
                type="button"
                onClick={() => setSelectedColor(col.value)}
                className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${col.class} ${
                  selectedColor === col.value ? 'ring-2 ring-offset-2 ring-offset-slate-950 scale-110' : 'opacity-80 hover:opacity-100'
                }`}
                title={col.label}
              />
            ))}
          </div>
        </div>

        {/* Row 2: Tag Preset Selector (When Tag tool is active or quick defect chip click) */}
        {activeTool === 'tag' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Stamp:</span>
            {PRESET_DEFECT_TAGS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTagLabel(t)}
                className={`px-2 py-1 rounded-md text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                  selectedTagLabel === t
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* ML Auto-Tagger Section (TensorFlow.js Edge & Offline Vision) */}
        <div className="bg-slate-900/90 border border-indigo-900/40 rounded-xl p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Cpu size={12} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300">
                TensorFlow.js Auto-Tagger
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 rounded font-mono">
                Edge ML
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              {isAnalyzingImage ? (
                <div className="flex items-center gap-1.5 text-indigo-300">
                  <div className="w-3 h-3 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
                  <span>Classifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
                  <span>{mlResult?.inferenceTimeMs ? `${mlResult.inferenceTimeMs}ms` : 'Edge'}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-bold">{selectedTags.length} tags indexed</span>
                </div>
              )}
            </div>
          </div>

          {/* Feature detection badges */}
          {mlResult && !isAnalyzingImage && (
            <div className="flex flex-wrap items-center gap-1 text-[9px]">
              {mlResult.detectedFeatures.hasCorrosionSignature && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Corrosion Signature Detected
                </span>
              )}
              {mlResult.detectedFeatures.hasHighVisSignature && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  High-Vis / PPE Detected
                </span>
              )}
              {mlResult.detectedFeatures.hasLatticeStructure && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Lattice / Scaffolding Structure
                </span>
              )}
            </div>
          )}

          {/* Suggested tags chips with confidence scores */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[10px] text-slate-400 font-bold shrink-0">Keywords:</span>
            {Array.from(new Set([...(mlResult?.suggestedTags || []), ...selectedTags, 'scaffolding', 'PPE', 'corrosion'])).slice(0, showAllTags ? 15 : 6).map(tag => {
              const isSelected = selectedTags.includes(tag);
              const confidence = mlResult?.confidenceScores?.[tag];
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/60 shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{isSelected ? '✓' : '+'}</span>
                  <span>{tag}</span>
                  {confidence !== undefined && (
                    <span className="text-[9px] opacity-75 font-mono">
                      {Math.round(confidence * 100)}%
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowAllTags(prev => !prev)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 shrink-0 font-medium px-1"
            >
              {showAllTags ? 'Fewer' : '+More'}
            </button>
          </div>

          {/* Quick custom tag input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomTag(e); }}
              placeholder="Add custom keyword (e.g. valve, tripping hazard)..."
              className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleAddCustomTag()}
              disabled={!customTagInput.trim()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-[10px] font-bold border border-slate-700 flex items-center gap-1 transition-all"
            >
              <Plus size={11} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Caption & Defect Notes Input */}
        <div className="relative">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Defect description (e.g. Broken interlocking guard on conveyer roller)..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Quick Defect Recommendation Tags to append to caption */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
          <span className="text-[10px] text-slate-500 font-bold shrink-0">Add Note:</span>
          {['Missing Guard', 'Oil Leak', 'Damaged Cable', 'Trip Hazard', 'No LOTO Tag'].map(label => (
            <button
              key={label}
              type="button"
              onClick={() => {
                const updated = caption ? `${caption}; ${label}` : label;
                setCaption(updated);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 hover:text-white whitespace-nowrap transition-colors"
            >
              + {label}
            </button>
          ))}
        </div>

        {/* Bottom Actions: Retake vs. Save to Offline DB */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onRetake}
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Camera size={15} />
            <span>Retake Photo</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAnnotatedImage}
            disabled={isSaving}
            className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Compressing & Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save to Offline DB</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
