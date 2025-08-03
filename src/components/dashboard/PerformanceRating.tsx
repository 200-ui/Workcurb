import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Star, Users, Plus, Edit } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';

interface PerformanceRatingProps {
  isDarkMode: boolean;
}

const PerformanceRating = ({ isDarkMode }: PerformanceRatingProps) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [performanceRatings, setPerformanceRatings] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [editingRating, setEditingRating] = useState<any>(null);
  const [rating, setRating] = useState({
    productivity: 0,
    quality: 0,
    teamwork: 0,
    punctuality: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
    loadPerformanceRatings();
    
    // Set up real-time subscriptions
    const performanceChannel = supabase
      .channel('performance_ratings_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'performance_ratings' },
        () => loadPerformanceRatings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(performanceChannel);
    };
  }, []);

  const loadEmployees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Error loading employees:', error);
    }
  };

  const loadPerformanceRatings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('performance_ratings')
        .select(`
          *,
          employees:employee_id (
            id,
            full_name,
            department,
            designation
          )
        `)
        .eq('rated_by', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPerformanceRatings(data || []);
    } catch (error: any) {
      console.error('Error loading performance ratings:', error);
    }
  };

  const openUpdateModal = (performanceRating: any) => {
    setEditingRating(performanceRating);
    setSelectedEmployee(performanceRating.employee_id);
    setRating({
      productivity: performanceRating.productivity || 0,
      quality: performanceRating.quality || 0,
      teamwork: performanceRating.teamwork || 0,
      punctuality: performanceRating.punctuality || 0
    });
    setIsRatingModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingRating(null);
    setSelectedEmployee('');
    setRating({ productivity: 0, quality: 0, teamwork: 0, punctuality: 0 });
    setIsRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive"
      });
      return;
    }

    if (rating.productivity === 0 || rating.quality === 0 || rating.teamwork === 0 || rating.punctuality === 0) {
      toast({
        title: "Error",
        description: "Please rate all parameters (1-10)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ratingData = {
        employee_id: selectedEmployee,
        productivity: rating.productivity,
        quality: rating.quality,
        teamwork: rating.teamwork,
        punctuality: rating.punctuality,
        rated_by: user.id,
        company_id: user.id
      };

      let error;
      if (editingRating) {
        // Update existing rating
        const result = await supabase
          .from('performance_ratings')
          .update(ratingData)
          .eq('id', editingRating.id);
        error = result.error;
      } else {
        // Create new rating
        const result = await supabase
          .from('performance_ratings')
          .upsert(ratingData);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: editingRating ? "Performance rating updated successfully" : "Performance rating submitted successfully",
      });

      setIsRatingModalOpen(false);
      setSelectedEmployee('');
      setEditingRating(null);
      setRating({ productivity: 0, quality: 0, teamwork: 0, punctuality: 0 });
      loadPerformanceRatings();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit performance rating",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Average';
    if (percentage >= 60) return 'Below Average';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Performance Ratings
        </h2>
        <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Rate Employee
            </Button>
          </DialogTrigger>
          <DialogContent className={`max-w-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <DialogHeader>
              <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {editingRating ? 'Update Employee Performance' : 'Rate Employee Performance'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Employee
                </label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={!!editingRating}>
                  <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Productivity (1-10)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={rating.productivity || ''}
                    onChange={(e) => setRating({...rating, productivity: parseInt(e.target.value) || 0})}
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quality (1-10)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={rating.quality || ''}
                    onChange={(e) => setRating({...rating, quality: parseInt(e.target.value) || 0})}
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Teamwork (1-10)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={rating.teamwork || ''}
                    onChange={(e) => setRating({...rating, teamwork: parseInt(e.target.value) || 0})}
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Punctuality (1-10)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={rating.punctuality || ''}
                    onChange={(e) => setRating({...rating, punctuality: parseInt(e.target.value) || 0})}
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRatingModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitRating} disabled={loading}>
                  {loading ? 'Saving...' : (editingRating ? 'Update Rating' : 'Submit Rating')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceRatings.map((rating) => (
          <Card key={rating.id} className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {rating.employees?.full_name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {rating.employees?.department} - {rating.employees?.designation}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-8 w-8 text-yellow-500" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openUpdateModal(rating)}
                    className="p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center mb-4">
                <div className={`text-3xl font-bold ${rating.overall_percentage >= 80 ? 'text-green-600' : rating.overall_percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {rating.overall_percentage || 0}%
                </div>
                <Badge className={getPerformanceColor(rating.overall_percentage || 0)}>
                  {getPerformanceLabel(rating.overall_percentage || 0)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Productivity:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {rating.productivity}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Quality:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {rating.quality}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Teamwork:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {rating.teamwork}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Punctuality:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {rating.punctuality}/10
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-center">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Updated: {new Date(rating.updated_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {performanceRatings.length === 0 && (
        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Performance Ratings Yet</h3>
          <p className="text-sm">Start by rating your employees' performance to see analytics here.</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceRating;
