'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  Search, 
  UserPlus, 
  Shield, 
  Save, 
  RefreshCw,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '@/config/api';
import { storeUserPermissions } from '@/utils/auth';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

interface UserPermissions {
  userId: string;
  permissions: string[];
}

export default function PermissionAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('Starting to fetch data...');
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api');
      
      // Debug authentication
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        console.log('Auth token:', token ? `${token.substring(0, 20)}...` : 'No token found');
      }

      // Try to fetch users first
      let usersData = [];
      try {
        const usersResponse = await api.get('/dashboard/users?role=manager&limit=100');
        console.log('Users response:', usersResponse);
        usersData = usersResponse.data?.users || usersResponse.users || [];
        console.log('Processed users:', usersData);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Warning',
          description: 'Failed to fetch users, but continuing with permissions',
          variant: 'destructive'
        });
      }

      // Try to fetch permissions
      let permissionsData = [];
      try {
        const permissionsResponse = await api.get('/role-management/permissions');
        console.log('Permissions response:', permissionsResponse);
        permissionsData = Array.isArray(permissionsResponse) ? permissionsResponse : (permissionsResponse.data || []);
        console.log('Processed permissions:', permissionsData);
      } catch (error: any) {
        console.error('Error fetching permissions:', error);
        
        let errorMessage = 'Failed to fetch permissions';
        if (error.response?.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view role management.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }

      setUsers(usersData);
      setPermissions(permissionsData);

      // Fetch current permissions for each user
      const userPermsData = await Promise.all(
        usersData.map(async (user: User) => {
          try {
            const response = await api.get(`/role-management/users/${user.id}/permissions`);
            console.log(`Permissions for user ${user.id}:`, response);
            return {
              userId: user.id,
              permissions: response.permissions || response.data?.permissions || []
            };
          } catch (error: any) {
            console.error(`Error fetching permissions for user ${user.id}:`, error);
            
            if (error.response?.status === 403) {
              console.error(`Access denied for user ${user.id}: You do not have permission to view role management.`);
            } else if (error.response?.status === 401) {
              console.error(`Authentication required for user ${user.id}: Please log in again.`);
            }
            
            return {
              userId: user.id,
              permissions: []
            };
          }
        })
      );

      setUserPermissions(userPermsData);

      // Store permissions in localStorage for frontend permission checking
      const permissionsMap = permissionsData.reduce((acc: any, permission: Permission) => {
        acc[permission.name] = true;
        return acc;
      }, {});
      storeUserPermissions(permissionsMap);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // Get user's current permissions
  const getUserPermissions = (userId: string): string[] => {
    const userPerms = userPermissions.find(up => up.userId === userId);
    return userPerms ? userPerms.permissions : [];
  };

  // Update user permissions
  const updateUserPermissions = (userId: string, permissionName: string, checked: boolean) => {
    setUserPermissions(prev => {
      const existing = prev.find(up => up.userId === userId);
      if (existing) {
        if (checked && !existing.permissions.includes(permissionName)) {
          existing.permissions.push(permissionName);
        } else if (!checked && existing.permissions.includes(permissionName)) {
          existing.permissions = existing.permissions.filter(p => p !== permissionName);
        }
        return [...prev];
      } else {
        return [...prev, { userId, permissions: checked ? [permissionName] : [] }];
      }
    });
  };

  // Save permissions for a user
  const saveUserPermissions = async (userId: string) => {
    try {
      setSaving(true);
      const userPerms = getUserPermissions(userId);
      
      await api.put(`/role-management/users/${userId}/permissions`, {
        permissions: userPerms
      });

      toast({
        title: 'Success',
        description: 'Permissions updated successfully',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      
      let errorMessage = 'Failed to save permissions';
      if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to edit role management.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Save all permissions
  const saveAllPermissions = async () => {
    try {
      setSaving(true);
      
      await Promise.all(
        userPermissions.map(async (userPerm) => {
          await api.put(`/role-management/users/${userPerm.userId}/permissions`, {
            permissions: userPerm.permissions
          });
        })
      );

      toast({
        title: 'Success',
        description: 'All permissions updated successfully',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Error saving all permissions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save permissions',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permission Assignment</h2>
          <p className="text-gray-600">Manage permissions for manager accounts</p>
        </div>
        <Button onClick={saveAllPermissions} disabled={saving}>
          <Save className="w-4 w-4 mr-2" />
          Save All Changes
        </Button>
              </div>



      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 w-5" />
            Manager Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                  >
                    {selectedUser === user.id ? 'Hide Permissions' : 'Manage Permissions'}
                  </Button>
                </div>

                                  {selectedUser === user.id && (
                    <div className="border-t pt-4">
                      {permissions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <AlertCircle className="w-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No permissions available</p>
                          <p className="text-sm">Please check if permissions are properly configured</p>
                        </div>
                      ) : (
                                                 <div className="space-y-6">
                           <div className="border-b pb-4">
                             <h3 className="text-lg font-semibold text-gray-900">All Permissions</h3>
                             <p className="text-sm text-gray-600">Select permissions to assign to this manager</p>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {permissions.map((permission) => (
                               <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                 <Checkbox
                                   id={`${user.id}-${permission.id}`}
                                   checked={getUserPermissions(user.id).includes(permission.name)}
                                   onCheckedChange={(checked) =>
                                     updateUserPermissions(user.id, permission.name, checked as boolean)
                                   }
                                 />
                                 <div className="flex-1 min-w-0">
                                   <Label
                                     htmlFor={`${user.id}-${permission.id}`}
                                     className="text-sm font-medium text-gray-900 cursor-pointer block"
                                   >
                                     {permission.name}
                                   </Label>
                                   <p className="text-xs text-gray-500 mt-1">
                                     {permission.description}
                                   </p>
                                   <div className="flex items-center gap-2 mt-1">
                                     <Badge variant="outline" className="text-xs">
                                       {permission.module}
                                     </Badge>
                                     <Badge variant="secondary" className="text-xs">
                                       {permission.action}
                                     </Badge>
                                   </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                      )}

                      <div className="flex justify-end mt-4 pt-4 border-t">
                      <Button
                        onClick={() => saveUserPermissions(user.id)}
                        disabled={saving}
                        size="sm"
                      >
                        <Save className="w-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No manager users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

