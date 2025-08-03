
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WorldMapProps {
  data: any[];
  isDarkMode: boolean;
}

const WorldMap = ({ data, isDarkMode }: WorldMapProps) => {
  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Employee Locations (by Country)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
            <XAxis 
              dataKey="country" 
              tick={{ fill: isDarkMode ? '#ffffff' : '#374151' }}
              axisLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
            />
            <YAxis 
              tick={{ fill: isDarkMode ? '#ffffff' : '#374151' }}
              axisLine={{ stroke: isDarkMode ? '#6B7280' : '#9CA3AF' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: isDarkMode ? '#ffffff' : '#000000'
              }}
            />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorldMap;
