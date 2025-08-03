
import React from 'react';
import { Home, Users, Calendar, TrendingUp, BookOpen, HelpCircle, Clock, CalendarCheck, ClipboardList } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isDarkMode: boolean;
}

const Sidebar = ({
  activeSection,
  setActiveSection,
  isDarkMode
}: SidebarProps) => {
  const menuItems = [{
    id: 'overview',
    label: 'Overview',
    icon: Home
  }, {
    id: 'employees',
    label: 'Employees',
    icon: Users
  }, {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock
  }, {
    id: 'shifts',
    label: 'Shift Schedule',
    icon: ClipboardList
  }, {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar
  }, {
    id: 'performance',
    label: 'Performance',
    icon: TrendingUp
  }, {
    id: 'learning',
    label: 'Learning',
    icon: BookOpen
  }, {
    id: 'leave',
    label: 'Leave',
    icon: CalendarCheck
  }, {
    id: 'tickets',
    label: 'Tickets',
    icon: HelpCircle
  }];

  return (
    <div className={`w-64 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
      <nav className="pt-4">
        <ul className="space-y-2 px-4">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveSection(item.id)} 
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
