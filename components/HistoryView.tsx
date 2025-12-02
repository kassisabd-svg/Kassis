import React, { useState, useRef, useEffect } from 'react';
import { Search, Scroll, Bookmark, Copy, Share2, Check, Landmark, Hourglass } from 'lucide-react';
import { streamGeminiResponse } from '../services/geminiService';
import { QueryMode, Message } from '../types';
import { addToHistory } from '../utils/historyUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryViewProps {
  initialQuery?: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ initialQuery }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);
  const { t, language } = useLanguage();

  const chapters = [
    { id: 'seerah', label: t.history.chapters.seerah, icon: 'ﷺ' },
    { id: 'caliphs', label: t.history.chapters.caliphs, icon: '🏳️' },
    { id: 'umayyads', label: t.history.chapters.umayyads, icon: '🏰' },
    { id: 'abbasids', label: t.history.chapters.abbasids, icon: '🏛️' },
    { id: 'andalus', label: t.history.chapters.andalus, icon: '🍊' },
    { id: 'companions', label: t.history.chapters.companions, icon: '👥' },
    { id: 'conquests', label: t.history.chapters.conquests, icon: '⚔️' },
    { id: 'ottomans', label: t.history.chapters.ottomans, icon: '🕌' },
  ];

  const handleSearch = async (searchTerm: string = query) => {
    if (!searchTerm.trim() || isLoading) return;
    
    addToHistory(searchTerm, QueryMode.HISTORY);

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
      await streamGeminiResponse(searchTerm, QueryMode.HISTORY, (streamedText) => {
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
        <div key={msg.id} className="bg-[#fdfaf5] dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
             <div className="bg-stone-100 dark:bg-stone-800 p-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Hourglass size={20} className="text-stone-600 dark:text-stone-400" />
                    <span className="font-bold text-stone-800 dark:text-stone-200">{t.history.title}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleCopy(msg.text, msg.id)} className="text-stone-400 hover:text-stone-600 p-1">
                        {copiedId === msg.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16}/>}
                    </button>
                    <button onClick={() => handleShare(msg.text)} className="text-stone-400 hover:text-stone-600 p-1">
                        <Share2 size={16}/>
                    </button>
                </div>
             </div>
             <div className="p-6 space-y-3 font-serif">
                {lines.map((line, idx) => {
                    const trimmed = line.trim();
                    // Headers
                    if (trimmed.startsWith('**') && !trimmed.includes('المصدر') && !trimmed.includes('Source')) {
                         return <h3 key={idx} className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2 mt-2">{trimmed.replace(/\*\*/g, '')}</h3>
                    }
                    // Source citation
                    if (trimmed.includes('المصدر:') || trimmed.includes('Source:')) {
                        return (
                           <div key={idx} className="mt-4 pt-3 border-t border-dashed border-stone-300 dark:border-stone-700">
                               <p className="text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                  <Scroll size={12} />
                                  {trimmed.replace(/\*\*/g, '')}
                               </p>
                           </div>
                        )
                    }
                    
                    if (!trimmed) return null;
                    return <p key={idx} className="text-stone-700 dark:text-stone-300 text-sm leading-8">{trimmed.replace(/\*\*/g, '')}</p>
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
            placeholder={t.history.searchPlaceholder}
            className="w-full bg-white text-stone-800 placeholder-stone-400 rounded-full py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-stone-500/50 transition-all border border-stone-200"
          />
          <Search className="absolute right-4 top-3 text-stone-600" size={20} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-4 px-1 flex items-center gap-2">
                <Landmark className="text-stone-600" size={20} />
                {t.history.chaptersTitle}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => handleSearch(chapter.label)}
                  className="bg-[#fdfaf5] dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col gap-3 hover:border-stone-400 hover:shadow-md transition-all group text-start relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-full -mr-8 -mt-8 opacity-50"></div>
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center group-hover:scale-110 transition-transform text-lg shadow-sm">
                    {chapter.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm">{chapter.label}</h3>
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
                        <div key={msg.id} className="flex items-center gap-2 py-4 text-stone-400 justify-center">
                            <div className="h-px bg-stone-200 w-12"></div>
                            <span className="text-xs font-medium">{t.common.search}: {msg.text}</span>
                            <div className="h-px bg-stone-200 w-12"></div>
                        </div>
                    );
                }
                return renderContent(msg);
             })}
             
             {isLoading && (
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-stone-100 border-t-stone-600 rounded-full animate-spin"></div>
                  <span className="text-xs text-stone-400 animate-pulse">{t.common.loading}</span>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};