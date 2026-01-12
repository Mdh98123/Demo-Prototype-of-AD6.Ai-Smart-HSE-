
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile, ComplianceFramework, Equipment, SafetyObservation, Language, SecureUser } from '../types';
import { AuthService } from '../services/authService';
import { SecureStorage } from '../services/storageService';

// Helper to generate dynamic dates
const getDate = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

export const MOCK_USERS: UserProfile[] = [
  { id: 'demo_user', name: 'Demo User', role: 'ADMIN', department: 'System Demo Environment', safetyScore: 0, recentIncidents: [], observations: [], certifications: [], achievements: [] },
  { id: 'admin', name: 'System Admin', role: 'ADMIN', department: 'Digital Infrastructure', safetyScore: 2500, recentIncidents: [], observations: [], certifications: [{ name: 'Full System Authority', status: 'Valid', expiryDate: getDate(3650) }], achievements: [{ id: 'admin-0', title: 'Grandmaster', description: 'Complete system oversight enabled', dateEarned: getDate(-365), icon: 'Shield', tier: 'Gold' }] },
  { id: 'u0', name: 'H.E. Sheikh Ahmed', role: 'Board_Director', department: 'Board of Directors', safetyScore: 120, recentIncidents: [], observations: [], certifications: [], achievements: [] },
  { id: 'u1', name: 'James Sterling', role: 'CEO', department: 'Executive Office', safetyScore: 150, recentIncidents: [], observations: [], certifications: [], achievements: [] },
  { id: 'u2', name: 'Dr. Layla Hassan', role: 'Head_Group_HSE', department: 'Group HSE HQ', safetyScore: 400, recentIncidents: [], observations: [], certifications: [{ name: 'Certified Safety Professional (CSP)', status: 'Valid', expiryDate: getDate(700) }], achievements: [{ id: 'a0', title: 'Visionary', description: 'Implemented AI Safety Strategy', dateEarned: getDate(-10), icon: 'Trophy', tier: 'Gold' }] },
  { id: 'u3', name: 'Ahmed Al-Mansoori', role: 'Regional_HSE_Director', department: 'Abu Dhabi Region', safetyScore: 350, recentIncidents: [], observations: [], certifications: [{ name: 'NEBOSH Diploma', status: 'Valid', expiryDate: getDate(365) }], achievements: [] },
  { id: 'u4', name: 'Sarah Jones', role: 'Site_HSE_Manager', department: 'Ruwais Operations', safetyScore: 950, recentIncidents: ['Reviewed chemical spill in Zone C'], observations: [], certifications: [{ name: 'Lead Auditor ISO 45001', status: 'Valid', expiryDate: getDate(120) }], achievements: [{ id: 'a1', title: 'Zero Incidents', description: 'Managed site with 0 LTIs for 1 year', dateEarned: getDate(-30), icon: 'Trophy', tier: 'Gold' }] },
  { id: 'u5', name: 'Fatima Al-Kaabi', role: 'HSE_Officer', department: 'Field Ops - Zone B', safetyScore: 1100, recentIncidents: ['Reported gas leak in Sector 4'], observations: [], certifications: [{ name: 'NEBOSH IGC', status: 'Valid', expiryDate: getDate(200) }], achievements: [] },
  { id: 'u10', name: 'Khalid Al-Dhaheri', role: 'Environmental_Officer', department: 'Sustainability & Compliance', safetyScore: 420, recentIncidents: [], observations: [], certifications: [{ name: 'ISO 14001 Lead Auditor', status: 'Valid', expiryDate: getDate(400) }], achievements: [] },
  { id: 'u11', name: 'John Doe', role: 'Project_Manager', department: 'Civil Infrastructure', safetyScore: 310, recentIncidents: [], observations: [], certifications: [], achievements: [] },
  { id: 'u12', name: 'Alice Smith', role: 'Internal_Auditor', department: 'Quality Assurance', safetyScore: 280, recentIncidents: [], observations: [], certifications: [], achievements: [] },
  { id: 'u7', name: 'Marcus Chen', role: 'Site_Supervisor', department: 'Infrastructure & Power', safetyScore: 820, recentIncidents: ['Supervised high-voltage line maintenance'], observations: [], certifications: [{ name: 'Advanced First Aid', status: 'Valid', expiryDate: getDate(300) }], achievements: [{ id: 'a7', title: 'Eagle Eye', description: 'Zero violations in supervised zones for 6 months', dateEarned: getDate(-45), icon: 'Shield', tier: 'Silver' }] },
  { id: 'u6', name: 'Rahul Gupta', role: 'Worker', department: 'Mechanical Maintenance', safetyScore: 450, recentIncidents: ['Near miss involving rotating machinery'], observations: [], certifications: [{ name: 'H2S Awareness', status: 'Valid', expiryDate: getDate(180) }], achievements: [] }
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'EQ-001', name: 'Main Generator Alpha', type: 'Diesel Generator', location: 'Zone B - Power Plant', lastMaintenanceDate: getDate(-45), operationalHours: 12500, sensors: { temperature: 92, vibration: 4.2, oilLevel: 78, pressure: 120 }, status: 'Warning', relatedIncidents: ['Minor oil leak detected in Q1'] },
  { id: 'EQ-002', name: 'HVAC Chiller Unit 3', type: 'Industrial Chiller', location: 'Rooftop - Main Office', lastMaintenanceDate: getDate(-12), operationalHours: 4500, sensors: { temperature: 45, vibration: 1.1, pressure: 85 }, status: 'Operational' },
  { id: 'EQ-003', name: 'Tower Crane 04', type: 'Heavy Machinery', location: 'Site C - Construction', lastMaintenanceDate: getDate(-90), operationalHours: 3200, sensors: { temperature: 65, vibration: 6.5, oilLevel: 45 }, status: 'Critical', relatedIncidents: ['Cable spool jamming reported'] },
  { id: 'EQ-004', name: 'Fire Pump Beta', type: 'Safety System', location: 'Fujairah Terminal', lastMaintenanceDate: getDate(-5), operationalHours: 120, sensors: { temperature: 28, vibration: 0.5, pressure: 150 }, status: 'Operational' },
  { id: 'EQ-005', name: 'Air Compressor 09', type: 'Pneumatics', location: 'Ruwais Workshop', lastMaintenanceDate: getDate(-150), operationalHours: 8900, sensors: { temperature: 78, vibration: 3.8, pressure: 95 }, status: 'Warning' }
];

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    inspections: 'Inspections',
    incidents: 'Incident Reports',
    rams: 'Risk Assessments',
    observations: 'Safety Monitoring',
    permits: 'Permits',
    training: 'Training',
    
    compliance: 'Compliance Hub',
    planning: 'HSE Planning',
    audits: 'Audits',
    contractors: 'Contractors',
    toolbox: 'Toolbox Talks',
    environmental: 'Environmental',
    maintenance: 'Predictive Maint.',
    health: 'Health Monitoring',
    emergency: 'Emergency Hub',
    dms: 'Documents',
    governance: 'System Governance',
    
    // Group Labels
    core: 'Core Operations',
    management: 'Management',
    specialized: 'Specialized',
    
    roleSwitcher: 'Role Switcher',
    framework: 'Framework',
    integrityCore: 'AI Integrity Core',
    syncActive: 'Site Synchronized',
    strategicIntel: '2025 Strategic HSE Intelligence',
    regulatoryDef: 'UAE Regulatory Defensibility & Portfolio Governance',
    activeSession: 'Active session',
    auditing: 'Auditing',
    userProfile: 'User Profile',
    registry: 'Workforce Registry',
    summary: 'Summary',
    directory: 'Workforce Directory',
    trainingHistory: 'Training History',
    orgMetrics: 'Org Metrics',
    backToProfile: 'Back to My Profile',
    searchRegistry: 'Search by name, role or dept...',
    employeeDir: 'Employee Directory',
    crossProfile: 'Cross-Profile Safety History Access',
    employee: 'Employee',
    department: 'Department',
    safetyScore: 'Safety Score',
    contributionCount: 'Contribution Count',
    access: 'Access',
    records: 'Records',
    safetyNotice: 'Immediate Safety Notice',
    broadcastReport: 'Broadcast Field Report',
    narrative: 'Incident Narrative',
    evidence: 'Field Evidence capture',
    location: 'Incident Sector',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    approve: 'Approve',
    reject: 'Reject',
    close: 'Close',
    export: 'Export',
    search: 'Search',
    active: 'Active',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    closed: 'Closed',
    open: 'Open',
    completed: 'Completed',
    inProgress: 'In Progress',
    valid: 'Valid',
    expired: 'Expired',
    expiringSoon: 'Expiring Soon',
    trir: 'Total Recordable Incident Rate',
    ltif: 'Lost Time Injury Frequency',
    siteNavigator: 'Site Navigator',
    crewOnline: 'Crew Online',
    gisSync: 'GIS Live Sync Active',
    opsCommand: 'Ops Command Center',
    rapidIncident: 'Rapid Incident Entry',
    safetyObservation: 'Safety Observation',
    auditChecklist: 'Audit Checklist',
    telemetryTrend: 'Real-time Telemetry Trend',
    severity: 'Severity',
    reportedBy: 'Reported By',
    timestamp: 'Timestamp',
    investigation: 'Investigation',
    rootCause: 'Root Cause Analysis',
    correctiveAction: 'Corrective Action',
    ptw: 'Permit to Work',
    workType: 'Work Type',
    description: 'Description',
    duration: 'Duration (Hours)',
    riskAssessment: 'Risk Assessment',
    hazards: 'Hazards',
    controls: 'Controls',
    ppe: 'Personal Protective Equipment',
    standard: 'Standard',
    scheduledDate: 'Scheduled Date',
    findings: 'Findings Registry',
    executiveSummary: 'Executive Summary',
    prediction: 'AI Prediction',
    failureProb: 'Failure Probability',
    predictedDate: 'Predicted Date',
    sensors: 'Sensors',
    vault: 'Document Vault',
    portals: 'Authority Portals',
    version: 'Version',
    criticality: 'Criticality',
    authority: 'Authority',
    retention: 'Retention Years'
  },
  ar: {
    dashboard: 'لوحة القيادة',
    inspections: 'عمليات التفتيش',
    incidents: 'تقارير الحوادث',
    rams: 'تقييم المخاطر',
    observations: 'مراقبة السلامة',
    permits: 'التصاريح',
    training: 'التدريب',
    
    compliance: 'مركز الامتثال',
    planning: 'تخطيط الصحة والسلامة',
    audits: 'التدقيق',
    contractors: 'المقاولين',
    toolbox: 'محادثات صندوق الأدوات',
    environmental: 'بيئي',
    maintenance: 'الصيانة التنبؤية',
    health: 'مراقبة الصحة',
    emergency: 'مركز الطوارئ',
    dms: 'الوثائق',
    governance: 'الحوكمة',
    
    // Group Labels
    core: 'العمليات الأساسية',
    management: 'الإدارة',
    specialized: 'متخصص',

    roleSwitcher: 'مبدل الأدوار',
    framework: 'الإطار التنظيمي',
    integrityCore: 'جوهر نزاهة الذكاء الاصطناعي',
    syncActive: 'تمت مزامنة الموقع',
    strategicIntel: 'الذكاء الاستراتيجي للصحة والسلامة والبيئة 2025',
    regulatoryDef: 'الدفاع التنظيمي في الإمارات وحوكمة المحفظة',
    activeSession: 'الجلسة النشطة',
    auditing: 'تدقيق',
    userProfile: 'ملف المستخدم',
    registry: 'سجل القوى العاملة',
    summary: 'ملخص',
    directory: 'دليل الموظفين',
    trainingHistory: 'سجل التدريب',
    orgMetrics: 'مقاييس المؤسسة',
    backToProfile: 'العودة لملفي الشخصي',
    searchRegistry: 'ابحث بالاسم، الدور أو القسم...',
    employeeDir: 'دليل الموظفين',
    crossProfile: 'الوصول إلى سجل سلامة الملفات الشخصية',
    employee: 'الموظف',
    department: 'القسم',
    safetyScore: 'درجة السلامة',
    contributionCount: 'عدد المساهمات',
    access: 'الوصول',
    records: 'سجلات',
    safetyNotice: 'إشعار سلامة فوري',
    broadcastReport: 'بث تقرير ميداني',
    narrative: 'وصف الحادث',
    evidence: 'التقاط أدلة ميدانية',
    location: 'قطاع الحادث',
    save: 'حفظ',
    cancel: 'إلغاء',
    submit: 'إرسال',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    approve: 'موافقة',
    reject: 'رفض',
    close: 'إغلاق',
    export: 'تصدير',
    search: 'بحث',
    active: 'نشط',
    pending: 'قيد الانتظار',
    approved: 'تمت الموافقة',
    rejected: 'مرفوض',
    closed: 'مغلق',
    open: 'مفتوح',
    completed: 'مكتمل',
    inProgress: 'قيد التنفيذ',
    valid: 'سارٍ',
    expired: 'منتهي الصلاحية',
    expiringSoon: 'تنتهي صلاحيته قريباً',
    trir: 'معدل الحوادث القابلة للتسجيل',
    ltif: 'تكرار إصابات الوقت الضائع',
    siteNavigator: 'ملاح الموقع',
    crewOnline: 'الطاقم المتصل',
    gisSync: 'مزامنة نظم المعلومات الجغرافية نشطة',
    opsCommand: 'مركز قيادة العمليات',
    rapidIncident: 'إدخال حادث سريع',
    safetyObservation: 'ملاحظة سلامة',
    auditChecklist: 'قائمة تدقيق',
    telemetryTrend: 'اتجاه القياس عن بعد الفوري',
    severity: 'الخطورة',
    reportedBy: 'أبلغ عنه',
    timestamp: 'الطابع الزمني',
    investigation: 'التحقيق',
    rootCause: 'تحليل الأسباب الجذرية',
    correctiveAction: 'الإجراء التصحيحي',
    ptw: 'تصريح عمل',
    workType: 'نوع العمل',
    description: 'الوصف',
    duration: 'المدة (ساعات)',
    riskAssessment: 'تقييم المخاطر',
    hazards: 'المخاطر',
    controls: 'الضوابط',
    ppe: 'معدات الوقاية الشخصية',
    standard: 'المعيار',
    scheduledDate: 'التاريخ المجدول',
    findings: 'سجل النتائج',
    executiveSummary: 'الملخص التنفيذي',
    prediction: 'تنبؤ الذكاء الاصطناعي',
    failureProb: 'احتمالية الفشل',
    predictedDate: 'التاريخ المتوقع',
    sensors: 'أجهزة الاستشعار',
    vault: 'خزانة الوثائق',
    portals: 'بوابات السلطات',
    version: 'الإصدار',
    criticality: 'الأهمية القصوى',
    authority: 'السلطة',
    retention: 'سنوات الاحتفاظ'
  }
};

interface UserContextType {
  currentUser: UserProfile;
  login: (username: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  isDemoMode: boolean;
  isLoadingAuth: boolean;
  users: UserProfile[];
  activeFramework: ComplianceFramework;
  setActiveFramework: (framework: ComplianceFramework) => void;
  equipment: Equipment[];
  updateEquipment: (eq: Equipment) => void;
  allObservations: SafetyObservation[];
  addObservation: (obs: SafetyObservation) => void;
  updateObservation: (obs: SafetyObservation) => void;
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [activeFramework, setActiveFramework] = useState<ComplianceFramework>('ADNOC_COP');
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [allObservations, setAllObservations] = useState<SafetyObservation[]>([]);
  const [language, setLanguage] = useState<Language>('en');

  // Async Hydration
  useEffect(() => {
    const hydrate = async () => {
      // 1. Restore Session securely
      const sessionUser = await AuthService.getCurrentUser();
      const demoFlag = await AuthService.isDemoSession();
      
      if (sessionUser) {
        // Try to find the user in mocks, otherwise construct visitor profile
        const mockProfile = MOCK_USERS.find(u => u.id === sessionUser.id);
        if (mockProfile) {
            setCurrentUser(mockProfile);
        } else {
            setCurrentUser({
                id: sessionUser.id,
                name: sessionUser.name,
                role: sessionUser.role,
                department: sessionUser.department,
                safetyScore: 0,
                recentIncidents: [],
                observations: [],
                certifications: [],
                achievements: []
            });
        }
        setIsDemoMode(demoFlag);
      }

      const savedObs = await SecureStorage.getItem<SafetyObservation[]>('hse_observations');
      if (savedObs) setAllObservations(savedObs);

      setIsLoadingAuth(false);
    };
    hydrate();
  }, []);

  const login = async (username: string, rememberMe: boolean = false) => {
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

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setIsDemoMode(false);
  };

  const switchUser = async (userId: string) => {
      if (!isDemoMode) return; // Strict guard
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
    const updatedList = equipment.map(e => e.id === updatedEq.id ? updatedEq : e);
    setEquipment(updatedList);
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

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const t = useCallback((key: string) => {
    return TRANSLATIONS[language][key] || key;
  }, [language]);

  useEffect(() => {
    document.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.style.setProperty('--app-direction', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  return (
    <UserContext.Provider value={{ 
        currentUser: currentUser as UserProfile, 
        login,
        logout,
        switchUser,
        isDemoMode,
        isLoadingAuth,
        users: MOCK_USERS, 
        activeFramework, 
        setActiveFramework, 
        equipment, 
        updateEquipment, 
        allObservations, 
        addObservation, 
        updateObservation,
        language,
        toggleLanguage,
        t
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
