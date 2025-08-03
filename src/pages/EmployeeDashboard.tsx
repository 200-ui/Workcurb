import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';
import { useEmployeeData } from '../hooks/useEmployeeData';
import EmployeeNavbar from '../components/employee/EmployeeNavbar';
import EmployeeSidebar from '../components/employee/EmployeeSidebar';
import EmployeeOverview from '../components/employee/EmployeeOverview';
import EmployeeAttendance from '../components/employee/EmployeeAttendance';
import EmployeeShiftSchedule from '../components/employee/EmployeeShiftSchedule';
import EmployeeCalendar from '../components/employee/EmployeeCalendar';
import EmployeePerformance from '../components/employee/EmployeePerformance';
import EmployeeLearning from '../components/employee/EmployeeLearning';
import EmployeeProfile from '../components/employee/EmployeeProfile';
import EmployeeTickets from '../components/employee/EmployeeTickets';
import EmployeeLeave from '../components/employee/EmployeeLeave';

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Use the centralized employee data hook
  const { data: employeeData, loading: dataLoading, error, refetch } = useEmployeeData(
    employee?.id || '', 
    employee?.company_id || ''
  );

  const initializeDashboard = () => {
    console.log('EmployeeDashboard: Initializing dashboard...');
    
    const employeeData = localStorage.getItem('employeeSession');
    console.log('EmployeeDashboard: Raw session data:', employeeData);
    
    if (employeeData) {
      try {
        const parsedEmployee = JSON.parse(employeeData);
        console.log('EmployeeDashboard: Parsed employee data:', parsedEmployee);
        
        // Validate required fields
        if (!parsedEmployee.id || !parsedEmployee.full_name) {
          console.error('EmployeeDashboard: Invalid employee data structure - missing required fields');
          localStorage.removeItem('employeeSession');
          setSessionLoading(false);
          return;
        }
        
        // Validate company information
        if (!parsedEmployee.company_id) {
          console.error('EmployeeDashboard: Missing company information in session');
          console.error('Session data:', parsedEmployee);
        }
        
        console.log('EmployeeDashboard: Employee session loaded successfully');
        console.log('EmployeeDashboard: Company ID available:', parsedEmployee.company_id);
        
        setEmployee(parsedEmployee);
      } catch (error) {
        console.error('EmployeeDashboard: Error parsing employee data:', error);
        localStorage.removeItem('employeeSession');
      }
    } else {
      console.log('EmployeeDashboard: No employee session found');
    }
    
    setSessionLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeDashboard();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('EmployeeDashboard: Session loading:', sessionLoading);
    console.log('EmployeeDashboard: Data loading:', dataLoading);
    console.log('EmployeeDashboard: Employee:', employee);
    console.log('EmployeeDashboard: Employee data:', employeeData);
    console.log('EmployeeDashboard: Error:', error);
  }, [sessionLoading, dataLoading, employee, employeeData, error]);

  const handleLogout = () => {
    console.log('EmployeeDashboard: Logging out employee');
    localStorage.removeItem('employeeSession');
    window.location.href = '/';
  };

  // Show loading if session is still loading
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="text-xl font-semibold text-blue-600 mb-2">Loading Dashboard...</div>
          <div className="text-sm text-blue-500">Please wait while we set up your workspace</div>
        </div>
      </div>
    );
  }

  // Redirect if no employee session
  if (!employee) {
    console.log('EmployeeDashboard: Redirecting to home - no employee session');
    return <Navigate to="/" replace />;
  }

  // Show loading if data is still loading
  if (dataLoading && !employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="text-xl font-semibold text-blue-600 mb-2">Loading Employee Data...</div>
          <div className="text-sm text-blue-500">Fetching your information...</div>
        </div>
      </div>
    );
  }

  // Show error if data failed to load
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</div>
          <div className="text-sm text-red-500 mb-4">{error}</div>
          <button 
            onClick={refetch}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    const commonProps = { 
      employee, 
      employeeData, 
      isDarkMode, 
      onDataUpdate: refetch 
    };

    console.log('Rendering active section:', activeSection);
    console.log('Employee data for shifts:', employee);

    switch (activeSection) {
      case 'overview':
        return <EmployeeOverview {...commonProps} />;
      case 'attendance':
        return <EmployeeAttendance {...commonProps} />;
      case 'shifts':
        return <EmployeeShiftSchedule employee={employee} employeeData={employeeData} isDarkMode={isDarkMode} />;
      case 'calendar':
        return <EmployeeCalendar {...commonProps} />;
      case 'performance':
        return <EmployeePerformance {...commonProps} />;
      case 'learning':
        return <EmployeeLearning {...commonProps} />;
      case 'leave':
        return <EmployeeLeave {...commonProps} />;
      case 'profile':
        return <EmployeeProfile employee={employee} isDarkMode={isDarkMode} />;
      case 'tickets':
        return <EmployeeTickets {...commonProps} />;
      default:
        return <EmployeeOverview {...commonProps} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
      <EmployeeNavbar 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />
      
      <div className="flex pt-16">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <EmployeeSidebar 
            activeTab={activeSection}
            setActiveTab={setActiveSection}
            isDarkMode={isDarkMode}
            onLogout={handleLogout}
          />
        </div>
        
        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
              <EmployeeSidebar 
                activeTab={activeSection}
                setActiveTab={setActiveSection}
                isDarkMode={isDarkMode}
                onLogout={handleLogout}
              />
            </div>
          </>
        )}
        
        <main className="flex-1 min-w-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="min-h-screen">
              {renderActiveSection()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
