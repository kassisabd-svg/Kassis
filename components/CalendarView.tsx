import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, MapPin, Clock, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export const CalendarView: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const today = new Date();
  
  // Determine locale based on language
  let locale = 'ar-SA';
  if (language === 'en') locale = 'en-US';
  if (language === 'fr') locale = 'fr-FR';

  // Formatters for Hijri Date
  const hijriFormatter = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const hijriDayFormatter = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, {
    day: 'numeric'
  });

  const hijriDateString = hijriFormatter.format(today);
  
  // State for prayer times and location
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('Location');

  // Mock events for demonstration
  const events = [
    { title: language === 'ar' ? 'بداية شهر رمضان' : (language === 'fr' ? 'Début du Ramadan' : 'Ramadan Start'), date: '1 Ramadan 1446', daysLeft: 22 },
    { title: language === 'ar' ? 'عيد الفطر المبارك' : (language === 'fr' ? 'Aïd al-Fitr' : 'Eid Al-Fitr'), date: '1 Shawwal 1446', daysLeft: 52 },
  ];

  useEffect(() => {
    fetchLocationAndTimes();
  }, [language]);

  const fetchLocationAndTimes = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(t.calendar.locationPermission);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Using Aladhan API for accurate prayer times
          const dateStr = Math.floor(Date.now() / 1000); // Unix timestamp
          const response = await fetch(
            `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=4`
          );

          const data = await response.json();
          if (data && data.data && data.data.timings) {
             setPrayerTimes(data.data.timings);
          } else {
             throw new Error('Failed to fetch');
          }
        } catch (err) {
          setError(t.common.error);
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(t.calendar.locationPermission);
        setLoading(false);
      }
    );
  };

  const getArabicTimeName = (key: string) => {
    // @ts-ignore
    return t.calendar.times[key] || key;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar px-4 py-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 px-1">{t.calendar.title}</h2>

      {/* Today's Card */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-3xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-amber-400 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className="text-purple-200 text-sm font-medium mb-2">{t.calendar.today}</span>
          <h1 className="font-quran text-4xl font-bold mb-2">{hijriDayFormatter.format(today)}</h1>
          <p className="text-xl opacity-90 mb-4">{hijriDateString}</p>
          
          <div className="w-full h-px bg-white/20 mb-4"></div>
          
          <div className="flex justify-between w-full text-sm">
            <div className="flex items-center gap-2">
               <CalendarIcon size={16} />
               <span>{today.toLocaleDateString(language === 'ar' ? 'ar-EG' : (language === 'fr' ? 'fr-FR' : 'en-US'))}</span>
            </div>
            <div className="flex items-center gap-2">
               <Clock size={16} />
               <span>{today.toLocaleTimeString(language === 'ar' ? 'ar-EG' : (language === 'fr' ? 'fr-FR' : 'en-US'), { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Times Section */}
      <div className="mb-6">
         <div className="flex justify-between items-center mb-3 px-1">
             <h3 className="font-bold text-slate-700">{t.calendar.prayerTimes}</h3>
         </div>

         {loading ? (
           <div className="flex flex-col items-center justify-center py-8 bg-white rounded-2xl border border-slate-100">
             <Loader2 size={24} className="text-purple-600 animate-spin mb-2" />
             <span className="text-xs text-slate-400">{t.calendar.locating}</span>
           </div>
         ) : error ? (
            <div className="flex flex-col items-center justify-center py-6 bg-red-50 rounded-2xl border border-red-100 text-center px-4">
              <span className="text-red-500 font-medium text-sm mb-2">{error}</span>
              <button 
                onClick={fetchLocationAndTimes}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs text-slate-600 shadow-sm border border-slate-200"
              >
                <RefreshCw size={12} />
                <span>{t.common.retry}</span>
              </button>
            </div>
         ) : prayerTimes ? (
            <div className="grid grid-cols-3 gap-3">
                {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => (
                  <div key={key} className={`rounded-2xl p-3 flex flex-col items-center justify-center border transition-all ${
                     key === 'Dhuhr' ? 'bg-purple-600 text-white shadow-md border-purple-600' : 'bg-white text-slate-600 border-slate-100 hover:border-purple-200'
                  }`}>
                     <span className={`text-[10px] mb-1 ${key === 'Dhuhr' ? 'text-purple-100' : 'text-slate-400'}`}>
                        {getArabicTimeName(key)}
                     </span>
                     <span className="font-bold font-sans text-sm" dir="ltr">
                        {prayerTimes[key as keyof PrayerTimes]}
                     </span>
                  </div>
                ))}
            </div>
         ) : null}
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="font-bold text-slate-700 mb-3 px-1">{t.calendar.upcomingEvents}</h3>
        <div className="space-y-3">
          {events.map((event, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-purple-50 flex flex-col items-center justify-center text-purple-600 border border-purple-100">
                    <span className="text-xs font-bold">{event.daysLeft}</span>
                    <span className="text-[9px]">{t.calendar.day}</span>
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 text-sm">{event.title}</h4>
                    <span className="text-xs text-slate-500">{event.date}</span>
                 </div>
              </div>
              <ChevronLeft size={18} className={`text-slate-300 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};