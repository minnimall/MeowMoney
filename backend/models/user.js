const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'กรุณากรอกชื่อผู้ใช้'],
      unique: true,
      trim: true,
      minlength: [3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'],
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'กรุณากรอกอีเมล'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'รูปแบบอีเมลไม่ถูกต้อง'],
    },
    password: {
      type: String,
      required: [true, 'กรุณากรอกรหัสผ่าน'],
      minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'],
      select: false, // ไม่ดึง password ออกมาโดย default เวลา query
    },
    avatar: {
      type: String,
      enum: ['initial', 'yapapa', 'happy', 'robocat'],
      default: 'initial',
    },
  },
  { timestamps: true }
);

// เข้ารหัส password ก่อนบันทึกทุกครั้งที่มีการแก้ไข password
// หมายเหตุ: ห้ามใส่ next เป็นพารามิเตอร์คู่กับ async function เด็ดขาด
// Mongoose รุ่นใหม่จะรอ Promise ที่ async function คืนค่าเองอยู่แล้ว
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// method สำหรับเช็ค password ตอน login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);