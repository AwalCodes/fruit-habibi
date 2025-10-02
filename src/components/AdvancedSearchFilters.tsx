'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FunnelIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  StarIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import StarRating from './StarRating';

export interface SearchFilters {
  searchTerm: string;
  category: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating_high' | 'rating_low';
  hasImages: boolean;
  inStock: boolean;
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  onReset,
  isOpen,
  onToggle
}: AdvancedSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'herbs', label: 'Herbs & Spices' },
    { value: 'grains', label: 'Grains & Cereals' },
    { value: 'nuts', label: 'Nuts & Seeds' },
    { value: 'dried', label: 'Dried Products' },
    { value: 'other', label: 'Other' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating_high', label: 'Highest Rated' },
    { value: 'rating_low', label: 'Lowest Rated' },
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
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
    setLocalFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = () => {
    return localFilters.searchTerm ||
           localFilters.category ||
           localFilters.location ||
           localFilters.minPrice > 0 ||
           localFilters.maxPrice < 10000 ||
           localFilters.minRating > 0 ||
           localFilters.sortBy !== 'newest' ||
           localFilters.hasImages ||
           !localFilters.inStock;
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-yellow-400/30 rounded-xl hover:border-yellow-400/50 transition-all duration-300 shadow-lg hover:shadow-yellow-500/10"
      >
        <FunnelIcon className="w-5 h-5 text-yellow-400" />
        <span className="text-emerald-100 font-medium">Premium Filters</span>
        {hasActiveFilters() && (
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            !
          </span>
        )}
      </button>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 right-0 mt-3 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-yellow-400/30 rounded-2xl shadow-2xl z-50 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              💎 Premium Filters
            </h3>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-emerald-800/30 rounded-full transition-colors duration-300"
            >
              <XMarkIcon className="w-6 h-6 text-emerald-100 hover:text-yellow-300" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search Term */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-yellow-400 mb-3">
                <MagnifyingGlassIcon className="w-4 h-4 inline mr-2" />
                Premium Search
              </label>
              <input
                type="text"
                value={localFilters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search premium products, descriptions..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-yellow-400/30 rounded-xl text-emerald-100 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-3">
                <TagIcon className="w-4 h-4 inline mr-2" />
                Premium Category
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-yellow-400/30 rounded-xl text-emerald-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value} className="bg-slate-800">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-3">
                <MapPinIcon className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={localFilters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="City, Country..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-yellow-400/30 rounded-xl text-emerald-100 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-3">
                ✨ Sort By
              </label>
              <select
                value={localFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-yellow-400/30 rounded-xl text-emerald-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-3">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                💎 Premium Price Range (USD)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={localFilters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                  placeholder="Min"
                  min="0"
                  className="px-4 py-3 bg-slate-700/50 border border-yellow-400/30 rounded-xl text-emerald-100 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
                />
                <input
                  type="number"
                  value={localFilters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                  placeholder="Max"
                  min="0"
                  className="px-4 py-3 bg-slate-700/50 border border-yellow-400/30 rounded-xl text-emerald-100 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-3">
                <StarIcon className="w-4 h-4 inline mr-2" />
                ⭐ Premium Rating
              </label>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={localFilters.minRating}
                  interactive={true}
                  onRatingChange={(rating) => handleFilterChange('minRating', rating)}
                  size="md"
                />
                <span className="text-sm text-emerald-200">
                  {localFilters.minRating > 0 ? `${localFilters.minRating}+ stars` : 'Any rating'}
                </span>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="lg:col-span-3">
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.hasImages}
                    onChange={(e) => handleFilterChange('hasImages', e.target.checked)}
                    className="rounded border-yellow-400/50 text-yellow-400 focus:ring-yellow-400 bg-slate-700/50"
                  />
                  <span className="ml-3 text-sm text-emerald-100">✨ Has Premium Images</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="rounded border-yellow-400/50 text-yellow-400 focus:ring-yellow-400 bg-slate-700/50"
                  />
                  <span className="ml-3 text-sm text-emerald-100">💎 In Premium Stock</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-yellow-400/20">
            <button
              onClick={handleReset}
              className="px-6 py-3 text-emerald-100 hover:text-yellow-300 transition-colors duration-300 font-medium"
            >
              Reset All Filters
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 font-bold flex items-center gap-2"
            >
              ✨ Apply Premium Filters
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
