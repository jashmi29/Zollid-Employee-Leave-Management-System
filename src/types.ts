export type UserRole = 'employee' | 'manager';

export interface User {
  id: number;
  username: string;
  fullName?: string;
  companyEmail?: string;
  role: UserRole;
  created_at?: string;
  total_leaves?: number;
  pending_leaves?: number;
  approved_leaves?: number;
  rejected_leaves?: number;
  leaves?: LeaveRequest[];
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Partially Approved' | 'Rejected';

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_username?: string;
  employee_name?: string;
  employee_email?: string;
  leave_reason: string;
  start_date: string;
  end_date: string;
  approved_start_date?: string | null;
  approved_end_date?: string | null;
  document_url?: string | null;
  status: LeaveStatus;
  remarks?: string | null;
  notification_read?: number;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalDaysTaken: number;
}

export interface LeaveType {
  id: number;
  code: string;
  name: string;
  max_days_per_year: number;
  description: string;
  requires_proof: boolean;
  color_code: string;
}

export interface LeaveBalance {
  id?: number;
  employee_id: number;
  leave_type: string;
  total_allowance: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

export interface CompanyHoliday {
  id: number;
  holiday_name: string;
  holiday_date: string;
  day_of_week: string;
  type: 'National' | 'Festival' | 'Company Holiday' | 'Restricted';
  description: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  manager_name: string;
  total_employees: number;
  description: string;
}

export interface CompanyPolicy {
  id: number;
  title: string;
  category: string;
  content: string;
  effective_date: string;
}

