const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const ServiceRegistry = require('../container/ServiceRegistry');

// إنشاء instance من ServiceRegistry
const serviceRegistry = new ServiceRegistry();
const userController = serviceRegistry.getController('UserController');

// تسجيل مستخدم جديد
router.post('/register', userController.register.bind(userController));

// تسجيل الدخول
router.post('/login', userController.login.bind(userController));

// جلب بيانات المستخدم الحالي
router.get('/me', authMiddleware, userController.getProfile.bind(userController));

// تحديث بيانات المستخدم
router.put('/profile', authMiddleware, userController.updateProfile.bind(userController));

// تغيير كلمة المرور
router.put('/change-password', authMiddleware, userController.changePassword.bind(userController));

// شراء كورس
router.post('/purchase-course', authMiddleware, userController.purchaseCourse.bind(userController));

// جلب جميع المستخدمين (للأدمن فقط)
router.get('/all', authMiddleware, checkRole('admin'), userController.getAllUsers.bind(userController));

// إحصائيات الأدمن
router.get('/admin/stats', authMiddleware, checkRole('admin'), userController.getAdminStats.bind(userController));

// إلغاء تفعيل المستخدم
router.put('/:id/deactivate', authMiddleware, checkRole('admin'), userController.deactivateUser.bind(userController));

// تفعيل المستخدم
router.put('/:id/activate', authMiddleware, checkRole('admin'), userController.activateUser.bind(userController));

module.exports = router; 