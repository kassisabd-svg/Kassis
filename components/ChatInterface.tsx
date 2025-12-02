import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Book, Scale, ScrollText, Copy, Share2, Check } from 'lucide-react';
import { Message, QueryMode } from '../types';
import { streamGeminiResponse } from '../services/geminiService';
import { addToHistory } from '../utils/historyUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatInterfaceProps {
  initialMode?: QueryMode;
  initialQuery?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMode, initialQuery }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t.chat.welcome,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<QueryMode>(initialMode || QueryMode.GENERAL);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialQuery = useRef(false);

  // Update mode if prop changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Reset welcome message on language change
  useEffect(() => {
     setMessages(prev => prev.map(msg => 
        msg.id === 'welcome' ? { ...msg, text: t.chat.welcome } : msg
     ));
  }, [t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processMessage = async (text: string, currentMode: QueryMode) => {
    // Save to history
    addToHistory(text, currentMode);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: Message = {
      id: botMsgId,
      role: 'model',
      text: '',
      isStreaming: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, initialBotMsg]);

    try {
      await streamGeminiResponse(text, currentMode, (streamedText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: streamedText } : msg
        ));
      }, language); // Pass language to service
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: t.common.error, isStreaming: false } : msg
      ));
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
      ));
    }
  };

  // Handle initial query
  useEffect(() => {
    if (initialQuery && !hasProcessedInitialQuery.current) {
      hasProcessedInitialQuery.current = true;
      processMessage(initialQuery, initialMode || QueryMode.GENERAL);
    }
  }, [initialQuery, initialMode]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await processMessage(text, mode);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Al-Bayan',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy(text, 'share-fallback');
    }
  };

  const renderModeSelector = () => (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 px-1 no-scrollbar">
      <button
        onClick={() => setMode(QueryMode.GENERAL)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          mode === QueryMode.GENERAL ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
        }`}
      >
        <Sparkles size={16} />
        <span>{t.chat.modes.general}</span>
      </button>
      <button
        onClick={() => setMode(QueryMode.FATWA)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          mode === QueryMode.FATWA ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
        }`}
      >
        <Scale size={16} />
        <span>{t.chat.modes.fatwa}</span>
      </button>
      <button
        onClick={() => setMode(QueryMode.QURAN)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          mode === QueryMode.QURAN ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
        }`}
      >
        <Book size={16} />
        <span>{t.chat.modes.quran}</span>
      </button>
      <button
        onClick={() => setMode(QueryMode.HADITH)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          mode === QueryMode.HADITH ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
        }`}
      >
        <ScrollText size={16} />
        <span>{t.chat.modes.hadith}</span>
      </button>
    </div>
  );

  const getPlaceholder = () => {
    switch(mode) {
        case QueryMode.FATWA: return t.chat.placeholders.fatwa;
        case QueryMode.QURAN: return t.chat.placeholders.quran;
        case QueryMode.HADITH: return t.chat.placeholders.hadith;
        default: return t.chat.placeholders.general;
    }
  }

  // Simple formatter
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-emerald-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        {renderModeSelector()}
        
        <div className="space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                     <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="font-quran text-xs text-emerald-700 font-bold">ب</span>
                     </div>
                     <span className="text-xs font-bold text-emerald-700">{t.common.appName}</span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm leading-relaxed" dir="auto">
                  {msg.isStreaming && !msg.text ? (
                     <span className="animate-pulse">...</span>
                  ) : (
                     formatText(msg.text)
                  )}
                </div>

                {/* Actions Footer for Model Messages */}
                {msg.role === 'model' && !msg.isStreaming && msg.text && (
                  <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-slate-50">
                     <button 
                       onClick={() => handleCopy(msg.text, msg.id)}
                       className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
                       title={t.common.copy}
                     >
                        {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                     </button>
                     <button 
                       onClick={() => handleShare(msg.text)}
                       className="text-slate-400 hover:text-emerald-600 transition-colors"
                       title={t.common.share}
                     >
                        <Share2 size={14} />
                     </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={getPlaceholder()}
            className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 rounded-full py-3 pr-4 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-transparent focus:border-emerald-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute left-2 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <Send size={18} className={isLoading ? 'opacity-0' : 'opacity-100'} />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};