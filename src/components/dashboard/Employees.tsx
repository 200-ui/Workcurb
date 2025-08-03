
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Plus, Search, Filter, Trash2, Edit } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  country: string;
  city: string;
  join_date: string;
  status: string;
  employee_id: string;
}

interface EmployeesProps {
  isDarkMode: boolean;
}

const Employees = ({ isDarkMode }: EmployeesProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all_departments');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const departments = [
    { value: 'all_departments', label: 'All Departments' },
    { value: 'IT', label: 'IT' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' }
  ];

  useEffect(() => {
    loadEmployees();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('employees_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employees' },
        () => loadEmployees()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadEmployees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Employee interface
      const transformedData = data?.map(emp => ({
        id: emp.id,
        full_name: emp.full_name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        country: emp.country || '',
        city: emp.city || '',
        join_date: emp.join_date,
        status: emp.status,
        employee_id: emp.employee_id
      })) || [];
      
      setEmployees(transformedData);
    } catch (error: any) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all_departments' || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentColor = (department: string) => {
    const colors = {
      'IT': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'Marketing': 'bg-green-100 text-green-800 hover:bg-green-200',
      'Sales': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'HR': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'Finance': 'bg-red-100 text-red-800 hover:bg-red-200',
      'Operations': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
    };
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Employee Management
        </h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <div className="grid gap-4">
        {filteredEmployees.length === 0 ? (
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="p-8 text-center">
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No employees found. Add your first employee to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {employee.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {employee.full_name}
                      </h3>
                      <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {employee.email}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ID: {employee.employee_id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="text-left md:text-right">
                      <Badge className={getDepartmentColor(employee.department)}>
                        {employee.department}
                      </Badge>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {employee.designation}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {employee.country}, {employee.city}
                      </p>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Joined: {new Date(employee.join_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'hover:bg-gray-50'}
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={`text-red-500 border-red-500 hover:bg-red-50 ${isDarkMode ? 'hover:bg-red-900/20 hover:text-red-400' : ''}`}
                        onClick={() => deleteEmployee(employee.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddEmployeeModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        isDarkMode={isDarkMode}
      />

      <EditEmployeeModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        employee={selectedEmployee}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default Employees;
