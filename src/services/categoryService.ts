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
      const url = `${this.baseUrl}/popular?t=${Date.now()}`;
      console.log('Fetching popular categories from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch popular categories');
      }

      console.log('Returning categories:', data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching popular categories:', error);
      // Return empty array instead of hardcoded data
      // This will show a proper error state in the UI
      return [];
    }
  }
}

export const categoryService = new CategoryService();
