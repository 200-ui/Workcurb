import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Users, Plus, Trash2, CheckCircle, AlertCircle, User, RefreshCw } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { format, startOfWeek, addDays } from 'date-fns';

interface ShiftSchedule {
  id: string;
  schedule_name: string;
  week_start_date: string;
  week_end_date: string;
  status: string;
  created_at: string;
  shift_count?: number;
}

interface EmployeeShift {
  id: string;
  employee_id: string;
  employee_name: string;
  shift_date: string;
  shift_type: string;
  shift_start_time: string;
  shift_end_time: string;
  status: string;
}

interface ShiftScheduleProps {
  isDarkMode: boolean;
}

const ShiftSchedule = ({ isDarkMode }: ShiftScheduleProps) => {
  const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [shifts, setShifts] = useState<EmployeeShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [scheduleName, setScheduleName] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    if (selectedSchedule) {
      loadScheduleShifts(selectedSchedule);
    }
  }, [selectedSchedule]);

  const loadSchedules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shift_schedules')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count shifts for each schedule
      const schedulesWithCounts = await Promise.all(
        (data || []).map(async (schedule) => {
          const { count } = await supabase
            .from('employee_shifts')
            .select('*', { count: 'exact', head: true })
            .eq('schedule_id', schedule.id);
          
          return {
            ...schedule,
            shift_count: count || 0
          };
        })
      );

      setSchedules(schedulesWithCounts);
    } catch (error: any) {
      console.error('Error loading schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load shift schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleShifts = async (scheduleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get all shifts for this schedule
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('employee_shifts')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('shift_date', { ascending: true });

      if (shiftsError) throw shiftsError;

      console.log('Loaded shifts data:', shiftsData);

      if (!shiftsData || shiftsData.length === 0) {
        setShifts([]);
        return;
      }

      // Get unique employee IDs
      const employeeIds = [...new Set(shiftsData.map(shift => shift.employee_id))];
      
      // Fetch employee details separately
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, full_name, department')
        .in('id', employeeIds)
        .eq('created_by', user.id);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        // Continue with shifts but without employee names
      }

      console.log('Loaded employees data:', employeesData);

      // Create employee lookup map
      const employeeLookup = (employeesData || []).reduce((acc, emp) => {
        acc[emp.id] = emp.full_name;
        return acc;
      }, {} as Record<string, string>);

      // Combine shifts with employee names
      const shiftsWithNames = shiftsData.map((shift) => ({
        ...shift,
        employee_name: employeeLookup[shift.employee_id] || 'Unknown Employee'
      }));

      console.log('Final shifts with names:', shiftsWithNames);
      setShifts(shiftsWithNames);

    } catch (error: any) {
      console.error('Error loading shifts:', error);
      toast({
        title: "Error",
        description: "Failed to load shift details",
        variant: "destructive",
      });
    }
  };

  const generateSchedule = async () => {
    if (!scheduleName.trim() || !weekStartDate) {
      toast({
        title: "Validation Error",
        description: "Please provide schedule name and week start date",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure week start is Monday
      const startDate = startOfWeek(new Date(weekStartDate), { weekStartsOn: 1 });
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');

      console.log('Generating schedule with params:', {
        company_id: user.id,
        schedule_name: scheduleName,
        week_start_date: formattedStartDate
      });

      const { data, error } = await supabase.functions.invoke('generate-shift-schedule', {
        body: {
          company_id: user.id,
          schedule_name: scheduleName,
          week_start_date: formattedStartDate
        }
      });

      if (error) throw error;

      console.log('Schedule generation result:', data);

      toast({
        title: "Success",
        description: data.message || "Shift schedule generated successfully with employee assignments!",
      });

      setScheduleName('');
      setWeekStartDate('');
      await loadSchedules();

    } catch (error: any) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate shift schedule",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const regenerateSchedule = async (scheduleId: string) => {
    setRegenerating(scheduleId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First delete existing shifts for this schedule
      const { error: deleteError } = await supabase
        .from('employee_shifts')
        .delete()
        .eq('schedule_id', scheduleId);

      if (deleteError) throw deleteError;

      // Get the schedule details
      const { data: schedule, error: scheduleError } = await supabase
        .from('shift_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (scheduleError) throw scheduleError;

      // Reset schedule status to draft
      const { error: updateError } = await supabase
        .from('shift_schedules')
        .update({ 
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId);

      if (updateError) throw updateError;

      // Generate fresh shifts
      const { data, error } = await supabase.functions.invoke('generate-shift-schedule', {
        body: {
          company_id: user.id,
          schedule_name: schedule.schedule_name,
          week_start_date: schedule.week_start_date,
          schedule_id: scheduleId, // Pass existing schedule ID to reuse
          regenerate: true // Flag to indicate this is a regeneration
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shift schedule regenerated successfully with fresh timings!",
      });

      await loadSchedules();
      if (selectedSchedule === scheduleId) {
        await loadScheduleShifts(scheduleId);
      }

    } catch (error: any) {
      console.error('Error regenerating schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate shift schedule",
        variant: "destructive",
      });
    } finally {
      setRegenerating(null);
    }
  };

  const assignSchedule = async (scheduleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('assign-shift-schedule', {
        body: {
          schedule_id: scheduleId,
          company_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shift schedule assigned to all employees!",
      });

      loadSchedules();
      if (selectedSchedule === scheduleId) {
        loadScheduleShifts(scheduleId);
      }

    } catch (error: any) {
      console.error('Error assigning schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign shift schedule",
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('shift_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shift schedule deleted successfully",
      });

      if (selectedSchedule === scheduleId) {
        setSelectedSchedule(null);
        setShifts([]);
      }
      loadSchedules();

    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift schedule",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'morning': return 'bg-green-100 text-green-800';
      case 'afternoon': return 'bg-blue-100 text-blue-800';
      case 'evening': return 'bg-orange-100 text-orange-800';
      case 'night': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupShiftsByDate = (shifts: EmployeeShift[]) => {
    return shifts.reduce((groups, shift) => {
      const date = shift.shift_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(shift);
      return groups;
    }, {} as Record<string, EmployeeShift[]>);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading shift schedules...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Shift Schedule Management
        </h1>
      </div>

      {/* Generate New Schedule */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Plus className="w-5 h-5" />
            <span>Generate New Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Schedule name (e.g., Week 1 - January)"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
              />
            </div>
            <div>
              <Input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
              />
            </div>
            <Button 
              onClick={generateSchedule} 
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generating ? 'Generating...' : 'Generate Schedule'}
            </Button>
          </div>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            The system will automatically assign 5 working days per employee with fresh shift timings.
          </p>
        </CardContent>
      </Card>

      {/* Existing Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedules List */}
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="w-5 h-5" />
              <span>Schedule History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedules.length === 0 ? (
                <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No shift schedules created yet.
                </p>
              ) : (
                schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSchedule === schedule.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500' 
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSchedule(schedule.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {schedule.schedule_name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {format(new Date(schedule.week_start_date), 'MMM dd')} - {format(new Date(schedule.week_end_date), 'MMM dd, yyyy')}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getStatusColor(schedule.status)}>
                            {schedule.status}
                          </Badge>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {schedule.shift_count} shifts
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            regenerateSchedule(schedule.id);
                          }}
                          disabled={regenerating === schedule.id}
                          className="text-orange-500 border-orange-500 hover:bg-orange-50"
                        >
                          {regenerating === schedule.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                        {schedule.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              assignSchedule(schedule.id);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSchedule(schedule.id);
                          }}
                          className="text-red-500 border-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Details */}
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Users className="w-5 h-5" />
              <span>Employee Shift Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedSchedule ? (
              <div className="flex items-center justify-center h-64">
                <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a schedule to view employee assignments</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupShiftsByDate(shifts)).map(([date, dateShifts]) => (
                  <div key={date}>
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {format(new Date(date), 'EEEE, MMM dd')}
                    </h4>
                    <div className="space-y-2 ml-4">
                      {dateShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {shift.employee_name}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getShiftTypeColor(shift.shift_type)}>
                                  {shift.shift_type}
                                </Badge>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {shift.shift_start_time.slice(0, 5)} - {shift.shift_end_time.slice(0, 5)}
                                </span>
                                <Badge variant="outline" className={`text-xs ${
                                  shift.status === 'confirmed' ? 'border-green-500 text-green-600' : 
                                  shift.status === 'scheduled' ? 'border-yellow-500 text-yellow-600' : 
                                  'border-gray-500 text-gray-600'
                                }`}>
                                  {shift.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {shifts.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No shifts found for this schedule
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShiftSchedule;
