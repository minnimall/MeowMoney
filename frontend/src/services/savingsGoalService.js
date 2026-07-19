import api from './api';

function normalize(g) {
  return { ...g, id: g._id };
}

export async function getSavingsGoals() {
  const res = await api.get('/savings-goals');
  return res.data.data.map(normalize);
}

// @body { name, target }
export async function createSavingsGoal(payload) {
  const res = await api.post('/savings-goals', payload);
  return normalize(res.data.data);
}

export async function updateSavingsGoal(id, payload) {
  const res = await api.put(`/savings-goals/${id}`, payload);
  return normalize(res.data.data);
}

export async function deleteSavingsGoal(id) {
  await api.delete(`/savings-goals/${id}`);
}

// คืนค่า goal ที่อัปเดตแล้ว + transaction รายจ่ายที่ระบบสร้างคู่กันให้
export async function depositToSavingsGoal(id, amount) {
  const res = await api.post(`/savings-goals/${id}/deposit`, { amount });
  const { goal, transaction } = res.data.data;
  return {
    goal: normalize(goal),
    transaction: { ...transaction, id: transaction._id },
  };
}