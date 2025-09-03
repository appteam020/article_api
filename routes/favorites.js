const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Article = require('../models/Article');

// @route   POST api/favorites/:id
// @desc    إضافة مقال إلى المفضلة
// @access  Private
router.post('/:id', auth, async (req, res) => {
    try {
        // التحقق من وجود المقال أولاً
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ msg: 'المقال غير موجود' });
        }

        // جلب المستخدم الحالي
        const user = await User.findById(req.user.id);

        // التحقق مما إذا كان المقال موجوداً بالفعل في المفضلة
        if (user.favorites.includes(req.params.id)) {
            return res.status(400).json({ msg: 'المقال موجود بالفعل في المفضلة' });
        }

        // إضافة المقال إلى بداية قائمة المفضلة
        user.favorites.unshift(req.params.id);
        await user.save();

        res.json(user.favorites);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/favorites/:id
// @desc    حذف مقال من المفضلة
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // إزالة المقال من قائمة المفضلة
        user.favorites = user.favorites.filter(
            (favorite) => favorite.toString() !== req.params.id
        );

        await user.save();
        res.json(user.favorites);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/favorites
// @desc    جلب جميع المقالات المفضلة للمستخدم
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // جلب المستخدم مع بيانات المقالات المفضلة كاملة باستخدام populate
        const user = await User.findById(req.user.id).populate('favorites');

        if (!user) {
            return res.status(404).json({ msg: 'المستخدم غير موجود' });
        }

        res.json(user.favorites);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;