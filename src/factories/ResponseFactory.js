class ResponseFactory {
  // إنشاء رد نجاح
  static createSuccessResponse(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString()
    };
  }

  // إنشاء رد خطأ
  static createErrorResponse(error, statusCode = 500) {
    return {
      success: false,
      message: error.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      statusCode,
      timestamp: new Date().toISOString()
    };
  }

  // إنشاء رد تحقق
  static createValidationResponse(errors) {
    return {
      success: false,
      message: 'Validation failed',
      errors,
      statusCode: 400,
      timestamp: new Date().toISOString()
    };
  }

  // إنشاء رد صفحة
  static createPaginatedResponse(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  // إنشاء رد إحصائيات
  static createStatsResponse(stats) {
    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ResponseFactory; 