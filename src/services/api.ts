import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('leave_app_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('leave_app_token');
        localStorage.removeItem('leave_app_user');
        if (window.location.pathname !== '/login') {
          const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?expired=1&redirect=${currentPath}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
