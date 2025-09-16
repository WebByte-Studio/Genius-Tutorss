import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext.next';
import { useToast } from '@/components/ui/use-toast';
import { profileService } from '@/services/profileService';
import tutorDetailsService from '@/services/tutorDetailsService';
import { documentService } from '@/services/documentService';
import { Loader2, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';



interface TutorProfile {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  district: string;
  location: string;
  bio: string;
  education: string;
  experience: string;
  subjects: string;
  hourly_rate: number;
  availability: Record<string, string[]>;
  qualification: string;
  expected_salary: string;
  availability_status: string;
  days_per_week: number;
  preferred_tutoring_style: string[];
  tutoring_experience: string;
  place_of_learning: string[];
  extra_facilities: string;
  preferred_medium: string[];
  preferred_class: string;
  preferred_subjects: string;
  preferred_time: string[];
  preferred_student_gender: string;
  alternative_phone: string;
  university_name: string;
  department_name: string;
  university_year: string;
  religion: string;
  nationality: string;
  social_media_links: string;
  preferred_tutoring_category: string;
  present_location: string;
  educational_qualifications: string;
}

export default function ProfileSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    photo: '',
    name: '',
    location: '',
    district: '',
    rate: '',
    experience: '',
    about: '',
    phone: '',
    email: '',
    qualification: '',
    expectedSalary: '',

    daysPerWeek: 0,
    tutoringStyles: [] as string[],
    placeOfLearning: [] as string[],
    extraFacilities: '',
    preferredMedium: [] as string[],
    preferredClass: '',
    preferredSubjects: '',
    preferredTime: [] as string[],
    preferredStudentGender: 'any',
    alternativePhone: '',
    universityName: '',
    departmentName: '',
    universityYear: '',
    religion: '',
    nationality: '',
    socialMediaLinks: '',
    preferredTutoringCategory: '',
    presentLocation: '',
    educationalQualifications: '',
    documentUrls: {} as Record<string, string>
  });
  
  const [documents, setDocuments] = useState({
    id: null as File | null,
    certificate: null as File | null,
    education: null as File | null,
  });
  

  
  // Fetch tutor profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Fetch basic profile data
        const profileResponse = await profileService.getProfile(user.id);
        
        if (profileResponse.success && profileResponse.data) {
          const userData = profileResponse.data;
          
          setProfile(prev => ({
            ...prev,
            name: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            photo: userData.avatar_url || '',
            location: userData.location || '',
            district: userData.district || '',
            about: userData.bio || '',
            experience: userData.experience || '',
            rate: userData.hourly_rate?.toString() || ''
          }));
          

        }
        
        // Fetch tutor-specific details
        try {
          const tutorDetailsResponse = await tutorDetailsService.getTutorDetails();
          
          if (tutorDetailsResponse.success && tutorDetailsResponse.data) {
            const tutorData = tutorDetailsResponse.data;
            
            setProfile(prev => ({
              ...prev,
              qualification: tutorData.qualification || '',
              expectedSalary: tutorData.expected_salary || '',
              daysPerWeek: tutorData.days_per_week || 0,
              tutoringStyles: Array.isArray(tutorData.preferred_tutoring_style) ? tutorData.preferred_tutoring_style : [],
              placeOfLearning: Array.isArray(tutorData.place_of_learning) ? tutorData.place_of_learning : [],
              extraFacilities: tutorData.extra_facilities || '',
              preferredMedium: Array.isArray(tutorData.preferred_medium) ? tutorData.preferred_medium : [],
              preferredClass: tutorData.preferred_class || '',
              preferredSubjects: tutorData.preferred_subjects || '',
              preferredTime: Array.isArray(tutorData.preferred_time) ? tutorData.preferred_time : [],
              preferredStudentGender: tutorData.preferred_student_gender || 'any',
              alternativePhone: tutorData.alternative_phone || '',
              universityName: tutorData.university_name || '',
              departmentName: tutorData.department_name || '',
              universityYear: tutorData.university_year || '',
              religion: tutorData.religion || '',
              nationality: tutorData.nationality || '',
              socialMediaLinks: tutorData.social_media_links || '',
              preferredTutoringCategory: tutorData.preferred_tutoring_category || '',
              presentLocation: tutorData.present_location || '',
              educationalQualifications: tutorData.educational_qualifications || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching tutor details:', error);
          // Don't show error toast here as the user might be a new tutor without details yet
        }
        
        // Fetch uploaded documents
        try {
          const documentsData = await documentService.getTutorDocuments();
          if (documentsData.success && documentsData.data) {
            // Update UI to show uploaded documents
            const documentUrls: Record<string, string> = {};
            documentsData.data.forEach(doc => {
              documentUrls[doc.document_type] = doc.file_url;
            });
            
            setProfile(prev => ({
              ...prev,
              documentUrls: documentUrls
            }));
          }
        } catch (error) {
          console.error('Error fetching document data:', error);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user?.id, toast]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleMultiSelectChange = (name: string, value: string) => {
    setProfile((prev) => {
      const currentValues = prev[name as keyof typeof prev] as string[];
      if (Array.isArray(currentValues)) {
        if (currentValues.includes(value)) {
          return { ...prev, [name]: currentValues.filter(v => v !== value) };
        } else {
          return { ...prev, [name]: [...currentValues, value] };
        }
      }
      return prev;
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setProfile((prev) => ({ ...prev, photo: URL.createObjectURL(files[0]) }));
    }
  };

  const handleDocumentChange = async (type: 'id' | 'certificate' | 'education', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setDocuments((prev) => ({ ...prev, [type]: file }));
      
      // Upload the document immediately
      try {
        setIsSaving(true);
        const result = await documentService.uploadTutorDocument(file, type);
        if (result.success) {
          toast({
            title: 'Success',
            description: `${type.charAt(0).toUpperCase() + type.slice(1)} document uploaded successfully`,
            variant: 'default'
          });
        } else {
          toast({
            title: 'Error',
            description: result.error || `Failed to upload ${type} document`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error(`Error uploading ${type} document:`, error);
        toast({
          title: 'Error',
          description: `Failed to upload ${type} document`,
          variant: 'destructive'
        });
      } finally {
        setIsSaving(false);
      }
    }
  };



  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form fields - All fields are optional
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Only validate numeric format if values are provided
    if (profile.rate && isNaN(parseFloat(profile.rate))) {
      newErrors.rate = 'Hourly rate must be a valid number';
    }
    
    if (profile.daysPerWeek && (isNaN(Number(profile.daysPerWeek)) || Number(profile.daysPerWeek) < 1 || Number(profile.daysPerWeek) > 7)) {
      newErrors.daysPerWeek = 'Days per week must be between 1 and 7';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      // Update basic profile information
      const profileUpdateData = {
        full_name: profile.name,
        phone: profile.phone,
        location: profile.location,
        district: profile.district,
        bio: profile.about,
        experience: profile.experience,
        hourly_rate: parseFloat(profile.rate) || 0
      };
      
      const profileResponse = await profileService.updateProfile(user.id, profileUpdateData);
      
      if (!profileResponse.success) {
        throw new Error(profileResponse.message || 'Failed to update profile');
      }
      
      // Update tutor-specific details
      const tutorData = {
        user_id: user.id,
        district: profile.district,
        location: profile.location,
        qualification: profile.qualification,
        expectedSalary: profile.expectedSalary,
        availabilityStatus: 'available',
        daysPerWeek: parseInt(profile.daysPerWeek.toString()) || 0,
        tutoringStyles: Array.isArray(profile.tutoringStyles) ? profile.tutoringStyles : [],
        experience: profile.experience,
        placeOfLearning: Array.isArray(profile.placeOfLearning) ? profile.placeOfLearning : [],
        extraFacilities: profile.extraFacilities ? [profile.extraFacilities] : [],
        preferredMedium: Array.isArray(profile.preferredMedium) ? profile.preferredMedium : [],
        preferredClasses: profile.preferredClass ? [profile.preferredClass] : [],
        preferredSubjects: profile.preferredSubjects ? (Array.isArray(profile.preferredSubjects) ? profile.preferredSubjects : [profile.preferredSubjects]) : [],
        preferredTime: Array.isArray(profile.preferredTime) ? profile.preferredTime : [],
        preferredStudentGender: profile.preferredStudentGender,
        alternativePhone: profile.alternativePhone,
        universityDetails: {
          name: profile.universityName || '',
          department: profile.departmentName || '',
          year: profile.universityYear || ''
        },
        religion: profile.religion,
        nationality: profile.nationality,
        socialMediaLinks: {},
        preferredTutoringCategory: profile.preferredTutoringCategory ? [profile.preferredTutoringCategory] : [],
        presentLocation: profile.presentLocation,
        educationalQualifications: []
      };
      
      // Try the new update method first, fallback to the original method
      let tutorResponse;
      try {
        tutorResponse = await tutorDetailsService.updateTutorDetails(tutorData);
      } catch (updateError) {
        console.log('Update method failed, trying basic update method:', updateError);
        try {
          // Try basic update without problematic fields
          const basicTutorData = {
            district: profile.district,
            location: profile.location,
            qualification: profile.qualification,
            expectedSalary: profile.expectedSalary,
            daysPerWeek: parseInt(profile.daysPerWeek.toString()) || 0,
            experience: profile.experience,
            alternativePhone: profile.alternativePhone,
            universityDetails: {
              name: profile.universityName || '',
              department: profile.departmentName || '',
              year: profile.universityYear || ''
            },
            religion: profile.religion,
            nationality: profile.nationality,
            presentLocation: profile.presentLocation
          };
          tutorResponse = await tutorDetailsService.updateBasicTutorDetails(basicTutorData);
        } catch (basicUpdateError) {
          console.log('Basic update method failed, trying original method:', basicUpdateError);
          tutorResponse = await tutorDetailsService.submitTutorDetails(tutorData);
        }
      }
      
      if (!tutorResponse.success) {
        throw new Error(tutorResponse.message || 'Failed to update tutor details');
      }
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg">Loading profile data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.tutor_id && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <div className="text-green-700 font-medium">Tutor ID:</div>
                <div className="ml-2 bg-white px-3 py-1 rounded border border-green-200 font-mono">{user.tutor_id}</div>
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div>
              <Label>Photo</Label>
              <div className="mt-2 flex items-center gap-4">
                <img
                  src={profile.photo || '/placeholder.svg'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <Input type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                                 <Label>Name</Label>
                <Input 
                  name="name" 
                  value={profile.name} 
                  onChange={handleProfileChange} 
                  placeholder="Full Name" 
                                   />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" value={profile.email} onChange={handleProfileChange} placeholder="Email" readOnly className="bg-gray-50" />
              </div>
              <div>
                                 <Label>Phone</Label>
                <Input 
                  name="phone" 
                  value={profile.phone} 
                  onChange={handleProfileChange} 
                  placeholder="Phone Number" 
                                   />
              </div>
              <div>
                <Label>Alternative Phone</Label>
                <Input name="alternativePhone" value={profile.alternativePhone} onChange={handleProfileChange} placeholder="Alternative Phone" />
              </div>
              <div>
                                 <Label>District</Label>
                <Input 
                  name="district" 
                  value={profile.district} 
                  onChange={handleProfileChange} 
                  placeholder="District" 
                                   />
              </div>
              <div>
                                 <Label>Location</Label>
                <Input 
                  name="location" 
                  value={profile.location} 
                  onChange={handleProfileChange} 
                  placeholder="City/Area" 
                                   />
              </div>
              <div>
                <Label>Present Location</Label>
                <Input name="presentLocation" value={profile.presentLocation} onChange={handleProfileChange} placeholder="Present Location" />
              </div>
              <div>
                <Label>Hourly Rate (BDT)</Label>
                <Input 
                  name="rate" 
                  value={profile.rate} 
                  onChange={handleProfileChange} 
                  placeholder="e.g. 500" 
                  type="number" 
                                   />
              </div>
              <div>
                <Label>Expected Salary</Label>
                <Input name="expectedSalary" value={profile.expectedSalary} onChange={handleProfileChange} placeholder="Expected Monthly Salary" />
              </div>
              <div>
                <Label>Experience (years)</Label>
                <Input name="experience" value={profile.experience} onChange={handleProfileChange} placeholder="e.g. 3" />
              </div>
              <div>
                                 <Label>Qualification</Label>
                <Input 
                  name="qualification" 
                  value={profile.qualification} 
                  onChange={handleProfileChange} 
                  placeholder="Highest Qualification" 
                                   />
              </div>
              <div>
                <Label>Days Per Week</Label>
                <Input 
                  name="daysPerWeek" 
                  value={profile.daysPerWeek} 
                  onChange={handleProfileChange} 
                  placeholder="Days Per Week" 
                  type="number" 
                  min="1" 
                  max="7" 
                                   />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>University Name</Label>
              <Input name="universityName" value={profile.universityName} onChange={handleProfileChange} placeholder="University Name" />
            </div>
            <div>
              <Label>Department</Label>
              <Input name="departmentName" value={profile.departmentName} onChange={handleProfileChange} placeholder="Department" />
            </div>
            <div>
              <Label>Year/Semester</Label>
              <Input name="universityYear" value={profile.universityYear} onChange={handleProfileChange} placeholder="Year/Semester" />
            </div>
            <div>
              <Label>Religion</Label>
              <Input name="religion" value={profile.religion} onChange={handleProfileChange} placeholder="Religion" />
            </div>
            <div>
              <Label>Nationality</Label>
              <Input name="nationality" value={profile.nationality} onChange={handleProfileChange} placeholder="Nationality" />
            </div>
            <div>
              <Label>Preferred Student Gender</Label>
              <Select value={profile.preferredStudentGender} onValueChange={(value) => handleSelectChange('preferredStudentGender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
                         <Label>About</Label>
            <Textarea 
              name="about" 
              value={profile.about} 
              onChange={handleProfileChange} 
              placeholder="Brief bio, teaching style, etc." 
                             className="min-h-[100px]" 
             />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                             <Label className="mb-2 block">Preferred Tutoring Styles</Label>
                             <div className="space-y-2">
                {['batch', 'private', 'home', 'online'].map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`style-${style}`} 
                      checked={profile.tutoringStyles.includes(style)}
                      onCheckedChange={(checked) => {
                        if (checked) handleMultiSelectChange('tutoringStyles', style);
                        else handleMultiSelectChange('tutoringStyles', style);
                      }}
                    />
                    <label htmlFor={`style-${style}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
              
            </div>
            
            <div>
              <Label className="mb-2 block">Place of Learning</Label>
              <div className="space-y-2">
                {['home', 'online'].map((place) => (
                  <div key={place} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`place-${place}`} 
                      checked={profile.placeOfLearning.includes(place)}
                      onCheckedChange={(checked) => {
                        if (checked) handleMultiSelectChange('placeOfLearning', place);
                        else handleMultiSelectChange('placeOfLearning', place);
                      }}
                    />
                    <label htmlFor={`place-${place}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {place.charAt(0).toUpperCase() + place.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block">Preferred Medium</Label>
              <div className="space-y-2">
                {['bangla', 'english', 'both'].map((medium) => (
                  <div key={medium} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`medium-${medium}`} 
                      checked={profile.preferredMedium.includes(medium)}
                      onCheckedChange={(checked) => {
                        if (checked) handleMultiSelectChange('preferredMedium', medium);
                        else handleMultiSelectChange('preferredMedium', medium);
                      }}
                    />
                    <label htmlFor={`medium-${medium}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {medium.charAt(0).toUpperCase() + medium.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
                             <Label className="mb-2 block">Preferred Time</Label>
                             <div className="space-y-2">
                {['morning', 'afternoon', 'evening', 'night', 'other'].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`time-${time}`} 
                      checked={profile.preferredTime.includes(time)}
                      onCheckedChange={(checked) => {
                        if (checked) handleMultiSelectChange('preferredTime', time);
                        else handleMultiSelectChange('preferredTime', time);
                      }}
                    />
                    <label htmlFor={`time-${time}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
              
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Preferred Class</Label>
              <Input name="preferredClass" value={profile.preferredClass} onChange={handleProfileChange} placeholder="Preferred Class" />
            </div>
            <div>
              <Label>Preferred Subjects</Label>
              <Input name="preferredSubjects" value={profile.preferredSubjects} onChange={handleProfileChange} placeholder="Preferred Subjects" />
            </div>
            <div>
              <Label>Preferred Tutoring Category</Label>
              <Input name="preferredTutoringCategory" value={profile.preferredTutoringCategory} onChange={handleProfileChange} placeholder="Tutoring Category" />
            </div>

          </div>
          
          <div>
            <Label>Extra Facilities</Label>
            <Textarea name="extraFacilities" value={profile.extraFacilities} onChange={handleProfileChange} placeholder="Extra facilities you can provide" />
          </div>
          
          <Button 
            className="mt-4" 
            onClick={handleSaveProfile} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>ID Proof</Label>
              <div className="flex flex-col gap-2">
                <Input type="file" accept="application/pdf,image/*" onChange={e => handleDocumentChange('id', e)} />
                {profile.documentUrls?.id && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>ID document uploaded</span>
                    <a 
                      href={profile.documentUrls.id} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2"
                    >
                      View
                    </a>
                  </div>
                )}
                {documents.id && <span className="text-xs text-green-700">{documents.id.name}</span>}
              </div>
            </div>
            <div>
              <Label>Certificate</Label>
              <div className="flex flex-col gap-2">
                <Input type="file" accept="application/pdf,image/*" onChange={e => handleDocumentChange('certificate', e)} />
                {profile.documentUrls?.certificate && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Certificate uploaded</span>
                    <a 
                      href={profile.documentUrls.certificate} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2"
                    >
                      View
                    </a>
                  </div>
                )}
                {documents.certificate && <span className="text-xs text-green-700">{documents.certificate.name}</span>}
              </div>
            </div>
            <div>
              <Label>Education Proof</Label>
              <div className="flex flex-col gap-2">
                <Input type="file" accept="application/pdf,image/*" onChange={e => handleDocumentChange('education', e)} />
                {profile.documentUrls?.education && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Education document uploaded</span>
                    <a 
                      href={profile.documentUrls.education} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2"
                    >
                      View
                    </a>
                  </div>
                )}
                {documents.education && <span className="text-xs text-green-700">{documents.education.name}</span>}
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
            <p className="text-green-700 text-sm">Upload your documents in PDF, JPG, or PNG format (max 10MB). Your documents will be verified by our team before your profile is approved.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}