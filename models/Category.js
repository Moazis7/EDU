const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  level: {
    type: String,
    required: true,
    enum: ['prep1', 'prep2', 'prep3', 'sec1', 'sec2', 'sec3'],
    default: 'prep1'
  },
  image: {
    type: String, // URL للصورة
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for level and name to ensure uniqueness within each level
categorySchema.index({ level: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
