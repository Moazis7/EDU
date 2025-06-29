const express = require('express');
const router = express.Router();
const PurchaseCode = require('../models/PurchaseCode');
const Course = require('../models/courses');
const { User } = require('../models/user');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Helper: generate random code
function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 1. Create multiple purchase codes (admin only)
router.post('/create', auth, checkRole('admin'), async (req, res) => {
  try {
    const { courseId, count } = req.body;
    const numCodes = parseInt(count) || 1;
    
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid courseId' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let codes = [];
    for (let i = 0; i < numCodes; i++) {
      let code, exists = true;
      // Ensure code is unique
      while (exists) {
        code = generateRandomCode(8);
        exists = await PurchaseCode.findOne({ code });
      }
      const purchaseCode = new PurchaseCode({ code, course: courseId });
      await purchaseCode.save();
      codes.push(purchaseCode);
    }
    
    res.status(201).json({ 
      message: `${codes.length} purchase codes created successfully`, 
      codes: codes 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating codes', error: err.message });
  }
});

// 2. List all purchase codes (admin only)
router.get('/', auth, checkRole('admin'), async (req, res) => {
  try {
    const codes = await PurchaseCode.find().populate('course').populate('usedBy');
    res.json(codes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching codes', error: err.message });
  }
});

// 3. Verify and use a purchase code (user)
router.post('/verify', auth, async (req, res) => {
  try {
    const { code, courseId } = req.body;
    if (!code || !courseId) {
      return res.status(400).json({ message: 'Code and courseId are required' });
    }
    const purchaseCode = await PurchaseCode.findOne({ code, course: courseId });
    if (!purchaseCode) {
      return res.status(404).json({ message: 'Invalid code or course' });
    }
    if (purchaseCode.used) {
      return res.status(400).json({ message: 'Code already used' });
    }
    // Mark as used
    purchaseCode.used = true;
    purchaseCode.usedBy = req.user._id;
    purchaseCode.usedAt = new Date();
    await purchaseCode.save();
    // Enroll user in course
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.purchasedCourses.includes(courseId)) {
      user.purchasedCourses.push(courseId);
      await user.save();
    }
    res.json({ message: 'Code verified and course activated', courseId });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying code', error: err.message });
  }
});

// 4. Delete a purchase code (admin only)
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const code = await PurchaseCode.findByIdAndDelete(id);
    if (!code) return res.status(404).json({ message: 'Code not found' });
    res.json({ message: 'Code deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting code', error: err.message });
  }
});

module.exports = router; 