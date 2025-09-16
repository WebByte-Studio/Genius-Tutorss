"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  DollarSign, 
  Edit, 
  Eye, 
  FileText, 
  Filter, 
  Heart, 
  Home, 
  LogOut, 
  MapPin, 
  MessageCircle, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Settings, 
  Star, 
  User, 
  Users, 
  X 
} from "lucide-react";

// Import the modular components
import { StudentOverview } from "./StudentOverview";
import { StudentRequestForm } from "./StudentRequestForm";
import { StudentPostedJobs } from "./StudentPostedJobs";
import { StudentSearch } from "./StudentSearch";
import { StudentBookings } from "./StudentBookings";
import { StudentProfile } from "./StudentProfile";
import { StudentCourses } from "./StudentCourses";
import { FloatingStudentChat } from "../components/FloatingStudentChat";

// Import services
import { taxonomyService } from "@/services/taxonomyService";
import { studentChatService } from "@/services/studentChatService";

// Import types
import { ChatContact, ChatMessage, FilterGender } from "@/types/student";

// Import context
import { useAuth } from "@/contexts/AuthContext.next";

export function StudentDashboardMain() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Chat state
  const [chatContacts, setChatContacts] = useState<ChatContact[]>([]);
  const [chatMessages, setChatMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Taxonomy state for tutor request form
  const [categories, setCategories] = useState<Array<{id: number; name: string}>>([]);
  const [subjects, setSubjects] = useState<Array<{id: number; name: string}>>([]);
  const [locations, setLocations] = useState<Array<{id: number; name: string}>>([]);

  // Tutor request form state
  const [requestFormData, setRequestFormData] = useState({
    title: "",
    description: "",
    category: "",
    subject: "",
    location: "",
    budget: "",
    schedule: "",
    requirements: ""
  });

  // Posted jobs state
  const [postedJobs, setPostedJobs] = useState<Array<{
    id: string;
    title: string;
    category: string;
    subject: string;
    location: string;
    budget: string;
    status: string;
    applications: number;
    postedDate: string;
  }>>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterGender, setFilterGender] = useState<FilterGender>('any');
  const [filterRating, setFilterRating] = useState(0);
  const [viewMode, setViewMode] = useState("grid");

  // Chat functions
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      // Send message using the student chat service
      const response = await studentChatService.sendMessage(selectedChat, newMessage);
      
      // Add the new message to the chat
      const newMsg: ChatMessage = {
        id: response.id,
        sender_id: response.senderId,
        sender_name: response.senderName,
        sender_role: 'student',
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
      const chats = await studentChatService.getChats();
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
      const messages = await studentChatService.getChatMessages(chatId);
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

  // Bookings state
  const [bookings, setBookings] = useState<Array<{
    id: string;
    tutorName: string;
    subject: string;
    date: string;
    time: string;
    status: string;
    amount: number;
  }>>([]);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false
    }
  });

  // Courses state
  const [enrolledCourses, setEnrolledCourses] = useState<Array<{
    id: string;
    title: string;
    tutor: string;
    progress: number;
    nextClass: string;
    status: string;
  }>>([]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadTaxonomyData();
      loadChats();
      loadPostedJobs();
      loadBookings();
      loadProfileData();
      loadEnrolledCourses();
    }
  }, [user]);

  // Load chat messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat);
    }
  }, [selectedChat]);

  const loadTaxonomyData = async () => {
    try {
      const taxonomyData = await taxonomyService.getTaxonomyData();
      setCategories(taxonomyData.categories);
      
      // Extract all subjects and locations from categories
      const allSubjects = taxonomyData.categories.flatMap(cat => cat.subjects);
      const allLocations = taxonomyData.categories.flatMap(cat => cat.classLevels);
      
      setSubjects(allSubjects);
      setLocations(allLocations);
    } catch (error) {
      console.error("Error loading taxonomy data:", error);
    }
  };





  const loadPostedJobs = async () => {
    // Mock data - replace with actual API call
    setPostedJobs([
      {
        id: "1",
        title: "Math Tutor Needed",
        category: "Mathematics",
        subject: "Algebra",
        location: "Dhaka",
        budget: "$20-30/hour",
        status: "Active",
        applications: 5,
        postedDate: "2024-01-15"
      },
      {
        id: "2",
        title: "English Literature Help",
        category: "English",
        subject: "Literature",
        location: "Chittagong",
        budget: "$15-25/hour",
        status: "Active",
        applications: 3,
        postedDate: "2024-01-10"
      }
    ]);
  };

  const loadBookings = async () => {
    // Mock data - replace with actual API call
    setBookings([
      {
        id: "1",
        tutorName: "Ahmed Khan",
        subject: "Mathematics",
        date: "2024-01-20",
        time: "14:00",
        status: "Confirmed",
        amount: 25
      },
      {
        id: "2",
        tutorName: "Fatima Rahman",
        subject: "English",
        date: "2024-01-22",
        time: "16:00",
        status: "Pending",
        amount: 20
      }
    ]);
  };

  const loadProfileData = async () => {
    // Mock data - replace with actual API call
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      phone: "+880 1234-567890",
      address: "Dhaka, Bangladesh",
      preferences: {
        notifications: true,
        emailUpdates: true,
        smsUpdates: false
      }
    });
  };

  const loadEnrolledCourses = async () => {
    // Mock data - replace with actual API call
    setEnrolledCourses([
      {
        id: "1",
        title: "Advanced Mathematics",
        tutor: "Dr. Ahmed Khan",
        progress: 75,
        nextClass: "2024-01-25 15:00",
        status: "Active"
      },
      {
        id: "2",
        title: "English Literature",
        tutor: "Prof. Fatima Rahman",
        progress: 60,
        nextClass: "2024-01-26 16:00",
        status: "Active"
      }
    ]);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="request">Request Tutor</TabsTrigger>
            <TabsTrigger value="jobs">Posted Jobs</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StudentOverview 
              profile={{ name: user?.name || 'Student' }}
              requestsPostedCount={postedJobs.length}
              tutorRequestedCount={0}
              tutorAssignedCount={0}
              paymentsProcessedCount={0}
              postedRequests={postedJobs}
              filteredTutors={[]}
              setActiveTab={setActiveTab}
              inviteDemo={() => {}}
            />
          </TabsContent>

          <TabsContent value="request">
            <StudentRequestForm 
              categories={categories}
              subjects={subjects}
              locations={locations}
              formData={requestFormData}
              setFormData={setRequestFormData}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <StudentPostedJobs 
              postedRequests={postedJobs}
              isLoadingRequests={false}
              refreshPostedRequests={() => loadPostedJobs()}
              deleteTutorRequest={async (id: string) => {
                setPostedJobs(prev => prev.filter(job => job.id !== id));
              }}
              isDeletingRequest={null}
              populateFormForEdit={() => {}}
              setActiveTab={setActiveTab}
              inviteDemo={() => {}}
              bookSession={() => {}}
            />
          </TabsContent>

          <TabsContent value="search">
            <StudentSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterSubject={filterSubject}
              setFilterSubject={setFilterSubject}
              filterArea={filterArea}
              setFilterArea={setFilterArea}
              filterGender={filterGender}
              setFilterGender={setFilterGender}
              filterRating={filterRating}
              setFilterRating={setFilterRating}
              viewMode={viewMode}
              setViewMode={setViewMode}
              filteredTutors={[]}
              inviteDemo={() => {}}
            />
          </TabsContent>

          <TabsContent value="bookings">
            <StudentBookings 
              bookings={bookings}
              payDialog={{ open: false, bookingId: null }}
              setPayDialog={() => {}}
              paymentMethod={'bKash'}
              setPaymentMethod={() => {}}
              payForBooking={() => {}}
              downloadInvoice={() => {}}
              paymentMethods={[]}
            />
          </TabsContent>



          <TabsContent value="profile">
            <StudentProfile 
              profile={profileData}
              paymentMethods={[]}
              isLoadingPaymentMethods={false}
              handleProfileUpdate={async () => {}}
              handlePasswordChange={async () => false}
              handleAddPaymentMethod={async () => false}
              handleUpdatePaymentMethod={async () => false}
              handleDeletePaymentMethod={async () => false}
              handleSetDefaultPaymentMethod={async () => false}
            />
          </TabsContent>

          <TabsContent value="courses">
            <StudentCourses 
              enrollments={enrolledCourses}
              isLoadingEnrollments={false}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Student Chat Widget */}
      <FloatingStudentChat
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
