import React from 'react';
import { CheckSquare, FileSignature, AlertOctagon, ClipboardCheck, Sparkles } from 'lucide-react';
import { View } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface MobileBottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onOpenAiCopilot: () => void;
  isAiCopilotOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenAiCopilot,
  isAiCopilotOpen = false,
}) => {
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'my-work',
      label: 'My Work',
      icon: CheckSquare,
      view: View.TASKS,
      isActive: currentView === View.TASKS || currentView === View.WORKFORCE_SAFETY,
    },
    {
      id: 'ptw',
      label: 'Permits',
      icon: FileSignature,
      view: View.PERMIT_TO_WORK,
      isActive: currentView === View.PERMIT_TO_WORK || currentView === View.PERMITS,
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: AlertOctagon,
      view: View.INCIDENTS,
      isActive: currentView === View.INCIDENTS || currentView === View.INCIDENT_MANAGEMENT,
    },
    {
      id: 'inspections',
      label: 'Inspect',
      icon: ClipboardCheck,
      view: View.PWA_INSPECTIONS,
      isActive: currentView === View.PWA_INSPECTIONS || currentView === View.INSPECTIONS,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 start-0 end-0 z-[25] bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 text-slate-300 shadow-2xl transition-all select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
                item.isActive
                  ? 'text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  item.isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : ''
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
                {t(item.label)}
              </span>
            </button>
          );
        })}

        {/* Safi AI Copilot Thumb Trigger */}
        <button
          type="button"
          onClick={onOpenAiCopilot}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
            isAiCopilotOpen
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-amber-300 active:scale-95'
          }`}
          title="Open Safi AI Copilot"
        >
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              isAiCopilotOpen
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                : 'bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            <Sparkles size={18} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px] text-amber-300 font-semibold">
            Safi AI
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
