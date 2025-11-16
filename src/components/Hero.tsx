'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Hero() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState({
    totalListings: 0,
    totalUsers: 0,
    userListings: 0,
    userMessages: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total listings
        const { count: listingsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        // Get total users
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (user) {
          // Get user's listings count
          const { count: userListingsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', user.id);

          // Get user's messages count
          const { count: userMessagesCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

          setStats({
            totalListings: listingsCount || 0,
            totalUsers: usersCount || 0,
            userListings: userListingsCount || 0,
            userMessages: userMessagesCount || 0
          });
        } else {
          setStats({
            totalListings: listingsCount || 0,
            totalUsers: usersCount || 0,
            userListings: 0,
            userMessages: 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);
  if (user) {
    // Logged in user - show personalized dashboard
    return (
      <div className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  {t('hero.welcomeBack')}{' '}
                  <span className="text-primary">{user.user_metadata?.full_name || t('hero.trader')}</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  {t('hero.readyToGrow')}
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start"
              >
                <Link
                  href="/listings/create"
                  className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {t('hero.createNewListing')}
                </Link>
                <Link
                  href="/listings"
                  className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {t('hero.browseListings')}
                </Link>
              </motion.div>
            </div>
            
            <div className="mt-12 sm:mx-auto sm:max-w-lg lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mx-auto w-full rounded-lg shadow-lg lg:max-w-md"
              >
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-lg">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium text-gray-700">{t('hero.yourDashboard')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-soft">
                        <div className="text-2xl font-bold text-primary">{stats.userListings}</div>
                        <div className="text-sm text-gray-600">{t('hero.yourListings')}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-soft">
                        <div className="text-2xl font-bold text-primary">{stats.userMessages}</div>
                        <div className="text-sm text-gray-600">{t('hero.messages')}</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-soft">
                      <div className="text-sm text-gray-600 mb-2">{t('hero.marketplaceStats')}</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium text-gray-900">{stats.totalListings}+</div>
                          <div className="text-xs text-gray-500">{t('hero.activeListings')}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{stats.totalUsers}+</div>
                          <div className="text-xs text-gray-500">{t('hero.verifiedSuppliers')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - show original landing page
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  {t('hero.connectGrowers')}{' '}
                  <span className="text-primary">{t('hero.trustedBuyers')}</span>{' '}
                  {t('hero.acrossBorders')}
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  {t('hero.heroDescription')}
                </p>
              </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start"
              >
                <Link
                  href="/register?role=farmer"
                  className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {t('hero.joinAsFarmer')}
                </Link>
                <Link
                  href="/register?role=importer"
                  className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {t('hero.joinAsImporter')}
                </Link>
              </motion.div>
          </div>
          
          <div className="mt-12 sm:mx-auto sm:max-w-lg lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mx-auto w-full rounded-lg shadow-lg lg:max-w-md"
            >
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium text-gray-700">{t('hero.liveMarketplace')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-soft">
                      <div className="text-2xl font-bold text-primary">500+</div>
                      <div className="text-sm text-gray-600">{t('hero.activeListings')}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-soft">
                      <div className="text-2xl font-bold text-primary">150+</div>
                      <div className="text-sm text-gray-600">{t('hero.verifiedSuppliers')}</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-soft">
                    <div className="text-sm text-gray-600 mb-2">{t('hero.featuredProduct')}</div>
                    <div className="font-medium text-gray-900">{t('hero.kenyanMangoes')}</div>
                    <div className="text-sm text-gray-500">{t('hero.kenyanMangoesDesc')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
