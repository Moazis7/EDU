const BaseRepository = require('./BaseRepository');
const { User } = require('../models/user');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async findUsersWithCourses() {
    return await this.find({}, {
      populate: 'purchasedCourses',
      select: '-password'
    });
  }

  async updateLastLogin(userId) {
    return await this.updateById(userId, { lastLogin: new Date() });
  }

  async addPurchasedCourse(userId, courseId) {
    return await this.model.findByIdAndUpdate(
      userId,
      { $addToSet: { purchasedCourses: courseId } },
      { new: true }
    );
  }

  async removePurchasedCourse(userId, courseId) {
    return await this.model.findByIdAndUpdate(
      userId,
      { $pull: { purchasedCourses: courseId } },
      { new: true }
    );
  }

  async getAdminStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || { totalUsers: 0, activeUsers: 0 };
  }
}

module.exports = UserRepository; 