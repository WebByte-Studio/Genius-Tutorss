import React, { useState, useEffect, useRef } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { Menu, X } from 'lucide-react';
import { Search, Calendar, DollarSign, MessageSquare, Star, Users, BookOpen, Award, Eye } from 'lucide-react';
import ProfileSection from './ProfileSection';
import TutorAssignmentsSection from './TutorAssignmentsSection';
import { EnhancedTutorSupport } from './EnhancedTutorSupport';
import { DemoClassesSection } from './DemoClassesSection';
import { FloatingTutorChat } from './components/FloatingTutorChat';

import { ReviewsSection } from './ReviewsSection';
import SubscriptionSection from './SubscriptionSection';
import EnhancedUpgradeSection from './EnhancedUpgradeSection';
import CourseManagementSection from './CourseManagementSection';
import ApplicationSection from './ApplicationSection';
import { useAuth } from '@/contexts/AuthContext.next';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { tutorDashboardService, type Activity, type Job, type Transaction, type PaymentMethod, type RecentTuitionJob, type RecentAssignment } from '@/services/tutorDashboardService';
import { tuitionJobsService, type TuitionJob } from '@/services/tuitionJobsService';
import { useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/config/api';
import { tutorChatService } from '@/services/tutorChatService';
import { ChatContact, ChatMessage } from '@/types/student';



// Dashboard Section Component
const DashboardSection = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    averageRating: '0.0',
    totalStudents: 0,
    activeJobs: 0,
    appliedJobs: 0,
    acceptedJobs: 0
  });
  const [recentTuitionJobs, setRecentTuitionJobs] = useState<RecentTuitionJob[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [stats, tuitionJobs, assignments] = await Promise.all([
          tutorDashboardService.getDashboardStats(),
          tutorDashboardService.getRecentTuitionJobs(),
          tutorDashboardService.getRecentAssignments()
        ]);
        
        setDashboardStats(stats);
        setRecentTuitionJobs(tuitionJobs);
        setRecentAssignments(assignments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Dashboard service already handles errors gracefully, so no additional fallback needed
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name || "Tutor"}!</h1>
            <p className="text-green-100">Here{`'`}s what{`'`}s happening with your tutoring business today.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month{`'`}s Earnings</p>
                <p className="text-2xl font-bold text-green-600">৳{dashboardStats.thisMonthEarnings.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">{dashboardStats.completedSessions} completed</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{dashboardStats.averageRating}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-3 w-3 ${star <= Math.floor(parseFloat(dashboardStats.averageRating)) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardStats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">{dashboardStats.activeJobs} active jobs</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tuition Jobs and Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tuition Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Recent Tuition Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTuitionJobs.length > 0 ? (
                recentTuitionJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.subject} • {job.student_name} • {job.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString()} • Budget: ৳{job.budget}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                      {job.applied && (
                        <Badge variant="outline" className="text-xs">
                          Applied
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No recent tuition jobs</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button className="w-full" variant="outline">
                View All Jobs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssignments.length > 0 ? (
                recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.subject} • {assignment.student_name} • {assignment.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(assignment.assigned_at).toLocaleDateString()} • Budget: ৳{assignment.budget}
                      </p>
                    </div>
                    <Badge variant={
                      assignment.status === 'completed' ? 'default' :
                      assignment.status === 'accepted' ? 'secondary' :
                      assignment.status === 'pending' ? 'outline' :
                      'destructive'
                    }>
                      {assignment.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No recent assignments</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button className="w-full" variant="outline">
                View All Assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      
    </div>
  );
};

// Find Jobs Section
const JobsSection = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<TuitionJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<TuitionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (selectedSubject !== 'all') {
        params.subject = selectedSubject;
      }
      
      if (selectedLocation !== 'all') {
        params.district = selectedLocation;
      }
      
      const response = await tuitionJobsService.getAllTuitionJobs(params);
      if (response.success) {
        setJobs(response.data);
        setFilteredJobs(response.data);
      } else {
        console.error('Failed to fetch tuition jobs');
        setJobs([]);
        setFilteredJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedSubject, selectedLocation]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = jobs.filter(job => 
        job.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.studentClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs]);

  const handleViewDetails = (jobId: string) => {
    router.push(`/tuition-jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
          <p className="text-gray-600">Browse and apply for tutoring opportunities</p>
        </div>
        <Badge variant="secondary">{filteredJobs.length} jobs available</Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs by subject, class, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Subjects</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Bangla">Bangla</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Locations</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.subject} Tutor for {job.studentClass} Student
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Subject</p>
                        <p className="font-medium">{job.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{job.district}, {job.area}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Salary Range</p>
                        <p className="font-medium text-green-600">৳{job.salaryRangeMin} - ৳{job.salaryRangeMax}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student Class</p>
                        <p className="font-medium">{job.studentClass}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Tutoring Type</p>
                        <p className="font-medium">{job.tutoringType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Days Per Week</p>
                        <p className="font-medium">{job.daysPerWeek} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Preferred Gender</p>
                        <p className="font-medium">{job.preferredTeacherGender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student Gender</p>
                        <p className="font-medium">{job.studentGender}</p>
                      </div>
                    </div>

                    {job.extraInformation && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Additional Information:</p>
                        <p className="text-gray-900">{job.extraInformation}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{job.numberOfStudents} student{job.numberOfStudents > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{job.tutoringTime}</span>
                    </div>
                  </div>

                  <div className="ml-6">
                    <Button
                      onClick={() => handleViewDetails(job.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tuition jobs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedSubject !== 'all' || selectedLocation !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'There are currently no tuition jobs available. Check back later!'
              }
            </p>
            {(searchTerm || selectedSubject !== 'all' || selectedLocation !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('all');
                  setSelectedLocation('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Wallet Section - REMOVED

// Chat Section Component using EnhancedTutorSupport
const ChatSection = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  return (
    <EnhancedTutorSupport
      selectedChat={selectedChat}
      setSelectedChat={setSelectedChat}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
    />
  );
};

export function TutorDashboard() {
  // Add CSS for enhanced scrolling
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide scrollbar for Chrome, Safari and Opera */
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      /* Hide scrollbar for IE, Edge and Firefox */
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      
      /* Custom scrollbar styles */
      .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      
      /* Smooth scrolling */
      .smooth-scroll {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMobileSidebar && !target.closest('.mobile-sidebar')) {
        setShowMobileSidebar(false);
      }
    };

    if (showMobileSidebar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMobileSidebar]);

  const { signOut, user } = useAuth();
  const { toast } = useToast();

  // Chat state for FloatingTutorChat
  const [chatContacts, setChatContacts] = useState<ChatContact[]>([]);
  const [chatMessages, setChatMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Chat functions
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      // Send message using the tutor chat service
      const response = await tutorChatService.sendMessage(selectedChat, newMessage);
      
      // Add the new message to the chat
      const newMsg: ChatMessage = {
        id: response.id,
        sender_id: response.senderId,
        sender_name: response.senderName,
        sender_role: 'tutor',
        message: newMessage,
        message_type: 'text',
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMsg]
      }));
      
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const loadChats = async () => {
    try {
      const chats = await tutorChatService.getChats();
      setChatContacts(chats.map(chat => ({
        id: chat.id,
        name: chat.name,
        type: 'support',
        last_message: chat.lastMessage,
        unread_count: chat.unreadCount,
        created_at: chat.updatedAt,
        updated_at: chat.updatedAt
      })));
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      const messages = await tutorChatService.getChatMessages(chatId);
      const formattedMessages: ChatMessage[] = messages.map((msg: any) => ({
        id: msg.id,
        sender_id: msg.senderId,
        sender_name: msg.senderName,
        sender_role: msg.senderRole || 'admin',
        message: msg.message,
        message_type: msg.messageType || 'text',
        created_at: msg.timestamp,
        is_read: msg.isRead
      }));
      
      setChatMessages(prev => ({
        ...prev,
        [chatId]: formattedMessages
      }));
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  // Load initial chats when component mounts
  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  // Load chat messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat);
    }
  }, [selectedChat]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full tutor-dashboard">
      {/* Sticky Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-80 md:fixed md:inset-y-0 md:z-50 bg-white border-r border-gray-200 shadow-lg">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Header - Connected to Navbar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Tutor</span>
            </div>
          </div>
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            <DashboardSidebar 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
              role="tutor"
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 lg:pl-80 flex flex-col flex-1 min-w-0 w-full">
        {/* Sticky Navbar */}
        <DashboardNavbar 
          user={{
            id: user?.id,
            name: user?.full_name || 'Tutor',
            email: user?.email || '',
            role: 'tutor',
            avatar: user?.avatar_url
          }} 
          onLogout={handleLogout}
          onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
          showMobileSidebar={showMobileSidebar}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 w-full main-content">
          <div className="w-full max-w-none content-container">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "dashboard" && <DashboardSection />}
            {activeTab === "courses" && <CourseManagementSection />}
            {activeTab === "jobs" && <JobsSection />}
            {activeTab === "applications" && <ApplicationSection />}
            
            {activeTab === "chat" && <ChatSection />}
            {activeTab === "reviews" && <ReviewsSection />}
            {activeTab === "assignments" && <TutorAssignmentsSection />}
            {activeTab === "demo-classes" && <DemoClassesSection tutorId={user?.id || ''} />}
            {activeTab === "subscription" && <EnhancedUpgradeSection />}

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
              <h2 className="text-lg font-semibold text-gray-900">Tutor Menu</h2>
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
                role="tutor"
              />
            </div>
          </aside>
        </div>
      )}
      
              {/* Floating Tutor Chat Widget */}
              <FloatingTutorChat
          chatContacts={chatContacts}
          chatMessages={chatMessages}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
        />
    </div>
  );
}

export default TutorDashboard;

