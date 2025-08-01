const BaseService = require('./BaseService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { validate } = require('../models/user');

class UserService extends BaseService {
  constructor(userRepository) {
    super(userRepository);
  }

  async registerUser(userData) {
    // التحقق من صحة البيانات
    const { error } = validate(userData);
    if (error) {
      throw new Error(error.details[0].message);
    }

    // التحقق من وجود المستخدم
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists.');
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // إنشاء المستخدم
    const user = await this.repository.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user'
    });

    // توليد التوكن
    const token = user.generateAuthToken();
    user.authToken = token;

    // تحديث المستخدم بالتوكن
    await this.repository.updateById(user._id, { authToken: token });

    return {
      user: _.pick(user, ['_id', 'name', 'email', 'role', 'phone', 'governorate']),
      token
    };
  }

  async loginUser(email, password) {
    // البحث عن المستخدم
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password.');
    }

    // التحقق من حالة الحساب
    if (!user.isActive) {
      throw new Error('Account is deactivated.');
    }

    // توليد توكن جديد
    const token = user.generateAuthToken();
    
    // تحديث آخر تسجيل دخول والتوكن
    await this.repository.updateById(user._id, {
      authToken: token,
      lastLogin: new Date()
    });

    return {
      user: _.pick(user, ['_id', 'name', 'email', 'role', 'phone', 'governorate']),
      token
    };
  }

  async getUserProfile(userId) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    return _.pick(user, ['_id', 'name', 'email', 'role', 'phone', 'governorate', 'purchasedCourses']);
  }

  async updateUserProfile(userId, updateData) {
    // إزالة الحقول المحمية من التحديث
    const { password, role, email, ...safeData } = updateData;
    
    const user = await this.repository.updateById(userId, safeData);
    if (!user) {
      throw new Error('User not found.');
    }

    return _.pick(user, ['_id', 'name', 'email', 'role', 'phone', 'governorate']);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // التحقق من كلمة المرور الحالية
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect.');
    }

    // تشفير كلمة المرور الجديدة
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // تحديث كلمة المرور
    await this.repository.updateById(userId, { password: hashedPassword });

    return { message: 'Password updated successfully.' };
  }

  async purchaseCourse(userId, courseId) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // التحقق من أن المستخدم لم يشتري الكورس من قبل
    if (user.purchasedCourses.includes(courseId)) {
      throw new Error('Course already purchased.');
    }

    // إضافة الكورس للمستخدم
    const updatedUser = await this.repository.addPurchasedCourse(userId, courseId);
    
    return _.pick(updatedUser, ['_id', 'name', 'purchasedCourses']);
  }

  async getAdminStats() {
    return await this.repository.getAdminStats();
  }

  async getAllUsers() {
    return await this.repository.findUsersWithCourses();
  }

  async deactivateUser(userId) {
    return await this.repository.updateById(userId, { isActive: false });
  }

  async activateUser(userId) {
    return await this.repository.updateById(userId, { isActive: true });
  }
}

module.exports = UserService; 