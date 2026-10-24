import React from 'react';
import { ShieldAlert, ArrowLeft, Users, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { UserProfile, View } from '../../types';
import { VIEW_PERMISSION_REQUIREMENTS } from '../../services/permissionService';

interface AccessDeniedProps {
  user: UserProfile;
  restrictedView: View;
  safeView: View;
  onNavigateToSafe: (view: View) => void;
  onOpenRoleSwitcher?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  user,
  restrictedView,
  safeView,
  onNavigateToSafe,
  onOpenRoleSwitcher
}) => {
  const requiredPermissions = VIEW_PERMISSION_REQUIREMENTS[restrictedView] || [];
  const isSuspended = user.isSuspended || user.employmentStatus === 'Suspended' || user.employmentStatus === 'Inactive';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="max-w-xl w-full bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-red-200/80 shadow-2xl shadow-red-500/10 text-center relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-500/25 border border-red-400/30">
          <ShieldAlert size={32} />
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 inline-block mb-3">
          403 Forbidden · Security Access Control
        </span>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          {isSuspended ? 'Account Suspended / Access Revoked' : 'Restricted Operational Area'}
        </h2>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {isSuspended ? (
            <>Your account status is currently marked as <strong className="text-red-700">Suspended / Inactive</strong>. All operational permits, checklists, and administrative modules are locked pending governance reactivation.</>
          ) : (
            <>
              Your verified identity <strong className="text-slate-900">{user.name}</strong> ({user.role.replace(/_/g, ' ')}) is not authorized to access the requested module <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-rose-700 font-mono font-bold">{restrictedView}</code>.
            </>
          )}
        </p>

        {/* Security Policy Details */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 text-start text-xs space-y-2 mb-6">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-semibold text-slate-500">Security Principal:</span>
            <span className="font-bold text-slate-800">{user.name}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-semibold text-slate-500">Assigned Role:</span>
            <span className="font-bold text-slate-800">{user.role.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-semibold text-slate-500">Department / Site:</span>
            <span className="font-bold text-slate-800">{user.department} · {user.siteLocation || 'Primary Concession'}</span>
          </div>
          {requiredPermissions.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-500 block mb-1">Required Permissions:</span>
              <div className="flex flex-wrap gap-1">
                {requiredPermissions.map((perm) => (
                  <span key={perm} className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigateToSafe(safeView)}
            className="flex-1 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Return to Authorized Dashboard
          </button>

          {onOpenRoleSwitcher && (
            <button
              onClick={onOpenRoleSwitcher}
              className="px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Users size={16} />
              Switch Persona
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
