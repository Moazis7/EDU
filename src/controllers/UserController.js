const BaseController = require('./BaseController');

class UserController extends BaseController {
  constructor(userService) {
    super(userService);
  }

  // تسجيل مستخدم جديد
  async register(req, res) {
    try {
      const result = await this.service.registerUser(req.body);
      
      // إضافة التوكن في الهيدر
      res.header('y-auth-token', result.token);
      
      return this.sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      return this.sendError(res, error, 400);
    }
  }

  // تسجيل الدخول
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return this.sendError(res, new Error('Email and password are required'), 400);
      }

      const result = await this.service.loginUser(email, password);
      
      // إضافة التوكن في الهيدر
      res.header('y-auth-token', result.token);
      
      return this.sendSuccess(res, result, 'Login successful');
    } catch (error) {
      return this.sendError(res, error, 401);
    }
  }

  // جلب بيانات المستخدم الحالي
  async getProfile(req, res) {
    try {
      const result = await this.service.getUserProfile(req.user._id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error, 404);
    }
  }

  // تحديث بيانات المستخدم
  async updateProfile(req, res) {
    try {
      const result = await this.service.updateUserProfile(req.user._id, req.body);
      return this.sendSuccess(res, result, 'Profile updated successfully');
    } catch (error) {
      return this.sendError(res, error, 400);
    }
  }

  // تغيير كلمة المرور
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return this.sendError(res, new Error('Current password and new password are required'), 400);
      }

      const result = await this.service.changePassword(req.user._id, currentPassword, newPassword);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error, 400);
    }
  }

  // شراء كورس
  async purchaseCourse(req, res) {
    try {
      const { courseId } = req.body;
      
      if (!courseId) {
        return this.sendError(res, new Error('Course ID is required'), 400);
      }

      const result = await this.service.purchaseCourse(req.user._id, courseId);
      return this.sendSuccess(res, result, 'Course purchased successfully');
    } catch (error) {
      return this.sendError(res, error, 400);
    }
  }

  // جلب جميع المستخدمين (للأدمن)
  async getAllUsers(req, res) {
    try {
      const result = await this.service.getAllUsers();
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // إحصائيات الأدمن
  async getAdminStats(req, res) {
    try {
      const result = await this.service.getAdminStats();
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // إلغاء تفعيل المستخدم
  async deactivateUser(req, res) {
    try {
      const result = await this.service.deactivateUser(req.params.id);
      return this.sendSuccess(res, result, 'User deactivated successfully');
    } catch (error) {
      return this.sendError(res, error, 404);
    }
  }

  // تفعيل المستخدم
  async activateUser(req, res) {
    try {
      const result = await this.service.activateUser(req.params.id);
      return this.sendSuccess(res, result, 'User activated successfully');
    } catch (error) {
      return this.sendError(res, error, 404);
    }
  }
}

module.exports = UserController; 