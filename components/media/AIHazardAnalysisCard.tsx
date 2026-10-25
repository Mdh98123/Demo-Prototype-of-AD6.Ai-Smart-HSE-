import React, { useState } from 'react';
import { 
  Sparkles, AlertOctagon, CheckCircle2, XCircle, ShieldAlert, 
  FileText, ArrowRight, ShieldCheck, RefreshCw, Edit3, Check, 
  ExternalLink, Layers, Trash2, PlusCircle, AlertTriangle
} from 'lucide-react';
import { AIHazardAnalysisResult, AIHazardItem, PhotoEvidence } from '../../types/mediaTypes';

interface AIHazardAnalysisCardProps {
  photo: PhotoEvidence;
  analysis?: AIHazardAnalysisResult;
  isLoading?: boolean;
  error?: string | null;
  onAnalyze: () => void;
  onUpdateAnalysis: (updated: AIHazardAnalysisResult) => void;
  onCreateNCR?: (hazard: AIHazardItem, actionText: string) => void;
  onAddObservation?: (hazard: AIHazardItem, contextText: string) => void;
  onCreateCapa?: (hazard: AIHazardItem, actionText: string) => void;
  onApplyNarrative?: (narrative: string) => void;
}

export const AIHazardAnalysisCard: React.FC<AIHazardAnalysisCardProps> = ({
  photo,
  analysis,
  isLoading = false,
  error = null,
  onAnalyze,
  onUpdateAnalysis,
  onCreateNCR,
  onAddObservation,
  onCreateCapa,
  onApplyNarrative
}) => {
  const [editingHazardIndex, setEditingHazardIndex] = useState<number | null>(null);
  const [editHazardName, setEditHazardName] = useState('');
  const [editHazardSeverity, setEditHazardSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [activeActionFeedback, setActiveActionFeedback] = useState<string | null>(null);

  // Severity colors
  const severityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-600 text-white border-red-700';
      case 'High':
        return 'bg-orange-500 text-white border-orange-600';
      case 'Medium':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Low':
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300';
    }
  };

  // Toggle Human-in-the-loop Acceptance
  const toggleAcceptHazard = (index: number) => {
    if (!analysis) return;
    const nextHazards = [...analysis.hazards];
    const current = nextHazards[index];
    nextHazards[index] = {
      ...current,
      accepted: !current.accepted,
      rejected: false
    };
    onUpdateAnalysis({ ...analysis, hazards: nextHazards });
  };

  // Reject Hazard
  const rejectHazard = (index: number) => {
    if (!analysis) return;
    const nextHazards = [...analysis.hazards];
    const current = nextHazards[index];
    nextHazards[index] = {
      ...current,
      rejected: !current.rejected,
      accepted: false
    };
    onUpdateAnalysis({ ...analysis, hazards: nextHazards });
  };

  // Start editing a hazard
  const startEditingHazard = (index: number, hazard: AIHazardItem) => {
    setEditingHazardIndex(index);
    setEditHazardName(hazard.name);
    setEditHazardSeverity(hazard.severity);
  };

  // Save edited hazard
  const saveEditedHazard = (index: number) => {
    if (!analysis) return;
    const nextHazards = [...analysis.hazards];
    nextHazards[index] = {
      ...nextHazards[index],
      name: editHazardName,
      severity: editHazardSeverity,
      accepted: true
    };
    onUpdateAnalysis({ ...analysis, hazards: nextHazards });
    setEditingHazardIndex(null);
  };

  // Auto-draft combined narrative from photo caption, voice note, and AI findings
  const generateCombinedNarrative = () => {
    if (!analysis) return '';
    const parts: string[] = [];

    parts.push(`[FIELD EVIDENCE INSPECTION NOTE - ${new Date(photo.timestamp).toLocaleDateString()}]`);
    if (photo.caption) parts.push(`Context/Location: ${photo.caption}`);
    if (photo.voiceNote) parts.push(`Inspector Dictation: "${photo.voiceNote}"`);
    if (photo.gps) parts.push(`GPS Coordinates: ${photo.gps.lat}, ${photo.gps.lng}`);

    parts.push(`\nIdentified Field Hazards:`);
    analysis.hazards.filter(h => !h.rejected).forEach((h, i) => {
      parts.push(`${i + 1}. [${h.severity.toUpperCase()}] ${h.name} (${h.category}) - ${h.location_in_image}`);
    });

    if (analysis.hse_context.ppe_missing.length > 0) {
      parts.push(`\nMissing/Required PPE: ${analysis.hse_context.ppe_missing.join(', ')}`);
    }

    parts.push(`\nStatutory Evaluation:\n${analysis.guideline_description}`);

    parts.push(`\nImmediate & Corrective Actions:`);
    analysis.recommended_actions.forEach((a, i) => {
      parts.push(`- [${a.type}] ${a.action} (${a.priority})`);
    });

    return parts.join('\n');
  };

  const showFeedback = (msg: string) => {
    setActiveActionFeedback(msg);
    setTimeout(() => setActiveActionFeedback(null), 3500);
  };

  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden select-text text-slate-800">
      
      {/* Header Bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              Gemini Vision AI Hazard Triage
              {analysis && (
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.2 rounded-full border border-blue-200">
                  {analysis.modelUsed || 'gemini-3.8-flash'}
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-500">
              ISO 45001 / ISO 14001 & Oman Ministry of Labour Compliance Check
            </p>
          </div>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>{analysis ? 'Re-Analyze' : 'Analyze with AI'}</span>
            </>
          )}
        </button>
      </div>

      {/* Action Toast Feedback */}
      {activeActionFeedback && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{activeActionFeedback}</span>
        </div>
      )}

      {/* Loading Scanning State */}
      {isLoading && (
        <div className="p-6 text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-50"></div>
            <div className="relative rounded-full border-4 border-blue-600 border-t-transparent w-12 h-12 animate-spin flex items-center justify-center">
              <Sparkles size={18} className="text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Processing Workplace Image with Gemini Multimodal AI</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Detecting hazard barriers, PPE conformance, and Oman statutory requirements...</p>
          </div>
        </div>
      )}

      {/* Error / Retry State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50/70 border-b border-red-100 flex items-start gap-3">
          <AlertOctagon size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-900">Analysis Encountered an Issue</p>
            <p className="text-[11px] text-red-700 mt-0.5">{error}</p>
            <button
              onClick={onAnalyze}
              className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <RefreshCw size={12} />
              <span>Retry Analysis</span>
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysis && !isLoading && (
        <div className="p-4 space-y-4">
          
          {analysis.uncertaintyNotice && (
            <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>{analysis.uncertaintyNotice}</span>
            </div>
          )}

          {/* 1. Identified Hazards with Human-in-the-Loop Review */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-red-500" />
                Identified Hazards ({analysis.hazards.length})
                <span className="text-[10px] font-normal text-slate-400 normal-case">
                  (Human-in-the-Loop: Review, Edit, or Accept)
                </span>
              </h5>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Suggested Type: {analysis.suggested_record_type}
              </span>
            </div>

            <div className="space-y-2">
              {analysis.hazards.map((hazard, index) => {
                const isEditing = editingHazardIndex === index;
                const isRejected = hazard.rejected;
                const isAccepted = hazard.accepted;

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border transition-all ${
                      isRejected 
                        ? 'opacity-40 bg-slate-50 border-slate-200 line-through'
                        : isAccepted 
                        ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200/90'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editHazardName}
                          onChange={(e) => setEditHazardName(e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center justify-between">
                          <select
                            value={editHazardSeverity}
                            onChange={(e) => setEditHazardSeverity(e.target.value as any)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingHazardIndex(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEditedHazard(index)}
                              className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${severityBadge(hazard.severity)}`}>
                              {hazard.severity}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{hazard.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {hazard.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Confidence: {Math.round(hazard.confidence * 100)}%
                            </span>
                          </div>

                          {/* Review controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => startEditingHazard(index, hazard)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors"
                              title="Edit hazard finding"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => toggleAcceptHazard(index)}
                              className={`p-1 rounded transition-colors ${
                                isAccepted ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-emerald-600'
                              }`}
                              title={isAccepted ? 'Accepted' : 'Accept finding'}
                            >
                              <CheckCircle2 size={15} />
                            </button>
                            <button
                              onClick={() => rejectHazard(index)}
                              className={`p-1 rounded transition-colors ${
                                isRejected ? 'text-red-600 font-bold' : 'text-slate-400 hover:text-red-600'
                              }`}
                              title={isRejected ? 'Rejected' : 'Reject finding'}
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-1">
                          <strong className="text-slate-700">Location in image:</strong> {hazard.location_in_image}
                        </p>

                        {/* One-click Action Buttons per hazard */}
                        {!isRejected && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
                            {onCreateNCR && (
                              <button
                                onClick={() => {
                                  onCreateNCR(hazard, analysis.recommended_actions[0]?.action || hazard.name);
                                  showFeedback(`Generated Non-Conformance Report (NCR) for "${hazard.name}"`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95"
                              >
                                <ShieldAlert size={12} />
                                <span>Create NCR</span>
                              </button>
                            )}

                            {onAddObservation && (
                              <button
                                onClick={() => {
                                  onAddObservation(hazard, analysis.guideline_description);
                                  showFeedback(`Added "${hazard.name}" to Safety Observations`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95"
                              >
                                <PlusCircle size={12} />
                                <span>Add as Observation</span>
                              </button>
                            )}

                            {onCreateCapa && (
                              <button
                                onClick={() => {
                                  onCreateCapa(hazard, analysis.recommended_actions[0]?.action || 'Remediate hazard exposure');
                                  showFeedback(`Created CAPA corrective action for "${hazard.name}"`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95"
                              >
                                <Check size={12} />
                                <span>Create CAPA</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. HSE Context & PPE Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <h6 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                PPE Observed & Missing
              </h6>
              <div className="space-y-1">
                {analysis.hse_context.ppe_observed.map((ppe, i) => (
                  <div key={i} className="text-xs text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>{ppe}</span>
                  </div>
                ))}
                {analysis.hse_context.ppe_missing.map((ppe, i) => (
                  <div key={i} className="text-xs text-red-800 font-medium flex items-center gap-1.5">
                    <XCircle size={13} className="text-red-500 shrink-0" />
                    <span>{ppe} (Missing)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <h6 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                Housekeeping & Environmental
              </h6>
              <div className="space-y-1 text-xs text-slate-700">
                {analysis.hse_context.housekeeping_issues.map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                    <span>{item}</span>
                  </div>
                ))}
                {analysis.hse_context.environmental_issues.map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Statutory Guideline Description */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80">
            <h6 className="text-[10px] font-black uppercase tracking-wider text-blue-900 mb-1 flex items-center gap-1.5">
              <FileText size={13} className="text-blue-600" />
              Statutory HSE Requirements & Clauses
            </h6>
            <p className="text-xs text-blue-950 leading-relaxed font-sans">
              {analysis.guideline_description}
            </p>
          </div>

          {/* 4. Recommended Actions */}
          <div>
            <h6 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
              Recommended Control Hierarchy
            </h6>
            <div className="space-y-1.5">
              {analysis.recommended_actions.map((act, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      act.type === 'Immediate' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {act.type}
                    </span>
                    <span className="text-xs text-slate-800 font-medium">{act.action}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {act.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Auto-Drafted Narrative Generator */}
          {onApplyNarrative && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Combine photo, voice narration & AI analysis into inspection narrative
              </p>
              <button
                onClick={() => {
                  const narrative = generateCombinedNarrative();
                  onApplyNarrative(narrative);
                  showFeedback('Auto-drafted narrative applied to inspection findings.');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <FileText size={13} />
                <span>Apply Narrative to Record</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
