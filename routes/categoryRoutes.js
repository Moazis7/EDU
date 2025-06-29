const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Course = require('../models/courses');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/categories/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// استرجاع كل الكاتيجوريز مع ترتيب حسب المرحلة والاسم
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ level: 1, name: 1 });
        res.status(200).json(categories);
    } catch (err) {
        console.error('Error in GET /api/category:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// إضافة كاتيجوري جديدة (Admin only)
router.post('/', auth, checkRole('admin'), upload.single('image'), async (req, res) => {
    try {
        const { name, description, level } = req.body;
        
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'Category name is required and should be a string' });
        }

        if (!level || !['prep1', 'prep2', 'prep3', 'sec1', 'sec2', 'sec3'].includes(level)) {
            return res.status(400).json({ message: 'Valid level is required (prep1, prep2, prep3, sec1, sec2, sec3)' });
        }

        // التحقق من عدم وجود نفس الكاتيجوري في نفس المرحلة
        const existingCategory = await Category.findOne({ name, level });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category with this name already exists in this level' });
        }

        const categoryData = {
            name,
            description: description || '',
            level
        };

        // إضافة الصورة إذا تم رفعها
        if (req.file) {
            categoryData.image = req.file.path.replace(/\\/g, '/'); // Convert Windows path to URL format
        }

        const category = new Category(categoryData);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        console.error('Error in POST /api/category:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Category with this name already exists in this level' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// استرجاع كاتيجوري حسب الاسم والمرحلة
router.get('/:category', async (req, res) => {
    try {
        const { category } = req.params;

        const categoryFound = await Category.findOne({ name: category });
        if (!categoryFound) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(categoryFound);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching category', error: err.message });
    }
});

// تعديل كاتيجوري حسب الـ ID (Admin only)
router.put('/:id', auth, checkRole('admin'), upload.single('image'), async (req, res) => {
    try {
        const { name, description, level } = req.body;
        
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'Category name is required and should be a string' });
        }

        if (level && !['prep1', 'prep2', 'prep3', 'sec1', 'sec2', 'sec3'].includes(level)) {
            return res.status(400).json({ message: 'Valid level is required (prep1, prep2, prep3, sec1, sec2, sec3)' });
        }

        const updateData = { name, description };
        if (level) updateData.level = level;

        // إضافة الصورة إذا تم رفعها
        if (req.file) {
            updateData.image = req.file.path.replace(/\\/g, '/');
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ message: 'Category updated successfully', updatedCategory });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category with this name already exists in this level' });
        }
        res.status(500).json({ error: 'Failed to update category', details: error.message });
    }
});

// حذف كاتيجوري حسب الـ ID (Admin only)
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // تأكد من أنه مفيش كورسات مرتبطة بالكاتيجوري دي قبل الحذف
        const coursesCount = await Course.countDocuments({ category: req.params.id });
        if (coursesCount > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete category', 
                message: `This category has ${coursesCount} course(s) associated with it. Please delete the courses first.` 
            });
        }

        res.status(200).json({ message: 'Category deleted successfully', deletedCategory });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category', details: error.message });
    }
});

// استرجاع كاتيجوريز حسب المرحلة
router.get('/level/:level', async (req, res) => {
    try {
        const { level } = req.params;
        
        if (!['prep1', 'prep2', 'prep3', 'sec1', 'sec2', 'sec3'].includes(level)) {
            return res.status(400).json({ message: 'Invalid level' });
        }

        const categories = await Category.find({ level }).sort({ name: 1 });
        res.status(200).json(categories);
    } catch (err) {
        console.error('Error in GET /api/category/level/:level:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
