import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ChatInterface } from './components/ChatInterface';
import { HomeView } from './components/HomeView';
import { SettingsView } from './components/SettingsView';
import { HadithView } from './components/HadithView';
import { CalendarView } from './components/CalendarView';
import { QuranView } from './components/QuranView';
import { FatwaView } from './components/FatwaView';
import { SunnahView } from './components/SunnahView';
import { HistoryView } from './components/HistoryView';
import { AppView, QueryMode } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [initialChatQuery, setInitialChatQuery] = useState<{text: string, mode: QueryMode} | undefined>(undefined);
  const { dir } = useLanguage();
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleTopicSelection = (text: string, mode: QueryMode) => {
    setInitialChatQuery({ text, mode });
  };

  const handleGlobalSearch = (query: string) => {
    setInitialChatQuery({ text: query, mode: QueryMode.GENERAL });
    setCurrentView(AppView.CHAT);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return <HomeView onNavigate={setCurrentView} onTopicClick={handleTopicSelection} />;
      case AppView.CHAT:
         return <ChatInterface initialMode={initialChatQuery?.mode || QueryMode.GENERAL} initialQuery={initialChatQuery?.text} />;
      case AppView.QURAN:
        return <QuranView initialQuery={initialChatQuery?.text} />;
      case AppView.HADITH:
        return <HadithView initialQuery={initialChatQuery?.text} />;
      case AppView.SUNNAH:
        return <SunnahView initialQuery={initialChatQuery?.text} />;
      case AppView.HISTORY:
        return <HistoryView initialQuery={initialChatQuery?.text} />;
      case AppView.FATWA:
        return <FatwaView initialQuery={initialChatQuery?.text} />;
      case AppView.CALENDAR:
        return <CalendarView />;
      case AppView.SETTINGS:
        return <SettingsView isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className={`min-h-screen bg-islamic-pattern text-slate-900 dark:text-slate-100 font-sans pb-20 relative overflow-hidden transition-colors duration-300`} dir={dir}>
      {/* Decorative ambient gradients - Adjusted for Dark Mode */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/40 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-50/60 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      
      <div className="relative z-10">
        <Header onNavigate={setCurrentView} onSearch={handleGlobalSearch} />
        <main className="max-w-md mx-auto min-h-[calc(100vh-4rem)]">
          {renderContent()}
        </main>
        <Navigation currentView={currentView} setView={setCurrentView} />
      </div>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;