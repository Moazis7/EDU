const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const cors = require('cors');

// Middleware للسماح بالطلبات من الـ Frontend
router.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3007'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'y-auth-token'], // السماح بالتوكن في الهيدر
}));

// Route لتسجيل الدخول وتوليد التوكن
router.post('/', async (req, res) => {
    try {
        // التحقق من صحة البيانات المدخلة
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // التحقق من وجود المستخدم
        let user = await User.findOne({ email: req.body.email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // التحقق من أن المستخدم نشط
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Please contact administrator.' });
        }

        // التحقق من صحة كلمة المرور
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // تحديث آخر تسجيل دخول
        user.lastLogin = new Date();
        await user.save();

        // توليد التوكن
        const token = user.generateAuthToken();
        
        // الرد بالتوكن والهيدر مع الدور
        res.header('y-auth-token', token).json({
            message: 'Login successful',
            token: token,
            user: _.pick(user, ['_id', 'name', 'email', 'role', 'lastLogin'])
        });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route لتسجيل الخروج (اختياري - يمكن تنفيذه في الفرونت إند)
router.post('/logout', (req, res) => {
    // في JWT، لا يمكن إلغاء التوكن من الخادم
    // ولكن يمكن إضافة التوكن إلى قائمة سوداء إذا لزم الأمر
    res.json({ message: 'Logout successful' });
});

// Route للتحقق من صحة التوكن
router.get('/verify', (req, res) => {
    const token = req.header('y-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ 
            valid: true, 
            user: decoded,
            message: 'Token is valid' 
        });
    } catch (error) {
        res.status(401).json({ 
            valid: false, 
            message: 'Invalid token' 
        });
    }
});

// الدالة الخاصة بالتحقق من البيانات
function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).email().required(),
        password: Joi.string().min(6).max(1024).required()
    });
    return schema.validate(req);
}

module.exports = router;
