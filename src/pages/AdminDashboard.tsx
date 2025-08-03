
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminOverview from '../components/admin/AdminOverview';
import CallBookings from '../components/admin/CallBookings';
import ContactSubmissions from '../components/admin/ContactSubmissions';
import Orders from '../components/admin/Orders';
import UserProfiles from '../components/admin/UserProfiles';
import AdminProfile from '../components/admin/AdminProfile';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminData, setAdminData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem('workcurb_admin');
    if (!adminSession) {
      navigate('/');
      return;
    }

    try {
      setAdminData(JSON.parse(adminSession));
    } catch (error) {
      console.error('Error parsing admin session:', error);
      navigate('/');
    }
  }, [navigate]);

  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'bookings':
        return <CallBookings />;
      case 'contacts':
        return <ContactSubmissions />;
      case 'orders':
        return <Orders />;
      case 'profiles':
        return <UserProfiles />;
      case 'admin-profile':
        return <AdminProfile />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar adminData={adminData} />
      <div className="flex">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="p-4 sm:p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
