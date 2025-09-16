"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Camera, CreditCard, RefreshCw } from "lucide-react";
import { ALL_DISTRICTS } from "@/data/bangladeshDistricts";

interface StudentProfileProps {
  profile: any;
  paymentMethods: any[];
  isLoadingPaymentMethods: boolean;
  handleProfileUpdate: (profile: any) => Promise<void>;
  handlePasswordChange: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  handleAddPaymentMethod: (method: any) => Promise<boolean>;
  handleUpdatePaymentMethod: (id: string, method: any) => Promise<boolean>;
  handleDeletePaymentMethod: (id: string) => Promise<boolean>;
  handleSetDefaultPaymentMethod: (id: string) => Promise<boolean>;
}

export function StudentProfile({
  profile,
  paymentMethods,
  isLoadingPaymentMethods,
  handleProfileUpdate,
  handlePasswordChange,
  handleAddPaymentMethod,
  handleUpdatePaymentMethod,
  handleDeletePaymentMethod,
  handleSetDefaultPaymentMethod
}: StudentProfileProps) {
  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    district: profile.district,
    location: profile.location,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    type: 'bKash' as 'bKash' | 'Nagad' | 'Rocket' | 'Card' | 'Bank',
    accountNumber: '',
    accountHolderName: '',
  });

  const [editingPaymentMethod, setEditingPaymentMethod] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");

  // Update profile form when profile changes
  useEffect(() => {
    setProfileForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      district: profile.district,
      location: profile.location,
    });
  }, [profile]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelEditPaymentMethod = () => {
    setEditingPaymentMethod(null);
    setPaymentForm({
      type: 'bKash',
      accountNumber: '',
      accountHolderName: '',
    });
  };

  // Profile form handlers
  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileFormSubmit = async () => {
    await handleProfileUpdate({
      ...profile,
      ...profileForm,
      avatar: profilePhotoPreview || profile.avatar,
    });
  };

  const handlePasswordFormSubmit = async () => {
    const success = await handlePasswordChange(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword
    );
    
    if (success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handlePaymentFormSubmit = async () => {
    if (editingPaymentMethod) {
      const success = await handleUpdatePaymentMethod(editingPaymentMethod, paymentForm);
      if (success) {
        setEditingPaymentMethod(null);
        setPaymentForm({
          type: 'bKash',
          accountNumber: '',
          accountHolderName: '',
        });
      }
    } else {
      const success = await handleAddPaymentMethod(paymentForm);
      if (success) {
        setPaymentForm({
          type: 'bKash',
          accountNumber: '',
          accountHolderName: '',
        });
      }
    }
  };

  const handleEditPaymentMethod = (method: any) => {
    setEditingPaymentMethod(method.id);
    setPaymentForm({
      type: method.type,
      accountNumber: method.account_number,
      accountHolderName: method.account_holder_name,
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input className="mt-1" value={profileForm.name} onChange={(e) => handleProfileFormChange('name', e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" value={profileForm.email} onChange={(e) => handleProfileFormChange('email', e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={profileForm.phone} onChange={(e) => handleProfileFormChange('phone', e.target.value)} />
            </div>
            <div>
              <Label>District</Label>
              <Select value={profileForm.district || ''} onValueChange={(v) => handleProfileFormChange('district', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_DISTRICTS.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input className="mt-1" value={profileForm.location} onChange={(e) => handleProfileFormChange('location', e.target.value)} placeholder="Enter your current location (e.g., Dhanmondi, Dhaka)" />
            </div>
            <div>
              <Label>Profile Photo</Label>
              <div className="mt-1 flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                    {profilePhotoPreview ? (
                      <img src={profilePhotoPreview} alt="Profile Preview" className="h-full w-full object-cover" />
                    ) : profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-green-600 text-white p-1 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                    <Camera className="h-3 w-3" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a profile photo to personalize your account
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    Choose Photo
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleProfileFormSubmit}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" className="mt-1" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} placeholder="Enter current password" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" className="mt-1" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="Enter new password" />
            </div>
            <div className="md:col-span-2">
              <Label>Confirm New Password</Label>
              <Input type="password" className="mt-1" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button className="bg-green-600 hover:bg-green-700" onClick={handlePasswordFormSubmit}>Update Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add New Payment Method */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Add New Payment Method</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Type</Label>
                  <Select value={paymentForm.type} onValueChange={(v) => setPaymentForm(prev => ({ ...prev, type: v as 'bKash' | 'Nagad' | 'Rocket' | 'Card' | 'Bank' }))} disabled={editingPaymentMethod !== null}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bKash">bKash</SelectItem>
                      <SelectItem value="Nagad">Nagad</SelectItem>
                      <SelectItem value="Rocket">Rocket</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Bank">Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Account Number/ID</Label>
                  <Input className="mt-1" value={paymentForm.accountNumber} onChange={(e) => setPaymentForm(prev => ({ ...prev, accountNumber: e.target.value }))} placeholder="Enter account number or ID" />
                </div>
                <div className="md:col-span-2">
                  <Label>Account Holder Name</Label>
                  <Input className="mt-1" value={paymentForm.accountHolderName} onChange={(e) => setPaymentForm(prev => ({ ...prev, accountHolderName: e.target.value }))} placeholder="Enter account holder name" />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button className="bg-green-600 hover:bg-green-700" onClick={handlePaymentFormSubmit}>{editingPaymentMethod ? 'Update Payment Method' : 'Add Payment Method'}</Button>
                {editingPaymentMethod && (
                  <Button variant="outline" onClick={handleCancelEditPaymentMethod} className="ml-2">Cancel</Button>
                )}
              </div>
            </div>

            {/* Existing Payment Methods */}
            <div>
              <h4 className="font-medium mb-3">Your Payment Methods</h4>
              {isLoadingPaymentMethods ? (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-green-600" />
                    <p className="text-muted-foreground">Loading payment methods...</p>
                  </div>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-4">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No payment methods added yet. Add your first payment method to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className={`h-5 w-5 ${method.type === 'bKash' ? 'text-green-600' : method.type === 'Nagad' ? 'text-blue-600' : 'text-gray-600'}`} />
                        <div>
                          <div className="font-medium">{method.type}</div>
                          <div className="text-sm text-muted-foreground">****{method.account_number.slice(-4)}</div>
                          <div className="text-xs text-muted-foreground">{method.account_holder_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.is_default && <Badge className="bg-green-600">Default</Badge>}
                        {!method.is_default && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditPaymentMethod(method)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700" 
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
