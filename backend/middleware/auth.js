const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ป้องกัน route: ต้องแนบ JWT token มาใน header ถึงจะเข้าถึงได้
// ใช้แบบ: router.get('/me', protect, getMe)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // แนบ user (ไม่รวม password) เข้ากับ req เพื่อให้ controller ถัดไปใช้ req.user ได้
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        res.status(401);
        throw new Error('ไม่พบผู้ใช้นี้ในระบบ');
      }
      next();
    } catch (error) {
      res.status(401);
      next(new Error('ไม่ได้รับอนุญาต โทเค็นไม่ถูกต้องหรือหมดอายุ'));
    }
  } else {
    res.status(401);
    next(new Error('ไม่ได้รับอนุญาต ไม่พบโทเค็น'));
  }
};

module.exports = { protect };