const Recurring = require('../models/Recurring');
const Transaction = require('../models/Transaction');

const getRecurring = async (req, res, next) => {
  try {
    const list = await Recurring.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json({ success: true, data: list });
  } catch (error) { next(error); }
};

const createRecurring = async (req, res, next) => {
  try {
    const { type, category, amount, note } = req.body;
    const item = await Recurring.create({ user: req.user._id, type, category, amount, note });
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
};

const deleteRecurring = async (req, res, next) => {
  try {
    const item = await Recurring.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) {
      res.status(404);
      throw new Error('ไม่พบรายการเกิดซ้ำนี้');
    }
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

// @route POST /api/recurring/generate-due  (protected)
// สร้างรายการอัตโนมัติให้ทุก recurring ที่ยังไม่เคยสร้างของเดือนนี้
// เช็คจาก lastGeneratedMonth ไม่ใช่จาก transaction list — กันปัญหา
// รายการถูกลบ (soft-delete) แล้วระบบเข้าใจผิดว่ายังไม่เคยสร้าง
const generateDueTransactions = async (req, res, next) => {
  try {
    const now = new Date();
    const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const dueList = await Recurring.find({
      user: req.user._id,
      lastGeneratedMonth: { $ne: nowKey },
    });

    const created = [];
    for (const r of dueList) {
      const tx = await Transaction.create({
        user: req.user._id,
        type: r.type,
        category: r.category,
        amount: r.amount,
        date: now,
        note: r.note ? `${r.note} (อัตโนมัติ)` : 'รายการอัตโนมัติ',
        recurringId: r._id,
      });
      r.lastGeneratedMonth = nowKey;
      await r.save();
      created.push(tx);
    }

    res.json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecurring, createRecurring, deleteRecurring, generateDueTransactions };