'use client';

import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, MouseEvent, TouchEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeProvider";
import { heroDataService, Division, TutorDistrict } from "@/services/heroDataService";
import { BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from "@/data/bangladeshDistricts";

export const HeroSection = () => {
  console.log('HeroSection component rendered');
  const router = useRouter();
  const { theme } = useTheme();
  const [currentDivision, setCurrentDivision] = useState(0);
  const [currentTutor, setCurrentTutor] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTutorPaused, setIsTutorPaused] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [tutorDistricts, setTutorDistricts] = useState<TutorDistrict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const slidesPerView = { 
    mobile: 4,  // 4 slides for mobile
    tablet: 5,  // 5 slides for tablet
    laptop: 6,  // 6 slides for laptop
    desktop: 8  // 8 slides for desktop
  };
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // For drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragThreshold, setDragThreshold] = useState(60); // Minimum drag distance to trigger slide change
  
  // For responsive design
  const [currentSlidesPerView, setCurrentSlidesPerView] = useState(slidesPerView.mobile);
  
  // Fetch hero data on component mount and refresh every 30 seconds for real-time updates
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setIsLoading(true);
        const data = await heroDataService.getHeroData();
        setDivisions(data.divisions);
        setTutorDistricts(data.tutorDistricts);
      } catch (error) {
        console.error('Error fetching hero data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchHeroData();

    // Set up interval for real-time updates (every 30 seconds)
    const interval = setInterval(fetchHeroData, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Update slides per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) { // Mobile
        setCurrentSlidesPerView(slidesPerView.mobile);
      } else if (width < 768) { // Small tablet
        setCurrentSlidesPerView(slidesPerView.tablet);
      } else if (width < 1024) { // Large tablet/small laptop
        setCurrentSlidesPerView(slidesPerView.laptop);
      } else { // Desktop
        setCurrentSlidesPerView(slidesPerView.desktop);
      }
    };
    
    // Initial call
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [])
  
  // Function to get slide width based on slidesPerView
  const getSlideWidth = (slidesPerView: number) => {
    switch (slidesPerView) {
      case 1: return 'w-full';
      case 2: return 'w-1/2';
      case 3: return 'w-1/3';
      case 4: return 'w-1/4';
      case 5: return 'w-1/5';
      case 6: return 'w-1/6';
      case 7: return 'w-1/7';
      case 8: return 'w-1/8';
      case 9: return 'w-1/9';
      case 10: return 'w-1/10';
      case 11: return 'w-1/11';
      case 12: return 'w-1/12';
      default: return 'w-full';
    }
  };
  
  // Add xs breakpoint for Tailwind CSS
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      @media (min-width: 475px) {
        .xs\\:flex-row { flex-direction: row; }
        .xs\\:space-y-4 { margin-top: 1rem; margin-bottom: 1rem; }
        .xs\\:mt-4 { margin-top: 1rem; }
        .xs\\:py-3\\.5 { padding-top: 0.875rem; padding-bottom: 0.875rem; }
        .xs\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        .xs\\:text-base { font-size: 1rem; line-height: 1.5rem; }
        .xs\\:gap-2 { gap: 0.5rem; }
        .xs\\:gap-2\\.5 { gap: 0.625rem; }
        .xs\\:h-4\\.5 { height: 1.125rem; }
        .xs\\:w-4\\.5 { width: 1.125rem; }
        .xs\\:w-2\\.5 { width: 0.625rem; }
        .xs\\:h-2\\.5 { height: 0.625rem; }
        .xs\\:w-1\\.75 { width: 0.4375rem; }
        .xs\\:h-1\\.75 { height: 0.4375rem; }
        .xs\\:py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
        .xs\\:px-4 { padding-left: 1rem; padding-right: 1rem; }
        .xs\\:top-10 { top: 2.5rem; }
        .xs\\:left-5 { left: 1.25rem; }
        .xs\\:w-32 { width: 8rem; }
        .xs\\:h-32 { height: 8rem; }
        .xs\\:blur-3xl { --tw-blur: blur(64px); }
        .xs\\:bottom-10 { bottom: 2.5rem; }
        .xs\\:right-5 { right: 1.25rem; }
        .xs\\:w-48 { width: 12rem; }
        .xs\\:h-48 { height: 12rem; }
        .xs\\:w-40 { width: 10rem; }
        .xs\\:h-40 { height: 10rem; }
        .xs\\:block { display: block; }
        .xs\\:h-\\[45px\\] { height: 45px; }
        .xs\\:p-1 { padding: 0.25rem; }
        .xs\\:text-xs { font-size: 0.75rem; line-height: 1rem; }
        .xs\\:text-\\[10px\\] { font-size: 10px; }
        .xs\\:gap-1 { gap: 0.25rem; }
        .w-1\\/7 { width: 14.285714%; }
        .w-1\\/8 { width: 12.5%; }
        .w-1\\/9 { width: 11.111111%; }
        .w-1\\/10 { width: 10%; }
        .w-1\\/11 { width: 9.090909%; }
        .w-1\\/12 { width: 8.333333%; }
      }
    `;
    document.head.appendChild(style);
  }
  

  
  const totalSlides = divisions.length;
  const maxSlideIndex = Math.max(0, totalSlides - currentSlidesPerView);



  const totalTutorSlides = tutorDistricts.length;
  const maxTutorSlideIndex = Math.max(0, totalTutorSlides - currentSlidesPerView);

  useEffect(() => {
    if (!isPaused && !isDragging) {
      slideInterval.current = setInterval(() => {
        setCurrentDivision(prev => 
          prev >= maxSlideIndex ? 0 : prev + 1
        );
      }, 3000); // Slide every 3 seconds
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, maxSlideIndex, isDragging, currentSlidesPerView]);

  // Tutor slider effect
  useEffect(() => {
    if (!isTutorPaused) {
      const tutorSlideInterval = setInterval(() => {
        setCurrentTutor(prev => 
          prev >= maxTutorSlideIndex ? 0 : prev + 1
        );
      }, 4000); // Slide every 4 seconds

      return () => clearInterval(tutorSlideInterval);
    }
  }, [isTutorPaused, maxTutorSlideIndex, currentSlidesPerView]);
  
  const nextSlide = () => {
    setCurrentDivision(prev => 
      prev >= maxSlideIndex ? 0 : prev + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentDivision(prev => 
      prev <= 0 ? maxSlideIndex : prev - 1
    );
  };

  const nextTutorSlide = () => {
    setCurrentTutor(prev => 
      prev >= maxTutorSlideIndex ? 0 : prev + 1
    );
  };
  
  const prevTutorSlide = () => {
    setCurrentTutor(prev => 
      prev <= 0 ? maxTutorSlideIndex : prev - 1
    );
  };
  
  // Mouse drag handlers
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsPaused(true);
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(currentDivision);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const dragDistance = x - startX;
    
    // Calculate slide movement based on drag distance
    if (Math.abs(dragDistance) > dragThreshold) {
      if (dragDistance > 0) {
        // Dragging right (show previous slide)
        setCurrentDivision(prev => Math.max(0, prev - 1));
      } else {
        // Dragging left (show next slide)
        setCurrentDivision(prev => Math.min(maxSlideIndex, prev + 1));
      }
      // Reset drag state to prevent multiple slides at once
      setStartX(x);
      setScrollLeft(currentDivision);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setIsPaused(false);
    }
  };
  
  // Touch handlers for mobile
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsPaused(true);
    setIsDragging(true);
    setStartX(e.touches[0].clientX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(currentDivision);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX - (sliderRef.current?.offsetLeft || 0);
    const dragDistance = x - startX;
    
    // Calculate slide movement based on drag distance
    if (Math.abs(dragDistance) > dragThreshold) {
      if (dragDistance > 0) {
        // Dragging right (show previous slide)
        setCurrentDivision(prev => Math.max(0, prev - 1));
      } else {
        // Dragging left (show next slide)
        setCurrentDivision(prev => Math.min(maxSlideIndex, prev + 1));
      }
      // Reset drag state to prevent multiple slides at once
      setStartX(x);
      setScrollLeft(currentDivision);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleFindTutors = () => {
    try {
      if (router && typeof router.push === 'function') {
        router.push('/premium-tutors');
      } else {
        // Fallback in case router is not available
        window.location.href = '/premium-tutors';
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback in case of navigation error
      window.location.href = '/premium-tutors';
    }
  };



  const handleDivisionClick = (divisionName: string) => {
    router.push(`/tuition-jobs?district=${encodeURIComponent(divisionName)}`);
  };

  const handleTutorDistrictClick = (districtName: string) => {
    // Find the district ID by name from the districts data
    const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => 
      d.name.toLowerCase() === districtName.toLowerCase()
    );
    
    if (district) {
      router.push(`/premium-tutors?district=${encodeURIComponent(district.id)}`);
    } else {
      // Fallback to using the name if ID not found
      router.push(`/premium-tutors?district=${encodeURIComponent(districtName)}`);
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Main Hero Section */}
      <section className={cn(
        "py-8 xs:py-10 sm:py-16 md:py-20 px-3 xs:px-4 relative overflow-hidden",
        theme === "dark" 
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" 
          : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
      )}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className={cn(
            "absolute top-8 xs:top-10 sm:top-20 left-3 xs:left-5 sm:left-20 w-24 xs:w-32 sm:w-64 h-24 xs:h-32 sm:h-64 rounded-full blur-2xl xs:blur-3xl animate-pulse",
            theme === "dark" ? "bg-green-600" : "bg-green-300"
          )}></div>
          <div className={cn(
            "absolute bottom-8 xs:bottom-10 sm:bottom-20 right-3 xs:right-5 sm:right-20 w-36 xs:w-48 sm:w-96 h-36 xs:h-48 sm:h-96 rounded-full blur-2xl xs:blur-3xl animate-pulse delay-1000",
            theme === "dark" ? "bg-emerald-600" : "bg-emerald-300"
          )}></div>
          <div className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 xs:w-40 sm:w-80 h-32 xs:h-40 sm:h-80 rounded-full blur-2xl xs:blur-3xl animate-pulse delay-500",
            theme === "dark" ? "bg-teal-600" : "bg-teal-300"
          )}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className={theme === "dark" ? "text-emerald-400" : "text-emerald-600"}>
                  Hire your Genius Tutor Today

                  </span>

                </h1>
                
                <div className={cn("flex items-center gap-1 sm:gap-2", theme === "dark" ? "text-gray-300" : "text-gray-700")}>
                  <MapPin className={theme === "dark" ? "h-4 w-4 sm:h-5 sm:w-5 text-green-400 animate-bounce" : "h-4 w-4 sm:h-5 sm:w-5 text-green-500 animate-bounce"} />
                  <span className="text-base sm:text-lg">Book A <span className={theme === "dark" ? "text-green-400 font-semibold" : "text-green-600 font-semibold"}>Verified Tutor</span> in Your Area</span>
                </div>
              </div>

              {/* Enhanced CTA Button */}
              <div className="relative inline-block group/button">
                <button 
                  className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-full text-lg font-bold z-10 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden group/button-inner"
                  onClick={handleFindTutors}
                >
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 border-2 border-green-400 rounded-full animate-pulse group-hover:border-emerald-300"></div>
                  </div>
                  
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-0 group-hover/button-inner:opacity-30 transition-opacity duration-500 rounded-full blur-sm"></div>
                  
                  {/* Button content */}
                  <div className="relative flex items-center gap-2 z-10">
                    <span className="tracking-wide group-hover/button-inner:tracking-wider transition-all duration-300">FIND A TUTOR (IT’S FREE!)
                    </span>
                    <ArrowRight className="h-5 w-5 group-hover/button-inner:translate-x-1 transition-transform duration-300" />
                  </div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover/button-inner:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                  
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-300 rounded-tl-full group-hover/button-inner:border-emerald-200 transition-colors duration-300"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-300 rounded-tr-full group-hover/button-inner:border-emerald-200 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green-300 rounded-bl-full group-hover/button-inner:border-emerald-200 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-300 rounded-br-full group-hover/button-inner:border-emerald-200 transition-colors duration-300"></div>
                </button>
                
                {/* Floating particles around button */}
                <div className="absolute -top-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75 delay-500"></div>
                <div className="absolute -top-1 -right-3 w-2 h-2 bg-teal-400 rounded-full animate-bounce opacity-60 delay-300"></div>
                <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce opacity-60 delay-700"></div>
              </div>
              
              {/* Divisional Tutors Section */}
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 flex flex-col sm:flex-row sm:items-center">
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">Available Jobs</span>
                    <span className="sm:ml-2 text-xs sm:text-sm text-gray-500">
                      {isLoading ? 'Loading...' : `(${divisions.reduce((acc, div) => acc + div.count, 0).toLocaleString()} jobs)`}
                      {!isLoading && <span className="ml-1 text-green-500 animate-pulse">●</span>}
                    </span>
                  </h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={prevSlide}
                      className="p-1 sm:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors shadow-sm"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-green-700" />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="p-1 sm:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors shadow-sm"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-700" />
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <div 
                    ref={sliderRef}
                    className={cn(
                      "overflow-hidden rounded-lg sm:rounded-xl bg-transparent backdrop-blur-sm cursor-grab",
                      isDragging && "cursor-grabbing"
                    )}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => handleMouseLeave()}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div 
                      className="flex transition-transform duration-500 ease-in-out gap-1 xs:gap-1.5 sm:gap-2"
                      style={{ transform: `translateX(-${currentDivision * (100 / currentSlidesPerView)}%)` }}
                    >
                      {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 4 }).map((_, index) => (
                          <div 
                            key={`loading-division-${index}`}
                            className={`flex-none px-0.5 xs:px-0.5 sm:px-1 ${
                              currentSlidesPerView === 1 ? 'w-full' : 
                              currentSlidesPerView === 2 ? 'w-1/2' : 
                              currentSlidesPerView === 3 ? 'w-1/3' : 
                              currentSlidesPerView === 4 ? 'w-1/4' :
                              currentSlidesPerView === 5 ? 'w-1/5' : 
                              currentSlidesPerView === 6 ? 'w-1/6' :
                              currentSlidesPerView === 7 ? 'w-1/7' : 
                              currentSlidesPerView === 8 ? 'w-1/8' :
                              currentSlidesPerView === 9 ? 'w-1/9' :
                              currentSlidesPerView === 10 ? 'w-1/10' :
                              currentSlidesPerView === 11 ? 'w-1/11' : 'w-1/12'
                            }`}
                          >
                            <div className="bg-gray-200 animate-pulse p-1 xs:p-1.5 sm:p-2.5 rounded-md sm:rounded-lg h-[28px] xs:h-[32px] sm:h-[38px]"></div>
                          </div>
                        ))
                      ) : (
                        divisions.map((division, index) => (
                        <div 
                          key={division.name} 
                          className={`flex-none px-0.5 xs:px-0.5 sm:px-1 ${
                            currentSlidesPerView === 1 ? 'w-full' : 
                            currentSlidesPerView === 2 ? 'w-1/2' : 
                            currentSlidesPerView === 3 ? 'w-1/3' : 
                            currentSlidesPerView === 4 ? 'w-1/4' :
                            currentSlidesPerView === 5 ? 'w-1/5' : 
                            currentSlidesPerView === 6 ? 'w-1/6' :
                            currentSlidesPerView === 7 ? 'w-1/7' : 
                            currentSlidesPerView === 8 ? 'w-1/8' :
                            currentSlidesPerView === 9 ? 'w-1/9' :
                            currentSlidesPerView === 10 ? 'w-1/10' :
                            currentSlidesPerView === 11 ? 'w-1/11' : 'w-1/12'
                          }`}
                        >
                          <div 
                            className={cn(
                              "bg-gradient-to-br", 
                              theme === "dark" ? "from-gray-700 to-gray-800" : division.color,
                              "p-1 xs:p-1.5 sm:p-2.5 rounded-md sm:rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
                              theme === "dark" 
                                ? "h-[28px] xs:h-[32px] sm:h-[38px] flex items-center justify-center border border-gray-600 transform hover:scale-105 hover:border-green-600 group" 
                                : "h-[28px] xs:h-[32px] sm:h-[38px] flex items-center justify-center border border-green-100 transform hover:scale-105 hover:border-green-300 group"
                            )}
                            onClick={() => handleDivisionClick(division.name)}
                          >
                            <div className="text-center group-hover:-translate-y-0.5 sm:group-hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center">
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <h4 className={theme === "dark" ? "text-[9px] xs:text-[10px] sm:text-xs font-semibold text-green-400" : "text-[9px] xs:text-[10px] sm:text-xs font-semibold text-black"}>
                                  {division.name} - {division.count.toLocaleString()}
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Slide indicators */}
                <div className="hidden sm:flex justify-center mt-3 space-x-1">
                  {Array.from({ length: maxSlideIndex + 1 }).map((_, index) => (
                    <button
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${currentDivision === index 
                        ? theme === "dark" ? 'w-4 bg-green-400' : 'w-4 bg-green-500' 
                        : theme === "dark" ? 'w-1.5 bg-green-700' : 'w-1.5 bg-green-200'}`}
                      onClick={() => setCurrentDivision(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Tutors Available Section */}
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 flex flex-col sm:flex-row sm:items-center">
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">Available Tutors</span>
                    <span className="sm:ml-2 text-xs sm:text-sm text-gray-500">
                      {isLoading ? 'Loading...' : `(${tutorDistricts.length} districts)`}
                      {!isLoading && <span className="ml-1 text-green-500 animate-pulse">●</span>}
                    </span>
                  </h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={prevTutorSlide}
                      className="p-1 sm:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors shadow-sm"
                      aria-label="Previous district slide"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-green-700" />
                    </button>
                    <button 
                      onClick={nextTutorSlide}
                      className="p-1 sm:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors shadow-sm"
                      aria-label="Next district slide"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-700" />
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <div 
                    className={cn(
                      "overflow-hidden rounded-lg sm:rounded-xl bg-transparent backdrop-blur-sm cursor-grab"
                    )}
                    onMouseEnter={() => setIsTutorPaused(true)}
                    onMouseLeave={() => setIsTutorPaused(false)}
                  >
                    <div 
                      className="flex transition-transform duration-500 ease-in-out gap-1 xs:gap-1.5 sm:gap-2"
                      style={{ transform: `translateX(-${currentTutor * (100 / currentSlidesPerView)}%)` }}
                    >
                      {isLoading ? (
                        // Loading skeleton for districts
                        Array.from({ length: 4 }).map((_, index) => (
                          <div 
                            key={`loading-district-${index}`}
                            className={`flex-none px-0.5 xs:px-0.5 sm:px-1 ${
                              currentSlidesPerView === 1 ? 'w-full' : 
                              currentSlidesPerView === 2 ? 'w-1/2' : 
                              currentSlidesPerView === 3 ? 'w-1/3' : 
                              currentSlidesPerView === 4 ? 'w-1/4' :
                              currentSlidesPerView === 5 ? 'w-1/5' : 
                              currentSlidesPerView === 6 ? 'w-1/6' :
                              currentSlidesPerView === 7 ? 'w-1/7' : 
                              currentSlidesPerView === 8 ? 'w-1/8' :
                              currentSlidesPerView === 9 ? 'w-1/9' :
                              currentSlidesPerView === 10 ? 'w-1/10' :
                              currentSlidesPerView === 11 ? 'w-1/11' : 'w-1/12'
                            }`}
                          >
                            <div className="bg-gray-200 animate-pulse p-1 xs:p-1.5 sm:p-2.5 rounded-md sm:rounded-lg h-[28px] xs:h-[32px] sm:h-[38px]"></div>
                          </div>
                        ))
                      ) : (
                        tutorDistricts.map((district, index) => (
                        <div 
                          key={district.id || index} 
                          className={`flex-none px-0.5 xs:px-0.5 sm:px-1 ${
                            currentSlidesPerView === 1 ? 'w-full' : 
                            currentSlidesPerView === 2 ? 'w-1/2' : 
                            currentSlidesPerView === 3 ? 'w-1/3' : 
                            currentSlidesPerView === 4 ? 'w-1/4' :
                            currentSlidesPerView === 5 ? 'w-1/5' : 
                            currentSlidesPerView === 6 ? 'w-1/6' :
                            currentSlidesPerView === 7 ? 'w-1/7' : 
                            currentSlidesPerView === 8 ? 'w-1/8' :
                            currentSlidesPerView === 9 ? 'w-1/9' :
                            currentSlidesPerView === 10 ? 'w-1/10' :
                            currentSlidesPerView === 11 ? 'w-1/11' : 'w-1/12'
                          }`}
                        >
                          <div 
                            className={cn(
                              "bg-gradient-to-br from-green-50 to-emerald-50",
                              "p-1 xs:p-1.5 sm:p-2.5 rounded-md sm:rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
                              theme === "dark" 
                                ? "h-[28px] xs:h-[32px] sm:h-[38px] flex items-center justify-center border border-gray-600 transform hover:scale-105 hover:border-green-600 group" 
                                : "h-[28px] xs:h-[32px] sm:h-[38px] flex items-center justify-center border border-green-100 transform hover:scale-105 hover:border-green-300 group"
                            )}
                            onClick={() => handleTutorDistrictClick(district.name)}
                          >
                            <div className="text-center group-hover:-translate-y-0.5 sm:group-hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center">
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                                                <h4 className={theme === "dark" ? "text-[9px] xs:text-[10px] sm:text-xs font-semibold text-green-400" : "text-[9px] xs:text-[10px] sm:text-xs font-semibold text-green-800"}>
                                  {district.name} - {district.count}
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Tutor Slide indicators */}
                <div className="hidden sm:flex justify-center mt-3 space-x-1">
                  {Array.from({ length: maxTutorSlideIndex + 1 }).map((_, index) => (
                    <button
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${currentTutor === index 
                        ? theme === "dark" ? 'w-4 bg-green-400' : 'w-4 bg-green-500' 
                        : theme === "dark" ? 'w-1.5 bg-green-700' : 'w-1.5 bg-green-200'}`}
                      onClick={() => setCurrentTutor(index)}
                      aria-label={`Go to district slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative">
              <div className="relative">
                <div className="relative z-10">
                  {/* Teacher and Student Illustration */}
                  <div className="bg-transparent">
                    <div className="flex items-center justify-center h-64 relative">
                        <Image                         
                          src="https://tutorsheba.com/_next/static/media/Teacher-rafiki.81362516.svg"                         
                          alt="Teacher Illustration"                         
                          width={480}
                          height={300}
                          className="h-120 object-contain transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2 filter hover:drop-shadow-xl"                       
                        />
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    </div>
                  </div>
                </div>
              </div>

              
              {/* Enhanced Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-60 animate-pulse shadow-lg"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-teal-200 to-green-200 rounded-full opacity-40 animate-bounce shadow-lg"></div>
              <div className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-50 animate-ping"></div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};
