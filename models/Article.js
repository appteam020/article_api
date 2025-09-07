const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // تمت إضافة الحقل التالي
  category: {
    type: String,
    required: true, // اجعله مطلوبًا إذا كان كل مقال يجب أن يتبع لتصنيف
  },
  createdAt: { // تم تصحيح الخطأ الإملائي من createdAT
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('article', ArticleSchema);