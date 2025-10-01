'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AdvancedSearchFilters, { SearchFilters } from '@/components/AdvancedSearchFilters';
import SearchResults from '@/components/SearchResults';
import { SearchService, SearchResult } from '@/lib/searchUtils';
import Link from 'next/link';


export default function ListingsPage() {
  const [products, setProducts] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: '',
    location: '',
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
    sortBy: 'newest',
    hasImages: false,
    inStock: true
  });
  const { user } = useAuth();


  useEffect(() => {
    searchProducts();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const searchProducts = async () => {
    try {
      setLoading(true);
      const results = await SearchService.searchProducts(filters, user?.id);
      
      // Apply rating-based sorting if needed
      const sortedResults = SearchService.sortProductsByRating(results, filters.sortBy);
      setProducts(sortedResults);
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: SearchFilters = {
      searchTerm: '',
      category: '',
      location: '',
      minPrice: 0,
      maxPrice: 10000,
      minRating: 0,
      sortBy: 'newest',
      hasImages: false,
      inStock: true
    };
    setFilters(resetFilters);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading listings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
              <p className="mt-2 text-gray-600">
                Discover fresh produce from trusted suppliers worldwide
              </p>
            </div>
            {user && (
              <Link
                href="/listings/create"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Create Listing
              </Link>
            )}
          </div>
        </div>

        {/* Advanced Search and Filters */}
        <div className="relative mb-8">
          <div className="flex items-center gap-4">
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
              isOpen={showAdvancedFilters}
              onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
            />
          </div>
        </div>

        {/* Search Results */}
        <SearchResults
          products={products}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={loading}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}
