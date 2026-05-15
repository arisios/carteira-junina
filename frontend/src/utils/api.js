import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3007/api';
const api = axios.create({ baseURL: BASE, timeout: 15000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
