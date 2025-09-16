'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, User, Calendar, Clock, Users, Share2, Map, AlertCircle } from "lucide-react";
import { tuitionJobsService, TuitionJob } from "@/services/tuitionJobsService";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext.next";
import { LoginDialog } from "@/components/auth/LoginDialog";

interface TuitionJobDetailsClientProps {
  jobId: string;
}

export default function TuitionJobDetailsClient({ jobId }: TuitionJobDetailsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [job, setJob] = useState<TuitionJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [resettingApplication, setResettingApplication] = useState(false);

  const fetchJobDetails = useCallback(async (jobId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await tuitionJobsService.getTuitionJobById(jobId);
      if (response.success) {
        setJob(response.data);
      } else {
        setError('Failed to fetch job details');
        toast({
          title: 'Error',
          description: 'Failed to load job details. Please try again later.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('An error occurred while fetching job details');
      toast({
        title: 'Error',
        description: 'An error occurred while loading job details.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const checkExistingApplication = useCallback(async (jobId: string) => {
    if (!user || user.role !== 'tutor') return;
    
    setCheckingApplication(true);
    try {
      const response = await tuitionJobsService.checkTutorApplication(jobId);
      if (response.success) {
        setExistingApplication(response.data);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setCheckingApplication(false);
    }
  }, [user]);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
    }
  }, [jobId, fetchJobDetails]);

  useEffect(() => {
    if (user && user.role === 'tutor' && job) {
      checkExistingApplication(job.id);
    }
  }, [user, job, checkExistingApplication]);

  const handleApplyForJob = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to apply for tuition jobs.',
        variant: 'destructive'
      });
      return;
    }

    if (user.role !== 'tutor') {
      toast({
        title: 'Access Denied',
        description: 'Only tutors can apply for tuition jobs.',
        variant: 'destructive'
      });
      return;
    }

    setApplying(true);
    try {
      const response = await tuitionJobsService.applyForJob(jobId);
      if (response.success) {
        toast({
          title: 'Application Submitted',
          description: 'Your application has been submitted successfully!',
        });
        checkExistingApplication(jobId);
      } else {
        toast({
          title: 'Application Failed',
          description: response.message || 'Failed to submit application. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: 'Application Error',
        description: 'An error occurred while submitting your application.',
        variant: 'destructive'
      });
    } finally {
      setApplying(false);
    }
  };

  const handleResetApplication = async () => {
    if (!user || user.role !== 'tutor') return;
    
    setResettingApplication(true);
    try {
      const response = await tuitionJobsService.resetApplication(jobId);
      if (response.success) {
        toast({
          title: 'Application Reset',
          description: 'Your application has been reset successfully.',
        });
        setExistingApplication(null);
      } else {
        toast({
          title: 'Reset Failed',
          description: response.message || 'Failed to reset application. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error resetting application:', error);
      toast({
        title: 'Reset Error',
        description: 'An error occurred while resetting your application.',
        variant: 'destructive'
      });
    } finally {
      setResettingApplication(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The tuition job you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tuition Job for {job.studentClass}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{job.studentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{job.district}, {job.area}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
            >
              <Map className="h-4 w-4 mr-2" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
            
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{job.extraInformation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Students: {job.numberOfStudents} ({job.studentGender})</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Days per week: {job.daysPerWeek}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Time: {job.tutoringTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Type: {job.tutoringType}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Location */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Schedule & Location</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Days: {job.daysPerWeek} days per week</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Time: {job.tutoringTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Location: {job.locationDetails}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Application Status */}
          {user && user.role === 'tutor' && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Application Status</h3>
                {checkingApplication ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Checking...</p>
                  </div>
                ) : existingApplication ? (
                  <div className="space-y-3">
                    <Badge variant={existingApplication.status === 'accepted' ? 'default' : 'secondary'}>
                      {existingApplication.status}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Applied on {new Date(existingApplication.created_at).toLocaleDateString()}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          Reset Application
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Application</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reset your application? This will allow you to apply again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetApplication}>
                            Reset
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <Button 
                    onClick={handleApplyForJob}
                    disabled={applying}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {applying ? 'Applying...' : 'Apply for this Job'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Summary */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Job Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary</span>
                  <span className="font-semibold text-green-600">
                    ৳{job.salaryRangeMin} - ৳{job.salaryRangeMax}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject</span>
                  <span className="font-semibold">{job.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-semibold">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Location</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Map view for {job.district}, {job.area}</p>
                <p className="text-sm text-gray-500">Interactive map integration can be added here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login Dialog */}
      <LoginDialog>
        <Button variant="outline">Open Login</Button>
      </LoginDialog>
    </div>
  );
}
