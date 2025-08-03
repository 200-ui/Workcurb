
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { BookOpen, Clock, Award, Users, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';

interface EmployeeLearningProps {
  employee: any;
  employeeData: any;
  isDarkMode: boolean;
  onDataUpdate: () => void;
}

const EmployeeLearning = ({ employee, employeeData, isDarkMode, onDataUpdate }: EmployeeLearningProps) => {
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  
  // Get courses from employeeData instead of direct DB call
  const courses = employeeData?.courses || [];

  const updateProgress = async (courseId: string, currentProgress: number) => {
    if (currentProgress >= 100) {
      toast.error("Course already completed!");
      return;
    }

    setUpdatingProgress(courseId);
    try {
      const { data, error } = await supabase.functions.invoke('update-course-progress', {
        body: {
          employee_id: employee.id,
          course_id: courseId,
          progress_increment: 10
        }
      });

      if (error) throw error;

      toast.success(`Course progress updated to ${data.progress}%!`);
      
      // Refresh data through parent
      onDataUpdate();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Failed to update progress.");
    } finally {
      setUpdatingProgress(null);
    }
  };

  const getCompletedCourses = () => {
    return courses.filter((course: any) => course.status === 'Completed').length;
  };

  const getInProgressCourses = () => {
    return courses.filter((course: any) => course.status === 'In Progress').length;
  };

  const getAverageProgress = () => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce((sum: number, course: any) => sum + course.progress, 0);
    return Math.round(totalProgress / courses.length);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        My Learning
      </h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Courses</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {courses.length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getCompletedCourses()}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getInProgressCourses()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Progress</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getAverageProgress()}%
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {course.courses?.title || 'Course Title'}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {course.courses?.description || 'Course description'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Duration: {course.courses?.duration || 'N/A'}
                      </span>
                      <Badge variant="outline">
                        {course.courses?.difficulty_level || 'Beginner'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Progress
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {course.progress || 0}%
                        </span>
                      </div>
                      <Progress value={course.progress || 0} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={course.status === 'Completed' ? 'default' : 'outline'}
                        className={course.status === 'Completed' ? 'bg-green-500' : ''}
                      >
                        {course.status || 'Assigned'}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        {course.courses?.course_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(course.courses.course_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Course
                          </Button>
                        )}
                        
                        {(course.progress || 0) < 100 && (
                          <Button
                            size="sm"
                            onClick={() => updateProgress(course.courses?.id || course.course_id, course.progress || 0)}
                            disabled={updatingProgress === (course.courses?.id || course.course_id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {updatingProgress === (course.courses?.id || course.course_id) ? 'Updating...' : 'Update Progress'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No courses assigned yet</p>
              <p className="text-sm">Your learning courses will appear here once assigned by HR</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeLearning;
