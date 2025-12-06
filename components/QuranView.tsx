import React, { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Share2, Copy, Bookmark, ChevronDown, Filter, X, ArrowRight, Check } from 'lucide-react';
import { streamGeminiResponse } from '../services/geminiService';
import { QueryMode, Message } from '../types';
import { addToHistory } from '../utils/historyUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface QuranViewProps {
  initialQuery?: string;
}

// Full list of 114 Surahs with translations
const ALL_SURAHS = [
  { id: 1, ar: "الفاتحة", en: "Al-Fatiha", fr: "Al-Fatiha" },
  { id: 2, ar: "البقرة", en: "Al-Baqarah", fr: "Al-Baqara" },
  { id: 3, ar: "آل عمران", en: "Ali 'Imran", fr: "Al-Imran" },
  { id: 4, ar: "النساء", en: "An-Nisa", fr: "An-Nisa" },
  { id: 5, ar: "المائدة", en: "Al-Ma'idah", fr: "Al-Ma'ida" },
  { id: 6, ar: "الأنعام", en: "Al-An'am", fr: "Al-An'am" },
  { id: 7, ar: "الأعراف", en: "Al-A'raf", fr: "Al-A'raf" },
  { id: 8, ar: "الأنفال", en: "Al-Anfal", fr: "Al-Anfal" },
  { id: 9, ar: "التوبة", en: "At-Tawbah", fr: "At-Tawba" },
  { id: 10, ar: "يونس", en: "Yunus", fr: "Yunus" },
  { id: 11, ar: "هود", en: "Hud", fr: "Hud" },
  { id: 12, ar: "يوسف", en: "Yusuf", fr: "Yusuf" },
  { id: 13, ar: "الرعد", en: "Ar-Ra'd", fr: "Ar-Ra'd" },
  { id: 14, ar: "إبراهيم", en: "Ibrahim", fr: "Ibrahim" },
  { id: 15, ar: "الحجر", en: "Al-Hijr", fr: "Al-Hijr" },
  { id: 16, ar: "النحل", en: "An-Nahl", fr: "An-Nahl" },
  { id: 17, ar: "الإسراء", en: "Al-Isra", fr: "Al-Isra" },
  { id: 18, ar: "الكهف", en: "Al-Kahf", fr: "Al-Kahf" },
  { id: 19, ar: "مريم", en: "Maryam", fr: "Maryam" },
  { id: 20, ar: "طه", en: "Taha", fr: "Ta-Ha" },
  { id: 21, ar: "الأنبياء", en: "Al-Anbiya", fr: "Al-Anbiya" },
  { id: 22, ar: "الحج", en: "Al-Hajj", fr: "Al-Hajj" },
  { id: 23, ar: "المؤمنون", en: "Al-Mu'minun", fr: "Al-Mu'minun" },
  { id: 24, ar: "النور", en: "An-Nur", fr: "An-Nur" },
  { id: 25, ar: "الفرقان", en: "Al-Furqan", fr: "Al-Furqan" },
  { id: 26, ar: "الشعراء", en: "Ash-Shu'ara", fr: "Ash-Shu'ara" },
  { id: 27, ar: "النمل", en: "An-Naml", fr: "An-Naml" },
  { id: 28, ar: "القصص", en: "Al-Qasas", fr: "Al-Qasas" },
  { id: 29, ar: "العنكبوت", en: "Al-Ankabut", fr: "Al-Ankabut" },
  { id: 30, ar: "الروم", en: "Ar-Rum", fr: "Ar-Rum" },
  { id: 31, ar: "لقمان", en: "Luqman", fr: "Luqman" },
  { id: 32, ar: "السجدة", en: "As-Sajdah", fr: "As-Sajda" },
  { id: 33, ar: "الأحزاب", en: "Al-Ahzab", fr: "Al-Ahzab" },
  { id: 34, ar: "سبأ", en: "Saba", fr: "Saba" },
  { id: 35, ar: "فاطر", en: "Fatir", fr: "Fatir" },
  { id: 36, ar: "يس", en: "Ya-Sin", fr: "Ya-Sin" },
  { id: 37, ar: "الصافات", en: "As-Saffat", fr: "As-Saffat" },
  { id: 38, ar: "ص", en: "Sad", fr: "Sad" },
  { id: 39, ar: "الزمر", en: "Az-Zumar", fr: "Az-Zumar" },
  { id: 40, ar: "غافر", en: "Ghafir", fr: "Ghafir" },
  { id: 41, ar: "فصلت", en: "Fussilat", fr: "Fussilat" },
  { id: 42, ar: "الشورى", en: "Ash-Shura", fr: "Ash-Shura" },
  { id: 43, ar: "الزخرف", en: "Az-Zukhruf", fr: "Az-Zukhruf" },
  { id: 44, ar: "الدخان", en: "Ad-Dukhan", fr: "Ad-Dukhan" },
  { id: 45, ar: "الجاثية", en: "Al-Jathiyah", fr: "Al-Jathiya" },
  { id: 46, ar: "الأحقاف", en: "Al-Ahqaf", fr: "Al-Ahqaf" },
  { id: 47, ar: "محمد", en: "Muhammad", fr: "Muhammad" },
  { id: 48, ar: "الفتح", en: "Al-Fath", fr: "Al-Fath" },
  { id: 49, ar: "الحجرات", en: "Al-Hujurat", fr: "Al-Hujurat" },
  { id: 50, ar: "ق", en: "Qaf", fr: "Qaf" },
  { id: 51, ar: "الذاريات", en: "Adh-Dhariyat", fr: "Adh-Dhariyat" },
  { id: 52, ar: "الطور", en: "At-Tur", fr: "At-Tur" },
  { id: 53, ar: "النجم", en: "An-Najm", fr: "An-Najm" },
  { id: 54, ar: "القمر", en: "Al-Qamar", fr: "Al-Qamar" },
  { id: 55, ar: "الرحمن", en: "Ar-Rahman", fr: "Ar-Rahman" },
  { id: 56, ar: "الواقعة", en: "Al-Waqi'ah", fr: "Al-Waqi'a" },
  { id: 57, ar: "الحديد", en: "Al-Hadid", fr: "Al-Hadid" },
  { id: 58, ar: "المجادلة", en: "Al-Mujadila", fr: "Al-Mujadila" },
  { id: 59, ar: "الحشر", en: "Al-Hashr", fr: "Al-Hashr" },
  { id: 60, ar: "الممتحنة", en: "Al-Mumtahanah", fr: "Al-Mumtahina" },
  { id: 61, ar: "الصف", en: "As-Saff", fr: "As-Saff" },
  { id: 62, ar: "الجمعة", en: "Al-Jumu'ah", fr: "Al-Jumu'a" },
  { id: 63, ar: "المنافقون", en: "Al-Munafiqun", fr: "Al-Munafiqun" },
  { id: 64, ar: "التغابن", en: "At-Taghabun", fr: "At-Taghabun" },
  { id: 65, ar: "الطلاق", en: "At-Talaq", fr: "At-Talaq" },
  { id: 66, ar: "التحريم", en: "At-Tahrim", fr: "At-Tahrim" },
  { id: 67, ar: "الملك", en: "Al-Mulk", fr: "Al-Mulk" },
  { id: 68, ar: "القلم", en: "Al-Qalam", fr: "Al-Qalam" },
  { id: 69, ar: "الحاقة", en: "Al-Haqqah", fr: "Al-Haqqa" },
  { id: 70, ar: "المعارج", en: "Al-Ma'arij", fr: "Al-Ma'arij" },
  { id: 71, ar: "نوح", en: "Nuh", fr: "Nuh" },
  { id: 72, ar: "الجن", en: "Al-Jinn", fr: "Al-Jinn" },
  { id: 73, ar: "المزمل", en: "Al-Muzzammil", fr: "Al-Muzzammil" },
  { id: 74, ar: "المدثر", en: "Al-Muddaththir", fr: "Al-Muddaththir" },
  { id: 75, ar: "القيامة", en: "Al-Qiyamah", fr: "Al-Qiyama" },
  { id: 76, ar: "الإنسان", en: "Al-Insan", fr: "Al-Insan" },
  { id: 77, ar: "المرسلات", en: "Al-Mursalat", fr: "Al-Mursalat" },
  { id: 78, ar: "النبأ", en: "An-Naba", fr: "An-Naba" },
  { id: 79, ar: "النازعات", en: "An-Nazi'at", fr: "An-Nazi'at" },
  { id: 80, ar: "عبس", en: "Abasa", fr: "Abasa" },
  { id: 81, ar: "التكوير", en: "At-Takwir", fr: "At-Takwir" },
  { id: 82, ar: "الانفطار", en: "Al-Infitar", fr: "Al-Infitar" },
  { id: 83, ar: "المطففين", en: "Al-Mutaffifin", fr: "Al-Mutaffifin" },
  { id: 84, ar: "الانشقاق", en: "Al-Inshiqaq", fr: "Al-Inshiqaq" },
  { id: 85, ar: "البروج", en: "Al-Buruj", fr: "Al-Buruj" },
  { id: 86, ar: "الطارق", en: "At-Tariq", fr: "At-Tariq" },
  { id: 87, ar: "الأعلى", en: "Al-A'la", fr: "Al-A'la" },
  { id: 88, ar: "الغاشية", en: "Al-Ghashiyah", fr: "Al-Ghashiya" },
  { id: 89, ar: "الفجر", en: "Al-Fajr", fr: "Al-Fajr" },
  { id: 90, ar: "البلد", en: "Al-Balad", fr: "Al-Balad" },
  { id: 91, ar: "الشمس", en: "Ash-Shams", fr: "Ash-Shams" },
  { id: 92, ar: "الليل", en: "Al-Lail", fr: "Al-Lail" },
  { id: 93, ar: "الضحى", en: "Ad-Duha", fr: "Ad-Duha" },
  { id: 94, ar: "الشرح", en: "Ash-Sharh", fr: "Ash-Sharh" },
  { id: 95, ar: "التين", en: "At-Tin", fr: "At-Tin" },
  { id: 96, ar: "العلق", en: "Al-Alaq", fr: "Al-Alaq" },
  { id: 97, ar: "القدر", en: "Al-Qadr", fr: "Al-Qadr" },
  { id: 98, ar: "البينة", en: "Al-Bayyinah", fr: "Al-Bayyina" },
  { id: 99, ar: "الزلزلة", en: "Az-Zalzalah", fr: "Az-Zalzala" },
  { id: 100, ar: "العاديات", en: "Al-Adiyat", fr: "Al-Adiyat" },
  { id: 101, ar: "القارعة", en: "Al-Qari'ah", fr: "Al-Qari'a" },
  { id: 102, ar: "التكاثر", en: "At-Takathur", fr: "At-Takathur" },
  { id: 103, ar: "العصر", en: "Al-Asr", fr: "Al-Asr" },
  { id: 104, ar: "الهمزة", en: "Al-Humazah", fr: "Al-Humaza" },
  { id: 105, ar: "الفيل", en: "Al-Fil", fr: "Al-Fil" },
  { id: 106, ar: "قريش", en: "Quraysh", fr: "Quraysh" },
  { id: 107, ar: "الماعون", en: "Al-Ma'un", fr: "Al-Ma'un" },
  { id: 108, ar: "الكوثر", en: "Al-Kawthar", fr: "Al-Kawthar" },
  { id: 109, ar: "الكافرون", en: "Al-Kafirun", fr: "Al-Kafirun" },
  { id: 110, ar: "النصر", en: "An-Nasr", fr: "An-Nasr" },
  { id: 111, ar: "المسد", en: "Al-Masad", fr: "Al-Masad" },
  { id: 112, ar: "الإخلاص", en: "Al-Ikhlas", fr: "Al-Ikhlas" },
  { id: 113, ar: "الفلق", en: "Al-Falaq", fr: "Al-Falaq" },
  { id: 114, ar: "الناس", en: "An-Nas", fr: "An-Nas" }
];

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

  const getSurahName = (surah: typeof ALL_SURAHS[0]) => {
     if (language === 'ar') return surah.ar;
     if (language === 'fr') return surah.fr;
     return surah.en;
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                 {ALL_SURAHS.map((surah) => (
                    <button
                      key={surah.id}
                      onClick={() => handleSearch(language === 'ar' ? `سورة ${surah.ar}` : `Surah ${surah.en}`)}
                      className="px-3 py-3 bg-white border border-slate-100 rounded-xl text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all text-sm flex items-center gap-2 text-start"
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-full text-[10px] text-slate-400 font-bold border border-slate-100 shrink-0">
                        {surah.id}
                      </span>
                      <span className="font-quran text-base truncate">
                        {getSurahName(surah)}
                      </span>
                    </button>
                 ))}
              </div>
            )}

            {/* Quick Tip */}
            {activeTab === 'topics' && (
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
            )}
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