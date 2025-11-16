"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { useI18n } from '@/contexts/I18nContext';

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-emerald-900 to-black relative overflow-hidden">
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3Ccircle cx='0' cy='0' r='2'/%3E%3Ccircle cx='80' cy='0' r='2'/%3E%3Ccircle cx='0' cy='80' r='2'/%3E%3Ccircle cx='80' cy='80' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Gemstone Effects */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-60"
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 right-10 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full opacity-50"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <Logo size="lg" showText={true} href="/" className="mb-4" />
              </div>
              <p className="mt-4 text-emerald-100 leading-relaxed text-lg">
                {t('footer.description')}
              </p>
              
              {/* Luxury Tagline */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-2xl">💎</span>
                <span className="text-yellow-300 font-medium">{t('footer.globalHarvestSolutions')}</span>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-semibold uppercase tracking-wide text-yellow-400 mb-4">
              {t('footer.globalPlatform')}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/listings" className="text-emerald-100 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-yellow-400">✨</span>
                  {t('footer.browseAllListings')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-emerald-100 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-yellow-400">👑</span>
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-emerald-100 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-yellow-400">💎</span>
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-semibold uppercase tracking-wide text-yellow-400 mb-4">
              {t('footer.luxurySupport')}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/help" className="text-emerald-100 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-yellow-400">🛡️</span>
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-emerald-100 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-yellow-400">📜</span>
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-emerald-100 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-yellow-400">🔒</span>
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 border-t border-yellow-400/20 pt-8"
        >
          <div className="text-center">
            <p className="text-emerald-100 text-sm">
              {t('footer.copyright').replace('{year}', currentYear.toString())}
            </p>
            <div className="flex justify-center items-center gap-4 mt-4">
              <span className="text-yellow-400 text-lg">💎</span>
              <span className="text-emerald-200 text-sm font-medium">{t('footer.globalMarketplace')}</span>
              <span className="text-yellow-400 text-lg">👑</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
