
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface EmployeeData {
  employee: any;
  shifts: any[]; // Always empty array since shifts functionality is removed
  attendance: any[];
  tickets: any[];
  leaveRequests: any[];
  performance: any[];
  courses: any[];
  events: any[];
}

export const useEmployeeData = (employeeId: string, companyId: string) => {
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployeeData = async () => {
    if (!employeeId || !companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: result, error } = await supabase.functions.invoke('get-employee-data', {
        body: { employee_id: employeeId, company_id: companyId }
      });

      if (error) throw error;

      setData(result);
    } catch (error: any) {
      console.error('Error fetching employee data:', error);
      setError(error.message || 'Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [employeeId, companyId]);

  return { data, loading, error, refetch: fetchEmployeeData };
};

export const createEmployeeTicket = async (
  employeeId: string,
  companyId: string,
  ticketData: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
  }
) => {
  const { data, error } = await supabase.functions.invoke('create-employee-ticket', {
    body: {
      employee_id: employeeId,
      company_id: companyId,
      ...ticketData
    }
  });

  if (error) throw error;
  return data;
};

export const createLeaveRequest = async (
  employeeId: string,
  companyId: string,
  leaveData: {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
  }
) => {
  const { data, error } = await supabase.functions.invoke('create-leave-request', {
    body: {
      employee_id: employeeId,
      company_id: companyId,
      ...leaveData
    }
  });

  if (error) throw error;
  return data;
};
