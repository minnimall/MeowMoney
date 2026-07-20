const mongoose = require('mongoose');

const budgetItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    label: { type: String, default: '' },
  },
  { timestamps: true }
);

const userSettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    budgets: { type: [budgetItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema);