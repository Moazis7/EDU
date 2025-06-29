const Joi = require('joi');

// Validation middleware للبيانات المدخلة
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  // User registration
  registerUser: Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'admin').optional()
  }),

  // User login
  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  // Category creation
  createCategory: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(200).optional()
  }),

  // Cart item
  addToCart: Joi.object({
    fileId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).default(1)
  }),

  // File upload
  fileUpload: Joi.object({
    descriptions: Joi.string().optional(),
    category: Joi.string().required()
  })
};

module.exports = { validate, schemas }; 