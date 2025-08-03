
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface UpcomingShiftsChartProps {
  shiftsData: any[];
  isDarkMode: boolean;
}

const UpcomingShiftsChart = ({ shiftsData, isDarkMode }: UpcomingShiftsChartProps) => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  // Filter upcoming shifts within the current week
  const upcomingShifts = shiftsData.filter((shift: any) => {
    const shiftDate = new Date(shift.shift_date);
    return shiftDate > now && isWithinInterval(shiftDate, { start: weekStart, end: weekEnd });
  });

  if (upcomingShifts.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No upcoming shifts this week
        </p>
      </div>
    );
  }

  // Group shifts by type
  const shiftTypes = upcomingShifts.reduce((acc: any, shift: any) => {
    const type = shift.shift_type || 'Regular';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(shiftTypes).map(([type, count], index) => ({
    name: type,
    value: count as number,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">Shifts: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{
            color: isDarkMode ? '#ffffff' : '#000000'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default UpcomingShiftsChart;
