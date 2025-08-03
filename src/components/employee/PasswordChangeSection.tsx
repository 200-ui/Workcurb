
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Lock } from 'lucide-react';

interface PasswordChangeSectionProps {
  isDarkMode: boolean;
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
}

const PasswordChangeSection = ({ isDarkMode, onPasswordChange }: PasswordChangeSectionProps) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
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
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New password and confirm password do not match');
        return;
      }

      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        setError('Password must meet all requirements listed below');
        return;
      }

      await onPasswordChange(formData.currentPassword, formData.newPassword);
      
      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.newPassword);

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} max-w-md`}>
      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Lock className="w-5 h-5 mr-2" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Current Password
            </Label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className={`mt-1 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              required
            />
          </div>
          
          <div>
            <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              New Password
            </Label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className={`mt-1 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              required
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
            <Label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirm New Password
            </Label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`mt-1 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeSection;
