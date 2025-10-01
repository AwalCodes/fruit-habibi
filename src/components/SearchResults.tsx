'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { 
  Squares2X2Icon, 
  ListBulletIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { SearchFilters } from './AdvancedSearchFilters';

interface Product {
  id: string;
  title: string;
  description: string;
  price_usd: number;
  quantity: number;
  unit: string;
  location: string;
  category: string;
  images: string[];
  status: string;
  owner_id: string;
  created_at: string;
  users: {
    full_name: string;
  };
  rating?: {
    average_rating: number;
    total_reviews: number;
  };
}

interface SearchResultsProps {
  products: Product[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  loading: boolean;
  currentUserId?: string;
}

export default function SearchResults({
  products,
  filters,
  onFiltersChange,
  loading,
  currentUserId
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const getFilterSummary = () => {
    const activeFilters = [];
    
    if (filters.searchTerm) {
      activeFilters.push(`"${filters.searchTerm}"`);
    }
    
    if (filters.category) {
      const categoryLabel = filters.category.charAt(0).toUpperCase() + filters.category.slice(1);
      activeFilters.push(categoryLabel);
    }
    
    if (filters.location) {
      activeFilters.push(`in ${filters.location}`);
    }
    
    if (filters.minPrice > 0 || filters.maxPrice < 10000) {
      activeFilters.push(`$${filters.minPrice}-$${filters.maxPrice}`);
    }
    
    if (filters.minRating > 0) {
      activeFilters.push(`${filters.minRating}+ stars`);
    }
    
    if (filters.hasImages) {
      activeFilters.push('with images');
    }
    
    if (!filters.inStock) {
      activeFilters.push('out of stock');
    }

    return activeFilters;
  };

  const clearFilter = (filterType: keyof SearchFilters, value: any = '') => {
    const newFilters = { ...filters, [filterType]: value };
    onFiltersChange(newFilters);
  };

  const activeFilters = getFilterSummary();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for filters */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>

        {/* Loading skeleton for results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-soft overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary and Controls */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Results Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </h2>
            {activeFilters.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Filtered by: {activeFilters.join(', ')}
              </p>
            )}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating_high">Highest Rated</option>
              <option value="rating_low">Lowest Rated</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.searchTerm && (
                <button
                  onClick={() => clearFilter('searchTerm')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  "{filters.searchTerm}"
                  <span className="text-green-600">×</span>
                </button>
              )}
              {filters.category && (
                <button
                  onClick={() => clearFilter('category')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  {filters.category}
                  <span className="text-green-600">×</span>
                </button>
              )}
              {filters.location && (
                <button
                  onClick={() => clearFilter('location')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  {filters.location}
                  <span className="text-green-600">×</span>
                </button>
              )}
              {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
                <button
                  onClick={() => {
                    clearFilter('minPrice', 0);
                    clearFilter('maxPrice', 10000);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  ${filters.minPrice}-${filters.maxPrice}
                  <span className="text-green-600">×</span>
                </button>
              )}
              {filters.minRating > 0 && (
                <button
                  onClick={() => clearFilter('minRating', 0)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  {filters.minRating}+ stars
                  <span className="text-green-600">×</span>
                </button>
              )}
              {filters.hasImages && (
                <button
                  onClick={() => clearFilter('hasImages', false)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  with images
                  <span className="text-green-600">×</span>
                </button>
              )}
              {!filters.inStock && (
                <button
                  onClick={() => clearFilter('inStock', true)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  out of stock
                  <span className="text-green-600">×</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-soft">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or clearing some filters
          </p>
          <button
            onClick={() => {
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
              onFiltersChange(resetFilters);
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard
                id={product.id}
                title={product.title}
                description={product.description}
                price={product.price_usd}
                quantity={product.quantity}
                unit={product.unit}
                location={product.location}
                category={product.category}
                images={product.images}
                ownerName={product.users?.full_name || 'Unknown'}
                ownerId={product.owner_id}
                createdAt={product.created_at}
                currentUserId={currentUserId}
                averageRating={product.rating?.average_rating}
                reviewCount={product.rating?.total_reviews}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
