import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  RegionalComplianceMode, 
  Jurisdiction,
  toJurisdiction,
  toRegionalMode,
  JurisdictionProfile, 
  RegionalComplianceService, 
  RegionalConfigAuditRecord, 
  JURISDICTION_PROFILES 
} from '../services/regionalComplianceService';
import { useUser } from './UserContext';
import { RegionalConfigConfirmDialog } from '../components/regulatory/RegionalConfigConfirmDialog';

interface RegionalComplianceContextType {
  regionalMode: RegionalComplianceMode;
  activeJurisdiction: Jurisdiction;
  isUaeMode: boolean;
  isOmanMode: boolean;
  isCombinedMode: boolean;
  activeProfile: JurisdictionProfile;
  setRegionalMode: (newMode: RegionalComplianceMode, reason?: string) => Promise<{ success: boolean; error?: string }>;
  setActiveJurisdiction: (jurisdiction: Jurisdiction, reason?: string) => Promise<{ success: boolean; error?: string }>;
  auditHistory: RegionalConfigAuditRecord[];
  
  // Interactive Confirmation Modal Control
  isChangeModalOpen: boolean;
  pendingMode: RegionalComplianceMode | null;
  pendingReason: string;
  setPendingReason: (reason: string) => void;
  openChangeModal: (targetMode: RegionalComplianceMode) => void;
  closeChangeModal: () => void;
  confirmModeChange: (reason?: string) => Promise<boolean>;
  
  // Helpers
  isEntityVisible: (entityCountry?: string) => boolean;
  filterByActiveMode: <T extends { country?: string; jurisdiction?: string }>(items: T[]) => T[];
  getEntityJurisdictionDetails: (country?: string) => ReturnType<typeof RegionalComplianceService.getEntityJurisdictionDetails>;
}

const RegionalComplianceContext = createContext<RegionalComplianceContextType | undefined>(undefined);

export const RegionalComplianceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [regionalMode, setRegionalModeState] = useState<RegionalComplianceMode>(() => {
    return RegionalComplianceService.getActiveMode();
  });
  const [auditHistory, setAuditHistory] = useState<RegionalConfigAuditRecord[]>(() => {
    return RegionalComplianceService.getAuditHistory();
  });
  
  // Modal State for Confirmation
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<RegionalComplianceMode | null>(null);
  const [pendingReason, setPendingReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const { currentUser } = useUser();

  // Listen to external/tab changes and reactive service updates
  useEffect(() => {
    // Immediate verification of persistent storage state on mount
    const storedMode = RegionalComplianceService.getActiveMode();
    if (storedMode !== regionalMode) {
      setRegionalModeState(storedMode);
    }

    // Subscribe to internal reactive service
    const unsubscribe = RegionalComplianceService.subscribe((state) => {
      setRegionalModeState(state.mode);
      setAuditHistory(RegionalComplianceService.getAuditHistory());
    });

    const handleSync = () => {
      const mode = RegionalComplianceService.getActiveMode();
      setRegionalModeState(mode);
      setAuditHistory(RegionalComplianceService.getAuditHistory());
    };

    window.addEventListener('ad6-regional-compliance-changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      unsubscribe();
      window.removeEventListener('ad6-regional-compliance-changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const activeProfile = JURISDICTION_PROFILES[regionalMode] || JURISDICTION_PROFILES.COMBINED;

  const setRegionalMode = useCallback(
    async (newMode: RegionalComplianceMode, reason: string = 'Administrative policy realignment') => {
      if (!currentUser) {
        return { success: false, error: 'User session not initialized' };
      }
      const result = RegionalComplianceService.setRegionalMode(newMode, currentUser, reason);
      if (result.success) {
        setRegionalModeState(newMode);
        setAuditHistory(RegionalComplianceService.getAuditHistory());
      }
      return result;
    },
    [currentUser]
  );

  const setActiveJurisdiction = useCallback(
    async (jurisdiction: Jurisdiction, reason: string = 'Administrative compliance realignment') => {
      return setRegionalMode(toRegionalMode(jurisdiction), reason);
    },
    [setRegionalMode]
  );

  const openChangeModal = useCallback((targetMode: RegionalComplianceMode) => {
    setPendingMode(targetMode);
    setPendingReason('');
    setModalError(null);
    setIsChangeModalOpen(true);
  }, []);

  const closeChangeModal = useCallback(() => {
    setIsChangeModalOpen(false);
    setPendingMode(null);
    setPendingReason('');
    setModalError(null);
  }, []);

  const confirmModeChange = useCallback(async (customReason?: string): Promise<boolean> => {
    if (!pendingMode || !currentUser) return false;
    setIsSubmitting(true);
    setModalError(null);
    try {
      const finalReason = (customReason || pendingReason || '').trim() || 'System Administrator routine compliance realignment';
      const res = await setRegionalMode(pendingMode, finalReason);
      if (res.success) {
        closeChangeModal();
        return true;
      } else {
        setModalError(res.error || 'Failed to update configuration.');
        return false;
      }
    } catch (err: any) {
      setModalError(err.message || 'Error occurred while persisting setting.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [pendingMode, pendingReason, currentUser, setRegionalMode, closeChangeModal]);

  const isEntityVisible = useCallback(
    (entityCountry?: string) => {
      return RegionalComplianceService.isEntityVisible(entityCountry, regionalMode);
    },
    [regionalMode]
  );

  const filterByActiveMode = useCallback(
    <T extends { country?: string; jurisdiction?: string }>(items: T[]) => {
      return RegionalComplianceService.filterByActiveMode(items, regionalMode);
    },
    [regionalMode]
  );

  const getEntityJurisdictionDetails = useCallback((country?: string) => {
    return RegionalComplianceService.getEntityJurisdictionDetails(country);
  }, []);

  return (
    <RegionalComplianceContext.Provider
      value={{
        regionalMode,
        activeJurisdiction: toJurisdiction(regionalMode),
        isUaeMode: regionalMode === 'UAE',
        isOmanMode: regionalMode === 'OMAN',
        isCombinedMode: regionalMode === 'COMBINED',
        activeProfile,
        setRegionalMode,
        setActiveJurisdiction,
        auditHistory,
        isChangeModalOpen,
        pendingMode,
        pendingReason,
        setPendingReason,
        openChangeModal,
        closeChangeModal,
        confirmModeChange,
        isEntityVisible,
        filterByActiveMode,
        getEntityJurisdictionDetails
      }}
    >
      {children}

      {/* Global Administrative Confirmation Dialog */}
      <RegionalConfigConfirmDialog
        isOpen={isChangeModalOpen && Boolean(pendingMode)}
        currentMode={regionalMode}
        targetMode={pendingMode}
        onConfirm={async (reason) => {
          setPendingReason(reason);
          await confirmModeChange(reason);
        }}
        onCancel={closeChangeModal}
        isSubmitting={isSubmitting}
        error={modalError}
        currentUser={currentUser}
        initialReason={pendingReason}
      />
    </RegionalComplianceContext.Provider>
  );
};

export const useRegionalCompliance = (): RegionalComplianceContextType => {
  const context = useContext(RegionalComplianceContext);
  if (!context) {
    console.warn('useRegionalCompliance was called outside of RegionalComplianceProvider. Returning default fallback.');
    return {
      regionalMode: 'COMBINED',
      activeJurisdiction: 'Combined',
      isUaeMode: false,
      isOmanMode: false,
      isCombinedMode: true,
      activeProfile: JURISDICTION_PROFILES.COMBINED,
      setRegionalMode: async () => ({ success: false, error: 'Context not mounted' }),
      setActiveJurisdiction: async () => ({ success: false, error: 'Context not mounted' }),
      auditHistory: [],
      isChangeModalOpen: false,
      pendingMode: null,
      pendingReason: '',
      setPendingReason: () => {},
      openChangeModal: () => {},
      closeChangeModal: () => {},
      confirmModeChange: async () => false,
      isEntityVisible: () => true,
      filterByActiveMode: (items) => items,
      getEntityJurisdictionDetails: () => ({
        jurisdictionLabel: 'Combined',
        flag: '🇦🇪🇴🇲',
        badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-300',
        authorityName: 'Dual Authorities',
        primaryReg: 'UAE & Oman Frameworks'
      })
    };
  }
  return context;
};
