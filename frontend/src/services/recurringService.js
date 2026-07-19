import api from './api';

function normalize(item) {
  return { ...item, id: item._id };
}

export async function getRecurring() {
  const res = await api.get('/recurring');
  return res.data.data.map(normalize);
}

// @body { type, category, amount, note }
export async function createRecurring(payload) {
  const res = await api.post('/recurring', payload);
  return normalize(res.data.data);
}

export async function deleteRecurring(id) {
  await api.delete(`/recurring/${id}`);
}

export async function generateDueTransactions() {
  const res = await api.post('/recurring/generate-due');
  return res.data.data.map((tx) => ({ ...tx, id: tx._id })); // normalize เหมือน transactionService
}