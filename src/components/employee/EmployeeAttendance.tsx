
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Play, Square, Calendar, TrendingUp, Timer, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface EmployeeAttendanceProps {
  employee: any;
  employeeData: any;
  isDarkMode: boolean;
  onDataUpdate: () => void;
}

const EmployeeAttendance = ({ employee, employeeData, isDarkMode, onDataUpdate }: EmployeeAttendanceProps) => {
  const [todaySession, setTodaySession] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Get attendance data from employeeData instead of direct DB call
  const attendance = employeeData?.attendance || [];

  useEffect(() => {
    // Find today's session from the attendance data
    const today = new Date().toISOString().split('T')[0];
    const session = attendance.find((session: any) => session.attendance_date === today);
    setTodaySession(session || null);

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [attendance]);

  const handleCheckIn = async () => {
    if (!employee?.company_id) {
      toast.error("Company information not found");
      return;
    }
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      const { error } = await supabase
        .from('employee_attendance_sessions')
        .insert({
          employee_id: employee.id,
          company_id: employee.company_id,
          attendance_date: today,
          check_in_time: currentTime,
          session_number: 1,
          status: 'Present'
        });

      if (error) throw error;

      toast.success(`Successfully checked in at ${currentTime}`);
      onDataUpdate();
    } catch (error: any) {
      console.error('Check-in error:', error);
      if (error.message?.includes('row-level security')) {
        toast.error("Cannot clock in now, contact HR.");
      } else {
        toast.error(error.message || "Failed to check in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todaySession?.id) {
      toast.error("No active session found");
      return;
    }
    
    setLoading(true);
    try {
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      // Calculate hours worked
      const checkInTime = new Date(`2000-01-01T${todaySession.check_in_time}`);
      const checkOutTime = new Date(`2000-01-01T${currentTime}`);
      const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('employee_attendance_sessions')
        .update({
          check_out_time: currentTime,
          hours_worked: hoursWorked
        })
        .eq('id', todaySession.id);

      if (error) throw error;

      toast.success(`Successfully checked out at ${currentTime}. Hours worked: ${hoursWorked.toFixed(2)}`);
      onDataUpdate();
    } catch (error: any) {
      console.error('Check-out error:', error);
      if (error.message?.includes('row-level security')) {
        toast.error("Cannot clock out now, contact HR.");
      } else {
        toast.error(error.message || "Failed to check out");
      }
    } finally {
      setLoading(false);
    }
  };

  const canCheckIn = !todaySession;
  const canCheckOut = todaySession && !todaySession.check_out_time;

  // Calculate total hours worked from attendance data
  const getTotalHoursWorked = () => {
    return attendance.reduce((total: number, session: any) => {
      return total + (session.hours_worked || 0);
    }, 0);
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Time & Attendance
      </h1>

      {/* Live Clock Card - Made Smaller */}
      <Card className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'} shadow-lg`}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <Clock className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Current Time
            </h2>
          </div>
          <div className={`text-2xl font-mono font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
            {formatTime(currentTime)}
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today's Status</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {canCheckOut ? 'Working' : todaySession ? 'Completed' : 'Not Started'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${canCheckOut ? 'bg-green-100' : todaySession ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {canCheckOut ? (
                  <Timer className={`w-6 h-6 ${canCheckOut ? 'text-green-600' : 'text-gray-600'}`} />
                ) : todaySession ? (
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hours Today</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {todaySession?.hours_worked ? todaySession.hours_worked.toFixed(1) : '0.0'}h
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getTotalHoursWorked().toFixed(1)}h
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check In/Out Controls */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Timer className="w-5 h-5 mr-2" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {todaySession && (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      todaySession.check_out_time ? 'bg-blue-500' : 'bg-green-500'
                    } text-white`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Current Session
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        In: {todaySession.check_in_time} {todaySession.check_out_time && `• Out: ${todaySession.check_out_time}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={todaySession.check_out_time ? "default" : "outline"} className="text-sm">
                    {todaySession.status}
                  </Badge>
                </div>
              </div>
            )}
            
            <div className="flex space-x-4">
              {canCheckIn && (
                <Button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {loading ? 'Checking In...' : 'Check In'}
                </Button>
              )}
              {canCheckOut && (
                <Button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3"
                  size="lg"
                >
                  <Square className="w-5 h-5 mr-2" />
                  {loading ? 'Checking Out...' : 'Check Out'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendance;
