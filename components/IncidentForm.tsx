import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AlertOctagon, Plus, ShieldAlert, Clock, Camera, X, Search,
  Filter, ArrowLeft, FileText, CheckCircle2, AlertTriangle, 
  Download, AlertCircle, ChevronRight, UserCheck, Send, MapPin,
  Calendar, Building2, User, Sparkles, BrainCircuit, Check, 
  Trash2, GitPullRequest, ArrowRight, CornerDownRight, FileSignature, 
  ExternalLink, Layers, RefreshCw, Scale, Mic, MicOff, Loader2
} from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { GeminiClientService } from '../services/geminiClientService';
import { useUser } from '../contexts/UserContext';
import { useTenant } from '../contexts/TenantContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRegionalCompliance } from '../contexts/RegionalComplianceContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { WorkflowRecordPanel } from './workflow/WorkflowRecordPanel';
import { 
  Incident, 
  IncidentEvidenceItem, 
  IncidentFiveWhyItem, 
  IncidentFishboneFactors, 
  IncidentCapaAction 
} from '../types';
import { exportOmanMolNoticePdf, EntityContext } from '../services/gccStatutoryReportingService';
import { classifyIncident, generateIncidentRCA } from '../services/geminiService';
import { offlineStorage } from '../services/offlineStorage';
import { SyncEngine } from '../services/syncEngine';
import { DemoDataLoader } from '../services/demoDataLoader';
import { AIGovernanceCard } from './ai/AIGovernanceCard';
import { 
  generateDraftFiveWhys, 
  checkStatutoryCompliance, 
  FiveWhyDraftResult, 
  StatutoryComplianceResult,
  HITLReviewDecision 
} from '../services/aiAssistantService';

const GCC_PRESET_SITES = [
  { name: 'Mina Al Fahal Refinery Complex (Muscat)', jurisdiction: 'Oman', country: 'Oman', code: 'OMN-MAF-01', lat: 23.6300, lng: 58.5100 },
  { name: 'Fahud Field - Gathering Station Block 6', jurisdiction: 'Oman', country: 'Oman', code: 'OMN-FHD-01', lat: 22.3167, lng: 56.4833 },
  { name: 'Sohar Industrial Port Terminal', jurisdiction: 'Oman', country: 'Oman', code: 'OMN-SOH-01', lat: 24.4980, lng: 56.6340 },
  { name: 'Duqm Special Economic Zone (SEZAD / OQ8)', jurisdiction: 'Oman', country: 'Oman', code: 'OMN-DQM-02', lat: 19.6738, lng: 57.7042 },
  { name: 'Nimr Production Station (Block 6 South)', jurisdiction: 'Oman', country: 'Oman', code: 'OMN-NMR-03', lat: 18.6667, lng: 55.7500 },
  { name: 'Khazzan Gas Processing Complex (Block 61)', jurisdiction: 'Oman', country: 'Oman', code: 'OMN-KHZ-01', lat: 21.5000, lng: 56.0000 }
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-0419',
    type: 'Equipment Failure',
    classification: 'Lost Time Injury',
    description: 'High-pressure hydraulic hose failure on rough-terrain mobile crane during valve skid offloading. Spray of pressurized fluid caused second-degree thermal and fluid burns to technician forearm (3 lost workdays). Immediate emergency medical evacuation executed.',
    immediateActionsTaken: 'Task halted immediately via Stop Work Authority. Crane engine emergency shut down (ESD-02). Area isolated with 20m red barrier tape. Injured worker administered first-aid burn dressing and transported to Fahud Industrial Medical Clinic.',
    location: 'Fahud Field - Gathering Station Block 6',
    facilityCode: 'OMN-FHD-01',
    jurisdiction: 'Oman',
    severity: 'High',
    potentialSeverity: 'Critical',
    status: 'Under Investigation',
    timestamp: '2026-10-03T11:45:00Z',
    reportedBy: 'u4',
    reportedByName: 'Rashid Al-Kharusi (HSE Lead)',
    reportDeadline: '2026-10-04T11:45:00Z',
    coordinates: { lat: 22.3167, lng: 56.4833 },
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    ],
    evidenceItems: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Ruptured hydraulic crimp collar near secondary boom cylinder',
        timestamp: '2026-10-03T12:00:00Z',
        uploadedBy: 'Rashid Al-Kharusi'
      }
    ],
    fiveWhys: [
      { step: 1, whyText: 'Why did the worker sustain forearm burn injuries?', verificationEvidence: 'Hydraulic fluid sprayed at 180 bar and 82°C directly onto arm.' },
      { step: 2, whyText: 'Why did the hydraulic fluid spray uncontrollably?', verificationEvidence: 'The flexible hose ruptured at the end coupling crimp joint.' },
      { step: 3, whyText: 'Why did the hose coupling crimp joint fail?', verificationEvidence: 'The hose exceeded its manufacturer 2-year working lifecycle by 9 months.' },
      { step: 4, whyText: 'Why was the overdue hose not replaced during maintenance?', verificationEvidence: 'Preventive maintenance checklist did not mandate replacement of non-leaking hoses.' },
      { step: 5, whyText: 'Why did the maintenance system not mandate lifecycle replacement?', verificationEvidence: 'Root Cause: Inadequate vendor preventive maintenance specification in CMMS register for safety-critical hydraulic systems.' }
    ],
    rootCauseConclusion: 'Deficient CMMS scheduled maintenance task list failed to enforce time-based replacement of high-pressure safety-critical hydraulic lines before fatigue failure.',
    fishboneFactors: {
      manpower: ['Mechanic not wearing high-temperature Kevlar sleeves', 'Fatigue from extended afternoon shift'],
      machine: ['Over-aged hydraulic hose (33 months in service)', 'Absence of protective ballistic burst sleeve'],
      method: ['Preventive maintenance plan based on visual inspection only', 'Lack of pre-use pressure test protocol'],
      material: ['Non-OEM specification hose crimp installed by third-party vendor'],
      measurement: ['Operating hydraulic pressure gauge uncalibrated since Q1 2026'],
      environment: ['Extreme ambient temperature (44°C) accelerated elastomer degradation']
    },
    capaActions: [
      {
        id: 'CAPA-0419-1',
        description: 'Fit all active mobile cranes with certified ballistic burst containment sleeves across hydraulic lines.',
        assignee: 'Vikram Malhotra (Mechanical Construction Lead)',
        targetDate: '2026-10-08',
        priority: 'P1 - Critical',
        type: 'Corrective',
        status: 'In Progress',
        createdAt: '2026-10-03T15:00:00Z'
      },
      {
        id: 'CAPA-0419-2',
        description: 'Update SAP PM maintenance task lists to enforce 24-month hard replacement on high-pressure hoses.',
        assignee: 'Fatima Al-Hameli (Operations Superintendent)',
        targetDate: '2026-10-15',
        priority: 'P2 - High',
        type: 'Preventive',
        status: 'Open',
        createdAt: '2026-10-03T15:30:00Z'
      }
    ],
    statutorySubmissions: {
      omanMolNoticeSubmittedAt: '2026-10-03T14:30:00Z',
      omanMolReference: 'MOL-OMN-2026-FHD-0419'
    },
    auditLog: [
      { timestamp: '2026-10-03T11:50:00Z', actorId: 'u4', actorName: 'Rashid Al-Kharusi', action: 'Initial Field Incident Logged', details: 'Submitted via mobile PWA terminal.' },
      { timestamp: '2026-10-03T13:00:00Z', actorId: 'u2', actorName: 'Site HSE Manager', action: 'Triage Accepted', details: 'Classified as LTI with 24h statutory reporting trigger.' },
      { timestamp: '2026-10-03T14:30:00Z', actorId: 'u4', actorName: 'Rashid Al-Kharusi', action: 'Statutory Notice Generated', details: 'Exported official Oman MoL 24-Hour Notice.' }
    ]
  },
  {
    id: 'INC-2026-0422',
    type: 'Near Miss',
    classification: 'Process Safety Event',
    description: 'Scaffolding pipe dropped from 14-meter elevation during pipe-rack modification. Dropped object landed inside barricaded red zone 2.5 meters from active gas manifold line. No personnel struck.',
    immediateActionsTaken: 'Work stopped immediately on overhead pipe rack. Rigger work permits suspended pending scaffold tethering inspection. Tethering audit conducted.',
    location: 'Khazzan Gas Processing Complex - Train 2',
    facilityCode: 'OMN-KHZ-01',
    jurisdiction: 'Oman',
    severity: 'Medium',
    potentialSeverity: 'Critical',
    status: 'Reported',
    timestamp: '2026-10-04T06:15:00Z',
    reportedBy: 'u5',
    reportedByName: 'Ahmed Al-Shehhi',
    reportDeadline: '2026-10-07T06:15:00Z',
    coordinates: { lat: 23.7500, lng: 53.5000 },
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
    ],
    evidenceItems: [
      {
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        caption: 'Dropped 2-inch galvanized scaffold tube resting in exclusion perimeter',
        timestamp: '2026-10-04T06:25:00Z',
        uploadedBy: 'Ahmed Al-Shehhi'
      }
    ],
    fiveWhys: [],
    rootCauseConclusion: '',
    fishboneFactors: {
      manpower: [],
      machine: [],
      method: [],
      material: [],
      measurement: [],
      environment: []
    },
    capaActions: [],
    auditLog: [
      { timestamp: '2026-10-04T06:20:00Z', actorId: 'u5', actorName: 'Ahmed Al-Shehhi', action: 'Reported', details: 'Near Miss logged from field watch post.' }
    ]
  }
];

export const IncidentForm: React.FC<{ initialWorkflowRecordId?: string }> = ({ initialWorkflowRecordId }) => {
  const { currentUser } = useUser();
  const { enabled: workflowEnabled, createForRecord } = useWorkflow();
  const { currentTenant, currentSite } = useTenant();
  const { t } = useLanguage();
  const { regionalMode, isUaeMode, isOmanMode, isCombinedMode, activeProfile } = useRegionalCompliance();

  // Master State
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    return DemoDataLoader.getStoredIncidents();
  });
  const [workflowError, setWorkflowError] = useState<string | null>(null);

  // Listen to demonstration dataset reset event
  useEffect(() => {
    const handleReset = () => {
      const refreshed = DemoDataLoader.getStoredIncidents();
      setIncidents(refreshed);
      if (refreshed.length > 0) {
        setSelectedIncidentId(refreshed[0].id);
      }
    };
    window.addEventListener('ad6-demo-data-reset', handleReset);
    return () => window.removeEventListener('ad6-demo-data-reset', handleReset);
  }, []);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(() => initialWorkflowRecordId || incidents[0]?.id || 'INC-2026-OMN-0891');
  const [activeTab, setActiveTab] = useState<'overview' | 'investigation' | 'capa' | 'statutory'>('overview');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ----------------- Multi-Step Reporting Modal Form State -----------------
  const [reportStep, setReportStep] = useState<1 | 2 | 3>(1);
  const [formTimestamp, setFormTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [formSite, setFormSite] = useState(GCC_PRESET_SITES[0].name);
  const [formJurisdiction, setFormJurisdiction] = useState<'Abu Dhabi' | 'Oman' | 'Dubai' | 'KSA' | 'Qatar'>('Abu Dhabi');
  const [formLocationArea, setFormLocationArea] = useState('');
  const [formCoordinates, setFormCoordinates] = useState({ lat: 23.7500, lng: 53.5000 });
  const [formClassification, setFormClassification] = useState<Incident['classification']>('Near Miss');
  const [formActualSeverity, setFormActualSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [formPotentialSeverity, setFormPotentialSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  
  // Step 2 Narrative
  const [formDescription, setFormDescription] = useState('');
  const [formImmediateAction, setFormImmediateAction] = useState('');
  const [isAiClassifying, setIsAiClassifying] = useState(false);

  // Audio Recording with gemini-3.5-transcribe
  const {
    isRecording: isIncidentRecording,
    recordingDuration: incidentRecDuration,
    audioLevel: incidentAudioLevel,
    startRecording: startIncidentRecording,
    stopRecording: stopIncidentRecording,
    cancelRecording: cancelIncidentRecording
  } = useAudioRecorder();
  const [isIncidentTranscribing, setIsIncidentTranscribing] = useState(false);

  const handleToggleIncidentVoice = async () => {
    if (isIncidentRecording) {
      setIsIncidentTranscribing(true);
      try {
        const audioBlob = await stopIncidentRecording();
        if (audioBlob && audioBlob.size > 0) {
          const res = await GeminiClientService.transcribeAudio(
            audioBlob,
            'Transcribe this incident description with high technical precision for HSE records.'
          );
          if (res.text) {
            setFormDescription(prev => (prev ? prev + ' ' + res.text : res.text));
          }
        }
      } catch (err: any) {
        console.error('Incident audio transcription error:', err);
      } finally {
        setIsIncidentTranscribing(false);
      }
    } else {
      await startIncidentRecording();
    }
  };

  // Step 3 Evidence
  const [formEvidenceList, setFormEvidenceList] = useState<Array<{ url: string; caption: string }>>([
    { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', caption: 'Initial scene photograph of equipment' }
  ]);
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');
  const [newEvidenceCaption, setNewEvidenceCaption] = useState('');

  // ----------------- Active Incident Under View -----------------
  const currentIncident = useMemo(() => {
    return incidents.find(i => i.id === selectedIncidentId) || incidents[0] || null;
  }, [incidents, selectedIncidentId]);

  // ----------------- 5-Why Interactive State -----------------
  const [fiveWhysList, setFiveWhysList] = useState<IncidentFiveWhyItem[]>([]);
  const [rootCauseText, setRootCauseText] = useState('');

  // ----------------- Fishbone Interactive State -----------------
  const [fishbone, setFishbone] = useState<IncidentFishboneFactors>({
    manpower: [],
    machine: [],
    method: [],
    material: [],
    measurement: [],
    environment: []
  });
  const [newBoneFactor, setNewBoneFactor] = useState('');
  const [activeBoneCategory, setActiveBoneCategory] = useState<keyof IncidentFishboneFactors>('manpower');

  // ----------------- CAPA Assignment Form State -----------------
  const [newCapaDesc, setNewCapaDesc] = useState('');
  const [newCapaAssignee, setNewCapaAssignee] = useState('Vikram Malhotra');
  const [newCapaDate, setNewCapaDate] = useState('');
  const [newCapaPriority, setNewCapaPriority] = useState<IncidentCapaAction['priority']>('P1 - Critical');
  const [newCapaType, setNewCapaType] = useState<'Corrective' | 'Preventive'>('Corrective');

  // Synchronize URL to /incidents
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/incidents') {
      window.history.replaceState({}, '', '/incidents');
    }
  }, []);

  // Save incidents to localStorage
  useEffect(() => {
    localStorage.setItem('ad6_incidents', JSON.stringify(incidents));
    localStorage.setItem('ad6_enterprise_incidents', JSON.stringify(incidents));
    window.dispatchEvent(new CustomEvent('ad6-incidents-updated'));
  }, [incidents]);

  // Sync investigation state when selected incident changes
  useEffect(() => {
    if (currentIncident) {
      setFiveWhysList(currentIncident.fiveWhys && currentIncident.fiveWhys.length > 0 ? currentIncident.fiveWhys : [
        { step: 1, whyText: '', verificationEvidence: '' },
        { step: 2, whyText: '', verificationEvidence: '' },
        { step: 3, whyText: '', verificationEvidence: '' },
        { step: 4, whyText: '', verificationEvidence: '' },
        { step: 5, whyText: '', verificationEvidence: '' }
      ]);
      setRootCauseText(currentIncident.rootCauseConclusion || '');
      setFishbone(currentIncident.fishboneFactors || {
        manpower: [],
        machine: [],
        method: [],
        material: [],
        measurement: [],
        environment: []
      });
    }
  }, [currentIncident?.id]);

  // Grounded AI Workflows State (HITL Governance)
  const [isGeneratingFiveWhy, setIsGeneratingFiveWhy] = useState(false);
  const [draftFiveWhy, setDraftFiveWhy] = useState<FiveWhyDraftResult | null>(null);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [draftCompliance, setDraftCompliance] = useState<StatutoryComplianceResult | null>(null);

  const handleGenerateAiDraftFiveWhy = async () => {
    if (!currentIncident) return;
    setIsGeneratingFiveWhy(true);
    try {
      const draft = await generateDraftFiveWhys(
        currentIncident.description,
        currentIncident.location,
        currentIncident.classification
      );
      setDraftFiveWhy(draft);
    } catch (e) {
      console.error('Error generating 5-Why draft', e);
    } finally {
      setIsGeneratingFiveWhy(false);
    }
  };

  const handleAcceptFiveWhyDraft = (decision: HITLReviewDecision) => {
    if (!draftFiveWhy || !currentIncident) return;

    // Apply draft to local state
    setFiveWhysList(draftFiveWhy.fiveWhys);
    setRootCauseText(draftFiveWhy.rootCauseConclusion);

    // Commit to persistent incident state with immutable audit log
    const updated = {
      ...currentIncident,
      fiveWhys: draftFiveWhy.fiveWhys,
      rootCauseConclusion: draftFiveWhy.rootCauseConclusion,
      auditLog: [
        ...currentIncident.auditLog,
        {
          timestamp: decision.reviewTimestamp,
          actorId: decision.reviewerId,
          actorName: decision.reviewerName,
          action: 'AI 5-Why Draft Accepted & Applied',
          details: `Safety officer ${decision.reviewerName} (${decision.reviewerRole}, Cert: ${decision.reviewerCertNumber}) certified and committed AI causal draft to record. Notes: ${decision.reviewNotes || 'None'}`
        }
      ]
    };

    setIncidents(prev => prev.map(inc => inc.id === currentIncident.id ? updated : inc));
    setSelectedIncidentId(updated.id);
    setDraftFiveWhy(null);
    alert('✅ AI 5-Why Draft successfully applied to record with human sign-off certification!');
  };

  const handleCheckStatutoryDeadlines = async () => {
    if (!currentIncident) return;
    setIsCheckingCompliance(true);
    try {
      const res = await checkStatutoryCompliance(
        currentIncident.classification,
        currentIncident.severity,
        currentIncident.jurisdiction,
        currentIncident.timestamp
      );
      setDraftCompliance(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingCompliance(false);
    }
  };

  // AI Assistant for Incident Classification
  const handleAiPreClassify = async () => {
    if (!formDescription.trim()) {
      alert('Please enter an event description first to run AI classification.');
      return;
    }
    setIsAiClassifying(true);
    try {
      const result = await classifyIncident(formDescription, formSite, 'OMAN_MOL_MD286' as any);
      if (result) {
        setFormActualSeverity(result.severity as any);
        if (result.type.includes('Injury')) {
          setFormClassification('Lost Time Injury');
        } else if (result.type.includes('Near Miss')) {
          setFormClassification('Near Miss');
        } else {
          setFormClassification('Process Safety Event');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiClassifying(false);
    }
  };

  // State Transition Machine
  const handleStateTransition = (targetStatus: Incident['status']) => {
    if (!currentIncident) return;

    const transitionLog = {
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || 'usr-lead',
      actorName: currentUser?.name || 'Authorized HSE Lead',
      action: `Status advanced to: ${targetStatus}`,
      details: `Life-cycle transition executed by authorized officer.`
    };

    const updatedIncidents = incidents.map(inc => {
      if (inc.id === currentIncident.id) {
        return {
          ...inc,
          status: targetStatus,
          auditLog: [transitionLog, ...inc.auditLog]
        };
      }
      return inc;
    });

    setIncidents(updatedIncidents);
  };

  // Submit Multi-step Reporting Modal
  const handleSubmitNewIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) {
      alert('Please provide an event narrative description.');
      return;
    }

    const newId = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const deadline = new Date(formTimestamp);
    deadline.setHours(deadline.getHours() + 24); // 24-hour statutory deadline

    const evidenceFormatted: IncidentEvidenceItem[] = formEvidenceList.map(e => ({
      url: e.url,
      caption: e.caption,
      timestamp: new Date().toISOString(),
      uploadedBy: currentUser?.name || 'Field Safety Reporter'
    }));

    const newIncidentObj: Incident = {
      id: newId,
      type: formClassification || 'Safety Incident',
      classification: formClassification,
      description: formDescription,
      immediateActionsTaken: formImmediateAction,
      location: `${formSite} ${formLocationArea ? `· ${formLocationArea}` : ''}`,
      jurisdiction: formJurisdiction,
      severity: formActualSeverity,
      potentialSeverity: formPotentialSeverity,
      status: 'Reported',
      timestamp: new Date(formTimestamp).toISOString(),
      reportedBy: currentUser?.id || 'u1',
      reportedByName: currentUser?.name || 'Field Reporter',
      reportDeadline: deadline.toISOString(),
      coordinates: formCoordinates,
      images: formEvidenceList.map(e => e.url),
      evidenceItems: evidenceFormatted,
      fiveWhys: [
        { step: 1, whyText: '', verificationEvidence: '' },
        { step: 2, whyText: '', verificationEvidence: '' },
        { step: 3, whyText: '', verificationEvidence: '' },
        { step: 4, whyText: '', verificationEvidence: '' },
        { step: 5, whyText: '', verificationEvidence: '' }
      ],
      rootCauseConclusion: '',
      fishboneFactors: { manpower: [], machine: [], method: [], material: [], measurement: [], environment: [] },
      capaActions: [],
      auditLog: [
        {
          timestamp: new Date().toISOString(),
          actorId: currentUser?.id || 'u1',
          actorName: currentUser?.name || 'Field Reporter',
          action: 'Incident Reported',
          details: 'Submitted via multi-step incident capture engine.'
        }
      ]
    };

    setIncidents([newIncidentObj, ...incidents]);
    DemoDataLoader.saveIncident(newIncidentObj);
    if (workflowEnabled) {
      void createForRecord({
        recordType: 'Incident',
        recordId: newId,
        title: formDescription.slice(0, 100),
        priority: formActualSeverity === 'Critical' ? 'Critical' : formActualSeverity === 'High' ? 'High' : 'Medium',
        highPotential: formPotentialSeverity === 'Critical',
        serious: formActualSeverity === 'Critical' || /fatal|lost time/i.test(formClassification),
        siteId: 'site-sohar',
        department: currentUser?.department
      }).then(() => setWorkflowError(null)).catch(cause => {
        setWorkflowError(cause instanceof Error ? cause.message : 'Workflow task creation failed.');
      });
    }
    setSelectedIncidentId(newId);
    setIsReportModalOpen(false);

    // If offline, serialize and queue into IndexedDB submission queue
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      SyncEngine.queueIncident({
        id: newId,
        title: formDescription.substring(0, 60) || `Field Incident ${newId}`,
        site: formSite,
        facility: formSite,
        classification: formClassification,
        severity: formActualSeverity,
        timestamp: new Date(formTimestamp).toISOString(),
        narrative: formDescription,
        immediateActions: formImmediateAction,
        evidence: formEvidenceList,
        status: 'PENDING_SYNC',
        jurisdiction: formJurisdiction,
        gpsCoordinates: formCoordinates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, `Incident ${newId} (${formClassification})`);
    }

    // Reset Form
    setReportStep(1);
    setFormDescription('');
    setFormImmediateAction('');
    setFormLocationArea('');
  };

  // Add Evidence Item
  const handleAddEvidence = () => {
    if (!newEvidenceUrl.trim()) return;
    setFormEvidenceList([
      ...formEvidenceList,
      { url: newEvidenceUrl, caption: newEvidenceCaption || 'Scene evidence photo' }
    ]);
    setNewEvidenceUrl('');
    setNewEvidenceCaption('');
  };

  // Save 5-Why Analysis
  const handleSaveFiveWhys = () => {
    if (!currentIncident) return;
    const updated = incidents.map(inc => {
      if (inc.id === currentIncident.id) {
        return {
          ...inc,
          fiveWhys: fiveWhysList,
          rootCauseConclusion: rootCauseText
        };
      }
      return inc;
    });
    setIncidents(updated);
    alert('5-Why Investigation Tree & Root Cause saved successfully.');
  };

  // Add Fishbone Factor
  const handleAddFishboneFactor = () => {
    if (!newBoneFactor.trim()) return;
    setFishbone(prev => ({
      ...prev,
      [activeBoneCategory]: [...prev[activeBoneCategory], newBoneFactor.trim()]
    }));
    setNewBoneFactor('');
  };

  // Save Fishbone Diagram
  const handleSaveFishbone = () => {
    if (!currentIncident) return;
    const updated = incidents.map(inc => {
      if (inc.id === currentIncident.id) {
        return {
          ...inc,
          fishboneFactors: fishbone
        };
      }
      return inc;
    });
    setIncidents(updated);
    alert('Fishbone causal factors saved.');
  };

  // Add CAPA Action
  const handleAddCapa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIncident || !newCapaDesc.trim() || !newCapaDate) return;

    const action: IncidentCapaAction = {
      id: `CAPA-${currentIncident.id.replace('INC-', '')}-${(currentIncident.capaActions?.length || 0) + 1}`,
      description: newCapaDesc,
      assignee: newCapaAssignee,
      targetDate: newCapaDate,
      priority: newCapaPriority,
      type: newCapaType,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    const updated = incidents.map(inc => {
      if (inc.id === currentIncident.id) {
        return {
          ...inc,
          capaActions: [...(inc.capaActions || []), action]
        };
      }
      return inc;
    });

    setIncidents(updated);

    // Sync to Central Store & CAPA Register (Dependency Rule 1)
    try {
      const priorityNorm: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' = 
        action.priority === 'P4 - Routine' ? 'P3 - Medium' : action.priority;

      DemoDataLoader.saveCapa({
        id: action.id,
        sourceType: 'Incident',
        sourceId: currentIncident.id,
        siteName: currentIncident.location || 'Sohar Complex',
        title: `${action.type}: ${action.description.slice(0, 60)}`,
        details: action.description,
        priority: priorityNorm,
        ownerName: action.assignee,
        ownerRole: 'Action Assignee',
        dueDate: action.targetDate,
        countdownText: `Due on ${action.targetDate}`,
        status: 'Open',
        hierarchy: 'Engineering',
        isOverdue: false
      });
    } catch (err) {
      console.warn('Could not sync to central CAPA store:', err);
    }

    setNewCapaDesc('');
    setNewCapaDate('');
  };

  // Filtered List based on Active Regional Compliance Mode
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      // 1. Regional Compliance Scope Isolation
      const loc = (inc.location || '').toLowerCase();
      const jur = (inc.jurisdiction || '').toLowerCase();
      const code = (inc.facilityCode || '').toUpperCase();
      const isOmanEntity = loc.includes('fahud') || loc.includes('sohar') || loc.includes('oman') || jur.includes('oman') || code.startsWith('OMN');
      
      if (isUaeMode && isOmanEntity) return false;
      if (isOmanMode && !isOmanEntity) return false;

      // 2. Standard Filters
      if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
      if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = inc.description.toLowerCase().includes(q);
        const matchesId = inc.id.toLowerCase().includes(q);
        const matchesLoc = inc.location.toLowerCase().includes(q);
        if (!matchesDesc && !matchesId && !matchesLoc) return false;
      }
      return true;
    });
  }, [incidents, filterSeverity, filterStatus, searchQuery, isUaeMode, isOmanMode]);

  // Determine Statutory Jurisdictions based on Active Mode & Record Context - Sultanate of Oman Only
  const isOman = true;

  // Available Presets filtered by Regional Compliance Mode (Sultanate of Oman)
  const availablePresetSites = useMemo(() => {
    return GCC_PRESET_SITES;
  }, []);

  // RBAC permission for statutory reporting submission
  const isAuthorizedStatutorySubmitter = currentUser?.role !== 'Worker';

  const handleExportOmanMolPdf = () => {
    if (!currentIncident) return;
    if (!isAuthorizedStatutorySubmitter) {
      alert('⚠️ Access Denied: Statutory Ministry of Labour reporting requires an HSE Officer, Supervisor, or Director profile.');
      return;
    }
    const entity: EntityContext = {
      orgName: currentTenant?.name || 'Petroleum Development Oman (PDO) LLC',
      shortName: currentTenant?.shortName || 'PDO Oman',
      sector: 'Hydrocarbon Exploration & Production',
      tradeLicenseOrCR: 'CR-1049281',
      molLicense: 'MOL-OMN-48920-HSE',
      contactOfficer: currentUser?.name || 'Rashid Al-Kharusi',
      contactPhone: '+968 2467 8100'
    };
    exportOmanMolNoticePdf(currentIncident, entity);
  };

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'Reported':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Under Triage':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Under Investigation':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'CAPA Pending':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Closed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSeverityBadge = (sev: Incident['severity']) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {workflowError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{workflowError}</p>}
      
      {/* Top Header & Actions */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-black text-white tracking-tight">
              Incident Management & Statutory Reporting
            </h1>
            <span className="text-[10px] font-mono font-bold text-red-300 bg-red-950/60 border border-red-800 px-2 py-0.5 rounded-full">
              Oman MD 286/2008 · PDO PR-1172 · RD 53/2023
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            End-to-end incident lifecycle: field triage, 5-Why root-cause investigation, Fishbone causal analysis, CAPA enforcement, and official government notice exports.
          </p>
        </div>

        <button
          onClick={() => {
            setReportStep(1);
            setIsReportModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Main Grid: Left Column Incident List / Right Column Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Incidents Registry List */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Filter Bar */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="relative">
              <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search incidents, locations..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-8 pe-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Under Triage">Under Triage</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="CAPA Pending">CAPA Pending</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Incidents Cards */}
          <div className="space-y-2 max-h-[720px] overflow-y-auto custom-scrollbar">
            {filteredIncidents.map(inc => {
              const isSelected = selectedIncidentId === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-start ${
                    isSelected 
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-300">{inc.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(inc.status)}`}>
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white mt-1.5 line-clamp-1">
                    {inc.classification || inc.type}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span className="truncate max-w-[170px]">{inc.location}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold border ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Active Incident Detailed Workspace */}
        {currentIncident ? (
          <div className="lg:col-span-8 space-y-4">
            
            {/* Incident Header & State Machine Stepper */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {currentIncident.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(currentIncident.severity)}`}>
                      {currentIncident.severity} Severity
                    </span>
                    <span className="text-xs text-slate-400">
                      · Reported {new Date(currentIncident.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-white mt-1">
                    {currentIncident.classification || currentIncident.type}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin size={12} className="text-slate-500" />
                    <span>{currentIncident.location}</span>
                  </p>
                </div>

                {/* Statutory Quick Export Shortcuts in Header */}
                <div className="flex items-center gap-2">
                  {isOman && (
                    <button
                      disabled={!isAuthorizedStatutorySubmitter}
                      onClick={handleExportOmanMolPdf}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                      title={!isAuthorizedStatutorySubmitter ? 'Restricted: HSE Officer / Director role required' : undefined}
                    >
                      <Download size={13} />
                      <span>{isAuthorizedStatutorySubmitter ? 'Oman MoL 24H' : 'MoL 24H Restricted'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* State Machine Stepper: Reported -> Under Triage -> Under Investigation -> CAPA Pending -> Closed */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Incident Life-Cycle Transition Machine
                </span>
                
                <div className="grid grid-cols-5 gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-[10px] font-bold text-center">
                  {(['Reported', 'Under Triage', 'Under Investigation', 'CAPA Pending', 'Closed'] as const).map((step, idx) => {
                    const statusOrder = ['Reported', 'Under Triage', 'Under Investigation', 'CAPA Pending', 'Closed'];
                    const currentIdx = statusOrder.indexOf(currentIncident.status as any);
                    const stepIdx = statusOrder.indexOf(step);
                    const isDone = stepIdx <= currentIdx;
                    const isCurrent = step === currentIncident.status;

                    return (
                      <div 
                        key={step}
                        className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                          isCurrent 
                            ? 'bg-emerald-600 text-white shadow' 
                            : isDone 
                            ? 'bg-slate-800 text-emerald-400' 
                            : 'text-slate-500'
                        }`}
                      >
                        {isDone && <Check size={11} />}
                        <span className="truncate">{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* State Machine Action Trigger */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400">Current Phase: <strong className="text-white">{currentIncident.status}</strong></span>
                  <div className="flex items-center gap-2">
                    {currentIncident.status === 'Reported' && (
                      <button 
                        onClick={() => handleStateTransition('Under Triage')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                      >
                        Accept & Initiate Triage ➔
                      </button>
                    )}
                    {currentIncident.status === 'Under Triage' && (
                      <button 
                        onClick={() => handleStateTransition('Under Investigation')}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs"
                      >
                        Launch Formal Investigation ➔
                      </button>
                    )}
                    {currentIncident.status === 'Under Investigation' && (
                      <button 
                        onClick={() => handleStateTransition('CAPA Pending')}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                      >
                        Approve RCA & Formulate CAPA ➔
                      </button>
                    )}
                    {currentIncident.status === 'CAPA Pending' && (
                      <button 
                        onClick={() => handleStateTransition('Closed')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                      >
                        Verify Actions & Close Incident ✓
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>

            <WorkflowRecordPanel recordType="Incident" recordId={currentIncident.id} />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview & Evidence
              </button>
              <button
                onClick={() => setActiveTab('investigation')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'investigation'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Investigation & RCA (5-Why & Fishbone)</span>
              </button>
              <button
                onClick={() => setActiveTab('capa')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'capa'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Corrective Actions ({currentIncident.capaActions?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('statutory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'statutory'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>GCC Statutory Reporting</span>
              </button>
            </div>

            {/* TAB 1: Overview & Evidence */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                
                {/* Description Narrative */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Factual Incident Description
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {currentIncident.description}
                  </p>
                </div>

                {/* Immediate Containment Actions */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Immediate Safety Actions Taken
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {currentIncident.immediateActionsTaken || 'Immediate isolation initiated, work halted in affected zone, emergency medical response dispatched.'}
                  </p>
                </div>

                {/* Scene Evidence Gallery */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Photographic Scene Evidence ({currentIncident.evidenceItems?.length || 0})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentIncident.evidenceItems && currentIncident.evidenceItems.length > 0 ? (
                      currentIncident.evidenceItems.map((item, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                          <div className="h-44 w-full overflow-hidden bg-slate-900">
                            <img
                              src={item.url}
                              alt={item.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="p-2.5 text-xs text-slate-300">
                            <p className="font-semibold text-white">{item.caption}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Uploaded {new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 col-span-2 py-4 text-center">No photographic scene evidence attached.</p>
                    )}
                  </div>
                </div>

                {/* Audit Trail Log */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Tamper-Evident Audit Trail
                  </span>
                  <div className="space-y-1.5">
                    {currentIncident.auditLog.map((log, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-200">{log.action}</p>
                          <p className="text-[10px] text-slate-400">{log.actorName} · {log.details}</p>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: Investigation & Root Cause (5-Why & Fishbone) */}
            {activeTab === 'investigation' && (
              <div className="space-y-5">
                
                {/* 5-Why Interactive Analysis Tree */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Interactive 5-Why Analysis Tree
                      </h3>
                      <p className="text-xs text-slate-400">
                        Drill down into underlying physical, human, and organizational causal failures.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isGeneratingFiveWhy}
                        onClick={handleGenerateAiDraftFiveWhy}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles size={13} className={isGeneratingFiveWhy ? "animate-spin text-amber-200" : "text-amber-200"} />
                        {isGeneratingFiveWhy ? 'Analyzing...' : 'Generate Draft 5-Why Analysis'}
                      </button>

                      <button
                        onClick={handleSaveFiveWhys}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                      >
                        Save 5-Why Tree
                      </button>
                    </div>
                  </div>

                  {/* Grounded AI Draft 5-Why Card with HITL Oversight Gates */}
                  {draftFiveWhy && (
                    <AIGovernanceCard
                      title="AI Grounded 5-Why Causal Analysis Draft"
                      category="RCA_FIVE_WHY"
                      citations={draftFiveWhy.citations}
                      confidenceScore={draftFiveWhy.confidence}
                      onAccept={handleAcceptFiveWhyDraft}
                      onDiscard={() => setDraftFiveWhy(null)}
                      draftContent={
                        <div className="space-y-3">
                          <p className="text-xs text-slate-300 italic border-s-2 border-amber-500 ps-2.5">
                            "{draftFiveWhy.summary}"
                          </p>

                          <div className="space-y-2">
                            {draftFiveWhy.fiveWhys.map(w => (
                              <div key={w.step} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center border border-amber-500/40">
                                    {w.step}
                                  </span>
                                  <span className="font-semibold text-white">{w.whyText}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 ms-7 mt-1">
                                  Proof / Evidence: {w.verificationEvidence}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs text-white">
                            <strong className="text-amber-400 block text-[10px] uppercase">Root Cause Conclusion:</strong>
                            {draftFiveWhy.rootCauseConclusion}
                          </div>
                        </div>
                      }
                    />
                  )}

                  <div className="space-y-3 relative">
                    {fiveWhysList.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-500/30">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-slate-400">
                            Why Level {idx + 1}:
                          </label>
                          <input
                            type="text"
                            value={item.whyText}
                            onChange={e => {
                              const updated = [...fiveWhysList];
                              updated[idx].whyText = e.target.value;
                              setFiveWhysList(updated);
                            }}
                            placeholder={`Why did failure step ${idx + 1} happen?`}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            value={item.verificationEvidence}
                            onChange={e => {
                              const updated = [...fiveWhysList];
                              updated[idx].verificationEvidence = e.target.value;
                              setFiveWhysList(updated);
                            }}
                            placeholder="Verification evidence / technical proof..."
                            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1 text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Root Cause Conclusion */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      Root Cause Conclusion
                    </label>
                    <textarea
                      rows={2}
                      value={rootCauseText}
                      onChange={e => setRootCauseText(e.target.value)}
                      placeholder="Synthesize the primary systemic root cause..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Fishbone (Ishikawa) Diagram Interface */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Fishbone (Ishikawa) 6-M Causal Framework
                      </h3>
                      <p className="text-xs text-slate-400">
                        Categorize contributing factors across Manpower, Machine, Method, Material, Measurement, and Environment.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveFishbone}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                    >
                      Save Fishbone
                    </button>
                  </div>

                  {/* Add Bone Factor Input */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                    <select
                      value={activeBoneCategory}
                      onChange={e => setActiveBoneCategory(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none"
                    >
                      <option value="manpower">Manpower (People)</option>
                      <option value="machine">Machine (Equipment)</option>
                      <option value="method">Method (Procedure)</option>
                      <option value="material">Material (Parts / Fluids)</option>
                      <option value="measurement">Measurement (Inspection)</option>
                      <option value="environment">Milieu (Environment)</option>
                    </select>

                    <input
                      type="text"
                      value={newBoneFactor}
                      onChange={e => setNewBoneFactor(e.target.value)}
                      placeholder="Enter contributing factor..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                    />

                    <button
                      onClick={handleAddFishboneFactor}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors border border-slate-700"
                    >
                      Add Factor
                    </button>
                  </div>

                  {/* Visual 6-M Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { key: 'manpower', label: 'Manpower / People' },
                      { key: 'machine', label: 'Machine / Equipment' },
                      { key: 'method', label: 'Method / Procedure' },
                      { key: 'material', label: 'Material / Parts' },
                      { key: 'measurement', label: 'Measurement / Testing' },
                      { key: 'environment', label: 'Milieu / Environment' }
                    ].map(bone => {
                      const items = fishbone[bone.key as keyof IncidentFishboneFactors] || [];
                      return (
                        <div key={bone.key} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <span className="text-[10px] font-black uppercase text-cyan-400 block border-b border-slate-800/80 pb-1">
                            {bone.label} ({items.length})
                          </span>
                          <div className="space-y-1 min-h-[60px]">
                            {items.length === 0 ? (
                              <p className="text-[10px] text-slate-600 italic">No contributing factors added.</p>
                            ) : (
                              items.map((factor, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                  <span className="truncate">{factor}</span>
                                  <button
                                    onClick={() => {
                                      setFishbone(prev => ({
                                        ...prev,
                                        [bone.key]: prev[bone.key as keyof IncidentFishboneFactors].filter((_, i) => i !== idx)
                                      }));
                                    }}
                                    className="text-slate-500 hover:text-red-400 ms-1 text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: CAPA Management */}
            {activeTab === 'capa' && (
              <div className="space-y-4">
                
                {/* Action Assignment Builder */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Formulate Corrective & Preventive Actions (CAPA)
                  </h3>

                  <form onSubmit={handleAddCapa} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Action Description
                      </label>
                      <input
                        type="text"
                        required
                        value={newCapaDesc}
                        onChange={e => setNewCapaDesc(e.target.value)}
                        placeholder="e.g. Install Kevlar ballistic hose burst sleeves on all rough terrain cranes..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Assignee
                        </label>
                        <select
                          value={newCapaAssignee}
                          onChange={e => setNewCapaAssignee(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="Vikram Malhotra">Vikram Malhotra (Mechanical Lead)</option>
                          <option value="Fatima Al-Hameli">Fatima Al-Hameli (Operations Supt)</option>
                          <option value="Rashid Al-Kharusi">Rashid Al-Kharusi (HSE Lead)</option>
                          <option value="Dr. Tariq Al-Zahrani">Dr. Tariq Al-Zahrani (Medical Lead)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Target Date (SLA)
                        </label>
                        <input
                          type="date"
                          required
                          value={newCapaDate}
                          onChange={e => setNewCapaDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                        </input>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Priority
                        </label>
                        <select
                          value={newCapaPriority}
                          onChange={e => setNewCapaPriority(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="P1 - Critical">P1 - Critical</option>
                          <option value="P2 - High">P2 - High</option>
                          <option value="P3 - Medium">P3 - Medium</option>
                          <option value="P4 - Routine">P4 - Routine</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Action Type
                        </label>
                        <select
                          value={newCapaType}
                          onChange={e => setNewCapaType(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="Corrective">Corrective</option>
                          <option value="Preventive">Preventive</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                      >
                        + Add Action to CAPA Register
                      </button>
                    </div>
                  </form>
                </div>

                {/* List of Formulated Actions */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Formulated Incident Corrective Actions ({currentIncident.capaActions?.length || 0})
                  </span>

                  <div className="space-y-2">
                    {currentIncident.capaActions && currentIncident.capaActions.length > 0 ? (
                      currentIncident.capaActions.map((capa, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-cyan-300 font-bold">{capa.id}</span>
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.2 rounded border border-amber-500/20">{capa.priority}</span>
                              <span className="text-[10px] text-slate-400 uppercase">{capa.type}</span>
                            </div>
                            <p className="font-semibold text-white truncate">{capa.description}</p>
                            <p className="text-[10px] text-slate-500">
                              Assigned to: <strong className="text-slate-300">{capa.assignee}</strong> · Target Due: <strong className="text-slate-300">{capa.targetDate}</strong>
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700 shrink-0">
                            {capa.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 py-3 text-center">No CAPA actions recorded yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: GCC Statutory Reporting */}
            {activeTab === 'statutory' && (
              <div className="space-y-4">
                
                {/* AI Statutory Compliance Action Trigger */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      Grounded AI Statutory Compliance & Deadline Verification
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cross-reference incident timeline and severity against local ministerial decrees (Oman MD 286/2008 & ADPHC OSHAD Mechanism 11.0).
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isCheckingCompliance}
                    onClick={handleCheckStatutoryDeadlines}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Scale size={13} className={isCheckingCompliance ? "animate-spin text-amber-200" : "text-amber-200"} />
                    {isCheckingCompliance ? 'Verifying Codes...' : 'Run Statutory Compliance Check'}
                  </button>
                </div>

                {/* Grounded Compliance HITL Card */}
                {draftCompliance && (
                  <AIGovernanceCard
                    title="GCC Statutory Reporting & Notification Schedule Analysis"
                    category="STATUTORY_COMPLIANCE"
                    citations={draftCompliance.citations}
                    confidenceScore={0.96}
                    onAccept={(decision) => {
                      alert(`✅ Statutory timeline acknowledged & accepted into incident audit trail by ${decision.reviewerName}.`);
                      setDraftCompliance(null);
                    }}
                    onDiscard={() => setDraftCompliance(null)}
                    draftContent={
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-cyan-300">
                            Jurisdiction: {draftCompliance.jurisdiction}
                          </span>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                            {draftCompliance.mandatoryNotificationTimeline}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Required Statutory Notices:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-200 text-xs">
                            {draftCompliance.requiredForms.map((form, i) => (
                              <li key={i}>{form}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Mandatory Notification Checklist:
                          </span>
                          {draftCompliance.complianceChecklist.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 text-xs">
                              <span className="text-slate-300">{c.item}</span>
                              <span className="font-mono text-amber-300 text-[10px] ms-2">{c.statutoryMandate}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-200">
                          <strong>Enforcement Exposure:</strong> {draftCompliance.penaltiesForDelayedReporting}
                        </div>
                      </div>
                    }
                  />
                )}
                

                {/* Sultanate of Oman Ministry of Labour Card */}
                {isOman && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-red-500/40 shadow-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            Sultanate of Oman · Ministry of Labour 24-Hour Notice
                          </h3>
                          <p className="text-xs text-slate-400">
                            Ministerial Decision 286/2008 & Royal Decree 53/2023 Statutory Occupational Injury Notice
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                        MD 286/2008 Annex 1
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Competent Authority:</span>
                        <p className="font-semibold text-white">Directorate of OHS, Ministry of Labour</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Establishment CR:</span>
                        <p className="font-semibold text-white">CR-1049281 (PDO Concession)</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Statutory SLA:</span>
                        <p className="font-semibold text-red-400">24-Hour Mandatory Notice</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Pre-populates official Annex 1 schedule with site preservation declaration & Omani safety supervisor attestation.
                      </span>
                      <button
                        onClick={handleExportOmanMolPdf}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                      >
                        <Download size={14} />
                        <span>Export Oman MoL 24-Hour Notice (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        ) : null}

      </div>

      {/* ----------------- MULTI-STEP INCIDENT REPORTING MODAL ----------------- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">
                  Report New Operational Incident
                </h3>
                <p className="text-xs text-slate-400">
                  Step {reportStep} of 3: {reportStep === 1 ? 'Core Particulars & Classification' : reportStep === 2 ? 'Event Narrative & Containment' : 'Scene Evidence'}
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(stepNum => (
                <div
                  key={stepNum}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    reportStep >= stepNum ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <form onSubmit={handleSubmitNewIncident} className="space-y-4">
              
              {/* STEP 1: Core Details */}
              {reportStep === 1 && (
                <div className="space-y-3 animate-in fade-in">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Incident Date & Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formTimestamp}
                        onChange={e => setFormTimestamp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Exact Site / Operating Facility <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formSite}
                        onChange={e => {
                          const val = e.target.value;
                          setFormSite(val);
                          const matched = availablePresetSites.find(s => s.name === val) || GCC_PRESET_SITES.find(s => s.name === val);
                          if (matched) {
                            setFormJurisdiction(matched.jurisdiction as any);
                            setFormCoordinates({ lat: matched.lat, lng: matched.lng });
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {availablePresetSites.map(s => (
                          <option key={s.name} value={s.name}>{s.name} ({s.country})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Specific Plant Area / Zone Tag
                      </label>
                      <input
                        type="text"
                        value={formLocationArea}
                        onChange={e => setFormLocationArea(e.target.value)}
                        placeholder="e.g. Flare Knockout Drum Vessel V-102"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        GPS Spatial Coordinates
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`Lat: ${formCoordinates.lat.toFixed(4)}, Lng: ${formCoordinates.lng.toFixed(4)}`}
                          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(pos => {
                                setFormCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                              });
                            }
                          }}
                          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700"
                        >
                          GPS
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Classification */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Incident Classification (ISO 45001 & GCC Standards) <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'Near Miss',
                        'First Aid',
                        'Medical Treatment',
                        'Lost Time Injury',
                        'Fatality',
                        'Process Safety Event'
                      ].map(cls => (
                        <button
                          type="button"
                          key={cls}
                          onClick={() => setFormClassification(cls as any)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-start transition-all ${
                            formClassification === cls
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severities */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Actual Severity
                      </label>
                      <select
                        value={formActualSeverity}
                        onChange={e => setFormActualSeverity(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="Low">Low (First Aid / Minor)</option>
                        <option value="Medium">Medium (Medical Case / RWC)</option>
                        <option value="High">High (Lost Time Injury &gt; 3d)</option>
                        <option value="Critical">Critical (Fatality / Major Release)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Potential Severity (SIF Precursor)
                      </label>
                      <select
                        value={formPotentialSeverity}
                        onChange={e => setFormPotentialSeverity(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical (Potential SIF)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setReportStep(2)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                    >
                      <span>Next: Event Narrative</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Event Narrative */}
              {reportStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in">
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase text-slate-400">
                        Plain Text Incident Description <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {isIncidentRecording && (
                          <button
                            type="button"
                            onClick={cancelIncidentRecording}
                            className="text-[10px] text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleToggleIncidentVoice}
                          disabled={isIncidentTranscribing}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                            isIncidentRecording
                              ? 'bg-red-600 border-red-500 text-white animate-pulse'
                              : isIncidentTranscribing
                                ? 'bg-purple-950 border-purple-800 text-purple-300'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                          }`}
                          title="Record incident narrative with microphone using gemini-3.5-transcribe"
                        >
                          {isIncidentTranscribing ? (
                            <>
                              <Loader2 size={11} className="animate-spin" />
                              <span>Transcribing...</span>
                            </>
                          ) : isIncidentRecording ? (
                            <>
                              <MicOff size={11} className="text-white" />
                              <span>Stop ({incidentRecDuration}s)</span>
                            </>
                          ) : (
                            <>
                              <Mic size={11} className="text-amber-400" />
                              <span>Voice Record (gemini-3.5)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleAiPreClassify}
                          disabled={isAiClassifying}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                        >
                          <Sparkles size={11} />
                          <span>{isAiClassifying ? 'Analyzing...' : 'AI Auto-Classify'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Waveform Indicator during recording */}
                    {isIncidentRecording && (
                      <div className="mb-2 p-2 rounded-xl bg-red-950/60 border border-red-800 flex items-center justify-between text-[11px] text-red-200">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          Recording microphone input...
                        </span>
                        <div className="flex items-center gap-1 h-3">
                          <span className="w-1 bg-red-400 rounded" style={{ height: `${Math.max(3, incidentAudioLevel * 0.12)}px` }}></span>
                          <span className="w-1 bg-red-400 rounded" style={{ height: `${Math.max(5, incidentAudioLevel * 0.18)}px` }}></span>
                          <span className="w-1 bg-red-400 rounded" style={{ height: `${Math.max(3, incidentAudioLevel * 0.10)}px` }}></span>
                          <span className="w-1 bg-red-400 rounded" style={{ height: `${Math.max(6, incidentAudioLevel * 0.22)}px` }}></span>
                        </div>
                      </div>
                    )}
                    <textarea
                      required
                      rows={5}
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      placeholder="Detail the chronological sequence of events, tasks underway, failed equipment, and personnel actions..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Immediate Safety Actions Taken (Containment)
                    </label>
                    <textarea
                      rows={3}
                      value={formImmediateAction}
                      onChange={e => setFormImmediateAction(e.target.value)}
                      placeholder="e.g. Plant isolation initiated, Stop Work Authority invoked, first-aid administered, area barricaded..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setReportStep(1)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formDescription.trim()) {
                          alert('Please enter an event description.');
                          return;
                        }
                        setReportStep(3);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                    >
                      <span>Next: Scene Evidence</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Scene Evidence Upload */}
              {reportStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  
                  {/* Upload Form Box */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-black uppercase text-slate-300">
                      Add Scene Evidence Photograph
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="url"
                        value={newEvidenceUrl}
                        onChange={e => setNewEvidenceUrl(e.target.value)}
                        placeholder="Image URL (or uncompressed photo link)..."
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newEvidenceCaption}
                        onChange={e => setNewEvidenceCaption(e.target.value)}
                        placeholder="Photo Caption (e.g. Ruptured crimp fitting)..."
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddEvidence}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg border border-slate-700"
                      >
                        + Add Photo to Gallery
                      </button>
                    </div>
                  </div>

                  {/* Evidence Thumbnails List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Attached Photos ({formEvidenceList.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {formEvidenceList.map((item, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                          <img
                            src={item.url}
                            alt={item.caption}
                            className="h-28 w-full object-cover"
                          />
                          <p className="p-1.5 text-[10px] text-slate-300 truncate bg-slate-900">
                            {item.caption}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setFormEvidenceList(formEvidenceList.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-1 end-1 bg-red-600/80 text-white rounded p-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setReportStep(2)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/40 uppercase tracking-wider transition-all"
                    >
                      Submit Official Incident Log
                    </button>
                  </div>

                </div>
              )}

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default IncidentForm;
