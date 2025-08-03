
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { supabase } from '../../integrations/supabase/client';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  isDarkMode: boolean;
}

const ProfileSettings = ({ isOpen, onClose, user, profile, isDarkMode }: ProfileSettingsProps) => {
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (password: string) => {
    const requirements = {
      hasSpecialChar: /[@#$%^&*(),.?":{}|<>]/.test(password),
      hasNumber: /\d/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      minLength: password.length >= 8
    };

    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update profile
      if (formData.fullName !== profile?.full_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: formData.fullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New password and confirm password do not match');
          return;
        }

        const passwordValidation = validatePassword(formData.newPassword);
        if (!passwordValidation.isValid) {
          setError('Password must contain at least 8 characters, 1 special character (@, #, $, etc.), 1 number, 1 lowercase and 1 uppercase letter');
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) throw passwordError;
      }

      setSuccess('Profile updated successfully!');
      setFormData({
        ...formData,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.newPassword);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Profile Settings
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div>
            <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Email/Username (Read-only)</Label>
            <Input
              value={user?.email || ''}
              disabled
              className={`mt-1 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100'}`}
            />
          </div>
          
          <div>
            <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`mt-1 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
            />
          </div>
          
          <div>
            <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Old Password</Label>
            <Input
              type="password"
              value={formData.oldPassword}
              onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
              className={`mt-1 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              placeholder="Enter current password"
            />
          </div>
          
          <div>
            <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>New Password</Label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className={`mt-1 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              placeholder="Enter new password"
            />
            {formData.newPassword && (
              <div className="mt-2 text-xs space-y-1">
                <div className={`${passwordValidation.requirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
                  • At least 8 characters
                </div>
                <div className={`${passwordValidation.requirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                  • One special character (@, #, $, etc.)
                </div>
                <div className={`${passwordValidation.requirements.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                  • One number
                </div>
                <div className={`${passwordValidation.requirements.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                  • One lowercase letter
                </div>
                <div className={`${passwordValidation.requirements.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                  • One uppercase letter
                </div>
              </div>
            )}
          </div>
          
          <div>
            <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Confirm New Password</Label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`mt-1 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              placeholder="Confirm new password"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;
