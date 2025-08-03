
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '../../integrations/supabase/client';

interface DepartmentChartProps {
  isDarkMode: boolean;
}

const DepartmentChart = ({ isDarkMode }: DepartmentChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employees, error } = await supabase
        .from('employees')
        .select('department')
        .eq('created_by', user.id)
        .eq('is_active', true);

      if (error) throw error;

      // Group employees by department
      const departmentCount = employees.reduce((acc: any, emp: any) => {
        const dept = emp.department || 'No Department';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(departmentCount).map(([name, value]) => ({
        name,
        value,
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error fetching department data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Loading...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No data available
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={60}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
            border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
            borderRadius: '6px',
            color: isDarkMode ? '#ffffff' : '#000000'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DepartmentChart;
