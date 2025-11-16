export type Locale = 'en' | 'fr' | 'ar' | 'hi';

export const locales: Locale[] = ['en', 'fr', 'ar', 'hi'];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
  hi: 'हिन्दी',
};

// RTL languages
export const rtlLocales: Locale[] = ['ar'];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export async function getTranslations(locale: Locale) {
  const translations = await import(`./translations/${locale}.json`);
  return translations.default;
}

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  
  return defaultLocale;
}

export function removeLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (locales.includes(firstSegment as Locale)) {
    return '/' + segments.slice(1).join('/');
  }
  
  return pathname;
}

export function addLocaleToPath(pathname: string, locale: Locale): string {
  if (pathname === '/') {
    return `/${locale}`;
  }
  
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (locales.includes(firstSegment as Locale)) {
    // Replace existing locale
    return `/${locale}/${segments.slice(1).join('/')}`;
  }
  
  // Add locale
  return `/${locale}${pathname}`;
}

