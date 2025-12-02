import React, { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Share2, Copy, Bookmark, ChevronDown, Filter, X, ArrowRight, Check } from 'lucide-react';
import { streamGeminiResponse } from '../services/geminiService';
import { QueryMode, Message } from '../types';
import { addToHistory } from '../utils/historyUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface QuranViewProps {
  initialQuery?: string;
}

export const QuranView: React.FC<QuranViewProps> = ({ initialQuery }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'topics' | 'surahs'>('topics');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);
  const { t, language } = useLanguage();

  // Categories / Topics
  const topicCategories = [
    { name: t.quran.topics.prophets, icon: '📜' },
    { name: t.quran.topics.judgment, icon: '⚖️' },
    { name: t.quran.topics.ethics, icon: '🤝' },
    { name: t.quran.topics.worship, icon: '🤲' },
    { name: t.quran.topics.parents, icon: '👨‍👩‍👦' },
    { name: t.quran.topics.patience, icon: '🌵' },
    { name: t.quran.topics.sustenance, icon: '🌾' },
    { name: t.quran.topics.supplication, icon: '✨' },
  ];

  // Popular Surahs for quick filter
  const surahs = [
    'Surah Al-Baqarah', 'Surah Al-Kahf', 'Surah Yasin', 'Surah Al-Mulk', 
    'Surah Ar-Rahman', 'Surah Al-Waqi\'a', 'Surah Yusuf', 'Surah Maryam'
  ];

  const handleSearch = async (searchTerm: string = query) => {
    if (!searchTerm.trim() || isLoading) return;
    
    // Save to history
    addToHistory(searchTerm, QueryMode.QURAN);

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
      await streamGeminiResponse(searchTerm, QueryMode.QURAN, (streamedText) => {
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

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleShare = async (text: string) => {
     if (navigator.share) {
         try {
             await navigator.share({
                 title: t.common.appName,
                 text: text
             });
         } catch (e) { console.error(e) }
     } else {
         navigator.clipboard.writeText(text);
     }
  };

  const renderFormattedContent = (text: string) => {
    // Check if it's an apology
    if ((text.includes("عذراً") || text.includes("Sorry")) && !text.includes("**")) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center font-medium border border-red-100">
                {text}
            </div>
        );
    }

    // Split by the separator defined in prompt if possible, or just newlines
    const segments = text.split('---').filter(s => s.trim().length > 0);

    if (segments.length === 0) return <p className="text-slate-600">{text}</p>;

    return segments.map((segment, idx) => {
      // Parse Surah Name (Bold) and Verse text
      const lines = segment.split('\n').filter(l => l.trim());
      let rawHeader = '';
      let ayahText = '';
      let tafsir = '';

      lines.forEach(line => {
        if (line.includes('**')) rawHeader = line.replace(/\*\*/g, '');
        else if (line.startsWith('>')) tafsir = line.replace('>', '').trim();
        else ayahText += line + ' ';
      });

      // Parse Header for Surah and Number
      let surahName = rawHeader;
      let ayahNum = '';
      if (rawHeader.includes(':')) {
          const parts = rawHeader.split(':');
          surahName = parts[0].trim();
          ayahNum = parts[1].trim();
      }

      // Content text only for copying/sharing
      const contentToShare = `${surahName} ${ayahNum ? `Ayah ${ayahNum}`: ''}\n\n${ayahText}\n\n${tafsir}`;

      // Fallback if parsing isn't perfect during streaming
      if (!ayahText && !rawHeader) return <p key={idx} className="whitespace-pre-wrap">{segment}</p>;

      return (
        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden mb-6 relative group">
           {/* Header: Clickable Surah Name */}
           <div className="bg-emerald-50/50 px-4 py-2 border-b border-emerald-100 flex justify-between items-center">
              <button 
                onClick={() => handleSearch(`${surahName}`)}
                className="text-emerald-800 font-bold text-sm hover:underline hover:text-emerald-600 flex items-center gap-1"
                title="Read more from this Surah"
              >
                <span>{surahName || t.common.search}</span>
                {ayahNum && <span className="text-emerald-600/70 text-xs font-normal">| {ayahNum}</span>}
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1 mr-1" />
              </button>
              
              <div className="flex gap-2 opacity-100 transition-opacity">
                 <button 
                   onClick={() => handleCopy(contentToShare, idx)}
                   className="text-slate-400 hover:text-emerald-600 p-1" 
                   title={t.common.copy}
                 >
                    {copiedIndex === idx ? <Check size={16} className="text-emerald-500" /> : <Copy size={16}/>}
                 </button>
                 <button 
                   onClick={() => handleShare(contentToShare)}
                   className="text-slate-400 hover:text-emerald-600 p-1" 
                   title={t.common.share}
                 >
                    <Share2 size={16}/>
                 </button>
              </div>
           </div>

           {/* Ayah Text with Decorative Number */}
           <div className="p-6 pb-4 text-center">
              <p className="font-quran text-2xl md:text-3xl leading-[2.5] text-slate-800 mb-2" dir="rtl">
                 {ayahText || segment}
                 {ayahNum && (
                   <span className="font-sans text-xl inline-flex items-center justify-center mr-2 text-emerald-600 align-middle select-none">
                     ﴿{ayahNum}﴾
                   </span>
                 )}
              </p>
           </div>

           {/* Tafsir */}
           {tafsir && (
             <div className="px-6 pb-6">
                <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 border border-slate-100 leading-relaxed relative">
                   <div className="absolute top-0 right-4 -mt-2 w-4 h-4 bg-slate-50 border-t border-l border-slate-100 transform rotate-45"></div>
                   <span className="font-bold text-emerald-600 ml-1">{t.common.interpretation}:</span>
                   {tafsir}
                </div>
             </div>
           )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Search Header */}
      <div className="px-4 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-20 space-y-3">
        <div className="relative shadow-sm rounded-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t.quran.searchPlaceholder}
            className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-full py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-slate-200"
          />
          <Search className="absolute right-4 top-3 text-emerald-600" size={20} />
          {query && (
            <button onClick={() => setQuery('')} className="absolute left-4 top-3 text-slate-300 hover:text-slate-500">
               <X size={18} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        {messages.length === 0 && (
          <div className="flex gap-4 border-b border-slate-200/50">
             <button 
               onClick={() => setActiveTab('topics')}
               className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'topics' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'}`}
             >
                {t.quran.tabTopics}
             </button>
             <button 
               onClick={() => setActiveTab('surahs')}
               className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'surahs' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'}`}
             >
                {t.quran.tabSurahs}
             </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'topics' ? (
              <div className="grid grid-cols-2 gap-3">
                {topicCategories.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(topic.name)}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{topic.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{topic.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                 {surahs.map((surah, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(surah)}
                      className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all text-sm font-quran"
                    >
                      {surah}
                    </button>
                 ))}
              </div>
            )}

            {/* Quick Tip */}
            <div className="mt-8 bg-emerald-50 rounded-xl p-4 flex gap-3 items-start border border-emerald-100">
               <div className="p-1.5 bg-white rounded-full text-emerald-600 shadow-sm mt-0.5">
                  <BookOpen size={14} />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-emerald-800 mb-1">{t.quran.tipTitle}</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                     {t.quran.tipText}
                  </p>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             {messages.map((msg, idx) => {
                if (msg.role === 'user') {
                    return (
                        <div key={msg.id} className="flex items-center gap-2 py-2 text-slate-300 justify-center">
                            <span className="text-xs">{t.common.search}: {msg.text}</span>
                        </div>
                    );
                }
                return (
                    <div key={msg.id} className="animate-in fade-in duration-500">
                        {renderFormattedContent(msg.text)}
                    </div>
                );
             })}
             
             {isLoading && (
               <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                  <span className="text-sm text-slate-400 animate-pulse font-medium">{t.common.loading}</span>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};