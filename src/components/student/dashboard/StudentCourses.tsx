"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, RefreshCw } from "lucide-react";

interface StudentCoursesProps {
  enrollments: any[];
  isLoadingEnrollments: boolean;
}

export function StudentCourses({
  enrollments,
  isLoadingEnrollments
}: StudentCoursesProps) {
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEnrollments ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your courses...</p>
            </div>
          ) : (enrollments || []).length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700" 
                onClick={() => window.location.href = '/courses'}
              >
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(enrollments || []).map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      {enrollment.thumbnail_url ? (
                        <img 
                          src={enrollment.thumbnail_url} 
                          alt={enrollment.course_title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-green-600" />
                      )}
                    </div>
                    <Badge className="absolute top-4 left-4 bg-green-600">
                      {enrollment.status}
                    </Badge>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-white mt-1 font-medium">
                        {enrollment.progress_percentage}% Complete
                      </p>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{enrollment.course_title}</CardTitle>
                    <p className="text-sm text-muted-foreground">Instructor: {enrollment.instructor_name}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Enrolled:</span>
                      <span>{new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                    </div>
                    
                    {enrollment.last_accessed && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last accessed:</span>
                        <span>{new Date(enrollment.last_accessed).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment:</span>
                      <Badge 
                        variant={enrollment.payment_status === 'completed' ? 'default' : 'outline'}
                        className={enrollment.payment_status === 'completed' ? 'bg-green-600' : ''}
                      >
                        {enrollment.payment_status}
                      </Badge>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => window.location.href = `/courses/${enrollment.slug}`}
                      >
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
