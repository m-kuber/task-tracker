// frontend/src/api/axios.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// attach Authorization header automatically if token exists
api.interceptors.request.use((config) => {
  try {
    const token =
      localStorage.getItem('tt_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt') ||
      null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return config;
});

export default api;
