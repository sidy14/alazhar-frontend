import axios from 'axios';

// هذا هو التحديث الهام:
// إذا كنا على الإنترنت (Production)، استخدم رابط Render.
// إذا كنا على جهازك (Development)، استخدم localhost.
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://alazhar-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;