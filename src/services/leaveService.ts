import api from './api.js';
import {
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  LeaveBalance,
  CompanyHoliday,
  CompanyPolicy
} from '../types.js';

export const leaveService = {
  async applyLeave(formData: FormData): Promise<{ success: boolean; message: string; leave: LeaveRequest }> {
    const response = await api.post<{ success: boolean; message: string; leave: LeaveRequest }>(
      '/leaves',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  async getMyLeaves(): Promise<{ success: boolean; leaves: LeaveRequest[] }> {
    const response = await api.get<{ success: boolean; leaves: LeaveRequest[] }>('/leaves/my');
    return response.data;
  },

  async getAllLeaves(params?: { status?: string; search?: string }): Promise<{ success: boolean; leaves: LeaveRequest[] }> {
    const response = await api.get<{ success: boolean; leaves: LeaveRequest[] }>('/leaves', { params });
    return response.data;
  },

  async updateLeaveStatus(
    id: number,
    status: LeaveStatus,
    remarks?: string,
    approved_start_date?: string,
    approved_end_date?: string
  ): Promise<{ success: boolean; message: string; leave: LeaveRequest }> {
    const response = await api.put<{ success: boolean; message: string; leave: LeaveRequest }>(
      `/leaves/${id}/status`,
      { status, remarks, approved_start_date, approved_end_date }
    );
    return response.data;
  },

  async getUnreadNotifications(): Promise<{ success: boolean; notifications: LeaveRequest[] }> {
    const response = await api.get<{ success: boolean; notifications: LeaveRequest[] }>('/leaves/notifications/unread');
    return response.data;
  },

  async markNotificationsRead(): Promise<{ success: boolean; message: string }> {
    const response = await api.put<{ success: boolean; message: string }>('/leaves/notifications/read');
    return response.data;
  },

  async deleteLeave(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/leaves/${id}`);
    return response.data;
  },

  async getLeaveTypes(): Promise<{ success: boolean; leaveTypes: LeaveType[] }> {
    const response = await api.get<{ success: boolean; leaveTypes: LeaveType[] }>('/leaves/types');
    return response.data;
  },

  async getLeaveBalances(): Promise<{ success: boolean; balances: LeaveBalance[] }> {
    const response = await api.get<{ success: boolean; balances: LeaveBalance[] }>('/leaves/balances');
    return response.data;
  },

  async getCompanyHolidays(): Promise<{ success: boolean; holidays: CompanyHoliday[] }> {
    const response = await api.get<{ success: boolean; holidays: CompanyHoliday[] }>('/leaves/holidays');
    return response.data;
  },

  async getCompanyPolicies(): Promise<{ success: boolean; policies: CompanyPolicy[] }> {
    const response = await api.get<{ success: boolean; policies: CompanyPolicy[] }>('/leaves/policies');
    return response.data;
  }
};

