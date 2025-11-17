'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  flaggedListings: number;
  totalMessages: number;
  recentRegistrations: number;
  recentListings: number;
  recentMessages: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'listing_created' | 'listing_flagged' | 'message_sent';
  title: string;
  description: string;
  timestamp: string;
  user_id?: string;
  user_name?: string;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalListings: 0,
    publishedListings: 0,
    draftListings: 0,
    flaggedListings: 0,
    totalMessages: 0,
    recentRegistrations: 0,
    recentListings: 0,
    recentMessages: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && user.user_metadata?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setDashboardLoading(true);

      // Fetch user stats
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch listing stats
      const { count: totalListings } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: publishedListings } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      const { count: draftListings } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Fetch recent activity
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, title, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      // Build recent activity
      const activity: RecentActivity[] = [];
      
      if (recentUsers) {
        recentUsers.forEach(user => {
          activity.push({
            id: user.id,
            type: 'user_registration',
            title: 'New user registered',
            description: user.full_name || 'Unknown User',
            timestamp: user.created_at,
            user_id: user.id,
            user_name: user.full_name
          });
        });
      }

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

      // Sort by timestamp and limit to 10
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalListings: totalListings || 0,
        publishedListings: publishedListings || 0,
        draftListings: draftListings || 0,
        flaggedListings: 0, // TODO: Implement flagging system
        totalMessages: totalMessages || 0,
        recentRegistrations: recentUsers?.length || 0,
        recentListings: recentProducts?.length || 0,
        recentMessages: 0 // TODO: Implement recent message tracking
      });

      setRecentActivity(activity.slice(0, 10));
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UsersIcon className="h-5 w-5 text-green-500" />;
      case 'listing_created':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'listing_flagged':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'message_sent':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500" />;
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
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!user || user.user_metadata?.role !== 'admin') {
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
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Monitor and manage the Fruit Habibi marketplace
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  Admin Access
                </span>
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
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Manage users →
                </Link>
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
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-green-600" />
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
            transition={{ delay: 0.3 }}
            className="bg-white overflow-hidden shadow-soft rounded-lg"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalMessages}</h3>
                  <p className="text-sm text-gray-500">Total Messages</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin/messages" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  Monitor messages →
                </Link>
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
                  <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.flaggedListings}</h3>
                  <p className="text-sm text-gray-500">Flagged Content</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin/moderation" className="text-red-600 hover:text-red-700 font-medium text-sm">
                  Review flagged →
                </Link>
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
                  href="/admin/users"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                    <UsersIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Manage Users</h3>
                    <p className="text-sm text-gray-500">View, suspend, or delete users</p>
                  </div>
                </Link>

                <Link
                  href="/admin/listings"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                    <DocumentTextIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Moderate Listings</h3>
                    <p className="text-sm text-gray-500">Review and approve listings</p>
                  </div>
                </Link>

                <Link
                  href="/admin/messages"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Monitor Messages</h3>
                    <p className="text-sm text-gray-500">Review conversations for abuse</p>
                  </div>
                </Link>

                <Link
                  href="/admin/reports"
                  className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-4">
                    <ChartBarIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">View Reports</h3>
                    <p className="text-sm text-gray-500">Analytics and system reports</p>
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                    <p className="mt-1 text-sm text-gray-500">Activity will appear here as users interact with the platform</p>
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


