'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  History, 
  Filter, 
  Download, 
  Search, 
  Calendar, 
  Users, 
  BookOpen, 
  UserCheck, 
  Star,
  TrendingUp,
  Activity,
  Eye,
  RefreshCw,
  FileText,
  BarChart3,
  Clock,
  User,
  BookMarked,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import historyService, { 
  type HistoryLog, 
  type HistorySummary, 
  type HistoryFilters 
} from '@/services/historyService';

export function HistorySection() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<HistoryLog[]>([]);
  const [summaryData, setSummaryData] = useState<HistorySummary | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    limit: 20
  });

  // Filters state
  const [filters, setFilters] = useState<HistoryFilters>({
    entity_type: '',
    action_type: '',
    start_date: '',
    end_date: '',
    performed_by: '',
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'DESC'
  });

  // Date range for summary
  const [summaryDateRange, setSummaryDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<HistoryLog | null>(null);

  // Fetch history data
  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await historyService.getHistory(filters);
      setHistoryData(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error fetching history data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch history data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary data
  const fetchSummaryData = async () => {
    try {
      const response = await historyService.getSummary(
        summaryDateRange.start_date || undefined,
        summaryDateRange.end_date || undefined
      );
      setSummaryData(response.data);
    } catch (error: any) {
      console.error('Error fetching summary data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch summary data',
        variant: 'destructive'
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchHistoryData();
    fetchSummaryData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof HistoryFilters, value: any) => {
    // Convert "all" values to empty strings for API compatibility
    const apiValue = value === 'all' ? '' : value;
    setFilters(prev => ({
      ...prev,
      [key]: apiValue,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    handleFilterChange('page', page);
  };

  // Export data
  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      const exportFilters = {
        entity_type: filters.entity_type,
        start_date: filters.start_date,
        end_date: filters.end_date,
        format
      };

      if (format === 'csv') {
        const blob = await historyService.exportHistory(exportFilters);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `history_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await historyService.exportHistory(exportFilters);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `history_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: 'Success',
        description: `History data exported successfully as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to export data',
        variant: 'destructive'
      });
    }
  };

  // View log details
  const viewLogDetails = (log: HistoryLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total_records}</div>
            <p className="text-xs text-muted-foreground">
              Across all entity types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData?.recent_activity?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 10 activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData?.top_performers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active users tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData?.summary?.reduce((acc, item) => acc + item.count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total tracked entities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      {summaryData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaryData.summary.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {historyService.getEntityTypeDisplayName(item.entity_type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {historyService.getActionTypeDisplayName(item.action_type)}
                      </span>
                    </div>
                    <Badge variant="default">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaryData.top_performers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{performer.full_name}</p>
                      <p className="text-sm text-muted-foreground">{performer.email}</p>
                    </div>
                    <Badge variant="secondary">{performer.action_count} actions</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaryData?.recent_activity?.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={historyService.getActionTypeBadgeVariant(log.action_type) as any}>
                      {historyService.getActionTypeDisplayName(log.action_type)}
                    </Badge>
                    <Badge variant="outline">
                      {historyService.getEntityTypeDisplayName(log.entity_type)}
                    </Badge>
                  </div>
                  <span className="text-sm">{log.action_description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {historyService.formatDate(log.created_at)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewLogDetails(log)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render detailed history tab
  const renderDetailedHistory = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="entity-type">Entity Type</Label>
              <Select value={filters.entity_type || 'all'} onValueChange={(value) => handleFilterChange('entity_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="demo_class">Demo Class</SelectItem>
                  <SelectItem value="request">Request</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="action-type">Action Type</Label>
              <Select value={filters.action_type || 'all'} onValueChange={(value) => handleFilterChange('action_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rated">Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Button onClick={fetchHistoryData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="h-5 w-5" />
              History Logs
            </span>
            <div className="text-sm text-muted-foreground">
              Showing {historyData.length} of {pagination.total_records} records
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No history records found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={historyService.getActionTypeBadgeVariant(log.action_type) as any}>
                          {historyService.getActionTypeDisplayName(log.action_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {historyService.getEntityTypeDisplayName(log.entity_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.action_description}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.performed_by_name || 'System'}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.performed_by_email || log.performed_by_role}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {historyService.formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewLogDetails(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.current_page} of {pagination.total_pages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">History Management</h2>
          <p className="text-muted-foreground">
            Comprehensive tracking and analysis of all system activities
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {renderDetailedHistory()}
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>History Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Action Type</Label>
                  <Badge variant={historyService.getActionTypeBadgeVariant(selectedLog.action_type) as any}>
                    {historyService.getActionTypeDisplayName(selectedLog.action_type)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Entity Type</Label>
                  <Badge variant="outline">
                    {historyService.getEntityTypeDisplayName(selectedLog.entity_type)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Entity ID</Label>
                  <p className="text-sm">{selectedLog.entity_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Performed By</Label>
                  <p className="text-sm">{selectedLog.performed_by_name || 'System'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm capitalize">{selectedLog.performed_by_role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{historyService.formatDate(selectedLog.created_at)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm mt-1">{selectedLog.action_description}</p>
              </div>

              {selectedLog.old_values && (
                <div>
                  <Label className="text-sm font-medium">Previous Values</Label>
                  <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <Label className="text-sm font-medium">New Values</Label>
                  <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.ip_address && (
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="text-sm">{selectedLog.ip_address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
