const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'กรุณาระบุชื่อเป้าหมาย'], trim: true },
    target: { type: Number, required: [true, 'กรุณาระบุจำนวนเงินเป้าหมาย'], min: 0 },
    // ยอดที่ออมไปแล้ว เพิ่มขึ้นเฉพาะตอนผู้ใช้กด "เติมเงิน" เข้าเป้าหมายนี้เท่านั้น
    // ไม่ได้คำนวณจากรายรับ-รายจ่ายอัตโนมัติ ตามที่ผู้ใช้ต้องการ
    saved: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);