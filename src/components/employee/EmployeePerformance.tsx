
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, Award, Target, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EmployeePerformanceProps {
  employee: any;
  employeeData: any;
  isDarkMode: boolean;
}

const EmployeePerformance = ({ employee, employeeData, isDarkMode }: EmployeePerformanceProps) => {
  // Get performance data from employeeData
  const performance = employeeData?.performance || [];

  const getLatestPerformance = () => {
    if (performance.length === 0) return null;
    return performance.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const getAveragePerformance = () => {
    if (performance.length === 0) return 0;
    const total = performance.reduce((sum: number, p: any) => sum + (p.overall_percentage || 0), 0);
    return (total / performance.length).toFixed(1);
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

  const latestPerformance = getLatestPerformance();

  // Prepare chart data for latest performance
  const chartData = latestPerformance ? [
    { name: 'Productivity', value: latestPerformance.productivity || 0, fullMark: 10 },
    { name: 'Quality', value: latestPerformance.quality || 0, fullMark: 10 },
    { name: 'Teamwork', value: latestPerformance.teamwork || 0, fullMark: 10 },
    { name: 'Punctuality', value: latestPerformance.punctuality || 0, fullMark: 10 },
  ] : [];

  return (
    <div className="space-y-6 p-4 md:p-6 h-screen overflow-hidden">
      <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        My Performance
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Latest Performance</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {latestPerformance ? `${latestPerformance.overall_percentage || 0}%` : 'N/A'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getAveragePerformance()}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Reviews</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {performance.length}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Performance Review */}
      {latestPerformance ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <BarChart3 className="w-5 h-5 mr-2" />
                Latest Performance Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  />
                  <YAxis 
                    domain={[0, 10]}
                    tick={{ fontSize: 12 }}
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Activity className="w-5 h-5 mr-2" />
                Performance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Overall Rating
                    </h3>
                    <Badge className={getPerformanceColor(latestPerformance.overall_percentage || 0)}>
                      {latestPerformance.overall_percentage || 0}% - {getPerformanceLabel(latestPerformance.overall_percentage || 0)}
                    </Badge>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Rated on: {new Date(latestPerformance.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Productivity</p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {latestPerformance.productivity || 0}/10
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quality</p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {latestPerformance.quality || 0}/10
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Teamwork</p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {latestPerformance.teamwork || 0}/10
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Punctuality</p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {latestPerformance.punctuality || 0}/10
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="text-center py-12">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No Performance Reviews Yet
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your performance reviews will appear here once HR rates your performance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeePerformance;
