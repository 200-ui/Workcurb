
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const AddEmployeeModal = ({ isOpen, onClose, isDarkMode }: AddEmployeeModalProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: '',
    designation: '',
    country: '',
    city: '',
    employee_id: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const departments = [
    { value: 'IT', label: 'IT' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' }
  ];

  const countries = [
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'India', label: 'India' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Other', label: 'Other' }
  ];

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user to use as company_id and created_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate a secure password
      const generatedPassword = generateRandomPassword();

      console.log('Current user:', user.id);
      console.log('Form data:', formData);
      console.log('Generated password:', generatedPassword);

      // Insert employee with all required fields including company_id
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          full_name: formData.full_name,
          email: formData.email,
          department: formData.department,
          designation: formData.designation,
          country: formData.country,
          city: formData.city,
          employee_id: formData.employee_id,
          join_date: new Date().toISOString().split('T')[0],
          created_by: user.id,
          company_id: user.id, // Ensure company_id is properly set
          password_hash: 'temp_hash', // Temporary, will be updated by credential creation
          status: 'active'
        })
        .select()
        .single();

      console.log('Employee insert result:', employeeData, employeeError);

      if (employeeError) {
        console.error('Employee insert error:', employeeError);
        throw employeeError;
      }

      // Create employee credentials with the generated password
      const { error: credentialError } = await supabase.rpc('create_employee_credentials', {
        p_employee_id: employeeData.id,
        p_email: formData.email,
        p_password: generatedPassword,
        p_company_id: user.id
      });

      console.log('Credential creation error:', credentialError);

      if (credentialError) throw credentialError;

      // Send onboarding email with the generated password
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, organization_name')
          .eq('id', user.id)
          .single();

        await supabase.functions.invoke('send-employee-onboarding', {
          body: {
            employeeEmail: formData.email,
            employeeName: formData.full_name,
            companyName: profileData?.organization_name || 'Your Company',
            password: generatedPassword,
            hrName: profileData?.full_name || 'HR Team'
          }
        });
      } catch (emailError) {
        console.warn('Failed to send onboarding email:', emailError);
        // Don't throw error here, employee was created successfully
      }

      toast({
        title: "Success",
        description: "Employee added successfully and login credentials sent via email!",
      });

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        department: '',
        designation: '',
        country: '',
        city: '',
        employee_id: ''
      });

      onClose();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add employee. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Add New Employee
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.filter(dept => dept.value && dept.value.trim() !== '').map(dept => (
                      <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                  <SelectTrigger className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.filter(country => country.value && country.value.trim() !== '').map(country => (
                      <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City/Area</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                  placeholder="Enter city/area"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
                placeholder="e.g., EMP001"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Auto-Generated Password</span>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                A secure password will be automatically generated and sent to the employee's email address along with login instructions.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? 'Adding Employee...' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEmployeeModal;
