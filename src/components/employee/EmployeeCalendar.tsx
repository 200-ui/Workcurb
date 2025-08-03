
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon, MapPin, Clock, Users } from 'lucide-react';

interface EmployeeCalendarProps {
  employee: any;
  employeeData: any;
  isDarkMode: boolean;
}

const EmployeeCalendar = ({ employee, employeeData, isDarkMode }: EmployeeCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([]);

  // Get events and notices from employeeData
  const events = employeeData?.events || [];
  const notices = employeeData?.notices || [];
  
  // Combine events and notices for calendar display
  const allCalendarItems = [...events, ...notices];

  console.log('Events data:', events);
  console.log('Employee data:', employeeData);

  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      // Filter events for the selected date
      const eventsForDate = events.filter((event: any) => {
        if (event.event_date) {
          return event.event_date === dateString;
        }
        return false;
      });

      // Filter notices for the selected date
      const noticesForDate = notices.filter((notice: any) => {
        if (notice.created_at) {
          const noticeDate = new Date(notice.created_at).toISOString().split('T')[0];
          return noticeDate === dateString;
        }
        return false;
      });

      // Combine both for display
      setSelectedDateEvents([...eventsForDate, ...noticesForDate]);
    }
  }, [selectedDate, events, notices]);

  const getEventTypeColor = (item: any) => {
    // For events, use event_type, for notices use priority
    const type = item.event_type || item.priority;
    const colors = {
      'meeting': 'bg-blue-100 text-blue-800',
      'training': 'bg-green-100 text-green-800',
      'conference': 'bg-purple-100 text-purple-800',
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Normal': 'bg-green-100 text-green-800',
      'Low': 'bg-blue-100 text-blue-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCalendarDates = () => {
    const eventDates = events.map((event: any) => new Date(event.event_date));
    const noticeDates = notices.map((notice: any) => new Date(notice.created_at));
    return [...eventDates, ...noticeDates];
  };

  const getUpcomingItems = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingEvents = events
      .filter((event: any) => new Date(event.event_date) >= today)
      .slice(0, 3);
      
    const upcomingNotices = notices
      .filter((notice: any) => new Date(notice.created_at) >= today)
      .slice(0, 2);

    return [...upcomingEvents, ...upcomingNotices]
      .sort((a, b) => {
        const dateA = new Date(a.event_date || a.created_at);
        const dateB = new Date(b.event_date || b.created_at);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Calendar
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <CalendarIcon className="w-5 h-5 mr-2" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={`rounded-md border w-full max-w-md ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                modifiers={{
                  hasEvent: getCalendarDates()
                }}
                modifiersClassNames={{
                  hasEvent: "bg-blue-100 text-blue-900 font-bold"
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {selectedDate ? 
                `Events on ${selectedDate.toLocaleDateString()}` : 
                'Select a date'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No events for this date
                </p>
              ) : (
                selectedDateEvents.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.title}
                        </h4>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {item.description || item.content}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {item.event_time || new Date(item.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          {item.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {item.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getEventTypeColor(item)}>
                        {item.event_type || item.priority}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Users className="w-5 h-5 mr-2" />
            Upcoming Events & Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getUpcomingItems().length === 0 ? (
              <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No upcoming events or notices
              </p>
            ) : (
              getUpcomingItems().map((item: any) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(item.event_date || item.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.event_time || new Date(item.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.description || item.content}
                      </p>
                      {item.location && (
                        <p className={`text-xs flex items-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getEventTypeColor(item)}>
                    {item.event_type || item.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeCalendar;
