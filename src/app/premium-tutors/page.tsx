'use client';

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, GraduationCap, Clock, Search, LayoutGrid, List, Filter, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext.next";
import tutorService, { Tutor } from "@/services/tutorService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { BANGLADESH_DISTRICTS, BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from "@/data/bangladeshDistricts";
import { useSearchParams } from "next/navigation";

export default function PremiumTutors() {
  const { user, profile } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedPostOffice, setSelectedPostOffice] = useState<string>("all");
  const [minExperience, setMinExperience] = useState<number>(0);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedEducation, setSelectedEducation] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availablePostOffices, setAvailablePostOffices] = useState<Array<{name: string, postcode: string}>>([]);

  const searchParams = useSearchParams();

  // Handle URL parameters for pre-filtering
  useEffect(() => {
    const districtParam = searchParams.get('district');
    if (districtParam) {
      // First try to find by ID (new format)
      const districtById = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => 
        d.id === districtParam
      );
      if (districtById) {
        setSelectedDistrict(districtById.id);
      } else {
        // Fallback: try to find by name (old format)
        const districtByName = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => 
          d.name.toLowerCase() === districtParam.toLowerCase()
        );
        if (districtByName) {
          setSelectedDistrict(districtByName.id);
        }
      }
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
      setSelectedPostOffice('all');
    }
  }, [selectedDistrict, selectedArea]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const fetchTutors = useCallback(async () => {
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
      
      if (ratingFilter > 0) {
        params.minRating = ratingFilter;
      }
      
      // Add new filter parameters
      if (minExperience > 0) {
        params.minExperience = minExperience;
      }
      
      if (selectedGender !== 'all') {
        params.gender = selectedGender;
      }
      
      if (selectedEducation !== 'all') {
        params.education = selectedEducation;
      }
      
      if (selectedAvailability !== 'all') {
        params.availability = selectedAvailability;
      }
      
      if (maxPrice) {
        params.maxPrice = maxPrice;
      }
      
      // Add sorting parameters
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }
      
      console.log('Fetching tutors with params:', params);
      const response = await tutorService.getAllTutors(params);
      
      if (response.success) {
        console.log(`Received ${response.data.length} tutors from API`);
        setTutors(response.data);
      } else {
        console.error('API returned error:', response);
        setError('Failed to fetch tutors');
        setTutors([]);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setError('Failed to fetch tutors. Please try again later.');
      setTutors([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, selectedDistrict, selectedArea, selectedPostOffice, ratingFilter, minExperience, selectedGender, selectedEducation, selectedAvailability, maxPrice, sortBy, sortOrder]);

  useEffect(() => {
    fetchTutors();
  }, [selectedSubject, selectedDistrict, selectedArea, selectedPostOffice, ratingFilter, minExperience, selectedGender, selectedEducation, selectedAvailability, maxPrice, sortBy, sortOrder, fetchTutors]);

  // No fallback demo tutors - we'll rely on the API

  // Filter tutors based on search query (other filters are applied in API call)
  const filteredTutors = tutors?.filter(tutor => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tutor.full_name?.toLowerCase().includes(query) ||
      (typeof tutor.subjects === 'string' ? 
        tutor.subjects.toLowerCase().includes(query) :
        Array.isArray(tutor.subjects) && (tutor.subjects as string[]).some(subject => subject.toLowerCase().includes(query)))
    );
  }) || [];

  // Generate star rating display
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden w-full">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Premium Tutors</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Connect with our highly qualified and experienced tutors</p>
          </div>

          {/* Search and Filters */}
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
                    <Label htmlFor="subject" className="text-sm">Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger id="subject" className="h-10 sm:h-11">
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">All Subjects</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Programming">Programming</SelectItem>
                          <SelectItem value="Bangla">Bangla</SelectItem>
                          <SelectItem value="Economics">Economics</SelectItem>
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
                    <Select 
                      value={selectedArea} 
                      onValueChange={setSelectedArea}
                      disabled={selectedDistrict === 'all'}
                    >
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
                    <Select 
                      value={selectedPostOffice} 
                      onValueChange={setSelectedPostOffice}
                      disabled={selectedArea === 'all'}
                    >
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
                    <Label htmlFor="rating" className="text-sm">Minimum Rating</Label>
                    <Select value={ratingFilter.toString()} onValueChange={(value) => setRatingFilter(Number(value))}>
                      <SelectTrigger id="rating" className="h-10 sm:h-11">
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minExperience" className="text-sm">Minimum Experience (Years)</Label>
                    <Select value={minExperience.toString()} onValueChange={(value) => setMinExperience(Number(value))}>
                      <SelectTrigger id="minExperience" className="h-10 sm:h-11">
                        <SelectValue placeholder="Any Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Experience</SelectItem>
                        <SelectItem value="1">1+ Years</SelectItem>
                        <SelectItem value="2">2+ Years</SelectItem>
                        <SelectItem value="3">3+ Years</SelectItem>
                        <SelectItem value="5">5+ Years</SelectItem>
                        <SelectItem value="10">10+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm">Gender</Label>
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                      <SelectTrigger id="gender" className="h-10 sm:h-11">
                        <SelectValue placeholder="Any Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Gender</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education" className="text-sm">Education</Label>
                    <Select value={selectedEducation} onValueChange={setSelectedEducation}>
                      <SelectTrigger id="education" className="h-10 sm:h-11">
                        <SelectValue placeholder="Any Education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Education</SelectItem>
                        <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="Master">Master's Degree</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability" className="text-sm">Availability</Label>
                    <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                      <SelectTrigger id="availability" className="h-10 sm:h-11">
                        <SelectValue placeholder="Any Availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Availability</SelectItem>
                        <SelectItem value="Weekdays">Weekdays</SelectItem>
                        <SelectItem value="Weekends">Weekends</SelectItem>
                        <SelectItem value="Evenings">Evenings</SelectItem>
                        <SelectItem value="Mornings">Mornings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPrice" className="text-sm">Maximum Price (৳/hour)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="Any Price"
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                      min="0"
                      className="h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortBy" className="text-sm">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sortBy" className="h-10 sm:h-11">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="hourly_rate">Price</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="total_reviews">Number of Reviews</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortOrder" className="text-sm">Sort Order</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger id="sortOrder" className="h-10 sm:h-11">
                        <SelectValue placeholder="Sort Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full h-10 sm:h-11" 
                    variant="outline"
                    onClick={() => {
                      setSelectedSubject("all");
                      setSelectedDistrict("all");
                      setSelectedArea("all");
                      setSelectedPostOffice("all");
                      setRatingFilter(0);
                      setMinExperience(0);
                      setSelectedGender("all");
                      setSelectedEducation("all");
                      setSelectedAvailability("all");
                      setMaxPrice(null);
                      setSortBy("rating");
                      setSortOrder("desc");
                      setSearchQuery("");
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Right Side */}
            <div className="flex-1 space-y-4 sm:space-y-6 order-2 lg:order-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tutors by name or subject..."
                  className="pl-10 h-11"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* View Toggle and Results Count */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? (
                      <span className="flex items-center"><RefreshCw className="h-3 w-3 mr-2 animate-spin" /> Loading tutors...</span>
                    ) : (
                      <>Showing <span className="font-medium">{filteredTutors.length}</span> tutors</>
                    )}
                  </p>
                  
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchTutors}
                    className="h-8 w-8"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
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

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="pb-2 p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
                          <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-32 sm:w-40" />
                            <div className="flex flex-wrap gap-1">
                              <Skeleton className="h-3 w-12 sm:w-16" />
                              <Skeleton className="h-3 w-16 sm:w-20" />
                            </div>
                            <Skeleton className="h-3 w-24 sm:w-32" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                        <div className="flex items-center justify-between pt-2">
                          <Skeleton className="h-5 w-20 sm:w-24" />
                          <Skeleton className="h-8 w-24 sm:w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Error State */}
              {!isLoading && error && (
                <div className="text-center p-6 sm:p-8">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={fetchTutors}>Try Again</Button>
                </div>
              )}
              
              {/* No Results */}
              {!isLoading && !error && filteredTutors.length === 0 && (
                <div className="text-center p-6 sm:p-8">
                  <p className="mb-4">No tutors found matching your criteria.</p>
                  <Button onClick={() => {
                    setSelectedSubject("all");
                    setSelectedDistrict("all");
                    setSelectedArea("all");
                    setSelectedPostOffice("all");
                    setRatingFilter(0);
                    setSearchQuery("");
                  }}>Reset Filters</Button>
                </div>
              )}
              
              {/* Tutor Listings */}
              {!isLoading && !error && filteredTutors.length > 0 && (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" : "space-y-4"}>
                  {filteredTutors.map((tutor) => {
                    // Process tutor data from API
                    const tutorSubjects = typeof tutor.subjects === 'string' 
                      ? tutor.subjects.split(',').map(s => s.trim()) 
                      : [];
                    
                    // Debug log for verified status
                    console.log(`Tutor ${tutor.full_name} verified status:`, tutor.verified, typeof tutor.verified);
                    
                    return (
                      <Card key={tutor.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-2 p-4 sm:p-6">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary">
                              <AvatarImage src={tutor.avatar_url || "/placeholder.svg"} alt={tutor.full_name} />
                              <AvatarFallback className="text-sm sm:text-base">{tutor.full_name?.charAt(0) || 'T'}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                <CardTitle className="text-base sm:text-xl">{tutor.full_name}</CardTitle>
                                {tutor.verified === 1 || tutor.verified === '1' ? (
                                  <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">Verified</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">Unverified</Badge>
                                )}
                                {tutor.premium && (
                                  <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">Premium</Badge>
                                )}
                              </div>
                              {tutor.tutor_id && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">ID:</span> {tutor.tutor_id}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {tutorSubjects.map((subject, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center">
                                {renderStars(tutor.rating || 0)}
                                <span className="ml-1 text-xs text-muted-foreground">({tutor.total_reviews || 0} reviews)</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                                                          <div className="space-y-2">
                              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                <GraduationCap className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="font-bold">{tutor.education || 'Education not specified'}</span>
                              </div>
                              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                <MapPin className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="font-bold">{tutor.location || 'Location not specified'}</span>
                              </div>
                              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="font-bold">{tutor.experience || 'Experience not specified'}</span>
                              </div>
                            </div>
                          
                                                          <div className="flex items-center justify-center pt-4">
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white w-full text-sm"
                                onClick={() => window.location.href = `/tutor/${tutor.id}`}
                              >
                                See Profile
                              </Button>
                            </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
