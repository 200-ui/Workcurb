
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, User, Building, Briefcase, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const UserProfiles = () => {
  const { data: profiles, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-user-profiles'],
    queryFn: async () => {
      console.log('Fetching all user profiles for admin...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Profiles fetch error:', error);
        throw error;
      }
      console.log('Profiles fetched:', data?.length);
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  const handleRefresh = () => {
    console.log('Manually refreshing user profiles...');
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
          <p>Error loading user profiles: {error.message}</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Profiles</h1>
        <div className="flex items-center gap-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="text-sm text-gray-600">
            Total: {profiles?.length || 0} users
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {profiles?.map((profile) => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>{profile.full_name || 'No name provided'}</span>
                  <Badge variant={profile.user_type === 'hr' ? 'default' : 'secondary'}>
                    {profile.user_type?.toUpperCase() || 'USER'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.organization_name && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.organization_name}</span>
                  </div>
                )}
                {profile.designation && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.designation}</span>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">User ID</div>
                <div className="text-sm font-mono">{profile.id}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles?.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No user profiles yet</h3>
          <p className="text-gray-600">User profiles will appear here when users register.</p>
        </div>
      )}
    </div>
  );
};

export default UserProfiles;
