import { API_BASE_URL } from '@/config/api';

export interface Tutor {
  id: string;
  tutor_id: string;
  full_name: string;
  location: string;
  district?: string;
  area?: string;
  post_office?: string;
  avatar_url: string | null;
  created_at: string;
  gender: string | null;
  bio: string | null;
  education: string | null;
  experience: string | null;
  subjects: string | null;
  hourly_rate: number | null;
  rating: number;
  total_reviews: number;
  total_views?: number;
  availability?: string | null;
  premium?: string;
  verified?: number | string;
  qualification?: string;
  tutoring_experience?: string;
  university_name?: string;
  department_name?: string;
  expected_salary?: number;
  days_per_week?: number;
  preferred_tutoring_style?: string;
  educational_qualifications?: string;
  preferred_subjects?: string;
  preferred_class?: string;
  preferred_medium?: string;
  preferred_time?: string;
  religion?: string;
  nationality?: string;
}

export interface TutorResponse {
  success: boolean;
  data: Tutor[];
}

class TutorService {
  private baseUrl = `${API_BASE_URL.replace('/api', '')}/api/tutors`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all tutors
  async getAllTutors(params?: {
    subject?: string;
    location?: string;
    district?: string;
    area?: string;
    post_office?: string;
    minRating?: number;
    maxPrice?: number;
    minExperience?: number;
    gender?: string;
    education?: string;
    availability?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<TutorResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.request<TutorResponse>(endpoint);
  }

  // Get tutor by ID
  async getTutorById(id: string): Promise<{ success: boolean; data: Tutor }> {
    return this.request<{ success: boolean; data: Tutor }>(`/${id}`);
  }

  // Get featured tutors (top 3 rated)
  async getFeaturedTutors(): Promise<TutorResponse> {
    return this.request<TutorResponse>('?sortBy=rating&sortOrder=desc&limit=3');
  }
}

const tutorService = new TutorService();
export default tutorService;