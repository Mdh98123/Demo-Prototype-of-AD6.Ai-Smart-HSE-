import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Globe, ChevronDown, Check, Shield, Scale, 
  ExternalLink, Lock, AlertCircle 
} from 'lucide-react';
import { useRegionalCompliance } from '../../contexts/RegionalComplianceContext';
import { useUser } from '../../contexts/UserContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { RegionalComplianceMode } from '../../services/regionalComplianceService';

export interface JurisdictionSelectorDropdownProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  className?: string;
  onOpenProfileModal?: () => void;
}

interface JurisdictionOption {
  id: RegionalComplianceMode;
  flag: string;
  name: string;
  shortName: string;
  framework: string;
  desc: string;
  currency: string;
  authorities: string;
}

const JURISDICTION_OPTIONS: JurisdictionOption[] = [
  {
    id: 'OMAN',
    flag: '🇴🇲',
    name: 'Sultanate of Oman',
    shortName: 'Oman',
    framework: 'MD 286/2008 & PDO SP-1143',
    desc: 'Oman Labour Law RD 53/2023 · MoL 24h Notice · TWL Heat Metric',
    currency: 'OMR (3 decimals)',
    authorities: 'MoL · PDO · MEM · CDAA'
  }
];

export const JurisdictionSelectorDropdown: React.FC<JurisdictionSelectorDropdownProps> = ({
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
  className = '',
  onOpenProfileModal
}) => {
  const { 
    regionalMode, 
    isUaeMode, 
    isOmanMode, 
    activeProfile, 
    openChangeModal 
  } = useRegionalCompliance();
  
  const { currentUser } = useUser();
  const { t } = useLanguage();

  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isDropdownOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const toggleDropdown = useCallback(() => {
    if (isControlled) {
      controlledOnToggle?.();
    } else {
      setUncontrolledIsOpen(prev => !prev);
    }
  }, [isControlled, controlledOnToggle]);

  const closeDropdown = useCallback(() => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setUncontrolledIsOpen(false);
    }
    setFocusedIndex(-1);
  }, [isControlled, controlledOnClose]);

  // Handle outside clicks
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen, closeDropdown]);

  // Handle keyboard navigation accessibility (a11y)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        triggerRef.current?.focus();
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % JURISDICTION_OPTIONS.length);
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + JURISDICTION_OPTIONS.length) % JURISDICTION_OPTIONS.length);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < JURISDICTION_OPTIONS.length) {
          handleSelectJurisdiction(JURISDICTION_OPTIONS[focusedIndex].id);
        }
        break;

      case 'Tab':
        closeDropdown();
        break;
    }
  };

  const handleSelectJurisdiction = (targetMode: RegionalComplianceMode) => {
    closeDropdown();
    if (currentUser?.role === 'ADMIN') {
      openChangeModal(targetMode);
    } else {
      // Non-admins can inspect the full profile modal without unauthorized changes
      if (onOpenProfileModal) {
        onOpenProfileModal();
      }
    }
  };

  const activeOption = JURISDICTION_OPTIONS.find(opt => opt.id === regionalMode) || JURISDICTION_OPTIONS[0];

  return (
    <div 
      ref={containerRef} 
      className={`relative shrink-0 ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button with Accessibly Styled Jurisdiction Badge */}
      <button
        ref={triggerRef}
        type="button"
        id="jurisdiction-selector-button"
        aria-haspopup="menu"
        aria-expanded={isDropdownOpen}
        aria-label={`Current Regulatory Jurisdiction: ${activeProfile.label}. Click to switch statutory scope.`}
        onClick={toggleDropdown}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-start transition-all shadow-xs focus:outline-none focus:ring-2 select-none ${
          isUaeMode 
            ? 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-950 border-emerald-300 focus:ring-emerald-500/25' 
            : isOmanMode 
            ? 'bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-300 focus:ring-rose-500/25' 
            : 'bg-indigo-50/90 hover:bg-indigo-100/90 text-indigo-950 border-indigo-300 focus:ring-indigo-500/25'
        }`}
        title={`Statutory Country Jurisdiction: ${activeProfile.label}`}
      >
        {/* National Flag Emblem */}
        <div 
          className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shrink-0 border border-current/20 shadow-2xs text-sm"
          aria-hidden="true"
        >
          {activeProfile.flag}
        </div>

        {/* Text Details (Responsive) */}
        <div className="hidden sm:block text-start leading-tight min-w-0 max-w-[110px] md:max-w-[140px] truncate">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-75 truncate">
              {t('Country Scope')}
            </span>
            {currentUser?.role === 'ADMIN' && (
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-black/10 font-bold">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs font-bold truncate">
            Sultanate of Oman
          </p>
        </div>

        <ChevronDown 
          size={14} 
          className={`opacity-70 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          aria-hidden="true"
        />
      </button>

      {/* Dedicated Interactive Dropdown Popover */}
      {isDropdownOpen && (
        <div 
          ref={menuRef}
          role="menu"
          aria-labelledby="jurisdiction-selector-button"
          className="absolute start-0 mt-2 w-80 sm:w-88 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header Description */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                {t('Statutory Country Jurisdiction')}
              </p>
              <p className="text-xs text-slate-800 font-semibold truncate">
                {t('GCC Regional Compliance Engine')}
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              ISO / Statutory
            </span>
          </div>

          {/* Interactive Jurisdiction Selection Options */}
          <div className="py-1.5 space-y-1" role="none">
            {JURISDICTION_OPTIONS.map((item, index) => {
              const isSelected = regionalMode === item.id;
              const isFocused = focusedIndex === index;

              return (
                <button
                  key={item.id}
                  role="menuitemradio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => handleSelectJurisdiction(item.id)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full flex items-start justify-between p-2.5 rounded-xl text-start transition-all select-none ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-xs'
                      : isFocused
                      ? 'bg-slate-100 text-slate-900'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0 mt-0.5 leading-none" aria-hidden="true">
                      {item.flag}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {item.currency}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-blue-700 truncate mt-0.5">
                        {item.framework}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {item.desc}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                        Authorities: {item.authorities}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={16} className="text-blue-600 shrink-0 ms-2 mt-1" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Role Privileges Notice & Inspection Footer */}
          <div className="mt-1 pt-2 border-t border-slate-100 space-y-1.5">
            {currentUser?.role === 'ADMIN' ? (
              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-start gap-2 text-start">
                <Shield size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-950 leading-snug">
                  <strong>HSE Administrator Mode:</strong> Selecting a country opens the statutory change dialog with mandatory audit trail reason.
                </p>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2 text-start">
                <Lock size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-900 leading-snug">
                  Statutory framework configuration requires HSE Administrator privileges. Click to inspect current rules.
                </p>
              </div>
            )}

            {onOpenProfileModal && (
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  onOpenProfileModal();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors"
              >
                <span>View Full Statutory Articles & Legislation</span>
                <ExternalLink size={11} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
