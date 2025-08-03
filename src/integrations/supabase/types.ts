export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
 
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          admin_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          password_hash: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          password_hash: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      call_bookings: {
        Row: {
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          company_id: string | null
          course_url: string
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          difficulty_level: string | null
          duration: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          course_url: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          course_url?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_attendance_sessions: {
        Row: {
          attendance_date: string
          check_in_time: string
          check_out_time: string | null
          company_id: string | null
          created_at: string
          employee_id: string
          hours_worked: number | null
          id: string
          session_number: number
          status: string | null
          updated_at: string
        }
        Insert: {
          attendance_date?: string
          check_in_time: string
          check_out_time?: string | null
          company_id?: string | null
          created_at?: string
          employee_id: string
          hours_worked?: number | null
          id?: string
          session_number: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          check_in_time?: string
          check_out_time?: string | null
          company_id?: string | null
          created_at?: string
          employee_id?: string
          hours_worked?: number | null
          id?: string
          session_number?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_attendance_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_courses: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          company_id: string | null
          completed_at: string | null
          course_id: string
          employee_id: string
          id: string
          progress: number | null
          status: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          company_id?: string | null
          completed_at?: string | null
          course_id: string
          employee_id: string
          id?: string
          progress?: number | null
          status?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          company_id?: string | null
          completed_at?: string | null
          course_id?: string
          employee_id?: string
          id?: string
          progress?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_courses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_credentials: {
        Row: {
          company_id: string
          created_at: string
          email: string
          employee_id: string
          id: string
          is_active: boolean | null
          password_hash: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          employee_id: string
          id?: string
          is_active?: boolean | null
          password_hash: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          employee_id?: string
          id?: string
          is_active?: boolean | null
          password_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_credentials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_credentials_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shifts: {
        Row: {
          company_id: string
          created_at: string
          employee_id: string
          id: string
          schedule_id: string
          shift_date: string
          shift_end_time: string
          shift_start_time: string
          shift_type: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          schedule_id: string
          shift_date: string
          shift_end_time: string
          shift_start_time: string
          shift_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          schedule_id?: string
          shift_date?: string
          shift_end_time?: string
          shift_start_time?: string
          shift_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_shifts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "shift_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_tickets: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          description: string
          employee_id: string
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          description: string
          employee_id: string
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string
          employee_id?: string
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_tickets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          city: string | null
          company_id: string
          country: string | null
          created_at: string
          created_by: string | null
          department: string | null
          designation: string | null
          email: string
          employee_id: string
          full_name: string
          id: string
          is_active: boolean | null
          join_date: string | null
          password_hash: string
          role: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          designation?: string | null
          email: string
          employee_id: string
          full_name: string
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          password_hash: string
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          designation?: string | null
          email?: string
          employee_id?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          password_hash?: string
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string
          event_type: string | null
          id: string
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time: string
          event_type?: string | null
          id?: string
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string
          event_type?: string | null
          id?: string
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          applied_date: string
          company_id: string
          created_at: string
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string
          reviewed_by: string | null
          reviewed_date: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          applied_date?: string
          company_id: string
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          leave_type?: string
          reason: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          applied_date?: string
          company_id?: string
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_months: number
          buyer_designation: string | null
          buyer_email: string
          buyer_name: string | null
          created_at: string | null
          id: string
          organization_name: string | null
          plan_name: string
          plan_price: number
          status: string | null
          total_amount: number
          user_id: string | null
        }
        Insert: {
          billing_months: number
          buyer_designation?: string | null
          buyer_email: string
          buyer_name?: string | null
          created_at?: string | null
          id?: string
          organization_name?: string | null
          plan_name: string
          plan_price: number
          status?: string | null
          total_amount: number
          user_id?: string | null
        }
        Update: {
          billing_months?: number
          buyer_designation?: string | null
          buyer_email?: string
          buyer_name?: string | null
          created_at?: string | null
          id?: string
          organization_name?: string | null
          plan_name?: string
          plan_price?: number
          status?: string | null
          total_amount?: number
          user_id?: string | null
        }
        Relationships: []
      }
      performance_ratings: {
        Row: {
          company_id: string
          created_at: string
          employee_id: string | null
          id: string
          overall_percentage: number | null
          productivity: number | null
          punctuality: number | null
          quality: number | null
          rated_by: string | null
          teamwork: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          employee_id?: string | null
          id?: string
          overall_percentage?: number | null
          productivity?: number | null
          punctuality?: number | null
          quality?: number | null
          rated_by?: string | null
          teamwork?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          employee_id?: string | null
          id?: string
          overall_percentage?: number | null
          productivity?: number | null
          punctuality?: number | null
          quality?: number | null
          rated_by?: string | null
          teamwork?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_ratings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          designation: string | null
          full_name: string | null
          id: string
          organization_name: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          designation?: string | null
          full_name?: string | null
          id: string
          organization_name?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          designation?: string | null
          full_name?: string | null
          id?: string
          organization_name?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      shift_schedules: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          schedule_name: string
          status: string
          updated_at: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          schedule_name: string
          status?: string
          updated_at?: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          schedule_name?: string
          status?: string
          updated_at?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: { p_admin_id: string; p_password: string }
        Returns: {
          id: string
          admin_id: string
          full_name: string
          email: string
        }[]
      }
      authenticate_employee: {
        Args: { employee_email: string; employee_password: string }
        Returns: {
          id: string
          employee_id: string
          full_name: string
          email: string
          department: string
          designation: string
        }[]
      }
      authenticate_employee_login: {
        Args: { employee_email: string; employee_password: string }
        Returns: {
          employee_id: string
          employee_info_id: string
          employee_code: string
          full_name: string
          email: string
          department: string
          designation: string
          company_id: string
        }[]
      }
      create_employee_credentials: {
        Args:
          | { p_employee_id: string; p_email: string; p_password: string }
          | {
              p_employee_id: string
              p_email: string
              p_password: string
              p_company_id: string
            }
        Returns: string
      }
      update_admin_password: {
        Args: {
          p_admin_id: string
          p_old_password: string
          p_new_password: string
        }
        Returns: boolean
      }
      update_admin_profile: {
        Args: {
          p_admin_id: string
          p_full_name: string
          p_admin_username: string
          p_email: string
        }
        Returns: boolean
      }
      update_employee_login_password: {
        Args: {
          p_email: string
          p_old_password: string
          p_new_password: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
