import api from './api';

const TOKEN_KEY = 'meowmoney_token';
const USER_KEY = 'meowmoney_user';

// บันทึก token + ข้อมูล user (ไม่รวม token) แยกกัน
// แยกไว้เพื่อให้ getStoredUser() อ่านได้เร็วโดยไม่ต้อง parse token ทุกครั้ง
function saveSession(data) {
  const { token, ...user } = data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

// @body { username, email, password }
// ตรงกับ POST /api/auth/register — ใช้ตอนสมัครสมาชิกใน AuthPage.jsx (mode === 'register')
export async function register({ username, email, password }) {
  const res = await api.post('/auth/register', { username, email, password });
  return saveSession(res.data.data);
}

// @body { email, password }
// ตรงกับ POST /api/auth/login — ใช้ตอน login ใน AuthPage.jsx (mode === 'login')
export async function login({ email, password }) {
  const res = await api.post('/auth/login', { email, password });
  return saveSession(res.data.data);
}

// ดึงข้อมูล user ปัจจุบันจาก backend ตรงๆ (เผื่อข้อมูลใน localStorage ไม่ sync)
export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data.data;
}

// แก้ไขโปรไฟล์ (ใช้กับ modal แก้โปรไฟล์ใน Dashboard.jsx)
export async function updateProfile({ username, email, avatar }) {
  const res = await api.put('/auth/me', { username, email, avatar });
  localStorage.setItem(USER_KEY, JSON.stringify(res.data.data));
  return res.data.data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// อ่านข้อมูล user ที่เคย login ไว้ (ใช้ตอนเปิดแอปใหม่ เพื่อไม่ต้อง login ซ้ำถ้า token ยังไม่หมดอายุ)
export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}