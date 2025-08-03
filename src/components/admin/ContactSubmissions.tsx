
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MessageSquare, User, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ContactSubmissions = () => {
  const queryClient = useQueryClient();

  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      toast.success('Contact submission deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting contact submission:', error);
      toast.error('Failed to delete contact submission');
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact submission?')) {
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
          Error loading contact submissions. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
        <div className="text-sm text-gray-600">
          Total: {contacts?.length || 0} submissions
        </div>
      </div>

      <div className="grid gap-6">
        {contacts?.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-green-600" />
                  <span>{contact.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{contact.email}</span>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-1">Subject:</h4>
                <p className="text-sm text-blue-600">{contact.subject}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Message:</h4>
                <p className="text-sm text-gray-600">{contact.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts?.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contact submissions yet</h3>
          <p className="text-gray-600">Contact submissions will appear here when visitors contact you.</p>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions;
