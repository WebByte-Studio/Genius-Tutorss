import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, TrendingUp, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext.next';
import { useToast } from '@/components/ui/use-toast';
import { reviewService, type Review, type ReviewStats, type ReviewResponse } from '@/services/reviewService';

export function ReviewsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total_reviews: 0,
    pending_reviews: 0,
    approved_reviews: 0,
    rejected_reviews: 0,
    average_rating: 0,
    five_star_reviews: 0,
    four_star_reviews: 0,
    three_star_reviews: 0,
    two_star_reviews: 0,
    one_star_reviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showEditResponseModal, setShowEditResponseModal] = useState(false);
  const [response, setResponse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchReviews();
      fetchStats();
    }
  }, [user?.id]);

  useEffect(() => {
    filterReviews();
  }, [reviews, ratingFilter, searchTerm]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching reviews for tutor:', user?.id);
      const reviewsData = await reviewService.getMyReviews();
      console.log('Received reviews data:', reviewsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching review stats for tutor:', user?.id);
      const statsData = await reviewService.getMyReviewStats();
      console.log('Received review stats:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching review stats:', error);
      toast({
        title: "Warning",
        description: "Failed to fetch review stats, using calculated values",
        variant: "default"
      });
      // Fallback to calculated stats from reviews
      const total = reviews.length;
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total || 0;
      const distribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
      reviews.forEach(review => {
        const ratingKey = review.rating.toString() as keyof typeof distribution;
        distribution[ratingKey]++;
      });
      
      setStats({
        total_reviews: total,
        pending_reviews: reviews.filter(r => r.status === 'pending').length,
        approved_reviews: reviews.filter(r => r.status === 'approved').length,
        rejected_reviews: reviews.filter(r => r.status === 'rejected').length,
        average_rating: Math.round(averageRating * 10) / 10,
        five_star_reviews: distribution['5'],
        four_star_reviews: distribution['4'],
        three_star_reviews: distribution['3'],
        two_star_reviews: distribution['2'],
        one_star_reviews: distribution['1']
      });
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    // Filter by rating
    if (ratingFilter > 0) {
      filtered = filtered.filter(review => review.rating === ratingFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  };

  const handleRespondToReview = async () => {
    if (!selectedReview || !response.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a response before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewService.respondToReview(selectedReview.id, response);
      
      // Close modal and reset state
      setShowResponseModal(false);
      setSelectedReview(null);
      setResponse('');
      
      // Show success notification with enhanced styling
      toast({
        title: '✅ Response Submitted Successfully!',
        description: 'Your response has been sent and is now visible to the student.',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
      
      // Refresh reviews to show the updated response
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: '❌ Submission Failed',
        description: 'Failed to submit response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateResponse = async () => {
    if (!selectedReview || !response.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a response before updating.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewService.updateReviewResponse(selectedReview.id, response);
      
      // Close modal and reset state
      setShowEditResponseModal(false);
      setSelectedReview(null);
      setResponse('');
      
      // Show success notification with enhanced styling
      toast({
        title: '✅ Response Updated Successfully!',
        description: 'Your response has been updated and is now visible to the student.',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
      
      // Refresh reviews to show the updated response
      await fetchReviews();
    } catch (error) {
      console.error('Error updating response:', error);
      toast({
        title: '❌ Update Failed',
        description: 'Failed to update response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4) return 'text-blue-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingCount = (rating: number): number => {
    switch (rating) {
      case 5: return stats.five_star_reviews;
      case 4: return stats.four_star_reviews;
      case 3: return stats.three_star_reviews;
      case 2: return stats.two_star_reviews;
      case 1: return stats.one_star_reviews;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-600">View and respond to student feedback</p>
        </div>
      </div>

      {/* Overall Rating */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.average_rating.toFixed(1)}</div>
              <div className="flex justify-center mt-2">{renderStars(stats.average_rating)}</div>
              <p className="text-sm text-gray-600">
                Based on {stats.total_reviews} reviews
              </p>
            </div>
            <div className="flex-1 ml-8">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${stats.total_reviews > 0 ? (getRatingCount(rating) / stats.total_reviews) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {getRatingCount(rating)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_reviews}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">5-Star Reviews</p>
                <p className="text-2xl font-bold text-green-600">{stats.five_star_reviews}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">4-Star Reviews</p>
                <p className="text-2xl font-bold text-blue-600">{stats.four_star_reviews}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className={`text-2xl font-bold ${getRatingColor(stats.average_rating)}`}>
                  {stats.average_rating.toFixed(1)}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews by comment, student name, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-500">
                {searchTerm || ratingFilter > 0
                  ? 'Try adjusting your filters or search terms.'
                  : 'No reviews yet. Keep up the great work!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {review.rating} Star{review.rating !== 1 ? 's' : ''}
                      </Badge>
                      {review.subject && (
                        <Badge variant="secondary">
                          {review.subject}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-gray-900">{review.comment}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>By:</span>
                        <span className="font-medium">{review.student_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Date:</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Show existing response if available */}
                    {review.response && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Your Response:</span>
                          {review.response_created_at && (
                            <span className="text-xs text-green-600">
                              {new Date(review.response_created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-green-700">{review.response}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    {review.response ? (
                      <Button
                        onClick={() => {
                          setSelectedReview(review);
                          setResponse(review.response || '');
                          setShowEditResponseModal(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Edit Response
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedReview(review);
                          setResponse('');
                          setShowResponseModal(true);
                        }}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                    )}
                    
                    {review.response && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        ✅ Responded
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Respond to Review Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Respond to Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Response *
                </label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write a thoughtful response to this review..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRespondToReview}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Response'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedReview(null);
                    setResponse('');
                  }}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Response Modal */}
      {showEditResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Response *
                </label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Update your response to this review..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateResponse}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Response'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowEditResponseModal(false);
                    setSelectedReview(null);
                    setResponse('');
                  }}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 