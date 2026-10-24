import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, X, AlertOctagon, 
  MapPin, CheckCircle2, Lock, ArrowRight, ShieldCheck, 
  Flame, Radio, Info
} from 'lucide-react';
import { SimopsConflict } from '../../services/simopsService';

interface SimopsClashModalProps {
  isOpen: boolean;
  conflict: SimopsConflict;
  currentPermitNumber: string;
  currentPermitType: string;
  onClose: () => void;
  onLockAuthorization: () => void;
  onApplyOverride: (justification: string) => void;
}

export const SimopsClashModal: React.FC<SimopsClashModalProps> = ({
  isOpen,
  conflict,
  currentPermitNumber,
  currentPermitType,
  onClose,
  onLockAuthorization,
  onApplyOverride
}) => {
  const [overrideText, setOverrideText] = useState('');
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [controllerPin, setControllerPin] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-red-500/80 rounded-2xl shadow-2xl shadow-red-950/50 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Animated Warning Banner Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 p-5 border-b border-red-500/40 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-600/30 border border-red-500/60 rounded-xl text-red-400 animate-pulse">
              <AlertOctagon size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500 text-white">
                  SIMOPS Critical Conflict
                </span>
                <span className="text-xs text-red-300 font-mono">
                  Code Red: Co-Activity Violation
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Spatial Separation Clash Detected
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-slate-200">
          
          {/* Conflicting Permits Radar Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3">
              <span className="flex items-center gap-1.5 text-red-400">
                <Radio size={14} className="animate-spin text-red-500" />
                Active Co-Location Overlap
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin size={13} />
                {conflict.clashingZone}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Requested Permit */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-amber-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Target Permit (Pending)
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {currentPermitNumber}
                  </span>
                </div>
                <div className="mt-2 text-sm font-bold text-white flex items-center gap-2">
                  <Flame size={16} className="text-amber-400" />
                  {currentPermitType}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Welding / Flame ignition operation in process envelope
                </p>
              </div>

              {/* Clashing Active Permit */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-red-500/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                    Simultaneous Active Operation
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {conflict.clashingPermitNumber}
                  </span>
                </div>
                <div className="mt-2 text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  {conflict.clashingPermitType}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {conflict.clashingPermitTitle}
                </p>
              </div>
            </div>

            {/* Separation Distance Breach Metric */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Actual Distance:</span>
                <span className="font-mono font-black text-red-400 text-sm">
                  {conflict.separationDistanceMeters} meters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Statutory Minimum:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {conflict.minSeparationRequiredMeters} meters
                </span>
              </div>
              <div className="px-2.5 py-1 rounded bg-red-950/80 border border-red-500/50 text-red-300 font-bold text-[11px]">
                Breach Delta: -{conflict.minSeparationRequiredMeters - conflict.separationDistanceMeters}m
              </div>
            </div>
          </div>

          {/* Hazard & Incompatibility Narrative */}
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30">
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <ShieldAlert size={14} /> Operational Conflict Mechanics
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">
              {conflict.hazardDescription}
            </p>
            <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-slate-300">Regulatory Precedent:</span>
              <span className="font-mono text-amber-300 text-[11px]">{conflict.statutoryRule}</span>
            </div>
          </div>

          {/* Mandatory Engineering Mitigations */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Mandatory Deconfliction Actions Before Authorization
            </h4>
            <div className="space-y-2">
              {conflict.mandatoryMitigations.map((mitigation, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300">
                    {idx + 1}
                  </span>
                  <span>{mitigation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SIMOPS Controller Override Mode */}
          {isOverrideMode && (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/60 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <ShieldCheck size={16} />
                Area SIMOPS Controller Waiver Authorization
              </div>
              <p className="text-xs text-slate-400">
                Applying a waiver assumes operational accountability. A formal entry will be logged into the cryptographic audit ledger.
              </p>
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Documented Mitigation Protocol Justification *
                </label>
                <textarea 
                  value={overrideText}
                  onChange={(e) => setOverrideText(e.target.value)}
                  placeholder="e.g. Pressurized flame-retardant welding habitat certified. Separation barrier deployed with dedicated continuous LEL detector and secondary fire watch."
                  rows={3}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="password"
                  value={controllerPin}
                  onChange={(e) => setControllerPin(e.target.value)}
                  placeholder="Controller Security PIN (e.g. 7701)"
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono w-48"
                />
                <button
                  type="button"
                  disabled={!overrideText.trim()}
                  onClick={() => onApplyOverride(overrideText)}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                >
                  Confirm Controller Waiver
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock size={14} className="text-red-400" />
            <span>Permit authorization locked until resolved</span>
          </div>

          <div className="flex items-center gap-2.5">
            {!isOverrideMode ? (
              <button
                type="button"
                onClick={() => setIsOverrideMode(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold transition-colors"
              >
                Request Controller Waiver
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOverrideMode(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold transition-colors"
              >
                Cancel Waiver
              </button>
            )}

            <button
              type="button"
              onClick={onLockAuthorization}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-900/40 flex items-center gap-1.5 transition-colors"
            >
              <Lock size={14} />
              Enforce Safety Lock
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
