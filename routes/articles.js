const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// استيراد موديلات المستخدم والمقال
const Article = require('../models/Article');
const User = require('../models/User');

// @route   POST api/articles
// @desc    إنشاء مقال جديد
// @access  Private (خاص - يتطلب تسجيل دخول)
router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  try {
    // إنشاء مقال جديد وربطه بالمستخدم الذي سجل الدخول
    // req.user.id يأتي من الـ middleware بعد التحقق من الـ token
    const newArticle = new Article({
      title,
      content,
      user: req.user.id,
    });

    const article = await newArticle.save();
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/articles
// @desc    الحصول على كل المقالات
// @access  Public (عام)
router.get('/', async (req, res) => {
  try {
    // جلب كل المقالات وترتيبها حسب التاريخ (الأحدث أولاً)
    const articles = await Article.find().sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   PUT api/articles/:id
// @desc    تحديث مقال
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  // بناء كائن يحتوي على الحقول المراد تحديثها
  const articleFields = {};
  if (title) articleFields.title = title;
  if (content) articleFields.content = content;

  try {
    let article = await Article.findById(req.params.id);

    if (!article) return res.status(404).json({ msg: 'المقال غير موجود' });

    // التأكد من أن المستخدم الذي يحاول التعديل هو صاحب المقال
    if (article.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'غير مصرح لك' });
    }

    article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: articleFields },
      { new: true } // لإرجاع النسخة المحدثة من المقال
    );

    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/articles/:id
// @desc    حذف مقال
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let article = await Article.findById(req.params.id);

    if (!article) return res.status(404).json({ msg: 'المقال غير موجود' });

    // التأكد من أن المستخدم الذي يحاول الحذف هو صاحب المقال
    if (article.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'غير مصرح لك' });
    }

    await Article.findByIdAndRemove(req.params.id);

    res.json({ msg: 'تم حذف المقال بنجاح' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;