import api from './api';

// Backend คืนค่า Mongo document มา field ชื่อ _id
// แต่ Dashboard.jsx เดิมอ้างอิง t.id ทุกที่ (key ของ list, editingId ฯลฯ)
// เลย normalize ตรงนี้ที่เดียว จะได้ไม่ต้องแก้โค้ด Dashboard.jsx ทั้งไฟล์
function normalize(tx) {
  return { ...tx, id: tx._id };
}

// @params { type, category, year, month } — ค่า 'all' จะถูกตัดออกไม่ส่งไป backend
// ตรงกับตัวกรองใน Dashboard.jsx (filterType, filterCategory, filterYear, filterMonth)
export async function getTransactions(filters = {}) {
  const params = {};
  if (filters.type && filters.type !== 'all') params.type = filters.type;
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.year && filters.year !== 'all') params.year = filters.year;
  if (filters.month && filters.month !== 'all') params.month = filters.month;

  const res = await api.get('/transactions', { params });
  return res.data.data.map(normalize);
}

// @body { type, category, amount, date, note }
export async function createTransaction(payload) {
  const res = await api.post('/transactions', payload);
  return normalize(res.data.data);
}

export async function updateTransaction(id, payload) {
  const res = await api.put(`/transactions/${id}`, payload);
  return normalize(res.data.data);
}

export async function deleteTransaction(id) {
  await api.delete(`/transactions/${id}`);
}

// สรุปยอดรวม รายรับ/รายจ่าย/คงเหลือ ตามตัวกรองปัจจุบัน
export async function getSummary(filters = {}) {
  const res = await api.get('/transactions/summary', { params: filters });
  return res.data.data; // { totalIncome, totalExpense, balance }
}

// สรุปยอดแยกรายเดือน — ใช้กับ panel "สรุปยอดรายเดือน" ฝั่งขวาของ Dashboard
export async function getMonthlySummary() {
  const res = await api.get('/transactions/monthly-summary');
  return res.data.data; // [{ key: '2026-07', income, expense, balance }, ...]
}