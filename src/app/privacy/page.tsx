'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  DocumentTextIcon,
  UserIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';

export default function PrivacyPolicyPage() {
  const { t } = useI18n();
  
  const sectionIcons = [
    InformationCircleIcon,
    EyeIcon,
    GlobeAltIcon,
    LockClosedIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    GlobeAltIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    UserIcon
  ];
  
  const sections = Array.from({ length: 12 }, (_, index) => ({
    title: t(`privacy.section${index + 1}Title`),
    icon: sectionIcons[index],
    content: t(`privacy.section${index + 1}Content`)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800/50 to-slate-800/50 backdrop-blur-sm border-b border-emerald-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <ShieldCheckIcon className="w-12 h-12 text-emerald-400" />
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">
                {t('privacy.title')}
              </h1>
            </div>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
              {t('privacy.subtitle')}
            </p>
            <p className="text-sm text-emerald-300 mt-4">
              {t('privacy.lastUpdated')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/50 to-emerald-900/30 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm mb-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 mb-4">
              {t('privacy.welcome')}
            </h2>
            <p className="text-emerald-200 leading-relaxed">
              {t('privacy.welcomeDesc')}
            </p>
          </div>
        </motion.div>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-gradient-to-br from-slate-800/50 to-emerald-900/30 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-lg flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                  <section.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 mb-4">
                    {section.title}
                  </h3>
                  <div className="text-emerald-200 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-br from-emerald-800/30 to-slate-800/50 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm"
        >
          <div className="text-center">
            <ShieldCheckIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 mb-4">
              {t('privacy.questionsAboutPrivacy')}
            </h2>
            <p className="text-emerald-200 mb-6 max-w-2xl mx-auto">
              {t('privacy.questionsDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25"
              >
                {t('privacy.contactSupport')}
              </Link>
              <Link
                href="/help"
                className="border border-emerald-500/30 text-emerald-200 px-8 py-3 rounded-lg hover:bg-emerald-500/10 transition-all duration-300 font-medium"
              >
                {t('privacy.helpCenter')}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



