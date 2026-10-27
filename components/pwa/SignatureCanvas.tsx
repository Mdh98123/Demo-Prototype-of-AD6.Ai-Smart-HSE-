import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, Check, PenTool, X, ShieldCheck } from 'lucide-react';

interface SignatureCanvasProps {
  label: string;
  required?: boolean;
  signerName?: string;
  signerRole?: string;
  initialSignature?: string; // Base64 data URL
  onChange: (signatureDataUrl: string | null) => void;
  disabled?: boolean;
  helpText?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  label,
  required = false,
  signerName = 'Field Inspector',
  signerRole = 'Inspector Sign-off',
  initialSignature,
  onChange,
  disabled = false,
  helpText
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(initialSignature));
  const [signatureUrl, setSignatureUrl] = useState<string | null>(initialSignature || null);
  const [signedAt, setSignedAt] = useState<string | null>(initialSignature ? new Date().toISOString() : null);
  const strokesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const currentStrokeRef = useRef<Array<{ x: number; y: number }>>([]);

  // Initialize or resize canvas cleanly
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual width and height scaled by DPR
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.strokeStyle = '#0f172a'; // slate-900
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If an initial signature exists, draw it back onto canvas
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    // Prevent touch scrolling while signing
    if ('touches' in e) {
      e.stopPropagation();
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    currentStrokeRef.current = [{ x, y }];

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    if ('touches' in e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    currentStrokeRef.current.push({ x, y });

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const redrawStrokes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    strokesRef.current.forEach(stroke => {
      if (stroke.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export signature as PNG
    const dataUrl = canvas.toDataURL('image/png');
    setHasSignature(true);
    setSignatureUrl(dataUrl);
    const nowIso = new Date().toISOString();
    setSignedAt(nowIso);
    onChange(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    strokesRef.current = [];
    currentStrokeRef.current = [];
    setHasSignature(false);
    setSignatureUrl(null);
    setSignedAt(null);
    onChange(null);
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    redrawStrokes();

    const canvas = canvasRef.current;
    if (!canvas) return;
    if (strokesRef.current.length === 0) {
      setHasSignature(false);
      setSignatureUrl(null);
      setSignedAt(null);
      onChange(null);
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureUrl(dataUrl);
      onChange(dataUrl);
    }
  };

  return (
    <div className="space-y-2 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <PenTool size={13} className="text-indigo-600" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        {hasSignature && (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck size={11} />
            <span>Signed</span>
          </span>
        )}
      </div>

      {helpText && (
        <p className="text-[11px] text-slate-500 leading-snug">{helpText}</p>
      )}

      {/* Signature Canvas Box */}
      <div className="relative rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 overflow-hidden focus-within:border-indigo-500">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className={`w-full h-36 touch-none cursor-crosshair bg-transparent ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        />

        {/* Placeholder Watermark when empty */}
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 select-none">
            <PenTool size={22} className="opacity-30 mb-1" />
            <span className="text-xs font-semibold">Sign here with finger or stylus</span>
            <span className="text-[10px] text-slate-400/80">Touch & draw signature inside box</span>
          </div>
        )}

        {/* Baseline Line */}
        <div className="absolute bottom-6 inset-x-6 border-b border-slate-200/90 pointer-events-none flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>✕ Sign on line above</span>
          <span>{signerRole}</span>
        </div>
      </div>

      {/* Signatory Metadata & Action Buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[60%]">
          <span className="font-bold text-slate-700">{signerName}</span>
          {signedAt && (
            <span className="text-[10px] text-slate-400 ms-1 font-mono">
              • {new Date(signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {!disabled && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokesRef.current.length === 0}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40"
              title="Undo stroke"
            >
              <RotateCcw size={11} />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasSignature}
              className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40"
              title="Clear signature"
            >
              <X size={11} />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureCanvas;
