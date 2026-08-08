import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types.js';
import { authService } from '../services/authService.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (fullName: string, username: string, companyEmail: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (fullName: string, username: string, companyEmail: string) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('leave_app_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('leave_app_token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const data = await authService.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('leave_app_user', JSON.stringify(data.user));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const data = await authService.login(username, password);
      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('leave_app_token', data.token);
        localStorage.setItem('leave_app_user', JSON.stringify(data.user));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid username or password.';
      return { success: false, message: msg };
    }
  };

  const register = async (fullName: string, username: string, companyEmail: string, password: string) => {
    try {
      const data = await authService.register(fullName, username, companyEmail, password);
      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('leave_app_token', data.token);
        localStorage.setItem('leave_app_user', JSON.stringify(data.user));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to create account.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('leave_app_token');
    localStorage.removeItem('leave_app_user');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const data = await authService.getMe();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('leave_app_user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    }
  };

  const updateProfile = async (fullName: string, username: string, companyEmail: string) => {
    try {
      const data = await authService.updateProfile(fullName, username, companyEmail);
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('leave_app_user', JSON.stringify(data.user));
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('leave_app_token', data.token);
        }
        return { success: true, message: data.message || 'Profile updated successfully.' };
      }
      return { success: false, message: data.message || 'Failed to update profile.' };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update profile details.';
      return { success: false, message: msg };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const data = await authService.changePassword(currentPassword, newPassword);
      return data;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to change password.';
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        role: user ? user.role : null,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
