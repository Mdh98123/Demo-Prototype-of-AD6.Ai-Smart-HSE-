import React, { useState } from 'react';
import { 
  Landmark, ExternalLink, ShieldCheck, CheckCircle2, Clock, 
  Search, PhoneCall, RefreshCw, AlertCircle, Building2
} from 'lucide-react';
import { RegulatoryIntelligenceService, OfficialGovernmentSource } from '../../services/regulatoryIntelligenceService';

export const OfficialGovernmentSourcesRegistry: React.FC = () => {
  const [sources] = useState<OfficialGovernmentSource[]>(() => 
    RegulatoryIntelligenceService.getGovernmentSources()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('ALL');

  const filtered = sources.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.statutoryScope.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJur = selectedJurisdiction === 'ALL' || s.jurisdiction === selectedJurisdiction;
    return matchesSearch && matchesJur;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <Landmark size={20} className="text-indigo-600" />
            Official Government & Statutory Sources Registry
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Accredited statutory regulatory bodies, code mechanisms, and direct official gazette portals across the GCC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter authorities or codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-8 pe-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 w-48 sm:w-60 font-medium"
            />
          </div>

          <select
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
            className="text-xs bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 outline-none"
          >
            <option value="ALL">All Jurisdictions</option>
            <option value="Oman Statutory">Oman Statutory</option>
            <option value="Muscat (Oman MoL MD 286/2008)">Muscat (Oman MoL MD 286/2008)</option>
            <option value="Oman">Oman (MoL)</option>
            <option value="International (ISO)">International (ISO)</option>
          </select>
        </div>
      </div>

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(src => (
          <div 
            key={src.id}
            className="glass-card p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {src.jurisdiction}
                  </span>
                  <h4 className="font-black text-sm text-slate-800 tracking-tight mt-1 leading-snug">
                    {src.name}
                  </h4>
                  {src.nameAr && (
                    <p className="text-[11px] font-arabic text-slate-400 mt-0.5">{src.nameAr}</p>
                  )}
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" title="Active Synchronized Feed" />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Code Baseline:</span>
                  <span className="font-mono font-bold text-slate-700">{src.code}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Enforcing Unit:</span>
                  <span className="font-semibold text-slate-600 truncate max-w-[150px]">{src.enforcementAuthority}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Active Mandates:</span>
                  <span className="font-black text-indigo-600">{src.activeRegulationsCount} Articles</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Statutory Coverage
                </label>
                <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                  {src.statutoryScope}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              {src.contactHotline ? (
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <PhoneCall size={12} className="text-indigo-600" />
                  <span>{src.contactHotline}</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">Sync: OK</span>
              )}

              <a
                href={src.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>Official Gazette</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
