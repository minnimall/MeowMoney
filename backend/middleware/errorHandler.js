// Middleware จัดการ error กลาง ให้ controller แค่ throw หรือ next(error) มาที่นี่
// ต้องวางไว้เป็นตัวสุดท้ายใน server.js (หลัง routes ทั้งหมด)
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์';

    // Mongoose bad ObjectId (เช่น id ผิด format ตอน findById)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'ไม่พบข้อมูลที่ต้องการ';
    }

    // Mongoose validation error (เช่น required field ไม่ครบ)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
        .map((val) => val.message)
        .join(', ');
    }

    // Mongoose duplicate key (เช่น email/username ซ้ำ)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} นี้ถูกใช้งานแล้ว`;
    }

    res.status(statusCode).json({
        success: false,
        message,
        // แสดง stack trace เฉพาะตอน dev เท่านั้น เพื่อความปลอดภัยตอน production
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// จัดการ route ที่ไม่มีอยู่จริง (404)
const notFound = (req, res, next) => {
    const error = new Error(`ไม่พบเส้นทาง - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };