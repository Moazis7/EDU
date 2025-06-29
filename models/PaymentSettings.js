const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema({
  paymentRef: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema); 