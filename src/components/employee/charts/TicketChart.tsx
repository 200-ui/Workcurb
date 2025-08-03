
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TicketChartProps {
  ticketData: any[];
  isDarkMode: boolean;
}

const TicketChart = ({ ticketData, isDarkMode }: TicketChartProps) => {
  const processTicketData = () => {
    const statusCounts = ticketData.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status,
      count: count
    }));
  };

  const data = processTicketData();

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="status" 
            tick={{ fill: isDarkMode ? '#ffffff' : '#374151' }}
          />
          <YAxis 
            tick={{ fill: isDarkMode ? '#ffffff' : '#374151' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
          <Bar dataKey="count" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketChart;
