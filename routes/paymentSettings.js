const express = require('express');
const router = express.Router();
const PaymentSettings = require('../models/PaymentSettings');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get payment settings (paymentRef)
router.get('/', async (req, res) => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      return res.json({ paymentRef: '' });
    }
    res.json({ paymentRef: settings.paymentRef });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payment settings', error: err.message });
  }
});

// Update payment settings (admin only)
router.post('/', auth, checkRole('admin'), async (req, res) => {
  try {
    const { paymentRef } = req.body;
    if (!paymentRef) return res.status(400).json({ message: 'Payment reference is required' });
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = new PaymentSettings({ paymentRef });
    } else {
      settings.paymentRef = paymentRef;
      settings.updatedAt = new Date();
    }
    await settings.save();
    res.json({ message: 'Payment reference updated', paymentRef: settings.paymentRef });
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment settings', error: err.message });
  }
});

module.exports = router; 