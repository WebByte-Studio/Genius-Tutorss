'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext.next'
import { setAuthToken } from '@/utils/auth'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building2, ChevronRight, ChevronLeft } from 'lucide-react'
import { ForgotPassword } from './ForgotPassword'
import { EmailVerificationDialog } from './EmailVerificationDialog'
import { BANGLADESH_DISTRICTS } from '@/data/bangladeshDistricts'
import tutorDetailsService from '@/services/tutorDetailsService'
import emailVerificationService from '@/services/emailVerificationService'
import { useRouter } from 'next/navigation'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'


interface LoginDialogProps {
  children: React.ReactNode
  defaultRole?: 'student' | 'tutor'
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ children, defaultRole = 'student' }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState('login')
  const router = useRouter()
  
  // Multi-step tutor registration state
  const [currentStep, setCurrentStep] = useState(1)
  
  // Helper function to reset form data when switching roles
  const resetFormData = (newRole: 'student' | 'tutor') => {
    setSignupForm({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      role: newRole,
      location: '',
      gender: ''
    });
    
    setTutorFormData({
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      qualification: '',
      expectedSalary: '',
      availabilityStatus: 'available',
      daysPerWeek: '',
      preferredTutoringStyles: [],
      tutoringExperience: '',
      placeOfLearning: [],
      extraFacilities: [],
      preferredMedium: [],
      preferredClass: [],
      preferredSubjects: '',
      preferredTime: [],
      preferredStudentGender: 'any',
      alternativePhone: '',
      universityName: '',
      departmentName: '',
      universityYear: '',
      religion: '',
      nationality: 'Bangladeshi',
      socialMediaLinks: '',
      preferredTutoringCategory: [],
      presentLocation: '',
      educationalQualifications: []
    });
    
    setCurrentStep(1);
  };

  // Reset tutor form data
  const resetTutorFormData = () => {
    setTutorFormData({
      // Step 1: Basic Information
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      
      // Step 2: Preferences
      qualification: '',
      expectedSalary: '',
      availabilityStatus: 'available',
      daysPerWeek: '',
      preferredTutoringStyles: [] as string[],
      tutoringExperience: '',
      placeOfLearning: [] as string[],
      extraFacilities: [] as string[],
      preferredMedium: [] as string[],
      preferredClass: [] as string[],
      preferredSubjects: '',
      preferredTime: [] as string[],
      preferredStudentGender: 'any',
      
      // Step 3: Additional Information
      alternativePhone: '',
      universityName: '',
      departmentName: '',
      universityYear: '',
      religion: '',
      nationality: 'Bangladeshi',
      socialMediaLinks: '',
      preferredTutoringCategory: [] as string[],
      presentLocation: '',
      
      // Step 4: Educational Qualifications
      educationalQualifications: [] as Array<{
        id: string;
        group: string;
        subject: string;
        result: string;
        year: string;
      }>
    });
    setCurrentStep(1);
  };

  // Set the default tab based on the data-auth-type attribute
  useEffect(() => {
    if (children && React.isValidElement(children) && children.props['data-auth-type'] === 'register') {
      setDefaultTab('signup')
    }
  }, [children])
  const { signIn, signUp, redirectToDashboard, user, setUser, setProfile } = useAuth()

  const [loginForm, setLoginForm] = useState({
    phone: '',
    password: ''
  })

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: defaultRole as string,
    location: '',
    gender: ''
  })
  
  // Comprehensive tutor registration form data
  const [tutorFormData, setTutorFormData] = useState({
    // Step 1: Basic Information
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    
    // Step 2: Preferences
    qualification: '',
    expectedSalary: '',
    availabilityStatus: 'available',
    daysPerWeek: '',
    preferredTutoringStyles: [] as string[],
    tutoringExperience: '',
    placeOfLearning: [] as string[],
    extraFacilities: [] as string[],
    preferredMedium: [] as string[],
    preferredClass: [] as string[],
    preferredSubjects: '',
    preferredTime: [] as string[],
    preferredStudentGender: 'any',
    
    // Step 3: Additional Information
    alternativePhone: '',
    universityName: '',
    departmentName: '',
    universityYear: '',
    religion: '',
    nationality: 'Bangladeshi',
    socialMediaLinks: '',
    preferredTutoringCategory: [] as string[],
    presentLocation: '',
    
    // Step 4: Educational Qualifications
    educationalQualifications: [] as Array<{
      id: string;
      group: string;
      subject: string;
      result: string;
      year: string;
    }>
  })
  
  // State for tutor registration dialog
  const [showTutorRegistration, setShowTutorRegistration] = useState(false)
  
  // Email verification state
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('')
  const [pendingVerificationName, setPendingVerificationName] = useState('')

  // Helper functions for tutor registration
  const handleTutorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTutorFormData(prev => ({ ...prev, [name]: value }));
    
    // Also update signup form for basic fields
    if (['fullName', 'phone', 'email', 'password', 'confirmPassword', 'gender'].includes(name)) {
      setSignupForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTutorSelectChange = (name: string, value: string) => {
    setTutorFormData(prev => ({ ...prev, [name]: value }));
    
    // Also update signup form for basic fields
    if (['gender'].includes(name)) {
      setSignupForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTutorCheckboxChange = (name: string, value: string, checked: boolean) => {
    setTutorFormData(prev => {
      const currentValues = prev[name as keyof typeof prev] as string[];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      }
    });
  };
  
  const addEducationalQualification = () => {
    setTutorFormData(prev => ({
      ...prev,
      educationalQualifications: [
        ...prev.educationalQualifications,
        { id: Date.now().toString(), group: '', subject: '', result: '', year: '' }
      ]
    }));
  };
  
  const updateEducationalQualification = (id: string, field: string, value: string) => {
    setTutorFormData(prev => ({
      ...prev,
      educationalQualifications: prev.educationalQualifications.map(qual => 
        qual.id === id ? { ...qual, [field]: value } : qual
      )
    }));
  };
  
  const removeEducationalQualification = (id: string) => {
    setTutorFormData(prev => ({
      ...prev,
      educationalQualifications: prev.educationalQualifications.filter(qual => qual.id !== id)
    }));
  };

  // Handle email verification success
  const handleEmailVerificationSuccess = async (verificationData?: { user: any; token: string }) => {
    try {
      console.log('Email verification success, verification data:', verificationData);
      
      if (verificationData?.user && verificationData?.token) {
        // Set the auth token
        setAuthToken(verificationData.token);
        localStorage.setItem('authToken', verificationData.token);
        
        // Set the user in context
        setUser(verificationData.user);
        setProfile(verificationData.user);
        localStorage.setItem('user', JSON.stringify(verificationData.user));
        
        console.log('User and token set in context after email verification');
        
        // Wait a moment for state to update, then redirect
        setTimeout(() => {
          // Check if this is a tutor registration
          if (signupForm.role === 'tutor' || tutorFormData.fullName) {
            console.log('Continuing with tutor details submission...');
            // Continue with tutor details submission after email verification
            handleTutorDetailsSubmission();
          } else {
            console.log('Student registration complete, redirecting...');
            // For students, show success and redirect
            toast.success('Account created successfully! Email verified!')
            setOpen(false)
            
            // Redirect to dashboard
            redirectToDashboard(verificationData.user);
          }
        }, 100);
      } else {
        console.error('No user data or token available for redirection');
        toast.error('Failed to complete registration - missing user data');
      }
    } catch (error: any) {
      console.error('Error after email verification:', error);
      toast.error(error.message || 'Failed to complete registration');
    }
  };

  // Extract tutor details submission logic
  const handleTutorDetailsSubmission = async () => {
    // Get the user from context (already created and verified)
    const createdUser = user;
    if (!createdUser?.id) {
      throw new Error('Tutor registration completed but user ID not available');
    }

    // Add a small delay to ensure token is properly set
    await new Promise(resolve => setTimeout(resolve, 100));

    // Format the data for tutor details API
    const tutorData = {
      user_id: createdUser.id,
      district: tutorFormData.presentLocation, // Map presentLocation to district
      location: tutorFormData.presentLocation, // Map presentLocation to location
      tutoringStyles: tutorFormData.preferredTutoringStyles,
      experience: tutorFormData.tutoringExperience,
      placeOfLearning: tutorFormData.placeOfLearning,
      extraFacilities: tutorFormData.extraFacilities,
      preferredMedium: tutorFormData.preferredMedium,
      preferredClasses: tutorFormData.preferredClass,
      preferredSubjects: tutorFormData.preferredSubjects.split(',').map(subject => subject.trim()),
      preferredTime: tutorFormData.preferredTime,
      preferredStudentGender: tutorFormData.preferredStudentGender,
      alternativePhone: tutorFormData.alternativePhone,
      universityDetails: {
        name: tutorFormData.universityName,
        department: tutorFormData.departmentName,
        year: tutorFormData.universityYear
      },
      religion: tutorFormData.religion,
      nationality: tutorFormData.nationality,
      socialMediaLinks: tutorFormData.socialMediaLinks ? { links: tutorFormData.socialMediaLinks } : undefined,
      preferredTutoringCategory: tutorFormData.preferredTutoringCategory,
      presentLocation: tutorFormData.presentLocation,
      educationalQualifications: tutorFormData.educationalQualifications,
      qualification: tutorFormData.qualification,
      expectedSalary: tutorFormData.expectedSalary,
      availabilityStatus: tutorFormData.availabilityStatus,
      daysPerWeek: parseInt(tutorFormData.daysPerWeek || '0')
    };
    
    // Debug: Log the data being sent
    console.log('Tutor data being sent:', JSON.stringify(tutorData, null, 2));
    
    // Validate required fields before sending
    const requiredFields = [
      'qualification', 'expectedSalary', 'tutoringExperience', 
      'placeOfLearning', 'extraFacilities', 'universityName', 
      'departmentName', 'presentLocation'
    ];
    
    const missingFields = requiredFields.filter(field => {
      let value;
      if (field === 'tutoringExperience') {
        value = tutorFormData.tutoringExperience;
      } else if (field === 'universityName') {
        value = tutorFormData.universityName;
      } else if (field === 'departmentName') {
        value = tutorFormData.departmentName;
      } else if (field === 'placeOfLearning') {
        value = tutorFormData.placeOfLearning;
      } else if (field === 'extraFacilities') {
        value = tutorFormData.extraFacilities;
      } else if (field === 'presentLocation') {
        value = tutorFormData.presentLocation;
      } else {
        value = tutorFormData[field as keyof typeof tutorFormData];
      }
      return !value || (Array.isArray(value) && value.length === 0);
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Submit tutor details using the service
    const response = await tutorDetailsService.submitTutorDetails(tutorData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to register tutor details');
    }
     
    toast.success('Tutor account created successfully! Welcome to TutorConnect!');
    
    // Reset form data
    resetTutorFormData();
    
    // User is already set in context from email verification
    // Just redirect to tutor dashboard
    setTimeout(() => {
      // Use AuthContext's redirection function to redirect to tutor dashboard
      redirectToDashboard(createdUser);
      setOpen(false);
      setCurrentStep(1);
    }, 100);
  };
  
  // Navigation functions for multi-step process
  const nextTutorStep = () => {
    if (currentStep === 1) {
      // Validate step 1 (basic information)
      if (!tutorFormData.fullName || !tutorFormData.phone || !tutorFormData.password || 
          !tutorFormData.confirmPassword || !tutorFormData.gender || !tutorFormData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (tutorFormData.password !== tutorFormData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (tutorFormData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tutorFormData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    } else if (currentStep === 2) {
      // Validate step 2
      if (!tutorFormData.qualification || !tutorFormData.expectedSalary || 
          !tutorFormData.tutoringExperience || tutorFormData.placeOfLearning.length === 0 || tutorFormData.extraFacilities.length === 0) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 3) {
      // Validate step 3
      if (!tutorFormData.universityName || !tutorFormData.departmentName || !tutorFormData.presentLocation) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const prevTutorStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Check if email already exists
  const checkEmailExists = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      return data.exists || false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };



  // Tutor registration submit handler
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Log current form data
    console.log('Current tutor form data:', JSON.stringify(tutorFormData, null, 2));
    
    // Final validation
    if (tutorFormData.educationalQualifications.length === 0) {
      toast.error('Please add at least one educational qualification');
      return;
    }
    
    // Validate all required fields across all steps
    if (!tutorFormData.fullName || !tutorFormData.phone || !tutorFormData.password || !tutorFormData.gender ||
        !tutorFormData.qualification || !tutorFormData.expectedSalary || 
        !tutorFormData.tutoringExperience || tutorFormData.placeOfLearning.length === 0 || tutorFormData.extraFacilities.length === 0 || 
        !tutorFormData.universityName || !tutorFormData.departmentName || !tutorFormData.presentLocation) {
      
      // Create a detailed list of missing fields
      const missingFields = [];
      if (!tutorFormData.fullName) missingFields.push('Full Name');
      if (!tutorFormData.phone) missingFields.push('Phone Number');
      if (!tutorFormData.password) missingFields.push('Password');
      if (!tutorFormData.gender) missingFields.push('Gender');
      if (!tutorFormData.qualification) missingFields.push('Qualification');
      if (!tutorFormData.expectedSalary) missingFields.push('Expected Salary');
      if (!tutorFormData.tutoringExperience) missingFields.push('Tutoring Experience');
      if (tutorFormData.placeOfLearning.length === 0) missingFields.push('Place of Learning');
      if (tutorFormData.extraFacilities.length === 0) missingFields.push('Extra Facilities');
      if (!tutorFormData.universityName) missingFields.push('University Name');
      if (!tutorFormData.departmentName) missingFields.push('Department Name');
      if (!tutorFormData.presentLocation) missingFields.push('Present Location');
      
      toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setLoading(true);
    try {
      // Validate required fields for user registration
      if (!tutorFormData.fullName || !tutorFormData.phone || !tutorFormData.password || !tutorFormData.gender || !tutorFormData.presentLocation || !tutorFormData.email) {
        throw new Error('Missing required fields for user registration');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tutorFormData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Check if email already exists
      const emailExists = await checkEmailExists(tutorFormData.email);
      if (emailExists) {
        throw new Error('An account with this email already exists. Please use a different email or try logging in.');
      }

      // Since email is required, always send OTP first before creating account
      console.log('Sending OTP for tutor email verification before account creation...');
      await emailVerificationService.sendOTP(tutorFormData.email, tutorFormData.fullName);
      
      // Show email verification dialog
      console.log('Setting email verification dialog state for tutor...');
      setPendingVerificationEmail(tutorFormData.email);
      setPendingVerificationName(tutorFormData.fullName);
      setShowEmailVerification(true);
      console.log('Email verification dialog should now be visible for tutor');
      setLoading(false);
      return; // Don't proceed until email is verified
    } catch (error: any) {
      console.error('Error in tutor registration:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.phone || !loginForm.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await signIn(loginForm.phone, loginForm.password)
      
      // Check if the logged-in user has an allowed role
      // This check will happen after the user state is updated
      // The AuthContext will handle the redirect based on role
      toast.success('Welcome back!')
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupForm.phone || !signupForm.password || !signupForm.fullName || !signupForm.gender || !signupForm.email) {
      toast.error('Please fill in all required fields')
      return
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    // Additional validation for tutor-specific fields
    if (signupForm.role === 'tutor') {
      if (!signupForm.location) {
        toast.error('Please fill in all required tutor fields (location)')
        return
      }
    }

    // Validate email format (now required)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true)
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(signupForm.email);
      if (emailExists) {
        throw new Error('An account with this email already exists. Please use a different email or try logging in.');
      }

      // Since email is required, always send OTP first before creating account
      console.log('Sending OTP for email verification before account creation...');
      await emailVerificationService.sendOTP(signupForm.email, signupForm.fullName);
      
      // Show email verification dialog
      console.log('Setting email verification dialog state...');
      setPendingVerificationEmail(signupForm.email);
      setPendingVerificationName(signupForm.fullName);
      setShowEmailVerification(true);
      console.log('Email verification dialog should now be visible');
      setLoading(false);
      return; // Don't proceed until email is verified
    } catch (error: any) {
      console.error('Error in student registration:', error);
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  // Check if the trigger is the register button
  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      // Check if the clicked element has the data-auth-type attribute
      const triggerElement = document.activeElement as HTMLElement
      if (triggerElement && triggerElement.getAttribute('data-auth-type') === 'register') {
        setDefaultTab('signup')
      } else {
        setDefaultTab('login')
      }
    }
    // Reset tutor registration state when dialog closes
    if (!open) {
      setCurrentStep(1)
      setTutorFormData({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        qualification: '',
        expectedSalary: '',
        availabilityStatus: 'available',
        daysPerWeek: '',
        preferredTutoringStyles: [],
        tutoringExperience: '',
        placeOfLearning: [],
        extraFacilities: [],
        preferredMedium: [],
        preferredClass: [],
        preferredSubjects: '',
        preferredTime: [],
        preferredStudentGender: 'any',
        alternativePhone: '',
        universityName: '',
        departmentName: '',
        universityYear: '',
        religion: '',
        nationality: 'Bangladeshi',
        socialMediaLinks: '',
        preferredTutoringCategory: [],
        presentLocation: '',
        educationalQualifications: []
      })
    } else {
      // Reset form when dialog opens
      resetTutorFormData();
    }
  }

  // Render step 1: Basic Information for tutor registration
  const renderTutorStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-green-800 mb-4">Personal Information</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="tutorFullName" className="text-sm font-semibold text-green-800">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="tutorFullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={tutorFormData.fullName}
              onChange={handleTutorChange}
              required
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="tutorGender" className="text-sm font-semibold text-green-800">Gender *</Label>
          <Select 
            value={tutorFormData.gender} 
            onValueChange={(value) => handleTutorSelectChange('gender', value)}
          >
            <SelectTrigger className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              
            </SelectContent>
          </Select>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="tutorPhone" className="text-sm font-semibold text-green-800">Phone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="tutorPhone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={tutorFormData.phone}
              onChange={handleTutorChange}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="tutorEmail" className="text-sm font-semibold text-green-800">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="tutorEmail"
              name="email"
              type="email"
              placeholder="Enter your email address"
              className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={tutorFormData.email}
              onChange={handleTutorChange}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="tutorPassword" className="text-sm font-semibold text-green-800">Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="tutorPassword"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="pl-10 pr-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={tutorFormData.password}
              onChange={handleTutorChange}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-green-600 hover:text-green-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="tutorConfirmPassword" className="text-sm font-semibold text-green-800">Confirm Password *</Label>
          <Input
            id="tutorConfirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.confirmPassword}
            onChange={handleTutorChange}
            required
          />
        </div>
      </div>
    </div>
  );

  // Render step 3: Additional Information for tutor registration
  const renderTutorStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-green-800 mb-4">Additional Information</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Alternative Phone */}
        <div className="space-y-2">
          <Label htmlFor="alternativePhone" className="text-sm font-semibold text-green-800">Alternative Phone Number</Label>
          <Input
            id="alternativePhone"
            name="alternativePhone"
            type="tel"
            placeholder="Alternative contact number"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.alternativePhone}
            onChange={handleTutorChange}
          />
        </div>

        {/* University Name */}
        <div className="space-y-2">
          <Label htmlFor="universityName" className="text-sm font-semibold text-green-800">University Name *</Label>
          <Input
            id="universityName"
            name="universityName"
            type="text"
            placeholder="Your university/college name"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.universityName}
            onChange={handleTutorChange}
            required
          />
        </div>

        {/* Department Name */}
        <div className="space-y-2">
          <Label htmlFor="departmentName" className="text-sm font-semibold text-green-800">Department Name *</Label>
          <Input
            id="departmentName"
            name="departmentName"
            type="text"
            placeholder="Your department"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.departmentName}
            onChange={handleTutorChange}
            required
          />
        </div>

        {/* University Year */}
        <div className="space-y-2">
          <Label htmlFor="universityYear" className="text-sm font-semibold text-green-800">Year</Label>
          <Input
            id="universityYear"
            name="universityYear"
            type="text"
            placeholder="e.g., 2nd year, Final year"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.universityYear}
            onChange={handleTutorChange}
          />
        </div>

        {/* Religion */}
        <div className="space-y-2">
          <Label htmlFor="religion" className="text-sm font-semibold text-green-800">Religion</Label>
          <Input
            id="religion"
            name="religion"
            type="text"
            placeholder="Your religion"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.religion}
            onChange={handleTutorChange}
          />
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label htmlFor="nationality" className="text-sm font-semibold text-green-800">Nationality</Label>
          <Input
            id="nationality"
            name="nationality"
            type="text"
            placeholder="Your nationality"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.nationality}
            onChange={handleTutorChange}
          />
        </div>

        {/* Social Media Links */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="socialMediaLinks" className="text-sm font-semibold text-green-800">Social Media Links</Label>
          <Input
            id="socialMediaLinks"
            name="socialMediaLinks"
            type="text"
            placeholder="Facebook, LinkedIn, etc."
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.socialMediaLinks}
            onChange={handleTutorChange}
          />
        </div>

        {/* Preferred Tutoring Category */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-green-800">Preferred Tutoring Category</Label>
          <div className="grid grid-cols-2 gap-2">
            {['academic', 'language', 'test_prep', 'professional', 'arts', 'other'].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category}`} 
                  checked={tutorFormData.preferredTutoringCategory.includes(category)}
                  onCheckedChange={(checked) => handleTutorCheckboxChange('preferredTutoringCategory', category, checked as boolean)}
                />
                <Label htmlFor={`category-${category}`} className="text-sm capitalize">
                  {category.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Present Location */}
        <div className="space-y-2">
          <Label htmlFor="presentLocation" className="text-sm font-semibold text-green-800">Present Location *</Label>
          <Input
            id="presentLocation"
            name="presentLocation"
            type="text"
            placeholder="Your current location"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.presentLocation}
            onChange={handleTutorChange}
          />
        </div>
      </div>
    </div>
  );

  // Render step 4: Educational Qualifications for tutor registration
  const renderTutorStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-green-800 mb-4">Educational Qualifications</h2>
      
      {tutorFormData.educationalQualifications.length > 0 ? (
        <div className="space-y-6">
          {tutorFormData.educationalQualifications.map((qual, index) => (
            <div key={qual.id} className="p-4 bg-white/80 rounded-xl border border-green-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-green-800">Qualification #{index + 1}</h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeEducationalQualification(qual.id)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Group */}
                <div className="space-y-2">
                  <Label htmlFor={`group-${qual.id}`} className="text-sm font-semibold text-green-800">Group/Degree</Label>
                  <Input
                    id={`group-${qual.id}`}
                    type="text"
                    placeholder="e.g., Science, Arts, BSc"
                    className="h-11 bg-white/90 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm"
                    value={qual.group}
                    onChange={(e) => updateEducationalQualification(qual.id, 'group', e.target.value)}
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor={`subject-${qual.id}`} className="text-sm font-semibold text-green-800">Subject/Major</Label>
                  <Input
                    id={`subject-${qual.id}`}
                    type="text"
                    placeholder="e.g., Physics, Computer Science"
                    className="h-11 bg-white/90 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm"
                    value={qual.subject}
                    onChange={(e) => updateEducationalQualification(qual.id, 'subject', e.target.value)}
                  />
                </div>

                {/* Result */}
                <div className="space-y-2">
                  <Label htmlFor={`result-${qual.id}`} className="text-sm font-semibold text-green-800">Result/GPA</Label>
                  <Input
                    id={`result-${qual.id}`}
                    type="text"
                    placeholder="e.g., 5.00, A+, 3.75"
                    className="h-11 bg-white/90 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm"
                    value={qual.result}
                    onChange={(e) => updateEducationalQualification(qual.id, 'result', e.target.value)}
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor={`year-${qual.id}`} className="text-sm font-semibold text-green-800">Year</Label>
                  <Input
                    id={`year-${qual.id}`}
                    type="text"
                    placeholder="e.g., 2020, 2018-2022"
                    className="h-11 bg-white/90 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm"
                    value={qual.year}
                    onChange={(e) => updateEducationalQualification(qual.id, 'year', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-green-50/50 rounded-xl border border-dashed border-green-300">
          <p className="text-green-700">No qualifications added yet.</p>
        </div>
      )}
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
        onClick={addEducationalQualification}
      >
        + Add Qualification
      </Button>
    </div>
  );

  // Render progress indicator for tutor registration
  const renderTutorProgress = () => (
    <div className="flex justify-between mb-8">
      {[1, 2, 3, 4].map((step, index) => (
        <div key={step} className="flex flex-col items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            {step}
          </div>
          <span className={`text-xs mt-1 ${currentStep >= step ? 'text-green-600' : 'text-gray-500'}`}>
            {step === 1 ? 'Basic Info' : 
             step === 2 ? 'Preferences' : 
             step === 3 ? 'Additional' : 'Education'}
          </span>
        </div>
      ))}
    </div>
  );

  // Render navigation buttons for tutor registration
  const renderTutorNavigation = () => (
    <div className="flex justify-between mt-8">
      {currentStep > 1 && (
        <Button 
          type="button" 
          variant="outline" 
          className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-50"
          onClick={prevTutorStep}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
      )}
      
      {currentStep < 4 ? (
        <Button 
          type="button" 
          className="ml-auto flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          onClick={nextTutorStep}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          type="submit" 
          className="ml-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </Button>
      )}
    </div>
  );

  // Render step 2: Preferences for tutor registration
  const renderTutorStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-green-800 mb-4">Preferences</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Qualification */}
        <div className="space-y-2">
          <Label htmlFor="qualification" className="text-sm font-semibold text-green-800">Qualification *</Label>
          <Input
            id="qualification"
            name="qualification"
            type="text"
            placeholder="e.g., BSc, BCS"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.qualification}
            onChange={handleTutorChange}
            required
          />
        </div>

        {/* Expected Salary */}
        <div className="space-y-2">
          <Label htmlFor="expectedSalary" className="text-sm font-semibold text-green-800">Expected Minimum Salary *</Label>
          <Input
            id="expectedSalary"
            name="expectedSalary"
            type="number"
            placeholder="Enter amount in BDT"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.expectedSalary}
            onChange={handleTutorChange}
            required
          />
        </div>

        {/* Availability Status */}
        <div className="space-y-2">
          <Label htmlFor="availabilityStatus" className="text-sm font-semibold text-green-800">Availability Status *</Label>
          <Select 
            value={tutorFormData.availabilityStatus} 
            onValueChange={(value) => handleTutorSelectChange('availabilityStatus', value)}
          >
            <SelectTrigger className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="not_available">Not Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Days Per Week */}
        <div className="space-y-2">
          <Label htmlFor="daysPerWeek" className="text-sm font-semibold text-green-800">Days Per Week</Label>
          <Input
            id="daysPerWeek"
            name="daysPerWeek"
            type="number"
            min="1"
            max="7"
            placeholder="Number of days"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.daysPerWeek}
            onChange={handleTutorChange}
          />
        </div>
      </div>

      {/* Tutoring Experience */}
      <div className="space-y-2">
        <Label htmlFor="tutoringExperience" className="text-sm font-semibold text-green-800">Tutoring Experience *</Label>
        <Input
          id="tutoringExperience"
          name="tutoringExperience"
          type="text"
          placeholder="e.g., 2 years"
          className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
          value={tutorFormData.tutoringExperience}
          onChange={handleTutorChange}
        />
      </div>

      {/* Preferred Tutoring Styles */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-green-800">Preferred Tutoring Style</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['batch', 'private', 'home', 'online'].map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <Checkbox 
                id={`style-${style}`} 
                checked={tutorFormData.preferredTutoringStyles.includes(style)}
                onCheckedChange={(checked) => handleTutorCheckboxChange('preferredTutoringStyles', style, checked as boolean)}
              />
              <Label htmlFor={`style-${style}`} className="text-sm capitalize">
                {style === 'batch' ? 'Batch Tutoring' : 
                 style === 'private' ? 'Private Tutoring' : 
                 style === 'home' ? 'Home Tutoring' : 'Online Tutoring'}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Place of Learning */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-green-800">Place of Learning *</Label>
        <div className="grid grid-cols-2 gap-2">
          {['home', 'online'].map((place) => (
            <div key={place} className="flex items-center space-x-2">
              <Checkbox 
                id={`place-${place}`} 
                checked={tutorFormData.placeOfLearning.includes(place)}
                onCheckedChange={(checked) => handleTutorCheckboxChange('placeOfLearning', place, checked as boolean)}
              />
              <Label htmlFor={`place-${place}`} className="text-sm capitalize">
                {place === 'home' ? 'Home Visit' : 'Online'}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Facilities */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-green-800">Extra Facilities *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {['study_materials', 'notes', 'practice_tests', 'online_resources', 'homework_help', 'other'].map((facility) => (
            <div key={facility} className="flex items-center space-x-2">
              <Checkbox 
                id={`facility-${facility}`} 
                checked={tutorFormData.extraFacilities.includes(facility)}
                onCheckedChange={(checked) => handleTutorCheckboxChange('extraFacilities', facility, checked as boolean)}
              />
              <Label htmlFor={`facility-${facility}`} className="text-sm capitalize">
                {facility.replace('_', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Medium */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-green-800">Preferred Medium of Instruction</Label>
        <div className="grid grid-cols-3 gap-2">
          {['bangla', 'english', 'both'].map((medium) => (
            <div key={medium} className="flex items-center space-x-2">
              <Checkbox 
                id={`medium-${medium}`} 
                checked={tutorFormData.preferredMedium.includes(medium)}
                onCheckedChange={(checked) => handleTutorCheckboxChange('preferredMedium', medium, checked as boolean)}
              />
              <Label htmlFor={`medium-${medium}`} className="text-sm capitalize">{medium}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Class */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-green-800">Preferred Class</Label>
          <div className="grid grid-cols-2 gap-2">
            {['primary', 'secondary', 'higher_secondary', 'undergraduate', 'graduate', 'other'].map((classLevel) => (
              <div key={classLevel} className="flex items-center space-x-2">
                <Checkbox 
                  id={`class-${classLevel}`} 
                  checked={tutorFormData.preferredClass.includes(classLevel)}
                  onCheckedChange={(checked) => handleTutorCheckboxChange('preferredClass', classLevel, checked as boolean)}
                />
                <Label htmlFor={`class-${classLevel}`} className="text-sm capitalize">
                  {classLevel.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Subjects */}
        <div className="space-y-2">
          <Label htmlFor="preferredSubjects" className="text-sm font-semibold text-green-800">Preferred Subjects</Label>
          <Input
            id="preferredSubjects"
            name="preferredSubjects"
            type="text"
            placeholder="e.g., Math, Physics"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.preferredSubjects}
            onChange={handleTutorChange}
          />
        </div>
      </div>

      {/* Preferred Time */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-green-800">Preferred Time</Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {['morning', 'afternoon', 'evening', 'night', 'other'].map((time) => (
            <div key={time} className="flex items-center space-x-2">
              <Checkbox 
                id={`time-${time}`} 
                checked={tutorFormData.preferredTime.includes(time)}
                onCheckedChange={(checked) => handleTutorCheckboxChange('preferredTime', time, checked as boolean)}
              />
              <Label htmlFor={`time-${time}`} className="text-sm capitalize">{time}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Student Gender */}
      <div className="space-y-2">
        <Label htmlFor="preferredStudentGender" className="text-sm font-semibold text-green-800">Preferred Student Gender</Label>
        <Select 
          value={tutorFormData.preferredStudentGender} 
          onValueChange={(value) => handleTutorSelectChange('preferredStudentGender', value)}
        >
          <SelectTrigger className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
            <SelectValue placeholder="Select preferred gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 border-0 shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-400/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Login And Explore
          </DialogTitle>
          <p className="text-center text-green-600/80 text-sm">Your journey to excellence starts here</p>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full relative z-10">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-xl p-1 shadow-lg">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 font-medium"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 font-medium"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-green-800">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    className="pl-10 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    value={loginForm.phone}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-green-800">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-green-600 hover:text-green-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end mb-2">
                <ForgotPassword>
                  <Button variant="link" className="p-0 h-auto text-sm text-green-600 hover:text-green-700 font-medium">
                    Forgot password?
                  </Button>
                </ForgotPassword>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300" 
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            {/* Role selection - always visible */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-green-800">I am a *</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={signupForm.role === 'student'}
                      onChange={() => {
                        setSignupForm(prev => ({ ...prev, role: 'student' }))
                        resetFormData('student') // Reset tutor form data
                      }}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      signupForm.role === 'student' 
                        ? 'bg-green-500 border-green-500' 
                        : 'bg-white border-green-300 group-hover:border-green-400'
                    }`}>
                      {signupForm.role === 'student' && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Student/Guardian</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={signupForm.role === 'tutor'}
                      onChange={() => {
                        setSignupForm(prev => ({ ...prev, role: 'tutor' }))
                        resetFormData('tutor') // Reset tutor form data
                      }}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      signupForm.role === 'tutor' 
                        ? 'bg-green-500 border-green-500' 
                        : 'bg-white border-green-300 group-hover:border-green-400'
                    }`}>
                      {signupForm.role === 'tutor' && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Tutor</span>
                </label>
              </div>
            </div>

            {signupForm.role === 'tutor' ? (
              // Tutor registration form with multi-step process
              <form onSubmit={handleTutorSubmit} className="space-y-4">
                {renderTutorProgress()}
                
                {currentStep === 1 && renderTutorStep1()}
                {currentStep === 2 && renderTutorStep2()}
                {currentStep === 3 && renderTutorStep3()}
                {currentStep === 4 && renderTutorStep4()}
                
                {renderTutorNavigation()}
              </form>
            ) : (
              // Student registration form
              <form onSubmit={handleSignup} className="space-y-4">
              {/* Horizontal layout for common fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-green-800">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-green-800">Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="signupEmail" className="text-sm font-semibold text-green-800">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                    <Input
                      id="signupEmail"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Gender - Required for all users */}
                <div className="space-y-2">
                  <Label htmlFor="studentGender" className="text-sm font-semibold text-green-800">Gender *</Label>
                  <Select 
                    value={signupForm.gender} 
                    onValueChange={(value: any) => setSignupForm(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tutor-specific fields in horizontal layout */}
              {signupForm.role === 'tutor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-semibold text-green-800">Gender *</Label>
                    <Select 
                      value={signupForm.gender} 
                      onValueChange={(value: any) => setSignupForm(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-semibold text-green-800">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-600 z-10" />
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="Enter your current location"
                        className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                        value={signupForm.location}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, location: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Password fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signupPassword" className="text-sm font-semibold text-green-800">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                    <Input
                      id="signupPassword"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-green-800">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 text-sm" 
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Email Verification Dialog */}
      <EmailVerificationDialog
        open={showEmailVerification}
        onOpenChange={setShowEmailVerification}
        email={pendingVerificationEmail}
        fullName={pendingVerificationName}
        onVerificationSuccess={handleEmailVerificationSuccess}
      />
    </Dialog>
  )
}


