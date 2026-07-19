import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data.data; // { budgets: {...} }
}

export async function updateSettings(payload) {
  const res = await api.put('/settings', payload); // payload: { budgets }
  return res.data.data;
}