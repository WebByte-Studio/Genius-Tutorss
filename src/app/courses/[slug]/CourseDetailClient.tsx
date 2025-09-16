'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext.next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Users, PlayCircle, BookOpen, CheckCircle, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  getCourseBySlug, 
  getCourseProgress,
  updateLessonProgress,
  formatCoursePrice,
  type Course,
  type CourseProgress
} from "@/services/courseService";

interface CourseDetailClientProps {
  initialCourse?: Course;
  slug?: string;
}

export default function CourseDetailClient({ initialCourse, slug }: CourseDetailClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(initialCourse || null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(!initialCourse);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);

  const loadCourseData = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      const courseData = await getCourseBySlug(slug);
      setCourse(courseData);
      
      // Load progress if user is enrolled
      if (user) {
        try {
          const progressData = await getCourseProgress(courseData.id);
          setProgress(progressData);
        } catch (error) {
          // User might not be enrolled, which is fine
          console.log('User not enrolled in this course');
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [slug, user, toast]);

  useEffect(() => {
    if (!initialCourse && slug) {
      loadCourseData();
    }
  }, [initialCourse, slug, loadCourseData]);

  const handleLessonClick = async (lesson: any) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access course content',
        variant: 'destructive'
      });
      return;
    }

    if (!progress) {
      toast({
        title: 'Not Enrolled',
        description: 'Please enroll in this course to access lessons',
        variant: 'destructive'
      });
      return;
    }

    // Update progress to mark lesson as started
    try {
      setUpdatingProgress(lesson.id);
      await updateLessonProgress(lesson.id, {
        progress_percentage: 100,
        time_spent_seconds: 0,
        status: 'completed'
      });
      
      // Reload progress
      const updatedProgress = await getCourseProgress(course!.id);
      setProgress(updatedProgress);
      
      // Here you would typically navigate to the lesson content
      toast({
        title: 'Lesson Started',
        description: `Starting lesson: ${lesson.title}`
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to start lesson',
        variant: 'destructive'
      });
    } finally {
      setUpdatingProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Course Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2">
            <div className="relative mb-6">
              <div className="h-64 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                {course.thumbnail_url ? (
                  <Image 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    width={600}
                    height={300}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <PlayCircle className="h-16 w-16 text-green-600" />
                )}
              </div>
              <Badge className="absolute top-4 left-4 bg-green-600">{course.category}</Badge>
              <Badge variant="secondary" className="absolute top-4 right-4">{course.level}</Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={course.instructor_avatar} alt={course.instructor_name} />
                  <AvatarFallback>{course.instructor_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{course.instructor_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.9</span>
                <span className="text-gray-600">(98 reviews)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours}h</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{course.total_lessons} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{course.enrolled_students || 0} students</span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>
          </div>
          
          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {formatCoursePrice(course.price)}
                  </span>
                  {course.original_price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCoursePrice(course.original_price)}
                    </span>
                  )}
                </div>
                
                {progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progress.enrollment.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: 'Authentication Required',
                        description: 'Please log in to enroll in this course',
                        variant: 'destructive'
                      });
                      return;
                    }
                    if (!progress) {
                      // Navigate to enrollment page or show enrollment modal
                      toast({
                        title: 'Enrollment Required',
                        description: 'Please enroll in this course to access content'
                      });
                    }
                  }}
                >
                  {progress ? 'Continue Learning' : 'Enroll Now'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      {course.modules && course.modules.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
          
          {course.modules.map((module: any) => (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{module.title}</span>
                  <span className="text-sm text-gray-600">
                    {module.lesson_count} lessons • {module.total_duration} min
                  </span>
                </CardTitle>
                {module.description && (
                  <p className="text-sm text-gray-600">{module.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {module.lessons?.map((lesson: any) => {
                    const lessonProgress = progress?.lessons.find(l => l.id === lesson.id);
                    const isCompleted = lessonProgress?.progress_status === 'completed';
                    const isAccessible = progress || lesson.is_free;
                    
                    return (
                      <div 
                        key={lesson.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : isAccessible ? (
                            <PlayCircle className="h-5 w-5 text-gray-600" />
                          ) : (
                            <Lock className="h-5 w-5 text-gray-400" />
                          )}
                          <div>
                            <h4 className="font-medium text-sm">{lesson.title}</h4>
                            <p className="text-xs text-gray-600">{lesson.duration_minutes} min</p>
                          </div>
                        </div>
                        
                        {isAccessible ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLessonClick(lesson)}
                            disabled={updatingProgress === lesson.id}
                          >
                            {isCompleted ? 'Review' : 'Start'}
                          </Button>
                        ) : (
                          <Badge variant="secondary">Locked</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
