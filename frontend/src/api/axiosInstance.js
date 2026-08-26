import axios from 'axios';
import { getGuestToken } from './guestToken';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization header (user token or public guest token for store catalog)
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('feedback_store_token');
    
    // If no active user session and calling store catalog, attach public guest token
    if (!token && (config.url?.includes('/user/stores') || config.url?.includes('/stores'))) {
      token = await getGuestToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const userToken = localStorage.getItem('feedback_store_token');
      const isAuthPath = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/signup');
      
      // If unauthorized on protected calls with a previously active USER token, clear token & redirect
      if (userToken && !isAuthPath) {
        localStorage.removeItem('feedback_store_token');
        localStorage.removeItem('feedback_store_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
