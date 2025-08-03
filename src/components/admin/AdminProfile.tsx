
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Save, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

const AdminProfile = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    full_name: '',
    admin_id: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const { data: adminProfile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const adminSession = localStorage.getItem('workcurb_admin');
      if (!adminSession) throw new Error('No admin session');
      
      const admin = JSON.parse(adminSession);
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', admin.id)
        .single();

      if (error) throw error;
      
      setFormData({
        full_name: data.full_name || '',
        admin_id: data.admin_id || '',
        email: data.email || ''
      });
      
      return data;
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updateData: { full_name: string; admin_id: string; email: string }) => {
      const adminSession = localStorage.getItem('workcurb_admin');
      if (!adminSession) throw new Error('No admin session');
      
      const admin = JSON.parse(adminSession);
      const { data, error } = await supabase.rpc('update_admin_profile', {
        p_admin_id: admin.id,
        p_full_name: updateData.full_name,
        p_admin_username: updateData.admin_id,
        p_email: updateData.email
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      setIsEditing(false);
      toast.success('Profile updated successfully');
      
      // Update localStorage with new data
      const adminSession = localStorage.getItem('workcurb_admin');
      if (adminSession) {
        const admin = JSON.parse(adminSession);
        const updatedAdmin = {
          ...admin,
          full_name: formData.full_name,
          admin_id: formData.admin_id,
          email: formData.email
        };
        localStorage.setItem('workcurb_admin', JSON.stringify(updatedAdmin));
      }
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (passwords: { old_password: string; new_password: string }) => {
      const adminSession = localStorage.getItem('workcurb_admin');
      if (!adminSession) throw new Error('No admin session');
      
      const admin = JSON.parse(adminSession);
      const { data, error } = await supabase.rpc('update_admin_password', {
        p_admin_id: admin.id,
        p_old_password: passwords.old_password,
        p_new_password: passwords.new_password
      });
      
      if (error) throw error;
      if (!data) throw new Error('Invalid old password');
      return data;
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      toast.success('Password updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating password:', error);
      if (error.message.includes('Invalid old password')) {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to update password');
      }
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleSavePassword = () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    updatePasswordMutation.mutate({
      old_password: passwordData.old_password,
      new_password: passwordData.new_password
    });
  };

  const handleCancelEdit = () => {
    if (adminProfile) {
      setFormData({
        full_name: adminProfile.full_name || '',
        admin_id: adminProfile.admin_id || '',
        email: adminProfile.email || ''
      });
    }
    setIsEditing(false);
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    setIsChangingPassword(false);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Profile</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          {!isEditing && !isChangingPassword ? (
            <>
              <Button 
                onClick={() => setIsEditing(true)} 
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                onClick={() => setIsChangingPassword(true)} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </>
          ) : isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateProfileMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancelPasswordChange}
                disabled={updatePasswordMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePassword}
                disabled={updatePasswordMutation.isPending}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-green-600" />
            <span>Administrator Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                disabled={!isEditing}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="admin_id">Admin Username</Label>
              <Input
                id="admin_id"
                value={formData.admin_id}
                onChange={(e) => setFormData({...formData, admin_id: e.target.value})}
                disabled={!isEditing}
                placeholder="Enter admin username"
              />
              <p className="text-xs text-gray-500">This is used for login</p>
            </div>
          </div>

          {adminProfile && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Account Created:</strong> {new Date(adminProfile.created_at).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(adminProfile.updated_at).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change Card */}
      {isChangingPassword && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-green-600" />
              <span>Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="old_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="old_password"
                    type={showPasswords.old ? 'text' : 'password'}
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProfile;
