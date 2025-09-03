const mongoose = require('mongoose');

// تعريف هيكل (Schema) بيانات المستخدم
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // حقل الاسم مطلوب
  },
  email: {
    type: String,
    required: true, // حقل البريد الإلكتروني مطلوب
    unique: true,   // يجب أن يكون البريد الإلكتروني فريداً لكل مستخدم
  },
  password: {
    type: String,
    required: true, // حقل كلمة المرور مطلوب
  },
  date: {
    type: Date,
    default: Date.now, // تاريخ التسجيل، يتم تعيينه تلقائياً
  },
  favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article' // يشير إلى أن المعرفات هنا تابعة لموديل المقالات
        }
    ]
});

// تصدير الموديل (Model) الذي تم إنشاؤه من الـ Schema
// سيتم إنشاء collection باسم "users" في قاعدة البيانات
module.exports = mongoose.model('user', UserSchema);
