'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { useRouter } from 'next/navigation';
import { TutorDashboard } from '@/components/tutor/TutorDashboard';

export default function TutorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to homepage
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    // If user exists but is not a tutor, redirect to homepage
    if (!authLoading && user && user.role !== 'tutor') {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth or redirecting
  if (authLoading || !user || user.role !== 'tutor') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <TutorDashboard />
    </div>
  );
}
