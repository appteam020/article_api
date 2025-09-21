const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// استيراد موديل المستخدم
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    تسجيل مستخدم جديد
// @access  Public (عام)
router.post('/register', async (req, res) => {
  // استخراج البيانات من جسم الطلب
  const { name, email, password } = req.body;

  try {
    // 1. التحقق مما إذا كان المستخدم موجوداً بالفعل
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'المستخدم مسجل بالفعل' });
    }

    // إنشاء مستخدم جديد في الذاكرة (وليس في قاعدة البيانات بعد)
    user = new User({
      name,
      email,
      password,
    });

    // 2. تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 3. حفظ المستخدم في قاعدة البيانات
    await user.save();

    // 4. إنشاء وإرجاع Token (JWT)
    const payload = {
      user: {
        id: user.id, // استخدام id المستخدم في الـ payload
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // صلاحية الـ token
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    تسجيل دخول المستخدم
// @access  Public (عام)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'بيانات الاعتماد غير صحيحة' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'بيانات الاعتماد غير صحيحة' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        // --- Start of Modifications ---

        // 1. Define the expiration duration in seconds (5 hours)
        const expiresInSeconds = 18000;

        // 2. Calculate the exact expiration Date object
        // Get current time in milliseconds and add the duration
        const expirationDate = new Date(Date.now() + expiresInSeconds * 1000);

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: expiresInSeconds },
            (err, token) => {
                if (err) throw err;

                // 3. Send the token and the calculated expiration date
                res.json({
                    token,
                    expiresAt: expirationDate.toISOString() // Send as standard ISO string
                });
            }
        );
        // --- End of Modifications ---

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
router.put('/changepassword', authMiddleware, async (req, res) => {
    try {
        // 1. Get old and new passwords from the request body
        const { oldPassword, newPassword } = req.body;

        // 2. Basic validation
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ msg: 'Please provide both old and new passwords' });
        }

        // It's good practice to check the new password's length
        if (newPassword.length < 8) {
            return res.status(400).json({ msg: 'New password must be at least 8 characters long' });
        }

        // 3. Find the user in the database
        // The auth middleware gives us req.user, but it might not include the password.
        // So, we fetch the user again to ensure we have the password hash.
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // 4. Verify the old password
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Incorrect old password' });
        }

        // 5. Hash the new password and save the user
        // We can just assign the new password, and the pre-save hook in the User model will hash it automatically.
        user.password = newPassword;
        await user.save();

        res.json({ msg: 'Password changed successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;