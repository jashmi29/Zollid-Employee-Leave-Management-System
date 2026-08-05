import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { MainLayout } from './layouts/MainLayout.js';

import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { EmployeeDashboard } from './pages/employee/Dashboard.js';
import { ApplyLeave } from './pages/employee/ApplyLeave.js';
import { LeaveHistory } from './pages/employee/LeaveHistory.js';
import { LeaveCalendar } from './pages/employee/LeaveCalendar.js';
import { ManagerDashboard } from './pages/manager/Dashboard.js';
import { EmployeesPage } from './pages/manager/Employees.js';
import { ManagerLeaveRequests } from './pages/manager/LeaveRequests.js';
import { ManagerLeaveCalendar } from './pages/manager/ManagerLeaveCalendar.js';
import { NotFound } from './pages/NotFound.js';

import { useAuth } from './hooks/useAuth.js';

function HomeRedirect() {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'manager' ? '/manager/dashboard' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #1e293b',
                fontSize: '13px',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
              }
            }}
          />
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Employee Routes */}
            <Route
              element={
                <ProtectedRoute allowedRole="employee">
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/apply-leave" element={<ApplyLeave />} />
              <Route path="/leave-history" element={<LeaveHistory />} />
              <Route path="/calendar" element={<LeaveCalendar />} />
            </Route>

            {/* Protected Manager Routes */}
            <Route
              element={
                <ProtectedRoute allowedRole="manager">
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/employees" element={<EmployeesPage />} />
              <Route path="/manager/calendar" element={<ManagerLeaveCalendar />} />
              <Route path="/manager/leave-requests" element={<ManagerLeaveRequests />} />
            </Route>

            {/* Root Redirect */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
