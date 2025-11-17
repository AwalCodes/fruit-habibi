import type { Metadata } from 'next';
import type { Locale } from './index';

interface MetadataParams {
  locale: Locale;
  title?: string;
  description?: string;
  path?: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fruithabibi.com';

// Metadata translations
const metadataTranslations: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Fruit Habibi - B2B Fruits & Vegetables Marketplace',
    description: 'Connect African and Asian farmers with Middle Eastern importers. Trade fresh produce with confidence.',
  },
  fr: {
    title: 'Fruit Habibi - Marché B2B de Fruits et Légumes',
    description: 'Connectez les agriculteurs africains et asiatiques avec les importateurs du Moyen-Orient. Échangez des produits frais en toute confiance.',
  },
  ar: {
    title: 'فاكهة حبيبي - سوق الفواكه والخضروات B2B',
    description: 'ربط المزارعين الأفارقة والآسيويين بالمستوردين في الشرق الأوسط. تجارة المنتجات الطازجة بثقة.',
  },
  hi: {
    title: 'फ्रूट हबीबी - B2B फल और सब्जियों का बाजार',
    description: 'अफ्रीकी और एशियाई किसानों को मध्य पूर्वी आयातकों से जोड़ें। विश्वास के साथ ताजा उत्पाद का व्यापार करें।',
  },
  es: {
    title: 'Fruit Habibi - Mercado B2B de Frutas y Verduras',
    description: 'Conecta agricultores africanos y asiáticos con importadores de Medio Oriente. Comercia productos frescos con confianza.',
  },
  zh: {
    title: 'Fruit Habibi - B2B水果和蔬菜市场',
    description: '连接非洲和亚洲农民与中东进口商。自信地交易新鲜农产品。',
  },
  pt: {
    title: 'Fruit Habibi - Mercado B2B de Frutas e Vegetais',
    description: 'Conecte agricultores africanos e asiáticos com importadores do Oriente Médio. Negocie produtos frescos com confiança.',
  },
};

/**
 * Generate multilingual metadata with hreflang tags
 */
export function generateMultilingualMetadata({
  locale,
  title,
  description,
  path = '/',
}: MetadataParams): Metadata {
  const defaultMetadata = metadataTranslations[locale];
  const finalTitle = title || defaultMetadata.title;
  const finalDescription = description || defaultMetadata.description;

  // Generate alternate language links (hreflang)
  const alternates: Record<string, string> = {};
  const locales: Locale[] = ['en', 'fr', 'ar', 'hi', 'es', 'zh', 'pt'];
  
  locales.forEach((lang) => {
    alternates[lang] = `${siteUrl}/${lang}${path}`;
  });

  // Add x-default for international users
  alternates['x-default'] = `${siteUrl}/en${path}`;

  return {
    title: finalTitle,
    description: finalDescription,
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
    alternates: {
      canonical: `${siteUrl}/${locale}${path}`,
      languages: alternates,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: `${siteUrl}/${locale}${path}`,
      siteName: 'Fruit Habibi',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
    },
  };
}

/**
 * Generate hreflang link tags for HTML head
 */
export function generateHreflangLinks(currentPath: string): string {
  const locales: Locale[] = ['en', 'fr', 'ar', 'hi', 'es', 'zh', 'pt'];
  
  const links = locales.map((locale) => {
    return `<link rel="alternate" hreflang="${locale}" href="${siteUrl}/${locale}${currentPath}" />`;
  });

  // Add x-default
  links.push(`<link rel="alternate" hreflang="x-default" href="${siteUrl}/en${currentPath}" />`);

  return links.join('\n');
}

/**
 * Get page title for a specific locale
 */
export function getPageTitle(locale: Locale, pageKey?: string): string {
  if (pageKey && metadataTranslations[locale]) {
    return metadataTranslations[locale].title;
  }
  return metadataTranslations[locale]?.title || metadataTranslations.en.title;
}

/**
 * Get page description for a specific locale
 */
export function getPageDescription(locale: Locale): string {
  return metadataTranslations[locale]?.description || metadataTranslations.en.description;
}

