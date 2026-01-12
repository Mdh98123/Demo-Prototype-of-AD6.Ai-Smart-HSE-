import React, { useState, useRef, useEffect } from 'react';
import { chatWithHSEBot } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const ChatBot: React.FC = () => {
  const { activeFramework } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello. I am your HSE Assistant. Ask me anything about UAE safety regulations (ADNOC/OSHAD).', timestamp: new Date() }
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
        // Convert history for API
        const historyForApi = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const responseText = await chatWithHSEBot(userMsg.text, historyForApi, activeFramework);
        
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
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105 z-50 flex items-center gap-2"
      >
        <MessageSquare size={24} />
        <span className="font-semibold">HSE Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-green-500 p-1.5 rounded-full">
                <Bot size={18} className="text-white"/>
            </div>
            <div>
                <h3 className="font-bold">HSE Assistant</h3>
                <p className="text-xs text-slate-300">Powered by Gemini 3 Pro</p>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800"
            placeholder="Ask about regulations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;