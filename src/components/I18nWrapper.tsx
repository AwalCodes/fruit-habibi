'use client';

import { useEffect, useState } from 'react';
import { I18nProvider } from '@/contexts/I18nContext';
import { getTranslations, defaultLocale, type Locale } from '@/lib/i18n';

function getLocaleFromCookie(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(c => c.trim().startsWith('locale='));
  if (localeCookie) {
    const locale = localeCookie.split('=')[1].trim() as Locale;
    if (['en', 'fr', 'ar', 'hi'].includes(locale)) {
      return locale;
    }
  }
  return defaultLocale;
}

export default function I18nWrapper({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get locale from cookie or use default
    const detectedLocale = getLocaleFromCookie();
    setLocale(detectedLocale);
    
    // Load translations
    getTranslations(detectedLocale)
      .then((trans) => {
        setTranslations(trans);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load translations:', error);
        // Fallback to English
        getTranslations(defaultLocale).then((trans) => {
          setTranslations(trans);
          setLoading(false);
        });
      });
  }, []);

  if (loading) {
    return <>{children}</>;
  }

  return (
    <I18nProvider initialLocale={locale} initialTranslations={translations}>
      {children}
    </I18nProvider>
  );
}

