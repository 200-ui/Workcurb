import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Ticket, Plus } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { createEmployeeTicket } from '../../hooks/useEmployeeData';

interface EmployeeTicketsProps {
  employee: any;
  employeeData: any;
  isDarkMode: boolean;
  onDataUpdate: () => void;
}

const EmployeeTickets = ({ employee, employeeData, isDarkMode, onDataUpdate }: EmployeeTicketsProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const tickets = employeeData?.tickets || [];

  const createTicket = async () => {
    if (!employee?.id || !newTicket.title.trim()) return;

    setLoading(true);
    try {
      console.log('Creating ticket with data:', {
        employee_id: employee.id,
        company_id: employee.company_id,
        ...newTicket
      });

      await createEmployeeTicket(employee.id, employee.company_id, {
        title: newTicket.title.trim(),
        description: newTicket.description.trim() || '',
        category: newTicket.category,
        priority: newTicket.priority
      });

      toast({
        title: "Ticket Created Successfully",
        description: "Your support ticket has been sent to HR and will be addressed soon.",
      });

      setNewTicket({
        title: '',
        description: '',
        category: 'General',
        priority: 'Medium'
      });
      setIsCreateModalOpen(false);
      
      // Refresh data
      onDataUpdate();
    } catch (error: any) {
      console.error('Ticket creation error:', error);
      toast({
        title: "Failed to Create Ticket",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'closed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Ticket className="h-5 w-5" />
              Support Tickets ({tickets.length})
            </CardTitle>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <DialogHeader>
                  <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    Create Support Ticket
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Title *
                    </label>
                    <Input
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      placeholder="Brief description of the issue"
                      className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <Textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      placeholder="Detailed description of the issue"
                      rows={4}
                      className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category
                      </label>
                      <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                        <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="IT Support">IT Support</SelectItem>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Priority
                      </label>
                      <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                        <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createTicket} disabled={loading || !newTicket.title.trim()}>
                      {loading ? 'Creating...' : 'Create Ticket'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket: any) => (
              <div
                key={ticket.id}
                className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {ticket.title}
                  </h3>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
                {ticket.description && (
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {ticket.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Category: {ticket.category}
                  </span>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created: {formatDate(ticket.created_at)}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Support Tickets</h3>
                <p className="text-sm">Create your first support ticket to get help from HR.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTickets;
