import React, { useState, useRef, useEffect } from 'react';
import { Search, Book, Bookmark, Copy, Share2, Check, ArrowRight, Library, Sparkles } from 'lucide-react';
import { streamGeminiResponse } from '../services/geminiService';
import { QueryMode, Message } from '../types';
import { addToHistory } from '../utils/historyUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface SunnahViewProps {
  initialQuery?: string;
}

export const SunnahView: React.FC<SunnahViewProps> = ({ initialQuery }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);
  const { t, language } = useLanguage();

  const chapters = [
    { id: 'iman', label: t.sunnah.chapters.iman, icon: '✨' },
    { id: 'tahara', label: t.sunnah.chapters.tahara, icon: '💧' },
    { id: 'salah', label: t.sunnah.chapters.salah, icon: '🕌' },
    { id: 'zakat', label: t.sunnah.chapters.zakat, icon: '💰' },
    { id: 'siyam', label: t.sunnah.chapters.siyam, icon: '🌙' },
    { id: 'hajj', label: t.sunnah.chapters.hajj, icon: '🕋' },
    { id: 'nikah', label: t.sunnah.chapters.nikah, icon: '💍' },
    { id: 'adab', label: t.sunnah.chapters.adab, icon: '🤝' },
    { id: 'fitan', label: t.sunnah.chapters.fitan, icon: '🛡️' },
    { id: 'riqaq', label: t.sunnah.chapters.riqaq, icon: '❤️' },
  ];

  const handleSearch = async (searchTerm: string = query) => {
    if (!searchTerm.trim() || isLoading) return;
    
    addToHistory(searchTerm, QueryMode.SUNNAH);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: searchTerm,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
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
      await streamGeminiResponse(searchTerm, QueryMode.SUNNAH, (streamedText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: streamedText } : msg
        ));
      }, language);
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

  useEffect(() => {
    if (initialQuery && !hasProcessedInitial.current) {
        hasProcessedInitial.current = true;
        handleSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (text: string, id: string) => {
     navigator.clipboard.writeText(text);
     setCopiedId(id);
     setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
     if (navigator.share) {
         try {
             await navigator.share({
                 title: t.common.appName,
                 text: text
             });
         } catch(e) { console.error(e) }
     } else {
         handleCopy(text, 'fallback');
     }
  };

  const renderContent = (msg: Message) => {
    // Basic formatting for the structured Sunnah response
    const lines = msg.text.split('\n');
    
    return (
        <div key={msg.id} className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden mb-6">
             <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Library size={20} className="text-indigo-600" />
                    <span className="font-bold text-indigo-800">{t.sunnah.title}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleCopy(msg.text, msg.id)} className="text-slate-400 hover:text-indigo-600 p-1">
                        {copiedId === msg.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16}/>}
                    </button>
                    <button onClick={() => handleShare(msg.text)} className="text-slate-400 hover:text-indigo-600 p-1">
                        <Share2 size={16}/>
                    </button>
                </div>
             </div>
             <div className="p-6 space-y-3">
                {lines.map((line, idx) => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('**') && !trimmed.includes(':')) {
                         // Likely a Main Header (Book/Chapter Title)
                         return <h3 key={idx} className="font-bold text-lg text-indigo-900 mb-4 pb-2 border-b border-indigo-50">{trimmed.replace(/\*\*/g, '')}</h3>
                    }
                    if (trimmed.startsWith('**السنة:') || trimmed.startsWith('**Sunnah:')) {
                        return <div key={idx} className="font-bold text-slate-800 mt-4 flex items-center gap-2"><Sparkles size={14} className="text-amber-500"/>{trimmed.replace(/\*\*/g, '')}</div>
                    }
                    if (trimmed.startsWith('* **') && (trimmed.includes('الدليل') || trimmed.includes('Hadith'))) {
                         // Hadith Text
                         const content = trimmed.replace(/^\* \*\*(.*?)\*\*:/, '').trim();
                         return (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl my-2 border-r-4 border-indigo-200">
                                <span className="text-xs font-bold text-indigo-500 block mb-1">{language === 'ar' ? 'الدليل:' : 'Reference:'}</span>
                                <p className="font-quran text-lg leading-loose text-slate-700">{content.replace(/"/g, '')}</p>
                            </div>
                         )
                    }
                    if (trimmed.startsWith('* **') && (trimmed.includes('التخريج') || trimmed.includes('Reference') || trimmed.includes('Source'))) {
                        return <p key={idx} className="text-xs text-slate-400 italic mt-1">{trimmed.replace(/\*\*/g, '').replace(/^\* /, '')}</p>
                    }
                    
                    if (!trimmed) return null;
                    return <p key={idx} className="text-slate-600 text-sm leading-relaxed">{trimmed.replace(/\*\*/g, '')}</p>
                })}
             </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Search Header */}
      <div className="px-4 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="relative shadow-sm rounded-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t.sunnah.searchPlaceholder}
            className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-full py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all border border-slate-200"
          />
          <Search className="absolute right-4 top-3 text-indigo-600" size={20} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
                <Book className="text-indigo-600" size={20} />
                {t.sunnah.chaptersTitle}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => handleSearch(chapter.label)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-3 hover:border-indigo-300 hover:shadow-md transition-all group text-start relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-50 group-hover:bg-indigo-500 transition-colors"></div>
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                    {chapter.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{chapter.label}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             {messages.map((msg, idx) => {
                if (msg.role === 'user') {
                    return (
                        <div key={msg.id} className="flex items-center gap-2 py-4 text-slate-400 justify-center">
                            <div className="h-px bg-slate-200 w-12"></div>
                            <span className="text-xs font-medium">{t.common.search}: {msg.text}</span>
                            <div className="h-px bg-slate-200 w-12"></div>
                        </div>
                    );
                }
                return renderContent(msg);
             })}
             
             {isLoading && (
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-400 animate-pulse">{t.common.loading}</span>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};