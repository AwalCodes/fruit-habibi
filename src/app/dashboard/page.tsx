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
  DocumentTextIcon
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
      setDashboardLoading(true);

      // Fetch listings stats
      const { count: totalListings } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      const { count: publishedListings } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'published');

      const { count: draftListings } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'draft');

      // Fetch messages stats
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      // Get recent products for activity
      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, title, created_at, status')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent messages for activity
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('id, content, created_at, products(title)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(3);

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
            description: `"${message.content.substring(0, 50)}..."`,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user.user_metadata?.full_name || 'Trader'}!
                </h1>
                <p className="mt-2 text-gray-600">
                  Here's what's happening with your business today
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {user.user_metadata?.role === 'farmer' ? '🌱 Farmer/Exporter' : '📦 Importer/Distributor'}
                </span>
                <span className="text-sm text-gray-500">{user.user_metadata?.country}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white overflow-hidden shadow-soft rounded-lg"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalListings}</h3>
                  <p className="text-sm text-gray-500">Total Listings</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">{stats.publishedListings} published</span>
                <span className="text-gray-300 mx-2">•</span>
                <span className="text-gray-500">{stats.draftListings} drafts</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white overflow-hidden shadow-soft rounded-lg"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalMessages}</h3>
                  <p className="text-sm text-gray-500">Total Messages</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/messages" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View conversations →
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white overflow-hidden shadow-soft rounded-lg"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <EyeIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalViews}</h3>
                  <p className="text-sm text-gray-500">Total Views</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12% this month</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white overflow-hidden shadow-soft rounded-lg"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <StarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.avgRating}</h3>
                  <p className="text-sm text-gray-500">Average Rating</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(stats.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-500">({stats.totalReviews} reviews)</span>
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
              className="bg-white shadow-soft rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  href="/listings/create"
                  className="flex items-center p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                    <DocumentTextIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Create New Listing</h3>
                    <p className="text-sm text-gray-500">Add a new product to your catalog</p>
                  </div>
                </Link>

                <Link
                  href="/listings"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                    <UserGroupIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Browse Marketplace</h3>
                    <p className="text-sm text-gray-500">Discover products from other suppliers</p>
                  </div>
                </Link>

                <Link
                  href="/messages"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">View Messages</h3>
                    <p className="text-sm text-gray-500">Check your conversations</p>
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
              className="bg-white shadow-soft rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
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
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {user.user_metadata?.role === 'farmer' 
                        ? 'Create your first listing to get started!' 
                        : 'Browse listings to start making inquiries!'
                      }
                    </p>
                    <div className="mt-6">
                      <Link
                        href={user.user_metadata?.role === 'farmer' ? '/listings/create' : '/listings'}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
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

