import axios from 'axios';
// src/api/axiosClient.js
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/listing';

const axiosClient = axios.create({
  baseURL: BASE_URL, // Should be https://your-backend.onrender.com/listing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
