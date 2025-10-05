'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  EyeIcon, 
  HeartIcon, 
  StarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  totalMessages: number;
  unreadMessages: number;
  totalViews: number;
  avgRating: number;
  totalReviews: number;
}

interface RecentActivity {
  id: string;
  type: 'listing_created' | 'message_received' | 'listing_viewed' | 'review_received';
  title: string;
  description: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    publishedListings: 0,
    draftListings: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalViews: 0,
    avgRating: 0,
    totalReviews: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      console.log('Loading dashboard data for user:', user.id);
      setDashboardLoading(true);

      // Fetch listings stats
      const { count: totalListings, error: totalError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      if (totalError) {
        console.error('Error fetching total listings:', totalError);
      }

      const { count: publishedListings, error: publishedError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'published');

      if (publishedError) {
        console.error('Error fetching published listings:', publishedError);
      }

      const { count: draftListings, error: draftError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'draft');

      if (draftError) {
        console.error('Error fetching draft listings:', draftError);
      }

      // Fetch messages stats
      const { count: totalMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }

      // Get recent products for activity
      const { data: recentProducts, error: productsError } = await supabase
        .from('products')
        .select('id, title, created_at, status')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (productsError) {
        console.error('Error fetching recent products:', productsError);
      }

      // Get recent messages for activity
      const { data: recentMessages, error: messagesRecentError } = await supabase
        .from('messages')
        .select('id, body, created_at, product_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(3);

      if (messagesRecentError) {
        console.error('Error fetching recent messages:', messagesRecentError);
      }

      // Build recent activity
      const activity: RecentActivity[] = [];
      
      if (recentProducts) {
        recentProducts.forEach(product => {
          activity.push({
            id: product.id,
            type: 'listing_created',
            title: 'New listing created',
            description: product.title,
            timestamp: product.created_at
          });
        });
      }

      if (recentMessages) {
        recentMessages.forEach(message => {
          activity.push({
            id: message.id,
            type: 'message_received',
            title: 'Message received',
            description: `"${message.body.substring(0, 50)}..."`,
            timestamp: message.created_at
          });
        });
      }

      // Sort by timestamp and limit to 8
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setStats({
        totalListings: totalListings || 0,
        publishedListings: publishedListings || 0,
        draftListings: draftListings || 0,
        totalMessages: totalMessages || 0,
        unreadMessages: 0, // TODO: Implement unread message tracking
        totalViews: Math.floor(Math.random() * 1000) + 100, // Mock data
        avgRating: 4.7, // Mock data
        totalReviews: Math.floor(Math.random() * 50) + 5 // Mock data
      });

      setRecentActivity(activity.slice(0, 8));

      // Check if user needs onboarding (incomplete business profile)
      const hasBusinessInfo = user.user_metadata?.business_name || false;
      const needsOnboarding = !hasBusinessInfo;
      setShowOnboardingPrompt(needsOnboarding);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'listing_created':
        return <DocumentTextIcon className="h-5 w-5 text-green-500" />;
      case 'message_received':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />;
      case 'review_received':
        return <StarIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <EyeIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black flex items-center justify-center">
        <div className="text-lg text-emerald-200">Loading your dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Welcome back, {user.user_metadata?.full_name || 'Trader'}!
                </h1>
                <p className="mt-2 text-emerald-200">
                  Here's what's happening with your business today
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-400/30 text-yellow-400">
                  {user.user_metadata?.role === 'farmer' ? '🌱 Farmer/Exporter' : '📦 Importer/Distributor'}
                </span>
                <span className="text-sm text-emerald-300">{user.user_metadata?.country}</span>
                <button
                  onClick={() => router.push('/seller-onboarding')}
                  className="inline-flex items-center px-4 py-2 border border-emerald-400/30 shadow-sm text-sm leading-4 font-medium rounded-lg text-emerald-400 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-all duration-300"
                >
                  🚀 Seller Onboarding
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Seller Onboarding Prompt */}
        {showOnboardingPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Ready to Start Selling?</h3>
                  <p className="text-emerald-200 text-sm">
                    Complete your seller onboarding to unlock all features and start building your business
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOnboardingPrompt(false)}
                  className="px-4 py-2 text-emerald-300 hover:text-white transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => router.push('/seller-onboarding')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium"
                >
                  Start Onboarding
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-slate-600/30"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center border border-yellow-400/30">
                    <DocumentTextIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-white">{stats.totalListings}</h3>
                  <p className="text-sm text-emerald-200">Total Listings</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-400 font-medium">{stats.publishedListings} published</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-slate-300">{stats.draftListings} drafts</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-slate-600/30"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center border border-emerald-400/30">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-white">{stats.totalMessages}</h3>
                  <p className="text-sm text-emerald-200">Total Messages</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/messages" className="text-yellow-400 hover:text-yellow-300 font-medium text-sm transition-colors">
                  View conversations →
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-slate-600/30"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center border border-emerald-400/30">
                    <EyeIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-white">{stats.totalViews}</h3>
                  <p className="text-sm text-emerald-200">Total Views</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-400 mr-1" />
                <span className="text-emerald-400 font-medium">+12% this month</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-slate-600/30"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center border border-yellow-400/30">
                    <StarIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-white">{stats.avgRating}</h3>
                  <p className="text-sm text-emerald-200">Average Rating</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(stats.avgRating) ? 'text-yellow-400 fill-current' : 'text-slate-400'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-slate-300">({stats.totalReviews} reviews)</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm shadow-lg rounded-lg border border-slate-600/30"
            >
              <div className="px-6 py-4 border-b border-slate-600">
                <h2 className="text-lg font-medium text-white">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  href="/listings/create"
                  className="flex items-center p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg hover:from-yellow-500/20 hover:to-yellow-600/20 transition-all duration-300 border border-yellow-400/20"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center mr-4 border border-yellow-400/30">
                    <DocumentTextIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Create New Listing</h3>
                    <p className="text-sm text-emerald-200">Add a new product to your catalog</p>
                  </div>
                </Link>

                <Link
                  href="/listings"
                  className="flex items-center p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg hover:from-emerald-500/20 hover:to-emerald-600/20 transition-all duration-300 border border-emerald-400/20"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mr-4 border border-emerald-400/30">
                    <UserGroupIcon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Browse Marketplace</h3>
                    <p className="text-sm text-emerald-200">Discover products from other suppliers</p>
                  </div>
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg hover:from-blue-500/20 hover:to-blue-600/20 transition-all duration-300 border border-blue-400/20"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mr-4 border border-blue-400/30">
                    <ShoppingBagIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">View Orders</h3>
                    <p className="text-sm text-emerald-200">Manage your purchases and sales</p>
                  </div>
                </Link>

                <Link
                  href="/messages"
                  className="flex items-center p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg hover:from-emerald-500/20 hover:to-emerald-600/20 transition-all duration-300 border border-emerald-400/20"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mr-4 border border-emerald-400/30">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">View Messages</h3>
                    <p className="text-sm text-emerald-200">Check your conversations</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm shadow-lg rounded-lg border border-slate-600/30"
            >
              <div className="px-6 py-4 border-b border-slate-600">
                <h2 className="text-lg font-medium text-white">Recent Activity</h2>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{activity.title}</p>
                          <p className="text-sm text-emerald-200 truncate">{activity.description}</p>
                          <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-yellow-400" />
                    <h3 className="mt-2 text-sm font-medium text-white">No activity yet</h3>
                    <p className="mt-1 text-sm text-emerald-200">
                      {user.user_metadata?.role === 'farmer' 
                        ? 'Create your first listing to get started!' 
                        : 'Browse listings to start making inquiries!'
                      }
                    </p>
                    <div className="mt-6">
                      <Link
                        href={user.user_metadata?.role === 'farmer' ? '/listings/create' : '/listings'}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
                      >
                        Get Started
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

