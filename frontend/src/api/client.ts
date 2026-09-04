import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost/api',
  headers: { 'Content-Type': 'application/json' },
});

// Bearer Token Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aiia_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
