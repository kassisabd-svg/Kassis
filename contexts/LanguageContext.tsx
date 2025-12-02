import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, FontSize } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  t: any;
  dir: 'rtl' | 'ltr';
}

const translations = {
  ar: {
    common: {
      appName: 'البيان',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      copy: 'نسخ',
      share: 'مشاركة',
      copied: 'تم النسخ',
      search: 'بحث',
      more: 'المزيد',
      less: 'أقل',
      explore: 'اختر من القائمة',
      recent: 'موضوعات تم الاطلاع عليها',
      clearHistory: 'مسح السجل',
      noHistory: 'لا يوجد سجل بحث حديث',
      back: 'رجوع',
      retry: 'إعادة المحاولة',
      readMore: 'اقرأ المزيد',
      source: 'المصدر',
      narrator: 'الراوي',
      grade: 'الدرجة',
      interpretation: 'التفسير',
      verseOfDay: 'آية اليوم',
      hadithOfDay: 'حديث اليوم',
      shareText: 'مشاركة النص',
      searchPlaceholder: 'اكتب سؤالك هنا...',
      noNotifications: 'لا توجد إشعارات حالياً',
      typeToSearch: 'اكتب ما تبحث عنه...',
      startSearch: 'ابدأ البحث',
    },
    nav: {
      home: 'الرئيسية',
      quran: 'القرآن',
      hadith: 'الحديث',
      chat: 'المساعد',
      settings: 'الإعدادات',
    },
    home: {
      fatwaTitle: 'الفتاوى والأحكام',
      fatwaDesc: 'فتاوى مصنفة حسب الأبواب الفقهية',
      quranTitle: 'القرآن الكريم',
      quranDesc: 'بحث وتفسير الآيات',
      hadithTitle: 'البحث في الحديث',
      hadithDesc: 'التحقق من صحة الأحاديث',
      sunnahTitle: 'السنن النبوية',
      sunnahDesc: 'أبواب السنة المطهرة (عبادات، معاملات، أخلاق)',
      historyTitle: 'فقه التاريخ الإسلامي',
      historyDesc: 'أحداث التاريخ من المصادر المعتمدة',
      calendarTitle: 'التقويم ومواقيت الصلاة',
      calendarDesc: 'مواقيت الصلاة حسب الموقع',
    },
    chat: {
      welcome: 'أهلاً بك. أنا مساعدك الإسلامي "البيان". يمكنك سؤالي عن الفتاوى، أو البحث في القرآن الكريم، أو السنن النبوية. كيف يمكنني خدمتك اليوم؟',
      modes: {
        general: 'عام',
        fatwa: 'الفتاوى',
        quran: 'القرآن',
        hadith: 'الحديث',
        sunnah: 'السنن',
        history: 'التاريخ',
      },
      placeholders: {
        general: 'اكتب سؤالك هنا...',
        fatwa: 'اسأل عن حكم شرعي...',
        quran: 'ابحث عن آية أو موضوع...',
        hadith: 'تحقق من صحة حديث...',
        sunnah: 'ابحث في أبواب السنة...',
        history: 'ابحث في التاريخ الإسلامي...',
      }
    },
    quran: {
      searchPlaceholder: 'ابحث عن آية، كلمة، أو موضوع...',
      tabTopics: 'المواضيع',
      tabSurahs: 'السور',
      tipTitle: 'نصيحة بحث',
      tipText: 'جرب البحث عن كلمات محددة مثل "الصبر" أو "الرحمة"، أو ابحث عن موضوع كامل مثل "كيفية تقسيم الميراث".',
      topics: {
        prophets: 'قصص الأنبياء',
        judgment: 'يوم القيامة',
        ethics: 'الأخلاق والآداب',
        worship: 'العبادات',
        parents: 'بر الوالدين',
        patience: 'الصبر',
        sustenance: 'الرزق',
        supplication: 'الدعاء',
      }
    },
    hadith: {
      searchPlaceholder: 'ابحث في صحيح البخاري ومسلم...',
      topicsTitle: 'تصفح حسب الموضوع',
      verified: 'موثق',
      sourceNote: 'جميع الأحاديث مستخرجة من الكتب الستة المعتمدة',
      topics: {
        ethics: 'الأخلاق',
        prayer: 'الصلاة',
        patience: 'الصبر',
        charity: 'الصدقة',
        parents: 'بر الوالدين',
        repentance: 'التوبة',
        knowledge: 'العلم',
        dhikr: 'الذكر',
      }
    },
    sunnah: {
        title: 'السنن النبوية',
        searchPlaceholder: 'ابحث في أبواب السنة (مثل: سنن الوضوء)...',
        chaptersTitle: 'أبواب السنة',
        chapters: {
            iman: 'كتاب الإيمان',
            tahara: 'كتاب الطهارة',
            salah: 'كتاب الصلاة',
            zakat: 'كتاب الزكاة',
            siyam: 'كتاب الصيام',
            hajj: 'كتاب الحج',
            nikah: 'كتاب النكاح',
            adab: 'كتاب الأدب',
            fitan: 'كتاب الفتن',
            riqaq: 'كتاب الرقاق'
        }
    },
    history: {
      title: 'فقه التاريخ الإسلامي',
      searchPlaceholder: 'ابحث عن حدث تاريخي أو شخصية...',
      chaptersTitle: 'الحقب التاريخية',
      chapters: {
        seerah: 'السيرة النبوية',
        caliphs: 'الخلفاء الراشدون',
        umayyads: 'الدولة الأموية',
        abbasids: 'الدولة العباسية',
        andalus: 'تاريخ الأندلس',
        companions: 'سير الصحابة',
        conquests: 'الفتوحات الإسلامية',
        ottomans: 'الدولة العثمانية',
      }
    },
    fatwa: {
      searchPlaceholder: 'ابحث عن مسألة فقهية...',
      categoriesTitle: 'أقسام الفقه',
      disclaimer: 'تنبيه: هذه الفتوى إرشادية وتعتمد على المعلومات المقدمة، في القضايا الحساسة يرجى مراجعة دار الإفتاء الرسمية.',
      contemporary: 'فقه النوازل',
      contemporaryDesc: 'تعرف على أحكام القضايا المعاصرة مثل العملات الرقمية، الذكاء الاصطناعي، وأحكام المغتربين.',
      exploreNow: 'استكشف الآن',
      categories: {
        tahara: 'الطهارة',
        salah: 'الصلاة',
        zakat: 'الزكاة',
        siyam: 'الصيام',
        family: 'الأسرة',
        trade: 'المعاملات',
        adab: 'الآداب',
        oaths: 'الأيمان',
      }
    },
    calendar: {
      title: 'التقويم ومواقيت الصلاة',
      today: 'اليوم',
      prayerTimes: 'مواقيت الصلاة',
      upcomingEvents: 'المناسبات القادمة',
      locationPermission: 'يرجى تفعيل خدمة الموقع لعرض المواقيت',
      locating: 'جاري تحديد الموقع...',
      day: 'يوم',
      times: {
        Fajr: 'الفجر',
        Sunrise: 'الشروق',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء',
      }
    },
    settings: {
      title: 'الإعدادات',
      general: 'عام',
      darkMode: 'المظهر الداكن',
      fontSize: 'حجم الخط',
      fontSizeSmall: 'صغير',
      fontSizeMedium: 'متوسط',
      fontSizeLarge: 'كبير',
      fontSizeXLarge: 'كبير جداً',
      notifications: 'الإشعارات',
      support: 'الدعم والمعلومات',
      privacy: 'سياسة الخصوصية',
      faq: 'المساعدة والأسئلة الشائعة',
      logout: 'تسجيل الخروج',
      version: 'الإصدار 1.2.0 (البيان)',
      notFound: 'لم تجد إجابة لسؤالك؟',
      contactSupport: 'تواصل مع الدعم الفني',
      privacyPolicy: `نحن في تطبيق "البيان" نلتزم بحماية خصوصيتك بشكل كامل.
      
      1. جمع البيانات:
      لا نقوم بجمع أي بيانات شخصية، أسماء، أرقام هواتف، أو عناوين بريد إلكتروني. استخدام التطبيق مجهول الهوية بالكامل.

      2. التخزين المحلي:
      يتم تخزين سجل البحث، الموضوعات المفضلة، وإعدادات التطبيق (مثل الوضع الداكن واللغة) محلياً على جهازك فقط باستخدام تقنية LocalStorage. هذه البيانات لا تغادر جهازك أبداً.

      3. الموقع الجغرافي:
      نطلب صلاحية الوصول للموقع الجغرافي فقط عند فتح "التقويم" لحساب مواقيت الصلاة بدقة بناءً على موقعك. لا يتم تخزين إحداثياتك أو إرسالها لأي خادم تتبع.

      4. الذكاء الاصطناعي:
      عندما تطرح سؤالاً، يتم إرسال نص السؤال فقط إلى خوادم المعالجة للحصول على الإجابة، دون ربطها بأي معرف شخصي.`,
      faqList: [
        {
          q: 'ما هو مصدر المعلومات في التطبيق؟',
          a: 'يعتمد التطبيق على نماذج ذكاء اصطناعي متطورة تم تدريبها وتوجيهها بدقة للاعتماد على المصادر الإسلامية الموثوقة، مثل القرآن الكريم، كتب السنة التسعة، والموسوعات الفقهية المعتمدة.'
        },
        {
          q: 'هل الفتاوى المقدمة معتمدة؟',
          a: 'الإجابات المقدمة هي لأغراض الاسترشاد والبحث وتكوين فهم عام للمسألة. في القضايا المصيرية أو الشخصية الحساسة (مثل الطلاق والميراث)، نوصي بشدة بمراجعة العلماء الثقات أو دور الإفتاء الرسمية في بلدك.'
        },
        {
          q: 'هل يعمل التطبيق بدون إنترنت؟',
          a: 'تتطلب ميزات المساعد الذكي (الشات، الفتاوى، تفسير القرآن) اتصالاً بالإنترنت للمعالجة. ومع ذلك، فإن سجل البحث الخاص بك وصفحة مواقيت الصلاة (بعد تحديثها) يعملان دون اتصال.'
        },
        {
          q: 'كيف يمكنني حذف سجل البحث؟',
          a: 'يمكنك حذف السجل كاملاً من الصفحة الرئيسية بالضغط على أيقونة "سلة المهملات" بجانب عنوان السجل، أو حذف عناصر فردية بالضغط على علامة (X) بجانب كل عنصر.'
        },
        {
          q: 'لماذا تختلف مواقيت الصلاة عن توقيت المسجد؟',
          a: 'نستخدم طرق حساب فلكية دقيقة بناءً على موقعك. قد يكون هناك فرق بسيط بدقائق معدودة حسب طريقة الحساب المعتمدة في مسجدك (مثلاً أم القرى مقابل رابطة العالم الإسلامي).'
        }
      ]
    }
  },
  en: {
    common: {
      appName: 'Al-Bayan',
      loading: 'Loading...',
      error: 'An error occurred',
      copy: 'Copy',
      share: 'Share',
      copied: 'Copied',
      search: 'Search',
      more: 'More',
      less: 'Less',
      explore: 'Select from List',
      recent: 'Recently Viewed',
      clearHistory: 'Clear History',
      noHistory: 'No recent history',
      back: 'Back',
      retry: 'Retry',
      readMore: 'Read More',
      source: 'Source',
      narrator: 'Narrator',
      grade: 'Grade',
      interpretation: 'Tafsir',
      verseOfDay: 'Verse of the Day',
      hadithOfDay: 'Hadith of the Day',
      shareText: 'Share Text',
      searchPlaceholder: 'Type your question here...',
      noNotifications: 'No notifications',
      typeToSearch: 'Type to search...',
      startSearch: 'Search',
    },
    nav: {
      home: 'Home',
      quran: 'Quran',
      hadith: 'Hadith',
      chat: 'Assistant',
      settings: 'Settings',
    },
    home: {
      fatwaTitle: 'Fatwas & Rulings',
      fatwaDesc: 'Rulings categorized by Fiqh chapters',
      quranTitle: 'The Holy Quran',
      quranDesc: 'Search verses and interpretations',
      hadithTitle: 'Hadith Search',
      hadithDesc: 'Verify authenticity of Hadiths',
      sunnahTitle: 'Prophetic Sunan',
      sunnahDesc: 'Chapters of Sunnah (Worship, Manners)',
      historyTitle: 'Islamic History',
      historyDesc: 'Events from authentic sources',
      calendarTitle: 'Calendar & Prayers',
      calendarDesc: 'Prayer times based on location',
    },
    chat: {
      welcome: 'Welcome. I am "Al-Bayan". You can ask me about Fatwas, Quran, Sunnah, or Fiqh issues. How can I help you today?',
      modes: {
        general: 'General',
        fatwa: 'Fatwa',
        quran: 'Quran',
        hadith: 'Hadith',
        sunnah: 'Sunnah',
        history: 'History',
      },
      placeholders: {
        general: 'Type your question here...',
        fatwa: 'Ask about a ruling...',
        quran: 'Search for a verse or topic...',
        hadith: 'Verify a Hadith...',
        sunnah: 'Search in Sunnah chapters...',
        history: 'Search Islamic history...',
      }
    },
    quran: {
      searchPlaceholder: 'Search for a verse, word, or topic...',
      tabTopics: 'Topics',
      tabSurahs: 'Surahs',
      tipTitle: 'Search Tip',
      tipText: 'Try searching for specific words like "Patience" or "Mercy", or full topics like "How is inheritance divided?".',
      topics: {
        prophets: 'Prophets Stories',
        judgment: 'Day of Judgment',
        ethics: 'Ethics & Manners',
        worship: 'Worship',
        parents: 'Parents',
        patience: 'Patience',
        sustenance: 'Sustenance',
        supplication: 'Dua',
      }
    },
    hadith: {
      searchPlaceholder: 'Search in Sahih Bukhari & Muslim...',
      topicsTitle: 'Browse by Topic',
      verified: 'Verified',
      sourceNote: 'All Hadiths are extracted from the six authentic books',
      topics: {
        ethics: 'Ethics',
        prayer: 'Prayer',
        patience: 'Patience',
        charity: 'Charity',
        parents: 'Parents',
        repentance: 'Repentance',
        knowledge: 'Knowledge',
        dhikr: 'Dhikr',
      }
    },
    sunnah: {
        title: 'Prophetic Sunan',
        searchPlaceholder: 'Search Sunnah chapters...',
        chaptersTitle: 'Books of Sunnah',
        chapters: {
            iman: 'Book of Faith',
            tahara: 'Book of Purification',
            salah: 'Book of Prayer',
            zakat: 'Book of Zakat',
            siyam: 'Book of Fasting',
            hajj: 'Book of Hajj',
            nikah: 'Book of Marriage',
            adab: 'Book of Manners',
            fitan: 'Book of Trials',
            riqaq: 'Book of Softening Hearts'
        }
    },
    history: {
      title: 'Islamic History',
      searchPlaceholder: 'Search for historical events...',
      chaptersTitle: 'Historical Eras',
      chapters: {
        seerah: 'Prophetic Biography',
        caliphs: 'Rightly Guided Caliphs',
        umayyads: 'Umayyad Caliphate',
        abbasids: 'Abbasid Caliphate',
        andalus: 'History of Andalusia',
        companions: 'Lives of Companions',
        conquests: 'Islamic Conquests',
        ottomans: 'Ottoman Empire',
      }
    },
    fatwa: {
      searchPlaceholder: 'Search for a Fiqh issue...',
      categoriesTitle: 'Fiqh Categories',
      disclaimer: 'Note: This Fatwa is for guidance only. For sensitive issues, please consult official Fatwa councils.',
      contemporary: 'Contemporary Fiqh',
      contemporaryDesc: 'Learn rulings on modern issues like crypto, AI, and expatriate laws.',
      exploreNow: 'Explore Now',
      categories: {
        tahara: 'Purification',
        salah: 'Prayer',
        zakat: 'Zakat',
        siyam: 'Fasting',
        family: 'Family',
        trade: 'Transactions',
        adab: 'Etiquette',
        oaths: 'Oaths',
      }
    },
    calendar: {
      title: 'Calendar & Prayer Times',
      today: 'Today',
      prayerTimes: 'Prayer Times',
      upcomingEvents: 'Upcoming Events',
      locationPermission: 'Please enable location to see prayer times',
      locating: 'Locating...',
      day: 'Day',
      times: {
        Fajr: 'Fajr',
        Sunrise: 'Sunrise',
        Dhuhr: 'Dhuhr',
        Asr: 'Asr',
        Maghrib: 'Maghrib',
        Isha: 'Isha',
      }
    },
    settings: {
      title: 'Settings',
      general: 'General',
      darkMode: 'Dark Mode',
      fontSize: 'Font Size',
      fontSizeSmall: 'Small',
      fontSizeMedium: 'Medium',
      fontSizeLarge: 'Large',
      fontSizeXLarge: 'Extra Large',
      notifications: 'Notifications',
      support: 'Support & Info',
      privacy: 'Privacy Policy',
      faq: 'FAQ & Help',
      logout: 'Log Out',
      version: 'Version 1.2.0 (Al-Bayan)',
      notFound: 'Didn\'t find an answer?',
      contactSupport: 'Contact Support',
      privacyPolicy: `At "Al-Bayan", we are fully committed to protecting your privacy.

      1. Data Collection:
      We do not collect any personal data, names, phone numbers, or email addresses. The app usage is completely anonymous.

      2. Local Storage:
      Search history, favorites, and app settings (like dark mode and language) are stored locally on your device only. This data never leaves your phone.

      3. Geolocation:
      We request location access only when opening the "Calendar" to calculate accurate prayer times based on your position. Your coordinates are not stored or sent to any tracking server.

      4. Artificial Intelligence:
      When you ask a question, only the text of the query is sent to processing servers to generate the answer, without linking it to any personal identifier.`,
      faqList: [
        {
          q: 'What is the source of information?',
          a: 'The app relies on advanced AI models trained specifically on authoritative Islamic sources, including the Holy Quran, the authentic Sunnah books, and recognized Fiqh encyclopedias.'
        },
        {
          q: 'Are the Fatwas certified?',
          a: 'The answers provided are for guidance, research, and general understanding. For critical or sensitive personal issues (like divorce or inheritance), we strongly recommend consulting qualified scholars or official Fatwa councils.'
        },
        {
          q: 'Does the app work offline?',
          a: 'Smart assistant features (Chat, Fatwa, Quran interpretation) require an internet connection. However, your search history and prayer times (once updated) are available offline.'
        },
        {
          q: 'How can I delete search history?',
          a: 'You can clear the entire history from the Home screen by tapping the "Trash" icon, or delete individual items by tapping the (X) next to them.'
        },
        {
          q: 'Why are prayer times different from my mosque?',
          a: 'We use accurate astronomical calculations based on your location. There might be a slight difference of a few minutes depending on the calculation method used by your local mosque.'
        }
      ]
    }
  },
  fr: {
    common: {
      appName: 'Al-Bayan',
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      copy: 'Copier',
      share: 'Partager',
      copied: 'Copié',
      search: 'Recherche',
      more: 'Plus',
      less: 'Moins',
      explore: 'Sélectionner dans la liste',
      recent: 'Récemment vu',
      clearHistory: 'Effacer l\'historique',
      noHistory: 'Aucun historique récent',
      back: 'Retour',
      retry: 'Réessayer',
      readMore: 'Lire la suite',
      source: 'Source',
      narrator: 'Narrateur',
      grade: 'Degré',
      interpretation: 'Tafsir',
      verseOfDay: 'Verset du jour',
      hadithOfDay: 'Hadith du jour',
      shareText: 'Partager le texte',
      searchPlaceholder: 'Tapez votre question ici...',
      noNotifications: 'Aucune notification',
      typeToSearch: 'Tapez pour rechercher...',
      startSearch: 'Rechercher',
    },
    nav: {
      home: 'Accueil',
      quran: 'Coran',
      hadith: 'Hadith',
      chat: 'Assistant',
      settings: 'Paramètres',
    },
    home: {
      fatwaTitle: 'Fatwas & Jugements',
      fatwaDesc: 'Jugements classés par chapitres de Fiqh',
      quranTitle: 'Le Saint Coran',
      quranDesc: 'Recherche de versets et interprétations',
      hadithTitle: 'Recherche de Hadith',
      hadithDesc: 'Vérifier l\'authenticité',
      sunnahTitle: 'Sunan Prophétiques',
      sunnahDesc: 'Chapitres de la Sunna (Culte, Manières)',
      historyTitle: 'Histoire Islamique',
      historyDesc: 'Événements des sources authentiques',
      calendarTitle: 'Calendrier & Prières',
      calendarDesc: 'Horaires de prière basés sur la localisation',
    },
    chat: {
      welcome: 'Bienvenue. Je suis "Al-Bayan". Vous pouvez m\'interroger sur les Fatwas, rechercher dans le Coran, la Sunna, ou clarifier des questions de Fiqh. Comment puis-je vous aider ?',
      modes: {
        general: 'Général',
        fatwa: 'Fatwa',
        quran: 'Coran',
        hadith: 'Hadith',
        sunnah: 'Sunna',
        history: 'Histoire',
      },
      placeholders: {
        general: 'Tapez votre question ici...',
        fatwa: 'Demandez un jugement...',
        quran: 'Recherchez un verset ou un sujet...',
        hadith: 'Vérifiez un Hadith...',
        sunnah: 'Recherchez dans les chapitres de la Sunna...',
        history: 'Recherchez dans l\'histoire islamique...',
      }
    },
    quran: {
      searchPlaceholder: 'Recherchez un verset, un mot ou un sujet...',
      tabTopics: 'Sujets',
      tabSurahs: 'Sourates',
      tipTitle: 'Astuce de recherche',
      tipText: 'Essayez de rechercher des mots spécifiques ou des sujets complets.',
      topics: {
        prophets: 'Histoires des Prophètes',
        judgment: 'Jour du Jugement',
        ethics: 'Éthique & Manières',
        worship: 'Culte',
        parents: 'Parents',
        patience: 'Patience',
        sustenance: 'Subsistance',
        supplication: 'Doua',
      }
    },
    hadith: {
      searchPlaceholder: 'Recherche dans Sahih Bukhari & Muslim...',
      topicsTitle: 'Parcourir par sujet',
      verified: 'Vérifié',
      sourceNote: 'Tous les Hadiths sont extraits des six livres authentiques',
      topics: {
        ethics: 'Éthique',
        prayer: 'Prière',
        patience: 'Patience',
        charity: 'Charité',
        parents: 'Parents',
        repentance: 'Repentir',
        knowledge: 'Savoir',
        dhikr: 'Dhikr',
      }
    },
    sunnah: {
        title: 'Sunan Prophétiques',
        searchPlaceholder: 'Recherchez dans les chapitres...',
        chaptersTitle: 'Livres de la Sunna',
        chapters: {
            iman: 'Livre de la Foi',
            tahara: 'Livre de la Purification',
            salah: 'Livre de la Prière',
            zakat: 'Livre de la Zakat',
            siyam: 'Livre du Jeûne',
            hajj: 'Livre du Hajj',
            nikah: 'Livre du Mariage',
            adab: 'Livre des Manières',
            fitan: 'Livre des Épreuves',
            riqaq: 'Livre de l\'Adoucissement'
        }
    },
    history: {
      title: 'Histoire Islamique',
      searchPlaceholder: 'Rechercher des événements historiques...',
      chaptersTitle: 'Ères Historiques',
      chapters: {
        seerah: 'Biographie Prophétique',
        caliphs: 'Califes Bien Guidés',
        umayyads: 'Califat Omeyyade',
        abbasids: 'Califat Abbasside',
        andalus: 'Histoire de l\'Andalousie',
        companions: 'Vies des Compagnons',
        conquests: 'Conquêtes Islamiques',
        ottomans: 'Empire Ottoman',
      }
    },
    fatwa: {
      searchPlaceholder: 'Recherchez une question de Fiqh...',
      categoriesTitle: 'Catégories de Fiqh',
      disclaimer: 'Note : Cette Fatwa est uniquement à titre indicatif.',
      contemporary: 'Fiqh Contemporain',
      contemporaryDesc: 'Découvrez les règles sur les questions modernes.',
      exploreNow: 'Explorer maintenant',
      categories: {
        tahara: 'Purification',
        salah: 'Prière',
        zakat: 'Zakat',
        siyam: 'Jeûne',
        family: 'Famille',
        trade: 'Transactions',
        adab: 'Étiquette',
        oaths: 'Serments',
      }
    },
    calendar: {
      title: 'Calendrier & Horaires de prière',
      today: 'Aujourd\'hui',
      prayerTimes: 'Horaires de prière',
      upcomingEvents: 'Événements à venir',
      locationPermission: 'Veuillez activer la localisation',
      locating: 'Localisation...',
      day: 'Jour',
      times: {
        Fajr: 'Fajr',
        Sunrise: 'Lever du soleil',
        Dhuhr: 'Dhuhr',
        Asr: 'Asr',
        Maghrib: 'Maghrib',
        Isha: 'Isha',
      }
    },
    settings: {
      title: 'Paramètres',
      general: 'Général',
      darkMode: 'Mode Sombre',
      fontSize: 'Taille de la police',
      fontSizeSmall: 'Petit',
      fontSizeMedium: 'Moyen',
      fontSizeLarge: 'Grand',
      fontSizeXLarge: 'Très Grand',
      notifications: 'Notifications',
      support: 'Support & Info',
      privacy: 'Politique de Confidentialité',
      faq: 'FAQ & Aide',
      logout: 'Se déconnecter',
      version: 'Version 1.2.0 (Al-Bayan)',
      notFound: 'Vous n\'avez pas trouvé de réponse ?',
      contactSupport: 'Contacter le support',
      privacyPolicy: `Chez "Al-Bayan", nous nous engageons pleinement à protéger votre vie privée.

      1. Collecte de données :
      Nous ne collectons aucune donnée personnelle. L'utilisation de l'application est entièrement anonyme.

      2. Stockage local :
      L'historique de recherche, les favoris et les paramètres sont stockés localement sur votre appareil. Ces données ne quittent jamais votre téléphone.

      3. Géolocalisation :
      Nous demandons l'accès à la localisation uniquement pour le "Calendrier" afin de calculer les horaires de prière. Vos coordonnées ne sont pas stockées.

      4. Intelligence Artificielle :
      Seul le texte de votre question est envoyé aux serveurs de traitement pour générer la réponse, sans aucun lien avec votre identité.`,
      faqList: [
        {
          q: 'Quelle est la source des informations ?',
          a: 'L\'application s\'appuie sur des modèles d\'IA formés sur des sources islamiques faisant autorité, notamment le Coran, la Sunna et les encyclopédies de Fiqh.'
        },
        {
          q: 'Les Fatwas sont-elles certifiées ?',
          a: 'Les réponses sont fournies à titre indicatif. Pour les questions sensibles (divorce, héritage), veuillez consulter des savants qualifiés.'
        },
        {
          q: 'L\'application fonctionne-t-elle hors ligne ?',
          a: 'Les fonctionnalités d\'IA (Chat, Fatwa) nécessitent Internet. L\'historique et les horaires de prière fonctionnent hors ligne.'
        },
        {
          q: 'Comment supprimer l\'historique ?',
          a: 'Vous pouvez effacer tout l\'historique depuis l\'écran d\'accueil ou supprimer des éléments individuellement.'
        },
        {
          q: 'Pourquoi les horaires diffèrent-ils de ma mosquée ?',
          a: 'Nous utilisons des calculs astronomiques basés sur votre position. Il peut y avoir une légère différence selon la méthode de calcul de votre mosquée.'
        }
      ]
    }
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  fontSize: 'medium',
  setFontSize: () => {},
  t: translations.ar,
  dir: 'rtl'
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  useEffect(() => {
    const storedLang = localStorage.getItem('albayan_language') as Language;
    if (storedLang) {
      setLanguage(storedLang);
    }
    const storedFontSize = localStorage.getItem('albayan_fontsize') as FontSize;
    if (storedFontSize) {
      setFontSize(storedFontSize);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('albayan_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const handleSetFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('albayan_fontsize', size);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Apply font size using root html font-size
  // Tailwind uses rems, so changing base html font size scales everything
  useEffect(() => {
    const root = document.documentElement;
    switch (fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'xlarge':
        root.style.fontSize = '20px';
        break;
      default:
        root.style.fontSize = '16px';
    }
  }, [fontSize]);

  const value = {
    language,
    setLanguage: handleSetLanguage,
    fontSize,
    setFontSize: handleSetFontSize,
    t: translations[language],
    dir: language === 'ar' ? 'rtl' : 'ltr'
  };

  return (
    <LanguageContext.Provider value={value as any}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);