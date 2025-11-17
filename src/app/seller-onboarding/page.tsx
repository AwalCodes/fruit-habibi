'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import SellerOnboarding from '@/components/SellerOnboarding';
import { motion } from 'framer-motion';

export default function SellerOnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg text-emerald-200"
        >
          {t('sellerOnboarding.loading')}
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-emerald-500/30 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">
            {t('sellerOnboarding.onboardingComplete')}
          </h2>
          <p className="text-emerald-200 mb-6">
            {t('sellerOnboarding.onboardingCompleteDesc')}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25"
            >
              {t('sellerOnboarding.goToDashboard')}
            </button>
            <button
              onClick={() => router.push('/listings/create')}
              className="w-full border border-emerald-500/30 text-emerald-200 py-3 px-6 rounded-lg hover:bg-emerald-500/10 transition-all duration-300 font-medium"
            >
              {t('sellerOnboarding.createFirstListing')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <SellerOnboarding 
      onComplete={() => setCompleted(true)}
      onClose={() => router.push('/dashboard')}
    />
  );
}
