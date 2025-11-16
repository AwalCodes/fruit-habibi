/**
 * Translation Validation Script
 * Run this to check translation completeness
 * Usage: node -r esbuild-register src/lib/i18n/validate-all.ts
 */

import { validateAllTranslations, logValidationReport, findPlaceholders } from './validation';
import { getTranslations } from './index';
import type { Locale } from './index';

async function main() {
  console.log('\n🌍 Running Translation Validation...\n');
  
  // Validate all translations
  const results = await validateAllTranslations();
  
  // Log reports for each locale
  for (const [locale, result] of Object.entries(results)) {
    logValidationReport(result);
  }
  
  // Check for placeholders
  console.log('\n🔍 Checking for placeholder markers...\n');
  const locales: Locale[] = ['fr', 'ar', 'hi'];
  
  for (const locale of locales) {
    const translations = await getTranslations(locale);
    const placeholders = findPlaceholders(translations, locale);
    
    if (placeholders.length > 0) {
      console.log(`⚠️  ${locale.toUpperCase()}: Found ${placeholders.length} placeholder(s)`);
      placeholders.forEach(key => console.log(`  - ${key}`));
      console.log('');
    } else {
      console.log(`✅ ${locale.toUpperCase()}: No placeholders found\n`);
    }
  }
  
  console.log('✨ Validation complete!\n');
}

main().catch(console.error);

