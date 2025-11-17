'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DisputeManager from '@/components/DisputeManager';
import { motion } from 'framer-motion';

export default function DisputesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <DisputeManager onClose={() => router.push('/dashboard')} />;
}
