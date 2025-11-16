import type { Locale } from './index';

interface ValidationResult {
  isValid: boolean;
  missingKeys: string[];
  extraKeys: string[];
  locale: Locale;
}

/**
 * Recursively get all keys from a nested object
 */
function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Validate translation completeness against base locale (English)
 */
export async function validateTranslations(locale: Locale): Promise<ValidationResult> {
  try {
    // Load English (base) and target locale translations
    const baseTranslations = await import(`./translations/en.json`);
    const targetTranslations = await import(`./translations/${locale}.json`);
    
    const baseKeys = getAllKeys(baseTranslations.default);
    const targetKeys = getAllKeys(targetTranslations.default);
    
    // Find missing keys (in base but not in target)
    const missingKeys = baseKeys.filter(key => !targetKeys.includes(key));
    
    // Find extra keys (in target but not in base)
    const extraKeys = targetKeys.filter(key => !baseKeys.includes(key));
    
    const isValid = missingKeys.length === 0;
    
    return {
      isValid,
      missingKeys,
      extraKeys,
      locale,
    };
  } catch (error) {
    console.error(`Error validating translations for locale ${locale}:`, error);
    return {
      isValid: false,
      missingKeys: [],
      extraKeys: [],
      locale,
    };
  }
}

/**
 * Validate all translations against English base
 */
export async function validateAllTranslations(): Promise<Record<Locale, ValidationResult>> {
  const locales: Locale[] = ['fr', 'ar', 'hi']; // Skip 'en' as it's the base
  const results: Record<string, ValidationResult> = {};
  
  for (const locale of locales) {
    results[locale] = await validateTranslations(locale);
  }
  
  return results as Record<Locale, ValidationResult>;
}

/**
 * Check if a translation key exists
 */
export function hasTranslationKey(translations: any, key: string): boolean {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return false;
    }
  }
  
  return typeof value === 'string';
}

/**
 * Get translation or return key if missing (with warning in dev)
 */
export function getTranslationWithWarning(
  translations: any,
  key: string,
  locale: Locale
): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Warn in development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing translation key "${key}" for locale "${locale}"`);
      }
      return key; // Return key as fallback
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * Check for placeholder markers in translations (like [FR], [AR], [HI])
 */
export function findPlaceholders(translations: any, locale: Locale): string[] {
  const placeholders: string[] = [];
  const marker = `[${locale.toUpperCase()}]`;
  
  function searchPlaceholders(obj: any, prefix = '') {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'string' && obj[key].includes(marker)) {
        placeholders.push(fullKey);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        searchPlaceholders(obj[key], fullKey);
      }
    }
  }
  
  searchPlaceholders(translations);
  return placeholders;
}

/**
 * Log validation report to console
 */
export function logValidationReport(result: ValidationResult) {
  console.log(`\n🌐 Translation Validation Report for ${result.locale.toUpperCase()}`);
  console.log('='.repeat(50));
  
  if (result.isValid) {
    console.log('✅ All translations are complete!');
  } else {
    console.log(`⚠️  ${result.missingKeys.length} missing translation(s) found`);
    
    if (result.missingKeys.length > 0) {
      console.log('\nMissing keys:');
      result.missingKeys.forEach(key => console.log(`  - ${key}`));
    }
  }
  
  if (result.extraKeys.length > 0) {
    console.log(`\nℹ️  ${result.extraKeys.length} extra key(s) found (not in base locale)`);
    result.extraKeys.forEach(key => console.log(`  - ${key}`));
  }
  
  console.log('='.repeat(50) + '\n');
}

