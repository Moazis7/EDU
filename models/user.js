const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');  // استيراد Joi

// تعريف الـ Schema للمستخدم
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    maxlength: 20
  },
  governorate: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  purchasedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: []
  }]
}, {
  timestamps: true
});

// إضافة ميثود لتوليد التوكن
userSchema.methods.generateAuthToken = function() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  let expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  if (this.role === 'admin') {
    expiresIn = '12h'; // اجعل توكن الأدمن 12 ساعة
  }
  const token = jwt.sign(
    { _id: this._id, role: this.role }, 
    process.env.JWT_SECRET, 
    { expiresIn }
  );
  return token;
};

// إضافة دالة validate باستخدام Joi
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'admin').optional(),
    phone: Joi.string().min(7).max(20).required(),
    governorate: Joi.string().min(2).max(30).required(),
  });

  return schema.validate(user);
}

// إضافة الـ User Model
const User = mongoose.model('User', userSchema);

// تصدير الـ User Model ودالة الـ validate
module.exports = { User, validate: validateUser };
