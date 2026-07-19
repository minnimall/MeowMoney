const SavingsGoal = require("../models/SavingsGoal");
const Transaction = require("../models/Transaction");

const getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({
      createdAt: 1,
    });
    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

// @body { name, target }
const createSavingsGoal = async (req, res, next) => {
  try {
    const { name, target } = req.body;
    const goal = await SavingsGoal.create({ user: req.user._id, name, target });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @body { name, target } — แก้ไขชื่อ/เป้าหมาย ไม่แตะยอด saved
const updateSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!goal) {
      res.status(404);
      throw new Error("ไม่พบเป้าหมายออมนี้");
    }
    const { name, target } = req.body;
    if (name !== undefined) goal.name = name;
    if (target !== undefined) goal.target = target;
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

const deleteSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      res.status(404);
      throw new Error('ไม่พบเป้าหมายออมนี้');
    }

    const affectedTransactions = await Transaction.find({
      user: req.user._id,
      savingsGoalId: goal._id,
      isDeleted: false,
    });

    await Transaction.updateMany(
      { user: req.user._id, savingsGoalId: goal._id },
      { $set: { isDeleted: true } }
    );

    await SavingsGoal.findByIdAndDelete(goal._id);

    res.json({
      success: true,
      data: {
        deletedTransactionIds: affectedTransactions.map((t) => t._id),
      },
    });
  } catch (error) { next(error); }
};

// @route POST /api/savings-goals/:id/deposit
// @body { amount }
// เติมเงินเข้าเป้าหมาย + สร้าง transaction ประเภทรายจ่ายคู่กันเสมอ
// เพื่อหักออกจากยอดคงเหลือ/รายรับที่มีอยู่จริง (ตามที่ผู้ใช้ต้องการ)
const depositToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      res.status(400);
      throw new Error('กรุณาระบุจำนวนเงินให้ถูกต้อง');
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      res.status(404);
      throw new Error('ไม่พบเป้าหมายออมนี้');
    }

    // เช็คยอดคงเหลือปัจจุบันก่อนอนุญาตให้เติมเงิน
    // คำนวณจาก transaction ทั้งหมด (รวม transaction ที่เกิดจากการเติมเงินเป้าหมายอื่นๆ ไปแล้วด้วย
    // เพราะมันหักออกจากยอดคงเหลือจริงไปแล้วเช่นกัน)
    const summary = await Transaction.getSummary(req.user._id);
    const currentBalance = summary.balance;

    if (Number(amount) > currentBalance) {
      const shortfall = Number(amount) - currentBalance;
      res.status(400);
      throw new Error(
        `ยอดเงินคงเหลือไม่เพียงพอ (ขาดอีก ${shortfall.toLocaleString('th-TH')} บาท)`
      );
    }

    goal.saved += Number(amount);
    await goal.save();

    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'expense',
      category: 'เงินออม',
      amount: Number(amount),
      date: new Date(),
      note: `เติมเงินเข้าเป้าหมาย "${goal.name}"`,
      savingsGoalId: goal._id,
    });

    res.json({ success: true, data: { goal, transaction } });
  } catch (error) { next(error); }
};

module.exports = {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  depositToGoal,
};
