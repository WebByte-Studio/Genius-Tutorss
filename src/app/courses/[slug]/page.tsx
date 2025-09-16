import CourseDetailClient from "./CourseDetailClient";
import { API_BASE_URL } from '@/config/api';

export async function generateStaticParams() {
  try {
    // Fetch published courses to generate static params
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.geniustutorss.com/api'}/courses?limit=100`, {
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch courses for static generation');
      // Return some fallback static data for build
      return [
        { slug: 'math-basics' },
        { slug: 'english-grammar' },
        { slug: 'science-fundamentals' },
        { slug: 'history-overview' },
        { slug: 'computer-science' }
      ];
    }
    
    const data = await response.json();
    const courses = data.courses || data.data || [];
    
    if (courses.length === 0) {
      // Return fallback data if no courses found
      return [
        { slug: 'math-basics' },
        { slug: 'english-grammar' },
        { slug: 'science-fundamentals' },
        { slug: 'history-overview' },
        { slug: 'computer-science' }
      ];
    }
    
    return courses.map((course: any) => ({
      slug: course.slug || course.id?.toString(),
    }));
  } catch (error) {
    console.warn('Error generating static params for courses:', error);
    // Return fallback static data for build
    return [
      { slug: 'math-basics' },
      { slug: 'english-grammar' },
      { slug: 'science-fundamentals' },
      { slug: 'history-overview' },
      { slug: 'computer-science' }
    ];
  }
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  return <CourseDetailClient slug={params.slug} />;
}
