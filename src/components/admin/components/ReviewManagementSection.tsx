'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { MoreHorizontal, Star, Search, Filter, Trash, Eye, CheckCircle, XCircle, MessageSquare, RefreshCw, Edit } from "lucide-react";
import { getReviews, updateReviewStatus, updateReviewDetails, deleteReview, addReviewResponse, Review, ReviewStats } from "@/services/reviewService";

export function ReviewManagementSection() {
  const { toast } = useToast();
  
  // State for reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  
  // State for editing review
  const [editingReview, setEditingReview] = useState<Partial<Review>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (ratingFilter !== 'all') filters.rating = ratingFilter;
      
      console.log('Fetching reviews with filters:', filters);
      const response = await getReviews(filters);
      console.log('Reviews response:', response);
      
      const reviewsData = response.data || [];
      console.log('Reviews data:', reviewsData);
      
      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Set empty arrays on error to prevent undefined issues
      setReviews([]);
      setFilteredReviews([]);
      toast({
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side filtering for better real-time performance
  const applyFilters = () => {
    let filtered = [...reviews];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.student_name?.toLowerCase().includes(query) ||
        review.tutor_name?.toLowerCase().includes(query) ||
        review.subject?.toLowerCase().includes(query) ||
        review.comment?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }
    
    // Apply rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }
    
    setFilteredReviews(filtered);
  };
  
  // Apply filters when filter state changes - use client-side filtering for real-time performance
  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, ratingFilter, reviews]);
  
  // Handle review approval
  const handleApproveReview = async (id: string) => {
    try {
      setIsProcessing(true);
      await updateReviewStatus(id, 'approved');
      
      // Update local state immediately for better UX
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === id ? { ...review, status: 'approved' } : review
        )
      );
      
      setFilteredReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === id ? { ...review, status: 'approved' } : review
        )
      );
      
      toast({
        title: "Review Approved",
        description: "The review has been approved and is now visible to users.",
      });
    } catch (error) {
      console.error('Error approving review:', error);
      toast({
        title: "Error",
        description: "Failed to approve review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle review rejection
  const handleRejectReview = async (id: string) => {
    try {
      setIsProcessing(true);
      await updateReviewStatus(id, 'rejected');
      
      // Update local state immediately for better UX
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === id ? { ...review, status: 'rejected' } : review
        )
      );
      
      setFilteredReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === id ? { ...review, status: 'rejected' } : review
        )
      );
      
      toast({
        title: "Review Rejected",
        description: "The review has been rejected and will not be displayed.",
      });
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast({
        title: "Error",
        description: "Failed to reject review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle review deletion
  const handleDeleteReview = async (id: string) => {
    try {
      setIsProcessing(true);
      await deleteReview(id);
      
      // Update local state immediately for better UX
      setReviews(prevReviews => prevReviews.filter(review => review.id !== id));
      setFilteredReviews(prevReviews => prevReviews.filter(review => review.id !== id));
      
      toast({
        title: "Review Deleted",
        description: "The review has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle adding response to review
  const handleAddResponse = async (id: string, response: string) => {
    try {
      setIsProcessing(true);
      const result = await addReviewResponse(id, response);
      
      console.log('Response added successfully:', result);
      
      // Update the local state immediately for better UX
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === id 
            ? { 
                ...review, 
                response: response.trim(),
                response_created_at: new Date().toISOString()
              }
            : review
        )
      );
      
      setFilteredReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === id 
            ? { 
                ...review, 
                response: response.trim(),
                response_created_at: new Date().toISOString()
              }
            : review
        )
      );
      
      setResponseText('');
      setShowResponseModal(false);
      
      toast({
        title: "Response Added",
        description: "Response has been added to the review successfully.",
      });
    } catch (error) {
      console.error('Error adding response:', error);
      toast({
        title: "Error",
        description: "Failed to add response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle edit review
  const handleEditReview = (review: Review) => {
    setEditingReview({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      subject: review.subject,
      status: review.status
    });
    setShowEditModal(true);
  };

  // Handle save edited review
  const handleSaveEdit = async () => {
    if (!editingReview.id) return;
    
    try {
      setIsEditing(true);
      
      // Update review details
      await updateReviewDetails(editingReview.id, {
        rating: editingReview.rating,
        comment: editingReview.comment,
        subject: editingReview.subject,
        status: editingReview.status
      });
      
      // Update local state immediately for better UX
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === editingReview.id 
            ? { 
                ...review, 
                rating: editingReview.rating || review.rating,
                comment: editingReview.comment || review.comment,
                subject: editingReview.subject || review.subject,
                status: editingReview.status || review.status
              }
            : review
        )
      );
      
      setFilteredReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === editingReview.id 
            ? { 
                ...review, 
                rating: editingReview.rating || review.rating,
                comment: editingReview.comment || review.comment,
                subject: editingReview.subject || review.subject,
                status: editingReview.status || review.status
              }
            : review
        )
      );
      
      setShowEditModal(false);
      setEditingReview({});
      
      toast({
        title: "Review Updated",
        description: "Review details have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };
  
  // Render stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Review Management</h2>
            <p className="text-white/90 mt-1">Monitor and moderate user reviews across the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white">
              {(filteredReviews || []).length} Reviews
            </Badge>
            <Button 
              variant="secondary" 
              className="bg-white text-green-700 hover:bg-green-50"
              onClick={fetchReviews}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Reviews Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-t-green-600 border-green-200 rounded-full animate-spin"></div>
            </div>
          ) : (filteredReviews || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredReviews || []).map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.student_name}</TableCell>
                      <TableCell>{review.tutor_name}</TableCell>
                      <TableCell>{review.subject}</TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell>{renderStatusBadge(review.status)}</TableCell>
                      <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReview(review);
                                setShowReviewModal(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit className="mr-2 h-4 w-4 text-blue-600" />
                              Edit Review
                            </DropdownMenuItem>
                            {!review.response && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedReview(review);
                                  setShowResponseModal(true);
                                }}
                              >
                                <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                                Add Response
                              </DropdownMenuItem>
                            )}
                            {review.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApproveReview(review.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectReview(review.id)}>
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Review Detail Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Full review information and moderation options
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Student</h4>
                  <p>{selectedReview.student_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tutor</h4>
                  <p>{selectedReview.tutor_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Subject</h4>
                  <p>{selectedReview.subject}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p>{new Date(selectedReview.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm">{selectedReview.rating}/5</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <div>{renderStatusBadge(selectedReview.status)}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Review Comment</h4>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedReview.comment}</p>
              </div>
              
              {selectedReview.response && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Response</h4>
                  <p className="mt-1 p-3 bg-blue-50 rounded-md">{selectedReview.response}</p>
                  {selectedReview.response_created_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Responded on: {new Date(selectedReview.response_created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            {selectedReview && selectedReview.status === 'pending' ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRejectReview(selectedReview.id);
                    setShowReviewModal(false);
                  }}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleApproveReview(selectedReview.id);
                    setShowReviewModal(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            ) : (
              <div></div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Response to Review</DialogTitle>
            <DialogDescription>
              Add a response to this review. This will be visible to the student.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Student</h4>
                  <p>{selectedReview.student_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tutor</h4>
                  <p>{selectedReview.tutor_name}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Review Comment</h4>
                <p className="p-3 bg-gray-50 rounded-md text-sm">{selectedReview.comment}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Your Response</h4>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response to this review..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResponseModal(false);
                setResponseText('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedReview && handleAddResponse(selectedReview.id, responseText)}
              disabled={!responseText.trim() || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Adding...' : 'Add Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Review Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update review details including rating, comment, subject, and status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Rating</h4>
                <Select 
                  value={editingReview.rating?.toString() || ''} 
                  onValueChange={(value) => setEditingReview(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                <Select 
                  value={editingReview.status || ''} 
                  onValueChange={(value) => setEditingReview(prev => ({ ...prev, status: value as 'pending' | 'approved' | 'rejected' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Subject</h4>
              <Input
                value={editingReview.subject || ''}
                onChange={(e) => setEditingReview(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Comment</h4>
              <textarea
                value={editingReview.comment || ''}
                onChange={(e) => setEditingReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Enter review comment"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingReview({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isEditing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isEditing ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}