import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface TutorDetails {
  qualification: string;
  expected_salary: string;
  availability_status: string;
  days_per_week: number;
  preferred_tutoring_style: string;
  tutoring_experience: string;
  place_of_learning: string;
  extra_facilities: string;
  preferred_medium: string;
  preferred_class: string;
  preferred_subjects: string;
  preferred_time: string;
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

export interface TutorData {
  user_id: string;
  district?: string;
  location?: string;
  qualification: string;
  expectedSalary: string;
  availabilityStatus: string;
  daysPerWeek: number;
  tutoringStyles: string[];
  experience: string;
  placeOfLearning: string[];
  extraFacilities: string[];
  preferredMedium: string[];
  preferredClasses: string[];
  preferredSubjects: string[];
  preferredTime: string[];
  preferredStudentGender: string;
  alternativePhone?: string;
  universityDetails: {
    name: string;
    department: string;
    year: string;
  };
  religion?: string;
  nationality?: string;
  socialMediaLinks?: Record<string, string>;
  preferredTutoringCategory: string[];
  presentLocation: string;
  educationalQualifications: any[];
}

class TutorDetailsService {
  private baseUrl = `${API_BASE_URL}/tutor-details`;

  private async request<T>(
    endpoint: string = '',
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken();
    console.log('TutorDetailsService - Token:', token ? 'Token found' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    console.log('TutorDetailsService - Making request to:', `${this.baseUrl}${endpoint}`);
    console.log('TutorDetailsService - Request config:', {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? 'Body present' : 'No body'
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('TutorDetailsService - Error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      // Handle validation errors specifically
      if (response.status === 400 && errorData.details) {
        const validationErrors = errorData.details.map((err: any) => `${err.param}: ${err.msg}`).join(', ');
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Submit tutor details
  async submitTutorDetails(tutorData: TutorData): Promise<{ success: boolean; message: string }> {
    console.log('Submitting tutor details:', JSON.stringify(tutorData));
    try {
      const result = await this.request<{ success: boolean; message: string }>('/register', {
        method: 'POST',
        body: JSON.stringify(tutorData),
      });
      console.log('Tutor details submission result:', result);
      return result;
    } catch (error) {
      console.error('Error submitting tutor details:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to submit tutor details');
    }
  }

  // Update tutor details using the alternative route
  async updateTutorDetails(tutorData: Partial<TutorData>): Promise<{ success: boolean; message: string }> {
    console.log('Updating tutor details:', JSON.stringify(tutorData));
    try {
      const result = await this.request<{ success: boolean; message: string }>('/update', {
        method: 'PUT',
        body: JSON.stringify(tutorData),
      });
      console.log('Tutor details update result:', result);
      return result;
    } catch (error) {
      console.error('Error updating tutor details:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update tutor details');
    }
  }

  // Update basic tutor details (without problematic fields)
  async updateBasicTutorDetails(tutorData: Partial<TutorData>): Promise<{ success: boolean; message: string }> {
    console.log('Updating basic tutor details:', JSON.stringify(tutorData));
    try {
      const result = await this.request<{ success: boolean; message: string }>('/update?basic=true', {
        method: 'PUT',
        body: JSON.stringify(tutorData),
      });
      console.log('Basic tutor details update result:', result);
      return result;
    } catch (error) {
      console.error('Error updating basic tutor details:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update basic tutor details');
    }
  }

  // Test token endpoint
  async testToken(): Promise<any> {
    return this.request('/test-token');
  }

  // Get tutor details for the current user
  async getTutorDetails(): Promise<{ success: boolean; data: TutorDetails }> {
    return this.request('/me');
  }
}

const tutorDetailsService = new TutorDetailsService();
export default tutorDetailsService;