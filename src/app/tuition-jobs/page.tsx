'use client';

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock, DollarSign, BookOpen, Search, LayoutGrid, List, Filter, RefreshCw, User, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.next";
import { tuitionJobsService, TuitionJob } from "@/services/tuitionJobsService";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from '@/data/bangladeshDistricts';
import { useSearchParams, useRouter } from "next/navigation";

export default function TuitionJobs() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedPostOffice, setSelectedPostOffice] = useState<string>("all");
  const [selectedJobType, setSelectedJobType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [taxonomyData, setTaxonomyData] = useState<any>(null);

  // Available areas and post offices based on selected district
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availablePostOffices, setAvailablePostOffices] = useState<Array<{name: string, postcode: string}>>([]);

  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 1000000]);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [newListingsOnly, setNewListingsOnly] = useState(false);
  const [jobs, setJobs] = useState<TuitionJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  const fetchTuitionJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      
      if (selectedSubject !== 'all') {
        params.subject = selectedSubject;
      }
      
      if (selectedDistrict !== 'all') {
        params.district = selectedDistrict;
      }
      
      if (selectedArea !== 'all') {
        params.area = selectedArea;
      }
      
      if (selectedPostOffice !== 'all') {
        params.postOffice = selectedPostOffice;
      }
      
      if (selectedJobType !== 'all') {
        params.tutoringType = selectedJobType;
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      const response = await tuitionJobsService.getAllTuitionJobs(params);
      if (response.success) {
        console.log('Fetched tuition jobs:', response.data);
        console.log('Total jobs fetched:', response.data.length);
        setJobs(response.data);
      } else {
        setError('Failed to fetch tuition jobs');
      }
    } catch (error) {
      console.error('Error fetching tuition jobs:', error);
      setError('An error occurred while fetching tuition jobs');
      toast({
        title: 'Error',
        description: 'Failed to load tuition jobs. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, selectedDistrict, selectedArea, selectedPostOffice, selectedJobType, selectedCategory, selectedStatus, toast]);

  // Fetch taxonomy data
  useEffect(() => {
    const fetchTaxonomyData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/website/taxonomy`);
        const result = await response.json();
        
        if (result.success) {
          setTaxonomyData(result.data);
        } else {
          console.error('Failed to fetch taxonomy data:', result.error);
        }
      } catch (error) {
        console.error('Error fetching taxonomy data:', error);
      }
    };

    fetchTaxonomyData();
  }, []);

  useEffect(() => {
    fetchTuitionJobs();
  }, [selectedSubject, selectedDistrict, selectedArea, selectedPostOffice, selectedCategory, selectedStatus, fetchTuitionJobs]);

  // Read URL parameters on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const districtFromUrl = searchParams.get('district');
    
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    
    if (districtFromUrl) {
      setSelectedDistrict(districtFromUrl);
    }
  }, [searchParams]);

  // Update available areas when district changes
  useEffect(() => {
    if (selectedDistrict !== 'all') {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === selectedDistrict);
      if (district) {
        setAvailableAreas(district.areas.map(area => area.name));
        // Reset area and post office when district changes
        setSelectedArea('all');
        setSelectedPostOffice('all');
      } else {
        setAvailableAreas([]);
      }
    } else {
      setAvailableAreas([]);
      setSelectedArea('all');
      setSelectedPostOffice('all');
    }
  }, [selectedDistrict]);

  // Update available post offices when area changes
  useEffect(() => {
    if (selectedDistrict !== 'all' && selectedArea !== 'all') {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === selectedDistrict);
      if (district) {
        const area = district.areas.find(a => a.name === selectedArea);
        if (area) {
          setAvailablePostOffices(area.postOffices);
          // Reset post office when area changes
          setSelectedPostOffice('all');
        } else {
          setAvailablePostOffices([]);
        }
      }
    } else {
      setAvailablePostOffices([]);
    }
  }, [selectedDistrict, selectedArea]);

  // Real-time filtering for search, salary range, and checkboxes
  useEffect(() => {
    // This will trigger re-filtering when search query, salary range, or checkboxes change
    // The filteredJobs array will automatically update
  }, [searchQuery, salaryRange, urgentOnly, remoteOnly, newListingsOnly]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Real-time search is implemented through the filteredJobs array
  };

  // Handle job application
  const handleApplyForJob = async (jobId: string, jobTitle: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to apply for tuition jobs.',
        variant: 'destructive'
      });
      return;
    }

    if (user.role !== 'tutor') {
      toast({
        title: 'Access Denied',
        description: 'Only tutors can apply for tuition jobs.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setApplying(jobId);
      const response = await tuitionJobsService.applyForJob(jobId, `I am interested in teaching ${jobTitle}.`);
      
      if (response.success) {
        toast({
          title: 'Application Submitted',
          description: response.message || 'Your application has been submitted successfully!',
        });
      } else {
        toast({
          title: 'Application Failed',
          description: response.message || 'Failed to submit application',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error applying for job:', error);
      toast({
        title: 'Application Error',
        description: error.message || 'An error occurred while applying for the job.',
        variant: 'destructive'
      });
    } finally {
      setApplying(null);
    }
  };

  // Fallback demo jobs in case API fails
  const demoJobs = [
    {
      id: 1,
      title: "Mathematics Tutor - Grade 10",
      subject: "Mathematics",
      location: "Dhanmondi, Dhaka",
      salary: "৳8,000-12,000/month",
      duration: "6 months",
      type: "Part-time",
      description: "Looking for an experienced math tutor for Grade 10 student preparation for SSC exams.",
      requirements: ["Bachelor's degree in Mathematics", "2+ years experience", "SSC/HSC teaching experience"]
    },
    {
      id: 2,
      title: "English Language Tutor - Primary",
      subject: "English",
      location: "Gulshan, Dhaka", 
      salary: "৳6,000-10,000/month",
      duration: "3 months",
      type: "Part-time",
      description: "Seeking English tutor for primary school students to improve speaking and writing skills.",
      requirements: ["English Literature/Language degree", "Good communication skills", "Primary teaching experience"]
    },
    {
      id: 3,
      title: "Physics & Chemistry Tutor - HSC",
      subject: "Science",
      location: "Mirpur, Dhaka",
      salary: "৳15,000-20,000/month", 
      duration: "12 months",
      type: "Full-time",
      description: "Expert tutor needed for HSC Physics and Chemistry preparation with proven track record.",
      requirements: ["MSc in Physics/Chemistry", "5+ years HSC teaching", "University admission coaching experience"]
    },
    {
      id: 4,
      title: "Biology Tutor - O Level",
      subject: "Biology",
      location: "Banani, Dhaka",
      salary: "৳12,000-15,000/month",
      duration: "8 months",
      type: "Part-time",
      description: "Seeking a qualified biology tutor for O Level student with focus on practical experiments and exam preparation.",
      requirements: ["BSc in Biology or related field", "Experience with O Level curriculum", "Strong practical knowledge"]
    },
    {
      id: 5,
      title: "Computer Science Tutor - College Level",
      subject: "Computer Science",
      location: "Uttara, Dhaka",
      salary: "৳18,000-25,000/month",
      duration: "6 months",
      type: "Full-time",
      description: "Looking for a computer science tutor to teach programming fundamentals, data structures, and algorithms.",
      requirements: ["BSc in Computer Science/Engineering", "Proficient in Java, Python, and C++", "Project-based teaching experience"]
    },
    {
      id: 6,
      title: "Bangla Literature Tutor - Grade 8",
      subject: "Bangla",
      location: "Mohammadpur, Dhaka",
      salary: "৳7,000-9,000/month",
      duration: "4 months",
      type: "Part-time",
      description: "Need a Bangla literature tutor for middle school student focusing on grammar and creative writing.",
      requirements: ["BA in Bangla Literature", "Experience with middle school curriculum", "Creative writing skills"]
    },
  ];

  // Filter jobs based on search query and selected filters
  const filteredJobs = jobs.filter((job) => {
    // Show all requests (not just active ones)
    // const isActive = job.status === 'active';
    
    const matchesSearch = 
      (job.subject && job.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.studentClass && job.studentClass.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.district && job.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.area && job.area.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.postOffice && job.postOffice.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.studentName && job.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'all' || job.subject === selectedSubject;
    const matchesDistrict = selectedDistrict === 'all' || job.district === selectedDistrict;
    const matchesArea = selectedArea === 'all' || job.area === selectedArea;
    const matchesPostOffice = selectedPostOffice === 'all' || job.postOffice === selectedPostOffice;
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
    // More inclusive salary filtering: show jobs that overlap with the selected range
    // or jobs that are within a reasonable range (handle edge cases like very high salaries)
    const salaryOverlap = job.salaryRangeMin <= salaryRange[1] && job.salaryRangeMax >= salaryRange[0];
    // Handle extreme salary values more gracefully - show jobs with very high salaries by default
    const extremeSalary = job.salaryRangeMin > 1000000 || job.salaryRangeMax > 1000000;
    const matchesSalary = salaryOverlap || extremeSalary;
    const matchesUrgent = !urgentOnly || job.urgent === true;
    const matchesRemote = !remoteOnly || job.tutoringType === 'Online Tutoring' || job.tutoringType === 'Both';
    const matchesNew = !newListingsOnly || (new Date().getTime() - new Date(job.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000); // Within 7 days
    
    const allMatches = matchesSearch && matchesSubject && matchesDistrict && matchesArea && matchesPostOffice && matchesCategory && matchesStatus && matchesSalary && matchesUrgent && matchesRemote && matchesNew;
    
    // Debug logging for jobs that don't match
    if (!allMatches && jobs.length > 0) {
      console.log('Job filtered out:', {
        id: job.id,
        subject: job.subject,
        status: job.status,
        salaryRangeMin: job.salaryRangeMin,
        salaryRangeMax: job.salaryRangeMax,
        currentSalaryRange: salaryRange,
        matchesSearch,
        matchesSubject,
        matchesDistrict,
        matchesArea,
        matchesPostOffice,
        matchesCategory,
        matchesStatus,
        matchesSalary,
        matchesUrgent,
        matchesRemote,
        matchesNew
      });
    }
    
    // Special logging for the problematic record
    if (job.id === '73938b3d-ec34-4988-8b4b-9445f863dd8f') {
      console.log('Problematic record analysis:', {
        id: job.id,
        salaryRangeMin: job.salaryRangeMin,
        salaryRangeMax: job.salaryRangeMax,
        currentSalaryRange: salaryRange,
        salaryOverlap,
        extremeSalary,
        matchesSalary,
        allMatches
      });
    }
    
    return allMatches;
  });

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Tuition Jobs</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Find the perfect tutoring opportunity</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Filters Section - Top on Mobile, Left Sidebar on Desktop */}
        <div className="order-1 lg:w-80 lg:order-1">
          <Card className="h-fit lg:sticky lg:top-20">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category" className="h-10 sm:h-11">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {taxonomyData?.categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status" className="h-10 sm:h-11">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="assign">Assigned</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select "All Statuses" to see all requests including inactive ones
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="subject" className="h-10 sm:h-11">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {taxonomyData?.categories?.flatMap((category: any) => 
                      category.subjects?.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="text-sm">District</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger id="district" className="h-10 sm:h-11">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {BANGLADESH_DISTRICTS_WITH_POST_OFFICES.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area" className="text-sm">Area</Label>
                <Select value={selectedArea} onValueChange={setSelectedArea} disabled={selectedDistrict === 'all'}>
                  <SelectTrigger id="area" className="h-10 sm:h-11">
                    <SelectValue placeholder={selectedDistrict === 'all' ? "Select a district first" : "All Areas"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {availableAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postOffice" className="text-sm">Post Office</Label>
                <Select value={selectedPostOffice} onValueChange={setSelectedPostOffice} disabled={selectedArea === 'all'}>
                  <SelectTrigger id="postOffice" className="h-10 sm:h-11">
                    <SelectValue placeholder={selectedArea === 'all' ? "Select an area first" : "All Post Offices"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Post Offices</SelectItem>
                    {availablePostOffices.map((postOffice) => (
                      <SelectItem key={postOffice.name} value={postOffice.name}>
                        {postOffice.name} ({postOffice.postcode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType" className="text-sm">Tutoring Type</Label>
                <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                  <SelectTrigger id="jobType" className="h-10 sm:h-11">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Home">Home Tutoring</SelectItem>
                    <SelectItem value="Online">Online Tutoring</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Salary Range (BDT)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={salaryRange[0]} 
                    onChange={(e) => setSalaryRange([parseInt(e.target.value) || 0, salaryRange[1]])}
                    className="h-10 sm:h-11 text-sm"
                  />
                  <span className="text-sm">to</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={salaryRange[1]} 
                    onChange={(e) => setSalaryRange([salaryRange[0], parseInt(e.target.value) || 0])}
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Jobs with salaries up to ৳1M are shown by default. Jobs with extreme salaries (above ৳1M) are always shown regardless of filters.
                </p>
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  🔍 <strong>How it works:</strong> The salary filter shows jobs within your selected range, plus any jobs with extremely high salaries (above ৳1M) to ensure you don't miss premium opportunities.
                </p>
                {jobs.filter(job => job.salaryRangeMin > 1000000 || job.salaryRangeMax > 1000000).length > 0 && (
                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                    💡 <strong>Note:</strong> There are {jobs.filter(job => job.salaryRangeMin > 1000000 || job.salaryRangeMax > 1000000).length} job(s) with salaries above ৳1M that are always visible.
                  </p>
                )}
              </div>

              <div className="hidden sm:block space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="urgent" 
                    checked={urgentOnly}
                    onCheckedChange={(checked) => setUrgentOnly(checked === true)}
                  />
                  <Label htmlFor="urgent" className="text-sm font-normal">Urgent Positions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remote" 
                    checked={remoteOnly}
                    onCheckedChange={(checked) => setRemoteOnly(checked === true)}
                  />
                  <Label htmlFor="remote" className="text-sm font-normal">Remote Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="newListings" 
                    checked={newListingsOnly}
                    onCheckedChange={(checked) => setNewListingsOnly(checked === true)}
                  />
                  <Label htmlFor="newListings" className="text-sm font-normal">New Listings</Label>
                </div>
              </div>

              <Button 
                className="w-full h-10 sm:h-11" 
                variant="outline" 
                onClick={() => {
                  setSelectedSubject("all");
                  setSelectedDistrict("all");
                  setSelectedArea("all");
                  setSelectedPostOffice("all");
                  setSelectedJobType("all");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setSalaryRange([0, 1000000]);
                  setSearchQuery("");
                  setUrgentOnly(false);
                  setRemoteOnly(false);
                  setNewListingsOnly(false);
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Right Side */}
        <div className="flex-1 space-y-4 sm:space-y-6 order-2 lg:order-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              {selectedCategory !== 'all' && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Filtered by: {selectedCategory}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="h-6 px-2 text-xs"
                  >
                    Clear Category
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant={viewMode === "grid" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-1 flex-1 sm:flex-none"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center gap-1 flex-1 sm:flex-none"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTuitionJobs}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by subject..."
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* View Toggle */}
            <div className="flex items-center justify-end">
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Job Listings */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 sm:p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                      <div className="bg-muted p-4 flex justify-between">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
                <p className="mt-1 text-muted-foreground text-sm sm:text-base">Try adjusting your filters or search terms</p>
                {jobs.length > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-orange-800">
                      <strong>Tip:</strong> There are {jobs.length} total jobs available. 
                      {jobs.filter(job => job.salaryRangeMin > 1000000 || job.salaryRangeMax > 1000000).length > 0 && (
                        <span> {jobs.filter(job => job.salaryRangeMin > 1000000 || job.salaryRangeMax > 1000000).length} of them have high salaries and are always visible.</span>
                      )}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setSelectedSubject("all");
                        setSelectedDistrict("all");
                        setSelectedArea("all");
                        setSelectedPostOffice("all");
                        setSelectedJobType("all");
                        setSelectedCategory("all");
                        setSelectedStatus("all");
                        setSalaryRange([0, 1000000]);
                        setSearchQuery("");
                        setUrgentOnly(false);
                        setRemoteOnly(false);
                        setNewListingsOnly(false);
                      }}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" : "space-y-4"}>
                {viewMode === "list" ? (
                  filteredJobs.map((job) => (
                    <div key={job.id} className="flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="p-4 sm:p-6 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold">{job.studentName}'s Request</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Class {job.studentClass} • {job.medium} Medium • ID: {job.id}</p>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center flex-wrap gap-1 sm:gap-2">
                            <Badge variant={job.tutoringType === "Home Tutoring" ? "default" : "outline"} className="text-xs">
                              {job.tutoringType} Tutoring
                            </Badge>
                            {(job.salaryRangeMin > 1000000 || job.salaryRangeMax > 1000000) && (
                              <Badge variant="destructive" className="text-xs">
                                High Salary
                              </Badge>
                            )}
                            <Badge variant={job.status === "active" ? "default" : "secondary"} className="text-xs">
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                          <div className="flex items-center text-xs sm:text-sm">
                            <BookOpen className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="font-bold">{job.subject}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm">
                            <MapPin className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="font-bold">{job.district}, {job.area}</span>
                            {job.postOffice && (
                              <span className="text-xs text-muted-foreground ml-1">• {job.postOffice}</span>
                            )}
                          </div>

                          <div className="flex items-center text-xs sm:text-sm">
                            <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="font-bold">{job.daysPerWeek} days/week • {job.tutoringTime}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm">
                            <Users className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="font-bold">{job.numberOfStudents} student(s) • {job.studentGender}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm">
                            <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="font-bold">Preferred: {job.preferredTeacherGender} teacher</span>
                          </div>
                        </div>
                        
                        {job.extraInformation && (
                          <div className="mt-3">
                            <p className="text-xs sm:text-sm font-medium">Additional Information:</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{job.extraInformation}</p>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground mt-3">
                          Posted: {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="p-4 bg-muted flex justify-between items-center">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                          onClick={() => router.push(`/tuition-jobs/${job.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  filteredJobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-2 p-4 sm:p-6">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg sm:text-xl">{job.studentName}'s Request</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            Tutoring Request
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Class {job.studentClass} • ID: {job.id}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                        <div className="space-y-2">
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <BookOpen className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold">{job.subject}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold">{job.district}, {job.area}</span>
                            {job.postOffice && (
                              <span className="text-xs text-muted-foreground ml-1">• {job.postOffice}</span>
                            )}
                          </div>


                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <Users className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold">Student Gender: {job.studentGender}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold">Preferred: {job.preferredTeacherGender} teacher</span>
                          </div>
                        </div>
                        {job.extraInformation && (
                          <div className="mt-2">
                            <p className="text-xs sm:text-sm font-medium">Additional Information:</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{job.extraInformation}</p>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <div className="text-xs text-muted-foreground">
                            Posted: {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            {(job.salaryRangeMin > 1000000 || job.salaryRangeMax > 1000000) && (
                              <Badge variant="destructive" className="text-xs">
                                High Salary
                              </Badge>
                            )}
                            <Badge variant={job.status === "active" ? "default" : "secondary"} className="text-xs">
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                          onClick={() => router.push(`/tuition-jobs/${job.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        

      </div>
    </div>
  );
}