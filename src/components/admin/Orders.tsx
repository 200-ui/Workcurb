
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ShoppingCart, User, Building, Mail, CreditCard, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const Orders = () => {
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      console.log('Fetching all orders for admin...');
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Orders fetch error:', error);
        throw error;
      }
      console.log('Orders fetched:', data?.length);
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  const handleRefresh = () => {
    console.log('Manually refreshing orders...');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading orders: {error.message}</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Orders: {orders?.length || 0}</div>
            <div className="text-lg font-bold text-green-600">Total Revenue: NPR {totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {orders?.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  <span>{order.buyer_name || 'Unknown Buyer'}</span>
                  <Badge variant="secondary" className="ml-2">
                    {order.status || 'completed'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{order.buyer_email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{order.organization_name || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{order.buyer_designation || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">NPR {order.total_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-purple-700">Plan:</span>
                    <p className="text-purple-600 capitalize">{order.plan_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Duration:</span>
                    <p className="text-blue-600">{order.billing_months} month{order.billing_months > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Price per month:</span>
                    <p className="text-green-600">NPR {order.plan_price.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {order.user_id && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">User ID</div>
                  <div className="text-sm font-mono">{order.user_id}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {orders?.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Orders will appear here when customers make purchases.</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
