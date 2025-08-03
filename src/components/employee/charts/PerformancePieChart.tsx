
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PerformancePieChartProps {
  performanceData: any[];
  isDarkMode: boolean;
}

const PerformancePieChart = ({ performanceData, isDarkMode }: PerformancePieChartProps) => {
  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No performance data available
        </p>
      </div>
    );
  }

  // Get the latest performance data
  const latestPerformance = performanceData
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const chartData = [
    { name: 'Productivity', value: latestPerformance.productivity || 0, color: '#3B82F6' },
    { name: 'Quality', value: latestPerformance.quality || 0, color: '#10B981' },
    { name: 'Teamwork', value: latestPerformance.teamwork || 0, color: '#F59E0B' },
    { name: 'Punctuality', value: latestPerformance.punctuality || 0, color: '#EF4444' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">Score: {payload[0].value}/10</p>
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

export default PerformancePieChart;
