import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Review, ReviewFormData } from '../types';

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (approvedOnly: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (approvedOnly) {
        query = query.eq('approved', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (reviewData: ReviewFormData) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) throw error;

      setReviews(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding review:', err);
      setError(err instanceof Error ? err.message : 'Failed to add review');
      throw err;
    }
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReviews(prev => prev.map(review => 
        review.id === id ? data : review
      ));
      return data;
    } catch (err) {
      console.error('Error updating review:', err);
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReviews(prev => prev.filter(review => review.id !== id));
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    }
  };

  const approveReview = async (id: string) => {
    return updateReview(id, { approved: true });
  };

  const unapproveReview = async (id: string) => {
    return updateReview(id, { approved: false });
  };

  const featureReview = async (id: string) => {
    return updateReview(id, { featured: true });
  };

  const unfeatureReview = async (id: string) => {
    return updateReview(id, { featured: false });
  };

  const getFeaturedReviews = () => {
    return reviews.filter(review => review.approved && review.featured);
  };

  const getApprovedReviews = () => {
    return reviews.filter(review => review.approved);
  };

  const getPendingReviews = () => {
    return reviews.filter(review => !review.approved);
  };

  const getAverageRating = () => {
    const approvedReviews = getApprovedReviews();
    if (approvedReviews.length === 0) return 0;
    
    const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / approvedReviews.length) * 10) / 10;
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    addReview,
    updateReview,
    deleteReview,
    approveReview,
    unapproveReview,
    featureReview,
    unfeatureReview,
    getFeaturedReviews,
    getApprovedReviews,
    getPendingReviews,
    getAverageRating
  };
};

