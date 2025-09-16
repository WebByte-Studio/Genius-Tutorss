import { Suspense } from "react";
import TutorProfileClient from "./TutorProfileClient";

// Required for static export
export async function generateStaticParams() {
  try {
    // Fetch tutors to generate static params
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.geniustutorss.com/api'}/tutors?limit=100`, {
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch tutors for static generation');
      // Return some fallback static data for build
      return [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' }
      ];
    }
    
    const data = await response.json();
    const tutors = data.tutors || data.data || [];
    
    if (tutors.length === 0) {
      // Return fallback data if no tutors found
      return [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' }
      ];
    }
    
    return tutors.map((tutor: any) => ({
      id: tutor.id?.toString() || tutor.tutor_id?.toString(),
    }));
  } catch (error) {
    console.warn('Error generating static params for tutors:', error);
    // Return fallback static data for build
    return [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' }
    ];
  }
}

interface TutorPageProps {
  params: Promise<{ id: string }>;
}

export default async function TutorPage({ params }: TutorPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading tutor profile...</div>}>
      <TutorProfileClient tutorId={id} />
    </Suspense>
  );
}