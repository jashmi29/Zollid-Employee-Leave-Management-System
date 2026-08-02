import api from './api.js';
import { User } from '../types.js';

export const employeeService = {
  async getAllEmployees(params?: { search?: string }): Promise<{ success: boolean; employees: User[] }> {
    const response = await api.get<{ success: boolean; employees: User[] }>('/employees', { params });
    return response.data;
  }
};
