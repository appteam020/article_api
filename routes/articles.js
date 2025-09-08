const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// استيراد موديلات المستخدم والمقال
const Article = require('../models/Article');
const User = require('../models/User');

// @route   POST api/articles
// @desc    إنشاء مقال جديد
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  // تم إضافة category هنا
  const { title, content, category } = req.body;

  // التحقق من وجود الحقول المطلوبة
  if (!title || !content || !category) {
    return res.status(400).json({ msg: 'يرجى إدخال العنوان والمحتوى والتصنيف' });
  }

  try {
    const newArticle = new Article({
      title,
      content,
      category, // تم إضافة التصنيف
      user: req.user.id,
    });

    const article = await newArticle.save();
    // إرجاع المقال مع بيانات الناشر
    const populatedArticle = await Article.findById(article._id).populate('user', 'name');
    res.json(populatedArticle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/articles
// @desc    الحصول على كل المقالات مع اسم الناشر
// @access  Public
router.get('/', async (req, res) => {
  try {
    // تم تعديل الاستعلام ليشمل populate لجلب اسم الناشر وتصحيح حقل الترتيب
    const articles = await Article.find()
      .populate('user', 'name') // <-- جلب اسم الناشر
      .sort({ createdAt: -1 }); // <-- الترتيب حسب تاريخ الإنشاء
    res.json(articles);
  } catch (err)    {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/articles/:id
// @desc    الحصول على مقال واحد بواسطة ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
      const article = await Article.findById(req.params.id)
        .populate('user', 'name'); // <-- جلب اسم الناشر
  
      if (!article) {
        return res.status(404).json({ msg: 'المقال غير موجود' });
      }
  
      res.json(article);
    } catch (err) {
      console.error(err.message);
      // إذا كان الـ ID غير صالح، أرجع خطأ 404
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'المقال غير موجود' });
      }
      res.status(500).send('Server Error');
    }
  });
// @route   GET /api/articles/myarticles
// @desc    جلب المقالات التي كتبها المستخدم الحالي (اقتباساتي)
// @access  Private
router.get('/myarticles', authMiddleware, async (req, res) => {
    try {
        // البحث عن المقالات بناءً على ID المستخدم المأخوذ من التوكن
        const articles = await Article.find({ author: req.user.id }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// ==========================================================

// @route   PUT api/articles/:id
// @desc    تحديث مقال
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  // تم إضافة category هنا
  const { title, content, category } = req.body;

  const articleFields = {};
  if (title) articleFields.title = title;
  if (content) articleFields.content = content;
  if (category) articleFields.category = category; // <-- السماح بتحديث التصنيف

  try {
    let article = await Article.findById(req.params.id);

    if (!article) return res.status(404).json({ msg: 'المقال غير موجود' });

    if (article.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'غير مصرح لك' });
    }

    article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: articleFields },
      { new: true }
    ).populate('user', 'name'); // <-- إرجاع النسخة المحدثة مع اسم الناشر

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

    if (article.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'غير مصرح لك' });
    }

    // تم استخدام findByIdAndDelete بدلاً من findByIdAndRemove المهملة
    await Article.findByIdAndDelete(req.params.id);

    res.json({ msg: 'تم حذف المقال بنجاح' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// ==========================================================




module.exports = router;