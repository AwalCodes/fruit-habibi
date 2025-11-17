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
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  UserMinusIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'farmer' | 'importer' | 'admin';
  country: string;
  created_at: string;
  listings_count: number;
  messages_count: number;
}

export default function UserManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  // Removed statusFilter since users table doesn't have status column
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'listings'>('newest');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && user.user_metadata?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  // Add a small delay to ensure user metadata is loaded
  useEffect(() => {
    if (user && user.user_metadata?.role === 'admin') {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user?.user_metadata?.role]);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, roleFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      setPageLoading(true);

      // Check current user and session first
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('Current user:', currentUser);
      console.log('User metadata:', currentUser?.user_metadata);

      // Fetch users with their stats
      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          role,
          country,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Fetched users:', usersData?.length || 0, 'users');
      console.log('Raw users data:', usersData);

      // Fetch listing counts for each user
      const usersWithStats = await Promise.all(
        (usersData || []).map(async (user) => {
          const { count: listingsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', user.id);

          const { count: messagesCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

          return {
            ...user,
            listings_count: listingsCount || 0,
            messages_count: messagesCount || 0,
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter removed since users table doesn't have status column

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
        break;
      case 'listings':
        filtered.sort((a, b) => b.listings_count - a.listings_count);
        break;
    }

    setFilteredUsers(filtered);
  };

  // User status change function removed since users table doesn't have status column

  // Status functions removed since users table doesn't have status column

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'bg-green-100 text-green-800';
      case 'importer':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading user management...</div>
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
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    <li>
                      <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                        Admin
                      </Link>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="text-gray-400">/</span>
                        <span className="ml-4 text-gray-900">User Management</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">User Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage users, roles, and account status
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  {filteredUsers.length} Users
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Roles</option>
                <option value="farmer">Farmer/Exporter</option>
                <option value="importer">Importer/Distributor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {/* Status filter removed since users table doesn't have status column */}
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="listings">Most Listings</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setSortBy('newest');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-soft rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  {/* Status column removed since users table doesn't have status column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role === 'farmer' ? 'Farmer/Exporter' : 
                         user.role === 'importer' ? 'Importer/Distributor' : 'Admin'}
                      </span>
                    </td>
                    {/* Status column removed since users table doesn't have status column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <span className="font-medium">{user.listings_count}</span> listings
                      </div>
                      <div>
                        <span className="font-medium">{user.messages_count}</span> messages
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            // TODO: Implement user view modal
                            console.log('View user:', user.id);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {/* Status management buttons removed since users table doesn't have status column */}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {users.length === 0 ? 'No users found in database' : 'No users match your filters'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {users.length === 0 
                ? 'Check if users exist in the database' 
                : 'Try adjusting your search criteria'
              }
            </p>
            {/* Debug info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
              <p className="text-xs text-gray-600">Total users in DB: {users.length}</p>
              <p className="text-xs text-gray-600">Filtered users: {filteredUsers.length}</p>
              <p className="text-xs text-gray-600">Search term: "{searchTerm}"</p>
              <p className="text-xs text-gray-600">Role filter: "{roleFilter}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
