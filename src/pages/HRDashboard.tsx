
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useIsMobile } from '../hooks/use-mobile';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import Employees from '../components/dashboard/Employees';
import HRAttendance from '../components/dashboard/HRAttendance';
import ShiftSchedule from '../components/dashboard/ShiftSchedule';
import Calendar from '../components/dashboard/Calendar';
import Performance from '../components/dashboard/Performance';
import Learning from '../components/dashboard/Learning';
import Leave from '../components/dashboard/Leave';
import Tickets from '../components/dashboard/Tickets';

const HRDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-xl font-semibold text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!user || !profile || profile.user_type !== 'hr') {
    return <Navigate to="/" replace />;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview isDarkMode={isDarkMode} />;
      case 'employees':
        return <Employees isDarkMode={isDarkMode} />;
      case 'attendance':
        return <HRAttendance isDarkMode={isDarkMode} />;
      case 'shifts':
        return <ShiftSchedule isDarkMode={isDarkMode} />;
      case 'calendar':
        return <Calendar isDarkMode={isDarkMode} />;
      case 'performance':
        return <Performance isDarkMode={isDarkMode} />;
      case 'learning':
        return <Learning isDarkMode={isDarkMode} />;
      case 'leave':
        return <Leave isDarkMode={isDarkMode} />;
      case 'tickets':
        return <Tickets isDarkMode={isDarkMode} />;
      default:
        return <Overview isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
      <DashboardNavbar 
        user={user}
        profile={profile}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />
      
      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isDarkMode={isDarkMode}
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
              <Sidebar 
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
        )}
        
        <main className="flex-1 min-w-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-2 sm:p-4 lg:p-6">
              {renderActiveSection()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;
