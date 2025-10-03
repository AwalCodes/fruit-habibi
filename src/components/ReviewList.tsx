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

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          updated_at,
          reviewer:reviewer_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
        return;
      }

      // Transform data to match Review interface
      const transformedData = data?.map((review: any) => ({
        ...review,
        reviewer: Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer
      })) || [];
      
      setReviews(transformedData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={fetchReviews}
          className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-500">Be the first to review this product!</p>
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
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {review.reviewer.avatar_url ? (
                    <Image
                      src={review.reviewer.avatar_url}
                      alt={review.reviewer.full_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {review.reviewer.full_name || 'Anonymous User'}
                </h4>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-sm text-gray-500">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Actions (for review owner) */}
            {user && user.id === review.reviewer.id && (
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                </button>
                {/* Dropdown menu would go here - simplified for now */}
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={() => onEditReview?.(review.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
            {review.comment && (
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            )}
          </div>
        </motion.div>
      ))}

      {/* Show More/Less Button */}
      {reviews.length > 3 && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
          </button>
        </div>
      )}
    </div>
  );
}
