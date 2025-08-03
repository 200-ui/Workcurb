
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TrendingUp, Users, Award, Target } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PerformanceRating from './PerformanceRating';

interface Employee {
  id: string;
  full_name: string;
  department: string;
}

interface PerformanceRating {
  id: string;
  employee_id: string;
  productivity: number;
  quality: number;
  teamwork: number;
  punctuality: number;
  overall_percentage: number;
  created_at: string;
  employees?: Employee;
}

interface PerformanceProps {
  isDarkMode: boolean;
}

const Performance = ({ isDarkMode }: PerformanceProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [performanceRatings, setPerformanceRatings] = useState<PerformanceRating[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [loading, setLoading] = useState(true);
  const [topPerformer, setTopPerformer] = useState<string>('');
  const [bestDepartment, setBestDepartment] = useState<string>('');

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const performanceChannel = supabase
      .channel('performance_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'performance_ratings' },
        () => loadPerformanceRatings()
      )
      .subscribe();

    const employeesChannel = supabase
      .channel('employees_performance')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employees' },
        () => loadEmployees()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(performanceChannel);
      supabase.removeChannel(employeesChannel);
    };
  }, []);

  useEffect(() => {
    // Calculate top performer and best department when data changes
    calculateTopPerformer();
    calculateBestDepartment();
  }, [performanceRatings, employees]);

  const loadData = async () => {
    await Promise.all([loadEmployees(), loadPerformanceRatings()]);
    setLoading(false);
  };

  const loadEmployees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, department')
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
            department
          )
        `)
        .eq('rated_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPerformanceRatings(data || []);
    } catch (error: any) {
      console.error('Error loading performance ratings:', error);
    }
  };

  const calculateTopPerformer = () => {
    if (performanceRatings.length === 0) {
      setTopPerformer('No data available');
      return;
    }

    // Get latest rating for each employee
    const latestRatings = new Map();
    performanceRatings.forEach(rating => {
      const employeeId = rating.employee_id;
      if (!latestRatings.has(employeeId) || 
          new Date(rating.created_at) > new Date(latestRatings.get(employeeId).created_at)) {
        latestRatings.set(employeeId, rating);
      }
    });

    // Find the highest performer
    let topRating = 0;
    let topPerformerName = 'No data available';
    
    latestRatings.forEach(rating => {
      if ((rating.overall_percentage || 0) > topRating) {
        topRating = rating.overall_percentage || 0;
        topPerformerName = rating.employees?.full_name || 'Unknown';
      }
    });

    setTopPerformer(topPerformerName);
  };

  const calculateBestDepartment = () => {
    if (performanceRatings.length === 0 || employees.length === 0) {
      setBestDepartment('No data available');
      return;
    }

    // Get latest rating for each employee
    const latestRatings = new Map();
    performanceRatings.forEach(rating => {
      const employeeId = rating.employee_id;
      if (!latestRatings.has(employeeId) || 
          new Date(rating.created_at) > new Date(latestRatings.get(employeeId).created_at)) {
        latestRatings.set(employeeId, rating);
      }
    });

    // Group by department and calculate averages
    const departmentPerformance = new Map();
    
    latestRatings.forEach(rating => {
      const department = rating.employees?.department || 'Unknown';
      if (!departmentPerformance.has(department)) {
        departmentPerformance.set(department, { total: 0, count: 0 });
      }
      const dept = departmentPerformance.get(department);
      dept.total += rating.overall_percentage || 0;
      dept.count += 1;
    });

    // Find department with highest average
    let bestAverage = 0;
    let bestDeptName = 'No data available';
    
    departmentPerformance.forEach((data, department) => {
      const average = data.total / data.count;
      if (average > bestAverage) {
        bestAverage = average;
        bestDeptName = department;
      }
    });

    setBestDepartment(bestDeptName);
  };

  const filteredRatings = selectedEmployee === 'all' 
    ? performanceRatings 
    : performanceRatings.filter(rating => rating.employee_id === selectedEmployee);

  const averagePerformance = filteredRatings.length > 0
    ? filteredRatings.reduce((sum, rating) => sum + (rating.overall_percentage || 0), 0) / filteredRatings.length
    : 0;

  const topPerformersCount = performanceRatings
    .filter(rating => (rating.overall_percentage || 0) >= 80)
    .length;

  const chartData = filteredRatings.slice(0, 10).map(rating => ({
    name: rating.employees?.full_name || 'Unknown',
    productivity: rating.productivity || 0,
    quality: rating.quality || 0,
    teamwork: rating.teamwork || 0,
    punctuality: rating.punctuality || 0,
    overall: rating.overall_percentage || 0
  }));

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading performance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Performance Management
        </h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rating">Rate Employees</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className={`w-full md:w-48 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}>
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-blue-500" />
                  <div className="ml-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Performance</p>
                    <p className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {averagePerformance.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <Users className="w-6 md:w-8 h-6 md:h-8 text-green-500" />
                  <div className="ml-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Employees Rated</p>
                    <p className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {performanceRatings.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <Award className="w-6 md:w-8 h-6 md:h-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Top Performer</p>
                    <p className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                      {topPerformer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <Target className="w-6 md:w-8 h-6 md:h-8 text-red-500" />
                  <div className="ml-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Best Department</p>
                    <p className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                      {bestDepartment}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Performance Chart */}
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No performance data available. Rate your employees to see performance analytics.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="overall" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Recent Performance Ratings */}
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Performance Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {filteredRatings.length === 0 ? (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No performance ratings found. Start rating your employees' performance.
                    </p>
                  ) : (
                    filteredRatings.slice(0, 5).map((rating) => (
                      <div key={rating.id} className={`p-4 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {rating.employees?.full_name || 'Unknown Employee'}
                            </h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {rating.employees?.department}
                            </p>
                          </div>
                          <Badge className={getPerformanceColor(rating.overall_percentage || 0)}>
                            {rating.overall_percentage || 0}% - {getPerformanceLabel(rating.overall_percentage || 0)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : ''}`}>Productivity:</span>
                            <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {rating.productivity || 0}/10
                            </span>
                          </div>
                          <div>
                            <span className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : ''}`}>Quality:</span>
                            <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {rating.quality || 0}/10
                            </span>
                          </div>
                          <div>
                            <span className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : ''}`}>Teamwork:</span>
                            <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {rating.teamwork || 0}/10
                            </span>
                          </div>
                          <div>
                            <span className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : ''}`}>Punctuality:</span>
                            <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {rating.punctuality || 0}/10
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Rated on: {new Date(rating.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="rating">
          <PerformanceRating isDarkMode={isDarkMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;
