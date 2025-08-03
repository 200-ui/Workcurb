
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { BookOpen, Plus, Users, ExternalLink, Trash2, Award, Target } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface LearningProps {
  isDarkMode: boolean;
}

const Learning = ({ isDarkMode }: LearningProps) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeCourses, setEmployeeCourses] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    course_url: '',
    duration: '',
    difficulty_level: 'Beginner',
    department: ''
  });

  useEffect(() => {
    loadData();
    
    const coursesChannel = supabase
      .channel('courses_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'courses' },
        () => loadCourses()
      )
      .subscribe();

    const employeeCoursesChannel = supabase
      .channel('employee_courses_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employee_courses' },
        () => loadEmployeeCourses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(coursesChannel);
      supabase.removeChannel(employeeCoursesChannel);
    };
  }, []);

  const loadData = async () => {
    await Promise.all([loadCourses(), loadEmployees(), loadEmployeeCourses()]);
  };

  const loadCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error loading courses:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, department, designation')
        .eq('created_by', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Error loading employees:', error);
    }
  };

  const loadEmployeeCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employee_courses')
        .select(`
          *,
          employees:employee_id (
            id,
            full_name,
            department
          ),
          courses:course_id (
            id,
            title,
            description,
            duration
          )
        `)
        .eq('company_id', user.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setEmployeeCourses(data || []);
    } catch (error: any) {
      console.error('Error loading employee courses:', error);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.course_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('courses')
        .insert({
          ...newCourse,
          company_id: user.id,
          created_by: user.id
        });

      if (error) throw error;

      toast.success('Course created successfully!');
      setNewCourse({
        title: '',
        description: '',
        course_url: '',
        duration: '',
        difficulty_level: 'Beginner',
        department: ''
      });
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedEmployee || !selectedCourse) {
      toast.error('Please select both an employee and a course');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('employee_courses')
        .insert({
          employee_id: selectedEmployee,
          course_id: selectedCourse,
          company_id: user.id,
          assigned_by: user.id,
          status: 'Assigned',
          progress: 0
        });

      if (error) throw error;

      toast.success('Course assigned successfully!');
      setSelectedEmployee('');
      setSelectedCourse('');
    } catch (error: any) {
      console.error('Error assigning course:', error);
      toast.error('Failed to assign course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      toast.success('Course deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleDeleteEmployeeCourse = async (employeeCourseId: string) => {
    try {
      const { error } = await supabase
        .from('employee_courses')
        .delete()
        .eq('id', employeeCourseId);

      if (error) throw error;
      toast.success('Course assignment deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting course assignment:', error);
      toast.error('Failed to delete course assignment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Learning & Development
        </h1>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Course Management */}
        <div className="space-y-6">
          {/* Create Course Form */}
          {showCreateForm && (
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  Create New Course
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Course Title *</Label>
                  <Input
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    placeholder="Enter course description"
                  />
                </div>

                <div>
                  <Label>Course URL *</Label>
                  <Input
                    value={newCourse.course_url}
                    onChange={(e) => setNewCourse({ ...newCourse, course_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      placeholder="e.g. 4 weeks"
                    />
                  </div>
                  <div>
                    <Label>Difficulty Level</Label>
                    <Select
                      value={newCourse.difficulty_level}
                      onValueChange={(value) => setNewCourse({ ...newCourse, difficulty_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Department</Label>
                  <Input
                    value={newCourse.department}
                    onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                    placeholder="Target department (optional)"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleCreateCourse} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Course'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assign Course */}
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                Assign Course to Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Select Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAssignCourse} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Course'}
              </Button>
            </CardContent>
          </Card>

          {/* Available Courses */}
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                Available Courses ({courses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {courses.map((course) => (
                  <div key={course.id} className={`p-4 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {course.title}
                        </h4>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Duration: {course.duration || 'N/A'}
                          </span>
                          <Badge variant="outline">
                            {course.difficulty_level}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(course.course_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No courses created yet. Create your first course to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assigned Employees */}
        <div className="space-y-6">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Users className="w-5 h-5 mr-2" />
                Assigned Employees ({employeeCourses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {employeeCourses.map((assignment) => (
                  <div key={assignment.id} className={`p-4 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {assignment.employees?.full_name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {assignment.employees?.department}
                        </p>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Course: {assignment.courses?.title}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Duration: {assignment.courses?.duration || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Progress
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {assignment.progress || 0}%
                        </span>
                      </div>
                      <Progress value={assignment.progress || 0} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                      </span>
                      {assignment.progress === 100 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEmployeeCourse(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {employeeCourses.length === 0 && (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No courses assigned yet</p>
                    <p className="text-sm">Assign courses to employees to track their progress</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Learning;
