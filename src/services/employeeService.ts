import api from './api.js';
import { User, Department } from '../types.js';

export const employeeService = {
  async getAllEmployees(params?: { search?: string }): Promise<{ success: boolean; employees: User[] }> {
    const response = await api.get<{ success: boolean; employees: User[] }>('/employees', { params });
    return response.data;
  },

  async getDepartments(): Promise<{ success: boolean; departments: Department[] }> {
    const response = await api.get<{ success: boolean; departments: Department[] }>('/employees/departments');
    return response.data;
  }
};

