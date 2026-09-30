import React, { useState } from 'react';
import { Star, StarIcon, MessageSquare, Plus } from 'lucide-react';
import { useReviews } from '../hooks/useReviews';
import ReviewForm from './ReviewForm';

interface ReviewsDisplayProps {
  showAddReview?: boolean;
}

const ReviewsDisplay: React.FC<ReviewsDisplayProps> = ({ showAddReview = true }) => {
  const { getApprovedReviews, getAverageRating, loading } = useReviews();
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const reviews = getApprovedReviews();
  const averageRating = getAverageRating();
  const featuredReviews = reviews.filter(review => review.featured);

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < rating ? 'text-broger-orange fill-current' : 'text-stone-600'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-broger-coal rounded-xl shadow-sm p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-broger-line rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-broger-line rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <div className="bg-broger-coal rounded-xl shadow-sm p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-wide text-broger-cream mb-2">Customer Reviews</h2>
            <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(averageRating), 'lg')}
                </div>
                <span className="text-base md:text-lg font-medium text-broger-cream">{averageRating}</span>
                <span className="text-sm md:text-base text-stone-400">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>
          
          {showAddReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center justify-center space-x-2 bg-broger-orange text-broger-ink font-semibold px-4 py-2 rounded-lg hover:bg-broger-glow transition-colors duration-200 w-full md:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Write a Review</span>
            </button>
          )}
        </div>

        {/* Featured Reviews */}
        {featuredReviews.length > 0 && (
          <div className="mb-8">
            <h3 className="text-base md:text-lg font-medium text-broger-cream mb-4 flex items-center">
              <StarIcon className="h-4 w-4 md:h-5 md:w-5 text-broger-orange mr-2" />
              Featured Reviews
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {featuredReviews.slice(0, 2).map((review) => (
                <div key={review.id} className="bg-broger-ash border border-broger-orange/40 rounded-lg p-4 md:p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    {renderStars(review.rating, 'md')}
                    <span className="text-xs md:text-sm text-broger-orange font-medium">Featured</span>
                  </div>
                  <h4 className="font-medium text-broger-cream mb-2 text-sm md:text-base">{review.title}</h4>
                  <p className="text-stone-400 text-xs md:text-sm mb-3 line-clamp-3">{review.content}</p>
                  
                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {review.images.slice(0, 2).map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded border border-broger-line cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs md:text-sm text-stone-400 flex-wrap gap-1">
                    <span>{review.customer_name}</span>
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Reviews */}
        {reviews.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-medium text-broger-cream">All Reviews</h3>
            <div className="space-y-3 md:space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-broger-line rounded-lg p-4 md:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2 flex-wrap">
                        <h4 className="font-medium text-broger-cream text-sm md:text-base">{review.title}</h4>
                        {review.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-broger-orange/15 text-broger-orange">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mb-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-xs md:text-sm text-stone-400">({review.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-stone-400 mb-4 text-sm md:text-base">{review.content}</p>
                  
                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
                      {review.images.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-broger-line cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs md:text-sm text-stone-400 flex-wrap gap-1">
                    <span>{review.customer_name}</span>
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <MessageSquare className="h-8 w-8 md:h-12 md:w-12 text-stone-500 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-broger-cream mb-2">No reviews yet</h3>
            <p className="text-sm md:text-base text-stone-400 mb-4 md:mb-6">Be the first to share your experience!</p>
            {showAddReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-broger-orange text-broger-ink font-semibold px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-broger-glow transition-colors duration-200 text-sm md:text-base"
              >
                Write the First Review
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-broger-coal rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-broger-cream">Write a Review</h2>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-stone-500 hover:text-broger-orange"
                >
                  <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ReviewForm onClose={() => setShowReviewForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsDisplay;

