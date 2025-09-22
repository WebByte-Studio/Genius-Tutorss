import { API_BASE_URL } from '@/config/api';

export interface Division {
  name: string;
  count: number;
  color: string;
}

export interface TutorDivision {
  name: string;
  count: number;
  avgRating: number;
  topRatedCount: number;
  color: string;
}

export interface HeroData {
  divisions: Division[];
  tutorDivisions: TutorDivision[];
}

export const heroDataService = {
  async getHeroData(): Promise<HeroData> {
    try {
      const response = await fetch(`${API_BASE_URL}/hero-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch hero data');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching hero data:', error);
      // Return fallback data if API fails
      return {
        divisions: [
          { name: "Dhaka", count: 0, color: "from-green-100 to-green-200" },
          { name: "Chattogram", count: 0, color: "from-emerald-100 to-emerald-200" },
          { name: "Barishal", count: 0, color: "from-teal-100 to-teal-200" },
          { name: "Sylhet", count: 0, color: "from-cyan-100 to-cyan-200" },
          { name: "Rajshahi", count: 0, color: "from-green-100 to-teal-200" },
          { name: "Khulna", count: 0, color: "from-emerald-100 to-cyan-200" },
          { name: "Rangpur", count: 0, color: "from-teal-100 to-green-200" },
          { name: "Mymensingh", count: 0, color: "from-cyan-100 to-emerald-200" }
        ],
        tutorDivisions: [
          { name: "Dhaka", count: 0, avgRating: 0, topRatedCount: 0, color: "from-green-100 to-green-200" },
          { name: "Chattogram", count: 0, avgRating: 0, topRatedCount: 0, color: "from-emerald-100 to-emerald-200" },
          { name: "Barishal", count: 0, avgRating: 0, topRatedCount: 0, color: "from-teal-100 to-teal-200" },
          { name: "Sylhet", count: 0, avgRating: 0, topRatedCount: 0, color: "from-cyan-100 to-cyan-200" },
          { name: "Rajshahi", count: 0, avgRating: 0, topRatedCount: 0, color: "from-green-100 to-teal-200" },
          { name: "Khulna", count: 0, avgRating: 0, topRatedCount: 0, color: "from-emerald-100 to-cyan-200" },
          { name: "Rangpur", count: 0, avgRating: 0, topRatedCount: 0, color: "from-teal-100 to-green-200" },
          { name: "Mymensingh", count: 0, avgRating: 0, topRatedCount: 0, color: "from-cyan-100 to-emerald-200" }
        ]
      };
    }
  }
};
