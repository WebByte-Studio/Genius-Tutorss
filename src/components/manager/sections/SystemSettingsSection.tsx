'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  Shield,
  Globe,
  Mail,
  Bell,
  Database,
  Server,
  Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Permission {
  [key: string]: boolean;
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxFileSize: number;
  sessionTimeout: number;
}

interface SystemSettingsSectionProps {
  permissions: Permission;
}

export function SystemSettingsSection({ permissions }: SystemSettingsSectionProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'TutorConnect',
    siteDescription: 'Connect with the best tutors',
    contactEmail: 'support@tutorconnect.com',
    supportPhone: '+880 123456789',
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: 5,
    sessionTimeout: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch system settings based on permissions
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // Mock data for demonstration
        const mockSettings: SystemSettings = {
          siteName: 'TutorConnect',
          siteDescription: 'Connect with the best tutors',
          contactEmail: 'support@tutorconnect.com',
          supportPhone: '+880 123456789',
          maintenanceMode: false,
          emailNotifications: true,
          smsNotifications: false,
          maxFileSize: 5,
          sessionTimeout: 30
        };
        setSettings(mockSettings);
      } catch (error) {
        console.error('Error fetching system settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load system settings',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (permissions['system.settings']) {
      fetchSettings();
    }
  }, [permissions, toast]);

  // Handle setting changes
  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!permissions['system.settings']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to modify system settings',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Success',
        description: 'System settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save system settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!permissions['system.settings']) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Denied</h3>
        <p className="text-gray-500 text-center">
          You don't have permission to view system settings.
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
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">
            Configure system-wide settings and preferences.
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-green-600" />
            <span>General Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                placeholder="Enter site description"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                placeholder="Enter contact email"
              />
            </div>
            <div>
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={settings.supportPhone}
                onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
                placeholder="Enter support phone"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-blue-600" />
            <span>System Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Maintenance Mode</h3>
              <p className="text-sm text-gray-500">Enable maintenance mode to restrict access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Enable email notifications for system events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">SMS Notifications</h3>
              <p className="text-sm text-gray-500">Enable SMS notifications for critical alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Database</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Connected</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">API Server</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Online</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">File Storage</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Shield className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h3 className="font-medium text-red-800">Clear Cache</h3>
            <p className="text-sm text-red-600 mt-1">Clear all system cache and temporary files</p>
            <Button variant="outline" size="sm" className="mt-2 text-red-600 border-red-300 hover:bg-red-100">
              Clear Cache
            </Button>
          </div>
          
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h3 className="font-medium text-red-800">Reset System</h3>
            <p className="text-sm text-red-600 mt-1">Reset all system settings to default values</p>
            <Button variant="outline" size="sm" className="mt-2 text-red-600 border-red-300 hover:bg-red-100">
              Reset Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
