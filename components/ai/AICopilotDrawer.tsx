import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, X, Send, Bot, User, BookOpen, ShieldCheck, 
  AlertTriangle, CheckCircle2, ChevronRight, Scale, 
  HelpCircle, RefreshCw, FileText, CornerDownRight, 
  ExternalLink, ArrowRight, ShieldAlert, Cpu, Mic, MicOff,
  Search, MapPin, Loader2, Check, Layers, BrainCircuit, Zap,
  Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTenant } from '../../contexts/TenantContext';
import { useUser } from '../../contexts/UserContext';
import { useRegionalCompliance } from '../../contexts/RegionalComplianceContext';
import { AIGovernanceCard } from './AIGovernanceCard';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { 
  GeminiClientService, 
  GeminiRoleType, 
  GeminiModelType, 
  GroundingSource, 
  MapPlace 
} from '../../services/geminiClientService';
import { 
  generateDraftFiveWhys, 
  checkStatutoryCompliance, 
  FiveWhyDraftResult, 
  StatutoryComplianceResult,
  HITLReviewDecision 
} from '../../services/aiAssistantService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  timestamp: string;
  modelUsed?: string;
  roleUsed?: string;
  searchCitations?: GroundingSource[];
  mapPlaces?: MapPlace[];
  draftFiveWhy?: FiveWhyDraftResult;
  draftCompliance?: StatutoryComplianceResult;
  isHitlPending?: boolean;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
  isFullPageView?: boolean;
}

const ROLES: { id: GeminiRoleType; label: string; desc: string }[] = [
  { id: 'hse_advisor', label: 'Statutory HSE Advisor', desc: 'OSHAD-SF, UAE MoHRE, ISO 45001' },
  { id: 'rca_expert', label: 'Incident RCA & 5-Why', desc: '5-Why, Fishbone & Causal Analysis' },
  { id: 'process_safety', label: 'Process Safety Engineer', desc: 'SIMOPS, HAZOP, LOTO & Barrier Analysis' },
  { id: 'site_supervisor', label: 'Field Safety Supervisor', desc: 'Daily PTW, TBT & Stop Work Authority' },
  { id: 'executive_analyst', label: 'Executive QHSE Director', desc: 'TRIR, LTIFR & Board Packs' },
];

const MODELS: { id: GeminiModelType; label: string; tag: string }[] = [
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', tag: 'Complex Tasks' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', tag: 'General & Grounding' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', tag: 'Fast Response' },
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  initialContext,
  isFullPageView = false
}) => {
  const { language, dir, t } = useLanguage();
  const { currentSite, currentTenant } = useTenant();
  const { currentUser } = useUser();
  const { regionalMode, isUaeMode, isOmanMode, isCombinedMode, activeProfile } = useRegionalCompliance();

  const [inputQuery, setInputQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<GeminiRoleType>('hse_advisor');
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(false);
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio recording hook (gemini-3.5-transcribe)
  const { 
    isRecording, 
    recordingDuration, 
    audioLevel, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useAudioRecorder();
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: language === 'ar'
        ? `مرحباً بك. أنا مساعد السلامة والامتثال المعتمد بالذكاء الاصطناعي لموقع **${currentSite?.name || 'المنشأة'}**.\n\nتم تزويدي بالاتصال الحي بمحركات **Google Search Grounding** و **Google Maps Grounding**، وتقنية التفريغ الصوتي المباشر **gemini-3.5-transcribe** مع مراعاة كافة ضوابط الحوكمة واعتماد مسؤول السلامة المعتمد.`
        : `Welcome. I am the Enterprise Grounded HSE Copilot for **${currentSite?.name || 'Site Operations'}**.\n\nEquipped with **Google Search Grounding**, **Google Maps Grounding**, and **Audio Transcription via gemini-3.5-transcribe**. All statutory suggestions remain subject to certified Safety Officer sign-off.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
      roleUsed: 'Statutory HSE Advisor'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Audio transcription handler
  const handleToggleVoice = async () => {
    if (isRecording) {
      setIsTranscribing(true);
      try {
        const audioBlob = await stopRecording();
        if (audioBlob && audioBlob.size > 0) {
          const res = await GeminiClientService.transcribeAudio(
            audioBlob,
            'Transcribe this voice query accurately for HSE safety operations.'
          );
          if (res.text) {
            setInputQuery(prev => (prev ? prev + ' ' + res.text : res.text));
          }
        }
      } catch (err) {
        console.error('Transcription error:', err);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      await startRecording();
    }
  };

  // Execute Grounded 5-Why Workflow
  const handleTriggerFiveWhyWorkflow = async () => {
    setIsGenerating(true);
    const userPrompt = language === 'ar' 
      ? 'قم بإنشاء مسودة تحليل الأسباب الجذرية (5-Why) لحادث تسرب الزيت الهيدروليكي في الرافعة'
      : 'Generate Grounded 5-Why Root Cause Analysis draft for Crane Hydraulic Hose Rupture incident';

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    const result = await generateDraftFiveWhys(
      'High-pressure hydraulic hose burst at crimp collar on mobile crane during load hoisting. Forearm burn injury to rigger.',
      currentSite?.name || 'Fahud Gathering Station',
      'Lost Time Injury'
    );

    const aiMsg: Message = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: language === 'ar'
        ? 'تم توليد مسودة تحليل الأسباب الجذرية (5-Why) مستندة إلى معايير إدارة الصيانة PDO PR-1172 وإجراءات كود أدنوك COP V4-01. تتطلب هذه المسودة مراجعة واعتماد مسؤول السلامة المعتمد أدناه.'
        : 'Generated Grounded 5-Why Causal Tree based on PDO PR-1172 maintenance standards and ADNOC COP V4-01. This proposal requires certified Safety Officer verification below before committing to the incident record.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel,
      draftFiveWhy: result,
      isHitlPending: true
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsGenerating(false);
  };

  // Execute Grounded Statutory Compliance Workflow
  const handleTriggerComplianceWorkflow = async () => {
    setIsGenerating(true);
    const targetCountry = isOmanMode ? 'Oman' : isUaeMode ? 'UAE' : (currentSite?.country || 'UAE');
    const userPrompt = language === 'ar'
      ? `تحقق من الالتزامات والمهل القانونية للإبلاغ عن الحوادث الخطيرة في اختصاص: ${targetCountry}`
      : `Check statutory notification deadlines & legal exposure for Serious LTI in ${targetCountry}`;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    const result = await checkStatutoryCompliance(
      'Lost Time Injury',
      'High',
      targetCountry,
      new Date().toISOString()
    );

    const aiMsg: Message = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: language === 'ar'
        ? `تم فحص المتطلبات التنظيمية وفق إطار (${activeProfile.governingFrameworks.join(' • ')}) وإعداد جدول الإخطار القانوني. يرجى مراجعة وتأكيد جدول الإجراءات.`
        : `Statutory compliance matrix cross-referenced against ${activeProfile.governingFrameworks.join(' • ')} and competent authorities (${activeProfile.authorities.map(a => a.name).join(', ')}). Review official notification requirements and certify acceptance below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel,
      draftCompliance: result,
      isHitlPending: true
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsGenerating(false);
  };

  // Custom User Query Submit via Server-Side Gemini Route
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;

    const q = inputQuery.trim();
    const currentImg = selectedImage;
    setInputQuery('');
    setSelectedImage(null);

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: q,
      image: currentImg || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      // Build conversation history for multi-turn chat
      const historyPayload = messages.slice(-6).map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
        image: m.image
      }));
      historyPayload.push({
        role: 'user',
        text: q,
        image: currentImg || undefined
      });

      // Default UAE Coordinates if browser geolocation is unavailable
      const userLatLng = isOmanMode 
        ? { latitude: 22.3167, longitude: 56.4833 }
        : { latitude: 24.1107, longitude: 52.7306 };

      const res = await GeminiClientService.sendChatMessage({
        messages: historyPayload,
        role: selectedRole,
        model: selectedModel,
        useSearchGrounding,
        useMapsGrounding,
        userLatLng,
        regionalMode
      });

      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: res.model,
        roleUsed: ROLES.find(r => r.id === selectedRole)?.label || 'HSE Advisor',
        searchCitations: res.grounding?.searchCitations || [],
        mapPlaces: res.grounding?.mapPlaces || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AICopilotDrawer generation error:', err);
      const aiMsg: Message = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: `⚠️ **Service Notification**: ${err.message || 'Unable to connect to server-side Gemini endpoint. Please check system configuration.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // HITL Decision Handlers
  const handleAcceptDraft = (msgId: string, decision: HITLReviewDecision) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          isHitlPending: false,
          text: m.text + `\n\n✅ **Verified & Approved by Certified Officer:** ${decision.reviewerName} (${decision.reviewerRole}, Cert: ${decision.reviewerCertNumber}) at ${decision.reviewTimestamp}. Committed to official record.`
        };
      }
      return m;
    }));
  };

  const handleDiscardDraft = (msgId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          isHitlPending: false,
          draftFiveWhy: undefined,
          draftCompliance: undefined,
          text: m.text + '\n\n❌ **Draft Discarded by Safety Officer.** No changes were committed to the database.'
        };
      }
      return m;
    }));
  };

  if (!isOpen && !isFullPageView) return null;

  return (
    <>
      {!isFullPageView && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[44] animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div 
        className={
          isFullPageView
            ? 'w-full max-w-6xl mx-auto space-y-4 animate-in fade-in duration-300'
            : `fixed inset-x-0 bottom-0 top-12 sm:top-0 sm:inset-y-0 sm:end-0 sm:start-auto z-[45] w-full sm:max-w-2xl bg-slate-900 border-t sm:border-t-0 sm:border-s border-slate-800 shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none animate-in slide-in-from-bottom sm:slide-in-from-end duration-300`
        }
      >
      {/* Header Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-950/40">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-black text-white uppercase tracking-tight">
                  {language === 'ar' ? 'مساعد السلامة الذكي والحوكمة' : 'Grounded HSE Copilot & HITL Engine'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Human-in-the-Loop
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {activeProfile.flag} {activeProfile.shortLabel} Scope
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentSite?.name} • Grounded in {activeProfile.governingFrameworks.join(' • ')}
              </p>
            </div>
          </div>

          {!isFullPageView && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Role & Model Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">AI Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as GeminiRoleType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 outline-none text-[11px]"
            >
              {ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gemini Model</label>
            <select
              value={selectedModel}
              onChange={(e) => {
                const val = e.target.value as GeminiModelType;
                setSelectedModel(val);
                if (val !== 'gemini-3.5-flash') {
                  setUseMapsGrounding(false);
                  setUseSearchGrounding(false);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 outline-none text-[11px]"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.label} ({m.tag})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grounding Toggles */}
        <div className="flex items-center gap-2 pt-1 text-[11px]">
          <button
            type="button"
            onClick={() => {
              const next = !useSearchGrounding;
              setUseSearchGrounding(next);
              if (next) {
                setUseMapsGrounding(false);
                setSelectedModel('gemini-3.5-flash');
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border transition-all ${
              useSearchGrounding 
                ? 'bg-blue-600 text-white border-blue-400' 
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Search size={11} />
            <span>Search Grounding</span>
            {useSearchGrounding && <Check size={10} />}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !useMapsGrounding;
              setUseMapsGrounding(next);
              if (next) {
                setUseSearchGrounding(false);
                setSelectedModel('gemini-3.5-flash');
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border transition-all ${
              useMapsGrounding 
                ? 'bg-emerald-600 text-white border-emerald-400' 
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <MapPin size={11} />
            <span>Maps Grounding</span>
            {useMapsGrounding && <Check size={10} />}
          </button>
        </div>
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
        <button
          type="button"
          onClick={handleTriggerFiveWhyWorkflow}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <Sparkles size={13} className="text-amber-400" />
          <span>Draft 5-Why Analysis</span>
        </button>

        <button
          type="button"
          onClick={handleTriggerComplianceWorkflow}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <Scale size={13} className="text-cyan-400" />
          <span>Statutory Deadlines Check</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setInputQuery('What is the minimum safe separation distance for Hot Work near a flammable venting vessel under SIMOPS CoP 2.0?');
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <HelpCircle size={13} className="text-slate-400" />
          <span>SIMOPS 50m Rule</span>
        </button>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={15} />
              </div>
            )}

            <div className={`max-w-[85%] space-y-2.5 ${msg.sender === 'user' ? 'text-end' : ''}`}>
              {msg.image && (
                <div className="mb-2 inline-block">
                  <img 
                    src={msg.image} 
                    alt="Safety observation upload" 
                    className="max-h-48 max-w-full rounded-xl border border-slate-700 object-cover shadow-sm"
                  />
                </div>
              )}
              <div 
                className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line text-slate-100 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 border border-slate-800 shadow-md'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 mb-2 pb-1.5 border-b border-slate-850">
                    <Sparkles size={11} className="text-amber-400 shrink-0" />
                    <span>AI-Generated Safety Intelligence</span>
                    <span className="text-slate-500 font-mono">· {msg.modelUsed || 'gemini-3.5-flash'}</span>
                    <span className="text-emerald-400 font-medium">· OSHAD Verified</span>
                  </div>
                )}
                {msg.text}

                {/* Verified Web Sources Links */}
                {msg.searchCitations && msg.searchCitations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-400 block uppercase">
                      Google Search Grounding Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.searchCitations.map((c, i) => (
                        <a
                          key={i}
                          href={c.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800/60 text-[10px]"
                        >
                          <ExternalLink size={10} />
                          <span className="truncate max-w-[180px]">{c.title || c.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Maps Places Links */}
                {msg.mapPlaces && msg.mapPlaces.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                      Google Maps Grounded Locations:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.mapPlaces.map((p, i) => (
                        <a
                          key={i}
                          href={p.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-800/60 text-[10px]"
                        >
                          <span className="font-bold truncate">{p.title}</span>
                          <ExternalLink size={11} className="shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Draft 5-Why Artifact */}
              {msg.draftFiveWhy && (
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      5-Why Causal Tree Draft
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: PDO PR-1172 / ADNOC V4-01
                    </span>
                  </div>

                  <div className="space-y-1.5 border-s-2 border-amber-500/30 ps-3">
                    {msg.draftFiveWhy.fiveWhys.map((w, idx) => (
                      <div key={idx} className="text-[11px]">
                        <span className="text-amber-400 font-bold">Why {w.step}: </span>
                        <span className="text-slate-300">{w.whyText}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Identified Root Cause:</span>
                    <p className="text-xs font-semibold text-white mt-0.5">{msg.draftFiveWhy.rootCauseConclusion}</p>
                  </div>
                </div>
              )}

              {/* Draft Statutory Deadlines Artifact */}
              {msg.draftCompliance && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale size={13} className="text-cyan-400" />
                      Statutory Deadlines Matrix
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Jurisdiction: {msg.draftCompliance.jurisdiction}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-[11px]">{msg.draftCompliance.enforcingAuthority}</div>
                        <div className="text-[10px] text-slate-400">Mandatory Notification Timeline</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {msg.draftCompliance.mandatoryNotificationTimeline}
                      </span>
                    </div>
                    {msg.draftCompliance.complianceChecklist.map((c, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-[11px]">{c.item}</div>
                          <div className="text-[10px] text-slate-400">{c.statutoryMandate}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {c.met ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HITL Review Card */}
              {msg.isHitlPending && (
                <AIGovernanceCard 
                  title={msg.draftFiveWhy ? '5-Why RCA Proposal' : 'Statutory Compliance Notification'}
                  category={msg.draftFiveWhy ? 'RCA_FIVE_WHY' : 'STATUTORY_COMPLIANCE'}
                  draftContent={
                    <div className="text-xs text-slate-300">
                      {msg.draftFiveWhy?.rootCauseConclusion || msg.draftCompliance?.mandatoryNotificationTimeline}
                    </div>
                  }
                  citations={msg.draftFiveWhy?.citations || msg.draftCompliance?.citations || []}
                  onAccept={(decision) => handleAcceptDraft(msg.id, decision)}
                  onDiscard={() => handleDiscardDraft(msg.id)}
                />
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2.5 text-xs text-amber-400 p-3 rounded-xl bg-slate-950 border border-slate-800 w-fit">
            <RefreshCw size={14} className="animate-spin text-amber-500" />
            <span>Retrieving grounded regulatory articles & drafting analysis...</span>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center gap-2 text-xs text-purple-300 p-2.5 rounded-xl bg-purple-950/60 border border-purple-800 w-fit">
            <Loader2 size={14} className="animate-spin text-purple-400" />
            <span>Transcribing audio with <strong>gemini-3.5-transcribe</strong>...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Active Bar */}
      {isRecording && (
        <div className="px-4 py-2 bg-red-950/80 border-t border-red-800 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold">Recording Microphone ({recordingDuration}s)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px]"
            >
              Stop & Transcribe (gemini-3.5)
            </button>
            <button onClick={cancelRecording} className="p-1 text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Input Message Form */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800 shrink-0 space-y-2">
        {selectedImage && (
          <div className="relative inline-block ps-2">
            <img 
              src={selectedImage} 
              alt="Upload preview" 
              className="h-16 w-16 object-cover rounded-xl border border-amber-500 shadow-md" 
            />
            <button 
              type="button"
              onClick={() => setSelectedImage(null)} 
              className="absolute -top-1.5 -end-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-md hover:bg-red-700"
              title="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-400 hover:text-amber-400 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Attach Safety Inspection Photo"
          >
            <ImageIcon size={16} />
          </button>

          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-xl transition-all ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'text-slate-400 hover:text-amber-400 bg-slate-900 border border-slate-800 hover:border-slate-700'
            }`}
            title={isRecording ? 'Stop & Transcribe' : 'Record voice with microphone (gemini-3.5-transcribe)'}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <input 
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'اسأل المساعد الذكي عن اللوائح، أو اطلب تحليل 5-Why، أو متطلبات التصاريح...'
                : 'Ask Copilot for regulatory articles, 5-Why drafting, or statutory deadlines...'
            }
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />

          <button
            type="submit"
            disabled={(!inputQuery.trim() && !selectedImage) || isGenerating || isRecording}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shadow-amber-950/40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default AICopilotDrawer;
