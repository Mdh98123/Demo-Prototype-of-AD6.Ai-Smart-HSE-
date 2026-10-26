import React, { useState } from 'react';
import { ShieldAlert, Key, Users, Smartphone, Server, CheckCircle, Globe, Shield, ChevronDown } from 'lucide-react';
import { EnterpriseAuth } from '../../services/enterpriseAuth';
import { useUser } from '../../contexts/UserContext';
import { useRegionalCompliance } from '../../contexts/RegionalComplianceContext';
import { regionalComplianceService, RegionalComplianceMode } from '../../services/regionalComplianceService';

export const IAMModule: React.FC = () => {
  const { currentUser } = useUser();
  const { regionalMode, activeProfile, openChangeModal } = useRegionalCompliance();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [authMethod, setAuthMethod] = useState<'LOCAL' | 'SAML' | 'OIDC'>('SAML');
  const [provider, setProvider] = useState<'AzureAD' | 'Okta'>('AzureAD');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('Initiating SSO Handshake...');
    
    try {
      const result = await EnterpriseAuth.loginWithSSO(provider);
      if (result.success) {
        setConnectionStatus(`Connected to ${provider}. Extracted claims and verified signature.`);
      }
    } catch (e) {
      setConnectionStatus('Connection Failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-6 glass-panel min-h-full font-sans">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <ShieldAlert className="text-indigo-600" size={32} />
          Identity & Access Management
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Enterprise Authentication, SSO, and Granular RBAC configurations.</p>
      </div>

      {/* System Administrator Regional Compliance Configuration */}
      <div className="mb-8 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-2xl p-6 border border-slate-700 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Globe size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  System Administrator Settings
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {isAdmin ? 'ADMIN AUTHORIZED' : 'READ-ONLY ACCESS'}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                Regional Compliance Configuration
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-mono">
              Active: {activeProfile.flag} {activeProfile.label}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Controls the legal and regulatory framework governing the platform, statutory deadlines, heat stress work-stoppages, 
          and electronic PTW isolation criteria across all concessions. Managed centrally via Regional Compliance Service.
        </p>

        {/* Dropdown Field */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label htmlFor="iam-regional-compliance-dropdown" className="text-xs font-black uppercase tracking-wider text-slate-200 block">
              Regional Compliance Configuration
            </label>
            {!isAdmin && (
              <span className="text-[11px] text-amber-300 flex items-center gap-1 font-bold">
                <Shield size={13} /> Restricted Access: System Administrator role required to modify configuration.
              </span>
            )}
          </div>

          <div className="relative">
            <select
              id="iam-regional-compliance-dropdown"
              disabled={!isAdmin}
              value={regionalMode}
              onChange={(e) => {
                const target = e.target.value as RegionalComplianceMode;
                if (target !== regionalMode) {
                  openChangeModal(target);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer appearance-none"
            >
              <option value="OMAN">Sultanate of Oman (National Framework)</option>
              <option value="COMBINED">Oman Concessions & Freezones (PDO & SEZAD)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-slate-400">
              <ChevronDown size={18} />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Active Authority: <strong className="text-slate-200">{regionalComplianceService.getRegulatoryTerminology('governingauthority', regionalMode)}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SSO Configuration */}
        <div className="glass-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 glass-panel flex justify-between items-center">
            <h2 className="font-black text-slate-800 flex items-center gap-2">
              <Key className="text-indigo-500" size={18} /> SSO Integration
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
               {['LOCAL', 'SAML', 'OIDC'].map(method => (
                  <button 
                    key={method}
                    onClick={() => setAuthMethod(method as any)}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${authMethod === method ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 text-slate-500 hover:border-indigo-200'}`}
                  >
                    {method}
                  </button>
               ))}
            </div>

            {authMethod !== 'LOCAL' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Identity Provider</label>
                  <select 
                    value={provider} 
                    onChange={e => setProvider(e.target.value as any)}
                    className="w-full p-3 glass-panel border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="AzureAD">Microsoft Entra ID (Azure AD)</option>
                    <option value="Okta">Okta Workforce Identity</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Metadata URI</label>
                  <input type="text" value={`https://sts.windows.net/tenant-id-guid/`} readOnly className="w-full p-3 glass-panel border border-slate-200 rounded-xl text-slate-500 font-mono text-sm" />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleTestConnection}
                    disabled={isConnecting}
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors disabled:opacity-75 flex justify-center items-center gap-2"
                  >
                    {isConnecting ? <span className="animate-pulse">Negotiating...</span> : 'Test SSO Configuration'}
                  </button>
                  {connectionStatus && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-lg flex items-center gap-2">
                       <CheckCircle size={16} />
                       {connectionStatus}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device & Session Security */}
        <div className="glass-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 glass-panel flex justify-between items-center">
            <h2 className="font-black text-slate-800 flex items-center gap-2">
              <Smartphone className="text-emerald-500" size={18} /> Defense & Sessions
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl glass-panel">
               <div>
                 <div className="font-bold text-slate-800">Strict Device Binding</div>
                 <div className="text-xs text-slate-500">Lock field accounts to a specific MDM mobile device.</div>
               </div>
               <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 w-4 h-4 glass-card rounded-full transition-transform"></div>
               </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl glass-panel">
               <div>
                 <div className="font-bold text-slate-800">Enforce MFA (TOTP)</div>
                 <div className="text-xs text-slate-500">Require multi-factor auth for all External Contractors.</div>
               </div>
               <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 w-4 h-4 glass-card rounded-full transition-transform"></div>
               </div>
            </div>

            <div className="space-y-2">
               <label className="block text-xs font-bold text-slate-500">Idle Session Timeout (Minutes)</label>
               <input type="range" min="5" max="1440" defaultValue="30" className="w-full accent-indigo-600" />
               <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>5m</span>
                  <span>Currently: 30m</span>
                  <span>24h</span>
               </div>
            </div>
          </div>
        </div>

        {/* Role Matrix */}
        <div className="lg:col-span-2 glass-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 glass-panel flex justify-between items-center">
            <h2 className="font-black text-slate-800 flex items-center gap-2">
              <Users className="text-blue-500" size={18} /> RBAC Permission Matrix
            </h2>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase glass-panel font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4 text-center">Settings</th>
                        <th className="px-6 py-4 text-center">Approvals</th>
                        <th className="px-6 py-4 text-center">Audits</th>
                        <th className="px-6 py-4 text-center">Reporting</th>
                        <th className="px-6 py-4 text-center">ReadOnly</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-slate-100 font-medium">
                        <td className="px-6 py-4 font-black">ADMIN</td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                    </tr>
                    <tr className="border-b border-slate-100 font-medium">
                        <td className="px-6 py-4 font-black text-slate-700">Site_HSE_Manager</td>
                        <td className="px-6 py-4 text-center text-slate-300">-</td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                    </tr>
                    <tr className="border-b border-slate-100 font-medium">
                        <td className="px-6 py-4 font-black text-slate-700">Contractor</td>
                        <td className="px-6 py-4 text-center text-slate-300">-</td>
                        <td className="px-6 py-4 text-center text-slate-300">-</td>
                        <td className="px-6 py-4 text-center text-slate-300">-</td>
                        <td className="px-6 py-4 text-center text-slate-300">-</td>
                        <td className="px-6 py-4 text-center text-emerald-500"><CheckCircle className="inline" size={18} /></td>
                    </tr>
                </tbody>
             </table>
          </div>
        </div>

      </div>
    </div>
  );
};
