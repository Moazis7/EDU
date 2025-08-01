class BaseController {
  constructor(service) {
    this.service = service;
  }

  // Helper method for successful responses
  sendSuccess(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  // Helper method for error responses
  sendError(res, error, statusCode = 500) {
    console.error('Controller Error:', error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }

  // Generic CRUD operations
  async create(req, res) {
    try {
      const result = await this.service.create(req.body);
      return this.sendSuccess(res, result, 'Created successfully', 201);
    } catch (error) {
      return this.sendError(res, error, 400);
    }
  }

  async getById(req, res) {
    try {
      const result = await this.service.findById(req.params.id);
      if (!result) {
        return this.sendError(res, new Error('Not found'), 404);
      }
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error, 404);
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sort, filter } = req.query;
      const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        sort: sort ? JSON.parse(sort) : undefined
      };
      
      const result = await this.service.find(filter ? JSON.parse(filter) : {}, options);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  async update(req, res) {
    try {
      const result = await this.service.updateById(req.params.id, req.body);
      if (!result) {
        return this.sendError(res, new Error('Not found'), 404);
      }
      return this.sendSuccess(res, result, 'Updated successfully');
    } catch (error) {
      return this.sendError(res, error, 400);
    }
  }

  async delete(req, res) {
    try {
      const result = await this.service.deleteById(req.params.id);
      if (!result) {
        return this.sendError(res, new Error('Not found'), 404);
      }
      return this.sendSuccess(res, null, 'Deleted successfully');
    } catch (error) {
      return this.sendError(res, error, 400);
    }
  }
}

module.exports = BaseController; 