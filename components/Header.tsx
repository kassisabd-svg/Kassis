import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, X, Inbox, ArrowRight, ArrowLeft, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppView } from '../types';

interface HeaderProps {
  onNavigate: (view: AppView) => void;
  onSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onSearch }) => {
  const { t, dir } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notifRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleNotifToggle = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  return (
    <>
      <header className="sticky top-0 bg-emerald-600/95 dark:bg-emerald-900/90 backdrop-blur-md text-white shadow-sm z-40 h-16 flex items-center justify-between px-4 border-b border-white/10 supports-[backdrop-filter]:bg-emerald-600/85 transition-colors duration-300">
        <div className="flex items-center">
          <div className="px-5 py-1.5 bg-white/15 rounded-full border border-white/20 backdrop-blur-sm shadow-inner transition-all hover:bg-white/20 cursor-default">
             <h1 className="text-lg font-bold tracking-wide drop-shadow-sm text-white">{t.common.appName}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Search size={20} />
          </button>
          
          <div className="relative" ref={notifRef}>
            <button 
              onClick={handleNotifToggle}
              className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full border border-emerald-600 shadow-sm"></span>
            </button>

            {/* Notifications Dropdown */}
            {isNotifOpen && (
              <div className={`absolute top-full mt-2 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-200`}>
                 <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t.settings.notifications}</span>
                    <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                       <X size={16} />
                    </button>
                 </div>
                 
                 <div className="py-2 max-h-80 overflow-y-auto no-scrollbar">
                    {/* Share App Notification */}
                    <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700 last:border-0 transition-colors cursor-pointer">
                       <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                             <HeartHandshake size={16} />
                          </div>
                          <div>
                             <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-snug">
                                {t.common.shareAppNotification}
                             </p>
                             <span className="text-[10px] text-slate-400 mt-1 block">{t.common.justNow}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
           <div 
             className="fixed inset-0"
             onClick={() => setIsSearchOpen(false)}
           ></div>
           
           <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in slide-in-from-top-4 duration-300">
              <form onSubmit={handleSearchSubmit} className="relative">
                 <input 
                   ref={inputRef}
                   type="text"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder={t.common.typeToSearch}
                   className="w-full py-6 pl-14 pr-16 bg-transparent text-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                 />
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                 
                 {searchQuery ? (
                    <button 
                      type="submit"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors"
                    >
                      {dir === 'rtl' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                    </button>
                 ) : (
                    <button 
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-2"
                    >
                      <span className="text-xs font-bold border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-md">ESC</span>
                    </button>
                 )}
              </form>
              <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-400">
                 <span>{t.common.startSearch}</span>
                 <span className="font-mono opacity-50">Enter ↵</span>
              </div>
           </div>
        </div>
      )}
    </>
  );
};