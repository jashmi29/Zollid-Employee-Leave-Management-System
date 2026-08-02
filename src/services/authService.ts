import api from './api.js';
import { AuthResponse, User } from '../types.js';

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { username, password });
    return response.data;
  },

  async register(fullName: string, username: string, companyEmail: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', { fullName, username, companyEmail, password });
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const response = await api.get<{ success: boolean; user: User }>('/auth/me');
    return response.data;
  },

  async verifyEmployee(username: string, companyEmail: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/verify-employee', { username, companyEmail });
    return response.data;
  },

  async resetPassword(username: string, companyEmail: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/reset-password', {
      username,
      companyEmail,
      newPassword,
      confirmPassword
    });
    return response.data;
  }
};
