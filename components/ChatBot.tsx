import React, { useState, useRef, useEffect } from 'react';
import { chatWithHSEBot } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MessageSquare, Send, X, Bot, User, Mic, Sparkles, Globe } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import ReactMarkdown from 'react-markdown';

const ChatBot: React.FC = () => {
  const { activeFramework } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am **Safi**, your AD6 HSE Enterprise AI Copilot. I can help you with ADNOC/OSHAD compliance, risk assessments, and incident reporting in both English and Arabic. How can I assist you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        const responseText = await chatWithHSEBot(userMsg.text, messages, activeFramework);
        
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
    } catch (error) {
        console.error(error);
    } finally {
        setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-110 z-50 flex items-center gap-2 group"
      >
        <div className="relative">
            <MessageSquare size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
        </div>
        <span className="font-bold tracking-tight">Ask Safi AI</span>
        <Sparkles size={16} className="text-amber-400 animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex items-center gap-3 relative z-10">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg">
                <Bot size={24} className="text-white"/>
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg tracking-tight uppercase">Safi AI Copilot</h3>
                    <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-500/30">Online</span>
                </div>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Globe size={10} /> ADNOC & OSHAD Expert
                </p>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors relative z-10">
          <X size={24} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none shadow-xl' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
            }`}>
              <div className="markdown-body prose prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-3xl rounded-tl-none shadow-sm">
                <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex gap-2 items-center bg-slate-100 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
            <Mic size={20} />
          </button>
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 py-2"
            placeholder="Ask Safi about safety..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 shadow-lg"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-3 flex justify-center gap-4">
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">Report Incident</button>
            <div className="w-1 h-1 bg-slate-300 rounded-full self-center"></div>
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">Analyze Risk</button>
            <div className="w-1 h-1 bg-slate-300 rounded-full self-center"></div>
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">Check Compliance</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;