const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // หยุดเซิร์ฟเวอร์ถ้าต่อ DB ไม่ได้ เพราะแอปทำงานต่อไม่ได้อยู่แล้ว
    }
};

module.exports = connectDB;