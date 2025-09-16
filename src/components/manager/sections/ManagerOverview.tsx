'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  DollarSign,
  Star,
  BookOpen,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  UserCheck,
  Briefcase,
  Settings
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Permission {
  [key: string]: boolean;
}

interface ManagerStats {
  totalUsers?: number;
  totalTutors?: number;
  totalJobs?: number;
  totalReviews?: number;
  pendingApprovals?: number;
  activeSessions?: number;
  totalRevenue?: number;
  totalContent?: number;
}

interface ManagerOverviewProps {
  permissions: Permission;
}

export function ManagerOverview({ permissions }: ManagerOverviewProps) {
  const { toast } = useToast();
  const [stats, setStats] = useState<ManagerStats>({});
  const [loading, setLoading] = useState(true);

  // Fetch manager stats based on permissions
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call to get manager stats
        // For now, using mock data based on permissions
        const mockStats: ManagerStats = {};
        
        if (permissions['users.view']) {
          mockStats.totalUsers = 1250;
          mockStats.totalTutors = 450;
        }
        
        if (permissions['jobs.view']) {
          mockStats.totalJobs = 89;
          mockStats.pendingApprovals = 12;
        }
        
        if (permissions['content.view']) {
          mockStats.totalContent = 156;
        }
        
        if (permissions['payments.view']) {
          mockStats.totalRevenue = 125000;
        }
        
        if (permissions['analytics.view']) {
          mockStats.activeSessions = 67;
        }
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching manager stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard statistics',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [permissions, toast]);

  // Get available quick actions based on permissions
  const getQuickActions = () => {
    const actions = [];

    if (permissions['users.view'] || permissions['users.create']) {
      actions.push({
        id: 'users',
        label: 'User Management',
        description: 'Manage users and tutors',
        icon: Users,
        color: 'bg-blue-500',
        permission: 'users.view'
      });
    }

    if (permissions['jobs.view'] || permissions['jobs.approve']) {
      actions.push({
        id: 'jobs',
        label: 'Job Management',
        description: 'Review and approve jobs',
        icon: Briefcase,
        color: 'bg-purple-500',
        permission: 'jobs.view'
      });
    }

    if (permissions['content.view'] || permissions['content.create']) {
      actions.push({
        id: 'content',
        label: 'Content Management',
        description: 'Manage testimonials and media',
        icon: FileText,
        color: 'bg-green-500',
        permission: 'content.view'
      });
    }

    if (permissions['payments.view'] || permissions['payments.process']) {
      actions.push({
        id: 'payments',
        label: 'Payment Management',
        description: 'Process payments and refunds',
        icon: DollarSign,
        color: 'bg-yellow-500',
        permission: 'payments.view'
      });
    }

    if (permissions['analytics.view']) {
      actions.push({
        id: 'analytics',
        label: 'Analytics',
        description: 'View reports and insights',
        icon: BarChart3,
        color: 'bg-indigo-500',
        permission: 'analytics.view'
      });
    }

    if (permissions['support.view'] || permissions['support.create']) {
      actions.push({
        id: 'support',
        label: 'Support Chat',
        description: 'Handle customer support',
        icon: MessageSquare,
        color: 'bg-red-500',
        permission: 'support.view'
      });
    }

    return actions;
  };

  // Get available stat cards based on permissions
  const getStatCards = () => {
    const cards = [];

    if (permissions['users.view'] && stats.totalUsers !== undefined) {
      cards.push({
        title: 'Total Users',
        value: stats.totalUsers.toLocaleString(),
        change: '+12%',
        icon: Users,
        color: 'bg-blue-500',
        description: 'Registered users'
      });
    }

    if (permissions['users.view'] && stats.totalTutors !== undefined) {
      cards.push({
        title: 'Total Tutors',
        value: stats.totalTutors.toLocaleString(),
        change: '+8%',
        icon: UserCheck,
        color: 'bg-green-500',
        description: 'Active tutors'
      });
    }

    if (permissions['jobs.view'] && stats.totalJobs !== undefined) {
      cards.push({
        title: 'Active Jobs',
        value: stats.totalJobs.toLocaleString(),
        change: '+15%',
        icon: Briefcase,
        color: 'bg-purple-500',
        description: 'Open positions'
      });
    }

    if (permissions['jobs.approve'] && stats.pendingApprovals !== undefined) {
      cards.push({
        title: 'Pending Approvals',
        value: stats.pendingApprovals.toLocaleString(),
        change: '5 new',
        icon: AlertCircle,
        color: 'bg-orange-500',
        description: 'Awaiting review'
      });
    }

    if (permissions['content.view'] && stats.totalContent !== undefined) {
      cards.push({
        title: 'Total Content',
        value: stats.totalContent.toLocaleString(),
        change: '+3%',
        icon: FileText,
        color: 'bg-indigo-500',
        description: 'Testimonials & media'
      });
    }

    if (permissions['payments.view'] && stats.totalRevenue !== undefined) {
      cards.push({
        title: 'Total Revenue',
        value: `৳${stats.totalRevenue.toLocaleString()}`,
        change: '+18%',
        icon: DollarSign,
        color: 'bg-yellow-500',
        description: 'This month'
      });
    }

    if (permissions['analytics.view'] && stats.activeSessions !== undefined) {
      cards.push({
        title: 'Active Sessions',
        value: stats.activeSessions.toLocaleString(),
        change: '+22%',
        icon: Clock,
        color: 'bg-teal-500',
        description: 'Current sessions'
      });
    }

    return cards;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const statCards = getStatCards();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Manager Dashboard 👨‍💼</h2>
            <p className="text-white/90 mt-1">
              Welcome back! Here's an overview of your assigned responsibilities and permissions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white text-green-700">
              {Object.values(permissions).filter(Boolean).length} Permissions
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">{stat.change}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-4 gap-2 hover:bg-gray-50"
                    onClick={() => {
                      // TODO: Navigate to specific section
                      console.log(`Navigate to ${action.id}`);
                    }}
                  >
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                    <span className="text-xs text-gray-500 text-center">{action.description}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Your Permissions Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(permissions).map(([permission, hasAccess]) => (
              <div key={permission} className="flex items-center space-x-3 p-3 border rounded-lg">
                {hasAccess ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <div className="flex-1">
                  <span className={`text-sm font-medium ${hasAccess ? 'text-green-700' : 'text-gray-500'}`}>
                    {permission.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <p className="text-xs text-gray-500">
                    {hasAccess ? 'Access granted' : 'Access denied'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* No Permissions Message */}
      {Object.keys(permissions).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Permissions Assigned</h3>
            <p className="text-gray-500 mb-4">
              You don't have any specific permissions assigned yet. Please contact your administrator to get access to features.
            </p>
            <Button variant="outline">
              Contact Administrator
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
