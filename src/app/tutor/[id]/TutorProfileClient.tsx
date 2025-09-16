'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext.next';
import tutorService from '@/services/tutorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, GraduationCap, Clock, Mail, Phone, Eye, Calendar, Users, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface TutorProfileClientProps {
  tutorId: string;
}

export default function TutorProfileClient({ tutorId }: TutorProfileClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tutorResponse = await tutorService.getTutorById(tutorId);
        if (tutorResponse.success) {
          setTutor(tutorResponse.data);
        } else {
          setError('Failed to fetch tutor profile');
        }
      } catch (err) {
        console.error('Error fetching tutor profile:', err);
        setError('Failed to fetch tutor profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchTutorData();
    }
  }, [tutorId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-6">
            <Skeleton className="h-12 w-96" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !tutor) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tutor Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The tutor profile you\'re looking for doesn\'t exist.'}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tutor Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tutor Avatar and Basic Info */}
            <div className="lg:col-span-1 text-center lg:text-left">
              <Avatar className="w-32 h-32 mx-auto lg:mx-0 mb-4">
                <AvatarImage src={tutor.profile_picture} alt={tutor.full_name} />
                <AvatarFallback className="text-2xl">
                  {tutor.full_name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">{tutor.full_name}</h1>
                <p className="text-gray-600">{tutor.profession || 'Professional Tutor'}</p>
                
                <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{tutor.district}, {tutor.area}</span>
                </div>
              </div>
            </div>

            {/* Tutor Details */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Education</p>
                      <p className="text-sm text-gray-600">{tutor.education || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Experience</p>
                      <p className="text-sm text-gray-600">{tutor.experience_years || 0} years</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Profile Views</p>
                      <p className="text-sm text-gray-600">{tutor.profile_views || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Students Taught</p>
                      <p className="text-sm text-gray-600">{tutor.students_taught || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Tutor
                </Button>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tutor Content Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {tutor.bio || 'No bio available for this tutor.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subjects & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutor.subjects && tutor.subjects.length > 0 ? (
                    tutor.subjects.map((subject: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{subject}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No subjects specified.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span>{tutor.email || 'Email not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span>{tutor.phone || 'Phone not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>{tutor.district}, {tutor.area}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
}
