import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic Interceptor: Always attaches fresh token on every single request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aiia_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
