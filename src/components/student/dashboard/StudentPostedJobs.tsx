"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, RefreshCw, Edit, Trash2, Star } from "lucide-react";

interface StudentPostedJobsProps {
  postedRequests: any[];
  isLoadingRequests: boolean;
  refreshPostedRequests: () => void;
  deleteTutorRequest: (id: string) => Promise<void>;
  isDeletingRequest: string | null;
  populateFormForEdit: (request: any) => void;
  setActiveTab: (tab: string) => void;
  inviteDemo: (tutor: any) => void;
  bookSession: (tutor: any, type: string) => void;
}

export function StudentPostedJobs({
  postedRequests,
  isLoadingRequests,
  refreshPostedRequests,
  deleteTutorRequest,
  isDeletingRequest,
  populateFormForEdit,
  setActiveTab,
  inviteDemo,
  bookSession
}: StudentPostedJobsProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; requestId: string | null }>({ open: false, requestId: null });

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Posted Requests ({postedRequests.length})
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshPostedRequests}
              disabled={isLoadingRequests}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingRequests ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-green-600" />
                <p className="text-muted-foreground">Loading posted requests...</p>
              </div>
            </div>
          ) : postedRequests.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No requests posted yet. Create your first tutor request to get started!</p>
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700" 
                onClick={() => setActiveTab("request")}
              >
                Create Request
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {postedRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-6 space-y-4">
                  {/* Request Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {request.subject} • {request.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.location} • {request.schedule}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={request.status === 'Active' ? "bg-green-600" : request.status === 'Completed' ? "bg-blue-600" : "bg-gray-600"}>
                        {request.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span> {request.category}
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span> {request.subject}
                    </div>
                    <div>
                      <span className="font-medium">Budget:</span> {request.budget}
                    </div>
                    <div>
                      <span className="font-medium">Schedule:</span> {request.schedule}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {request.location}
                    </div>
                  </div>

                  {request.requirements && request.requirements.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-sm">Requirements:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {request.requirements.map((req: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        populateFormForEdit(request);
                        setActiveTab("request");
                      }} 
                      className="flex items-center gap-2"
                      disabled={isDeletingRequest === request.id}
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setDeleteDialog({ open: true, requestId: request.id })} 
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      disabled={isDeletingRequest === request.id}
                    >
                      {isDeletingRequest === request.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {isDeletingRequest === request.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(o) => {
        if (!o) setDeleteDialog({ open: false, requestId: null });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this request? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, requestId: null })}
              disabled={isDeletingRequest === deleteDialog.requestId}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                if (deleteDialog.requestId) {
                  await deleteTutorRequest(deleteDialog.requestId);
                  setDeleteDialog({ open: false, requestId: null });
                }
              }}
              disabled={isDeletingRequest === deleteDialog.requestId}
            >
              {isDeletingRequest === deleteDialog.requestId ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
