import axios from 'axios';

const backendBase = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';
const api = axios.create({
  baseURL: `${backendBase}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('steakz_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
