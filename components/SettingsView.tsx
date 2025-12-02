import React, { useState, useEffect } from 'react';
import { Moon, Bell, Shield, HelpCircle, ChevronLeft, LogOut, ChevronDown, ChevronUp, Check, Sun, Type } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { FontSize } from '../types';

interface SettingsViewProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

type SettingsPage = 'MAIN' | 'PRIVACY' | 'FAQ';

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, toggleTheme }) => {
  const [activePage, setActivePage] = useState<SettingsPage>('MAIN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { t, dir, fontSize, setFontSize } = useLanguage();
  
  // Accordion state for FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const storedNotif = localStorage.getItem('albayan_notifications');
    setNotificationsEnabled(storedNotif === 'true');
  }, []);

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('albayan_notifications', newState.toString());
    
    if (newState && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = t.settings.faqList || [];

  // Render Functions for Sub-pages
  const renderPrivacyPolicy = () => (
    <div className={`animate-in slide-in-from-${dir === 'rtl' ? 'left' : 'right'} duration-300`}>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setActivePage('MAIN')} className="p-2 -mr-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">
          <ChevronUp className="rotate-90" size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.settings.privacy}</h2>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="whitespace-pre-line">{t.settings.privacyPolicy}</p>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className={`animate-in slide-in-from-${dir === 'rtl' ? 'left' : 'right'} duration-300`}>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setActivePage('MAIN')} className="p-2 -mr-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">
          <ChevronUp className="rotate-90" size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.settings.faq}</h2>
      </div>

      <div className="space-y-3">
        {faqItems.map((item: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm transition-all">
            <button 
              onClick={() => handleFaqToggle(idx)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-start"
            >
              <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.q}</span>
              {openFaqIndex === idx ? <ChevronDown size={18} className="text-emerald-600" /> : <ChevronLeft size={18} className={`text-slate-400 ${dir === 'ltr' ? 'rotate-180' : ''}`} />}
            </button>
            
            {openFaqIndex === idx && (
              <div className="p-4 pt-0 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl text-center border border-emerald-100 dark:border-emerald-800">
        <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-2">{t.settings.notFound}</p>
        <a 
          href="mailto:Abdennour.kassis@gmail.com"
          className="inline-block text-xs font-bold bg-white dark:bg-slate-800 text-emerald-600 px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
        >
          {t.settings.contactSupport}
        </a>
      </div>
    </div>
  );

  const renderMainSettings = () => (
    <div className="animate-in fade-in duration-300 space-y-6">
       <h2 className="text-2xl font-bold text-slate-800 dark:text-white px-1">{t.settings.title}</h2>

       {/* General Section */}
       <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 px-1">{t.settings.general}</h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700">
               <div className="flex items-center gap-3">
                  <div className="text-slate-500 dark:text-slate-400">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{t.settings.darkMode}</span>
               </div>
               <button 
                 onClick={toggleTheme}
                 className={`w-12 h-7 rounded-full relative transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-600'}`}
               >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${isDarkMode ? (dir === 'rtl' ? 'left-1 translate-x-0' : 'right-1 translate-x-0') : (dir === 'rtl' ? 'left-1 translate-x-5' : 'right-1 -translate-x-5')}`}></div>
               </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700">
               <div className="flex items-center gap-3">
                  <div className="text-slate-500 dark:text-slate-400">
                    <Bell size={20} />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{t.settings.notifications}</span>
               </div>
               <button 
                 onClick={toggleNotifications}
                 className={`w-12 h-7 rounded-full relative transition-colors duration-300 focus:outline-none ${notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-600'}`}
               >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${notificationsEnabled ? (dir === 'rtl' ? 'left-1 translate-x-0' : 'right-1 translate-x-0') : (dir === 'rtl' ? 'left-1 translate-x-5' : 'right-1 -translate-x-5')}`}></div>
               </button>
            </div>

             {/* Font Size Control */}
             <div className="p-4">
               <div className="flex items-center gap-3 mb-3">
                  <div className="text-slate-500 dark:text-slate-400">
                    <Type size={20} />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{t.settings.fontSize}</span>
               </div>
               <div className="flex gap-2 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl">
                 {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        fontSize === size 
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                          : 'text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {size === 'small' && t.settings.fontSizeSmall}
                      {size === 'medium' && t.settings.fontSizeMedium}
                      {size === 'large' && t.settings.fontSizeLarge}
                      {size === 'xlarge' && t.settings.fontSizeXLarge}
                    </button>
                 ))}
               </div>
            </div>

          </div>
       </div>

       {/* Support Section */}
       <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 px-1">{t.settings.support}</h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
            
            <button 
              onClick={() => setActivePage('PRIVACY')}
              className="w-full flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
               <div className="flex items-center gap-3">
                  <div className="text-slate-500 dark:text-slate-400"><Shield size={20} /></div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{t.settings.privacy}</span>
               </div>
               <ChevronLeft size={18} className={`text-slate-300 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
            </button>

            <button 
              onClick={() => setActivePage('FAQ')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
               <div className="flex items-center gap-3">
                  <div className="text-slate-500 dark:text-slate-400"><HelpCircle size={20} /></div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{t.settings.faq}</span>
               </div>
               <ChevronLeft size={18} className={`text-slate-300 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
            </button>

          </div>
       </div>

       <button className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center justify-center gap-2 font-medium mt-8 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-transparent dark:border-red-900/30">
        <LogOut size={20} />
        <span>{t.settings.logout}</span>
      </button>

      <div className="text-center text-slate-400 text-xs mt-8 pb-4">
        {t.settings.version}
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6">
      {activePage === 'MAIN' && renderMainSettings()}
      {activePage === 'PRIVACY' && renderPrivacyPolicy()}
      {activePage === 'FAQ' && renderFAQ()}
    </div>
  );
};