
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginType: 'employee' | 'hr';
}

const LoginModal = ({ isOpen, onClose, loginType }: LoginModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Get user profile to check user type
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();

        if (profile?.user_type === 'hr' && loginType === 'hr') {
          navigate('/hr-dashboard');
          onClose();
        } else if (profile?.user_type === 'employee' && loginType === 'employee') {
          // Navigate to employee dashboard when implemented
          navigate('/employee-dashboard');
          onClose();
        } else {
          setError('Invalid login credentials for this user type');
          await supabase.auth.signOut();
        }
      }
    } catch (error: any) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95%] sm:w-full mx-auto rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/workcurb-uploads/69f5022b-b9cf-4f7a-b5fb-6222d2a73060.png" 
              alt="WorkCurb Logo" 
              className="h-8 w-auto mr-3"
            />
            <span className="text-3xl font-bold text-green-600">WorkCurb</span>
          </div>
          <DialogTitle className="text-3xl font-bold text-gray-900 text-center mb-2">
            {loginType === 'hr' ? 'HR Login' : 'Employee Login'}
          </DialogTitle>
          <p className="text-gray-600 text-center mb-8">
            {loginType === 'hr' 
              ? 'Sign in to your HR dashboard' 
              : 'Sign in to your employee portal'
            }
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <Label htmlFor="email" className="text-base font-medium text-gray-700 mb-2 block">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 text-base border-gray-300 rounded-lg"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="text-base font-medium text-gray-700 mb-2 block">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 text-base border-gray-300 rounded-lg pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold rounded-lg mt-8"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <div className="flex items-center justify-center pt-6 border-t border-gray-200 mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex items-center text-gray-600 hover:text-gray-900 px-6 py-3 rounded-lg border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
