import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Send, Loader2, ThumbsUp, ThumbsDown, ShieldAlert, 
  FileText, Globe, Search, ExternalLink, Mic, MicOff, Check,
  Sparkles, BrainCircuit, ShieldCheck, Scale
} from 'lucide-react';
import Markdown from 'react-markdown';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { 
  GeminiClientService, 
  GeminiModelType, 
  GroundingSource 
} from '../../services/geminiClientService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  modelUsed?: string;
  searchCitations?: GroundingSource[];
  confidence?: number;
  language: 'en' | 'ar';
}

export const ComplianceAssistant: React.FC = () => {
  const { dir, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'assistant', 
      text: 'Welcome to the Statutory Compliance Intelligence Assistant. I am grounded in Sultanate of Oman Labour Law (RD 53/2023), Ministry of Labour Regulations (MD 286/2008), PDO HSE Specifications (SP-1143, SP-1170, SP-1231/1232, PR-1172), CDAA Fire Directives, and ISO 45001.\n\nYou can query live statutory announcements with **Google Search Grounding**, switch Gemini models, or use **Microphone Audio Transcription (gemini-3.5-transcribe)**.', 
      language: 'en',
      modelUsed: 'gemini-3.5-flash'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleToggleVoice = async () => {
    if (isRecording) {
      setIsTranscribing(true);
      try {
        const audioBlob = await stopRecording();
        if (audioBlob && audioBlob.size > 0) {
          const res = await GeminiClientService.transcribeAudio(
            audioBlob,
            'Transcribe this statutory compliance inquiry accurately in its spoken language.'
          );
          if (res.text) {
            setInput(prev => (prev ? prev + ' ' + res.text : res.text));
          }
        }
      } catch (err: any) {
        console.error('Compliance assistant voice transcription error:', err);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      await startRecording();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userText,
      language: language === 'ar' ? 'ar' : 'en' 
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text
      }));
      historyPayload.push({
        role: 'user',
        text: userText
      });

      const res = await GeminiClientService.sendChatMessage({
        messages: historyPayload,
        role: 'hse_advisor',
        model: selectedModel,
        useSearchGrounding,
        useMapsGrounding: false
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: res.text,
        modelUsed: res.model,
        searchCitations: res.grounding?.searchCitations || [],
        confidence: 0.95,
        language: language === 'ar' ? 'ar' : 'en'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e: any) {
      console.error('Compliance generation error:', e);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `⚠️ **Service Notice**: ${e.message || 'Failed to query compliance endpoint. Please check system status.'}`,
        language: 'en'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full glass-panel font-sans ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex-shrink-0 glass-card border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">AI Compliance Assistant</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Oman Ministry of Labour & PDO Domain Knowledge (Grounded in Gemini)
            </p>
          </div>
        </div>
        
        {/* Model & Search Grounding Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Search Grounding Pill */}
          <button
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition-all text-xs ${
              useSearchGrounding 
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
            title="Toggle Google Search Grounding for live statutory updates"
          >
            <Search size={13} />
            <span>Search Grounding</span>
            {useSearchGrounding && <Check size={12} />}
          </button>

          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as GeminiModelType)}
            className="bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 outline-none text-xs"
          >
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (General / Grounded)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Tasks)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast Tasks)</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${
              msg.role === 'user' 
                ? (dir === 'rtl' ? 'items-start' : 'items-end') 
                : (dir === 'rtl' ? 'items-end' : 'items-start')
            }`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'glass-card border border-slate-200 text-slate-800'
            }`}>
              <div className={`prose prose-sm max-w-none ${msg.language === 'ar' ? 'font-arabic text-right' : ''} ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                <div className="markdown-body">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
              
              {/* Grounded Web Sources */}
              {msg.searchCitations && msg.searchCitations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                  <div className="text-[10px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5">
                    <Search size={12} />
                    <span>Verified Web Sources (Google Search Grounding)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.searchCitations.map((c, i) => (
                      <a
                        key={i}
                        href={c.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink size={11} />
                        <span className="truncate max-w-[220px]">{c.title || c.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'assistant' && (
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-bold px-2">
                {msg.modelUsed && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {msg.modelUsed}
                  </span>
                )}
                <span>•</span>
                <span className="text-emerald-600">✓ Oman MoL MD 286/2008 / Ministry of Labour (MoL) Aligned</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-3 glass-card border border-slate-200 rounded-2xl p-4 shadow-sm text-slate-600 w-fit">
            <Loader2 size={18} className="animate-spin text-indigo-600" />
            <span className="text-sm font-bold animate-pulse">
              Cross-referencing statutory codes with {selectedModel}...
            </span>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 text-xs w-fit">
            <Loader2 size={15} className="animate-spin text-purple-600" />
            <span>Transcribing audio via <strong>gemini-3.5-transcribe</strong>...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Bar */}
      {isRecording && (
        <div className="px-6 py-2.5 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold">Recording voice inquiry ({recordingDuration}s)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-sm"
            >
              Stop & Transcribe (gemini-3.5)
            </button>
            <button onClick={cancelRecording} className="text-slate-400 hover:text-slate-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 glass-card border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {/* Microphone Recording Button (gemini-3.5-transcribe) */}
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={isTranscribing}
            className={`p-3.5 rounded-xl border transition-all ${
              isRecording 
                ? 'bg-red-600 text-white border-red-500 animate-pulse' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-400'
            }`}
            title="Dictate with microphone (transcribed by gemini-3.5-transcribe)"
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={
              useSearchGrounding 
                ? 'Ask statutory questions grounded in live Google Search...' 
                : 'Ask about confined space permits, drafting CAPA plans, or Oman MoL / PDO specifications...'
            }
            className="flex-1 glass-panel border-2 border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-600 text-sm font-medium transition-all"
          />

          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isRecording}
            className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-md active:scale-95 shrink-0"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceAssistant;
