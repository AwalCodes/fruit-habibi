'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  userGrowth: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  listingGrowth: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  topCountries: Array<{
    country: string;
    users: number;
    listings: number;
  }>;
  recentOrders: Array<{
    id: string;
    total_amount_usd: number;
    created_at: string;
    buyer_name: string;
    product_title: string;
  }>;
}

interface AdminAnalyticsProps {
  className?: string;
}

export default function AdminAnalytics({ className = '' }: AdminAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    userGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 },
    listingGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 },
    topCountries: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get current and previous month dates
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch revenue and orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount_usd, created_at, buyer_id, product_id, products(title), users!orders_buyer_id_fkey(full_name)')
        .eq('order_status', 'paid')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      // Calculate revenue metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount_usd || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Fetch user growth data
      const { count: thisMonthUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString());

      const { count: lastMonthUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonth.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      // Fetch listing growth data
      const { count: thisMonthListings } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString());

      const { count: lastMonthListings } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonth.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      // Fetch top countries
      const { data: countryData } = await supabase
        .from('users')
        .select('country')
        .not('country', 'is', null);

      const countryStats = countryData?.reduce((acc: any, user) => {
        const country = user.country || 'Unknown';
        if (!acc[country]) {
          acc[country] = { users: 0, listings: 0 };
        }
        acc[country].users++;
        return acc;
      }, {});

      const topCountries = Object.entries(countryStats || {})
        .map(([country, stats]: [string, any]) => ({
          country,
          users: stats.users,
          listings: stats.listings
        }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 5);

      // Calculate growth percentages
      const userGrowth = lastMonthUsers ? ((thisMonthUsers || 0) - lastMonthUsers) / lastMonthUsers * 100 : 0;
      const listingGrowth = lastMonthListings ? ((thisMonthListings || 0) - lastMonthListings) / lastMonthListings * 100 : 0;

      // Get recent orders with limited data
      const recentOrders = orders?.slice(0, 5).map(order => ({
        id: order.id || '',
        total_amount_usd: order.total_amount_usd || 0,
        created_at: order.created_at || '',
        buyer_name: order.users?.full_name || 'Unknown',
        product_title: order.products?.title || 'Unknown Product'
      })) || [];

      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        conversionRate: 0, // TODO: Calculate based on user visits vs orders
        userGrowth: {
          thisMonth: thisMonthUsers || 0,
          lastMonth: lastMonthUsers || 0,
          growth: userGrowth
        },
        listingGrowth: {
          thisMonth: thisMonthListings || 0,
          lastMonth: lastMonthListings || 0,
          growth: listingGrowth
        },
        topCountries,
        recentOrders
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUpIcon className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDownIcon className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-soft p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
          <ChartBarIcon className="h-6 w-6 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-900">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-emerald-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.totalOrders}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(analytics.averageOrderValue)}</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-900">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
              <EyeIcon className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">{analytics.userGrowth.thisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="font-semibold text-gray-900">{analytics.userGrowth.lastMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Growth</span>
              <div className="flex items-center space-x-2">
                {getGrowthIcon(analytics.userGrowth.growth)}
                <span className={`font-semibold ${getGrowthColor(analytics.userGrowth.growth)}`}>
                  {formatPercentage(analytics.userGrowth.growth)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Listing Growth</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">{analytics.listingGrowth.thisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="font-semibold text-gray-900">{analytics.listingGrowth.lastMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Growth</span>
              <div className="flex items-center space-x-2">
                {getGrowthIcon(analytics.listingGrowth.growth)}
                <span className={`font-semibold ${getGrowthColor(analytics.listingGrowth.growth)}`}>
                  {formatPercentage(analytics.listingGrowth.growth)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Countries & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {analytics.topCountries.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{country.country}</span>
                </div>
                <span className="text-sm text-gray-600">{country.users} users</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.product_title}</p>
                  <p className="text-sm text-gray-500">by {order.buyer_name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount_usd)}</span>
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
