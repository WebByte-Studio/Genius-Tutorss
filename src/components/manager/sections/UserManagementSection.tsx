'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Permission {
  [key: string]: boolean;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  phone?: string;
  tutor_id?: string;
}

interface UserManagementSectionProps {
  permissions: Permission;
}

export function UserManagementSection({ permissions }: UserManagementSectionProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch users based on permissions
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // Mock data for demonstration
        const mockUsers: User[] = [
          {
            id: '1',
            full_name: 'John Doe',
            email: 'john@example.com',
            role: 'student',
            status: 'active',
            created_at: '2024-01-15',
            phone: '+880 123456789'
          },
          {
            id: '2',
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'tutor',
            status: 'active',
            created_at: '2024-01-10',
            phone: '+880 987654321',
            tutor_id: 'TS-123456'
          },
          {
            id: '3',
            full_name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'student',
            status: 'pending',
            created_at: '2024-01-20',
            phone: '+880 555555555'
          }
        ];
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (permissions['users.view']) {
      fetchUsers();
    }
  }, [permissions, toast]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.tutor_id && user.tutor_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle user status change
  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!permissions['users.edit']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to edit users',
        variant: 'destructive'
      });
      return;
    }

    try {
      // TODO: Replace with actual API call
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast({
        title: 'Success',
        description: `User status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!permissions['users.delete']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to delete users',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  if (!permissions['users.view']) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Denied</h3>
        <p className="text-gray-500 text-center">
          You don't have permission to view user management.
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
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">
            Manage users and their accounts. You have {permissions['users.create'] ? 'create' : ''} 
            {permissions['users.edit'] ? ', edit' : ''} 
            {permissions['users.delete'] ? ', delete' : ''} permissions.
          </p>
        </div>
        {permissions['users.create'] && (
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or tutor ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({filteredUsers.length})</span>
            <Badge variant="outline">
              {users.length} total users
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No users found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {user.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                        {user.tutor_id && (
                          <Badge variant="outline" className="text-xs">
                            {user.tutor_id}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {permissions['users.view'] && (
                      <Button variant="outline" size="sm" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions['users.edit'] && (
                      <Button variant="outline" size="sm" title="Edit User">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions['users.edit'] && (
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    )}
                    {permissions['users.delete'] && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
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
