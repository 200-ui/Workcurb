
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface EmployeeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EmployeeData {
  employee_id: string;
  employee_info_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  company_id: string;
}

const EmployeeLoginModal = ({ isOpen, onClose }: EmployeeLoginModalProps) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting employee login with email:', credentials.email);
      
      const { data, error } = await supabase.rpc('authenticate_employee_login', {
        employee_email: credentials.email.trim(),
        employee_password: credentials.password
      });

      console.log('Authentication RPC response:', { data, error });

      if (error) {
        console.error('Authentication RPC error:', error);
        throw new Error('Invalid email or password');
      }

      if (!data || data.length === 0) {
        console.log('Authentication failed - no matching credentials');
        throw new Error('Invalid email or password');
      }

      const employeeData = data[0] as EmployeeData;
      console.log('Employee login successful:', employeeData.full_name);
      console.log('Employee data received:', employeeData);

      // Validate that company_id is present
      if (!employeeData.company_id) {
        console.error('Company ID missing from authentication response');
        console.error('Full employee data:', employeeData);
        throw new Error('Unable to access employee dashboard. Missing company information. Please contact your HR.');
      }

      console.log('Company ID found:', employeeData.company_id);

      toast({
        title: "Login Successful!",
        description: `Welcome back, ${employeeData.full_name}!`,
      });

      // Store complete employee info with company_id in localStorage
      const employeeSession = {
        id: employeeData.employee_info_id,
        employee_id: employeeData.employee_code,
        full_name: employeeData.full_name,
        email: employeeData.email,
        department: employeeData.department,
        designation: employeeData.designation,
        company_id: employeeData.company_id,
        created_by: employeeData.company_id
      };

      console.log('Storing employee session:', employeeSession);
      localStorage.setItem('employeeSession', JSON.stringify(employeeSession));

      // Reset form and close modal
      setCredentials({ email: '', password: '' });
      onClose();

      // Navigate to employee dashboard
      console.log('Navigating to employee dashboard...');
      setTimeout(() => {
        navigate('/employee-dashboard', { replace: true });
      }, 100);

    } catch (error: any) {
      console.error('Employee login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
            Employee Login
          </DialogTitle>
          <p className="text-gray-600 text-center mb-8">
            Sign in to your employee portal
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-base font-medium text-gray-700 mb-2 block">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="h-12 text-base border-gray-300 rounded-lg pl-10"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password" className="text-base font-medium text-gray-700 mb-2 block">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="h-12 text-base border-gray-300 rounded-lg pl-10 pr-12"
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
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
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

export default EmployeeLoginModal;
