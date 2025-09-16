"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Search, Star } from "lucide-react";
import { FilterGender } from "@/types/student";
import { ALL_DISTRICTS } from "@/data/bangladeshDistricts";

interface StudentSearchProps {
  searchQuery: string;
  filterSubject: string;
  filterArea: string;
  filterGender: FilterGender;
  filterRating: number;
  viewMode: string;
  setSearchQuery: (query: string) => void;
  setFilterSubject: (subject: string) => void;
  setFilterArea: (area: string) => void;
  setFilterGender: (gender: FilterGender) => void;
  setFilterRating: (rating: number) => void;
  setViewMode: (mode: string) => void;
  filteredTutors: any[];
  inviteDemo: (tutor: any) => void;
}

export function StudentSearch({
  searchQuery,
  filterSubject,
  filterArea,
  filterGender,
  filterRating,
  viewMode,
  setSearchQuery,
  setFilterSubject,
  setFilterArea,
  setFilterGender,
  setFilterRating,
  setViewMode,
  filteredTutors,
  inviteDemo
}: StudentSearchProps) {
  return (
    <div className="space-y-6 w-full">
      <Card className="border-green-100/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-green-600" /> Find Tutors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2 xl:col-span-3">
              <Label>Search</Label>
              <Input 
                className="mt-1" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search tutors by name or subject..." 
              />
            </div>

            {/* Subject Filter */}
            <div>
              <Label>Subject</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Subjects</SelectItem>
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

            {/* District Filter */}
            <div>
              <Label>District</Label>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {ALL_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Filter */}
            <div>
              <Label>Gender</Label>
              <Select value={filterGender} onValueChange={(v) => setFilterGender(v as FilterGender)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Gender</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div>
              <Label>Minimum Rating</Label>
              <Select value={String(filterRating)} onValueChange={(v) => setFilterRating(Number(v))}>
                <SelectTrigger className="mt-1">
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

            {/* Experience Filter */}
            <div>
              <Label>Minimum Experience (Years)</Label>
              <Select value="0" onValueChange={() => {}}>
                <SelectTrigger className="mt-1">
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

            {/* Education Filter */}
            <div>
              <Label>Education</Label>
              <Select value="all" onValueChange={() => {}}>
                <SelectTrigger className="mt-1">
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

            {/* Availability Filter */}
            <div>
              <Label>Availability</Label>
              <Select value="all" onValueChange={() => {}}>
                <SelectTrigger className="mt-1">
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

            {/* Maximum Price Filter */}
            <div>
              <Label>Maximum Price (৳/hour)</Label>
              <Input
                type="number"
                placeholder="Any Price"
                min="0"
                className="mt-1"
              />
            </div>

            {/* Sort By */}
            <div>
              <Label>Sort By</Label>
              <Select value="rating" onValueChange={() => {}}>
                <SelectTrigger className="mt-1">
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

            {/* Sort Order */}
            <div>
              <Label>Sort Order</Label>
              <Select value="desc" onValueChange={() => {}}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="lg:col-span-2 xl:col-span-3 flex items-end gap-2">
              <Toggle pressed={viewMode === "grid"} onPressedChange={(v) => setViewMode(v ? "grid" : "list")}>
                Grid
              </Toggle>
              <Toggle pressed={viewMode === "list"} onPressedChange={(v) => setViewMode(v ? "list" : "grid")}>
                List
              </Toggle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchQuery("");
                  setFilterSubject("any");
                  setFilterArea("all");
                  setFilterGender("any");
                  setFilterRating(0);
                  setViewMode("grid");
                }}
                className="ml-auto"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
        {filteredTutors.map((t) => (
          <div key={t.id} className="border rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-lg">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.subject} · {t.area}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3 text-amber-500" /> {t.rating}</Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                className="bg-green-600 hover:bg-green-700 flex-1" 
                onClick={() => window.open(`/tutor/${t.id}`, '_blank')}
              >
                See Profile
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
