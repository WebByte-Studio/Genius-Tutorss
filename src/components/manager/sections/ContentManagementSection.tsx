'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  Image,
  Video,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Permission {
  [key: string]: boolean;
}

interface Content {
  id: string;
  title: string;
  type: 'testimonial' | 'video' | 'image';
  status: 'published' | 'draft' | 'pending';
  author: string;
  created_at: string;
  content?: string;
  media_url?: string;
  rating?: number;
}

interface ContentManagementSectionProps {
  permissions: Permission;
}

export function ContentManagementSection({ permissions }: ContentManagementSectionProps) {
  const { toast } = useToast();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch content based on permissions
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockContent: Content[] = [
          {
            id: '1',
            title: 'Amazing Tutor Experience',
            type: 'testimonial',
            status: 'published',
            author: 'John Doe',
            created_at: '2024-01-15',
            content: 'My child improved significantly with the help of this tutor...',
            rating: 5
          },
          {
            id: '2',
            title: 'Student Success Story',
            type: 'video',
            status: 'pending',
            author: 'Jane Smith',
            created_at: '2024-01-10',
            media_url: '/videos/success-story.mp4'
          },
          {
            id: '3',
            title: 'Tutor Profile Image',
            type: 'image',
            status: 'draft',
            author: 'Bob Johnson',
            created_at: '2024-01-20',
            media_url: '/images/tutor-profile.jpg'
          }
        ];
        setContent(mockContent);
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          title: 'Error',
          description: 'Failed to load content',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (permissions['content.view']) {
      fetchContent();
    }
  }, [permissions, toast]);

  // Filter content based on search and filters
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle content status change
  const handleStatusChange = async (contentId: string, newStatus: string) => {
    if (!permissions['content.edit']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to edit content',
        variant: 'destructive'
      });
      return;
    }

    try {
      setContent(prev => prev.map(item => 
        item.id === contentId ? { ...item, status: newStatus as any } : item
      ));
      
      toast({
        title: 'Success',
        description: `Content status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating content status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update content status',
        variant: 'destructive'
      });
    }
  };

  // Handle content deletion
  const handleDeleteContent = async (contentId: string) => {
    if (!permissions['content.delete']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to delete content',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      setContent(prev => prev.filter(item => item.id !== contentId));
      
      toast({
        title: 'Success',
        description: 'Content deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        variant: 'destructive'
      });
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'testimonial':
        return <Star className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!permissions['content.view']) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Denied</h3>
        <p className="text-gray-500 text-center">
          You don't have permission to view content management.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">
            Manage testimonials, videos, and images. You have {permissions['content.create'] ? 'create' : ''} 
            {permissions['content.edit'] ? ', edit' : ''} 
            {permissions['content.delete'] ? ', delete' : ''} permissions.
          </p>
        </div>
        {permissions['content.create'] && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search content by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="testimonial">Testimonials</option>
                <option value="video">Videos</option>
                <option value="image">Images</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Content ({filteredContent.length})</span>
            <Badge variant="outline">
              {content.length} total items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No content found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getContentTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                          {item.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        {item.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">{item.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>By {item.author}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      {item.content && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {permissions['content.view'] && (
                      <Button variant="outline" size="sm" title="View Content">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions['content.edit'] && (
                      <Button variant="outline" size="sm" title="Edit Content">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions['content.edit'] && (
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="published">Published</option>
                        <option value="pending">Pending</option>
                        <option value="draft">Draft</option>
                      </select>
                    )}
                    {permissions['content.delete'] && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteContent(item.id)}
                        title="Delete Content"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
