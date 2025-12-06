import React, { useState, useRef, useEffect } from 'react';
import { Search, GraduationCap, Copy, Share2, Check, BookOpen, User, Star, Feather, Microscope } from 'lucide-react';
import { streamGeminiResponse } from '../services/geminiService';
import { QueryMode, Message } from '../types';
import { addToHistory } from '../utils/historyUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface ScholarsViewProps {
  initialQuery?: string;
}

export const ScholarsView: React.FC<ScholarsViewProps> = ({ initialQuery }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);
  const { t, language } = useLanguage();

  const fields = [
    { id: 'tafsir', label: t.scholars.fields.tafsir, icon: <BookOpen size={20}/> },
    { id: 'hadith', label: t.scholars.fields.hadith, icon: <ScrollTextIcon /> },
    { id: 'fiqh', label: t.scholars.fields.fiqh, icon: <User size={20}/> },
    { id: 'aqeedah', label: t.scholars.fields.aqeedah, icon: <Star size={20}/> },
    { id: 'science', label: t.scholars.fields.science, icon: <Microscope size={20}/> },
    { id: 'language', label: t.scholars.fields.language, icon: <Feather size={20}/> },
    { id: 'history', label: t.scholars.fields.history, icon: <HourglassIcon /> },
    { id: 'sufism', label: t.scholars.fields.sufism, icon: <HeartIcon /> },
  ];

  const handleSearch = async (searchTerm: string = query) => {
    if (!searchTerm.trim() || isLoading) return;
    
    addToHistory(searchTerm, QueryMode.SCHOLARS);

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
      await streamGeminiResponse(searchTerm, QueryMode.SCHOLARS, (streamedText) => {
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
    const lines = msg.text.split('\n');
    
    return (
        <div key={msg.id} className="bg-cyan-50/50 dark:bg-slate-900 rounded-2xl shadow-sm border border-cyan-100 dark:border-slate-800 overflow-hidden mb-6">
             <div className="bg-cyan-100/50 dark:bg-slate-800 p-4 border-b border-cyan-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GraduationCap size={20} className="text-cyan-700 dark:text-cyan-400" />
                    <span className="font-bold text-cyan-900 dark:text-cyan-100">{t.scholars.title}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleCopy(msg.text, msg.id)} className="text-slate-400 hover:text-cyan-600 p-1">
                        {copiedId === msg.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16}/>}
                    </button>
                    <button onClick={() => handleShare(msg.text)} className="text-slate-400 hover:text-cyan-600 p-1">
                        <Share2 size={16}/>
                    </button>
                </div>
             </div>
             <div className="p-6 space-y-3">
                {lines.map((line, idx) => {
                    const trimmed = line.trim();
                    // Headers (Scholar Name)
                    if (trimmed.startsWith('**') && !trimmed.includes(':')) {
                         return <h3 key={idx} className="font-bold text-xl text-cyan-900 dark:text-cyan-100 mb-4 pb-2 border-b border-cyan-100 dark:border-slate-700">{trimmed.replace(/\*\*/g, '')}</h3>
                    }
                    // Metadata (Dates, Field)
                    if (trimmed.includes('**التاريخ:') || trimmed.includes('**Dates:') || trimmed.includes('**Field:') || trimmed.includes('**الاختصاص:')) {
                       return (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-1">
                             <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                             {trimmed.startsWith('*') ? <span>{trimmed.replace(/\*/g, '').replace(/\*\*/g, '')}</span> : <strong>{trimmed.replace(/\*\*/g, '')}</strong>}
                          </div>
                       )
                    }
                     // Works
                     if (trimmed.includes('**أهم المؤلفات:') || trimmed.includes('**Notable Works:') || trimmed.includes('**Œuvres :')) {
                        return <h4 key={idx} className="font-bold text-cyan-800 dark:text-cyan-200 mt-4 mb-2 flex items-center gap-2"><BookOpen size={16}/> {trimmed.replace(/\*\*/g, '').replace(/:/g, '')}</h4>
                     }
                    
                    if (!trimmed) return null;
                    return <p key={idx} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{trimmed.replace(/\*\*/g, '').replace(/^\* /, '')}</p>
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
            placeholder={t.scholars.searchPlaceholder}
            className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-full py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all border border-slate-200"
          />
          <Search className="absolute right-4 top-3 text-cyan-600" size={20} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 px-1 flex items-center gap-2">
                <GraduationCap className="text-cyan-600" size={20} />
                {t.scholars.fieldsTitle}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => handleSearch(field.label)}
                  className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3 hover:border-cyan-300 hover:shadow-md transition-all group text-start relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-50 group-hover:bg-cyan-500 transition-colors"></div>
                  <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                    {field.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{field.label}</h3>
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
                  <div className="w-8 h-8 border-2 border-cyan-100 border-t-cyan-600 rounded-full animate-spin"></div>
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

// Icons Helper
const ScrollTextIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
);
const HourglassIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
);
const HeartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);