import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Clock, Eye, Users, Filter, Search } from 'lucide-react';
import { API_BASE_URL } from '@/constants/api';

interface TutorApplication {
  id: string;
  tutor_request_id: string;
  tutor_id: string;
  cover_letter: string;
  proposed_rate: number;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string;
  tutor_avatar: string;
  tutor_district: string;
  qualification: string;
  experience: string;
  student_name: string;
  subject: string;
  student_class: string;
  request_district: string;
  request_area: string;
  salary_range_min: number;
  salary_range_max: number;
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

const TutorApplicationsManagement = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    district: ''
  });

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [activeTab, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${API_BASE_URL}/tutor-applications`;
      const params = new URLSearchParams();
      
      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }
      
      if (filters.subject) {
        params.append('subject', filters.subject);
      }
      
      if (filters.district) {
        params.append('district', filters.district);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tutor-applications/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewApplication = (application: TutorApplication) => {
    setSelectedApplication(application);
    setAdminNotes(application.admin_notes || '');
    setIsDialogOpen(true);
  };

  const handleProcessApplication = async (action: 'approve' | 'reject') => {
    if (!selectedApplication) return;

    if (action === 'reject' && !adminNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Admin notes are required for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      
      const url = action === 'approve' 
        ? `${API_BASE_URL}/tutor-applications/${selectedApplication.id}/approve`
        : `${API_BASE_URL}/tutor-applications/${selectedApplication.id}/reject`;
      
      const body = action === 'reject' ? { adminNotes } : {};
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to process application');
      }

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: data.message,
      });

      setIsDialogOpen(false);
      fetchApplications();
      fetchStats();
    } catch (error) {
      console.error('Error processing application:', error);
      toast({
        title: 'Error',
        description: 'Failed to process application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      withdrawn: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.tutor_name?.toLowerCase().includes(searchLower) ||
      app.student_name?.toLowerCase().includes(searchLower) ||
      app.subject?.toLowerCase().includes(searchLower) ||
      app.id?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <CardTitle>Tutor Applications Management</CardTitle>
        </div>
        <CardDescription>
          Review and manage tutor applications for tuition requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-600">{stats.withdrawn}</div>
                  <div className="text-sm text-gray-600">Withdrawn</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2">
              <div className="w-48">
                <Input 
                  placeholder="Search applications..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setFilters({ subject: '', district: '' })}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="subject-filter" className="text-sm font-medium">Subject</Label>
              <Input
                id="subject-filter"
                placeholder="Filter by subject..."
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="district-filter" className="text-sm font-medium">District</Label>
              <Input
                id="district-filter"
                placeholder="Filter by district..."
                value={filters.district}
                onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading applications...</div>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Request Details</TableHead>
                    <TableHead>Proposed Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.tutor_name}</div>
                          <div className="text-sm text-gray-500">{application.tutor_email}</div>
                          <div className="text-xs text-gray-400">{application.tutor_district}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.student_name}</div>
                          <div className="text-sm text-gray-500">{application.subject} - {application.student_class}</div>
                          <div className="text-xs text-gray-400">{application.request_district}, {application.request_area}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {application.proposed_rate ? (
                          <span className="font-medium">৳{application.proposed_rate}</span>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplication(application)}
                          disabled={application.status !== 'pending'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No applications found
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Application Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review tutor application and take action
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tutor Information</Label>
                  <div className="mt-1 space-y-1">
                    <div><strong>Name:</strong> {selectedApplication.tutor_name}</div>
                    <div><strong>Email:</strong> {selectedApplication.tutor_email}</div>
                    <div><strong>Phone:</strong> {selectedApplication.tutor_phone}</div>
                    <div><strong>District:</strong> {selectedApplication.tutor_district}</div>
                    <div><strong>Qualification:</strong> {selectedApplication.qualification || 'Not specified'}</div>
                    <div><strong>Experience:</strong> {selectedApplication.experience || 'Not specified'}</div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Request Information</Label>
                  <div className="mt-1 space-y-1">
                    <div><strong>Student:</strong> {selectedApplication.student_name}</div>
                    <div><strong>Subject:</strong> {selectedApplication.subject}</div>
                    <div><strong>Class:</strong> {selectedApplication.student_class}</div>
                    <div><strong>Location:</strong> {selectedApplication.request_district}, {selectedApplication.request_area}</div>
                    <div><strong>Salary Range:</strong> ৳{selectedApplication.salary_range_min} - ৳{selectedApplication.salary_range_max}</div>
                    <div><strong>Proposed Rate:</strong> {selectedApplication.proposed_rate ? `৳${selectedApplication.proposed_rate}` : 'Not specified'}</div>
                  </div>
                </div>
              </div>
              
              {selectedApplication.cover_letter && (
                <div>
                  <Label className="text-sm font-medium">Cover Letter</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                    {selectedApplication.cover_letter}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="admin-notes" className="text-sm font-medium">
                  Admin Notes {selectedApplication.status === 'pending' && '(Required for rejection)'}
                </Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add your notes here..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={selectedApplication.status !== 'pending'}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            {selectedApplication?.status === 'pending' ? (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => handleProcessApplication('reject')}
                  disabled={isProcessing}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => handleProcessApplication('approve')}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isProcessing ? 'Processing...' : 'Approve'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TutorApplicationsManagement;
