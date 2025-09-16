'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext.next';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Award, 
  TrendingUp, 
  Play, 
  FileText,
  Calendar,
  Target,
  Activity,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';
import { getLearningDashboard, type LearningDashboard } from '@/services/courseService';
import Link from 'next/link';
import { EnhancedStudentSupport } from '@/components/student/EnhancedStudentSupport';

export default function StudentDashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<LearningDashboard | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Chat state for floating support chat
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }

      // Check if user has student role
      if (user.role && user.role !== 'student') {
        // Redirect users to their specific dashboards
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'manager') {
          router.push('/manager/dashboard');
        } else if (user.role === 'super_admin') {
          router.push('/super-admin/dashboard');
        } else if (user.role === 'tutor') {
          router.push('/dashboard');
        }
        return;
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchDashboard = async () => {
    try {
      setDataLoading(true);
      const data = await getLearningDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learning dashboard',
        variant: 'destructive'
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen max-w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verifying student access...</p>
        </div>
      </div>
    );
  }

  // User not authenticated or doesn't have access
  if (!user || user.role !== 'student') {
    return null; // Return null as we're redirecting in useEffect
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'request':
        return renderTutorRequestContent();
      case 'posted-jobs':
        return renderPostedJobsContent();
      case 'search':
        return renderSearchTutorsContent();
      case 'demo-classes':
        return renderDemoClassesContent();
      case 'courses':
        return renderCoursesContent();
      case 'profile':
        return renderProfileContent();
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => {
    if (dataLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        </div>
      );
    }

    if (!dashboard) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
          <p className="text-gray-500 mb-4">Start your learning journey by enrolling in courses</p>
          <Link href="/courses">
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Learning Dashboard</h2>
            <p className="text-muted-foreground">
              Track your progress and manage your learning journey
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.stats?.total_courses || 0}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.stats?.completed_courses || 0}</div>
              <p className="text-xs text-muted-foreground">
                Finished courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.stats?.total_courses - dashboard.stats?.completed_courses || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently learning
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.stats?.total_hours_learned || 0}</div>
              <p className="text-xs text-muted-foreground">
                Learning time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.recentActivity && dashboard.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' : 
                      activity.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.lesson_title} - {activity.course_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.status === 'completed' ? 'Completed' : 
                         activity.status === 'in_progress' ? `${activity.progress_percentage}% completed` : 
                         'Not started'} • {new Date(activity.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTutorRequestContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tutor Request</h2>
          <p className="text-muted-foreground">
            Submit a request to find the perfect tutor for your needs
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tutor Request System</h3>
              <p className="text-gray-500 mb-4">Submit your requirements and we'll match you with qualified tutors</p>
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Create New Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPostedJobsContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Posted Jobs</h2>
          <p className="text-muted-foreground">
            View and manage your posted tutor requests
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Posted Requests</h3>
              <p className="text-gray-500 mb-4">Manage your tutor requests and view responses</p>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                View All Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSearchTutorsContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Search Tutors</h2>
          <p className="text-muted-foreground">
            Find qualified tutors based on your requirements
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tutor Search</h3>
              <p className="text-gray-500 mb-4">Search for tutors by subject, location, and other criteria</p>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Start Searching
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDemoClassesContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Demo Classes</h2>
          <p className="text-muted-foreground">
            Book demo classes with potential tutors
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Demo Classes</h3>
              <p className="text-gray-500 mb-4">Try out tutors with free demo classes before committing</p>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Book Demo Class
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCoursesContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Courses</h2>
          <p className="text-muted-foreground">
            Manage your enrolled courses and track progress
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Course Management</h3>
              <p className="text-gray-500 mb-4">View your enrolled courses and learning progress</p>
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                View Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProfileContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management</h3>
              <p className="text-gray-500 mb-4">Update your profile information and preferences</p>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full student-dashboard">
      {/* Sticky Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-80 md:fixed md:inset-y-0 md:z-50 bg-white border-r border-gray-200 shadow-lg">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Header - Connected to Navbar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Student Dashboard
              </span>
            </div>
          </div>
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            <DashboardSidebar 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
              role="student"
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 lg:pl-80 flex flex-col flex-1 min-w-0 w-full">
        {/* Sticky Navbar */}
        <DashboardNavbar 
          user={{
            name: user.full_name || user.name || 'Student',
            email: user.email || '',
            role: user.role || 'student',
            avatar: user.avatar_url
          }}
          onLogout={handleLogout}
          onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
          showMobileSidebar={showMobileSidebar}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 w-full main-content">
          <div className="w-full max-w-none content-container">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowMobileSidebar(false)}>
          <aside 
            className="mobile-sidebar fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 relative z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                Student Menu
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSidebar(false)}
                className="h-8 w-8 relative z-20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto h-full pb-20 p-4">
              <DashboardSidebar 
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setShowMobileSidebar(false);
                }}
                onLogout={handleLogout}
                role="student"
              />
            </div>
          </aside>
        </div>
      )}
      
      {/* Floating Support Chat Widget */}
      <EnhancedStudentSupport
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />
    </div>
  );
}