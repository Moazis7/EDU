const BaseRepository = require('./BaseRepository');
const Course = require('../models/courses');

class CourseRepository extends BaseRepository {
  constructor() {
    super(Course);
  }

  async findByCategory(categoryId) {
    return await this.find({ category: categoryId });
  }

  async findByLevel(level) {
    return await this.find({ level });
  }

  async findByLevelAndCategory(level, categoryId) {
    return await this.find({ level, category: categoryId });
  }

  async searchCourses(searchTerm) {
    return await this.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    });
  }

  async getCoursesByPriceRange(minPrice, maxPrice) {
    return await this.find({
      price: { $gte: minPrice, $lte: maxPrice }
    });
  }

  async getPopularCourses(limit = 10) {
    return await this.find({}, {
      sort: { purchaseCount: -1 },
      limit
    });
  }

  async getCourseStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          avgPrice: { $avg: '$price' },
          totalPurchases: { $sum: '$purchaseCount' }
        }
      }
    ]);
    
    return stats[0] || { 
      totalCourses: 0, 
      totalSize: 0, 
      avgPrice: 0, 
      totalPurchases: 0 
    };
  }

  async updatePurchaseCount(courseId) {
    return await this.model.findByIdAndUpdate(
      courseId,
      { $inc: { purchaseCount: 1 } },
      { new: true }
    );
  }
}

module.exports = CourseRepository; 