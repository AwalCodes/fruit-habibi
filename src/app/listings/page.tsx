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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-emerald-100 flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              Loading premium listings...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8 relative overflow-hidden">
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4 drop-shadow-lg">
                Browse All Listings
              </h1>
              <p className="text-xl text-emerald-100 leading-relaxed">
                Discover luxury fresh produce from trusted premium suppliers worldwide
              </p>
            </div>
            {user && (
              <Link
                href="/listings/create"
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-full font-bold hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 flex items-center gap-2"
              >
                ✨ Create New Listing
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
