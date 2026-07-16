const mongoose = require('mongoose');

// รายการหมวดหมู่แนะนำ (ใช้เป็น default suggestion ฝั่ง frontend ได้
// แต่ปล่อยให้ category เป็น String ธรรมดา เพื่อให้ user เพิ่มหมวดหมู่เองได้ในอนาคต)
const INCOME_CATEGORIES = ['เงินเดือน', 'โบนัส', 'รายได้เสริม', 'ของขวัญ', 'อื่นๆ'];
const EXPENSE_CATEGORIES = ['ค่าอาหาร', 'ค่าเดินทาง', 'ค่าที่พัก', 'ค่าใช้จ่ายส่วนตัว', 'บันเทิง', 'อื่นๆ'];

const transactionSchema = new mongoose.Schema(
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // query ตาม user บ่อยที่สุด ต้องมี index
        },
        type: {
        type: String,
        enum: {
            values: ['income', 'expense'],
            message: 'ประเภทรายการต้องเป็น income หรือ expense เท่านั้น',
        },
        required: [true, 'กรุณาระบุประเภทรายการ'],
        },
        category: {
        type: String,
        required: [true, 'กรุณาระบุหมวดหมู่'],
        trim: true,
        },
        amount: {
        type: Number,
        required: [true, 'กรุณาระบุจำนวนเงิน'],
        min: [0, 'จำนวนเงินต้องไม่ติดลบ'],
        },
        date: {
        type: Date,
        required: [true, 'กรุณาระบุวันที่'],
        default: Date.now,
        },
        note: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
        },
        isDeleted: {
        type: Boolean,
        default: false, // soft delete: รองรับ "ยืนยันก่อนลบ" และเผื่อทำ undo ในอนาคต
        },
    },
    { timestamps: true }
);

// Compound index: ใช้บ่อยตอนกรองรายการของ user คนหนึ่งตามช่วงวันที่ (เรียงใหม่ไปเก่า)
transactionSchema.index({ user: 1, date: -1 });
// Compound index: ใช้ตอนกรองตามประเภท/หมวดหมู่
transactionSchema.index({ user: 1, type: 1, category: 1 });

// Query helper: ดึงเฉพาะรายการที่ยังไม่ถูกลบ (เรียกใช้แบบ Transaction.find().notDeleted())
transactionSchema.query.notDeleted = function () {
    return this.where({ isDeleted: false });
};

// Static method: คำนวณสรุปยอดรวมรายรับ/รายจ่าย/คงเหลือ ตามเงื่อนไขกรอง
// filter ตัวอย่าง: { startDate, endDate, category, type }
transactionSchema.statics.getSummary = async function (userId, filter = {}) {
    const match = {
        user: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
    };

    if (filter.startDate || filter.endDate) {
        match.date = {};
        if (filter.startDate) match.date.$gte = new Date(filter.startDate);
        if (filter.endDate) match.date.$lte = new Date(filter.endDate);
    }
    if (filter.category) match.category = filter.category;
    if (filter.type) match.type = filter.type;

    const result = await this.aggregate([
        { $match: match },
        {
        $group: {
            _id: '$type',
            total: { $sum: '$amount' },
        },
        },
    ]);

    const summary = { totalIncome: 0, totalExpense: 0, balance: 0 };
    result.forEach((r) => {
        if (r._id === 'income') summary.totalIncome = r.total;
        if (r._id === 'expense') summary.totalExpense = r.total;
    });
    summary.balance = summary.totalIncome - summary.totalExpense;

    return summary;
};

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.INCOME_CATEGORIES = INCOME_CATEGORIES;
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;