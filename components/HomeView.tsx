import React, { useEffect, useState } from 'react';
import { BookOpen, Scale, Heart, ChevronLeft, ScrollText, Clock, Trash2, ChevronDown, X, Library, Hourglass, GraduationCap } from 'lucide-react';
import { AppView, QueryMode, Language } from '../types';
import { getHistory, HistoryItem, clearHistory, removeFromHistory } from '../utils/historyUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onTopicClick?: (text: string, mode: QueryMode) => void;
}

interface Verse {
  text: string;
  surah: string;
  ayah: number;
}

const VERSES_LIST: Verse[] = [
  { text: "وَقُل رَّبِّ زِدْنِي عِلْمًا", surah: "طه", ayah: 114 },
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", surah: "الشرح", ayah: 6 },
  { text: "فَاصْبِرْ صَبْرًا جَمِيلًا", surah: "المعارج", ayah: 5 },
  { text: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ", surah: "البقرة", ayah: 186 },
  { text: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", surah: "طه", ayah: 25 },
  { text: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى", surah: "الضحى", ayah: 5 },
  { text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", surah: "البقرة", ayah: 286 },
  { text: "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا", surah: "التوبة", ayah: 51 },
  { text: "وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ", surah: "البقرة", ayah: 195 },
  { text: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", surah: "الرحمن", ayah: 13 }
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onTopicClick }) => {
  const [dailyVerse, setDailyVerse] = useState<Verse>(VERSES_LIST[0]);
  const [isLiked, setIsLiked] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const { t, language, setLanguage, dir } = useLanguage();

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('albayan_verse_date');
    
    let verseIndex = 0;

    if (storedDate === today) {
      const storedIndex = localStorage.getItem('albayan_verse_index');
      if (storedIndex) {
        verseIndex = parseInt(storedIndex, 10);
      }
      const likedStatus = localStorage.getItem('albayan_verse_liked');
      setIsLiked(likedStatus === 'true');
    } else {
      verseIndex = Math.floor(Math.random() * VERSES_LIST.length);
      localStorage.setItem('albayan_verse_date', today);
      localStorage.setItem('albayan_verse_index', verseIndex.toString());
      localStorage.setItem('albayan_verse_liked', 'false'); 
      setIsLiked(false);
    }

    setDailyVerse(VERSES_LIST[verseIndex]);
    setHistory(getHistory());
  }, [language, t]); 

  const toggleLike = () => {
    const newState = !isLiked;
    setIsLiked(newState);
    localStorage.setItem('albayan_verse_liked', newState.toString());
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleRemoveItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromHistory(id);
    setHistory(getHistory());
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  const languagesConfig = [
    { code: 'ar', label: 'العربية', flagUrl: 'https://flagcdn.com/w40/sa.png' },
    { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w40/us.png' },
    { code: 'fr', label: 'Français', flagUrl: 'https://flagcdn.com/w40/fr.png' },
  ];

  const currentLangConfig = languagesConfig.find(l => l.code === language) || languagesConfig[0];

  const features = [
    {
      title: t.home.fatwaTitle,
      desc: t.home.fatwaDesc,
      icon: Scale,
      color: 'bg-amber-100/90 text-amber-700',
      action: () => onNavigate(AppView.FATWA) 
    },
    {
      title: t.home.quranTitle,
      desc: t.home.quranDesc,
      icon: BookOpen,
      color: 'bg-emerald-100/90 text-emerald-700',
      action: () => onNavigate(AppView.QURAN)
    },
    {
      title: t.home.sunnahTitle,
      desc: t.home.sunnahDesc,
      icon: Library,
      color: 'bg-indigo-100/90 text-indigo-700',
      action: () => onNavigate(AppView.SUNNAH)
    },
    {
      title: t.home.historyTitle,
      desc: t.home.historyDesc,
      icon: Hourglass,
      color: 'bg-stone-100/90 text-stone-700',
      action: () => onNavigate(AppView.HISTORY)
    },
    {
      title: t.home.hadithTitle,
      desc: t.home.hadithDesc,
      icon: ScrollText,
      color: 'bg-blue-100/90 text-blue-700',
      action: () => onNavigate(AppView.HADITH)
    },
    {
      title: t.home.scholarsTitle,
      desc: t.home.scholarsDesc,
      icon: GraduationCap,
      color: 'bg-cyan-100/90 text-cyan-700',
      action: () => onNavigate(AppView.SCHOLARS)
    }
  ];

  const handleHistoryClick = (item: HistoryItem) => {
    if (onTopicClick) {
      onTopicClick(item.text, item.mode);
    }
    if (item.mode === QueryMode.QURAN) onNavigate(AppView.QURAN);
    else if (item.mode === QueryMode.HADITH) onNavigate(AppView.HADITH);
    else if (item.mode === QueryMode.FATWA) onNavigate(AppView.FATWA);
    else if (item.mode === QueryMode.SUNNAH) onNavigate(AppView.SUNNAH);
    else if (item.mode === QueryMode.HISTORY) onNavigate(AppView.HISTORY);
    else if (item.mode === QueryMode.SCHOLARS) onNavigate(AppView.SCHOLARS);
    else onNavigate(AppView.CHAT);
  };

  const getModeLabel = (mode: QueryMode) => {
    switch(mode) {
      case QueryMode.FATWA: return t.chat.modes.fatwa;
      case QueryMode.QURAN: return t.chat.modes.quran;
      case QueryMode.HADITH: return t.chat.modes.hadith;
      case QueryMode.SUNNAH: return t.chat.modes.sunnah;
      case QueryMode.HISTORY: return t.chat.modes.history;
      case QueryMode.SCHOLARS: return t.chat.modes.scholars;
      default: return t.chat.modes.general;
    }
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      {/* Background with Specific Islamic Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src="https://img.freepik.com/free-vector/gradient-islamic-pattern-background_52683-118838.jpg?t=st=1710520000~exp=1710523600~hmac=abc123456" 
            alt="Islamic Background" 
            className="w-full h-full object-cover opacity-0"
          />
          {/* Reverting to pattern by hiding image opacity to 0 but keeping structure to avoid breaking layout logic if any */}
      </div>
      
      {/* Language Toggle Row */}
      <div className="flex justify-end relative z-30">
         <button 
           onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
           className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 hover:bg-slate-50 dark:hover:bg-slate-700"
         >
            <img 
              src={currentLangConfig.flagUrl} 
              alt={currentLangConfig.label} 
              className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm"
            />
            <span>{currentLangConfig.label}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
         </button>

         {isLanguageMenuOpen && (
           <>
             <div 
               className="fixed inset-0 z-40" 
               onClick={() => setIsLanguageMenuOpen(false)}
             ></div>
             <div className={`absolute top-full mt-2 ${dir === 'rtl' ? 'left-0' : 'right-0'} bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 min-w-[140px] z-50 animate-in fade-in zoom-in-95 duration-200`}>
                {languagesConfig.map((langItem) => (
                  <button
                    key={langItem.code}
                    onClick={() => handleLanguageSelect(langItem.code as Language)}
                    className={`w-full text-start px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-700/50 flex items-center gap-3 text-sm transition-colors ${language === langItem.code ? 'bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    <img 
                      src={langItem.flagUrl} 
                      alt={langItem.label} 
                      className="w-6 h-4 object-cover rounded-[2px] shadow-sm"
                    />
                    <span>{langItem.label}</span>
                  </button>
                ))}
             </div>
           </>
         )}
      </div>

      {/* Daily Verse/Quote Card */}
      <div className="bg-emerald-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-500 group z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:opacity-10 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400 opacity-10 rounded-full -ml-8 -mb-8 blur-xl"></div>
        
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-3 backdrop-blur-sm">
            {t.common.verseOfDay}
          </span>
          <p className="font-quran text-2xl leading-loose mb-4 animate-in fade-in duration-700 drop-shadow-sm" dir="rtl">
            ﴿{dailyVerse.text}﴾
          </p>
          <div className="flex justify-between items-end">
             <span className="text-emerald-100 text-sm font-medium">
               {language === 'ar' ? `سورة ${dailyVerse.surah} - الآية ${dailyVerse.ayah}` : `Surah ${dailyVerse.surah} : ${dailyVerse.ayah}`}
             </span>
             <button 
                onClick={toggleLike}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-all active:scale-90"
             >
                <Heart 
                  size={20} 
                  className={`transition-colors duration-300 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                />
             </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="relative z-10">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 px-1 flex items-center gap-2">
           <span>{t.common.explore}</span>
           <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, idx) => (
            <button
              key={idx}
              onClick={feature.action}
              className={`bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-start text-start hover:shadow-lg transition-all active:scale-95 hover:border-emerald-200 dark:hover:border-emerald-800 group`}
            >
              <div className={`p-3 rounded-xl mb-3 ${feature.color} transition-transform group-hover:scale-110 duration-300`}>
                <feature.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{feature.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4 px-1">
             <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.common.recent}</h2>
             {history.length > 0 && (
               <button 
                 onClick={handleClearHistory}
                 className="text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-full transition-colors"
                 title={t.common.clearHistory}
               >
                  <Trash2 size={16} />
               </button>
             )}
        </div>
        
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
              <Clock className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
              <p className="text-slate-400 dark:text-slate-500 text-sm">{t.common.noHistory}</p>
            </div>
          ) : (
            history.map((item) => (
               <div 
                 key={item.id} 
                 onClick={() => handleHistoryClick(item)}
                 className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 relative"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                        <Clock size={18} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-1">{item.text}</span>
                        <div className="flex gap-2 text-[10px] text-slate-400">
                          <span className="bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300">{getModeLabel(item.mode)}</span>
                          <span>{new Date(item.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleRemoveItem(e, item.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors z-10"
                        title="Delete"
                      >
                         <X size={16} />
                      </button>
                      {dir === 'rtl' ? <ChevronLeft size={16} className="text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" /> : <ChevronLeft size={16} className="text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors rotate-180" />}
                  </div>
               </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};