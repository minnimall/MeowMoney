import api from './api';

function normalizeBudgets(budgets) {
  return (budgets || []).map((b) => ({ ...b, id: b._id }));
}

export async function getSettings() {
  const res = await api.get('/settings');
  return { budgets: normalizeBudgets(res.data.data.budgets) };
}

export async function updateSettings(payload) {
  const res = await api.put('/settings', payload);
  return { budgets: normalizeBudgets(res.data.data.budgets) };
}