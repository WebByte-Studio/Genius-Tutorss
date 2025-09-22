import { API_BASE_URL } from '@/config/api';

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data?: {
    expiresIn: number;
  };
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token: string;
  };
}

export interface EmailStatusResponse {
  success: boolean;
  data: {
    email: string;
    isVerified: boolean;
  };
}

class EmailVerificationService {
  private baseUrl = `${API_BASE_URL}/email-verification`;

  async sendOTP(email: string, fullName?: string): Promise<SendOTPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fullName: fullName || 'User'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  async verifyOTP(email: string, otpCode: string): Promise<VerifyOTPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otpCode
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  async resendOTP(email: string, fullName?: string): Promise<SendOTPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fullName: fullName || 'User'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      return data;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  }

  async checkEmailStatus(email: string): Promise<EmailStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check email status');
      }

      return data;
    } catch (error) {
      console.error('Error checking email status:', error);
      throw error;
    }
  }

  async completeRegistration(email: string, otpCode: string): Promise<VerifyOTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otpCode
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete registration');
      }

      return data;
    } catch (error) {
      console.error('Error completing registration:', error);
      throw error;
    }
  }
}

export default new EmailVerificationService();
