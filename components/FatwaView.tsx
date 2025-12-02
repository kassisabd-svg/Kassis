import React, { useState, useRef, useEffect } from 'react';
import { Search, Scale, ChevronDown, Book, Users, HeartHandshake, Coins, Droplets, Moon, Briefcase, Baby, X, Copy, Share2, Check } from 'lucide-react';
import { streamGeminiResponse } from '../services/geminiService';
import { QueryMode, Message } from '../types';
import { addToHistory } from '../utils/historyUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface FatwaViewProps {
  initialQuery?: string;
}

export const FatwaView: React.FC<FatwaViewProps> = ({ initialQuery }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);
  const { t, language } = useLanguage();

  // Fiqh Categories
  const categories = [
    { id: 'tahara', label: t.fatwa.categories.tahara, icon: Droplets, desc: 'Wudu, Ghusl' },
    { id: 'salah', label: t.fatwa.categories.salah, icon: Moon, desc: 'Prayer Rulings' }, 
    { id: 'zakat', label: t.fatwa.categories.zakat, icon: Coins, desc: 'Charity' },
    { id: 'siyam', label: t.fatwa.categories.siyam, icon: Moon, desc: 'Ramadan' },
    { id: 'family', label: t.fatwa.categories.family, icon: Baby, desc: 'Marriage, Divorce' },
    { id: 'trade', label: t.fatwa.categories.trade, icon: Briefcase, desc: 'Business' },
    { id: 'adab', label: t.fatwa.categories.adab, icon: Users, desc: 'Etiquette' },
    { id: 'oaths', label: t.fatwa.categories.oaths, icon: HeartHandshake, desc: 'Oaths' },
  ];

  const handleSearch = async (searchTerm: string = query) => {
    if (!searchTerm.trim() || isLoading) return;
    
    // Save to history
    addToHistory(searchTerm, QueryMode.FATWA);

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
      await streamGeminiResponse(searchTerm, QueryMode.FATWA, (streamedText) => {
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

  const renderFormattedFatwa = (msg: Message) => {
    const text = msg.text;
    const lines = text.split('\n');
    
    return (
      <div key={msg.id} className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden mb-6">
         <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Scale size={20} className="text-amber-600" />
                <span className="font-bold text-amber-800">{t.home.fatwaTitle}</span>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={() => handleCopy(text, msg.id)}
                  className="text-slate-400 hover:text-amber-600 transition-colors" 
                  title={t.common.copy}
                >
                  {copiedId === msg.id ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                </button>
                <button 
                   onClick={() => handleShare(text)}
                   className="text-slate-400 hover:text-amber-600 transition-colors" 
                   title={t.common.share}
                >
                   <Share2 size={16}/>
                </button>
            </div>
         </div>
         <div className="p-6 space-y-4">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('**Question:**') || trimmed.startsWith('**السؤال:**')) {
                    return <h3 key={idx} className="font-bold text-slate-800 mb-2">{trimmed.replace(/\*\*(.*?)\*\*/, '')}</h3>;
                }
                if (trimmed.startsWith('**Ruling:**') || trimmed.startsWith('**الحكم المختصر:**')) {
                    return (
                        <div key={idx} className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm font-bold mb-2">
                           {trimmed.replace(/\*\*(.*?)\*\*/, '')}
                        </div>
                    );
                }
                if (trimmed.startsWith('**Evidence') || trimmed.startsWith('**التفصيل')) {
                    return <h4 key={idx} className="font-bold text-amber-700 mt-4 mb-2 text-sm">{language === 'ar' ? 'التفصيل والأدلة:' : 'Details & Evidence:'}</h4>;
                }
                
                // Content lines
                if (!trimmed) return null;
                // Check if it's a bullet point
                if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                    return <li key={idx} className="text-slate-700 leading-relaxed mr-4 text-sm">{trimmed.replace(/^[\*\-]\s*/, '')}</li>;
                }

                return <p key={idx} className="text-slate-700 leading-relaxed text-sm">{trimmed.replace(/\*\*/g, '')}</p>;
            })}
         </div>
         <div className="bg-slate-50 p-3 text-xs text-slate-400 text-center border-t border-slate-100">
            {t.fatwa.disclaimer}
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
            placeholder={t.fatwa.searchPlaceholder}
            className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-full py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all border border-slate-200"
          />
          <Search className="absolute right-4 top-3 text-amber-600" size={20} />
          {query && (
            <button onClick={() => setQuery('')} className="absolute left-4 top-3 text-slate-300 hover:text-slate-500">
               <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">{t.fatwa.categoriesTitle}</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSearch(cat.label)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-3 hover:border-amber-300 hover:shadow-md transition-all group text-start"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <cat.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{cat.label}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">{cat.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 bg-amber-50 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-20 bg-amber-200 opacity-20 rounded-full -ml-5 -mt-5"></div>
                <div className="relative z-10">
                    <h3 className="font-bold text-amber-900 mb-2">{t.fatwa.contemporary}</h3>
                    <p className="text-xs text-amber-800 leading-relaxed mb-4">
                        {t.fatwa.contemporaryDesc}
                    </p>
                    <button 
                        onClick={() => handleSearch(t.fatwa.contemporary)}
                        className="bg-white text-amber-700 text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                    >
                        {t.fatwa.exploreNow}
                    </button>
                </div>
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
                return renderFormattedFatwa(msg);
             })}
             
             {isLoading && (
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
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