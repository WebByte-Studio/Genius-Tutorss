'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { demoClassService } from '@/services/demoClassService';

interface DemoClass {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  requested_date: string;
  duration: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  student_notes?: string;
  tutor_notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  tutor_name?: string;
  tutor_email?: string;
  tutor_phone?: string;
  request_district?: string;
  request_area?: string;
}

export function DemoClassesSection() {
  const { toast } = useToast();
  const [demoClasses, setDemoClasses] = useState<DemoClass[]>([]);
  const [filteredDemoClasses, setFilteredDemoClasses] = useState<DemoClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDemoClass, setSelectedDemoClass] = useState<DemoClass | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<DemoClass>>({});



  // Fetch demo classes
  const fetchDemoClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await demoClassService.getAllDemoClasses();
      
      if (response.success) {
        setDemoClasses(response.data);
        setFilteredDemoClasses(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch demo classes",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching demo classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load demo classes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load demo classes on component mount
  useEffect(() => {
    fetchDemoClasses();
  }, [fetchDemoClasses]);

  // Filter demo classes based on search and filters
  useEffect(() => {
    let filtered = demoClasses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(demoClass => 
        demoClass.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demoClass.tutor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demoClass.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demoClass.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demoClass.tutor_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(demoClass => demoClass.status === statusFilter);
    }

    setFilteredDemoClasses(filtered);
  }, [demoClasses, searchTerm, statusFilter]);

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline' as const, color: 'text-white border-yellow-600 bg-yellow-600' },
      accepted: { variant: 'default' as const, color: 'text-white border-green-600 bg-green-600' },
      rejected: { variant: 'destructive' as const, color: 'text-white border-red-600 bg-red-600' },
      completed: { variant: 'default' as const, color: 'text-white border-blue-600 bg-blue-600' },
      cancelled: { variant: 'secondary' as const, color: 'text-white border-gray-600 bg-gray-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  // View demo class details
  const viewDemoClassDetails = (demoClass: DemoClass) => {
    setSelectedDemoClass(demoClass);
    setShowDetailsModal(true);
  };

  // Open edit modal
  const openEditModal = (demoClass: DemoClass) => {
    setSelectedDemoClass(demoClass);
    setEditFormData({
      status: demoClass.status,
      admin_notes: demoClass.admin_notes || ''
    });
    setShowEditModal(true);
  };

  // Handle form changes
  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update demo class
  const handleUpdateDemoClass = async () => {
    if (!selectedDemoClass) return;

    try {
      setIsUpdating(true);
      const response = await demoClassService.updateDemoClass(selectedDemoClass.id, editFormData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Demo class updated successfully",
        });
        setShowEditModal(false);
        fetchDemoClasses(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update demo class",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating demo class:', error);
      toast({
        title: 'Error',
        description: 'Failed to update demo class',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete demo class
  const handleDeleteDemoClass = async (demoClassId: string) => {
    if (!confirm('Are you sure you want to delete this demo class?')) return;

    try {
      setIsDeleting(true);
      const response = await demoClassService.deleteDemoClass(demoClassId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Demo class deleted successfully",
        });
        fetchDemoClasses(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete demo class",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting demo class:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete demo class',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Demo Classes</h2>
          <p className="text-muted-foreground">
            Manage and monitor all demo class requests and schedules
          </p>
        </div>
        <Button onClick={fetchDemoClasses} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Demo Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoClasses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {demoClasses.filter(d => d.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {demoClasses.filter(d => d.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {demoClasses.filter(d => d.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {demoClasses.filter(d => d.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, tutor, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Demo Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Classes</CardTitle>
          <CardDescription>
            {filteredDemoClasses.length} demo classes found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredDemoClasses.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No demo classes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDemoClasses.map((demoClass) => (
                    <TableRow key={demoClass.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{demoClass.student_name}</div>
                          <div className="text-xs text-muted-foreground">{demoClass.student_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{demoClass.tutor_name}</div>
                          <div className="text-xs text-muted-foreground">{demoClass.tutor_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{demoClass.subject}</TableCell>
                      <TableCell>{formatDate(demoClass.requested_date)}</TableCell>
                      <TableCell>{demoClass.duration} minutes</TableCell>
                      <TableCell>{renderStatusBadge(demoClass.status)}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{demoClass.request_district}</div>
                          {demoClass.request_area && <div className="text-muted-foreground">{demoClass.request_area}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => viewDemoClassDetails(demoClass)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(demoClass)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDemoClass(demoClass.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Class Details Modal */}
      {selectedDemoClass && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
            <DialogHeader>
              <DialogTitle>Demo Class Details</DialogTitle>
              <DialogDescription>
                Detailed information about the demo class
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: '70vh' }}>
              <div className="flex flex-col space-y-6 py-4 px-2">
                {/* Basic Information */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Basic Information</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Demo Class ID</h4>
                      <p className="text-base font-semibold text-green-800">{selectedDemoClass.id}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Status</h4>
                      <div className="mt-1">{renderStatusBadge(selectedDemoClass.status)}</div>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Subject</h4>
                      <p className="text-base text-green-800">{selectedDemoClass.subject}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Duration</h4>
                      <p className="text-base text-green-800">{selectedDemoClass.duration} minutes</p>
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Student Information</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Student Name</h4>
                      <p className="text-base font-semibold text-green-800">{selectedDemoClass.student_name}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Student Email</h4>
                      <p className="text-base text-green-800">{selectedDemoClass.student_email}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Student Phone</h4>
                      <p className="text-base text-green-800">{selectedDemoClass.student_phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Tutor Information */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Tutor Information</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Tutor Name</h4>
                      <p className="text-base font-semibold text-green-800">{selectedDemoClass.tutor_name}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Tutor Email</h4>
                      <p className="text-base text-green-800">{selectedDemoClass.tutor_email}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Tutor Phone</h4>
                      <p className="text-base text-green-800">{selectedDemoClass.tutor_phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Schedule Information</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Requested Date</h4>
                      <p className="text-base text-green-800">{formatDate(selectedDemoClass.requested_date)}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Location</h4>
                      <p className="text-base text-green-800">
                        {selectedDemoClass.request_district}{selectedDemoClass.request_area ? `, ${selectedDemoClass.request_area}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Notes</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[300px]">
                      <h4 className="text-sm font-medium text-green-700">Student Notes</h4>
                      <p className="text-base text-green-800">{selectedDemoClass.student_notes || 'No notes provided'}</p>
                    </div>
                    <div className="min-w-[300px]">
                      <h4 className="text-sm font-medium text-green-700">Tutor Notes</h4>
                      <p className="text-base text-green-800">{selectedDemoClass.tutor_notes || 'No notes provided'}</p>
                    </div>
                    <div className="min-w-[300px]">
                      <h4 className="text-sm font-medium text-green-700">Admin Notes</h4>
                      <p className="text-base text-green-800">{selectedDemoClass.admin_notes || 'No admin notes'}</p>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">System Information</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Created At</h4>
                      <p className="text-base text-green-800">{formatDate(selectedDemoClass.created_at)}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Last Updated</h4>
                      <p className="text-base text-green-800">{formatDate(selectedDemoClass.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedDemoClass);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Demo Class
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleDeleteDemoClass(selectedDemoClass.id);
                    setShowDetailsModal(false);
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Demo Class Modal */}
      {selectedDemoClass && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Demo Class</DialogTitle>
              <DialogDescription>
                Update the demo class status and add admin notes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={editFormData.status || selectedDemoClass.status} 
                  onValueChange={(value) => handleEditFormChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={editFormData.admin_notes || ''}
                  onChange={(e) => handleEditFormChange('admin_notes', e.target.value)}
                  placeholder="Add admin notes..."
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDemoClass} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Demo Class'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
