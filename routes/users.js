const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole'); // استيراد ميدل وير للتحقق من الدور
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const express = require('express');
const cors = require('cors');
const router = express.Router();
const { User, validate } = require('../models/user');
const File = require('../models/courses');
const Category = require('../models/Category');

// تفعيل CORS للسماح بالاتصال بين React والـ API
router.use(cors({
  origin: '*',
  exposedHeaders: ['y-auth-token']
}));

// عرض بيانات المستخدم المسجل
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).send({ message: 'User not found.' });
        res.send(user);
    } catch (error) {
        res.status(500).send({ message: 'Failed to retrieve user data.', error: error.message });
    }
});

// تسجيل مستخدم جديد
router.post('/', async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send({ message: 'Email already exists.' });

        // افتراض أن المستخدم المسجل حديثاً سيكون User ما لم يُحدد دور آخر
        const role = req.body.role || 'user';

        user = new User(_.pick(req.body, ['name', 'email', 'password', 'phone', 'governorate']));
        user.role = role;  // تحديد الدور

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        const token = user.generateAuthToken();
        user.authToken = token;

        await user.save();

        res.status(201).header('y-auth-token', token).send({
            message: 'User registered successfully.',
            user: _.pick(user, ['_id', 'name', 'email', 'role', 'phone', 'governorate']),
            token
        });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send({ message: 'Internal Server Error', error: err.message });
    }
});

// **GET**: استعراض جميع المستخدمين (للمسؤول فقط)
router.get('/all', authMiddleware, checkRole('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ message: 'Failed to retrieve users.', error: error.message });
    }
});

// إحصائيات الأدمن
router.get('/admin/stats', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const [fileCount, totalFileSize, categoryCount, userCount] = await Promise.all([
      File.countDocuments(),
      File.aggregate([{ $group: { _id: null, total: { $sum: "$filePath" } } }]), // We'll fix this below
      Category.countDocuments(),
      User.countDocuments()
    ]);

    // حساب الحجم الإجمالي للملفات (نجمع حجم الملفات من النظام)
    const files = await File.find({}, 'filePath');
    const fs = require('fs');
    let totalSize = 0;
    for (const file of files) {
      try {
        const stats = fs.statSync(file.filePath);
        totalSize += stats.size;
      } catch (e) {}
    }

    res.json({
      fileCount,
      totalFileSize: totalSize,
      categoryCount,
      userCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin stats', error: err.message });
  }
});

// حذف مستخدم (Admin only)
router.delete('/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to delete user.', error: error.message });
  }
});

// تعديل بيانات مستخدم (Admin only)
router.put('/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const { name, email, role, isActive, phone, governorate } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive, phone, governorate },
      { new: true }
    );
    res.status(200).send({ message: 'User updated successfully.', user });
  } catch (error) {
    res.status(500).send({ message: 'Failed to update user.', error: error.message });
  }
});

module.exports = router;
