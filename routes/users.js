const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/users/me
// @desc    جلب بيانات المستخدم الحالي مع مقالاته المفضلة
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate({
                path: 'favorites', // املأ حقل المفضلة
                populate: {
                    path: 'author', // بداخل كل عنصر مفضل، املأ حقل الكاتب
                    select: 'name'  // واختر فقط اسم الكاتب
                }
            });

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
    const { name, bio, avatar } = req.body;
    const profileFields = {};
    if (name) profileFields.name = name;
    if (bio) profileFields.bio = bio;
    if (avatar) profileFields.avatar = avatar;

    try {
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
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'المستخدم غير موجود' });
        }
        res.json({ msg: 'تم حذف حساب المستخدم بنجاح' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/users/:id
// @desc    جلب بيانات مستخدم آخر مع مقالاته المفضلة
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        //                       👇 وهذا هو التعديل الثاني
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate({
                path: 'favorites', // املأ حقل المفضلة
                populate: {
                    path: 'author', // بداخل كل عنصر مفضل، املأ حقل الكاتب
                    select: 'name'  // واختر فقط اسم الكاتب
                }
            });

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