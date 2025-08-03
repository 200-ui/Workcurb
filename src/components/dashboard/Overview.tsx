
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Calendar, Clock, TrendingUp, UserCheck, AlertTriangle, CalendarDays, MapPin } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import DepartmentChart from './DepartmentChart';
import WorldMap from './WorldMap';
import DigitalClock from './DigitalClock';

interface OverviewProps {
  isDarkMode: boolean;
}

const Overview = ({ isDarkMode }: OverviewProps) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    pendingLeave: 0,
    openTickets: 0,
    upcomingEvents: 0
  });
  
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch employees
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('created_by', user.id);

      setEmployees(employees || []);

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: attendance } = await supabase
        .from('employee_attendance_sessions')
        .select('*, employees(full_name)')
        .eq('company_id', user.id)
        .eq('attendance_date', today)
        .order('check_in_time', { ascending: false })
        .limit(5);

      setRecentAttendance(attendance || []);

      // Fetch pending leave requests
      const { data: leaveRequests } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('company_id', user.id)
        .eq('status', 'pending');

      // Fetch open tickets created by this HR
      const { data: tickets } = await supabase
        .from('employee_tickets')
        .select('*')
        .eq('company_id', user.id)
        .in('status', ['Open', 'In Progress']);

      // Fetch upcoming events (next 7 days) - limit to 3 for smaller section
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('company_id', user.id)
        .gte('event_date', today)
        .lte('event_date', nextWeek.toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(3);

      // Calculate unique employees who attended today
      const uniqueAttendees = new Set(attendance?.map(a => a.employee_id) || []).size;

      // Calculate department distribution
      const departmentCounts = employees?.reduce((acc, emp) => {
        const dept = emp.department || 'Unassigned';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const departmentChartData = Object.entries(departmentCounts).map(([name, value]) => ({
        name,
        value
      }));

      // Calculate country distribution for geographical representation
      const countryCounts = employees?.reduce((acc, emp) => {
        const country = emp.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const countryChartData = Object.entries(countryCounts).map(([country, count]) => ({
        country,
        count
      }));

      setStats({
        totalEmployees: employees?.length || 0,
        activeEmployees: employees?.filter(emp => emp.is_active)?.length || 0,
        presentToday: uniqueAttendees,
        pendingLeave: leaveRequests?.length || 0,
        openTickets: tickets?.length || 0,
        upcomingEvents: events?.length || 0
      });

      setRecentEvents(events || []);
      setDepartmentData(departmentChartData);
      setCountryData(countryChartData);
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading overview...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard Overview
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Welcome back! Here's what's happening with your team today.
          </p>
        </div>
        <DigitalClock isDarkMode={isDarkMode} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Employees</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalEmployees}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Employees</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeEmployees}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Present Today</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.presentToday}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Leave</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pendingLeave}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Open Tickets</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.openTickets}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CalendarDays className="w-8 h-8 text-indigo-500 mr-3" />
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming Events</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.upcomingEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <TrendingUp className="w-5 h-5" />
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentChart data={departmentData} isDarkMode={isDarkMode} />
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <MapPin className="w-5 h-5" />
              Employee Geography
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorldMap data={countryData} isDarkMode={isDarkMode} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Events and Recent Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <CalendarDays className="w-5 h-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {event.title}
                        </h4>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                        </p>
                        {event.location && (
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.event_type}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Clock className="w-5 h-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentAttendance.length > 0 ? (
                recentAttendance.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div>
                      <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {session.employees?.full_name || 'Unknown Employee'}
                      </h4>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Check-in: {session.check_in_time}
                        {session.check_out_time && ` | Check-out: ${session.check_out_time}`}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        session.status === 'Present' ? 'text-green-600 border-green-600' : 
                        session.status === 'Late' ? 'text-yellow-600 border-yellow-600' : 
                        'text-gray-600 border-gray-600'
                      }`}
                    >
                      {session.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No attendance recorded today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
