import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, Download, Filter, Eye, Calendar, User, Activity } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { toast } from '@/components/ui/use-toast';

interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: 'super_admin' | 'admin' | 'manager' | 'tutor' | 'student';
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

interface LogStats {
  total: number;
  severity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  topActions: Array<{ action: string; count: number }>;
  userRoles: Array<{ user_role: string; count: number }>;
  trend: Array<{ date: string; count: number }>;
}

export default function LogsSecuritySection() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // Fetch logs function
  const fetchLogs = async (search = false) => {
    try {
      if (search) setSearching(true);
      else setLoading(true);

      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (roleFilter !== 'all') params.append('user_role', roleFilter);
      if (actionFilter) params.append('action', actionFilter);

      const response = await axios.get(`${API_BASE_URL}/activity-logs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch activity logs',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch activity logs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/activity-logs/stats?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Get current user role
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserRole(user.role || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, timeRange]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || severityFilter !== 'all' || roleFilter !== 'all' || actionFilter) {
        fetchLogs(true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, severityFilter, roleFilter, actionFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportLogs = async (format: 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (roleFilter !== 'all') params.append('user_role', roleFilter);

      const response = await fetch(`${API_BASE_URL}/activity-logs/export/csv?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Export Complete',
          description: 'Your CSV export has been downloaded.',
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export logs. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Activity Logs & Security</h2>
        <p className="text-muted-foreground">
          Monitor all platform activities, user actions, and security events with real-time search.
        </p>
        {currentUserRole === 'admin' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> As an admin, you can only view activities from other users. Super admin activities are not visible to maintain security.
            </p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <p className="text-xs text-muted-foreground">Total Activities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-red-600" />
                <div className="text-2xl font-bold text-red-600">
                  {(stats.severity.critical || 0) + (stats.severity.high || 0)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold">{stats.userRoles.length}</div>
              </div>
              <p className="text-xs text-muted-foreground">Active Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div className="text-2xl font-bold">
                  {Math.round(stats.total / parseInt(timeRange.replace('d', '')))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Daily Average</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs by user, action, or details..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searching && (
                  <RefreshCw className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              
              {/* Severity Filter */}
              <div className="w-full md:w-40">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Role Filter */}
              <div className="w-full md:w-40">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="User Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div className="w-full md:w-32">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="90d">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fetchLogs()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => exportLogs('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            {logs.length} activities found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading activity logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <p>No activity logs found matching your filters</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.user_name || 'System'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.user_role?.replace('_', ' ') || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell className="max-w-xs truncate" title={log.details || ''}>
                        {log.details || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}