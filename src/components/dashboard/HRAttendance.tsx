
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Calendar, Clock, Users, TrendingUp, Download, Trash2 } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';

interface HRAttendanceProps {
  isDarkMode: boolean;
}

const HRAttendance = ({ isDarkMode }: HRAttendanceProps) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceData();
    
    // Real-time subscription for attendance updates
    const channel = supabase
      .channel('hr_attendance_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employee_attendance_sessions' },
        () => {
          fetchAttendanceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedEmployee, selectedDate]);

  const fetchEmployees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('employee_attendance_sessions')
        .select(`
          *,
          employees!inner (
            id,
            full_name,
            employee_id,
            department,
            designation
          )
        `)
        .eq('attendance_date', selectedDate)
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedEmployee !== 'all') {
        query = query.eq('employee_id', selectedEmployee);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAttendanceData(data || []);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAttendanceSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('employee_attendance_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Session Deleted",
        description: "Attendance session has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAttendanceStats = () => {
    const totalEmployees = employees.length;
    const employeesWithAttendance = new Set(attendanceData.map(a => a.employee_id)).size;
    const totalHours = attendanceData.reduce((sum, session) => sum + (session.hours_worked || 0), 0);
    const avgHours = employeesWithAttendance > 0 ? totalHours / employeesWithAttendance : 0;

    return {
      totalEmployees,
      presentEmployees: employeesWithAttendance,
      absentEmployees: totalEmployees - employeesWithAttendance,
      totalHours: totalHours.toFixed(1),
      averageHours: avgHours.toFixed(1)
    };
  };

  const stats = getAttendanceStats();

  const exportAttendance = () => {
    const csvData = attendanceData.map(session => ({
      'Employee Name': session.employees.full_name,
      'Employee ID': session.employees.employee_id,
      'Department': session.employees.department,
      'Date': session.attendance_date,
      'Check In': session.check_in_time,
      'Check Out': session.check_out_time || 'N/A',
      'Hours Worked': session.hours_worked || 0,
      'Status': session.status
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Employee Attendance
        </h1>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`px-3 py-2 border rounded-md w-full sm:w-auto ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          
          <Button onClick={exportAttendance} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Employees</p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalEmployees}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Present</p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.presentEmployees}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Absent</p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.absentEmployees}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalHours}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              <div className="ml-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Hours</p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.averageHours}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Sessions */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={`text-lg sm:text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Attendance Sessions - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.length === 0 ? (
              <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No attendance records found for the selected date and employee.
              </p>
            ) : (
              attendanceData.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                          session.status === 'Present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {session.employees.full_name.charAt(0)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {session.employees.full_name}
                        </h3>
                        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {session.employees.employee_id} • {session.employees.department}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Check In</p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {session.check_in_time}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Check Out</p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {session.check_out_time || 'Active'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hours</p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {session.hours_worked ? session.hours_worked.toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                          <Badge variant={session.status === 'Present' ? 'default' : 'destructive'}>
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => deleteAttendanceSession(session.id)}
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRAttendance;
