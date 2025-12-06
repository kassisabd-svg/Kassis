import React, { useState, useEffect } from 'react';
import { Moon, Bell, Shield, HelpCircle, ChevronLeft, ChevronDown, ChevronUp, Check, Sun, Type } from 'lucide-react';
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
  const { t, dir, fontSize, setFontSize, language } = useLanguage();
  
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

  const shareApp = (platform: 'facebook' | 'whatsapp' | 'instagram') => {
    const url = window.location.href;
    const text = `Check out Al-Bayan Islamic App: ${url}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        // Instagram does not have a direct web share link for posts, so we copy the link
        navigator.clipboard.writeText(url);
        alert(t.common.copied);
        break;
    }
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

       {/* Share App Section */}
       <div className="mt-8 flex flex-col items-center">
         <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">{t.settings.shareApp}</span>
         <div className="flex items-center justify-center gap-6">
           {/* Facebook */}
           <button 
             onClick={() => shareApp('facebook')}
             className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform"
             title="Facebook"
           >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
             </svg>
           </button>
           
           {/* WhatsApp */}
           <button 
             onClick={() => shareApp('whatsapp')}
             className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 hover:scale-110 transition-transform"
             title="WhatsApp"
           >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
             </svg>
           </button>

           {/* Instagram */}
           <button 
             onClick={() => shareApp('instagram')}
             className="w-12 h-12 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-500/30 hover:scale-110 transition-transform"
             title="Instagram"
           >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
             </svg>
           </button>
         </div>
       </div>

      <div className="text-center text-slate-400 text-xs mt-8 pb-8">
        <p>{t.settings.version}</p>
        <p className="mt-2 opacity-80 font-medium">
           {language === 'ar' ? 'المطور: K.Abdennour' : (language === 'fr' ? 'Développeur : K.Abdennour' : 'Developer: K.Abdennour')}
        </p>
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