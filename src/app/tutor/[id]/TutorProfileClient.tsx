'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import tutorService from '@/services/tutorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MapPin, GraduationCap, Clock, Eye, Users, BookOpen, Phone, MessageCircle } from 'lucide-react';
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
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    details: ''
  });

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tutor Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The tutor profile you\'re looking for doesn\'t exist.'}</p>
        </div>
      </div>
    );
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the tutor successfully.",
    });
    setContactForm({ name: '', phone: '', details: '' });
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Section - Personal Profile Card */}
            <div className="lg:col-span-3">
              <Card className="bg-white rounded-lg shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  {/* Tutor Image */}
                  <div className="flex justify-center mb-6">
                    <Avatar className="w-32 h-32">
                <AvatarImage src={tutor.avatar_url} alt={tutor.full_name} />
                <AvatarFallback className="text-2xl">
                  {tutor.full_name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                </AvatarFallback>
              </Avatar>
                  </div>
                  
                  {/* Tutor Name */}
                  <h1 className="text-2xl font-bold text-green-900 text-center mb-6">
                    {tutor.full_name?.toUpperCase() || 'TUTOR NAME'}
                  </h1>
                  
                  {/* Rating and Views */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">
                        {tutor.rating || '0.00'} ({tutor.total_reviews || 0} Review)
                      </span>
                </div>
                    <p className="text-sm text-gray-600">
                      Total views: {tutor.total_views || 0}
                    </p>
            </div>

                  {/* Personal Details */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">
                        {tutor.district}{tutor.area ? ` (${tutor.area})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ID#:</span>
                      <span className="font-semibold">{tutor.tutor_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-semibold">{tutor.gender || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Qualification:</span>
                      <span className="font-semibold text-right max-w-32 break-words">
                        {tutor.qualification || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Area Covered:</span>
                      <span className="font-semibold text-right max-w-32">
                        {tutor.area || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Member Since */}
                  <div className="bg-green-500 text-white p-3 rounded-b-lg -mx-6 -mb-6">
                    <p className="text-sm text-center">
                      Member Since: {formatMemberSince(tutor.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Section - Detailed Information */}
            <div className="lg:col-span-6">
              <Card className="bg-white rounded-lg shadow-lg h-full">
                <CardContent className="p-0">
                  {/* Navigation Tabs */}
                  <Tabs defaultValue="tuition-info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent h-auto p-0">
                        <TabsTrigger 
                          value="tuition-info" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-600 py-3 px-4 text-sm font-medium"
                        >
                          Tuition Info
                        </TabsTrigger>
                        <TabsTrigger 
                          value="education" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-600 py-3 px-4 text-sm font-medium"
                        >
                          Educational Qualification
                        </TabsTrigger>
                        <TabsTrigger 
                          value="reviews" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-600 py-3 px-4 text-sm font-medium"
                        >
                          Ratings & Reviews
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tuition-info" className="p-6 space-y-4">
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Expected Minimum Tk/Month Salary:</span>
                          <span className="font-semibold">{tutor.expected_salary || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Status for Tuition:</span>
                          <span className="font-semibold text-green-600">Available</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Days Per Week:</span>
                          <span className="font-semibold">{tutor.days_per_week || 'N/A'} Day/Week</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Preferred Tuition Style:</span>
                          <span className="font-semibold">
                            {tutor.preferred_tutoring_style ? 
                              (typeof tutor.preferred_tutoring_style === 'string' ? 
                                tutor.preferred_tutoring_style.replace(/[{}'"]/g, '').split(',').join(', ') : 
                                tutor.preferred_tutoring_style) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tutoring Experience:</span>
                          <span className="font-semibold">{tutor.tutoring_experience || 'N/A'} Years</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Place of Learning:</span>
                          <span className="font-semibold">
                            {tutor.place_of_learning ? 
                              (typeof tutor.place_of_learning === 'string' ? 
                                tutor.place_of_learning.replace(/[{}'"]/g, '').split(',').join(', ') : 
                                tutor.place_of_learning) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Extra Facilities:</span>
                          <span className="font-semibold">{tutor.extra_facilities || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Preferred Medium of Instruction:</span>
                          <span className="font-semibold">
                            {tutor.preferred_medium ? 
                              (typeof tutor.preferred_medium === 'string' ? 
                                tutor.preferred_medium.replace(/[{}'"]/g, '').split(',').join(', ') : 
                                tutor.preferred_medium) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Preferred Class:</span>
                          <span className="font-semibold text-right max-w-48">
                            {tutor.preferred_class || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Preferred Subjects:</span>
                          <span className="font-semibold text-right max-w-48">
                            {tutor.preferred_subjects || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Preferred Time:</span>
                          <span className="font-semibold">
                            {tutor.preferred_time ? 
                              (typeof tutor.preferred_time === 'string' ? 
                                tutor.preferred_time.replace(/[{}'"]/g, '').split(',').join(', ') : 
                                tutor.preferred_time) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Preferred Area to Teach:</span>
                          <span className="font-semibold text-right max-w-48">
                            {tutor.area || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="education" className="p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Education:</span>
                          <span className="font-semibold">{tutor.education || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">University:</span>
                          <span className="font-semibold">{tutor.university_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-semibold">{tutor.department_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Year:</span>
                          <span className="font-semibold">{tutor.university_year || 'N/A'}</span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="p-6">
                      <div className="text-center text-gray-600">
                        <p>No reviews available yet.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Contact Form */}
            <div className="lg:col-span-3 relative">
              <Card className="bg-white rounded-lg shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Contact with this tutor</h3>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Phone Number"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="details" className="text-sm font-medium text-gray-700">
                        Details Information
                      </Label>
                      <Textarea
                        id="details"
                        placeholder="Enter your message details..."
                        value={contactForm.details}
                        onChange={(e) => setContactForm({...contactForm, details: e.target.value})}
                        className="mt-1 min-h-[120px]"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white font-medium py-2 px-4 rounded-lg"
                    >
                      Submit
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              
            </div>
          </div>
        </div>
      </div>
  );
}
