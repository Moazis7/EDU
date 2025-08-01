const mongoose = require('mongoose');

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      const entity = new this.model(data);
      return await entity.save();
    } catch (error) {
      throw new Error(`Error creating ${this.model.modelName}: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new Error(`Error finding ${this.model.modelName} by ID: ${error.message}`);
    }
  }

  async findOne(filter) {
    try {
      return await this.model.findOne(filter);
    } catch (error) {
      throw new Error(`Error finding ${this.model.modelName}: ${error.message}`);
    }
  }

  async find(filter = {}, options = {}) {
    try {
      let query = this.model.find(filter);
      
      if (options.populate) {
        query = query.populate(options.populate);
      }
      
      if (options.sort) {
        query = query.sort(options.sort);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.skip) {
        query = query.skip(options.skip);
      }
      
      return await query.exec();
    } catch (error) {
      throw new Error(`Error finding ${this.model.modelName}: ${error.message}`);
    }
  }

  async updateById(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new Error(`Error updating ${this.model.modelName}: ${error.message}`);
    }
  }

  async deleteById(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting ${this.model.modelName}: ${error.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw new Error(`Error counting ${this.model.modelName}: ${error.message}`);
    }
  }

  async aggregate(pipeline) {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      throw new Error(`Error aggregating ${this.model.modelName}: ${error.message}`);
    }
  }
}

module.exports = BaseRepository; 