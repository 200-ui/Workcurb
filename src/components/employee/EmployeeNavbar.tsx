import React from 'react';
import { Menu, Moon, Sun, User, LogOut, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { supabase } from '../../integrations/supabase/client';
import { useState, useEffect } from 'react';
interface EmployeeNavbarProps {
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}
const EmployeeNavbar = ({
  isDarkMode,
  setIsDarkMode,
  setSidebarOpen,
  isMobile
}: EmployeeNavbarProps) => {
  const [companyName, setCompanyName] = useState('');
  const [employeeData, setEmployeeData] = useState<any>(null);
  useEffect(() => {
    const fetchCompanyName = async () => {
      const employeeSession = localStorage.getItem('employeeSession');
      if (employeeSession) {
        const employee = JSON.parse(employeeSession);
        setEmployeeData(employee);

        // Fetch company name from profiles table
        const {
          data,
          error
        } = await supabase.from('profiles').select('organization_name').eq('id', employee.created_by).single();
        if (data && !error) {
          setCompanyName(data.organization_name || 'Company');
        }
      }
    };
    fetchCompanyName();
  }, []);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  const handleLogout = () => {
    localStorage.removeItem('employeeSession');
    window.location.href = '/';
  };
  return <nav className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {isMobile && <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2 lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Home className="w-6 h-6 text-blue-500" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Employee Dashboard
                </h1>
              </div>
              <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            </span>
              <span className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {companyName}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sliding Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-yellow-500'}`} />
              <button onClick={toggleDarkMode} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <Moon className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-gray-500'}`} />
            </div>

            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {employeeData?.full_name?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {employeeData?.full_name || 'Employee'}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {employeeData?.designation || 'Employee'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-2">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>;
};
export default EmployeeNavbar;