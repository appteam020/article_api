// استيراد المكتبات الأساسية
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// تحميل متغيرات البيئة من ملف .env
require('dotenv').config();

// إنشاء تطبيق Express
const app = express();

// 1. الاتصال بقاعدة البيانات
connectDB();

// 2. إعداد الـ Middlewares
// للسماح للطلبات من مصادر مختلفة (مهم عند ربط الواجهة الأمامية)
app.use(cors()); 
// لتمكين التطبيق من قراءة بيانات JSON القادمة في جسم الطلب (Request Body)
app.use(express.json({ extended: false }));

// رسالة ترحيبية عند الدخول على الرابط الرئيسي
app.get('/', (req, res) => res.send('API is running...'));

// 3. تحديد ملفات المسارات (Routes)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/favorites', require('./routes/favorites'));
// تحديد المنفذ (Port) الذي سيعمل عليه الخادم
// سيتم استخدام المنفذ 5000 كافتراضي إذا لم يتم تعيينه في متغيرات البيئة
const PORT = process.env.PORT || 5000;

// تشغيل الخادم للاستماع للطلبات على المنفذ المحدد
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


