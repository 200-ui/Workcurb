
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Clock, BookOpen, FileText, TrendingUp, Users, Award } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import PerformancePieChart from './charts/PerformancePieChart';
import UpcomingShiftsChart from './charts/UpcomingShiftsChart';

interface EmployeeOverviewProps {
  employee: any;
  employeeData: any;
  isDarkMode: boolean;
}

const EmployeeOverview = ({ employee, employeeData, isDarkMode }: EmployeeOverviewProps) => {
  const getTotalShifts = () => {
    const shifts = employeeData?.shifts || [];
    return shifts.length;
  };

  const getUpcomingShifts = () => {
    const shifts = employeeData?.shifts || [];
    const now = new Date();
    return shifts.filter((shift: any) => new Date(shift.shift_date) > now).length;
  };

  const getCompletedCourses = () => {
    const courses = employeeData?.courses || [];
    return courses.filter((course: any) => course.status === 'Completed').length;
  };

  const getPendingLeaveRequests = () => {
    const leaveRequests = employeeData?.leave_requests || [];
    return leaveRequests.filter((request: any) => request.status === 'pending').length;
  };

  const getLatestPerformance = () => {
    const performance = employeeData?.performance || [];
    if (performance.length === 0) return 0;
    const latest = performance.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return latest.overall_percentage || 0;
  };

  const getOpenTickets = () => {
    const tickets = employeeData?.tickets || [];
    return tickets.filter((ticket: any) => ticket.status !== 'closed').length;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {employee?.full_name || 'Employee'}!
          </h1>
          <p className={`text-lg mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Here's what's happening with your work today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Shifts</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getTotalShifts()}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming Shifts</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getUpcomingShifts()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed Courses</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getCompletedCourses()}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Leave</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getPendingLeaveRequests()}
                </p>
              </div>
              <FileText className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Performance</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getLatestPerformance()}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Open Tickets</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getOpenTickets()}
                </p>
              </div>
              <Users className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance and Shifts Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <TrendingUp className="w-5 h-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformancePieChart 
              performanceData={employeeData?.performance || []} 
              isDarkMode={isDarkMode} 
            />
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="w-5 h-5" />
              Upcoming Shifts (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingShiftsChart 
              shiftsData={employeeData?.shifts || []} 
              isDarkMode={isDarkMode} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeOverview;
