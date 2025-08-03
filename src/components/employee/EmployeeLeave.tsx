
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Calendar, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { createLeaveRequest } from '../../hooks/useEmployeeData';

interface EmployeeLeaveProps {
  employee: any;
  employeeData: any;
  isDarkMode: boolean;
  onDataUpdate: () => void;
}

const EmployeeLeave = ({ employee, employeeData, isDarkMode, onDataUpdate }: EmployeeLeaveProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get leave requests from employeeData
  const leaveRequests = employeeData?.leaveRequests || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the correct employee ID from the employee record
      const employeeRecordId = employee.employee_info_id || employee.id;
      
      await createLeaveRequest(
        employeeRecordId,
        employee.company_id,
        {
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: reason.trim()
        }
      );

      toast.success("Leave request submitted successfully!");
      setShowCreateForm(false);
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');

      // Refresh data through parent
      onDataUpdate();
    } catch (error: any) {
      console.error("Error submitting leave request:", error);
      toast.error(`Failed to submit leave request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 border-green-600';
      case 'rejected':
        return 'text-red-600 border-red-600';
      case 'pending':
      default:
        return 'text-yellow-600 border-yellow-600';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Leave Requests
        </h1>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      {showCreateForm && (
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              Request Leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="leaveType"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Leave Type
                </label>
                <Input
                  type="text"
                  id="leaveType"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  placeholder="e.g., Sick Leave, Annual Leave, Personal Leave"
                  className={isDarkMode ? 'bg-gray-700 text-white' : ''}
                />
              </div>
              <div>
                <label
                  htmlFor="startDate"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Start Date
                </label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={isDarkMode ? 'bg-gray-700 text-white' : ''}
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  End Date
                </label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={isDarkMode ? 'bg-gray-700 text-white' : ''}
                />
              </div>
              <div>
                <label
                  htmlFor="reason"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Reason
                </label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason for your leave request..."
                  className={isDarkMode ? 'bg-gray-700 text-white' : ''}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            My Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.length > 0 ? (
            <div className="space-y-4">
              {leaveRequests.map((request: any) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {request.leave_type}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                      </p>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(request.status)}
                      className={`capitalize ${getStatusColor(request.status)}`}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Reason:
                      </span>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {request.reason}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Applied: {formatDate(request.created_at)}
                      </span>
                      {request.reviewed_date && (
                        <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Reviewed: {formatDate(request.reviewed_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No leave requests submitted yet</p>
              <p className="text-sm">Submit a leave request to track your time off</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeLeave;
