const jwt = require('jsonwebtoken');

// هذه الدالة هي Middleware
// تعمل قبل الوصول إلى المسار (Route) المطلوب لحمايته
module.exports = function (req, res, next) {
  // 1. الحصول على الـ token من ترويسة الطلب (Header)
  const token = req.header('x-auth-token');

  // 2. التحقق من عدم وجود token
  if (!token) {
    return res.status(401).json({ msg: 'لا يوجد رمز، الوصول مرفوض' });
  }

  // 3. التحقق من صحة الـ token
  try {
    // فك تشفير الـ token باستخدام المفتاح السري
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // إضافة معلومات المستخدم (الـ payload) إلى كائن الطلب (req)
    // حتى نتمكن من الوصول إليها في المسارات المحمية
    req.user = decoded.user;
    
    // الانتقال إلى الدالة التالية (المسار المطلوب)
    next();
  } catch (err) {
    res.status(401).json({ msg: 'الرمز غير صالح' });
  }
};
