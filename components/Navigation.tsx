import React from 'react';
import { Home, MessageCircle, BookOpen, Settings, ScrollText } from 'lucide-react';
import { AppView } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const { t } = useLanguage();

  const navItems = [
    { view: AppView.HOME, icon: Home, label: t.nav.home },
    { view: AppView.QURAN, icon: BookOpen, label: t.nav.quran },
    { view: AppView.HADITH, icon: ScrollText, label: t.nav.hadith },
    { view: AppView.CHAT, icon: MessageCircle, label: t.nav.chat },
    { view: AppView.SETTINGS, icon: Settings, label: t.nav.settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none z-50 transition-colors duration-300">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center w-14 transition-all duration-300 ${
                isActive ? 'text-emerald-600 dark:text-emerald-400 -translate-y-1' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-transparent'}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};