const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/users/me
// @desc    جلب بيانات المستخدم الحالي عن طريق التوكن
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
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


// @route   PUT api/users/me
// @desc    تحديث بيانات المستخدم الحالي
// @access  Private
router.put('/me', auth, async (req, res) => {
    // استخلاص البيانات القابلة للتحديث من الجسم
    const { name, bio, avatar } = req.body;

    // بناء كائن يحتوي فقط على الحقول المرسلة في الطلب
    const profileFields = {};
    if (name) profileFields.name = name;
    if (bio) profileFields.bio = bio;
    if (avatar) profileFields.avatar = avatar;

    try {
        // البحث عن المستخدم وتحديث بياناته في خطوة واحدة
        // { new: true } لإرجاع المستند بعد التحديث
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'المستخدم غير موجود' });
        }
        
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   DELETE api/users/me
// @desc    حذف حساب المستخدم الحالي
// @access  Private
router.delete('/me', auth, async (req, res) => {
    try {
        // البحث عن المستخدم وحذفه
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'المستخدم غير موجود' });
        }
        
        // يمكنك هنا إضافة منطق لحذف كل المقالات المرتبطة بهذا المستخدم أيضاً

        res.json({ msg: 'تم حذف حساب المستخدم بنجاح' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/users/:id
// @desc    جلب بيانات مستخدم آخر بناءً على الـ ID
// @access  Private (أو Public حسب تصميمك)
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'المستخدم غير موجود' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'المستخدم غير موجود' });
        }
        res.status(500).send('Server Error');
    }
});


module.exports = router;