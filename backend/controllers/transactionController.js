const Transaction = require('../models/Transaction');

// @route GET /api/transactions  (protected)
// query params ที่รองรับ: type, category, year, month, startDate, endDate
// ตรงกับตัวกรองใน Dashboard.jsx (filterType, filterCategory, filterYear, filterMonth)
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, year, month, startDate, endDate } = req.query;

    const query = { user: req.user._id, isDeleted: false };
    if (type) query.type = type;
    if (category) query.category = category;

    // รองรับกรองแบบปี/เดือน (ที่ dashboard ใช้) หรือช่วงวันที่ตรงๆ ก็ได้
    if (year || month) {
      const y = year ? Number(year) : new Date().getFullYear();
      const m = month ? Number(month) - 1 : null;
      const start = m !== null ? new Date(y, m, 1) : new Date(y, 0, 1);
      const end = m !== null ? new Date(y, m + 1, 1) : new Date(y + 1, 0, 1);
      query.date = { $gte: start, $lt: end };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/transactions  (protected)
// รับ body: { type, category, amount, date, note }
const createTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, date, note, recurringId } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      category,
      amount,
      date,
      note,
      recurringId: recurringId || null,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/transactions/:id  (protected)
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false,
    });

    if (!transaction) {
      res.status(404);
      throw new Error('ไม่พบรายการนี้ หรือคุณไม่มีสิทธิ์แก้ไข');
    }

    const { type, category, amount, date, note } = req.body;
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (amount !== undefined) transaction.amount = amount;
    if (date) transaction.date = date;
    if (note !== undefined) transaction.note = note;

    await transaction.save();

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/transactions/:id  (protected)
// ใช้ soft delete ตามที่ schema ออกแบบไว้ (isDeleted: true) แทนการลบจริง
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false,
    });

    if (!transaction) {
      res.status(404);
      throw new Error('ไม่พบรายการนี้ หรือคุณไม่มีสิทธิ์ลบ');
    }

    transaction.isDeleted = true;
    await transaction.save();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/transactions/summary  (protected)
// ใช้ static method getSummary ที่นิยามไว้ใน Transaction.js อยู่แล้ว
const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, category, type } = req.query;
    const summary = await Transaction.getSummary(req.user._id, {
      startDate,
      endDate,
      category,
      type,
    });
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/transactions/monthly-summary  (protected)
// สรุปยอดแยกรายเดือน ใช้กับ panel "สรุปยอดรายเดือน" ฝั่งขวาของ Dashboard
const getMonthlySummary = async (req, res, next) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { user: req.user._id, isDeleted: false } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const map = {};
    result.forEach((r) => {
      const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
      if (!map[key]) map[key] = { key, income: 0, expense: 0 };
      map[key][r._id.type] = r.total;
    });

    const monthly = Object.values(map)
      .map((m) => ({ ...m, balance: m.income - m.expense }))
      .sort((a, b) => (a.key < b.key ? 1 : -1));

    res.json({ success: true, data: monthly });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlySummary,
};