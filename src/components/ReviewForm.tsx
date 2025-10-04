'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import StarRating from './StarRating';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to write a review.' });
      return;
    }

    if (rating === 0) {
      setMessage({ type: 'error', text: 'Please select a rating.' });
      return;
    }

    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a review title.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          reviewer_id: user.id,
          rating,
          title: title.trim(),
          comment: comment.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          setMessage({ type: 'error', text: 'You have already reviewed this product.' });
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setMessage({ type: 'error', text: 'Reviews feature is not available yet. Please try again later.' });
        } else {
          setMessage({ type: 'error', text: 'Failed to submit review. Please try again.' });
        }
        console.error('Review submission error:', error);
      } else {
        setMessage({ type: 'success', text: 'Review submitted successfully!' });
        setRating(0);
        setTitle('');
        setComment('');
        
        // Call the callback after a short delay
        setTimeout(() => {
          if (onReviewSubmitted) {
            onReviewSubmitted();
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Review submission error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setTitle('');
    setComment('');
    setMessage(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-emerald-500/20 p-8 shadow-2xl"
    >
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
          ⭐
        </span>
        Write a Review
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-emerald-200 mb-3">
            Rating *
          </label>
          <div className="flex items-center gap-2 mb-2">
            <StarRating
              rating={rating}
              interactive={true}
              onRatingChange={setRating}
              size="lg"
            />
          </div>
          <p className="text-sm text-emerald-300 font-medium">
            {rating === 0 && 'Select a rating'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-emerald-200 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience..."
            className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            maxLength={100}
            required
          />
          <p className="text-sm text-emerald-300 mt-2">{title.length}/100 characters</p>
        </div>

        {/* Review Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-emerald-200 mb-2">
            Review Details (Optional)
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share more details about your experience with this product..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-700/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
            maxLength={1000}
          />
          <p className="text-sm text-emerald-300 mt-2">{comment.length}/1000 characters</p>
        </div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg flex items-center gap-3 border ${
              message.type === 'success' 
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' 
                : 'bg-red-500/20 text-red-200 border-red-500/30'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-400" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <motion.button
            type="submit"
            disabled={isSubmitting || rating === 0 || !title.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Review'
            )}
          </motion.button>
          
          {onCancel && (
            <motion.button
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 border border-emerald-500/30 rounded-lg text-emerald-200 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
}


