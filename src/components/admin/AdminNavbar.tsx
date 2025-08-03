
import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AdminNavbarProps {
  adminData: {
    admin_id: string;
    full_name: string;
    email: string;
  };
}

const AdminNavbar = ({ adminData }: AdminNavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('workcurb_admin');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Workcurb Admin</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Administrative Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{adminData.full_name}</p>
            <p className="text-xs text-gray-500">{adminData.admin_id}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
