import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n/config';
import { SecureStorage } from '../services/storageService';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const cur = (i18n.language || 'en').slice(0, 2);
    return cur === 'ar' ? 'ar' : 'en';
  });

  useEffect(() => {
    const loadLang = async () => {
      try {
        const savedLang = await SecureStorage.getItem<Language>('hse_language');
        if (savedLang === 'ar' || savedLang === 'en') {
          setLanguageState(savedLang);
          i18n.changeLanguage(savedLang);
        } else {
          const detected = (i18n.language || 'en').slice(0, 2) as Language;
          if (detected === 'ar' || detected === 'en') {
            setLanguageState(detected);
          }
        }
      } catch (err) {
        console.warn('Failed to load language preference:', err);
      }
    };
    loadLang();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    SecureStorage.setItem('hse_language', lang);
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.documentElement.className = dir === 'rtl' ? 'rtl font-arabic' : 'ltr font-sans';
  }, [dir, language]);

  const t = (key: string, options?: any): string => {
    return i18n.t(key, options) as string;
  };

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
