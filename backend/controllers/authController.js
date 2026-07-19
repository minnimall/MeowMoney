const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
}

// @route POST /api/auth/register
// รับ body: { username, email, password }
// (ฝั่ง frontend ตอนนี้เก็บ field ชื่อว่า "name" ใน form สมัครสมาชิก
//  ต้อง map เป็น username ตอนยิง request เช่น username: regForm.name)
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({ username, email, password });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error); // ให้ errorHandler กลาง จัดการ (เช่น email ซ้ำ, validation error)
  }
};

// @route POST /api/auth/login
// รับ body: { email, password }
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
    }

    // ต้อง .select('+password') เพราะใน schema ตั้ง select: false ไว้
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me  (protected)
const getMe = async (req, res, next) => {
  try {
    // req.user มาจาก middleware protect แล้ว ไม่ต้อง query ซ้ำ
    res.json({
      success: true,
      data: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/auth/me  (protected)
// รับ body: { username?, email?, avatar? }
const updateMe = async (req, res, next) => {
  try {
    const { username, email, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateMe };