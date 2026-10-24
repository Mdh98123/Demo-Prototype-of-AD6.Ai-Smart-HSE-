import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enLocales from '../locales/en.json';
import arLocales from '../locales/ar.json';

// Define resources based on the imported JSON files
const resources = {
  en: enLocales,
  ar: arLocales,
};

i18n
  // Detects the user's language (from browser, localStorage, etc.)
  .use(LanguageDetector)
  // Passes i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    // In production, you don't want debug mode
    debug: false,
    
    // Namespace configuration
    ns: ['common', 'forms', 'reports', 'compliance'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    
    detection: {
      order: ['localStorage', 'sessionStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'hse_language_i18next'
    }
  });

// Handle RTL direction natively on language change
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  
  if (dir === 'rtl') {
    document.documentElement.classList.add('rtl', 'font-arabic');
    document.documentElement.classList.remove('ltr', 'font-sans');
  } else {
    document.documentElement.classList.remove('rtl', 'font-arabic');
    document.documentElement.classList.add('ltr', 'font-sans');
  }
});

export default i18n;
