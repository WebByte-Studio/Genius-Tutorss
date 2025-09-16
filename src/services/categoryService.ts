import { API_BASE_URL } from '@/config/api';

export interface CategoryCount {
  categoryId: number;
  categoryName: string;
  count: number;
}

export interface CategoryData {
  id: number;
  name: string;
  tuitions: number;
  icon: string;
  color: string;
}

class CategoryService {
  private baseUrl = `${API_BASE_URL}/categories`;

  async getCategoryCounts(): Promise<CategoryCount[]> {
    try {
      const response = await fetch(`${this.baseUrl}/counts`, {
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
        throw new Error(data.message || 'Failed to fetch category counts');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching category counts:', error);
      return [];
    }
  }

  async getPopularCategories(): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/popular`, {
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
        throw new Error(data.message || 'Failed to fetch popular categories');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching popular categories:', error);
      // Return fallback data
      return [
        {
          id: 1,
          name: "Bangla Version",
          tuitions: 0,
          icon: "📚",
          color: "text-purple-600"
        },
        {
          id: 2,
          name: "English Medium",
          tuitions: 0,
          icon: "🌍",
          color: "text-red-600"
        },
        {
          id: 3,
          name: "English Version",
          tuitions: 0,
          icon: "📖",
          color: "text-green-600"
        },
        {
          id: 4,
          name: "Admission Test",
          tuitions: 0,
          icon: "🧪",
          color: "text-blue-600"
        },
        {
          id: 5,
          name: "Pre School",
          tuitions: 0,
          icon: "🏫",
          color: "text-red-600"
        },
        {
          id: 6,
          name: "Religious Studies",
          tuitions: 0,
          icon: "🕌",
          color: "text-blue-600"
        },
        {
          id: 7,
          name: "Test Preparation",
          tuitions: 0,
          icon: "🎓",
          color: "text-green-600"
        },
        {
          id: 8,
          name: "Madrasha Board",
          tuitions: 0,
          icon: "📚",
          color: "text-purple-600"
        },
        {
          id: 9,
          name: "Language Learning",
          tuitions: 0,
          icon: "🗣️",
          color: "text-green-600"
        },
        {
          id: 10,
          name: "Arts & Crafts",
          tuitions: 0,
          icon: "🎨",
          color: "text-blue-600"
        },
        {
          id: 11,
          name: "Music & Dance",
          tuitions: 0,
          icon: "🎵",
          color: "text-red-600"
        },
        {
          id: 12,
          name: "Diploma",
          tuitions: 0,
          icon: "🎓",
          color: "text-purple-600"
        }
      ];
    }
  }
}

export const categoryService = new CategoryService();
