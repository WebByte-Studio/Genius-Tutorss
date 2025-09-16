'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/searchable-select';

import { Separator } from '@/components/ui/separator';
import { BANGLADESH_DISTRICTS, BANGLADESH_DISTRICTS_WITH_POST_OFFICES, PostOffice } from '@/data/bangladeshDistricts';
import { SUBJECT_OPTIONS, CLASS_LEVELS } from '@/data/mockData';
import mediumOptions from '@/data/mediumOptions.json';
import { tutorRequestService, TutorRequestFormData, TutorRequest } from '@/services/tutorRequestService';
import { useAuth } from '@/contexts/AuthContext.next';

import { BookOpen, MapPin, User, Calendar, DollarSign, CheckCircle2, School, GraduationCap } from 'lucide-react';
import { taxonomyService, Category } from '@/services/taxonomyService';

export default function TutorRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState<TutorRequestFormData>({
    phoneNumber: '',
    studentGender: 'male',
    district: '',
    area: '',
    postOffice: '',
    detailedLocation: '',
    category: '',
    selectedCategories: [],
    selectedSubjects: [],
    selectedClasses: [],
    tutorGenderPreference: 'any',
    salary: '',
    isSalaryNegotiable: true,
    salaryRange: {
      min: 0,
      max: 0
    },
    extraInformation: '',
    // New fields
    medium: 'English Medium',
    numberOfStudents: 1,
    tutoringDays: 5,
    tutoringTime: '',
    tutoringDuration: '2:00',
    tutoringType: 'Home Tutoring'
  });

  // Available areas and post offices based on selected district
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availablePostOffices, setAvailablePostOffices] = useState<PostOffice[]>([]);
  
  // Taxonomy data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);
  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(false);

  // Fetch all taxonomy data
  const fetchTaxonomyData = useCallback(async () => {
    setIsLoadingTaxonomy(true);
    try {
      const taxonomy = await taxonomyService.getTaxonomyData();
      setCategories(taxonomy.categories || []);
    } catch (error) {
      console.error('Error fetching taxonomy:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive'
      });
      // Set empty array as fallback
      setCategories([]);
    } finally {
      setIsLoadingTaxonomy(false);
    }
  }, [toast]);

  // Fetch taxonomy for multiple categories and aggregate subjects and classes
  const fetchMultiCategoryTaxonomy = useCallback(async (categoryNames: string[]) => {
    setIsLoadingTaxonomy(true);
    try {
      const allSubjects: any[] = [];
      const allClassLevels: any[] = [];
      const processedSubjects = new Set<string>();
      const processedClassLevels = new Set<string>();

      // Find categories in the current categories
      for (const categoryName of categoryNames) {
        const category = categories.find(cat => cat.name === categoryName);
        
        if (category) {
          // Add unique subjects
          if (category.subjects) {
            category.subjects.forEach((subject: any) => {
              if (subject && typeof subject === 'object' && subject.id !== undefined && !processedSubjects.has(subject.name)) {
                allSubjects.push(subject);
                processedSubjects.add(subject.name);
              }
            });
          }
          
          // Add unique class levels
          if (category.classLevels) {
            category.classLevels.forEach((classLevel: any) => {
              if (classLevel && typeof classLevel === 'object' && classLevel.id !== undefined && !processedClassLevels.has(classLevel.name)) {
                allClassLevels.push(classLevel);
                processedClassLevels.add(classLevel.name);
              }
            });
          }
        }
      }

      // Set the aggregated subjects and class levels
      setSubjects(allSubjects);
      setClassLevels(allClassLevels);

      if (allSubjects.length === 0 && allClassLevels.length === 0) {
        // Fallback to mock data if all API calls fail
        setSubjects(SUBJECT_OPTIONS.filter(subject => subject !== 'All Subjects')
          .map((name, index) => ({ id: index + 1, name })));
        setClassLevels(CLASS_LEVELS.map((name, index) => ({ id: index + 1, name })));
      }
    } catch (error) {
      console.error('Error fetching multi-category taxonomy:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects and class levels',
        variant: 'destructive'
      });
      // Fallback to mock data if API fails
      setSubjects(SUBJECT_OPTIONS.filter(subject => subject !== 'All Subjects')
        .map((name, index) => ({ id: index + 1, name })));
      setClassLevels(CLASS_LEVELS.map((name, index) => ({ id: index + 1, name })));
    } finally {
      setIsLoadingTaxonomy(false);
    }
  }, [categories, toast]);

  // Update available areas and post offices when district changes
  useEffect(() => {
    if (formData.district) {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === formData.district);
      if (district) {
        setAvailableAreas(district.areas.map(area => area.name));
        // Reset area and post office when district changes
        setFormData(prev => ({
          ...prev,
          area: '',
          postOffice: ''
        }));
      } else {
        setAvailableAreas([]);
        setAvailablePostOffices([]);
      }
    } else {
      setAvailableAreas([]);
      setAvailablePostOffices([]);
    }
  }, [formData.district]);
  
  // Update available post offices when area changes
  useEffect(() => {
    if (formData.district && formData.area) {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === formData.district);
      if (district) {
        const area = district.areas.find(a => a.name === formData.area);
        if (area) {
          setAvailablePostOffices(area.postOffices);
          // Reset post office when area changes
          setFormData(prev => ({
            ...prev,
            postOffice: ''
          }));
        } else {
          setAvailablePostOffices([]);
        }
      }
    } else {
      setAvailablePostOffices([]);
    }
  }, [formData.district, formData.area]);
  
  // Fetch taxonomy data on component mount
  useEffect(() => {
    fetchTaxonomyData();
  }, [fetchTaxonomyData]);
  
  // Fetch category-specific subjects and class levels when selected categories change
  useEffect(() => {
    if (formData.selectedCategories && formData.selectedCategories.length > 0) {
      fetchMultiCategoryTaxonomy(formData.selectedCategories);
      // Reset selected subjects and classes when categories change
      setFormData(prev => ({
        ...prev,
        selectedSubjects: [],
        selectedClasses: []
      }));
    } else {
      // Clear subjects and classes when no categories are selected
      setSubjects([]);
      setClassLevels([]);
    }
  }, [formData.selectedCategories, fetchMultiCategoryTaxonomy]);
  
  // Fetch category-specific taxonomy for a single category
  const fetchCategoryTaxonomy = async (categoryId: string) => {
    setIsLoadingTaxonomy(true);
    try {
      // Find the category in the current categories
      const category = categories.find(cat => cat.id.toString() === categoryId || cat.name === categoryId);
      
      if (category) {
        setSubjects(category.subjects || []);
        setClassLevels(category.classLevels || []);
      } else {
        // Fallback to mock data if category not found
        setSubjects(SUBJECT_OPTIONS.filter(subject => subject !== 'All Subjects')
          .map((name, index) => ({ id: index + 1, name })));
        setClassLevels(CLASS_LEVELS.map((name, index) => ({ id: index + 1, name })));
      }
    } catch (error) {
      console.error('Error fetching category taxonomy:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects and class levels',
        variant: 'destructive'
      });
      // Fallback to mock data if API fails
      setSubjects(SUBJECT_OPTIONS.filter(subject => subject !== 'All Subjects')
        .map((name, index) => ({ id: index + 1, name })));
      setClassLevels(CLASS_LEVELS.map((name, index) => ({ id: index + 1, name })));
    } finally {
      setIsLoadingTaxonomy(false);
    }
  };

  // Handle form field changes
  const handleChange = (field: keyof TutorRequestFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle subject selection
  const handleSubjectSelection = (subjectName: string) => {
    setFormData(prev => {
      const currentSubjects = prev.selectedSubjects || [];
      const subjects = currentSubjects.includes(subjectName)
        ? currentSubjects.filter(s => s !== subjectName)
        : [...currentSubjects, subjectName];
      
      return {
        ...prev,
        selectedSubjects: subjects
      };
    });
  };

  // Handle category selection
  const handleCategorySelection = (categoryName: string) => {
    setFormData(prev => {
      const currentCategories = prev.selectedCategories || [];
      const categories = currentCategories.includes(categoryName)
        ? currentCategories.filter(c => c !== categoryName)
        : [...currentCategories, categoryName];
      
      return {
        ...prev,
        selectedCategories: categories
      };
    });
  };

  // Handle class selection
  const handleClassSelection = (className: string) => {
    setFormData(prev => {
      const currentClasses = prev.selectedClasses || [];
      const classes = currentClasses.includes(className)
        ? currentClasses.filter(c => c !== className)
        : [...currentClasses, className];
      
      return {
        ...prev,
        selectedClasses: classes
      };
    });
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!formData.phoneNumber || !formData.district || !formData.area || !formData.postOffice) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if ((formData.selectedCategories || []).length === 0) {
        toast({
          title: 'Missing Information',
          description: 'Please select at least one category',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if ((formData.selectedSubjects || []).length === 0 || (formData.selectedClasses || []).length === 0) {
        toast({
          title: 'Missing Information',
          description: 'Please select at least one subject and class',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.tutoringTime) {
        toast({
          title: 'Missing Information',
          description: 'Please select tutoring time',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.salaryRange.min === 0 || formData.salaryRange.max === 0) {
        toast({
          title: 'Missing Information',
          description: 'Please enter salary range',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.salaryRange.min > formData.salaryRange.max) {
        toast({
          title: 'Invalid Salary Range',
          description: 'Minimum salary cannot be greater than maximum salary',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      // Debug: Log the form data being sent
      console.log('Submitting form data:', formData);
      
      // Submit form data using the public endpoint that doesn't require authentication
      const response = await tutorRequestService.createPublicTutorRequest(formData);
      
      if (response.success) {
        setShowSuccess(true);
        toast({
          title: 'Request Submitted',
          description: 'Your tutor request has been submitted successfully!',
        });
      } else {
        toast({
          title: 'Submission Failed',
          description: response.message || 'Failed to submit tutor request',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting tutor request:', error);
      toast({
        title: 'Submission Error',
        description: 'An error occurred while submitting your request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form and go to dashboard
  const goToDashboard = () => {
    router.push('/student');
  };

  // If showing success message
  if (showSuccess) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="w-full bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">Request Submitted Successfully!</CardTitle>
            <CardDescription className="text-lg text-green-700 mt-2">
              Your tutor request has been received and is being processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Our team will review your request and match you with suitable tutors. 
              You will receive notifications when tutors respond to your request.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <School className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-medium text-gray-800">Subjects</h3>
                <p className="text-sm text-gray-600">{formData.selectedSubjects.join(', ')}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <GraduationCap className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-medium text-gray-800">Classes</h3>
                <p className="text-sm text-gray-600">{formData.selectedClasses.join(', ')}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-medium text-gray-800">Location</h3>
                <p className="text-sm text-gray-600">{formData.area}, {formData.district}</p>
                <p className="text-xs text-gray-500 mt-1">Post Office: {formData.postOffice}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-medium text-gray-800">Salary Range</h3>
                <p className="text-sm text-gray-600">৳{formData.salaryRange.min.toLocaleString()} - ৳{formData.salaryRange.max.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-medium text-gray-800">Schedule</h3>
                <p className="text-sm text-gray-600">{formData.tutoringDays} days/week at {formData.tutoringTime}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <User className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="font-medium text-gray-800">Students</h3>
                <p className="text-sm text-gray-600">{formData.numberOfStudents} student(s)</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="font-medium text-gray-800">Medium</h3>
                <p className="text-sm text-gray-600">{formData.medium}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button onClick={goToDashboard} className="bg-green-600 hover:bg-green-700">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

    return (
    <div className="container max-w-6xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 overflow-hidden">
      <style jsx global>{`
        body {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        body::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        html {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        html::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black-900 mb-2 sm:mb-3">Are you looking for a tutor?</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Then fill out the form and tell us which class/area you are looking for a tutor for. One of our representatives will contact you on the mobile number you provided within 24 hours of filling out and submitting the form.
          </p>
        </div>
      
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6">
        <div className="lg:col-span-2">
          <Card className="w-full shadow-lg border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-6 sm:space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                    <h2 className="text-lg sm:text-xl font-semibold">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm">Phone Number <span className="text-red-500">*</span></Label>
                      <Input 
                        id="phoneNumber" 
                        value={formData.phoneNumber} 
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        placeholder="Phone"
                        className="w-full h-10 sm:h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Student Gender <span className="text-red-500">*</span></Label>
                      
                      {/* Mobile Dropdown */}
                      <div className="block sm:hidden">
                        <Select 
                          value={formData.studentGender} 
                          onValueChange={(value) => handleChange('studentGender', value)}
                        >
                          <SelectTrigger className="h-10 sm:h-11">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Desktop Radio Buttons */}
                      <div className="hidden sm:block">
                        <RadioGroup 
                          value={formData.studentGender} 
                          onValueChange={(value) => handleChange('studentGender', value)}
                          className="flex flex-row space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" className="h-5 w-5" />
                            <Label htmlFor="male" className="text-sm leading-tight">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" className="h-5 w-5" />
                            <Label htmlFor="female" className="text-sm leading-tight">Female</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" className="h-5 w-5" />
                            <Label htmlFor="both" className="text-sm leading-tight">Both</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location Information Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                    <h2 className="text-lg sm:text-xl font-semibold">Location Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm">District <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={formData.district}
                        onValueChange={(value) => handleChange('district', value)}
                        placeholder="Select district"
                        options={BANGLADESH_DISTRICTS_WITH_POST_OFFICES.map((district) => ({
                          value: district.id,
                          label: district.name
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-sm">Thana <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={formData.area}
                        onValueChange={(value) => handleChange('area', value)}
                        placeholder="Select area"
                        options={availableAreas.map((area) => ({
                          value: area,
                          label: area
                        }))}
                        disabled={!formData.district}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postOffice" className="text-sm">Post Office <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={formData.postOffice}
                        onValueChange={(value) => handleChange('postOffice', value)}
                        placeholder="Select post office"
                        options={availablePostOffices.map((postOffice) => ({
                          value: postOffice.name,
                          label: `${postOffice.name} (${postOffice.postcode})`
                        }))}
                        disabled={!formData.area}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="detailedLocation" className="text-sm">Detailed Location (Optional)</Label>
                    <Textarea 
                      id="detailedLocation" 
                      value={formData.detailedLocation} 
                      onChange={(e) => handleChange('detailedLocation', e.target.value)}
                      placeholder="Enter detailed address, landmarks, etc."
                      className="w-full min-h-[80px] sm:min-h-[100px]"
                    />
                  </div>
                </div>

                <Separator />

                {/* Academic Information Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                    <h2 className="text-lg sm:text-xl font-semibold">Academic Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm">Category <span className="text-red-500">*</span></Label>
                      <Select 
                        value="" 
                        onValueChange={(value) => {
                          if (value && !formData.selectedCategories.includes(value)) {
                            handleCategorySelection(value);
                          }
                        }}
                        disabled={isLoadingTaxonomy}
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Select categories" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(category => category && category.id).map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.selectedCategories.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.selectedCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs sm:text-sm">
                              <span>{category}</span>
                              <button
                                type="button"
                                onClick={() => handleCategorySelection(category)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Subjects <span className="text-red-500">*</span></Label>
                      {isLoadingTaxonomy ? (
                        <div className="text-center py-4 text-sm">Loading subjects...</div>
                      ) : (
                        <Select 
                          value="" 
                          onValueChange={(value) => {
                            if (value && !formData.selectedSubjects.includes(value)) {
                              handleSubjectSelection(value);
                            }
                          }}
                          disabled={!formData.selectedCategories.length}
                        >
                          <SelectTrigger className="h-10 sm:h-11">
                            <SelectValue placeholder="Select subjects" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.filter(subject => subject && subject.id).map((subject) => (
                              <SelectItem key={subject.id} value={subject.name}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {formData.selectedSubjects.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.selectedSubjects.map((subject, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs sm:text-sm">
                              <span>{subject}</span>
                              <button
                                type="button"
                                onClick={() => handleSubjectSelection(subject)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Class Levels <span className="text-red-500">*</span></Label>
                      {isLoadingTaxonomy ? (
                        <div className="text-center py-4 text-sm">Loading class levels...</div>
                      ) : (
                        <Select 
                          value="" 
                          onValueChange={(value) => {
                            if (value && !formData.selectedClasses.includes(value)) {
                              handleClassSelection(value);
                            }
                          }}
                          disabled={!formData.selectedCategories.length}
                        >
                          <SelectTrigger className="h-10 sm:h-11">
                            <SelectValue placeholder="Select classes" />
                          </SelectTrigger>
                          <SelectContent>
                            {classLevels.filter(classLevel => classLevel && classLevel.id).map((classLevel) => (
                              <SelectItem key={classLevel.id} value={classLevel.name}>
                                {classLevel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {formData.selectedClasses.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.selectedClasses.map((className, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs sm:text-sm">
                              <span>{className}</span>
                              <button
                                type="button"
                                onClick={() => handleClassSelection(className)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tutoring Details Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                    <h2 className="text-lg sm:text-xl font-semibold">Tutoring Details</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="medium" className="text-sm">Medium <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.medium} 
                        onValueChange={(value) => handleChange('medium', value)}
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                        <SelectContent>
                          {mediumOptions.mediums.map((medium) => (
                            <SelectItem key={medium.value} value={medium.value}>
                              {medium.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tutoringType" className="text-sm">Tutoring Type <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.tutoringType || 'Home Tutoring'} 
                        onValueChange={(value) => handleChange('tutoringType', value)}
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Select tutoring type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home Tutoring">Home Tutoring</SelectItem>
                          <SelectItem value="Online Tutoring">Online Tutoring</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfStudents" className="text-sm">Number of Students <span className="text-red-500">*</span></Label>
                      <Input 
                        id="numberOfStudents" 
                        type="number"
                        min="1"
                        max="10"
                        value={formData.numberOfStudents} 
                        onChange={(e) => handleChange('numberOfStudents', parseInt(e.target.value) || 1)}
                        placeholder="Number of students"
                        className="w-full h-11"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tutoringDuration" className="text-sm">Tutoring Duration (Hours) <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.tutoringDuration} 
                        onValueChange={(value) => handleChange('tutoringDuration', value)}
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1:00">1 Hour</SelectItem>
                          <SelectItem value="1:30">1.5 Hours</SelectItem>
                          <SelectItem value="2:00">2 Hours</SelectItem>
                          <SelectItem value="2:30">2.5 Hours</SelectItem>
                          <SelectItem value="3:00">3 Hours</SelectItem>
                          <SelectItem value="3:30">3.5 Hours</SelectItem>
                          <SelectItem value="4:00">4 Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tutoringDays" className="text-sm">Tutoring Days per Week <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.tutoringDays.toString()} 
                        onValueChange={(value) => handleChange('tutoringDays', parseInt(value))}
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Select days per week" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Day</SelectItem>
                          <SelectItem value="2">2 Days</SelectItem>
                          <SelectItem value="3">3 Days</SelectItem>
                          <SelectItem value="4">4 Days</SelectItem>
                          <SelectItem value="5">5 Days</SelectItem>
                          <SelectItem value="6">6 Days</SelectItem>
                          <SelectItem value="7">7 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tutoringTime" className="text-sm">Tutoring Time <span className="text-red-500">*</span></Label>
                      <Input 
                        id="tutoringTime" 
                        type="time"
                        value={formData.tutoringTime} 
                        onChange={(e) => handleChange('tutoringTime', e.target.value)}
                        className="w-full h-10 sm:h-11"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Preferences Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                    <h2 className="text-lg sm:text-xl font-semibold">Preferences</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm">Tutor Gender Preference</Label>
                      
                      {/* Mobile Dropdown */}
                      <div className="block sm:hidden">
                        <Select 
                          value={formData.tutorGenderPreference} 
                          onValueChange={(value) => handleChange('tutorGenderPreference', value)}
                        >
                          <SelectTrigger className="h-10 sm:h-11">
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="any">Any</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Desktop Radio Buttons */}
                      <div className="hidden sm:block">
                        <RadioGroup 
                          value={formData.tutorGenderPreference} 
                          onValueChange={(value) => handleChange('tutorGenderPreference', value)}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="pref-male" className="h-5 w-5" />
                            <Label htmlFor="pref-male" className="text-sm leading-tight">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="pref-female" className="h-5 w-5" />
                            <Label htmlFor="pref-female" className="text-sm leading-tight">Female</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="any" id="pref-any" className="h-5 w-5" />
                            <Label htmlFor="pref-any" className="text-sm leading-tight">Any</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin" className="text-sm">Minimum Salary <span className="text-red-500">*</span></Label>
                      <Input 
                        id="salaryMin" 
                        type="number"
                        value={formData.salaryRange.min} 
                        onChange={(e) => handleChange('salaryRange', { ...formData.salaryRange, min: parseInt(e.target.value) || 0 })}
                        placeholder="Minimum salary"
                        className="w-full h-10 sm:h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax" className="text-sm">Maximum Salary <span className="text-red-500">*</span></Label>
                      <Input 
                        id="salaryMax" 
                        type="number"
                        value={formData.salaryRange.max} 
                        onChange={(e) => handleChange('salaryRange', { ...formData.salaryRange, max: parseInt(e.target.value) || 0 })}
                        placeholder="Maximum salary"
                        className="w-full h-10 sm:h-11"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isSalaryNegotiable" className="text-sm leading-tight">Salary is Negotiable</Label>
                    <Switch 
                      id="isSalaryNegotiable" 
                      checked={formData.isSalaryNegotiable}
                      onCheckedChange={(checked) => handleChange('isSalaryNegotiable', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="extraInformation" className="text-sm">Additional Information (Optional)</Label>
                    <Textarea 
                      id="extraInformation" 
                      value={formData.extraInformation} 
                      onChange={(e) => handleChange('extraInformation', e.target.value)}
                      placeholder="Any specific requirements or information you want to share with tutors"
                      className="w-full min-h-[80px] sm:min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4 sm:pt-6">
                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    {!isSubmitting && <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HELP & INFO Section */}
        <div className="lg:col-span-1">
          <Card className="w-full shadow-lg border-gray-200 h-fit bg-white">
            <CardHeader className="bg-white p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-black-900 text-center">HELP & INFO</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6 text-center">
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h4 className="font-bold text-black-900 mb-2 text-sm sm:text-base">
                        Q. If i cant get the desired tutor ?
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Just fill up the request tutor form and send us. We will try to find your desired tutor.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-black-900 mb-2 text-sm sm:text-base">
                        Q. what will happen after fill the forms ?
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        After fill up the form the information will be sent to tutorsheba support team. They will review/ verify the info and will publish on the available tuitions section.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}