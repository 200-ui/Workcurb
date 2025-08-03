
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format, isWithinInterval, startOfWeek, endOfWeek, parseISO } from 'date-fns';

interface EmployeeShiftScheduleProps {
  employee: any;
  employeeData: any;
  isDarkMode: boolean;
}

const EmployeeShiftSchedule = ({ employee, employeeData, isDarkMode }: EmployeeShiftScheduleProps) => {
  // Get shifts from employeeData instead of employee object
  const shifts = employeeData?.shifts || [];

  const getCurrentWeekShifts = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    return shifts.filter((shift: any) => {
      const shiftDate = parseISO(shift.shift_date);
      return isWithinInterval(shiftDate, { start: weekStart, end: weekEnd });
    });
  };

  const getUpcomingShifts = () => {
    const today = new Date();
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    
    return shifts.filter((shift: any) => {
      const shiftDate = parseISO(shift.shift_date);
      return shiftDate > weekEnd;
    }).slice(0, 10); // Limit to next 10 shifts
  };

  const currentWeekShifts = getCurrentWeekShifts();
  const upcomingShifts = getUpcomingShifts();

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType?.toLowerCase()) {
      case 'morning': return 'bg-yellow-100 text-yellow-800';
      case 'afternoon': return 'bg-blue-100 text-blue-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      case 'night': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not specified';
    // Handle both HH:MM and HH:MM:SS formats
    return timeString.substring(0, 5);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        My Shift Schedule
      </h1>

      {/* Current Week Shifts */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            This Week's Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentWeekShifts.length > 0 ? (
            <div className="space-y-4">
              {currentWeekShifts.map((shift: any) => (
                <div key={shift.id} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {format(parseISO(shift.shift_date), 'EEEE, MMMM dd')}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatTime(shift.shift_start_time)} - {formatTime(shift.shift_end_time)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getShiftTypeColor(shift.shift_type)}>
                        {shift.shift_type}
                      </Badge>
                      <Badge variant={shift.status === 'scheduled' ? 'default' : 'secondary'}>
                        {shift.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No shifts scheduled for this week</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Shifts */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            Upcoming Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingShifts.length > 0 ? (
            <div className="space-y-4">
              {upcomingShifts.map((shift: any) => (
                <div key={shift.id} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {format(parseISO(shift.shift_date), 'EEEE, MMMM dd')}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatTime(shift.shift_start_time)} - {formatTime(shift.shift_end_time)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getShiftTypeColor(shift.shift_type)}>
                        {shift.shift_type}
                      </Badge>
                      <Badge variant={shift.status === 'scheduled' ? 'default' : 'secondary'}>
                        {shift.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming shifts scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeShiftSchedule;
