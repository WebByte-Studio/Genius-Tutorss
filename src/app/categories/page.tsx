'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAuth } from "@/contexts/AuthContext.next";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CategoriesPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [taxonomyData, setTaxonomyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch taxonomy data function
  const fetchTaxonomyData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/website/taxonomy`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTaxonomyData(result.data);
        setFilteredCategories(result.data.categories);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch taxonomy data');
      }
    } catch (error) {
      console.error('Error fetching taxonomy data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    fetchTaxonomyData();

    const interval = setInterval(() => {
      fetchTaxonomyData(true);
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchTaxonomyData]);

  useEffect(() => {
    // Only redirect student and tutor users, allow admin users to access categories page
    if (user && user.role === 'student') {
              router.push('/dashboard');
    }
    if (user && user.role === 'tutor') {
      router.push('/tutor');
    }
    // Admin users (admin, super_admin) can access the categories page
  }, [user, router]);

  // Real-time search functionality
  useEffect(() => {
    if (taxonomyData && taxonomyData.categories) {
      const filtered = taxonomyData.categories.filter((category: any) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, taxonomyData]);

  // Show loading while data is being fetched
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          
        </div>
      </div>
    );
  }

  // Add a check to ensure taxonomyData is loaded
  if (!taxonomyData || !taxonomyData.categories) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Categories Found</h2>
          <p className="text-gray-600 mb-4">Unable to load categories from the database.</p>
          <button
            onClick={() => fetchTaxonomyData()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to tuition-jobs page with category filter applied
    router.push(`/tuition-jobs?category=${encodeURIComponent(categoryName)}`);
  };

  const handleRefresh = () => {
    fetchTaxonomyData(true);
  };

  // Only show loading spinner for student and tutor users, not admin users
  if (user && (user.role === 'student' || user.role === 'tutor')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Academic Studies': '📚',
      'Language Learning': '🗣️',
      'Technology & Programming': '💻',
      'Creative Arts': '🎨',
      'Test Preparation': '🎓',
      'Professional Skills': '💼',
      'Religious Studies': '🕌',
      'Health & Fitness': '💪'
    };
    return iconMap[categoryName] || '📖';
  };

  const getCategoryColor = (categoryId: number) => {
    const colors = [
      'text-purple-600',
      'text-blue-600',
      'text-green-600',
      'text-red-600',
      'text-orange-600',
      'text-indigo-600',
      'text-pink-600',
      'text-teal-600'
    ];
    return colors[categoryId % colors.length];
  };

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <Navbar 
        user={user ? {
          name: user.full_name,
          email: user.email,
          role: user.role,
          avatar: user.avatar_url
        } : undefined}
        onLogout={handleLogout}
        LoginComponent={LoginDialog}
        RegisterComponent={LoginDialog}
      />
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                <span className="text-primary">ALL</span> CATEGORIES
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Explore all available tuition categories and subjects
              </p>
              
              

              {/* Error display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="text-sm">⚠️ {error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Categories Count */}
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Showing {filteredCategories.length} of {taxonomyData.categories.length} categories
              </p>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-primary/20 transition-all duration-300 cursor-pointer relative group"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {/* Arrow icon */}
                  <div className="absolute top-2 right-2 text-primary opacity-60">
                    ↗
                  </div>
                  
                  {/* Category icon */}
                  <div className={`${getCategoryColor(category.id)} mb-3 flex justify-center text-2xl`}>
                    {getCategoryIcon(category.name)}
                  </div>
                  
                  {/* Category name */}
                  <h3 className="font-semibold text-gray-800 text-sm mb-2 leading-tight text-center">
                    {category.name}
                  </h3>
                  
                  {/* Subjects count */}
                  <div className="text-xs text-gray-400 text-center mb-2">
                    {category.subjects?.length || 0} subjects
                  </div>
                  
                  {/* Click indicator */}
                  <p className="text-xs text-primary mt-2 text-center opacity-70">
                    Click to view jobs
                  </p>
                </div>
              ))}
            </div>

            {/* No results message */}
            {filteredCategories.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-600">No categories found matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-primary hover:underline mt-2"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
