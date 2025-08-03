
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface EmployeePasswordChangeModalProps {
  employee: any;
  isDarkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeePasswordChangeModal = ({ employee, isDarkMode, isOpen, onClose }: EmployeePasswordChangeModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      special: /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      number: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password)
    };
    
    return requirements;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.length || !validation.special || !validation.number || !validation.lowercase || !validation.uppercase) {
      toast({
        title: "Password Requirements Not Met",
        description: "Please ensure your password meets all requirements",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('update_employee_login_password', {
        p_email: employee.email,
        p_old_password: currentPassword,
        p_new_password: newPassword
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully",
        });
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = validatePassword(newPassword);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            Change Password
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className={`space-y-2 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Password Requirements:
            </p>
            <ul className="text-sm space-y-1">
              <li className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.length ? '✓' : '○'}</span>
                At least 8 characters
              </li>
              <li className={`flex items-center ${passwordRequirements.special ? 'text-green-600' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.special ? '✓' : '○'}</span>
                One special character (@, #, $, etc.)
              </li>
              <li className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.number ? '✓' : '○'}</span>
                One number
              </li>
              <li className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.lowercase ? '✓' : '○'}</span>
                One lowercase letter
              </li>
              <li className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.uppercase ? '✓' : '○'}</span>
                One uppercase letter
              </li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !Object.values(passwordRequirements).every(Boolean)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeePasswordChangeModal;
