'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2,
  XCircle,
  Shield,
  Clock,
  User,
  MapPin,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Permission {
  [key: string]: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  location: string;
  budget: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  postedBy: string;
  postedByEmail: string;
  created_at: string;
  applications: number;
}

interface JobManagementSectionProps {
  permissions: Permission;
}

export function JobManagementSection({ permissions }: JobManagementSectionProps) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // Fetch jobs based on permissions
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Math Tutor Needed for Grade 10',
            description: 'Looking for an experienced math tutor to help with algebra and geometry',
            subject: 'Mathematics',
            grade: 'Grade 10',
            location: 'Dhaka, Bangladesh',
            budget: 5000,
            status: 'pending',
            postedBy: 'John Doe',
            postedByEmail: 'john@example.com',
            created_at: '2024-01-15',
            applications: 3
          },
          {
            id: '2',
            title: 'English Literature Tutor',
            description: 'Need help with Shakespeare and modern literature',
            subject: 'English',
            grade: 'Grade 12',
            location: 'Chittagong, Bangladesh',
            budget: 4000,
            status: 'approved',
            postedBy: 'Jane Smith',
            postedByEmail: 'jane@example.com',
            created_at: '2024-01-14',
            applications: 5
          },
          {
            id: '3',
            title: 'Physics Tutor for University Level',
            description: 'Advanced physics concepts and problem solving',
            subject: 'Physics',
            grade: 'University',
            location: 'Sylhet, Bangladesh',
            budget: 6000,
            status: 'active',
            postedBy: 'Bob Johnson',
            postedByEmail: 'bob@example.com',
            created_at: '2024-01-13',
            applications: 2
          }
        ];
        setJobs(mockJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load jobs',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (permissions['jobs.view']) {
      fetchJobs();
    }
  }, [permissions, toast]);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.postedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesSubject = filterSubject === 'all' || job.subject === filterSubject;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Handle job approval/rejection
  const handleJobAction = async (jobId: string, action: 'approve' | 'reject') => {
    if (!permissions['jobs.approve']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to approve/reject jobs',
        variant: 'destructive'
      });
      return;
    }

    try {
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: action === 'approve' ? 'approved' : 'rejected' }
          : job
      ));
      
      toast({
        title: 'Success',
        description: `Job ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error processing job action:', error);
      toast({
        title: 'Error',
        description: 'Failed to process job action',
        variant: 'destructive'
      });
    }
  };

  // Handle job deletion
  const handleDeleteJob = async (jobId: string) => {
    if (!permissions['jobs.delete']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to delete jobs',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      toast({
        title: 'Success',
        description: 'Job deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive'
      });
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'active':
        return 'outline';
      case 'completed':
        return 'default';
      default:
        return 'outline';
    }
  };

  // Calculate summary stats
  const pendingJobs = jobs.filter(j => j.status === 'pending').length;
  const approvedJobs = jobs.filter(j => j.status === 'approved').length;
  const activeJobs = jobs.filter(j => j.status === 'active').length;

  if (!permissions['jobs.view']) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Denied</h3>
        <p className="text-gray-500 text-center">
          You don't have permission to view job management.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
          <p className="text-gray-600">
            Manage tuition job postings. You have {permissions['jobs.approve'] ? 'approve' : ''} 
            {permissions['jobs.edit'] ? ', edit' : ''} 
            {permissions['jobs.delete'] ? ', delete' : ''} permissions.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{pendingJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{approvedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, description, or posted by..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Jobs ({filteredJobs.length})</span>
            <Badge variant="outline">
              {jobs.length} total jobs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No jobs found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <Badge variant={getStatusBadgeVariant(job.status)} className="text-xs">
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {job.subject} - {job.grade}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ৳{job.budget.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {job.postedBy}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {job.applications} applications
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {permissions['jobs.view'] && (
                      <Button variant="outline" size="sm" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions['jobs.edit'] && (
                      <Button variant="outline" size="sm" title="Edit Job">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions['jobs.approve'] && job.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleJobAction(job.id, 'approve')}
                          title="Approve Job"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleJobAction(job.id, 'reject')}
                          title="Reject Job"
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {permissions['jobs.delete'] && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteJob(job.id)}
                        title="Delete Job"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
