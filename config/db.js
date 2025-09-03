// استيراد mongoose للتعامل مع قاعدة بيانات MongoDB
const mongoose = require('mongoose');

// دالة للاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    // محاولة الاتصال بـ MongoDB باستخدام رابط الاتصال من ملف .env

    mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));
    

    console.log('MongoDB Connected...');
  } catch (err) {
    // في حالة فشل الاتصال، يتم طباعة الخطأ وإنهاء العملية
    console.error(err.message);
    // الخروج من العملية مع رمز فشل (1)
    process.exit(1);
  }
};

// تصدير الدالة لاستخدامها في ملف server.js
module.exports = connectDB;
