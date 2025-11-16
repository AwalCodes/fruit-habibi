'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { defaultLocale, getTranslations, isRTL } from '@/lib/i18n';
import { getTranslationWithWarning } from '@/lib/i18n/validation';

type Translations = Record<string, any>;

interface I18nContextType {
  locale: Locale;
  translations: Translations;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  loading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, initialLocale, initialTranslations }: { 
  children: ReactNode;
  initialLocale?: Locale;
  initialTranslations?: Translations;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [translations, setTranslations] = useState<Translations>(initialTranslations || {});
  const [loading, setLoading] = useState(false);

  const loadTranslations = async (newLocale: Locale) => {
    setLoading(true);
    try {
      const newTranslations = await getTranslations(newLocale);
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to English
      try {
        const fallback = await getTranslations(defaultLocale);
        setTranslations(fallback);
      } catch (fallbackError) {
        console.error('Failed to load fallback translations:', fallbackError);
        setTranslations({});
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTranslations && Object.keys(translations).length === 0) {
      loadTranslations(locale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    
    setLocaleState(newLocale);
    loadTranslations(newLocale);
    
    // Set cookie for persistence
    if (typeof document !== 'undefined') {
      document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }
    
    // Update HTML lang and dir attributes
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      html.lang = newLocale;
      html.dir = isRTL(newLocale) ? 'rtl' : 'ltr';
    }
  };

  // Update HTML attributes when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      html.lang = locale;
      html.dir = isRTL(locale) ? 'rtl' : 'ltr';
    }
  }, [locale]);

  const t = (key: string): string => {
    // Use validation function in development mode for warnings
    if (process.env.NODE_ENV === 'development') {
      return getTranslationWithWarning(translations, key, locale);
    }
    
    // Production mode - simple lookup
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, translations, setLocale, t, loading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

