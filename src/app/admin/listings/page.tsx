'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Listing {
  id: string;
  title: string;
  description: string;
  price_usd: number;
  quantity: number;
  unit: string;
  location: string;
  category: string;
  images: string[];
  status: 'draft' | 'published' | 'archived' | 'flagged' | 'rejected';
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    full_name: string;
    email: string;
    country: string;
  };
}

export default function ListingModeration() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_high' | 'price_low'>('newest');
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
      fetchListings();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchTerm, statusFilter, categoryFilter, sortBy]);

  const fetchListings = async () => {
    try {
      setPageLoading(true);

      const { data: listingsData, error } = await supabase
        .from('products')
        .select(`
          *,
          users!products_owner_id_fkey(id, full_name, email, country)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(listingsData || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...listings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(listing => listing.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(listing => listing.category === categoryFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price_usd - a.price_usd);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price_usd - b.price_usd);
        break;
    }

    setFilteredListings(filtered);
  };

  const handleStatusChange = async (listingId: string, newStatus: 'published' | 'rejected' | 'flagged') => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) throw error;

      // Update local state
      setListings(prev => prev.map(listing => 
        listing.id === listingId ? { ...listing, status: newStatus } : listing
      ));
    } catch (error) {
      console.error('Error updating listing status:', error);
      alert('Failed to update listing status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'fruits': 'Fruits',
      'vegetables': 'Vegetables',
      'herbs': 'Herbs & Spices',
      'grains': 'Grains & Cereals',
      'nuts': 'Nuts & Seeds',
      'dried': 'Dried Products',
      'other': 'Other',
    };
    return categoryMap[category] || category;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
        <div className="text-lg">Loading listing moderation...</div>
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
                        <span className="ml-4 text-gray-900">Listing Moderation</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">Listing Moderation</h1>
                <p className="mt-2 text-gray-600">
                  Review, approve, and manage product listings
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  {filteredListings.length} Listings
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
                  placeholder="Search listings..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                <option value="fruits">Fruits</option>
                <option value="vegetables">Vegetables</option>
                <option value="herbs">Herbs & Spices</option>
                <option value="grains">Grains & Cereals</option>
                <option value="nuts">Nuts & Seeds</option>
                <option value="dried">Dried Products</option>
                <option value="other">Other</option>
              </select>
            </div>
            
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
                <option value="price_high">Price: High to Low</option>
                <option value="price_low">Price: Low to High</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCategoryFilter('');
                  setSortBy('newest');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-soft overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    width={400}
                    height={225}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">🌱</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {getCategoryDisplayName(listing.category)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                      {listing.title}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-semibold text-primary">{formatPrice(listing.price_usd)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium">{listing.quantity} {listing.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{listing.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Seller:</span>
                    <span className="font-medium">{listing.users?.full_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">{formatDate(listing.created_at)}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {listing.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/listing/${listing.id}`}
                    className="text-primary hover:text-primary-dark font-medium text-sm flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    {listing.status !== 'published' && (
                      <button
                        onClick={() => handleStatusChange(listing.id, 'published')}
                        className="text-green-600 hover:text-green-700"
                        title="Approve listing"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    {listing.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(listing.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                        title="Reject listing"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    {listing.status !== 'flagged' && (
                      <button
                        onClick={() => handleStatusChange(listing.id, 'flagged')}
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Flag for review"
                      >
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
