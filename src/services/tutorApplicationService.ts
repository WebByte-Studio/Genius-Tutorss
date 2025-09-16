import { API_BASE_URL } from '@/config/api';

export interface TutorApplication {
  id: string;
  jobId: string;
  tutorId: string;
  coverLetter: string;
  proposedRate: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'approved';
  createdAt: string;
  updatedAt: string;
  applicationType: 'job' | 'tutor_request';
  job: {
    id: string;
    title: string;
    description: string;
    subject: string;
    level: string;
    hourlyRate: number;
    location: string;
    schedule: string;
    status: string;
    studentName: string;
    studentEmail: string;
  };
}

export interface TutorApplicationsResponse {
  success: boolean;
  data: TutorApplication[];
  message?: string;
}

class TutorApplicationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get all applications for a tutor
  async getTutorApplications(): Promise<TutorApplicationsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/applications`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch applications');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tutor applications:', error);
      throw error;
    }
  }

  // Withdraw an application
  async withdrawApplication(applicationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/applications/${applicationId}/withdraw`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to withdraw application');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  }

  // Get application statistics
  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/applications/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch application stats');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      // Return default stats if error occurs
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      };
    }
  }
}

export const tutorApplicationService = new TutorApplicationService();
