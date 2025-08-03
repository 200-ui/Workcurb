
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Moon, Sun, LogOut, Settings, Menu, X } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import ProfileSettings from './ProfileSettings';

interface DashboardNavbarProps {
  user: any;
  profile: any;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  setSidebarOpen: (value: boolean) => void;
  isMobile: boolean;
}

const DashboardNavbar = ({ user, profile, isDarkMode, setIsDarkMode, setSidebarOpen, isMobile }: DashboardNavbarProps) => {
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [sidebarOpen, setSidebarOpenLocal] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpenLocal(newState);
    setSidebarOpen(newState);
  };

  return (
    <>
      <nav className={`border-b sticky top-0 z-30 backdrop-blur-lg bg-opacity-80 ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
            <div className="flex items-center">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="mr-2 lg:hidden p-1 h-8 w-8"
                >
                  {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              )}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <h1 className={`text-base sm:text-lg lg:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {profile?.organization_name || 'Company'} | HR Dashboard
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Moon className="h-4 w-4" />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-500 text-white text-sm">
                        {profile?.full_name?.charAt(0) || 'H'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 sm:w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex-col items-start">
                    <div className="font-medium text-sm">{profile?.full_name}</div>
                    <div className="text-xs text-gray-500 truncate w-full">{user?.email}</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        user={user}
        profile={profile}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

export default DashboardNavbar;
