import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Request Interceptor: Attach JWT Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('complaint_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Unauthorized / Expired session
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('complaint_token');
        localStorage.removeItem('complaint_user');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
