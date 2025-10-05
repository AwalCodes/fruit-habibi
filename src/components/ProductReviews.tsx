'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import StarRating from './StarRating';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { motion } from 'framer-motion';
import { 
  StarIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';

interface ProductRating {
  total_reviews: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [userReview, setUserReview] = useState<{
    id: string;
    rating: number;
    title: string;
    comment: string | null;
    created_at: string;
  } | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatingData();
    if (user) {
      fetchUserReview();
    }
  }, [productId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showReviewForm) {
        setShowReviewForm(false);
      }
    };

    if (showReviewForm) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showReviewForm]);

  const fetchRatingData = async () => {
    try {
      // First try to get from the view
      const { data, error } = await supabase
        .from('product_ratings')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Product ratings view not available, using fallback:', error.message);
        
        // Fallback: calculate ratings directly from reviews table
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', productId);

        if (reviewsError) {
          console.warn('Fallback review query also failed:', reviewsError.message);
          // Set empty rating but don't show error to user
          setRating({
            total_reviews: 0,
            average_rating: 0,
            five_star: 0,
            four_star: 0,
            three_star: 0,
            two_star: 0,
            one_star: 0
          });
          return;
        }

        // Calculate ratings manually
        const totalReviews = reviewsData.length;
        const averageRating = totalReviews > 0 ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
        const ratingCounts = reviewsData.reduce((counts, r) => {
          counts[`${r.rating}_star`] = (counts[`${r.rating}_star`] || 0) + 1;
          return counts;
        }, {} as any);

        setRating({
          total_reviews: totalReviews,
          average_rating: Math.round(averageRating * 100) / 100,
          five_star: ratingCounts.five_star || 0,
          four_star: ratingCounts.four_star || 0,
          three_star: ratingCounts.three_star || 0,
          two_star: ratingCounts.two_star || 0,
          one_star: ratingCounts.one_star || 0
        });
        return;
      }

      setRating(data || {
        total_reviews: 0,
        average_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      });
    } catch (error) {
      console.warn('Unexpected error fetching rating data:', error);
      // Set empty rating but don't show error to user
      setRating({
        total_reviews: 0,
        average_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('reviewer_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching user review:', error.message);
        setUserReview(null);
        return;
      }

      setUserReview(data);
    } catch (error) {
      console.warn('Unexpected error fetching user review:', error);
      setUserReview(null);
    }
  };

  const handleReviewSubmitted = () => {
    // Hide the form immediately for smooth UX
    setShowReviewForm(false);
    
    // Fetch new data in the background
    fetchRatingData();
    fetchUserReview();
  };

  const handleEditReview = (_reviewId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit review:', _reviewId);
  };

  const handleDeleteReview = (_reviewId: string) => {
    // Refresh data after deletion
    fetchRatingData();
    fetchUserReview();
  };

  const getRatingPercentage = (count: number) => {
    if (!rating || rating.total_reviews === 0) return 0;
    return (count / rating.total_reviews) * 100;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-emerald-900/30 rounded-xl border border-emerald-500/20 p-6 backdrop-blur-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-emerald-200/20 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-emerald-200/20 rounded w-full"></div>
            <div className="h-4 bg-emerald-200/20 rounded w-3/4"></div>
            <div className="h-4 bg-emerald-200/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-emerald-900/30 rounded-xl border border-emerald-500/20 backdrop-blur-sm shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-emerald-500/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
            <StarIcon className="w-6 h-6 text-yellow-400" />
            Reviews & Ratings
          </h2>
          
          {/* Single contextual review button */}
          {user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25"
            >
              <PlusIcon className="w-4 h-4" />
              {userReview ? 'Edit Review' : (rating && rating.total_reviews > 0 ? 'Write Review' : 'Write First Review')}
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {rating && rating.total_reviews > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-left"
              >
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <StarRating 
                    rating={rating.average_rating} 
                    size="lg" 
                    showNumber={true}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Based on {rating.total_reviews} review{rating.total_reviews !== 1 ? 's' : ''}
                </p>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = rating[`${stars}_star` as keyof ProductRating] as number;
                    const percentage = getRatingPercentage(count);
                    
                    return (
                      <div key={stars} className="flex items-center gap-2 text-sm">
                        <span className="w-8 text-gray-600">{stars}</span>
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-gray-600 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <ReviewList
                  productId={productId}
                  onEditReview={handleEditReview}
                  onDeleteReview={handleDeleteReview}
                />
              </motion.div>
            </div>
          </div>
        ) : (
          /* No Reviews State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-emerald-100 mb-2">No reviews yet</h3>
            <p className="text-emerald-200">
              Be the first to share your experience with this product!
            </p>
          </motion.div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ReviewForm
                productId={productId}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
                existingReview={userReview}
              />
            </motion.div>
            
            {/* Backdrop click to close */}
            <div 
              className="absolute inset-0 -z-10"
              onClick={() => setShowReviewForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
