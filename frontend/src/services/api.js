import axios from 'axios';

// เก็บ URL ฐานไว้ที่เดียว เปลี่ยนตอน deploy จริงผ่าน .env ได้เลย ไม่ต้องมาแก้โค้ด
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// แนบ Authorization: Bearer <token> อัตโนมัติทุก request ถ้ามี token เก็บไว้
// ไม่ต้องเขียน header เองทุกที่ที่เรียก service function อื่นๆ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('meowmoney_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ถ้า token หมดอายุ/ไม่ถูกต้อง (401) ให้เคลียร์ session แล้วเด้งกลับหน้า login
// ครอบคลุมทุก request โดยไม่ต้องเช็ค error.response.status เองในทุกๆ ที่ที่เรียก API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('meowmoney_token');
      localStorage.removeItem('meowmoney_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;