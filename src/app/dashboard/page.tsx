'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user.user_metadata?.full_name || user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow-soft rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {user.user_metadata?.role === 'farmer' ? '🌱' : '📦'}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.user_metadata?.role === 'farmer' ? 'My Listings' : 'My Inquiries'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user.user_metadata?.role === 'farmer' 
                      ? 'Manage your product listings' 
                      : 'Track your inquiries and orders'
                    }
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button className="text-primary hover:text-primary-dark font-medium text-sm">
                  View all →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-soft rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-accent font-semibold">💬</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                  <p className="text-sm text-gray-500">
                    View your conversations
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/messages" className="text-primary hover:text-primary-dark font-medium text-sm">
                  View messages →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-soft rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-500">
                    View your performance metrics
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button className="text-primary hover:text-primary-dark font-medium text-sm">
                  View analytics →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow-soft rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                <p>No recent activity to display.</p>
                <p className="text-sm mt-2">
                  {user.user_metadata?.role === 'farmer' 
                    ? 'Create your first listing to get started!' 
                    : 'Browse listings to start making inquiries!'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
