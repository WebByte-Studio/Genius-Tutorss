'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  UserCheck,
  FileText,
  Play,
  Clock,
  Award,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  generateCourseSlug,
  formatCoursePrice,
  getCourseAnalytics,
  getCourseStudents,
  type Course,
  type CreateCourseData,
  type CourseAnalytics,
  type CourseStudent
} from '@/services/courseService';

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics | null>(null);
  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');
  
  const [courseForm, setCourseForm] = useState<CreateCourseData>({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    category: '',
    level: 'beginner',
    price: 0,
    original_price: 0,
    thumbnail_url: '',
    video_intro_url: '',
    duration_hours: 0,
    certificate_available: true,
    max_students: 0,
    language: 'English',
    tags: [],
    requirements: '',
    learning_outcomes: '',
    status: 'draft',
    featured: false,
    total_lessons: 0
  });

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourses({ limit: 100 });
      setCourses(response.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Reset form
  const resetForm = () => {
    setCourseForm({
      title: '',
      slug: '',
      description: '',
      short_description: '',
      category: '',
      level: 'beginner',
      price: 0,
      original_price: 0,
      thumbnail_url: '',
      video_intro_url: '',
      duration_hours: 0,
      certificate_available: true,
      max_students: 0,
      language: 'English',
      tags: [],
      requirements: '',
      learning_outcomes: '',
      status: 'draft',
      featured: false,
      total_lessons: 0
    });
  };

  // Handle form input changes
  const handleInputChange = (field: keyof CreateCourseData, value: any) => {
    setCourseForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title') {
      setCourseForm(prev => ({
        ...prev,
        slug: generateCourseSlug(value)
      }));
    }
  };

  // Create course
  const handleCreateCourse = async () => {
    try {
      setSaving(true);
      await createCourse(courseForm);
      toast({
        title: 'Success',
        description: 'Course created successfully'
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create course',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Edit course
  const handleEditCourse = async () => {
    if (!selectedCourse) return;

    try {
      setSaving(true);
      await updateCourse(selectedCourse.id, courseForm);
      toast({
        title: 'Success',
        description: 'Course updated successfully'
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update course',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete the course "${course.title}"? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      await deleteCourse(course.id);
      toast({
        title: 'Success',
        description: `Course "${course.title}" deleted successfully`
      });
      fetchCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete course';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      slug: course.slug,
      description: course.description,
      short_description: course.short_description || '',
      category: course.category,
      level: course.level,
      price: course.price,
      original_price: course.original_price || 0,
      thumbnail_url: course.thumbnail_url || '',
      video_intro_url: course.video_intro_url || '',
      duration_hours: course.duration_hours,
      certificate_available: course.certificate_available,
      max_students: course.max_students || 0,
      language: course.language,
      tags: course.tags || [],
      requirements: course.requirements || '',
      learning_outcomes: course.learning_outcomes || '',
      status: course.status,
      featured: course.featured,
      total_lessons: course.total_lessons || 0
    });
    setIsEditDialogOpen(true);
  };

  // Open analytics dialog
  const openAnalyticsDialog = async (course: Course) => {
    setSelectedCourse(course);
    setIsAnalyticsDialogOpen(true);
    await fetchCourseAnalytics(course.id);
  };

  // Fetch course analytics
  const fetchCourseAnalytics = async (courseId: string) => {
    try {
      setAnalyticsLoading(true);
      const analytics = await getCourseAnalytics(courseId, analyticsPeriod);
      setCourseAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch course analytics',
        variant: 'destructive'
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Open students dialog
  const openStudentsDialog = async (course: Course) => {
    setSelectedCourse(course);
    setIsStudentsDialogOpen(true);
    await fetchCourseStudents(course.id);
  };

  // Fetch course students
  const fetchCourseStudents = async (courseId: string) => {
    try {
      setStudentsLoading(true);
      const response = await getCourseStudents(courseId, { limit: 50 });
      if (response && response.students) {
        setCourseStudents(response.students);
      } else {
        setCourseStudents([]);
        console.warn('No students data in response:', response);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setCourseStudents([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch course students',
        variant: 'destructive'
      });
    } finally {
      setStudentsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Course Management</h2>
          <p className="text-muted-foreground">
            Create and manage online courses with advanced analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchCourses}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={courseForm.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter course title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Course Slug</Label>
                    <Input
                      id="slug"
                      value={courseForm.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="course-slug"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={courseForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter course description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    value={courseForm.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="Brief description for course cards"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={courseForm.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select value={courseForm.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={courseForm.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      placeholder="e.g., English"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (৳)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={courseForm.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="original_price">Original Price (৳)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={courseForm.original_price}
                      onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration_hours">Duration (hours)</Label>
                    <Input
                      id="duration_hours"
                      type="number"
                      value={courseForm.duration_hours}
                      onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_students">Max Students</Label>
                    <Input
                      id="max_students"
                      type="number"
                      value={courseForm.max_students}
                      onChange={(e) => handleInputChange('max_students', parseInt(e.target.value) || 0)}
                      placeholder="0 (unlimited)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_lessons">Total Lessons</Label>
                    <Input
                      id="total_lessons"
                      type="number"
                      value={courseForm.total_lessons}
                      onChange={(e) => handleInputChange('total_lessons', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={courseForm.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={courseForm.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="Course prerequisites and requirements"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="learning_outcomes">Learning Outcomes</Label>
                    <Textarea
                      id="learning_outcomes"
                      value={courseForm.learning_outcomes}
                      onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                      placeholder="What students will learn"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="certificate_available"
                    checked={courseForm.certificate_available}
                    onChange={(e) => handleInputChange('certificate_available', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="certificate_available">Certificate Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={courseForm.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="featured">Featured Course</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCourse} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Creating...' : 'Create Course'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={course.status === 'published' ? 'default' : course.status === 'draft' ? 'secondary' : 'outline'}>
                    {course.status}
                  </Badge>
                  {course.featured && (
                    <Badge variant="default" className="bg-yellow-600">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAnalyticsDialog(course)}
                    title="View Analytics"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openStudentsDialog(course)}
                    title="View Students"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(course)}
                    title="Edit Course"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCourse(course)}
                    title="Delete Course"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.short_description || course.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Instructor</span>
                <span className="font-medium">{course.instructor_name || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <Badge variant="outline">{course.category}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Level</span>
                <Badge variant="outline" className="capitalize">{course.level}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{formatCoursePrice(course.price)}</span>
              </div>
              {course.original_price && course.original_price > course.price && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Original Price</span>
                  <span className="text-muted-foreground line-through">{formatCoursePrice(course.original_price)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Students</span>
                <span>{course.enrolled_students || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span>{course.duration_hours}h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lessons</span>
                <span>{course.total_lessons || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Language</span>
                <span>{course.language}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Certificate</span>
                <Badge variant={course.certificate_available ? 'default' : 'secondary'}>
                  {course.certificate_available ? 'Available' : 'Not Available'}
                </Badge>
              </div>
              {course.max_students && course.max_students > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max Students</span>
                  <span>{course.max_students}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(course.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course: {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={courseForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Course Slug</Label>
                <Input
                  id="edit-slug"
                  value={courseForm.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="course-slug"
                />
              </div>
            </div>
                         <div>
               <Label htmlFor="edit-description">Description</Label>
               <Textarea
                 id="edit-description"
                 value={courseForm.description}
                 onChange={(e) => handleInputChange('description', e.target.value)}
                 placeholder="Enter course description"
                 rows={3}
               />
             </div>
             <div>
               <Label htmlFor="edit-short-description">Short Description</Label>
               <Textarea
                 id="edit-short-description"
                 value={courseForm.short_description}
                 onChange={(e) => handleInputChange('short_description', e.target.value)}
                 placeholder="Brief description for course cards"
                 rows={2}
               />
             </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={courseForm.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <Label htmlFor="edit-level">Level</Label>
                <Select value={courseForm.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-price">Price (৳)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-original-price">Original Price (৳)</Label>
                <Input
                  id="edit-original-price"
                  type="number"
                  value={courseForm.original_price}
                  onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-duration-hours">Duration (hours)</Label>
                <Input
                  id="edit-duration-hours"
                  type="number"
                  value={courseForm.duration_hours}
                  onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-total-lessons">Total Lessons</Label>
                <Input
                  id="edit-total-lessons"
                  type="number"
                  value={courseForm.total_lessons}
                  onChange={(e) => handleInputChange('total_lessons', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-thumbnail-url">Thumbnail URL</Label>
                <Input
                  id="edit-thumbnail-url"
                  value={courseForm.thumbnail_url}
                  onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="edit-video-intro-url">Video Intro URL</Label>
                <Input
                  id="edit-video-intro-url"
                  value={courseForm.video_intro_url}
                  onChange={(e) => handleInputChange('video_intro_url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-language">Language</Label>
                <Input
                  id="edit-language"
                  value={courseForm.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  placeholder="e.g., English"
                />
              </div>
              <div>
                <Label htmlFor="edit-max-students">Max Students</Label>
                <Input
                  id="edit-max-students"
                  type="number"
                  value={courseForm.max_students}
                  onChange={(e) => handleInputChange('max_students', parseInt(e.target.value) || 0)}
                  placeholder="0 (unlimited)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={courseForm.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-requirements">Requirements</Label>
                <Textarea
                  id="edit-requirements"
                  value={courseForm.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Course prerequisites and requirements"
                  rows={2}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-learning-outcomes">Learning Outcomes</Label>
              <Textarea
                id="edit-learning-outcomes"
                value={courseForm.learning_outcomes}
                onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                placeholder="What students will learn"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-certificate-available"
                  checked={courseForm.certificate_available}
                  onChange={(e) => handleInputChange('certificate_available', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-certificate-available">Certificate Available</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={courseForm.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-featured">Featured Course</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCourse} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Updating...' : 'Update Course'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Analytics Dialog */}
      <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Analytics: {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          {analyticsLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : courseAnalytics ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Select value={analyticsPeriod} onValueChange={(value) => {
                  setAnalyticsPeriod(value);
                  if (selectedCourse) {
                    fetchCourseAnalytics(selectedCourse.id);
                  }
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">Total Enrollments</span>
                    </div>
                    <p className="text-2xl font-bold">{courseAnalytics.stats.total_enrollments}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Active Students</span>
                    </div>
                    <p className="text-2xl font-bold">{courseAnalytics.stats.active_enrollments}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-muted-foreground">Completed</span>
                    </div>
                    <p className="text-2xl font-bold">{courseAnalytics.stats.completed_enrollments}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold">৳{courseAnalytics.stats.total_revenue.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Average Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${courseAnalytics.stats.avg_progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Math.round(courseAnalytics.stats.avg_progress || 0)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Lesson Completion Rates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courseAnalytics.lessonStats.map((lesson) => (
                      <div key={lesson.lesson_id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{lesson.lesson_title}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(lesson.completed_attempts / Math.max(lesson.total_attempts, 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {lesson.completed_attempts}/{lesson.total_attempts}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Course Students Dialog */}
      <Dialog open={isStudentsDialogOpen} onOpenChange={setIsStudentsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Students: {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          {studentsLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {courseStudents.length} students enrolled
              </div>
              <div className="space-y-2">
                {courseStudents.map((student) => (
                  <Card key={student.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {student.avatar_url ? (
                              <img src={student.avatar_url} alt={student.full_name} className="w-10 h-10 rounded-full" />
                            ) : (
                              <span className="text-sm font-medium">{student.full_name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {Math.round(student.progress_percentage)}% complete
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Enrolled {new Date(student.enrollment_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
