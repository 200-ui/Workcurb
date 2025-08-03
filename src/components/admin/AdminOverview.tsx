
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, MessageSquare, ShoppingCart, Users, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

const AdminOverview = () => {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      console.log('Fetching admin overview stats...');
      
      const [bookingsRes, contactsRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from('call_bookings').select('*'),
        supabase.from('contact_submissions').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('profiles').select('*')
      ]);

      console.log('Overview - Bookings:', bookingsRes.data?.length || 0);
      console.log('Overview - Contacts:', contactsRes.data?.length || 0);
      console.log('Overview - Orders:', ordersRes.data?.length || 0);
      console.log('Overview - Profiles:', profilesRes.data?.length || 0);

      // Process bookings by month
      const bookingsByMonth = bookingsRes.data?.reduce((acc: any, booking) => {
        const month = new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {}) || {};

      // Process orders by plan
      const ordersByPlan = ordersRes.data?.reduce((acc: any, order) => {
        acc[order.plan_name] = (acc[order.plan_name] || 0) + 1;
        return acc;
      }, {}) || {};

      const chartData = Object.keys(bookingsByMonth).map(month => ({
        month,
        bookings: bookingsByMonth[month]
      }));

      const pieData = Object.keys(ordersByPlan).map(plan => ({
        name: plan.charAt(0).toUpperCase() + plan.slice(1),
        value: ordersByPlan[plan]
      }));

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      return {
        totalBookings: bookingsRes.data?.length || 0,
        totalContacts: contactsRes.data?.length || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalProfiles: profilesRes.data?.length || 0,
        chartData,
        pieData,
        totalRevenue
      };
    },
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const handleRefresh = () => {
    console.log('Manually refreshing admin overview...');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <div className="flex items-center gap-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <p className="text-gray-600">Welcome to Workcurb Admin Dashboard</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Call Bookings</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings}</div>
            <p className="text-xs text-blue-100">Total bookings received</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Submissions</CardTitle>
            <MessageSquare className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContacts}</div>
            <p className="text-xs text-green-100">Messages from visitors</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders}</div>
            <p className="text-xs text-purple-100">Successful purchases</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Profiles</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProfiles}</div>
            <p className="text-xs text-orange-100">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Call Bookings by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.pieData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.pieData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            NPR {stats?.totalRevenue?.toLocaleString() || 0}
          </div>
          <p className="text-gray-600">Total revenue from all orders</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
