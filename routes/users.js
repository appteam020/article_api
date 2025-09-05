const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/users/me
// @desc    جلب بيانات المستخدم الحالي عن طريق التوكن
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // req.user.id يتم إضافته بواسطة الوسيط auth بعد التحقق من التوكن
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'المستخدم غير موجود' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/users/:id
// @desc    جلب بيانات مستخدم آخر بناءً على الـ ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
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
