
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DepartmentChartProps {
  data: any[];
  isDarkMode: boolean;
}

const DepartmentChart = ({ data, isDarkMode }: DepartmentChartProps) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              color: isDarkMode ? '#ffffff' : '#000000',
              fontSize: '14px'
            }}
          />
          <Legend 
            wrapperStyle={{
              color: isDarkMode ? '#ffffff' : '#000000',
              fontSize: '14px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentChart;
