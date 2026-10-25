
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, ComplianceFramework, Equipment, SafetyObservation, SecureUser, UserRole } from '../types';
import { AuthService, AuthMode, getAuthMode, setAuthModeSetting, isDemoModeFeatureEnabled } from '../services/authService';
import { SecureStorage } from '../services/storageService';
import { GULF_ENERGY_USERS } from '../services/demoDataLoader';
import { UserProfileService } from '../services/userProfileService';
import { calculateEffectivePermissions } from '../services/permissionService';
import { SEED_OMANI_USERS } from '../services/omanCentralDataStore';

// Helper to generate dynamic dates
const getDate = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

export const MOCK_USERS: UserProfile[] = [
  ...SEED_OMANI_USERS,
  { id: 'demo_user', name: 'Demo User', role: 'ADMIN', jobTitle: 'Platform Demo Administrator', siteLocation: 'Muscat Corporate HQ', assignedSites: ['Sohar Complex', 'Duqm Terminal', 'Fahud Plant'], department: 'System Demo Environment', safetyScore: 0, recentIncidents: [], observations: [], certifications: [], achievements: [] },
  { id: 'admin', name: 'System Admin', role: 'ADMIN', jobTitle: 'Lead Enterprise HSE Platform Architect', siteLocation: 'Corporate Command Center · Muscat', assignedSites: ['All Concessions (Sohar, Duqm, Fahud, Salalah)', 'Muscat HQ'], department: 'Digital Safety Infrastructure & Security', safetyScore: 2500, recentIncidents: [], observations: [], certifications: [{ name: 'Full System Authority', status: 'Valid', expiryDate: getDate(3650) }], achievements: [{ id: 'admin-0', title: 'Grandmaster', description: 'Complete system oversight enabled', dateEarned: getDate(-365), icon: 'Shield', tier: 'Gold' }] },
  { id: 'u0', name: 'H.E. Sheikh Hilal Al-Maamari', role: 'Board_Director', jobTitle: 'Board Director & Safety Oversight Chair', siteLocation: 'Al Hajar Corporate HQ', assignedSites: ['Muscat HQ', 'All Concessions'], department: 'Board of Directors', safetyScore: 120, recentIncidents: [], observations: [], certifications: [], achievements: [] },
  { id: 'u2', name: 'Dr. Tariq Al-Busaidi', role: 'Head_Group_HSE', jobTitle: 'Corporate QHSE & ESG Director', siteLocation: 'Muscat Corporate HQ · Knowledge Oasis', assignedSites: ['Muscat HQ', 'Sohar Operations', 'Duqm Terminal', 'Fahud Concession'], department: 'Corporate QHSE Directorate', safetyScore: 400, recentIncidents: [], observations: [], certifications: [{ name: 'Certified Safety Professional (CSP)', status: 'Valid', expiryDate: getDate(700) }], achievements: [{ id: 'a0', title: 'Visionary', description: 'Implemented AI Safety Strategy', dateEarned: getDate(-10), icon: 'Trophy', tier: 'Gold' }] },
  { id: 'u4', name: 'Salim Al-Harthy', role: 'Site_HSE_Manager', jobTitle: 'Sohar Complex HSE Manager & Level 3 PTW Authority', siteLocation: 'Sohar Industrial Port Petrochemical Complex', assignedSites: ['Sohar Industrial Port Petrochemical Complex'], department: 'Sohar Operations', safetyScore: 950, recentIncidents: ['Investigated flare knock-out drum level anomaly'], observations: [], certifications: [{ name: 'Lead Auditor ISO 45001', status: 'Valid', expiryDate: getDate(120) }], achievements: [{ id: 'a1', title: 'Zero Incidents', description: 'Managed site with 0 LTIs for 1 year', dateEarned: getDate(-30), icon: 'Trophy', tier: 'Gold' }] },
  { id: 'u7', name: 'Khalfan Al-Shehi', role: 'Site_Supervisor', jobTitle: 'Duqm Field Safety Supervisor', siteLocation: 'Duqm Heavy Refining Terminal', assignedSites: ['Duqm Heavy Refining & Bunkering Terminal'], department: 'Duqm Operations Support', safetyScore: 820, recentIncidents: ['Triggered Stop Work Authority for heat stress'], observations: [], certifications: [{ name: 'Advanced First Aid', status: 'Valid', expiryDate: getDate(300) }], achievements: [{ id: 'a7', title: 'Eagle Eye', description: 'Zero violations in supervised zones for 6 months', dateEarned: getDate(-45), icon: 'Shield', tier: 'Silver' }] },
  ...GULF_ENERGY_USERS
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'EQ-001', name: 'Main Generator Alpha', type: 'Diesel Generator', location: 'Zone B - Power Plant', lastMaintenanceDate: getDate(-45), operationalHours: 12500, sensors: { temperature: 92, vibration: 4.2, oilLevel: 78, pressure: 120 }, status: 'Warning', relatedIncidents: ['Minor oil leak detected in Q1'] },
  { id: 'EQ-002', name: 'HVAC Chiller Unit 3', type: 'Industrial Chiller', location: 'Rooftop - Main Office', lastMaintenanceDate: getDate(-12), operationalHours: 4500, sensors: { temperature: 45, vibration: 1.1, pressure: 85 }, status: 'Operational' },
  { id: 'EQ-003', name: 'Tower Crane 04', type: 'Heavy Machinery', location: 'Site C - Construction', lastMaintenanceDate: getDate(-90), operationalHours: 3200, sensors: { temperature: 65, vibration: 6.5, oilLevel: 45 }, status: 'Critical', relatedIncidents: ['Cable spool jamming reported'] },
  { id: 'EQ-004', name: 'Fire Pump Beta', type: 'Safety System', location: 'Fujairah Terminal', lastMaintenanceDate: getDate(-5), operationalHours: 120, sensors: { temperature: 28, vibration: 0.5, pressure: 150 }, status: 'Operational' },
  { id: 'EQ-005', name: 'Air Compressor 09', type: 'Pneumatics', location: 'Ruwais Workshop', lastMaintenanceDate: getDate(-150), operationalHours: 8900, sensors: { temperature: 78, vibration: 3.8, pressure: 95 }, status: 'Warning' },
  { id: 'EQ-006', name: 'Centrifugal Pump P-101', type: 'Pump', location: 'Ruwais Zone A', lastMaintenanceDate: getDate(-60), operationalHours: 15000, sensors: { temperature: 65, vibration: 2.1, pressure: 45 }, status: 'Operational' },
  { id: 'EQ-007', name: 'Conveyor Belt C-404', type: 'Conveyor', location: 'Jebel Ali Site C', lastMaintenanceDate: getDate(-20), operationalHours: 8000, sensors: { temperature: 55, vibration: 3.5 }, status: 'Warning', relatedIncidents: ['Belt misalignment'] },
  { id: 'EQ-008', name: 'Diesel Tank T-90', type: 'Storage Tank', location: 'Fujairah Terminal', lastMaintenanceDate: getDate(-365), operationalHours: 87600, sensors: { temperature: 30, vibration: 0.2, pressure: 101, oilLevel: 85 }, status: 'Operational' },
  { id: 'EQ-009', name: 'Scrubber Unit S-22', type: 'Environmental', location: 'Habshan Gas Complex', lastMaintenanceDate: getDate(-10), operationalHours: 12000, sensors: { temperature: 88, vibration: 1.2 }, status: 'Operational' },
  { id: 'EQ-010', name: 'Mobile Crane MC-05', type: 'Heavy Machinery', location: 'Site C - Construction', lastMaintenanceDate: getDate(-5), operationalHours: 2100, sensors: { temperature: 70, vibration: 4.0, oilLevel: 60 }, status: 'Operational' },
  { id: 'EQ-011', name: 'Heat Exchanger HE-03', type: 'Exchanger', location: 'Ruwais Refinery Zone B', lastMaintenanceDate: getDate(-200), operationalHours: 45000, sensors: { temperature: 110, vibration: 0.5, pressure: 180 }, status: 'Warning' },
  { id: 'EQ-012', name: 'Forklift FL-12', type: 'Vehicle', location: 'Warehouse A', lastMaintenanceDate: getDate(-45), operationalHours: 3500, sensors: { temperature: 60, vibration: 2.8 }, status: 'Operational' },
  { id: 'EQ-013', name: 'Fire Alarm Panel FAP-01', type: 'Safety System', location: 'HQ Main Lobby', lastMaintenanceDate: getDate(-30), operationalHours: 50000, sensors: { temperature: 24, vibration: 0 }, status: 'Operational' },
  { id: 'EQ-014', name: 'Backup Generator Gen-B', type: 'Diesel Generator', location: 'Data Center', lastMaintenanceDate: getDate(-180), operationalHours: 500, sensors: { temperature: 25, vibration: 0.1, oilLevel: 95 }, status: 'Operational' },
  { id: 'EQ-015', name: 'Compressor CP-55', type: 'Pneumatics', location: 'Maintenance Shop', lastMaintenanceDate: getDate(-90), operationalHours: 6700, sensors: { temperature: 82, vibration: 5.5, pressure: 110 }, status: 'Critical', relatedIncidents: ['High vibration alarm'] }
];

interface UserContextType {
  currentUser: UserProfile | null;
  login: (username: string, rememberMe?: boolean) => Promise<boolean>;
  loginDemo: (demoUserId?: string) => Promise<boolean>;
  register: (email: string, name: string, department: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  isDemoMode: boolean;
  isLoadingAuth: boolean;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  users: UserProfile[];
  activeFramework: ComplianceFramework;
  setActiveFramework: (framework: ComplianceFramework) => void;
  equipment: Equipment[];
  updateEquipment: (eq: Equipment) => void;
  allObservations: SafetyObservation[];
  addObservation: (obs: SafetyObservation) => void;
  updateObservation: (obs: SafetyObservation) => void;
  effectivePermissions: string[];
  updateUserPermissions: (userId: string, granted: string[], denied: string[]) => Promise<void>;
  updateUserRoles: (userId: string, roles: UserRole[]) => Promise<void>;
  setUserSuspension: (userId: string, isSuspended: boolean) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authMode, setAuthModeState] = useState<AuthMode>(getAuthMode());
  
  const setAuthMode = (mode: AuthMode) => {
    setAuthModeState(mode);
    setAuthModeSetting(mode);
  };
  
  const [activeFramework, setActiveFramework] = useState<ComplianceFramework>('ADNOC_COP');
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [allObservations, setAllObservations] = useState<SafetyObservation[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>(MOCK_USERS);

  // Async Hydration
  useEffect(() => {
    const hydrate = async () => {
      // 0. Load enriched enterprise users
      try {
        const enrichedAll = await UserProfileService.getAllUsers();
        if (enrichedAll && enrichedAll.length > 0) {
          const enrichedMap = new Map(
            enrichedAll.map(e => [e.id, { ...e, statistics: UserProfileService.calculateLiveStats(e) }])
          );
          const merged = MOCK_USERS.map(mockU => enrichedMap.get(mockU.id) || mockU);
          // Include any enriched users not in MOCK_USERS
          for (const enriched of enrichedAll) {
            if (!merged.some(m => m.id === enriched.id)) {
              merged.push(enrichedMap.get(enriched.id)!);
            }
          }
          setUsersList(merged);
        }
      } catch (err) {
        console.warn('Failed to hydrate enriched users:', err);
      }
      // 1. Restore Session securely
      const sessionUser = await AuthService.getCurrentUser();
      const demoFlag = await AuthService.isDemoSession();
      
      if (sessionUser) {
        // Try to find the user in enriched store or mocks
        const enriched = await UserProfileService.getUserById(sessionUser.id);
        if (enriched) {
          const liveStats = UserProfileService.calculateLiveStats(enriched);
          setCurrentUser({ ...enriched, statistics: liveStats });
        } else {
          const mockProfile = MOCK_USERS.find(u => u.id === sessionUser.id);
          if (mockProfile) {
              setCurrentUser(mockProfile);
          } else {
              setCurrentUser({
                  id: sessionUser.id,
                  name: sessionUser.name,
                  email: sessionUser.username,
                  role: sessionUser.role,
                  department: sessionUser.department,
                  safetyScore: 0,
                  recentIncidents: [],
                  observations: [],
                  certifications: [],
                  achievements: []
              });
          }
        }
        setIsDemoMode(demoFlag);
      } else {
        // Unauthenticated session on fresh browser: strictly null currentUser, NO automatic admin fallback!
        setCurrentUser(null);
        setIsDemoMode(false);
      }

      const savedObs = await SecureStorage.getItem<SafetyObservation[]>('hse_observations');
      if (savedObs && savedObs.length > 0) {
          setAllObservations(savedObs);
      } else {
          const initialObs: SafetyObservation[] = [
              { id: 'OBS-101', type: 'Positive', description: 'Workers using proper full-body harness and 100% double-tie off during Cuplok scaffold erection at height.', location: 'Mina Al Fahal Refinery · Crude Distillation Unit 2', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Submitted', isAnonymous: false, reportedBy: 'Fatima Al-Kharusi', history: [] },
              { id: 'OBS-102', type: 'Improvement', description: 'Fire extinguisher access temporarily obstructed by delivery pallets near gate 3.', location: 'Sohar Industrial Port Logistics Hub · Warehouse B', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Submitted', isAnonymous: false, reportedBy: 'Salim Al-Hajri', history: [] },
              { id: 'OBS-103', type: 'Positive', description: 'Exemplary tool tagging and segregation in the mechanical prefabrication shop after night shift handover.', location: 'Khazzan Gas Processing Complex · Central Fabrication Shop', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'Submitted', isAnonymous: false, reportedBy: 'Marcus Chen', history: [] },
              { id: 'OBS-104', type: 'Improvement', description: 'Extension cord crossing primary personnel access walkway without rubber ramp cable protector.', location: 'Port of Duqm Terminal · Berth 4 Office Corridor', timestamp: new Date(Date.now() - 259200000).toISOString(), status: 'Actioned', isAnonymous: true, reportedBy: undefined, history: [] },
              { id: 'OBS-105', type: 'Positive', description: 'Supervisor proactively conducted a toolbox talk on heat stress hydration and TWL break schedules before morning shift start.', location: 'Fahud Field Operation · Well Cluster 14', timestamp: new Date(Date.now() - 345600000).toISOString(), status: 'Submitted', isAnonymous: false, reportedBy: 'Sarah Jones', history: [] },
              { id: 'OBS-2026-0412', type: 'Positive', description: 'Pre-Shift Heat Stress Hydration & TWL Color Flag Check proactively executed by morning crew per PDO SP-1170.', location: 'Sohar Port Petrochemical Berth 1 · Staging Area', timestamp: '2026-10-06T06:30:00Z', status: 'Actioned', isAnonymous: false, reportedBy: 'Salim Al-Hajri', history: [] },
              { id: 'OBS-2026-0413', type: 'Positive', description: 'Banksman stopped concrete mixer reversing maneuver when unauthorized delivery courier walked into blind zone.', location: 'Duqm Special Economic Zone (SEZAD) · Batching Plant 1', timestamp: '2026-10-06T09:15:00Z', status: 'Submitted', isAnonymous: false, reportedBy: 'Chloe Martin', history: [] },
              { id: 'OBS-2026-0414', type: 'Improvement', description: 'Secondary chemical container for degreaser solvent missing GHS hazard pictogram label.', location: 'Duqm Oman Drydock Yard · Heavy Fabrication Workshop 2', timestamp: '2026-10-06T11:45:00Z', status: 'Submitted', isAnonymous: false, reportedBy: 'Hamad Al-Busaidi', history: [] },
              { id: 'OBS-2026-0415', type: 'Positive', description: 'Heavy lift rigger inspected synthetic web sling serial numbers and rejected sling showing core yarn fraying.', location: 'Mina Al Fahal Industrial Complex · Heavy Rigging Yard', timestamp: '2026-10-06T14:20:00Z', status: 'Actioned', isAnonymous: false, reportedBy: 'Tariq Al-Hashemi', history: [] },
              { id: 'OBS-2026-0416', type: 'Improvement', description: 'Eye wash station inspection tag expired by 4 days in battery charging bay.', location: 'Nimr Production Station · Substation 33kV Bay', timestamp: '2026-10-06T16:00:00Z', status: 'Submitted', isAnonymous: false, reportedBy: 'Hassan Mahmoud', history: [] },
              { id: 'OBS-2026-0417', type: 'Positive', description: 'Trench shoring daily inspection recorded in logbook before workers entered 3.5m culvert trench.', location: 'Salalah Port Free Zone · South Access Corridor', timestamp: '2026-10-07T07:10:00Z', status: 'Submitted', isAnonymous: false, reportedBy: 'Jassem Al-Balushi', history: [] },
              { id: 'OBS-2026-0418', type: 'Improvement', description: 'Scaffolding toe-board dislodged on cantilever platform Level 4 during wind squall.', location: 'Fahud Field Operation · Flare Header Tower', timestamp: '2026-10-07T08:30:00Z', status: 'Submitted', isAnonymous: true, reportedBy: undefined, history: [] }
          ];
          setAllObservations(initialObs);
          await SecureStorage.setItem('hse_observations', initialObs);
      }
      setIsLoadingAuth(false);
    };
    hydrate();
  }, []);

  const login = async (username: string, rememberMe: boolean = false) => {
    // If username is empty or special string, trigger Google SSO
    if (username === 'SSO_LOGIN') {
      const result = await AuthService.loginWithGoogle();
      if (result) {
        const mockProfile = MOCK_USERS.find(u => u.id === result.user.id);
        if (mockProfile) setCurrentUser(mockProfile);
        else {
          setCurrentUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.username,
            role: result.user.role,
            department: result.user.department,
            safetyScore: 0,
            recentIncidents: [],
            observations: [],
            certifications: [],
            achievements: []
          });
        }
        setIsDemoMode(result.isDemo);
        return true;
      }
      return false;
    }

    const result = await AuthService.login(username, rememberMe);
    if (result) {
        // Try to find the user in mocks, otherwise construct visitor profile
        const mockProfile = MOCK_USERS.find(u => u.id === result.user.id);
        if (mockProfile) {
            setCurrentUser(mockProfile);
        } else {
            setCurrentUser({
                id: result.user.id,
                name: result.user.name,
                email: result.user.username,
                role: result.user.role,
                department: result.user.department,
                safetyScore: 0,
                recentIncidents: [],
                observations: [],
                certifications: [],
                achievements: []
            });
        }
        setIsDemoMode(result.isDemo);
        return true;
    }
    return false;
  };

  const register = async (email: string, name: string, department: string) => {
    const result = await AuthService.register(email, name, department);
    if (result) {
        setCurrentUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.username,
            role: result.user.role,
            department: result.user.department,
            safetyScore: 0,
            recentIncidents: [],
            observations: [],
            certifications: [],
            achievements: []
        });
        setIsDemoMode(result.isDemo);
        return true;
    }
    return false;
  };

  const loginDemo = async (demoUserId: string = 'admin') => {
    const result = await AuthService.loginDemo(demoUserId);
    if (result) {
      const enriched = await UserProfileService.getUserById(result.user.id);
      if (enriched) {
        const liveStats = UserProfileService.calculateLiveStats(enriched);
        setCurrentUser({ ...enriched, statistics: liveStats });
      } else {
        const mockProfile = MOCK_USERS.find(u => u.id === result.user.id);
        if (mockProfile) {
          setCurrentUser(mockProfile);
        } else {
          setCurrentUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.username,
            role: result.user.role,
            department: result.user.department,
            safetyScore: 0,
            recentIncidents: [],
            observations: [],
            certifications: [],
            achievements: []
          });
        }
      }
      setIsDemoMode(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setIsDemoMode(false);
  };

  const switchUser = async (userId: string) => {
      if (!isDemoMode) return; // Strict guard
      const enriched = await UserProfileService.getUserById(userId);
      if (enriched) {
          const liveStats = UserProfileService.calculateLiveStats(enriched);
          const fullUser = { ...enriched, statistics: liveStats };
          setCurrentUser(fullUser);
          const secureUser: SecureUser = {
              id: fullUser.id,
              username: fullUser.email || fullUser.name.toLowerCase().replace(/\s+/g, '.'),
              name: fullUser.name,
              role: fullUser.role,
              department: fullUser.department,
              permissions: []
          };
          await SecureStorage.setItem('hse_current_user', secureUser);
          return;
      }

      const targetUser = MOCK_USERS.find(u => u.id === userId);
      if (targetUser) {
          setCurrentUser(targetUser);
          // Persist the switch in secure storage so refresh works (keeping isDemo true)
          // We create a SecureUser shape for the storage service
          const secureUser: SecureUser = {
              id: targetUser.id,
              username: targetUser.name.toLowerCase().replace(/\s+/g, '.'),
              name: targetUser.name,
              role: targetUser.role,
              department: targetUser.department,
              permissions: []
          };
          await SecureStorage.setItem('hse_current_user', secureUser);
      }
  };

  const updateEquipment = (updatedEq: Equipment) => {
    const exists = equipment.some(e => e.id === updatedEq.id);
    const updatedList = exists 
      ? equipment.map(e => e.id === updatedEq.id ? updatedEq : e)
      : [updatedEq, ...equipment];
    setEquipment(updatedList);
    try {
      SecureStorage.setItem('hse_equipment', updatedList);
    } catch (err) {
      console.warn('Storage sync for equipment warning:', err);
    }
  };

  const addObservation = (obs: SafetyObservation) => {
    const obsWithReporter = { ...obs, reportedBy: obs.isAnonymous ? undefined : currentUser?.name };
    const updated = [obsWithReporter, ...allObservations];
    setAllObservations(updated);
    SecureStorage.setItem('hse_observations', updated);
    
    if (!obs.isAnonymous && currentUser) {
        setCurrentUser(prev => prev ? ({ ...prev, safetyScore: (prev.safetyScore || 0) + 25 }) : null);
    }
  };

  const updateObservation = (updatedObs: SafetyObservation) => {
    const updatedList = allObservations.map(o => o.id === updatedObs.id ? updatedObs : o);
    setAllObservations(updatedList);
    SecureStorage.setItem('hse_observations', updatedList);
  };

  // Sync active user with live activity mutations across the application
  useEffect(() => {
    const handleActivityUpdated = async (e: any) => {
      const activeId = currentUser?.id;
      if (activeId && e.detail?.userId === activeId) {
        const enriched = await UserProfileService.getUserById(activeId);
        if (enriched) {
          const liveStats = UserProfileService.calculateLiveStats(enriched);
          setCurrentUser({ ...enriched, statistics: liveStats });
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ad6-user-activity-updated', handleActivityUpdated);
      return () => {
        window.removeEventListener('ad6-user-activity-updated', handleActivityUpdated);
      };
    }
  }, [currentUser?.id]);

  const effectivePermissions = useMemo(() => {
    return Array.from(calculateEffectivePermissions(currentUser));
  }, [currentUser]);

  const updateUserPermissions = async (userId: string, granted: string[], denied: string[]) => {
    if (!currentUser) return;
    const updatedUser: UserProfile = {
      ...currentUser,
      permissions: granted,
      deniedPermissions: denied
    };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, permissions: granted, deniedPermissions: denied } : u));
    const secureUser: SecureUser = {
      id: updatedUser.id,
      username: updatedUser.email || updatedUser.name.toLowerCase().replace(/\s+/g, '.'),
      name: updatedUser.name,
      role: updatedUser.role,
      roles: updatedUser.roles,
      department: updatedUser.department,
      permissions: granted,
      deniedPermissions: denied,
      isSuspended: updatedUser.isSuspended
    };
    await SecureStorage.setItem('hse_current_user', secureUser);
  };

  const updateUserRoles = async (userId: string, roles: UserRole[]) => {
    if (!currentUser) return;
    const primaryRole = roles[0] || currentUser.role;
    const updatedUser: UserProfile = {
      ...currentUser,
      role: primaryRole,
      roles
    };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: primaryRole, roles } : u));
    const secureUser: SecureUser = {
      id: updatedUser.id,
      username: updatedUser.email || updatedUser.name.toLowerCase().replace(/\s+/g, '.'),
      name: updatedUser.name,
      role: primaryRole,
      roles,
      department: updatedUser.department,
      permissions: updatedUser.permissions || [],
      deniedPermissions: updatedUser.deniedPermissions || [],
      isSuspended: updatedUser.isSuspended
    };
    await SecureStorage.setItem('hse_current_user', secureUser);
  };

  const setUserSuspension = async (userId: string, isSuspended: boolean) => {
    if (!currentUser) return;
    const updatedUser: UserProfile = {
      ...currentUser,
      isSuspended,
      employmentStatus: isSuspended ? 'Suspended' : 'Active'
    };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isSuspended, employmentStatus: isSuspended ? 'Suspended' : 'Active' } : u));
    const secureUser: SecureUser = {
      id: updatedUser.id,
      username: updatedUser.email || updatedUser.name.toLowerCase().replace(/\s+/g, '.'),
      name: updatedUser.name,
      role: updatedUser.role,
      roles: updatedUser.roles,
      department: updatedUser.department,
      permissions: updatedUser.permissions || [],
      deniedPermissions: updatedUser.deniedPermissions || [],
      isSuspended
    };
    await SecureStorage.setItem('hse_current_user', secureUser);
  };

  return (
    <UserContext.Provider value={{ 
        currentUser: currentUser, 
        login,
        loginDemo,
        register,
        logout,
        switchUser,
        isDemoMode,
        isLoadingAuth,
        authMode,
        setAuthMode,
        users: usersList, 
        activeFramework, 
        setActiveFramework, 
        equipment, 
        updateEquipment, 
        allObservations, 
        addObservation, 
        updateObservation,
        effectivePermissions,
        updateUserPermissions,
        updateUserRoles,
        setUserSuspension
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
};
