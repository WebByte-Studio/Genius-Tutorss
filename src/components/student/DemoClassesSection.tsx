'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, BookOpen, MessageSquare } from "lucide-react";
import { demoClassService, DemoClass } from '@/services/demoClassService';

interface DemoClassesSectionProps {
  studentId: string;
}

export function DemoClassesSection({ studentId }: DemoClassesSectionProps) {
  const [demoClasses, setDemoClasses] = useState<DemoClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDemoClass, setSelectedDemoClass] = useState<DemoClass | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch demo classes
  const fetchDemoClasses = async () => {
    try {
      setIsLoading(true);
      const data = await demoClassService.getDemoClassesForStudent(studentId);
      setDemoClasses(data);
    } catch (error) {
      console.error('Error fetching demo classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoClasses();
  }, [studentId]);

  // View demo class details
  const viewDemoClassDetails = (demoClass: DemoClass) => {
    setSelectedDemoClass(demoClass);
    setShowDetailsModal(true);
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-600">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-600">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Demo Classes
          </CardTitle>
          <CardDescription>
            View your scheduled demo classes with tutors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : demoClasses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No demo classes scheduled yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Demo classes will appear here once assigned by an admin
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {demoClasses.map((demoClass) => (
                <Card key={demoClass.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{demoClass.tutor_name}</span>
                          {renderStatusBadge(demoClass.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(demoClass.requested_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {demoClass.duration} minutes
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Subject:</span> {demoClass.subject}
                        </div>
                        
                        {demoClass.student_notes && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Your Notes:</span> {demoClass.student_notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => viewDemoClassDetails(demoClass)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Details
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Class Details Modal */}
      {selectedDemoClass && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Demo Class Details</DialogTitle>
              <DialogDescription>
                Detailed information about your demo class
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tutor</label>
                  <p className="text-base">{selectedDemoClass.tutor_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  <p className="text-base">{selectedDemoClass.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                  <p className="text-base">{formatDate(selectedDemoClass.requested_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-base">{selectedDemoClass.duration} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{renderStatusBadge(selectedDemoClass.status)}</div>
                </div>
              </div>
              
              {selectedDemoClass.student_notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Your Notes</label>
                  <p className="text-base mt-1">{selectedDemoClass.student_notes}</p>
                </div>
              )}
              
              {selectedDemoClass.tutor_notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tutor Notes</label>
                  <p className="text-base mt-1">{selectedDemoClass.tutor_notes}</p>
                </div>
              )}
              
              {selectedDemoClass.feedback && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Feedback</label>
                  <p className="text-base mt-1">{selectedDemoClass.feedback}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
