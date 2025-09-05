const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET api/users/:id
// @desc    جلب بيانات مستخدم بناءً على الـ ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        // البحث عن المستخدم باستخدام الـ ID المأخوذ من الرابط
        // .select('-password') لمنع إرسال كلمة المرور في الرد
        const user = await User.findById(req.params.id).select('-password');

        // إذا لم يتم العثور على المستخدم، أرسل خطأ 404
        if (!user) {
            return res.status(404).json({ msg: 'المستخدم غير موجود' });
        }

        // إرسال بيانات المستخدم كـ JSON
        res.json(user);

    } catch (err) {
        console.error(err.message);

        // إذا كان الـ ID غير صالح، أرسل نفس رسالة الخطأ
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'المستخدم غير موجود' });
        }

        res.status(500).send('Server Error');
    }
});

module.exports = router;
