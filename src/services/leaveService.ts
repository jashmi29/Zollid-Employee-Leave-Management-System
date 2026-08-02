import api from './api.js';
import { LeaveRequest } from '../types.js';

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

  async updateLeaveStatus(id: number, status: 'Approved' | 'Rejected' | 'Pending', remarks?: string): Promise<{ success: boolean; message: string; leave: LeaveRequest }> {
    const response = await api.put<{ success: boolean; message: string; leave: LeaveRequest }>(
      `/leaves/${id}/status`,
      { status, remarks }
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
  }
};
