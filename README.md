# MeowMoney

แอปจดรายรับ-รายจ่ายง่ายๆ ที่ช่วยให้คุณคุมเงินอยู่หมัด ไม่ว่าจะตั้งเป้าออมเงิน กำหนดงบใช้จ่ายรายเดือน/รายอาทิตย์ หรือดูว่าเงินหมดไปกับอะไรบ้าง MeowMoney มีให้ครบ 🐾

🔗 Demo: [meowmoney-nine.vercel.app](https://meowmoney-nine.vercel.app/)

## ฟีเจอร์

- 💰 บันทึกรายรับ-รายจ่าย
- 🎯 ตั้งเป้าหมายออมเงิน
- 📅 กำหนดงบรายเดือน/รายอาทิตย์
- 📜 ดูประวัติการทำรายการย้อนหลัง
- 📊 กราฟดูสัดส่วนรายจ่าย
- 🧾 สรุปยอดรายเดือน

## เทคโนโลยี

React · Tailwind CSS · MongoDB

## วิธีรันโปรเจกต์

```bash
git clone https://github.com/<username>/meowmoney.git
cd meowmoney
npm install
```

สร้างไฟล์ `.env` แล้วใส่:

```env
MONGODB_URI=your_mongodb_connection_string
```

รันโปรเจกต์:

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)
