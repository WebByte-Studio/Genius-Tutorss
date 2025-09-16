import { Suspense } from "react";
import { notFound } from "next/navigation";
import TuitionJobDetailsClient from "./TuitionJobDetailsClient";
import { API_BASE_URL } from '@/config/api';

// Required for static export
export async function generateStaticParams() {
  try {
    // Fetch tuition jobs to generate static params
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.geniustutorss.com/api'}/tuition-jobs?limit=100`, {
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch tuition jobs for static generation');
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
    const jobs = data.jobs || data.data || [];
    
    if (jobs.length === 0) {
      // Return fallback data if no jobs found
      return [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' }
      ];
    }
    
    return jobs.map((job: any) => ({
      id: job.id?.toString(),
    }));
  } catch (error) {
    console.warn('Error generating static params for tuition jobs:', error);
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

interface TuitionJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function TuitionJobPage({ params }: TuitionJobPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading job details...</div>}>
      <TuitionJobDetailsClient jobId={id} />
    </Suspense>
  );
}
