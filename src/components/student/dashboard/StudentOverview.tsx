"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListFilter, Users, CheckCircle2, CreditCard, Star, User } from "lucide-react";
import { useMemo } from "react";

interface StudentOverviewProps {
  profile: any;
  requestsPostedCount: number;
  tutorRequestedCount: number;
  tutorAssignedCount: number;
  paymentsProcessedCount: number;
  postedRequests: any[];
  filteredTutors: any[];
  setActiveTab: (tab: string) => void;
  inviteDemo: (tutor: any) => void;
}

export function StudentOverview({
  profile,
  requestsPostedCount,
  tutorRequestedCount,
  tutorAssignedCount,
  paymentsProcessedCount,
  postedRequests,
  filteredTutors,
  setActiveTab,
  inviteDemo
}: StudentOverviewProps) {
  const overviewStats = useMemo(
    () => [
      { label: "Requests", value: requestsPostedCount, icon: ListFilter },
      { label: "Demo Invites", value: tutorRequestedCount, icon: Users },
      { label: "Assigned", value: tutorAssignedCount, icon: CheckCircle2 },
      { label: "Paid", value: paymentsProcessedCount, icon: CreditCard },
    ],
    [requestsPostedCount, tutorRequestedCount, tutorAssignedCount, paymentsProcessedCount]
  );

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {profile.name.split(" ")[0]} 👋</h2>
            <p className="text-white/90 mt-1 text-sm sm:text-base">Here is a quick snapshot of your learning journey.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="bg-white text-green-700 hover:bg-green-50 text-sm sm:text-base" onClick={() => setActiveTab("request")}>Post a Request</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {overviewStats.map((s) => (
          <Card key={s.label} className="border-green-100/60 hover:shadow-md transition-all">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Tuition Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {postedRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base">{request.title}</div>
                                          <div className="text-xs sm:text-sm text-muted-foreground">
                        {request.subject} • {request.location}
                      </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={request.status === 'Active' ? "bg-green-600" : request.status === 'Completed' ? "bg-blue-600" : "bg-gray-600"}>
                      {request.status}
                    </Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {request.matchedTutors ? request.matchedTutors.length : 0} matches
                    </span>
                  </div>
                </div>
              ))}
              {postedRequests.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No tuition requests yet</p>
                  <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700" onClick={() => setActiveTab("request")}>
                    Create Request
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Top Rated Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTutors.slice(0, 5).map((tutor) => (
                <div key={tutor.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm sm:text-base">{tutor.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{tutor.subject} • {tutor.area}</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs text-muted-foreground">{tutor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-1 text-xs sm:text-sm" 
                      onClick={() => window.open(`/tutor/${tutor.id}`, '_blank')}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
              {filteredTutors.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No tutors available</p>
                  <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700" onClick={() => setActiveTab("search")}>
                    Find Tutors
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
