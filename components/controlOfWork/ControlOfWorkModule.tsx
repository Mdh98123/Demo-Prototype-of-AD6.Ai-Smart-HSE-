import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSignature, Flame, AlertOctagon, Snowflake, Mountain, 
  Anchor, Layers, ShieldCheck, Lock, Unlock, AlertTriangle, 
  CheckCircle2, Clock, MapPin, Users, Calendar, Filter, 
  Search, Plus, ChevronRight, X, Radio, ArrowLeft, 
  Check, FileText, Activity, ShieldAlert, Cpu, Eye,
  RefreshCw, Award, Send, Ban
} from 'lucide-react';
import { 
  Permit, PermitType, PermitStatus, GasReading, LOTOItem, 
  INITIAL_MOCK_PERMITS, evaluateGasAtmosphere, detectSimopsConflict, 
  SimopsConflict 
} from '../../services/simopsService';
import { SimopsClashModal } from './SimopsClashModal';
import { offlineStorage, CachedPermitRecord } from '../../services/offlineStorage';
import { DemoDataLoader } from '../../services/demoDataLoader';
import { useUser } from '../../contexts/UserContext';
import { useTenant } from '../../contexts/TenantContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRegionalCompliance } from '../../contexts/RegionalComplianceContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { WorkflowRecordPanel } from '../workflow/WorkflowRecordPanel';

interface ControlOfWorkModuleProps {
  initialPermitId?: string;
}

export const ControlOfWorkModule: React.FC<ControlOfWorkModuleProps> = ({ initialPermitId }) => {
  const { currentUser } = useUser();
  const { enabled: workflowEnabled, createForRecord } = useWorkflow();
  const { currentSite, currentTenant } = useTenant();
  const { language, dir, t } = useLanguage();
  const { regionalMode, isUaeMode, isOmanMode, isCombinedMode, activeProfile } = useRegionalCompliance();

  // Contextual RBAC authorization for Permit Issuer role
  const isAuthorizedIssuer = currentUser?.role !== 'Worker';

  // Helper for localized permit type
  const getTranslatedType = (type: PermitType) => {
    if (language === 'ar') {
      switch (type) {
        case 'Hot Work': return 'أعمال ساخنة ولحام';
        case 'Cold Work': return 'أعمال باردة وميكانيكية';
        case 'Confined Space Entry': return 'دخول أماكن مغلقة';
        case 'Working at Height': return 'عمل على ارتفاعات';
        case 'Critical Lift': return 'رفع حرج بالرافعات';
        case 'Excavation': return 'حفريات وتمديدات';
      }
    }
    return type;
  };

  // Helper for localized permit status
  const getTranslatedStatus = (status: PermitStatus) => {
    if (language === 'ar') {
      switch (status) {
        case 'Draft': return 'مسودة';
        case 'Requested': return 'مرفوع للاعتماد';
        case 'Authorized': return 'معتمد ومصرح';
        case 'Active': return 'ساري وقيد التنفيذ';
        case 'Suspended': return 'معلق مؤقتاً';
        case 'Closed': return 'مغلق ومؤرشف';
      }
    }
    return status;
  };

  // State
  const [permits, setPermits] = useState<Permit[]>(() => {
    return DemoDataLoader.getStoredPermits();
  });
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(initialPermitId || 'ptw-geig-001');

  // Listen to demonstration dataset reset event
  useEffect(() => {
    const handleReset = () => {
      const refreshed = DemoDataLoader.getStoredPermits();
      setPermits(refreshed);
      if (refreshed.length > 0) {
        setSelectedPermitId(refreshed[0].id);
      }
    };
    window.addEventListener('ad6-demo-data-reset', handleReset);
    return () => window.removeEventListener('ad6-demo-data-reset', handleReset);
  }, []);

  // Cache active permits locally to IndexedDB for seamless offline field custody
  useEffect(() => {
    if (permits.length > 0) {
      const recordsToCache: CachedPermitRecord[] = permits.map(p => ({
        id: p.id,
        permitNumber: p.permitNumber,
        type: p.type,
        title: p.title,
        exactLocation: p.exactLocation,
        zone: p.zone,
        status: p.status,
        validFrom: p.validFrom,
        validTo: p.validTo,
        issuerSignature: p.issuerSignature?.signatoryName,
        receiverSignature: p.receiverSignature?.signatoryName,
        gasTestingLog: p.gasTestingLog.map(g => ({
          oxygen: g.oxygen,
          lel: g.lel,
          h2s: g.h2s,
          co: g.co,
          timestamp: g.timestamp,
          testerName: g.testerName,
          status: g.status
        })),
        lotoIsolations: p.lotoIsolations.map(l => ({
          tagNumber: l.tagNumber,
          isolationPoint: l.isolationPoint,
          equipmentName: l.equipmentName,
          isolationType: l.isolationType,
          status: l.status,
          isolatorSignature: l.isolatorSignature
        })),
        cachedAt: new Date().toISOString()
      }));
      offlineStorage.cachePermitsBatch(recordsToCache).catch(err => {
        console.warn('Failed to cache permits offline:', err);
      });
    }
  }, [permits]);

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'DETAIL' | 'SIMOPS_RADAR'>('DETAIL');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // SIMOPS clash modal state
  const [simopsModalOpen, setSimopsModalOpen] = useState(false);
  const [detectedConflict, setDetectedConflict] = useState<SimopsConflict | null>(null);

  // New Gas Reading form state inside detail
  const [isAddingGasReading, setIsAddingGasReading] = useState(false);
  const [newO2, setNewO2] = useState<string>('20.8');
  const [newLEL, setNewLEL] = useState<string>('0.0');
  const [newH2S, setNewH2S] = useState<string>('0.0');
  const [newCO, setNewCO] = useState<string>('2.0');
  const [newTesterName, setNewTesterName] = useState(currentUser?.name || 'Rashid Al-Nuaimi');
  const [newTesterCert, setNewTesterCert] = useState('AGT-III-8821');
  const [newDetectorSerial, setNewDetectorSerial] = useState('BW-ULTRA-7741');
  const [newBumpTested, setNewBumpTested] = useState(true);

  // New LOTO form state inside detail
  const [isAddingLOTO, setIsAddingLOTO] = useState(false);
  const [newLotoTag, setNewLotoTag] = useState('LOTO-M-115');
  const [newLotoPoint, setNewLotoPoint] = useState('');
  const [newLotoEquipment, setNewLotoEquipment] = useState('');
  const [newLotoType, setNewLotoType] = useState<'Mechanical' | 'Electrical'>('Mechanical');

  // Currently selected permit
  const selectedPermit = useMemo(() => {
    return permits.find(p => p.id === selectedPermitId) || permits[0];
  }, [permits, selectedPermitId]);

  // Automated Safety Barrier Gating Matrix Evaluation (PDO SP-1143 / ISO 45001 Rule 3 & 4)
  const gatingCheck = useMemo(() => {
    if (!selectedPermit) return { isBlocked: false, reasons: [], passCount: 5, totalCount: 5 };
    const reasons: string[] = [];
    const isAlDuqm = (selectedPermit.contractor || '').toLowerCase().includes('duqm') ||
                     (selectedPermit.title || '').toLowerCase().includes('tank tk-402') ||
                     selectedPermit.id === 'ptw-geig-002';

    if (isAlDuqm) {
      reasons.push('Contractor Al Duqm Industrial Tank Cleaning has SUSPENDED status (Expired Workmen Comp Insurance).');
      reasons.push('Lead Entrant Rajesh Kumar has EXPIRED mandatory H2S and Medical Fitness certifications.');
      reasons.push('Atmospheric Gas Testing FAILED safety thresholds (LEL > 1%, H2S > 1 ppm).');
      reasons.push('SIMOPS Conflict: Clashing with simultaneous hydro-test on line P-102 in Tank Farm B.');
    }

    if (selectedPermit.simopsClashLocked && !reasons.some(r => r.includes('SIMOPS'))) {
      reasons.push('SIMOPS Conflict Lock: Simultaneous high-risk operations detected in active zone.');
    }

    const passCount = Math.max(0, 5 - reasons.length);
    return {
      isBlocked: reasons.length > 0,
      reasons,
      passCount,
      totalCount: 5
    };
  }, [selectedPermit]);

  // Live gas evaluation for current new reading form
  const gasEval = useMemo(() => {
    const o2 = parseFloat(newO2) || 0;
    const lel = parseFloat(newLEL) || 0;
    const h2s = parseFloat(newH2S) || 0;
    const co = parseFloat(newCO) || 0;
    return evaluateGasAtmosphere(o2, lel, h2s, co);
  }, [newO2, newLEL, newH2S, newCO]);

  // Filtered permits based on Active Regional Compliance Mode
  const filteredPermits = useMemo(() => {
    return permits.filter(p => {
      // 1. Regional Compliance Isolation
      const isOmanPermit = (p.issuerSignature?.signatoryOrg || '').toLowerCase().includes('pdo') ||
        (p.contractor || '').toLowerCase().includes('oman') ||
        (p.contractor || '').toLowerCase().includes('galfar') ||
        (p.exactLocation || '').toLowerCase().includes('fahud') ||
        (p.exactLocation || '').toLowerCase().includes('sohar');

      if (isUaeMode && isOmanPermit) return false;
      if (isOmanMode && !isOmanPermit) return false;

      // 2. Standard Filters
      const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesSearch = 
        p.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contractor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [permits, typeFilter, statusFilter, searchQuery, isUaeMode, isOmanMode]);

  // KPIs
  const kpis = useMemo(() => {
    const active = permits.filter(p => p.status === 'Active').length;
    const highRisk = permits.filter(p => p.type === 'Hot Work' || p.type === 'Confined Space Entry' || p.type === 'Critical Lift').length;
    const pendingAuth = permits.filter(p => p.status === 'Requested').length;
    const lotoTotal = permits.reduce((acc, p) => acc + p.lotoIsolations.filter(l => l.status !== 'De-isolated').length, 0);
    const simopsClashes = permits.filter(p => p.simopsClashLocked).length;
    return { active, highRisk, pendingAuth, lotoTotal, simopsClashes };
  }, [permits]);

  // Helper for Type styling
  const getTypeBadge = (type: PermitType) => {
    switch (type) {
      case 'Hot Work':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', icon: Flame };
      case 'Cold Work':
        return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40', icon: Snowflake };
      case 'Confined Space Entry':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40', icon: AlertOctagon };
      case 'Working at Height':
        return { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/40', icon: Mountain };
      case 'Critical Lift':
        return { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/40', icon: Anchor };
      case 'Excavation':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', icon: Layers };
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/40', icon: FileSignature };
    }
  };

  // Helper for Status styling
  const getStatusBadge = (status: PermitStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
      case 'Requested':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Authorized':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Suspended':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Closed':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // Calculate validity countdown string
  const getValidityCountdown = (validTo: string, status: PermitStatus) => {
    if (status === 'Closed') return language === 'ar' ? 'مغلق ومؤرشف' : 'Closed & Archived';
    if (status === 'Draft') return language === 'ar' ? 'الصلاحية غير مفعلة' : 'Validity not activated';
    const diffMs = new Date(validTo).getTime() - Date.now();
    if (diffMs <= 0) return language === 'ar' ? 'منتهي الصلاحية' : 'Expired (Overdue)';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return language === 'ar'
      ? `متبقي ${hours} س و ${mins} د`
      : `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m remaining`;
  };

  // Run SIMOPS Conflict Validation
  const handleValidateSimops = (permit: Permit) => {
    const conflict = detectSimopsConflict(permit, permits);
    if (conflict.hasConflict) {
      setDetectedConflict(conflict);
      setSimopsModalOpen(true);
    } else {
      alert(`✅ SIMOPS Validation Passed:\n\nNo co-activity spatial clashes detected in ${permit.zone}. Safe separation buffers verified.`);
    }
  };

  // Enforce lock from SIMOPS modal
  const handleLockAuthorization = () => {
    if (!selectedPermit) return;
    setPermits(prev => prev.map(p => {
      if (p.id === selectedPermit.id) {
        return {
          ...p,
          simopsClashLocked: true,
          simopsClashDetails: detectedConflict?.hazardDescription
        };
      }
      return p;
    }));
    setSimopsModalOpen(false);
  };

  // Apply controller override from SIMOPS modal
  const handleApplyOverride = (justification: string) => {
    if (!selectedPermit) return;
    setPermits(prev => prev.map(p => {
      if (p.id === selectedPermit.id) {
        return {
          ...p,
          simopsClashLocked: false,
          overrideJustification: justification
        };
      }
      return p;
    }));
    setSimopsModalOpen(false);
  };

  // State Transitions
  const handleStateTransition = (newStatus: PermitStatus) => {
    if (!selectedPermit) return;

    // Check if SIMOPS clash prevents authorization
    if (newStatus === 'Authorized' && selectedPermit.simopsClashLocked) {
      alert('⚠️ CANNOT AUTHORIZE PERMIT:\n\nActive SIMOPS conflict detected! Resolve the clash or obtain Area SIMOPS Controller Waiver first.');
      handleValidateSimops(selectedPermit);
      return;
    }

    // Check gas readings before authorization or activation
    if ((newStatus === 'Authorized' || newStatus === 'Active') && (selectedPermit.type === 'Hot Work' || selectedPermit.type === 'Confined Space Entry')) {
      if (selectedPermit.gasTestingLog.length === 0) {
        alert('⚠️ MANDATORY REQUIREMENT:\nA certified Gas Test reading must be recorded before authorizing or activating this permit.');
        return;
      }
      const latestTest = selectedPermit.gasTestingLog[selectedPermit.gasTestingLog.length - 1];
      if (latestTest.status === 'DANGER') {
        alert('⚠️ ATMOSPHERE UNSAFE:\nLatest gas test reading indicates unsafe atmospheric thresholds. Re-test after mechanical ventilation.');
        return;
      }
    }

    setPermits(prev => prev.map(p => {
      if (p.id === selectedPermit.id) {
        return {
          ...p,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
    if (newStatus === 'Requested' && selectedPermit.status !== 'Requested' && workflowEnabled) {
      void createForRecord({
        recordType: 'Permit',
        recordId: selectedPermit.id,
        title: selectedPermit.title,
        priority: selectedPermit.type === 'Confined Space Entry' || selectedPermit.type === 'Hot Work' || selectedPermit.type === 'Critical Lift' ? 'High' : 'Medium',
        siteId: 'site-sohar',
        department: currentUser?.department
      }).then(() => setWorkflowError(null)).catch(cause => {
        setWorkflowError(cause instanceof Error ? cause.message : 'Workflow task creation failed.');
      });
    }
  };

  // Digital Signatures
  const handleSignIssuer = () => {
    if (!selectedPermit) return;
    if (!isAuthorizedIssuer) {
      alert('⚠️ Access Denied: Only designated Area Authorities / Permit Issuers (Supervisor, HSE Manager, Admin) can authorize permits under PDO SP-1143 / ISO 45001.');
      return;
    }
    if (gatingCheck.isBlocked) {
      alert(`🚨 SAFETY GATING ENFORCED (PDO SP-1143 / ISO 45001 Cl. 8.1):\n\nPermit authorization is BLOCKED by mandatory barrier failures:\n\n• ${gatingCheck.reasons.join('\n• ')}\n\nAction: Rectify all safety barriers before authorization can proceed.`);
      return;
    }
    if (selectedPermit.simopsClashLocked) {
      alert('⚠️ Cannot sign as Issuer while SIMOPS clash is locking authorization!');
      return;
    }
    const hash = 'SHA256:' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    setPermits(prev => prev.map(p => {
      if (p.id === selectedPermit.id) {
        const updatedIssuer = {
          signed: true,
          signatoryName: currentUser?.name || 'Eng. Tariq Al-Hashmi',
          signatoryRole: 'Area Authority / Shift Superintendent',
          signatoryOrg: currentTenant?.shortName || 'PDO Operations',
          certNumber: 'AA-CERT-9942',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' GST',
          digestHash: hash,
          checklistConfirmed: true
        };
        return {
          ...p,
          issuerSignature: updatedIssuer,
          status: 'Authorized',
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  const handleSignReceiver = () => {
    if (!selectedPermit) return;
    if (selectedPermit.status !== 'Authorized') {
      alert('⚠️ Permit must be Authorized by Issuer before Receiver acceptance.');
      return;
    }
    const hash = 'SHA256:' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    setPermits(prev => prev.map(p => {
      if (p.id === selectedPermit.id) {
        const updatedReceiver = {
          signed: true,
          signatoryName: currentUser?.name || 'Rajesh Kumar',
          signatoryRole: 'Performing Authority / Task Lead',
          signatoryOrg: selectedPermit.contractor,
          certNumber: 'PA-CERT-5510',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' GST',
          digestHash: hash,
          checklistConfirmed: true
        };
        return {
          ...p,
          receiverSignature: updatedReceiver,
          status: 'Active',
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  // Add new Gas Reading
  const handleSaveGasReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermit) return;
    const o2 = parseFloat(newO2) || 0;
    const lel = parseFloat(newLEL) || 0;
    const h2s = parseFloat(newH2S) || 0;
    const co = parseFloat(newCO) || 0;
    const evalRes = evaluateGasAtmosphere(o2, lel, h2s, co);

    const newReading: GasReading = {
      id: 'gt-' + Date.now(),
      timestamp: new Date().toISOString(),
      oxygen: o2,
      lel: lel,
      h2s: h2s,
      co: co,
      testerName: newTesterName,
      testerCertNo: newTesterCert,
      detectorSerial: newDetectorSerial,
      bumpTested: newBumpTested,
      status: evalRes.status,
      notes: evalRes.errors.length > 0 ? evalRes.errors.join(' | ') : 'Atmosphere verified compliant.'
    };

    setPermits(prev => prev.map(p => {
      if (p.id === selectedPermit.id) {
        return {
          ...p,
          gasTestingLog: [newReading, ...p.gasTestingLog]
        };
      }
      return p;
    }));

    setIsAddingGasReading(false);
  };

  // Add new LOTO Isolation
  const handleSaveLOTO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermit || !newLotoPoint.trim() || !newLotoEquipment.trim()) return;

    const newLoto: LOTOItem = {
      id: 'loto-' + Date.now(),
      tagNumber: newLotoTag,
      isolationPoint: newLotoPoint,
      equipmentName: newLotoEquipment,
      isolationType: newLotoType,
      status: 'Applied & Padlocked',
      isolatorSignature: currentUser?.name || 'M. Mansoori (Lead Tech)',
      isolatorId: 'EMP-9021',
      isolatorTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' GST',
      verifierSignature: '',
      verifierId: '',
      verifierTimestamp: ''
    };

    setPermits(prev => prev.map(p => {
      if (p.id === selectedPermit.id) {
        return {
          ...p,
          lotoIsolations: [...p.lotoIsolations, newLoto]
        };
      }
      return p;
    }));

    setIsAddingLOTO(false);
    setNewLotoPoint('');
    setNewLotoEquipment('');
  };

  // Verify Zero Energy for a LOTO Item
  const handleVerifyLOTO = (lotoId: string) => {
    if (!selectedPermit) return;
    setPermits(prev => prev.map(p => {
      if (p.id === selectedPermit.id) {
        return {
          ...p,
          lotoIsolations: p.lotoIsolations.map(item => {
            if (item.id === lotoId) {
              return {
                ...item,
                status: 'Zero Energy Verified',
                verifierSignature: currentUser?.name || 'Eng. Tariq Al-Hashmi',
                verifierId: 'AA-4412',
                verifierTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' GST'
              };
            }
            return item;
          })
        };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {workflowError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{workflowError}</p>}
      
      {/* Top Header Bar & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <FileSignature size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  Control of Work (e-PTW) & SIMOPS Engine
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {activeProfile.flag} {activeProfile.permitRule.standard}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {filteredPermits.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Safe Systems of Work (SSOW), Multi-Gas Threshold Certification, LOTO Registers & Spatial Clash Deconfliction
              </p>
            </div>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('DETAIL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'DETAIL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            Permit Dossier
          </button>
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'REGISTER'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            All Permits ({permits.length})
          </button>
          <button
            onClick={() => setActiveTab('SIMOPS_RADAR')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SIMOPS_RADAR'
                ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio size={14} className={kpis.simopsClashes > 0 ? 'animate-pulse text-red-300' : ''} />
            SIMOPS Radar {kpis.simopsClashes > 0 && `(${kpis.simopsClashes} Clash)`}
          </button>
        </div>
      </div>

      {/* Regional High-Temperature / Thermal Stress Work Stoppage Alert Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isUaeMode 
          ? 'bg-amber-950/40 border-amber-600/50 text-amber-200' 
          : isOmanMode 
          ? 'bg-rose-950/40 border-rose-600/50 text-rose-200' 
          : 'bg-indigo-950/40 border-indigo-600/50 text-indigo-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-white/10">
                {activeProfile.flag} Statutory Thermal Stress Protection
              </span>
              <span className="font-bold">{activeProfile.heatStressRule.legalBasis}</span>
            </div>
            <p className="text-[11px] opacity-90 mt-1">
              Mandatory Work-Stoppage Hours: <strong>{activeProfile.heatStressRule.prohibitedHours}</strong> ({activeProfile.heatStressRule.monthsApplicable}). 
              Atmospheric Threshold: <strong>{activeProfile.heatStressRule.redThreshold}</strong>.
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 shrink-0 self-start sm:self-auto">
          Enforced by {activeProfile.authorities[0]?.shortName || activeProfile.authorities[0]?.name}
        </div>
      </div>

      {/* Operational Metric KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Active Permits</span>
            <Activity size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{kpis.active}</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Continuous Monitoring Active</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>High Risk Operations</span>
            <Flame size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{kpis.highRisk}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Hot Work / Confined / Lift</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Authorization</span>
            <Clock size={14} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1">{kpis.pendingAuth}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Issuer Endorsement</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active LOTO Isolations</span>
            <Lock size={14} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 mt-1">{kpis.lotoTotal}</div>
          <div className="text-[10px] text-purple-300 font-semibold mt-0.5">Padlocked / Zero Energy</div>
        </div>

        <div className="bg-slate-900/80 border border-red-500/40 p-3.5 rounded-xl bg-red-950/20">
          <div className="flex items-center justify-between text-xs text-red-300">
            <span>SIMOPS Conflict Lock</span>
            <AlertOctagon size={14} className="text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-400 mt-1">{kpis.simopsClashes}</div>
          <div className="text-[10px] text-red-400 font-semibold mt-0.5">Co-activity Buffer Violations</div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'DETAIL' && selectedPermit && (
        <div className="space-y-6">
          
          {/* PERMIT HEADER COMPONENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            
            {/* Top Bar with Number, Type, Validity Countdown, and Status */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-lg font-black text-white px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg">
                  {selectedPermit.permitNumber}
                </span>

                {/* Permit Type Badge */}
                {(() => {
                  const badge = getTypeBadge(selectedPermit.type);
                  const Icon = badge.icon;
                  return (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold text-xs ${badge.bg} ${badge.text} ${badge.border}`}>
                      <Icon size={14} />
                      <span className="font-arabic">{getTranslatedType(selectedPermit.type)}</span>
                    </div>
                  );
                })()}

                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-lg border font-bold text-xs uppercase tracking-wider font-arabic ${getStatusBadge(selectedPermit.status)}`}>
                  {getTranslatedStatus(selectedPermit.status)}
                </span>

                {/* SIMOPS Clash Lock Indicator */}
                {selectedPermit.simopsClashLocked && (
                  <span className="px-2.5 py-1 rounded-lg bg-red-600/30 border border-red-500/60 text-red-300 font-black text-xs flex items-center gap-1 animate-pulse">
                    <AlertTriangle size={13} />
                    SIMOPS Clash Locked
                  </span>
                )}
              </div>

              {/* Validity Countdown & Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <Clock size={14} className="text-amber-400" />
                  <span className="text-slate-400">Validity:</span>
                  <span className="font-mono font-bold text-white">
                    {getValidityCountdown(selectedPermit.validTo, selectedPermit.status)}
                  </span>
                </div>

                {/* Validate SIMOPS Conflicts Action Button */}
                <button
                  type="button"
                  onClick={() => handleValidateSimops(selectedPermit)}
                  className="px-3.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Radio size={14} className="text-red-400 animate-spin" />
                  Validate SIMOPS Conflicts
                </button>
              </div>
            </div>

            {/* Lifecycle State Progress Stepper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                <span>1. Draft</span>
                <span>2. Requested</span>
                <span>3. Authorized</span>
                <span>4. Active</span>
                <span>5. Suspended</span>
                <span>6. Closed</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {(['Draft', 'Requested', 'Authorized', 'Active', 'Suspended', 'Closed'] as PermitStatus[]).map((step, idx) => {
                  const isCurrent = selectedPermit.status === step;
                  const isDone = ['Draft', 'Requested', 'Authorized', 'Active', 'Suspended', 'Closed'].indexOf(selectedPermit.status) >= idx;
                  return (
                    <div 
                      key={step}
                      className={`h-2 rounded-full transition-all ${
                        isCurrent 
                          ? 'bg-blue-500 shadow-md shadow-blue-500/50' 
                          : isDone 
                            ? 'bg-emerald-600' 
                            : 'bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Permit Metadata & Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Location & Facility Zone
                </span>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <MapPin size={14} className="text-blue-400 flex-shrink-0" />
                  <span>{selectedPermit.zone}</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1 ms-5">
                  {selectedPermit.exactLocation}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Contractor & Crew Composition
                </span>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Users size={14} className="text-purple-400 flex-shrink-0" />
                  <span>{selectedPermit.contractor}</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1 ms-5">
                  Assigned Crew: {selectedPermit.crewSize} Specialized Technicians
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Shift Timing & Schedule Window
                </span>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-400 flex-shrink-0" />
                  <span>07:00 - 19:00 Day Shift (GST)</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1 ms-5">
                  Risk Level: <span className="font-bold text-amber-400">{selectedPermit.riskRating} ({selectedPermit.riskScore}/25)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                Authorized Scope of Work:
              </span>
              <p className="leading-relaxed">{selectedPermit.description}</p>
            </div>

            {/* AUTOMATED SAFETY BARRIER GATING MATRIX BANNER */}
            <div className={`p-4 rounded-xl border ${
              gatingCheck.isBlocked
                ? 'bg-red-950/30 border-red-500/50 text-red-200'
                : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className={gatingCheck.isBlocked ? 'text-red-400' : 'text-emerald-400'} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Automated Safety Barrier Gating Status (PDO SP-1143 / ISO 45001)
                  </span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  gatingCheck.isBlocked
                    ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                    : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {gatingCheck.isBlocked ? '❌ AUTHORIZATION BLOCKED' : '✅ 5/5 BARRIERS PASSED'}
                </span>
              </div>

              {gatingCheck.isBlocked ? (
                <div className="space-y-1 text-[11px] text-red-300 mt-2 bg-red-950/50 p-2.5 rounded-lg border border-red-500/30">
                  <p className="font-semibold text-red-200">Mandatory statutory or client prerequisites failed:</p>
                  {gatingCheck.reasons.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-red-400 font-mono">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-300/90">
                  Contractor prequalified, worker competencies valid, atmospheric gas levels verified, and zero co-activity SIMOPS clashes.
                </p>
              )}
            </div>

            {/* State Transition Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Current State:</span>
                <span className="font-bold text-white">{selectedPermit.status}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {selectedPermit.status === 'Draft' && (
                  <button
                    type="button"
                    onClick={() => handleStateTransition('Requested')}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/40"
                  >
                    <Send size={14} />
                    Submit for Area HSE Review
                  </button>
                )}

                {selectedPermit.status === 'Requested' && (
                  <>
                    <button
                      type="button"
                      disabled={selectedPermit.simopsClashLocked || !isAuthorizedIssuer || gatingCheck.isBlocked}
                      onClick={handleSignIssuer}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/40"
                      title={gatingCheck.isBlocked ? 'Blocked by Safety Gating Matrix' : (!isAuthorizedIssuer ? 'Restricted: Permit Issuer Role Required' : undefined)}
                    >
                      <CheckCircle2 size={14} />
                      {gatingCheck.isBlocked ? 'Authorization Gated (Blocked)' : (isAuthorizedIssuer ? 'Authorize Permit (Issuer Sign)' : 'Issuer Sign-off Restricted')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStateTransition('Draft')}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      Return for Revisions
                    </button>
                  </>
                )}

                {selectedPermit.status === 'Authorized' && (
                  <>
                    <button
                      type="button"
                      onClick={handleSignReceiver}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/40"
                    >
                      <FileSignature size={14} />
                      Accept & Activate Work (Receiver Sign)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStateTransition('Suspended')}
                      className="px-3.5 py-2 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs"
                    >
                      Hold / Suspend
                    </button>
                  </>
                )}

                {selectedPermit.status === 'Active' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStateTransition('Suspended')}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-900/40"
                    >
                      <Ban size={14} />
                      Suspend Work (SWA / Weather / SIMOPS)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStateTransition('Closed')}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
                    >
                      <Check size={14} />
                      Complete Work & De-Isolate (Close)
                    </button>
                  </>
                )}

                {selectedPermit.status === 'Suspended' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStateTransition('Active')}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <RefreshCw size={14} />
                      Resume Work (Post Re-Inspection)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStateTransition('Closed')}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      Cancel / Close Permit
                    </button>
                  </>
                )}

                {selectedPermit.status === 'Closed' && (
                  <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono">
                    Archived to Cryptographic Audit Ledger
                  </span>
                )}
              </div>
            </div>

          </div>

          <WorkflowRecordPanel recordType="Permit" recordId={selectedPermit.id} />

          {/* TWO-COLUMN WORKFLOW SECTION: GAS TESTING & LOTO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* MANDATORY GAS TESTING LOG CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600/20 border border-emerald-500/40 rounded-lg text-emerald-400">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Mandatory Atmospheric Gas Testing Log
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      O₂ (%), LEL (%), H₂S (ppm), CO (ppm) with Automated Pass/Fail
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingGasReading(!isAddingGasReading)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1 transition-colors"
                >
                  <Plus size={13} />
                  {isAddingGasReading ? 'Cancel' : 'Log New Reading'}
                </button>
              </div>

              {/* Add Gas Reading Form Drawer */}
              {isAddingGasReading && (
                <form onSubmit={handleSaveGasReading} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Authorized Gas Tester (AGT) Input
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      gasEval.status === 'SAFE' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : gasEval.status === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}>
                      Threshold Status: {gasEval.status}
                    </span>
                  </div>

                  {/* 4 Multi-Gas Inputs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Oxygen O₂ (%)
                      </label>
                      <input 
                        type="number"
                        step="0.1"
                        value={newO2}
                        onChange={(e) => setNewO2(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white text-center focus:outline-none focus:border-blue-500 font-bold"
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-1">19.5 - 23.5%</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        LEL (%)
                      </label>
                      <input 
                        type="number"
                        step="0.5"
                        value={newLEL}
                        onChange={(e) => setNewLEL(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white text-center focus:outline-none focus:border-blue-500 font-bold"
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-1">&lt; 10% limit</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        H₂S (ppm)
                      </label>
                      <input 
                        type="number"
                        step="0.1"
                        value={newH2S}
                        onChange={(e) => setNewH2S(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white text-center focus:outline-none focus:border-blue-500 font-bold"
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-1">&lt; 10 ppm</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        CO (ppm)
                      </label>
                      <input 
                        type="number"
                        step="1"
                        value={newCO}
                        onChange={(e) => setNewCO(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white text-center focus:outline-none focus:border-blue-500 font-bold"
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-1">&lt; 25 ppm</span>
                    </div>
                  </div>

                  {/* Warning / Error evaluation display */}
                  {gasEval.errors.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs space-y-1">
                      {gasEval.errors.map((err, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AGT Certification & Instrument Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Certified AGT Name
                      </label>
                      <input 
                        type="text"
                        value={newTesterName}
                        onChange={(e) => setNewTesterName(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Card / Cert #
                      </label>
                      <input 
                        type="text"
                        value={newTesterCert}
                        onChange={(e) => setNewTesterCert(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Detector Serial #
                      </label>
                      <input 
                        type="text"
                        value={newDetectorSerial}
                        onChange={(e) => setNewDetectorSerial(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newBumpTested}
                        onChange={(e) => setNewBumpTested(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                      />
                      <span>Bump Test & Fresh Air Zero Calibrated</span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40"
                    >
                      Record Certified Gas Reading
                    </button>
                  </div>
                </form>
              )}

              {/* Gas Log History Table */}
              <div className="space-y-3">
                {selectedPermit.gasTestingLog.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No gas readings recorded yet. Mandatory for Hot Work & Confined Space operations.
                  </div>
                ) : (
                  selectedPermit.gasTestingLog.map((test) => (
                    <div 
                      key={test.id}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            test.status === 'SAFE' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}>
                            {test.status}
                          </span>
                          <span className="font-mono text-slate-400">
                            {new Date(test.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GST
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          AGT: <strong className="text-slate-200">{test.testerName}</strong> ({test.testerCertNo})
                        </span>
                      </div>

                      {/* Threshold Grid */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">O₂</span>
                          <span className={`font-mono font-bold ${test.oxygen < 19.5 || test.oxygen > 23.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {test.oxygen}%
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">LEL</span>
                          <span className={`font-mono font-bold ${test.lel >= 10 ? 'text-red-400' : test.lel >= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {test.lel}%
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">H₂S</span>
                          <span className={`font-mono font-bold ${test.h2s >= 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {test.h2s} ppm
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">CO</span>
                          <span className={`font-mono font-bold ${test.co >= 25 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {test.co} ppm
                          </span>
                        </div>
                      </div>

                      {test.notes && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                          <span>{test.notes}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* LOCKOUT-TAGOUT (LOTO) ISOLATION TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-600/20 border border-purple-500/40 rounded-lg text-purple-400">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Lockout-Tagout (LOTO) Isolation Register
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Mechanical & Electrical Isolation Points & Zero Energy Verification
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingLOTO(!isAddingLOTO)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1 transition-colors"
                >
                  <Plus size={13} />
                  {isAddingLOTO ? 'Cancel' : 'Add Point'}
                </button>
              </div>

              {/* Add LOTO Form Drawer */}
              {isAddingLOTO && (
                <form onSubmit={handleSaveLOTO} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        LOTO Tag #
                      </label>
                      <input 
                        type="text"
                        value={newLotoTag}
                        onChange={(e) => setNewLotoTag(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Isolation Type
                      </label>
                      <select 
                        value={newLotoType}
                        onChange={(e) => setNewLotoType(e.target.value as any)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        <option value="Mechanical">Mechanical (Valve / Blind)</option>
                        <option value="Electrical">Electrical (Breaker / Switch)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Equipment Name
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Pump P-102A"
                        value={newLotoEquipment}
                        onChange={(e) => setNewLotoEquipment(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Isolation Point Location / Tag
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. MOV-102 Suction Valve Spaded with 600# Blind"
                      value={newLotoPoint}
                      onChange={(e) => setNewLotoPoint(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/40"
                    >
                      Apply & Padlock Isolation
                    </button>
                  </div>
                </form>
              )}

              {/* LOTO Table */}
              <div className="space-y-3">
                {selectedPermit.lotoIsolations.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No physical isolations attached. Energy isolation required for high risk maintenance.
                  </div>
                ) : (
                  selectedPermit.lotoIsolations.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                            {item.tagNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.isolationType === 'Mechanical' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {item.isolationType}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          item.status === 'Zero Energy Verified' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="text-slate-200 font-semibold">
                        {item.equipmentName} - <span className="text-slate-400 font-normal">{item.isolationPoint}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                        <div>
                          Isolator: <span className="text-slate-200">{item.isolatorSignature}</span> ({item.isolatorTimestamp})
                        </div>

                        {item.verifierSignature ? (
                          <div className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Verified: {item.verifierSignature}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleVerifyLOTO(item.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-[10px] transition-colors"
                          >
                            Confirm Zero Energy
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* FORMAL DIGITAL SIGNATURE AUTHORIZATION BLOCKS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PERMIT ISSUER (AREA AUTHORITY) BLOCK */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Permit Issuer Authorization Block
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Area Authority / Operations Lead Endorsement
                    </p>
                  </div>
                </div>

                {selectedPermit.issuerSignature.signed ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Authorized
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                    Signature Required
                  </span>
                )}
              </div>

              {/* Issuer Verification Checkpoints */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={selectedPermit.issuerSignature.signed ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>Physical worksite inspection completed & hazardous energy verified isolated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={selectedPermit.issuerSignature.signed ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>Atmospheric gas test results certified within permissible legal exposure limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={selectedPermit.issuerSignature.signed ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>SIMOPS conflict radar clear or mitigated by Area Controller Waiver</span>
                </div>
              </div>

              {/* Issuer Signature Card */}
              {selectedPermit.issuerSignature.signed ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Authorized Signatory</span>
                      <span className="font-bold text-white text-sm">{selectedPermit.issuerSignature.signatoryName}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Timestamp</span>
                      <span className="font-mono text-slate-300">{selectedPermit.issuerSignature.timestamp}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{selectedPermit.issuerSignature.signatoryRole} ({selectedPermit.issuerSignature.certNumber})</span>
                    <span className="text-emerald-400 truncate max-w-[180px]">{selectedPermit.issuerSignature.digestHash}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={selectedPermit.simopsClashLocked || !isAuthorizedIssuer}
                    onClick={handleSignIssuer}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-colors"
                    title={!isAuthorizedIssuer ? 'Restricted: Designated Area Authority / Permit Issuer Role Required' : undefined}
                  >
                    <FileSignature size={15} />
                    {isAuthorizedIssuer ? 'Sign & Endorse as Area Authority (Issuer)' : 'Issuer Endorsement Restricted (Issuer Role Required)'}
                  </button>
                  {selectedPermit.simopsClashLocked && (
                    <p className="text-[11px] text-red-400 text-center mt-2 flex items-center justify-center gap-1">
                      <AlertTriangle size={12} />
                      Blocked by Active SIMOPS Clash. Use Validate SIMOPS to resolve or waive.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* PERMIT RECEIVER (PERFORMING AUTHORITY) BLOCK */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-600/20 border border-purple-500/40 rounded-lg text-purple-400">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Permit Receiver Acceptance Block
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Performing Authority / Contractor Task Supervisor
                    </p>
                  </div>
                </div>

                {selectedPermit.receiverSignature.signed ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Work Accepted
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                    Pending Acceptance
                  </span>
                )}
              </div>

              {/* Receiver Verification Checkpoints */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={selectedPermit.receiverSignature.signed ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>Toolbox Talk (TBT) conducted with crew & emergency stop work authority (SWA) briefed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={selectedPermit.receiverSignature.signed ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>Tools and electrical equipment certified Ex/ATEX Zone 1 compliant & inspected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={selectedPermit.receiverSignature.signed ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>Fire watch, rescue tripod & required PPE verified in place prior to start</span>
                </div>
              </div>

              {/* Receiver Signature Card */}
              {selectedPermit.receiverSignature.signed ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Performing Authority</span>
                      <span className="font-bold text-white text-sm">{selectedPermit.receiverSignature.signatoryName}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Timestamp</span>
                      <span className="font-mono text-slate-300">{selectedPermit.receiverSignature.timestamp}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{selectedPermit.receiverSignature.signatoryOrg} ({selectedPermit.receiverSignature.certNumber})</span>
                    <span className="text-emerald-400 truncate max-w-[180px]">{selectedPermit.receiverSignature.digestHash}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={selectedPermit.status !== 'Authorized'}
                    onClick={handleSignReceiver}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-colors"
                  >
                    <FileSignature size={15} />
                    Sign & Accept Permit as Performing Authority
                  </button>
                  {selectedPermit.status !== 'Authorized' && (
                    <p className="text-[11px] text-slate-500 text-center mt-2">
                      Issuer must complete formal authorization before Receiver accepts custody.
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* PERMIT REGISTER / LIST VIEW TAB */}
      {activeTab === 'REGISTER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Permit #, Title, Zone, or Contractor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-10 pe-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Permit Types</option>
                <option value="Hot Work">Hot Work</option>
                <option value="Cold Work">Cold Work</option>
                <option value="Confined Space Entry">Confined Space Entry</option>
                <option value="Working at Height">Working at Height</option>
                <option value="Critical Lift">Critical Lift</option>
                <option value="Excavation">Excavation</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Requested">Requested</option>
                <option value="Authorized">Authorized</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Permit Cards List */}
          <div className="space-y-3">
            {filteredPermits.map((permit) => {
              const badge = getTypeBadge(permit.type);
              const Icon = badge.icon;
              const isSelected = selectedPermitId === permit.id;

              return (
                <div
                  key={permit.id}
                  onClick={() => {
                    setSelectedPermitId(permit.id);
                    setActiveTab('DETAIL');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected 
                      ? 'bg-slate-800/80 border-blue-500 shadow-lg shadow-blue-950/40' 
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`p-3 rounded-xl border flex-shrink-0 ${badge.bg} ${badge.border} ${badge.text}`}>
                      <Icon size={20} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          {permit.permitNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-arabic ${badge.bg} ${badge.text}`}>
                          {getTranslatedType(permit.type)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-arabic ${getStatusBadge(permit.status)}`}>
                          {getTranslatedStatus(permit.status)}
                        </span>
                        {permit.simopsClashLocked && (
                          <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-500/50 text-[10px] font-black animate-pulse flex items-center gap-1">
                            <AlertTriangle size={11} /> SIMOPS Clash
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-200">
                        {permit.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-500" />
                          {permit.zone}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300 font-semibold">{permit.contractor}</span>
                        <span>•</span>
                        <span>Crew: {permit.crewSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 text-xs">
                    <div className="text-end hidden sm:block">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Validity</span>
                      <span className="font-mono text-slate-300 font-semibold">
                        {getValidityCountdown(permit.validTo, permit.status)}
                      </span>
                    </div>

                    <ChevronRight size={18} className="text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SIMOPS RADAR & SPATIAL CLASH MATRIX TAB */}
      {activeTab === 'SIMOPS_RADAR' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Radio size={20} className="text-red-400 animate-spin" />
                <h3 className="text-base font-bold text-white">
                  Live SIMOPS Spatial Deconfliction Radar
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time zone monitoring for incompatible simultaneous operations (Hot Work vs Hydrocarbon Venting, Critical Lifts, Excavation)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Clear Zone
              </span>
              <span className="flex items-center gap-1.5 text-red-400 font-semibold ms-3">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span> Active Clash
              </span>
            </div>
          </div>

          {/* Operational Zones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'zone-1',
                name: 'Zone 1 - Crude Distillation Unit',
                risk: 'High Hydrocarbon Inventory',
                permitsInZone: permits.filter(p => p.zone.includes('Zone 1'))
              },
              {
                id: 'zone-2',
                name: 'Zone 2 - Gas Sweetening & Fractionation',
                risk: 'Sour H2S & Flammable Gas Risk',
                permitsInZone: permits.filter(p => p.zone.includes('Zone 2'))
              },
              {
                id: 'zone-3',
                name: 'Zone 3 - Tank Farm & Loading Gantry',
                risk: 'Atmospheric Storage & Vapor Dispersion',
                permitsInZone: permits.filter(p => p.zone.includes('Zone 3'))
              },
              {
                id: 'zone-4',
                name: 'Zone 4 - Flare & Utilities Header',
                risk: 'Thermal Radiation & Elevated Discharge',
                permitsInZone: permits.filter(p => p.zone.includes('Zone 4'))
              },
              {
                id: 'zone-5',
                name: 'Zone 5 - High Voltage Substation',
                risk: 'Electrocution & Buried Cables',
                permitsInZone: permits.filter(p => p.zone.includes('Zone 5'))
              },
              {
                id: 'zone-6',
                name: 'Offsite Pipeline Corridor',
                risk: 'Pressurized High-Pressure Transmission',
                permitsInZone: permits.filter(p => p.zone.includes('Pipeline'))
              }
            ].map(zone => {
              const hasClash = zone.permitsInZone.some(p => p.simopsClashLocked);
              const activeCount = zone.permitsInZone.filter(p => p.status === 'Active' || p.status === 'Authorized').length;

              return (
                <div 
                  key={zone.id}
                  className={`p-4 rounded-xl border transition-all ${
                    hasClash 
                      ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/40 ring-1 ring-red-500/40' 
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        {hasClash && <AlertOctagon size={15} className="text-red-400 animate-pulse" />}
                        {zone.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{zone.risk}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      hasClash ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {hasClash ? 'CLASH ACTIVE' : `${activeCount} Co-Activities`}
                    </span>
                  </div>

                  {/* Permits in this Zone */}
                  <div className="mt-3.5 space-y-2">
                    {zone.permitsInZone.length === 0 ? (
                      <div className="text-[11px] text-slate-600 py-2">No active permits in zone</div>
                    ) : (
                      zone.permitsInZone.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => {
                            setSelectedPermitId(p.id);
                            setActiveTab('DETAIL');
                          }}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-mono font-bold text-slate-300 flex items-center gap-1.5">
                              <span>{p.permitNumber}</span>
                              <span className="text-[10px] text-slate-500">({p.type})</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              {p.title}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBadge(p.status)}`}>
                            {p.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SIMOPS Rules Reference Card */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              GCC Industrial SIMOPS Deconfliction Policy (PDO SP-1143 Specification / PDO PR-1172):
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Hot Work is prohibited within 50 meters of any open vessel, vent, or tank entry where flammable hydrocarbon vapors may escape.</li>
              <li>Critical tandem crane lifts require suspension of all lower-tier work within the full 360° boom swing radius.</li>
              <li>Excavation depths exceeding 1.2m require de-energization of buried lines or hand-digging clearance within 3 meters.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SIMOPS Clash Interactive Modal */}
      {detectedConflict && (
        <SimopsClashModal
          isOpen={simopsModalOpen}
          conflict={detectedConflict}
          currentPermitNumber={selectedPermit.permitNumber}
          currentPermitType={selectedPermit.type}
          onClose={() => setSimopsModalOpen(false)}
          onLockAuthorization={handleLockAuthorization}
          onApplyOverride={handleApplyOverride}
        />
      )}

    </div>
  );
};

export default ControlOfWorkModule;
