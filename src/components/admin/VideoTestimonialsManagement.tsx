'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Play, Plus, Edit, Trash2, Eye, EyeOff, Star, Clock, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllVideoTestimonials, 
  createVideoTestimonial, 
  updateVideoTestimonial, 
  deleteVideoTestimonial, 
  toggleVideoTestimonialStatus,
  VideoTestimonial 
} from "@/services/videoTestimonialService";

export const VideoTestimonialsManagement = () => {
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<VideoTestimonial | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState<VideoTestimonial | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    location: '',
    avatar: '/placeholder.svg',
    videoUrl: '',
    thumbnail: '/placeholder.svg',
    duration: '0:00',
    testimonial: '',
    rating: 5,
    isActive: true
  });

  const fetchVideoTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getAllVideoTestimonials();
      setVideoTestimonials(data);
    } catch (error) {
      console.error('Error fetching video testimonials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch video testimonials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoTestimonials();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      location: '',
      avatar: '/placeholder.svg',
      videoUrl: '',
      thumbnail: '/placeholder.svg',
      duration: '0:00',
      testimonial: '',
      rating: 5,
      isActive: true
    });
    setEditingTestimonial(null);
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, GIF, etc.)',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    formData.append('type', 'video-testimonial');

    try {
      const response = await fetch('/api/upload/thumbnail', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw new Error('Failed to upload thumbnail');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role || !formData.location || !formData.videoUrl || !formData.testimonial) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      setUploading(true);

      let thumbnailUrl = formData.thumbnail;

      // Upload thumbnail if a new file is selected
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadThumbnail(thumbnailFile);
          toast({
            title: 'Success',
            description: 'Thumbnail uploaded successfully'
          });
        } catch (error) {
          toast({
            title: 'Upload Error',
            description: 'Failed to upload thumbnail. Please try again.',
            variant: 'destructive'
          });
          return;
        }
      }

      const submitData = {
        ...formData,
        thumbnail: thumbnailUrl
      };
      
      if (editingTestimonial) {
        await updateVideoTestimonial(editingTestimonial.id, submitData);
        toast({
          title: 'Success',
          description: 'Video testimonial updated successfully'
        });
      } else {
        await createVideoTestimonial(submitData);
        toast({
          title: 'Success',
          description: 'Video testimonial created successfully'
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchVideoTestimonials();
    } catch (error) {
      console.error('Error saving video testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to save video testimonial',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleEdit = (testimonial: VideoTestimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      location: testimonial.location,
      avatar: testimonial.avatar,
      videoUrl: testimonial.videoUrl,
      thumbnail: testimonial.thumbnail,
      duration: testimonial.duration,
      testimonial: testimonial.testimonial,
      rating: testimonial.rating,
      isActive: testimonial.isActive
    });
    setThumbnailPreview(testimonial.thumbnail);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTestimonial) return;
    
    try {
      await deleteVideoTestimonial(deletingTestimonial.id);
      toast({
        title: 'Success',
        description: 'Video testimonial deleted successfully'
      });
      setDeletingTestimonial(null);
      fetchVideoTestimonials();
    } catch (error) {
      console.error('Error deleting video testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete video testimonial',
        variant: 'destructive'
      });
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleVideoTestimonialStatus(id);
      toast({
        title: 'Success',
        description: 'Video testimonial status updated successfully'
      });
      fetchVideoTestimonials();
    } catch (error) {
      console.error('Error toggling video testimonial status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update video testimonial status',
        variant: 'destructive'
      });
    }
  };

  const handleNewVideoTestimonial = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handlePlayVideo = (testimonial: VideoTestimonial) => {
    setSelectedVideo(testimonial);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('/placeholder.svg');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Video Testimonials Management</h2>
            <p className="text-gray-600">Manage student and parent video testimonials</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewVideoTestimonial} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Video Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTestimonial ? 'Edit Video Testimonial' : 'Add New Video Testimonial'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g., HSC Student, Parent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Dhanmondi, Dhaka"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="e.g., https://www.youtube.com/embed/VIDEO_ID"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use YouTube embed URL format: https://www.youtube.com/embed/VIDEO_ID
                  </p>
                </div>

                {/* Thumbnail Upload Section */}
                <div>
                  <Label>Thumbnail Image *</Label>
                  <div className="mt-2">
                    {/* Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragOver 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {thumbnailPreview && thumbnailPreview !== '/placeholder.svg' ? (
                        <div className="relative">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="max-w-full h-32 object-cover rounded-lg mx-auto"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={removeThumbnail}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Drag and drop an image here, or{' '}
                              <button
                                type="button"
                                className="text-green-600 hover:text-green-700 font-medium"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                browse
                              </button>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    
                    {!thumbnailPreview || thumbnailPreview === '/placeholder.svg' ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2:45"
                  />
                </div>
                
                <div>
                  <Label htmlFor="testimonial">Testimonial *</Label>
                  <Textarea
                    id="testimonial"
                    value={formData.testimonial}
                    onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                    placeholder="Enter the testimonial text"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving || uploading} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving || uploading ? 'Saving...' : (editingTestimonial ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-green-600 text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                  <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                    {testimonial.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={testimonial.thumbnail} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <Button
                      onClick={() => handlePlayVideo(testimonial)}
                      className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    >
                      <Play className="h-6 w-6 ml-0.5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {testimonial.duration}
                  </div>
                </div>

                <blockquote className="text-sm text-gray-700 italic">
                  "{testimonial.testimonial.length > 100 
                    ? `${testimonial.testimonial.substring(0, 100)}...` 
                    : testimonial.testimonial}"
                </blockquote>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(testimonial.id)}
                    >
                      {testimonial.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => setDeletingTestimonial(testimonial)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video Testimonial</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the video testimonial from "{testimonial.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingTestimonial(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {videoTestimonials.length === 0 && (
          <div className="text-center py-12">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No video testimonials yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first video testimonial to showcase student success stories.</p>
            <Button onClick={handleNewVideoTestimonial} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add First Video Testimonial
            </Button>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <Button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
              variant="ghost"
            >
              ✕ Close
            </Button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.name}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-bold">{selectedVideo.name}</h3>
              <p className="text-gray-300">{selectedVideo.role} • {selectedVideo.location}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
