import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, CheckCircle2, Edit3, Trash2, 
  AlertTriangle, BookOpen, ExternalLink, UserCheck, 
  Lock, ArrowRight, Info, Check, X
} from 'lucide-react';
import { GroundedCitation, HITLReviewDecision } from '../../services/aiAssistantService';
import { useUser } from '../../contexts/UserContext';

interface AIGovernanceCardProps {
  title: string;
  category: 'RCA_FIVE_WHY' | 'STATUTORY_COMPLIANCE' | 'RISK_MITIGATION' | 'JSA_CONTROLS';
  draftContent: React.ReactNode;
  citations: GroundedCitation[];
  confidenceScore?: number;
  onAccept: (decision: HITLReviewDecision) => void;
  onEdit?: () => void;
  onDiscard: () => void;
  isEditing?: boolean;
}

export const AIGovernanceCard: React.FC<AIGovernanceCardProps> = ({
  title,
  category,
  draftContent,
  citations,
  confidenceScore = 0.92,
  onAccept,
  onEdit,
  onDiscard,
  isEditing = false
}) => {
  const { currentUser } = useUser();
  const [officerNotes, setOfficerNotes] = useState('');
  const [hasAcknowledgedReview, setHasAcknowledgedReview] = useState(false);

  const handleConfirmAccept = () => {
    if (!hasAcknowledgedReview) {
      alert('⚠️ Mandatory Safety Review:\nYou must check the certification verification box before applying AI draft to the official record.');
      return;
    }

    const decision: HITLReviewDecision = {
      status: 'ACCEPTED',
      reviewerName: currentUser?.name || 'Rashid Al-Kharusi',
      reviewerId: currentUser?.id || 'u4',
      reviewerRole: currentUser?.role || 'Site Safety Officer',
      reviewerCertNumber: 'NEBOSH-ID-9921',
      reviewTimestamp: new Date().toISOString(),
      reviewNotes: officerNotes.trim() || 'Verified compliant with site operating procedures.'
    };

    onAccept(decision);
  };

  // Phase 5 Runtime Guardrail: If confidence < threshold (0.70), suppress draft and display manual entry required
  const threshold = 0.70;
  if (confidenceScore < threshold) {
    return (
      <div className="rounded-2xl border-2 border-red-500/60 bg-slate-900/90 p-5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2.5 text-red-400">
          <AlertTriangle size={20} />
          <span className="font-bold text-sm tracking-wide uppercase">AI Suggestion Suppressed</span>
        </div>
        <p className="text-xs text-slate-300">
          AI output confidence ({Math.round(confidenceScore * 100)}%) is below the safety threshold ({Math.round(threshold * 100)}%).
        </p>
        <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-xs font-semibold text-red-200">
          manual entry required — automated suggestion disabled for safety.
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onDiscard}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
          >
            Acknowledge & Proceed with Manual Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-amber-500/70 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 shadow-2xl shadow-amber-950/30 overflow-hidden space-y-4 animate-in fade-in duration-300">
      
      {/* Header Banner: Explicit AI-Generated Draft Badge & Governance Framing */}
      <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-900 px-5 py-3.5 border-b border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center justify-center">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 font-mono shadow-sm">
                AI-generated draft — requires review
              </span>
              <span className="text-[11px] text-amber-300/90 font-mono font-semibold">
                HITL Gate: Human Sign-off Required
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">{title}</h3>
          </div>
        </div>

        {/* Confidence & Model telemetry */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-400">Grounded Confidence:</span>
          <span className="font-mono font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {Math.round(confidenceScore * 100)}%
          </span>
        </div>
      </div>

      {/* Main Draft Content Container */}
      <div className="px-5 py-2">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-200">
          {draftContent}
        </div>
      </div>

      {/* Source Attribution Footnotes (Internal SOPs & Statutory Articles) */}
      <div className="px-5">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <BookOpen size={13} className="text-amber-400" />
            <span>Grounded Source Attribution Footnotes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {citations.map((cite, idx) => (
              <div 
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-cyan-300 truncate max-w-[200px]">
                    {cite.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                    {cite.sourceType}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-amber-300/80">
                  {cite.articleOrSection}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 italic">
                  "{cite.excerpt}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mandatory Human-in-the-Loop Review Box */}
      <div className="px-5 pb-5">
        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/50 space-y-3.5">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Certified Safety Officer Review & Acceptance
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono">
              Statutory Barrier: Cannot auto-commit
            </span>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed">
            By accepting, you certify that you have independently verified this AI causal analysis against physical evidence and applicable legal standards.
          </div>

          {/* Reviewer Verification Checkbox */}
          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <input 
              type="checkbox"
              checked={hasAcknowledgedReview}
              onChange={(e) => setHasAcknowledgedReview(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
            />
            <div>
              <span className="font-bold text-white block">
                Independent Professional Verification Confirmed
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Reviewer: <strong className="text-slate-200">{currentUser?.name || 'Rashid Al-Kharusi'}</strong> ({currentUser?.role || 'HSE Officer'}, Cert: NEBOSH-ID-9921)
              </span>
            </div>
          </label>

          {/* Safety Officer Review Remarks */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Safety Officer Technical Endorsement Notes (Optional)
            </label>
            <input 
              type="text"
              placeholder="e.g. Verified with crane maintenance logs; confirmed 33-month replacement interval breach."
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Three Mandatory Governance Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            
            {/* 1. Discard Button */}
            <button
              type="button"
              onClick={onDiscard}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              Discard Draft
            </button>

            {/* 2. Edit Draft Button */}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Edit3 size={13} />
                {isEditing ? 'Editing Mode' : 'Edit Draft'}
              </button>
            )}

            {/* 3. Accept & Apply to Record Button */}
            <button
              type="button"
              onClick={handleConfirmAccept}
              disabled={!hasAcknowledgedReview}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              Accept & Apply to Record
            </button>

          </div>

        </div>
      </div>

    </div>
  );
};

export default AIGovernanceCard;
