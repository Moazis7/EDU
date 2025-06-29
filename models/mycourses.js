const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // الربط مع موديل المستخدم
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File', // الربط مع موديل المنتجات (الملفات)
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  dateAdded: {
    type: Date,
    default: Date.now, // تاريخ إضافة المنتج إلى العربة
  },
  status: {
    type: String,
    enum: ['in-cart', 'purchased', 'removed'], // الحالة: موجود في العربة، تم الشراء، تم الحذف
    default: 'in-cart',
  },
}, {
  timestamps: true
});

// إضافة index لتحسين الأداء
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
