import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, X, Bot, User, Mic, MicOff, Sparkles, 
  Globe, MapPin, Search, ExternalLink, Image as ImageIcon, 
  Loader2, Shield, AlertTriangle, Layers, Zap, BrainCircuit,
  Volume2, Check, RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { 
  GeminiClientService, 
  GeminiRoleType, 
  GeminiModelType, 
  ChatMessagePayload, 
  GroundingSource, 
  MapPlace 
} from '../services/geminiClientService';

interface EnrichedChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
  modelUsed?: string;
  roleUsed?: string;
  searchCitations?: GroundingSource[];
  mapPlaces?: MapPlace[];
  isTranscribedVoice?: boolean;
}

const ROLE_DEFINITIONS: { id: GeminiRoleType; label: string; icon: any; desc: string; badge: string }[] = [
  {
    id: 'hse_advisor',
    label: 'Statutory HSE Advisor',
    icon: Shield,
    desc: 'Oman Labour Law (RD 53/2023), MD 286/2008, PDO Specifications & CDAA',
    badge: 'Statutory'
  },
  {
    id: 'rca_expert',
    label: 'Incident RCA & 5-Why',
    icon: AlertTriangle,
    desc: 'Root cause causal tree, Ishikawa fishbone & SIF precursor barrier breakdown',
    badge: 'Investigation'
  },
  {
    id: 'process_safety',
    label: 'Process Safety & HAZOP',
    icon: Layers,
    desc: 'Major accident hazards, SIMOPS clearance, LOTO & 5x5 risk rating',
    badge: 'Engineering'
  },
  {
    id: 'site_supervisor',
    label: 'Field Supervisor & PTW',
    icon: Zap,
    desc: 'Daily permit controls, toolbox talk briefing & Stop Work Authority',
    badge: 'Field Ops'
  },
  {
    id: 'executive_analyst',
    label: 'Executive QHSE Director',
    icon: BrainCircuit,
    desc: 'TRIR, LTIFR metrics, board packs, multi-site audit & ESG governance',
    badge: 'Executive'
  }
];

const MODEL_DEFINITIONS: { id: GeminiModelType; label: string; badge: string; desc: string }[] = [
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro',
    badge: 'Complex Reasoning',
    desc: 'Complex tasks: deep incident investigations, cross-regulatory audits, HAZOP'
  },
  {
    id: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    badge: 'General & Grounding',
    desc: 'General tasks: risk checks, PTW clearance, Search & Maps Grounding'
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra Fast',
    desc: 'Fast tasks: rapid SOP lookups, quick emergency field advice, instant PPE'
  }
];

export const ChatBot: React.FC = () => {
  const { activeFramework, currentUser } = useUser();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Active configurations
  const [selectedRole, setSelectedRole] = useState<GeminiRoleType>('hse_advisor');
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(false);
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(false);
  const [showConfigMenu, setShowConfigMenu] = useState<boolean>(false);

  // Audio recording & transcription
  const { 
    isRecording, 
    recordingDuration, 
    audioLevel, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useAudioRecorder();
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  const initialMessages: EnrichedChatMessage[] = [
    {
      id: 'msg-init-1',
      role: 'model',
      text: language === 'ar'
        ? `مرحباً بك! أنا **صافي (Safi)**، المحرك الذكي المعتمد لعمليات الصحة والسلامة والبيئة (HSE). يمكنني مساعدتك في تدقيق امتثال لوائح وزارة العمل العمانية (MD 286/2008)، مواصفات شركة تنمية نفط عمان (PDO SP-1143/SP-1170)، وتوجيهات هيئة الدفاع المدني والإسعاف (CDAA).`
        : `Hello! I am **Safi**, your Enterprise HSE AI Platform Copilot.\n\nI am configured with multi-turn reasoning across statutory Sultanate of Oman codes (Oman Labour Law RD 53/2023, MoL MD 286/2008, PDO Specifications, CDAA, ISO 45001), real-time **Google Search Grounding**, **Google Maps Grounding**, and **Audio Transcription via gemini-3.5-transcribe**.\n\nHow can I support your safety operations today?`,
      timestamp: new Date(),
      modelUsed: 'gemini-3.5-flash',
      roleUsed: 'Statutory HSE Advisor'
    }
  ];

  const [messages, setMessages] = useState<EnrichedChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping, isTranscribing]);

  // Audio Recording Toggle & Transcription via gemini-3.5-transcribe
  const handleToggleVoiceRecording = async () => {
    if (isRecording) {
      setIsTranscribing(true);
      try {
        const audioBlob = await stopRecording();
        if (audioBlob && audioBlob.size > 0) {
          const result = await GeminiClientService.transcribeAudio(
            audioBlob,
            'Transcribe this voice message accurately for safety operations. Keep terms like PPE, LOTO, OSHAD, PTW intact.'
          );
          if (result.text) {
            setInput(prev => (prev ? prev + ' ' + result.text : result.text));
          }
        }
      } catch (err: any) {
        console.error('Audio transcription error:', err);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      await startRecording();
    }
  };

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

  // Maps / Search Grounding toggles (mutually exclusive per SDK guidelines)
  const toggleSearchGrounding = () => {
    const next = !useSearchGrounding;
    setUseSearchGrounding(next);
    if (next) {
      setUseMapsGrounding(false);
      setSelectedModel('gemini-3.5-flash');
    }
  };

  const toggleMapsGrounding = () => {
    const next = !useMapsGrounding;
    setUseMapsGrounding(next);
    if (next) {
      setUseSearchGrounding(false);
      setSelectedModel('gemini-3.5-flash');
    }
  };

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || input;
    if (!textToSend.trim() && !selectedImage) return;

    const userMsg: EnrichedChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend.trim() || '[Image Attached]',
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentText = textToSend.trim();
    const currentImg = selectedImage;

    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      // Build conversation history for multi-turn thread
      const historyPayload: ChatMessagePayload[] = messages.slice(-8).map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        text: m.text,
        image: m.image
      }));
      historyPayload.push({
        role: 'user',
        text: currentText,
        image: currentImg || undefined
      });

      // Default UAE Coordinates (Abu Dhabi / Ruwais) if browser geolocation is unavailable
      let userLatLng = { latitude: 24.1107, longitude: 52.7306 };
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos: any = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          }).catch(() => null);
          if (pos?.coords) {
            userLatLng = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            };
          }
        } catch (_) {}
      }

      const activeRoleConfig = ROLE_DEFINITIONS.find(r => r.id === selectedRole);

      const response = await GeminiClientService.sendChatMessage({
        messages: historyPayload,
        role: selectedRole,
        model: selectedModel,
        useSearchGrounding,
        useMapsGrounding,
        userLatLng
      });

      const botMsg: EnrichedChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        modelUsed: response.model,
        roleUsed: activeRoleConfig?.label || 'HSE Copilot',
        searchCitations: response.grounding?.searchCitations || [],
        mapPlaces: response.grounding?.mapPlaces || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: EnrichedChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Service Response Notification**:\n\n${error.message || 'Unable to contact server-side Gemini service. Please verify server connectivity.'}\n\n*All responses remain logged in your enterprise audit trail.*`,
        timestamp: new Date(),
        modelUsed: selectedModel,
        roleUsed: 'System Fail-Safe'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (promptText: string, suggestedRole: GeminiRoleType, suggestedGrounding?: 'search' | 'maps') => {
    setSelectedRole(suggestedRole);
    if (suggestedGrounding === 'search') {
      setUseSearchGrounding(true);
      setUseMapsGrounding(false);
      setSelectedModel('gemini-3.5-flash');
    } else if (suggestedGrounding === 'maps') {
      setUseMapsGrounding(true);
      setUseSearchGrounding(false);
      setSelectedModel('gemini-3.5-flash');
    }
    handleSend(promptText);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 end-6 bg-slate-900 text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1 z-50 flex items-center gap-3 group border border-slate-700/60"
        title="Open Enterprise AI HSE Copilot"
      >
        <div className="relative">
          <Bot size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        <div className="flex flex-col text-start">
          <span className="font-bold text-sm tracking-wide leading-tight">Safi AI Copilot</span>
          <span className="text-[10px] text-slate-400 font-mono">Gemini 3 • Grounded</span>
        </div>
        <Sparkles size={16} className="text-amber-400 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  const activeRoleObj = ROLE_DEFINITIONS.find(r => r.id === selectedRole) || ROLE_DEFINITIONS[0];
  const activeModelObj = MODEL_DEFINITIONS.find(m => m.id === selectedModel) || MODEL_DEFINITIONS[1];

  return (
    <div 
      className="fixed bottom-4 sm:bottom-6 end-4 sm:end-6 w-[calc(100vw-2rem)] sm:w-[500px] h-[calc(100vh-5rem)] sm:h-[720px] max-h-[850px] bg-slate-950 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col z-50 animate-in slide-in-from-bottom-6 fade-in duration-300 overflow-hidden" 
      dir="ltr"
    >
      {/* Top Header */}
      <div className="bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-800 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-950/40">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-tight uppercase text-white">
                  Safi AI Enterprise Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                ADNOC • OSHAD-SF • GCC Statutory Compliance Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowConfigMenu(!showConfigMenu)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                showConfigMenu 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800'
              }`}
              title="Configure AI Role & Gemini Model"
            >
              <BrainCircuit size={14} />
              <span className="hidden sm:inline text-[11px]">{activeRoleObj.badge}</span>
            </button>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Minimize Copilot"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Grounding & Quick Config Badges */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
          <div className="flex items-center gap-1.5">
            {/* Search Grounding Toggle */}
            <button
              onClick={toggleSearchGrounding}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-[10px] border ${
                useSearchGrounding
                  ? 'bg-blue-600 text-white border-blue-400 shadow-sm shadow-blue-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title="Ground answers with live Google Search data (gemini-3.5-flash)"
            >
              <Search size={11} />
              <span>Search Grounding</span>
              {useSearchGrounding && <Check size={10} />}
            </button>

            {/* Maps Grounding Toggle */}
            <button
              onClick={toggleMapsGrounding}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-[10px] border ${
                useMapsGrounding
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm shadow-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title="Ground answers with live Google Maps place & facility data (gemini-3.5-flash)"
            >
              <MapPin size={11} />
              <span>Maps Grounding</span>
              {useMapsGrounding && <Check size={10} />}
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
            {activeModelObj.id}
          </span>
        </div>
      </div>

      {/* Collapsible Role & Model Configuration Panel */}
      {showConfigMenu && (
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-4 shrink-0 animate-in slide-in-from-top-4 duration-200 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select AI Copilot Role Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLE_DEFINITIONS.map(r => {
                const IconComponent = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRole(r.id);
                    }}
                    className={`p-2.5 rounded-xl text-start border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <IconComponent size={16} className={isSelected ? 'text-amber-400 mt-0.5' : 'text-slate-400 mt-0.5'} />
                    <div className="min-w-0">
                      <div className="font-bold text-[11px] truncate">{r.label}</div>
                      <div className="text-[9px] text-slate-400 line-clamp-1 leading-snug">{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Gemini Engine Model
            </label>
            <div className="grid grid-cols-1 gap-2">
              {MODEL_DEFINITIONS.map(m => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      if (m.id !== 'gemini-3.5-flash') {
                        setUseMapsGrounding(false);
                        setUseSearchGrounding(false);
                      }
                    }}
                    className={`p-2 rounded-xl text-start border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px] flex items-center gap-2">
                        {m.label}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                          {m.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">{m.desc}</div>
                    </div>
                    {isSelected && <Check size={14} className="text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Messages Thread (Scrollable) */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/60" 
        ref={scrollRef}
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Subheader */}
            <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-slate-400 font-mono">
              {msg.role === 'user' ? (
                <span>You</span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">{msg.roleUsed || 'Safi Copilot'}</span>
                  {msg.modelUsed && (
                    <span className="text-slate-400 px-1.5 py-0.2 rounded bg-slate-800 text-[9px]">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>
              )}
              <span>•</span>
              <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Bubble */}
            <div 
              className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-amber-600 text-slate-950 font-medium rounded-se-none shadow-lg' 
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-ss-none shadow-md'
              }`}
            >
              {msg.image && (
                <div className="mb-3 rounded-xl overflow-hidden border border-slate-700 max-h-48">
                  <img src={msg.image} alt="User attachment" className="w-full h-auto object-cover" />
                </div>
              )}

              <div className={`markdown-body prose prose-invert prose-xs max-w-none ${msg.role === 'user' ? 'text-slate-950' : 'text-slate-200'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {/* Verified Search Grounding Sources (Google Search) */}
              {msg.searchCitations && msg.searchCitations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    <Search size={11} />
                    <span>Verified Web Sources (Google Search Grounding)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.searchCitations.map((c, i) => (
                      <a
                        key={i}
                        href={c.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-200 border border-blue-800/60 text-[10px] transition-colors"
                      >
                        <ExternalLink size={10} className="shrink-0" />
                        <span className="truncate max-w-[200px]">{c.title || c.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Maps Grounding Places (Google Maps) */}
              {msg.mapPlaces && msg.mapPlaces.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    <MapPin size={11} />
                    <span>Verified Facilities (Google Maps Grounding)</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {msg.mapPlaces.map((p, i) => (
                      <a
                        key={i}
                        href={p.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between gap-2 p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-800/60 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] truncate text-emerald-300">{p.title}</div>
                          {p.snippet && <div className="text-[10px] text-emerald-400/80 line-clamp-1">{p.snippet}</div>}
                        </div>
                        <ExternalLink size={12} className="shrink-0 text-emerald-400 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col items-start gap-1">
            <div className="text-[10px] text-slate-400 font-mono px-1 flex items-center gap-1.5">
              <Bot size={12} className="text-amber-400 animate-spin" />
              <span>Safi is generating grounded response...</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl rounded-ss-none flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-150"></span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-300"></span>
            </div>
          </div>
        )}

        {/* Audio Transcribing Indicator */}
        {isTranscribing && (
          <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-2xl text-purple-200 text-xs flex items-center gap-2 animate-pulse">
            <Loader2 size={16} className="animate-spin text-purple-400" />
            <span>Transcribing audio with <strong>gemini-3.5-transcribe</strong>...</span>
          </div>
        )}
      </div>

      {/* Suggested Fast Prompts */}
      <div className="px-3 py-2 bg-slate-900/40 border-t border-slate-800/60 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
        <button
          onClick={() => handleQuickPrompt(
            'Check current Oman Ministry of Labour MD 286/2008 midday heat stress summer work ban regulations & mandatory TWL monitoring.',
            'hse_advisor',
            'search'
          )}
          className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1.5"
        >
          <Search size={10} className="text-blue-400" />
          <span>MoL MD 286 Heat Stress</span>
        </button>
        <button
          onClick={() => handleQuickPrompt(
            'Locate nearest emergency trauma hospital and CDAA fire station to Mina Al Fahal Terminal, Muscat.',
            'site_supervisor',
            'maps'
          )}
          className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1.5"
        >
          <MapPin size={10} className="text-emerald-400" />
          <span>Nearest CDAA & Trauma Center</span>
        </button>
        <button
          onClick={() => handleQuickPrompt(
            'Generate 5-Why root cause analysis for hydraulic hose burst on crane during heavy lift under SIMOPS.',
            'rca_expert'
          )}
          className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1.5"
        >
          <AlertTriangle size={10} className="text-amber-400" />
          <span>5-Why Hydraulic Rupture</span>
        </button>
        <button
          onClick={() => handleQuickPrompt(
            'Calculate Executive TRIR, LTIFR benchmark exposure and top risk items for board pack summary.',
            'executive_analyst'
          )}
          className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1.5"
        >
          <BrainCircuit size={10} className="text-purple-400" />
          <span>Executive TRIR & LTIFR</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 space-y-2">
        {/* Image Attachment Preview */}
        {selectedImage && (
          <div className="relative inline-block">
            <img 
              src={selectedImage} 
              alt="Upload preview" 
              className="h-16 w-16 object-cover rounded-xl border border-amber-500 shadow-md" 
            />
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute -top-1.5 -end-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-md hover:bg-red-700"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Live Audio Recording Status Banner */}
        {isRecording && (
          <div className="p-2.5 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-center justify-between text-xs text-red-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-bold">Recording Microphone ({recordingDuration}s)</span>
            </div>
            
            {/* Live Waveform Indicator */}
            <div className="flex items-center gap-1 h-4">
              <span className="w-1 bg-red-400 rounded" style={{ height: `${Math.max(4, audioLevel * 0.16)}px` }}></span>
              <span className="w-1 bg-red-400 rounded" style={{ height: `${Math.max(6, audioLevel * 0.22)}px` }}></span>
              <span className="w-1 bg-red-400 rounded" style={{ height: `${Math.max(4, audioLevel * 0.14)}px` }}></span>
              <span className="w-1 bg-red-400 rounded" style={{ height: `${Math.max(8, audioLevel * 0.26)}px` }}></span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleVoiceRecording}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] shadow transition-colors"
              >
                Transcribe (gemini-3.5)
              </button>
              <button
                onClick={cancelRecording}
                className="p-1 text-slate-400 hover:text-white"
                title="Cancel Recording"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-2xl p-1.5 focus-within:border-amber-500/80 transition-all">
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
            className="p-2 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-slate-900 transition-colors"
            title="Attach Safety Inspection Image"
          >
            <ImageIcon size={18} />
          </button>

          {/* Audio Microphone Input Button (gemini-3.5-transcribe) */}
          <button 
            type="button"
            onClick={handleToggleVoiceRecording}
            className={`p-2 rounded-xl transition-all ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
            }`}
            title={isRecording ? 'Stop & Transcribe Audio' : 'Record voice memo (gemini-3.5-transcribe)'}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500 px-2 py-1.5"
            placeholder={
              isRecording
                ? 'Speaking safety observation...'
                : useSearchGrounding 
                  ? 'Ask with Google Search Grounding...' 
                  : useMapsGrounding 
                    ? 'Search facilities with Google Maps Grounding...' 
                    : `Ask ${activeRoleObj.label}...`
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button 
            type="button"
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || isTyping || isRecording}
            className="p-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition disabled:opacity-40 disabled:hover:bg-amber-500 shadow-md font-bold"
            title="Send Message"
          >
            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;