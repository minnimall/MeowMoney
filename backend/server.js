require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes (สร้างไฟล์เหล่านี้ใน routes/ ถ้ายังไม่มี)
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const savingsGoalRoutes = require('./routes/savingsGoalRoutes');

// เชื่อมต่อ MongoDB Atlas
connectDB();

const app = express();

// Middleware พื้นฐาน
app.use(cors({
  origin: [
    'http://localhost:5173', // สำหรับตอน dev
    'https://meowmoney-nine.vercel.app' // โดเมนจริงบน Vercel
  ],
  credentials: true
}));
app.use(express.json()); // parse JSON body
app.use(express.urlencoded({ extended: true }));

// Route ทดสอบว่าเซิร์ฟเวอร์ทำงาน
app.get('/', (req, res) => {
    res.json({ message: 'API ระบบบันทึกรายรับรายจ่ายทำงานปกติ' });
});

// ผูก routes เข้ากับ path หลัก
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);


// ต้องอยู่หลัง routes ทั้งหมดเสมอ
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server กำลังทำงานที่ port ${PORT}`);
});