
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Clock, User, Building, Phone, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CallBookings = () => {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['call-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('call_bookings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-bookings'] });
      toast.success('Call booking deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting call booking:', error);
      toast.error('Failed to delete call booking');
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this call booking?')) {
      deleteMutation.mutate(id);
    }
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
          Error loading call bookings. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Call Bookings</h1>
        <div className="text-sm text-gray-600">
          Total: {bookings?.length || 0} bookings
        </div>
      </div>

      <div className="grid gap-6">
        {bookings?.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>{booking.full_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(booking.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{booking.email}</span>
                </div>
                {booking.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{booking.phone}</span>
                  </div>
                )}
                {booking.company && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{booking.company}</span>
                  </div>
                )}
                {booking.preferred_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(booking.preferred_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {booking.preferred_time && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{booking.preferred_time}</span>
                  </div>
                )}
              </div>
              {booking.message && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Message:</h4>
                  <p className="text-sm text-gray-600">{booking.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {bookings?.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No call bookings yet</h3>
          <p className="text-gray-600">Call bookings will appear here when customers book calls.</p>
        </div>
      )}
    </div>
  );
};

export default CallBookings;
