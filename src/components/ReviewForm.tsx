'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import StarRating from './StarRating';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, StarIcon } from '@heroicons/react/24/solid';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    title: string;
    comment: string | null;
  } | null;
}

export default function ReviewForm({ productId, onReviewSubmitted, onCancel, existingReview }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [internalExistingReview, setInternalExistingReview] = useState<any>(null);

  // Check for existing review when component mounts (if not provided as prop)
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!user || existingReview) return; // Skip if existingReview is provided as prop

      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('reviewer_id', user.id)
          .single();

        if (data) {
          setInternalExistingReview(data);
          setMessage({ 
            type: 'error', 
            text: 'You have already reviewed this product. Click "Edit Review" to modify your review.' 
          });
        }
      } catch (error) {
        // No existing review found, which is fine
        console.log('No existing review found');
      }
    };

    checkExistingReview();
  }, [user, productId, existingReview]);

  // Pre-fill form when existingReview is provided
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title);
      setComment(existingReview.comment || '');
    }
  }, [existingReview]);

  // Calculate current existing review for use throughout the component
  const currentExistingReview = existingReview || internalExistingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to write a review.' });
      return;
    }

    // Prevent duplicate submission only if we're trying to create a new review when one already exists
    if (!currentExistingReview && internalExistingReview) {
      setMessage({ 
        type: 'error', 
        text: 'You have already reviewed this product. Please close this form and use the "Edit Review" button to modify your review.' 
      });
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
      let error;
      
      if (currentExistingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            rating,
            title: title.trim(),
            comment: comment.trim() || null,
          })
          .eq('id', currentExistingReview.id);

        error = updateError;
      } else {
        // Create new review
        const { error: insertError } = await supabase
          .from('reviews')
          .insert({
            product_id: productId,
            reviewer_id: user.id,
            rating,
            title: title.trim(),
            comment: comment.trim() || null,
          });

        error = insertError;
      }

      if (error) {
        console.error('Review submission error:');
        console.error('- Message:', error.message);
        console.error('- Code:', error.code);
        console.error('- Details:', error.details);
        console.error('- Hint:', error.hint);
        console.error('- Full error object:', error);
        console.error('- Error type:', typeof error);
        console.error('- Error keys:', Object.keys(error));
        
        if (error.code === '23505') {
          setMessage({ type: 'error', text: 'You have already reviewed this product.' });
        } else if (error.code === '42P17') {
          setMessage({ 
            type: 'error', 
            text: 'Reviews system is being updated. Please refresh the page and try again.' 
          });
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setMessage({ 
            type: 'error', 
            text: 'Reviews feature is being updated. Please try again in a few minutes.' 
          });
        } else if (error.code === '42501') {
          setMessage({ 
            type: 'error', 
            text: 'Permission denied. Please make sure you are logged in and try again.' 
          });
        } else {
          setMessage({ type: 'error', text: `Failed to ${currentExistingReview ? 'update' : 'submit'} review: ${error.message || 'Unknown error'}` });
        }
      } else {
        setMessage({ type: 'success', text: `Review ${currentExistingReview ? 'updated' : 'submitted'} successfully!` });
        
        // Reset form only if it was a new review
        if (!currentExistingReview) {
          setRating(0);
          setTitle('');
          setComment('');
        }
        
        // Call the callback after a short delay
        setTimeout(() => {
          if (onReviewSubmitted) {
            onReviewSubmitted();
          }
        }, 1500);
      }
    } catch (error: any) {
      console.error('Review submission catch error:');
      console.error('- Message:', error?.message || 'Unknown error');
      console.error('- Stack:', error?.stack);
      console.error('- Full error:', error);
      console.error('- Error type:', typeof error);
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
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-emerald-500/30 p-8 shadow-2xl relative"
    >
      {/* Close Button */}
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 w-8 h-8 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg z-10"
        title="Close review form"
      >
        ✕
      </button>
         <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 flex items-center gap-3">
           <StarIcon className="w-8 h-8 text-yellow-400" />
           {currentExistingReview ? 'Edit Review' : 'Write a Review'}
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
            disabled={isSubmitting || rating === 0 || !title.trim() || !!existingReview}
            whileHover={{ scale: existingReview ? 1 : 1.02 }}
            whileTap={{ scale: existingReview ? 1 : 0.98 }}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </div>
            ) : currentExistingReview ? (
              'Update Review'
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
              className="px-6 py-3 border border-slate-500/30 rounded-lg text-slate-300 hover:bg-slate-500/10 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
}


