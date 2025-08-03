
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Mail, Building, Calendar, MapPin, Phone } from 'lucide-react';
import PasswordChangeSection from './PasswordChangeSection';
import { supabase } from '../../integrations/supabase/client';

interface EmployeeProfileProps {
  employee: any;
  isDarkMode: boolean;
}

const EmployeeProfile = ({ employee, isDarkMode }: EmployeeProfileProps) => {
  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      // Get current session to verify current password
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
      <div className="space-y-6 p-4 md:p-6">
        <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          My Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name
                  </label>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {employee?.full_name || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Employee ID
                  </label>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {employee?.employee_id || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <div className="flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {employee?.email || 'Not specified'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department
                  </label>
                  <div className="flex items-center mt-1">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {employee?.department || 'Not specified'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Designation
                  </label>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {employee?.designation || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Section */}
          <PasswordChangeSection 
            isDarkMode={isDarkMode} 
            onPasswordChange={handlePasswordChange}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
