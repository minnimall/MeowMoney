const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    // เปลี่ยนจาก Map<String, Number> เป็น Map<String, {amount, period}>
    // เพื่อให้แต่ละหมวดหมู่กำหนดได้ว่าจะตั้งงบเป็นรายเดือนหรือรายสัปดาห์
    budgets: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema);