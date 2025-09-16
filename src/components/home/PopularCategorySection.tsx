'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { categoryService, CategoryData } from '@/services/categoryService';

export function PopularCategorySection() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await categoryService.getPopularCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to tuition-jobs page with category filter applied
    router.push(`/tuition-jobs?category=${encodeURIComponent(categoryName)}`);
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4"> 
            CHOOSE YOUR <span className="text-primary">CATEGORY</span>
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Loading categories...
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border p-4 text-center animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4"> 
            CHOOSE YOUR <span className="text-primary">CATEGORY</span>
            </h2>
            <p className="text-red-600 text-lg mb-6">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4"> 
            CHOOSE YOUR <span className="text-primary">CATEGORY</span>
            </h2>
        </div>

        {/* View All button */}
        <div className="flex justify-end mb-8 px-4">
          <Link href="/categories">
            <button 
              className="border border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              View All
            </button>
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white rounded-lg border p-4 text-center relative hover:ring-2 hover:ring-primary/20"
              onClick={() => handleCategoryClick(category.name)}
            >
              {/* Arrow icon */}
              <div className="absolute top-2 right-2 text-primary opacity-60">
                ↗
              </div>
              
              {/* Category icon */}
              <div className={`${category.color} mb-3 flex justify-center text-2xl`}>
                {category.icon}
              </div>
              
              {/* Category name */}
              <h3 className="font-semibold text-gray-800 text-sm mb-2 leading-tight">
                {category.name}
              </h3>
              
              {/* Tuition count */}
              <p className="text-primary font-bold text-lg">
                {category.tuitions}
              </p>
              <p className="text-gray-600 text-xs">
                Tuitions
              </p>
              
              {/* Click indicator */}
              <p className="text-xs text-primary mt-2 opacity-70">
                Click to view jobs
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
