import React, { useState, useRef, useEffect } from 'react';
import { Search, Share2, Copy, Bookmark, BookOpen, Send, Sparkles, RefreshCw, Check, ScrollText } from 'lucide-react';
import { streamGeminiResponse } from '../services/geminiService';
import { QueryMode, Message } from '../types';
import { addToHistory } from '../utils/historyUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface HadithViewProps {
  initialQuery?: string;
}

export const HadithView: React.FC<HadithViewProps> = ({ initialQuery }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);
  const { t, language } = useLanguage();

  // Categories with icons
  const hadithCategories = [
    { id: 'ethics', label: t.hadith.topics.ethics, icon: '🤝' },
    { id: 'prayer', label: t.hadith.topics.prayer, icon: '🕌' },
    { id: 'patience', label: t.hadith.topics.patience, icon: '🌵' },
    { id: 'charity', label: t.hadith.topics.charity, icon: '💰' },
    { id: 'parents', label: t.hadith.topics.parents, icon: '👨‍👩‍👦' },
    { id: 'repentance', label: t.hadith.topics.repentance, icon: '🔄' },
    { id: 'knowledge', label: t.hadith.topics.knowledge, icon: '📚' },
    { id: 'dhikr', label: t.hadith.topics.dhikr, icon: '📿' },
  ];

  const handleSearch = async (searchTerm: string = query) => {
    if (!searchTerm.trim() || isLoading) return;
    
    // Save to history
    addToHistory(searchTerm, QueryMode.HADITH);
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: searchTerm,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery(''); // Clear input if it came from input
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
      await streamGeminiResponse(searchTerm, QueryMode.HADITH, (streamedText) => {
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

  // Helper to format the AI response into something looking like a Hadith card
  const renderFormattedContent = (text: string) => {
    // We split by newlines to handle paragraph spacing
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold handling
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-emerald-700 font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Simple heuristic: Long Arabic text likely Matn (Hadith text)
      if (line.trim().length > 0 && !line.includes('**')) {
          return <p key={idx} className="font-quran text-xl leading-loose text-slate-800 mb-4 text-center">{formattedLine}</p>;
      }
      
      return <p key={idx} className="text-sm text-slate-600 mb-2">{formattedLine}</p>;
    });
  };

  const HadithCard: React.FC<{ msg: Message }> = ({ msg }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (msg.role === 'user') return null;

    const handleCopy = () => {
      navigator.clipboard.writeText(msg.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    const handleShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: t.common.appName,
            text: msg.text
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        handleCopy();
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 transition-all hover:shadow-md">
        <div className="bg-emerald-50/50 p-3 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800">{t.common.search}</span>
            </div>
            <div className="flex gap-2">
                <button onClick={handleCopy} className="text-slate-400 hover:text-emerald-600 transition-colors" title={t.common.copy}>
                  {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16}/>}
                </button>
                <button onClick={handleShare} className="text-slate-400 hover:text-emerald-600 transition-colors" title={t.common.share}><Share2 size={16}/></button>
            </div>
        </div>
        
        <div className="p-6">
            <div dir="auto">
                {renderFormattedContent(msg.text)}
            </div>
        </div>

        <div className="bg-slate-50 p-3 flex justify-between items-center text-xs text-slate-500">
           <span>{t.common.appName}</span>
           <div className="flex gap-1">
             <Sparkles size={12} className="text-amber-400" />
             <span>{t.hadith.verified}</span>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Search Header */}
      <div className="px-4 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="relative shadow-sm rounded-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t.hadith.searchPlaceholder}
            className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-full py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-slate-200"
          />
          <Search className="absolute right-4 top-3 text-emerald-600" size={20} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Featured Hadith Card */}
            <div className="mt-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
               <div className="relative z-10 text-center">
                  <span className="inline-block px-3 py-1 bg-emerald-500/20 rounded-full text-xs font-medium mb-4 border border-emerald-500/30 text-emerald-300">
                    {t.common.hadithOfDay}
                  </span>
                  <p className="font-quran text-2xl leading-loose mb-6">
                    "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى"
                  </p>
                  <div className="flex flex-col gap-1 items-center text-sm text-slate-400">
                     <span className="font-bold text-slate-300">{t.common.narrator}: Omar bin Al-Khattab</span>
                     <span>Muttafaq Alayh</span>
                  </div>
               </div>
            </div>

            {/* Topic Categories Grid */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
                <ScrollText className="text-emerald-600" size={20} />
                {t.hadith.topicsTitle}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {hadithCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSearch(cat.label)}
                    className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-3 hover:border-emerald-300 hover:shadow-md transition-all group text-start relative overflow-hidden"
                  >
                     <div className="absolute top-0 left-0 w-full h-1 bg-emerald-50 group-hover:bg-emerald-500 transition-colors"></div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{cat.label}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center text-slate-400 text-xs py-8">
               <p>{t.hadith.sourceNote}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
             {/* Show user query as a small dividing header */}
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
                return <HadithCard key={msg.id} msg={msg} />;
             })}
             
             {isLoading && (
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
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