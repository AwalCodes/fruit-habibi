'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import StarRating from './StarRating';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
  reviewer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ReviewListProps {
  productId: string;
  onEditReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
}

export default function ReviewList({ productId, onEditReview, onDeleteReview }: ReviewListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to fetch reviews with user join
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          updated_at,
          reviewer_id
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching reviews:', error.message);
        setError(null); // Don't show error to user, just log it
        setReviews([]);
        return;
      }

      // If we have reviews, try to fetch user data for each reviewer
      const reviewsWithUsers = await Promise.all(
        (data || []).map(async (review) => {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('id, full_name, avatar_url')
              .eq('id', review.reviewer_id)
              .single();

            return {
              ...review,
              reviewer: userData ? {
                id: userData.id,
                full_name: userData.full_name || 'User',
                avatar_url: userData.avatar_url
              } : {
                id: review.reviewer_id,
                full_name: 'User',
                avatar_url: null
              }
            };
          } catch (userError) {
            console.warn('Error fetching user data:', userError);
            return {
              ...review,
              reviewer: {
                id: review.reviewer_id,
                full_name: 'User',
                avatar_url: null
              }
            };
          }
        })
      );
      
      setReviews(reviewsWithUsers);
    } catch (error) {
      console.warn('Unexpected error fetching reviews:', error);
      setError(null); // Don't show error to user
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;

    const confirmed = window.confirm('Are you sure you want to delete this review?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('reviewer_id', user.id);

      if (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
        return;
      }

      // Remove from local state
      setReviews(reviews.filter(review => review.id !== reviewId));
      
      if (onDeleteReview) {
        onDeleteReview(reviewId);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-full"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Don't show error messages to users - just show empty state
  // if (error) {
  //   return (
  //     <div className="bg-red-50 border border-red-200 rounded-lg p-4">
  //       <p className="text-red-700 text-sm">{error}</p>
  //       <button
  //         onClick={fetchReviews}
  //         className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
  //       >
  //         Try again
  //       </button>
  //     </div>
  //   );
  // }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <UserIcon className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-medium text-emerald-100 mb-2">No reviews yet</h3>
        <p className="text-emerald-200">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedReviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-br from-slate-800/30 to-emerald-900/20 border border-emerald-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/30 to-emerald-600/40 rounded-full flex items-center justify-center border border-emerald-500/30">
                  {review.reviewer.avatar_url ? (
                    <Image
                      src={review.reviewer.avatar_url}
                      alt={review.reviewer.full_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-emerald-400" />
                  )}
              </div>
              <div>
                <h4 className="font-medium text-emerald-100">
                  {review.reviewer.full_name || 'User'}
                </h4>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-sm text-emerald-300">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Actions (for review owner) - Only show delete button */}
            {user && user.id === review.reviewer.id && (
              <div className="relative">
                <button 
                  onClick={() => handleDeleteReview(review.id)}
                  className="p-1 hover:bg-red-800/30 rounded-full transition-colors"
                  title="Delete review"
                >
                  <TrashIcon className="w-5 h-5 text-red-400" />
                </button>
              </div>
            )}
          </div>

          <div>
            <h5 className="font-medium text-emerald-100 mb-2">{review.title}</h5>
            {review.comment && (
              <p className="text-emerald-200 leading-relaxed">{review.comment}</p>
            )}
          </div>
        </motion.div>
      ))}

      {/* Show More/Less Button */}
      {reviews.length > 3 && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-emerald-400 hover:text-emerald-300 font-medium text-sm px-4 py-2 rounded-lg hover:bg-emerald-800/30 transition-colors"
          >
            {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
          </button>
        </div>
      )}
    </div>
  );
}
