import React, { useState } from 'react';
import { 
  Bell, Scale, AlertTriangle, CheckCircle2, Clock, 
  ExternalLink, Search, Sparkles, Loader2, ChevronRight,
  ShieldAlert, Shield, ArrowUpRight, Check
} from 'lucide-react';
import { 
  RegulatoryIntelligenceService, 
  LiveRegulatoryNotice 
} from '../../services/regulatoryIntelligenceService';
import { GroundingSource } from '../../services/geminiClientService';

export const LiveRegulatoryNoticeBoard: React.FC = () => {
  const [notices, setNotices] = useState<LiveRegulatoryNotice[]>(() => 
    RegulatoryIntelligenceService.getRegulatoryNotices()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedNotice, setSelectedNotice] = useState<LiveRegulatoryNotice | null>(notices[0] || null);

  // Live Grounded Search State (gemini-3.5-flash with googleSearch)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingGrounded, setIsSearchingGrounded] = useState(false);
  const [groundedResultText, setGroundedResultText] = useState<string | null>(null);
  const [groundedSources, setGroundedSources] = useState<GroundingSource[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleAcknowledge = (id: string) => {
    RegulatoryIntelligenceService.acknowledgeNotice(id);
    setNotices(prev => prev.map(n => n.id === id ? { ...n, isAcknowledged: true } : n));
    if (selectedNotice?.id === id) {
      setSelectedNotice(prev => prev ? { ...prev, isAcknowledged: true } : null);
    }
  };

  const handleExecuteLiveSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || isSearchingGrounded) return;

    setIsSearchingGrounded(true);
    setSearchError(null);
    try {
      const res = await RegulatoryIntelligenceService.searchLiveStatutoryUpdates(searchQuery);
      setGroundedResultText(res.text);
      setGroundedSources(res.sources || []);
    } catch (err: any) {
      console.error('Live search error:', err);
      setSearchError(err.message || 'Failed to query live Google Search grounding.');
    } finally {
      setIsSearchingGrounded(false);
    }
  };

  const filteredNotices = notices.filter(n => {
    return selectedCategory === 'ALL' || n.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Live Google Search Grounding Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Search size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-tight uppercase text-white">
                  Live Statutory Regulatory Search Grounding
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  gemini-3.5-flash (googleSearch)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verify the latest ministerial decrees, summer heat bans, and Civil Defence circulars directly against official gazettes.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleExecuteLiveSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Latest UAE MoHRE summer midday work ban dates and mandatory penalties..."
            className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim() || isSearchingGrounded}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50 shrink-0"
          >
            {isSearchingGrounded ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{isSearchingGrounded ? 'Grounding...' : 'Search Gazette'}</span>
          </button>
        </form>

        {searchError && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
            {searchError}
          </div>
        )}

        {/* Live Search Grounded Output */}
        {groundedResultText && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-blue-400 font-bold uppercase tracking-wider">
              <span>Verified Search Grounding Synthesis:</span>
              <button 
                onClick={() => setGroundedResultText(null)}
                className="text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {groundedResultText}
            </p>

            {groundedSources.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Citations:</span>
                {groundedSources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-blue-200 text-[10px] transition-colors"
                  >
                    <ExternalLink size={10} />
                    <span className="truncate max-w-[200px]">{src.title || src.uri}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Notice Board Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Feed List */}
        <div className="lg:w-1/2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Official Statutory Notices ({filteredNotices.length})
            </h4>

            <div className="flex gap-1 overflow-x-auto text-[11px]">
              {['ALL', 'Labor & Workforce', 'Heat Stress & Environment', 'Process Safety & Fire'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotices.map(notice => {
              const isSelected = selectedNotice?.id === notice.id;
              return (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-400 shadow-sm'
                      : 'glass-card border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {notice.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          notice.enforceabilityStatus === 'Mandatory Law'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {notice.enforceabilityStatus}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {notice.jurisdiction}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-800 mt-1 leading-snug">
                        {notice.title}
                      </h5>
                    </div>

                    {notice.isAcknowledged && (
                      <span className="p-1 rounded-full bg-emerald-100 text-emerald-700" title="Acknowledged">
                        <Check size={12} />
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock size={11} /> Effective: {notice.effectiveDate}
                    </span>
                    <span className="font-black text-red-600">
                      Fine: AED {notice.statutoryFineAed.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Notice Dossier */}
        <div className="lg:w-1/2">
          {selectedNotice ? (
            <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-lg space-y-5 sticky top-20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700">
                      {selectedNotice.authorityName}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Ref: {selectedNotice.id}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-800 tracking-tight mt-1.5 leading-snug">
                    {selectedNotice.title}
                  </h4>
                  {selectedNotice.titleAr && (
                    <p className="text-xs font-arabic text-slate-400 mt-0.5">{selectedNotice.titleAr}</p>
                  )}
                </div>

                <div className="text-end shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Penalty</span>
                  <span className="text-base font-black text-red-600">
                    AED {selectedNotice.statutoryFineAed.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status & Timing Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Published</span>
                  <span className="font-bold text-slate-700">{selectedNotice.publicationDate}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Enforcement</span>
                  <span className="font-bold text-emerald-700">{selectedNotice.effectiveDate}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Grace Period</span>
                  <span className="font-bold text-slate-700">{selectedNotice.gracePeriodDays} Days</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Executive Statutory Summary
                </label>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedNotice.summary}
                </p>
              </div>

              {/* Key Enforceable Obligations */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Mandatory Enforceable Operational Obligations
                </label>
                <div className="space-y-2">
                  {selectedNotice.keyObligations.map((obl, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700">{obl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {selectedNotice.sourceUrl && (
                  <a
                    href={selectedNotice.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <span>Read Gazette Text</span>
                    <ExternalLink size={12} />
                  </a>
                )}

                <button
                  onClick={() => handleAcknowledge(selectedNotice.id)}
                  disabled={selectedNotice.isAcknowledged}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    selectedNotice.isAcknowledged
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                  }`}
                >
                  <Check size={14} />
                  <span>{selectedNotice.isAcknowledged ? 'Acknowledged' : 'Acknowledge Notice'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center glass-card rounded-3xl border border-slate-200 text-slate-400 text-xs">
              Select a regulatory notice to view obligations and details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
