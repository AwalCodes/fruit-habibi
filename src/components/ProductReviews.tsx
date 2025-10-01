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

  const fetchRatingData = async () => {
    try {
      const { data, error } = await supabase
        .from('product_ratings')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching rating data:', error);
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
      console.error('Error fetching rating data:', error);
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
        console.error('Error fetching user review:', error);
        return;
      }

      setUserReview(data);
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const handleReviewSubmitted = () => {
    fetchRatingData();
    fetchUserReview();
    setShowReviewForm(false);
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <StarIcon className="w-6 h-6 text-yellow-400" />
            Reviews & Ratings
          </h2>
          
          {user && !userReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Write Review
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-6">
              Be the first to share your experience with this product!
            </p>
            
            {user && !userReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Write the First Review
              </button>
            )}
          </motion.div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <ReviewForm
              productId={productId}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          </motion.div>
        )}

        {/* User's Existing Review */}
        {userReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-green-900">Your Review</h4>
              <button
                onClick={() => handleEditReview(userReview.id)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={userReview.rating} size="sm" />
              <span className="font-medium text-green-900">{userReview.title}</span>
            </div>
            {userReview.comment && (
              <p className="text-green-800">{userReview.comment}</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
