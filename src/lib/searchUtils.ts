import { supabase } from './supabase';
import { SearchFilters } from '@/components/AdvancedSearchFilters';

export interface SearchResult {
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

export class SearchService {
  /**
   * Search products with advanced filtering
   */
  static async searchProducts(
    filters: SearchFilters,
    currentUserId?: string
  ): Promise<SearchResult[]> {
    try {
      // Start with base query
      let query = supabase
        .from('products')
        .select(`
          *,
          users!products_owner_id_fkey(full_name)
        `);

      // For non-logged in users, only show published products
      // For logged in users, show published products and their own drafts
      if (!currentUserId) {
        query = query.eq('status', 'published');
      } else {
        query = query.in('status', ['published', 'draft']);
      }

      // Apply text search
      if (filters.searchTerm) {
        query = query.or(
          `title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
        );
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Apply location filter
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Apply price range filter
      if (filters.minPrice > 0) {
        query = query.gte('price_usd', filters.minPrice);
      }
      if (filters.maxPrice < 10000) {
        query = query.lte('price_usd', filters.maxPrice);
      }

      // Apply stock filter
      if (filters.inStock) {
        query = query.gt('quantity', 0);
      }

      // Apply images filter
      if (filters.hasImages) {
        query = query.not('images', 'is', null);
        query = query.not('images', 'eq', '[]');
      }

      // Apply sorting
      query = this.applySorting(query, filters.sortBy);

      // Execute the query
      const { data: products, error } = await query;

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      // Get product IDs for rating lookup
      const productIds = (products || []).map(p => p.id);

      // Fetch ratings for products that have them
      const { data: ratingsData } = await supabase
        .from('product_ratings')
        .select('*')
        .in('product_id', productIds);

      // Combine products with their ratings
      const productsWithRatings = (products || []).map(product => {
        // Filter out draft products for non-owners
        const isOwner = currentUserId === product.owner_id;
        const isVisible = product.status === 'published' || (product.status === 'draft' && isOwner);
        
        if (!isVisible) {
          return null;
        }

        return {
          ...product,
          rating: ratingsData?.find(r => r.product_id === product.id) || null
        };
      }).filter(Boolean) as SearchResult[];

      // Apply rating filter (after combining with ratings)
      let filteredProducts = productsWithRatings;
      if (filters.minRating > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.rating && product.rating.average_rating >= filters.minRating
        );
      }

      return filteredProducts;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * Apply sorting to the query
   */
  private static applySorting(query: any, sortBy: string) {
    switch (sortBy) {
      case 'newest':
        return query.order('created_at', { ascending: false });
      case 'oldest':
        return query.order('created_at', { ascending: true });
      case 'price_low':
        return query.order('price_usd', { ascending: true });
      case 'price_high':
        return query.order('price_usd', { ascending: false });
      case 'rating_high':
        // For rating-based sorting, we'll need to handle this after fetching ratings
        return query.order('created_at', { ascending: false });
      case 'rating_low':
        // For rating-based sorting, we'll need to handle this after fetching ratings
        return query.order('created_at', { ascending: false });
      default:
        return query.order('created_at', { ascending: false });
    }
  }

  /**
   * Sort products by rating (used after fetching data)
   */
  static sortProductsByRating(products: SearchResult[], sortBy: string): SearchResult[] {
    if (sortBy === 'rating_high') {
      return products.sort((a, b) => {
        const aRating = a.rating?.average_rating || 0;
        const bRating = b.rating?.average_rating || 0;
        return bRating - aRating;
      });
    } else if (sortBy === 'rating_low') {
      return products.sort((a, b) => {
        const aRating = a.rating?.average_rating || 0;
        const bRating = b.rating?.average_rating || 0;
        return aRating - bRating;
      });
    }
    return products;
  }

  /**
   * Get search suggestions based on partial input
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('products')
        .select('title, category, location')
        .or(`title.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
        .eq('status', 'published')
        .limit(10);

      if (error) {
        console.error('Error getting search suggestions:', error);
        return [];
      }

      const suggestions = new Set<string>();
      (data || []).forEach(product => {
        suggestions.add(product.title);
        suggestions.add(product.category);
        suggestions.add(product.location);
      });

      return Array.from(suggestions).slice(0, 8);
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  /**
   * Get popular search terms
   */
  static async getPopularSearchTerms(): Promise<string[]> {
    try {
      // This would typically come from analytics, but for now we'll return some common terms
      return [
        'organic fruits',
        'fresh vegetables',
        'herbs and spices',
        'nuts and seeds',
        'grains',
        'dried fruits'
      ];
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      return [];
    }
  }

  /**
   * Get filter counts for faceted search
   */
  static async getFilterCounts(filters: SearchFilters): Promise<{
    categories: { [key: string]: number };
    locations: { [key: string]: number };
    priceRanges: { [key: string]: number };
    ratings: { [key: string]: number };
  }> {
    try {
      // This would be implemented to show counts for each filter option
      // For now, return empty object
      return {
        categories: {},
        locations: {},
        priceRanges: {},
        ratings: {}
      };
    } catch (error) {
      console.error('Error getting filter counts:', error);
      return {
        categories: {},
        locations: {},
        priceRanges: {},
        ratings: {}
      };
    }
  }
}
