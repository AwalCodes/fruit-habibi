'use client';

import { useState, useRef, useEffect } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useI18n } from '@/contexts/I18nContext';
import { locales, localeNames, type Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-emerald-100 hover:text-yellow-300 hover:bg-emerald-800/30 transition-all duration-300"
        aria-label="Change language"
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:inline">{localeNames[locale]}</span>
        <span className="text-sm font-medium sm:hidden">{locale.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-yellow-400/20 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                  locale === loc
                    ? 'bg-yellow-400/20 text-yellow-300 font-semibold'
                    : 'text-emerald-100 hover:bg-emerald-800/30 hover:text-yellow-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{localeNames[loc]}</span>
                  {locale === loc && (
                    <span className="text-yellow-400">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

