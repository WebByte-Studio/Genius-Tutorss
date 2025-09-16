'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, PlayCircle, BookOpen, CheckCircle, Star, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { enrollInCourse, formatCoursePrice, calculateDiscountPercentage, type Course } from '@/services/courseService';

interface CourseEnrollmentDialogProps {
  course: Course;
  children: React.ReactNode;
  onEnrollmentSuccess?: () => void;
}

export function CourseEnrollmentDialog({ course, children, onEnrollmentSuccess }: CourseEnrollmentDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await enrollInCourse(course.id);
      
      toast({
        title: 'Success',
        description: 'Successfully enrolled in course!',
      });
      
      setIsOpen(false);
      onEnrollmentSuccess?.();
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to enroll in course',
        variant: 'destructive'
      });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Course Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Course Header */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
              {course.thumbnail_url ? (
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <PlayCircle className="h-16 w-16 text-primary opacity-80" />
              )}
            </div>
            <div className="absolute top-4 left-4 space-y-2">
              <Badge className="bg-gradient-to-r from-green-600 to-green-700">
                {course.category}
              </Badge>
              <Badge variant="secondary">
                {course.level}
              </Badge>
            </div>
            {course.featured && (
              <Badge className="absolute top-4 right-4 bg-yellow-500">
                Featured
              </Badge>
            )}
          </div>

          {/* Course Title and Instructor */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <div className="flex items-center justify-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={course.instructor_avatar} alt={course.instructor_name} />
                <AvatarFallback>
                  {course.instructor_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-lg text-muted-foreground">{course.instructor_name}</span>
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Students</div>
              <div className="font-semibold">{course.enrolled_students || 0}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-semibold">{course.duration_hours}h</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Lessons</div>
              <div className="font-semibold">{course.total_lessons}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="font-semibold capitalize">{course.level}</div>
            </div>
          </div>

          {/* Course Description */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">About This Course</h3>
              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {/* Course Features */}
          {course.learning_outcomes && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                <div className="space-y-2">
                  {course.learning_outcomes.split('\n').map((outcome, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{outcome.trim()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Requirements */}
          {course.requirements && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {course.requirements}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Course Modules Preview */}
          {course.modules && course.modules.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Course Content</h3>
                <div className="space-y-3">
                  {course.modules.slice(0, 5).map((module, index) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Module {index + 1}: {module.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {module.lesson_count || 0} lessons • {module.total_duration || 0} minutes
                        </div>
                      </div>
                      {module.is_free && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Free
                        </Badge>
                      )}
                    </div>
                  ))}
                  {course.modules.length > 5 && (
                    <div className="text-center text-muted-foreground">
                      +{course.modules.length - 5} more modules
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing and Enrollment */}
          <Card className="border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {formatCoursePrice(course.price)}
                    </span>
                    {course.original_price && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatCoursePrice(course.original_price)}
                      </span>
                    )}
                  </div>
                  {course.original_price && (
                    <Badge variant="destructive" className="text-sm">
                      {calculateDiscountPercentage(course.price, course.original_price)}% OFF
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-bold py-3 rounded-lg"
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    ✓ Lifetime access • ✓ Certificate included • ✓ 30-day money-back guarantee
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
