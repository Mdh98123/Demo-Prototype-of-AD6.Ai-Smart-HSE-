import React, { useState } from 'react';
import { 
  GraduationCap, Award, AlertTriangle, CheckCircle2, Clock, 
  Search, Filter, ShieldAlert, UserCheck, RefreshCw, X, Check,
  FileCheck, Shield, ChevronRight, Download
} from 'lucide-react';
import { 
  RegulatoryIntelligenceService, 
  EmployeeCertificationRecord 
} from '../../services/regulatoryIntelligenceService';

export const EmployeeCertificationTracker: React.FC = () => {
  const [certs, setCerts] = useState<EmployeeCertificationRecord[]>(() => 
    RegulatoryIntelligenceService.getEmployeeCertifications()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSite, setSelectedSite] = useState<string>('ALL');

  // Renewal Modal State
  const [renewingCert, setRenewingCert] = useState<EmployeeCertificationRecord | null>(null);
  const [newExpiry, setNewExpiry] = useState('');
  const [newCertNum, setNewCertNum] = useState('');

  const handleOpenRenew = (cert: EmployeeCertificationRecord) => {
    setRenewingCert(cert);
    // Suggest 2 years from today
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    setNewExpiry(d.toISOString().split('T')[0]);
    setNewCertNum(cert.certificateNumber + '-R');
  };

  const handleConfirmRenew = () => {
    if (!renewingCert || !newExpiry) return;
    const updated = RegulatoryIntelligenceService.renewCertification(
      renewingCert.id,
      newExpiry,
      newCertNum
    );
    setCerts(updated);
    setRenewingCert(null);
  };

  const filtered = certs.filter(c => {
    const matchesSearch = c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certificationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesSite = selectedSite === 'ALL' || c.siteLocation.includes(selectedSite);
    return matchesSearch && matchesStatus && matchesSite;
  });

  const validCount = certs.filter(c => c.status === 'Valid').length;
  const expiringCount = certs.filter(c => c.status === 'Expiring Soon').length;
  const expiredCount = certs.filter(c => c.status === 'Expired' || c.status === 'Suspended').length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Total Tracked Workforce</span>
            <GraduationCap size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{certs.length} Records</div>
          <span className="text-[10px] text-slate-400 font-medium">100% Identity verified</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold uppercase">
            <span>Valid & Certified</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2">{validCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Authorized on site</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-100 bg-amber-50/30 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-700 font-bold uppercase">
            <span>Expiring (&lt;30 Days)</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-2">{expiringCount}</div>
          <span className="text-[10px] text-amber-700 font-medium">Auto-escalation active</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-red-100 bg-red-50/30 shadow-sm">
          <div className="flex items-center justify-between text-xs text-red-700 font-bold uppercase">
            <span>Expired / Restrained</span>
            <ShieldAlert size={16} className="text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-800 mt-2">{expiredCount}</div>
          <span className="text-[10px] text-red-600 font-bold">Access gate pass locked</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, cert name, or certificate ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Valid">Valid</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 outline-none"
          >
            <option value="ALL">All Concession Sites</option>
            <option value="Mina Al Fahal">Mina Al Fahal</option>
            <option value="Khazzan Gas Asset">Khazzan Gas Asset</option>
            <option value="Musaffah">Musaffah</option>
          </select>
        </div>
      </div>

      {/* Certifications Table */}
      <div className="glass-card rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 text-start">Personnel & Role</th>
                <th className="py-3 px-4 text-start">Certification & Issuing Body</th>
                <th className="py-3 px-4 text-start">Certificate Ref</th>
                <th className="py-3 px-4 text-start">Expiry Date</th>
                <th className="py-3 px-4 text-start">Status</th>
                <th className="py-3 px-4 text-start">Gate Restraint</th>
                <th className="py-3 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(cert => (
                <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-black text-slate-800 text-xs">{cert.employeeName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{cert.employeeRole}</div>
                    <div className="text-[9px] text-indigo-600 font-mono mt-0.5">{cert.siteLocation}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-700 text-xs">{cert.certificationName}</div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                      {cert.issuingBody}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-600">
                    {cert.certificateNumber}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-700 text-xs">{cert.expiryDate}</div>
                    <div className={`text-[10px] font-bold ${
                      cert.daysRemaining < 0 
                        ? 'text-red-600' 
                        : cert.daysRemaining <= 30 
                          ? 'text-amber-600' 
                          : 'text-emerald-600'
                    }`}>
                      {cert.daysRemaining < 0 
                        ? `${Math.abs(cert.daysRemaining)}d Overdue` 
                        : `${cert.daysRemaining}d remaining`}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      cert.status === 'Valid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cert.status === 'Expiring Soon'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {cert.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cert.escalationStatus === 'Site Access Restricted'
                        ? 'bg-red-600 text-white animate-pulse'
                        : cert.escalationStatus === 'Supervisor Alerted'
                          ? 'bg-amber-500/10 text-amber-700 border border-amber-200'
                          : 'text-slate-400'
                    }`}>
                      {cert.escalationStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-end">
                    <button
                      onClick={() => handleOpenRenew(cert)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                    >
                      Renew
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal Modal */}
      {renewingCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-800 text-base uppercase tracking-tight">
                Renew Workforce Certification
              </h4>
              <button 
                onClick={() => setRenewingCert(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
              <div>
                <span className="font-bold text-slate-500">Employee: </span>
                <span className="font-black text-slate-800">{renewingCert.employeeName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">Certificate: </span>
                <span className="font-semibold text-slate-700">{renewingCert.certificationName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">Issuing Body: </span>
                <span className="font-semibold text-indigo-600">{renewingCert.issuingBody}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  New Expiry Date
                </label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Updated Certificate Number
                </label>
                <input
                  type="text"
                  value={newCertNum}
                  onChange={(e) => setNewCertNum(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-600 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setRenewingCert(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRenew}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                Confirm Renewal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
