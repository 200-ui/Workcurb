
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  performanceData: any[];
  isDarkMode: boolean;
}

const PerformanceChart = ({ performanceData, isDarkMode }: PerformanceChartProps) => {
  // Prepare data for bar chart - show all performance ratings with proper ordering
  const chartData = performanceData
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((performance, index) => ({
      name: `Rating ${index + 1}`,
      percentage: performance.overall_percentage || 0,
      date: new Date(performance.created_at).toLocaleDateString(),
      productivity: performance.productivity || 0,
      quality: performance.quality || 0,
      teamwork: performance.teamwork || 0,
      punctuality: performance.punctuality || 0
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No performance data available
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
        />
        <YAxis 
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
            border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderRadius: '8px'
          }}
          formatter={(value: any, name: any) => {
            if (name === 'percentage') return [`${value}%`, 'Overall Performance'];
            return [`${value}/10`, name.charAt(0).toUpperCase() + name.slice(1)];
          }}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return `${label} - Date: ${payload[0].payload.date}`;
            }
            return label;
          }}
        />
        <Bar dataKey="percentage" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
