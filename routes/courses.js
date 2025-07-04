const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/courses');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { upload, uploadVideo, uploadThumbnail, uploadMultiple, cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  console.error('🔥 Multer Error:', err);
  console.error('🔥 Error code:', err.code);
  console.error('🔥 Error message:', err.message);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size too large. Please use smaller files.',
        error: err.message
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files uploaded.',
        error: err.message
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field.',
        error: err.message
      });
    }
  }
  
  // Log any other errors
  console.error('🔥 Non-Multer Error:', err);
  next(err);
};

// **POST**: إضافة كورس جديد (للأدمن فقط)
router.post(
  '/',
  auth,
  checkRole('admin'),
  (req, res, next) => {
    console.log('🔍 Course upload request received');
    console.log('📝 Request headers:', req.headers);
    console.log('📝 Request body keys:', Object.keys(req.body));
    console.log('📁 Request files:', req.files);
    next();
  },
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'files', maxCount: 10 }
  ]),
  handleMulterError,
  async (req, res) => {
    try {
      console.log('✅ Multer processing completed');
      console.log('📁 Processed files:', req.files);
      console.log('📝 Processed body:', req.body);
      
      const { title, description, level, category, price } = req.body;
      
      // التحقق من البيانات المطلوبة
      if (!title || !level || !category || !price) {
        return res.status(400).json({ 
          message: 'Title, level, category, and price are required.' 
        });
      }

      // التحقق من صحة المرحلة الدراسية
      const validLevels = ['prep1', 'prep2', 'prep3', 'sec1', 'sec2', 'sec3'];
      if (!validLevels.includes(level)) {
        return res.status(400).json({ 
          message: 'Invalid level. Must be one of: prep1, prep2, prep3, sec1, sec2, sec3' 
        });
      }

      // التحقق من وجود الكاتيجوري
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found.' });
      }

      // التحقق من أن الكاتيجوري تنتمي للمرحلة المحددة
      if (categoryExists.level !== level) {
        return res.status(400).json({ 
          message: 'Category does not belong to the specified level.' 
        });
      }

      // تجهيز بيانات الكورس
      const courseData = {
        title,
        description: description || '',
        level,
        category,
        price: parseFloat(price)
      };

      // إضافة الصورة المصغرة من Cloudinary
      if (req.files.thumbnail) {
        // Validate image file type
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(req.files.thumbnail[0].mimetype)) {
          return res.status(400).json({ 
            message: 'Invalid image file type. Please use JPEG, PNG, GIF, or WebP.' 
          });
        }
        
        // Additional file extension check
        const fileExtension = req.files.thumbnail[0].originalname.split('.').pop().toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!validExtensions.includes(fileExtension)) {
          return res.status(400).json({ 
            message: `Invalid file extension: ${fileExtension}. Please use JPEG, PNG, GIF, or WebP files.` 
          });
        }
        
        // Validate image file size (5MB)
        const maxImageSize = 5 * 1024 * 1024;
        if (req.files.thumbnail[0].size > maxImageSize) {
          return res.status(400).json({ 
            message: `Image file too large. Maximum size is 5MB. Current size: ${(req.files.thumbnail[0].size / 1024 / 1024).toFixed(2)}MB` 
          });
        }
        
        // Check if file is corrupted or empty
        if (req.files.thumbnail[0].size === 0) {
          return res.status(400).json({ 
            message: 'Image file is empty or corrupted. Please try with a different file.' 
          });
        }
        
        // Check if file path exists and is readable
        if (req.files.thumbnail[0].path.startsWith('http')) {
          // It's a Cloudinary URL, no need to check local file
          console.log('✅ File uploaded to Cloudinary successfully');
        } else {
          // It's a local path, check if file exists
          if (!fs.existsSync(req.files.thumbnail[0].path)) {
            return res.status(400).json({ 
              message: 'Image file not found on server. Please try uploading again.' 
            });
          }
          
          // Try to read file to check if it's corrupted
          try {
            const stats = fs.statSync(req.files.thumbnail[0].path);
            if (stats.size === 0) {
              return res.status(400).json({ 
                message: 'Image file is empty. Please try with a different file.' 
              });
            }
          } catch (fileError) {
            return res.status(400).json({ 
              message: 'Error reading image file. File may be corrupted.' 
            });
          }
        }
        
        console.log(`🖼️ Processing image: ${(req.files.thumbnail[0].size / 1024 / 1024).toFixed(2)}MB`);
        courseData.thumbnail = req.files.thumbnail[0].path;
      }

      // إضافة الفيديو من Cloudinary
      if (req.files.video) {
        // Validate video file type
        const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
        if (!allowedVideoTypes.includes(req.files.video[0].mimetype)) {
          return res.status(400).json({ 
            message: 'Invalid video file type. Please use MP4, AVI, MOV, WMV, FLV, or WebM.' 
          });
        }
        
        // Additional file extension check
        const fileExtension = req.files.video[0].originalname.split('.').pop().toLowerCase();
        const validExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
        if (!validExtensions.includes(fileExtension)) {
          return res.status(400).json({ 
            message: `Invalid file extension: ${fileExtension}. Please use MP4, AVI, MOV, WMV, FLV, or WebM files.` 
          });
        }
        
        // Validate video file size (100MB)
        const maxVideoSize = 100 * 1024 * 1024;
        if (req.files.video[0].size > maxVideoSize) {
          return res.status(400).json({ 
            message: `Video file too large. Maximum size is 100MB. Current size: ${(req.files.video[0].size / 1024 / 1024).toFixed(2)}MB` 
          });
        }
        
        // Check if file is corrupted or empty
        if (req.files.video[0].size === 0) {
          return res.status(400).json({ 
            message: 'Video file is empty or corrupted. Please try with a different file.' 
          });
        }
        
        // Check if file path exists and is readable
        if (req.files.video[0].path.startsWith('http')) {
          // It's a Cloudinary URL, no need to check local file
          console.log('✅ Video uploaded to Cloudinary successfully');
        } else {
          // It's a local path, check if file exists
          if (!fs.existsSync(req.files.video[0].path)) {
            return res.status(400).json({ 
              message: 'Video file not found on server. Please try uploading again.' 
            });
          }
          
          // Try to read file to check if it's corrupted
          try {
            const stats = fs.statSync(req.files.video[0].path);
            if (stats.size === 0) {
              return res.status(400).json({ 
                message: 'Video file is empty. Please try with a different file.' 
              });
            }
          } catch (fileError) {
            return res.status(400).json({ 
              message: 'Error reading video file. File may be corrupted.' 
            });
          }
        }
        
        console.log(`🎬 Video processed: ${(req.files.video[0].size / 1024 / 1024).toFixed(2)}MB`);
        courseData.video = req.files.video[0].path;
      }

      // إضافة الملفات الإضافية من Cloudinary
      if (req.files.files) {
        courseData.files = req.files.files.map(file => ({
          filename: file.originalname,
          filePath: file.path,
          mimeType: file.mimetype,
          description: ''
        }));
      }

      console.log('💾 Saving course to database...');
      const course = new Course(courseData);
      const savedCourse = await course.save();
      
      // Populate category data
      await savedCourse.populate('category');
      
      console.log('✅ Course saved successfully');
      res.status(201).json({ 
        message: 'Course added successfully', 
        course: savedCourse 
      });
    } catch (err) {
      console.error('❌ Error in course creation route:', err);
      
      // Handle specific Cloudinary errors
      if (err.message && err.message.includes('File too large')) {
        return res.status(400).json({ 
          message: 'File too large for Cloudinary free plan. Maximum size is 100MB. Please compress your files or use smaller ones.',
          error: err.message 
        });
      }
      
      if (err.message && err.message.includes('bandwidth') || err.message.includes('quota')) {
        return res.status(429).json({ 
          message: 'Cloudinary bandwidth or storage quota exceeded. Please try again later or upgrade your plan.',
          error: err.message 
        });
      }
      
      if (err.message && err.message.includes('compression')) {
        return res.status(400).json({ 
          message: 'Video compression failed. Please try with a smaller video file or compress it manually.',
          error: err.message 
        });
      }
      
      if (err.message && err.message.includes('Invalid image file') || err.message.includes('corrupted')) {
        return res.status(400).json({ 
          message: 'The uploaded image file is corrupted or invalid. Please try with a different image file.',
          error: err.message 
        });
      }
      
      if (err.message && err.message.includes('File format not supported')) {
        return res.status(400).json({ 
          message: 'File format not supported. Please use JPEG, PNG, GIF, or WebP for images.',
          error: err.message 
        });
      }
      
      res.status(500).json({ 
        message: 'Error creating course.', 
        error: err.message 
      });
    }
  }
);

// **GET**: جلب جميع الكورسات
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('category')
      .sort({ createdAt: -1 });
    res.status(200).json({ products: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error fetching courses.', 
      error: err.message 
    });
  }
});

// **GET**: جلب كورس محدد
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('category');
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    res.status(200).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error fetching course.', 
      error: err.message 
    });
  }
});

// **PUT**: تحديث كورس (للأدمن فقط)
router.put(
  '/:id',
  auth,
  checkRole('admin'),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'files', maxCount: 10 }
  ]),
  handleMulterError,
  async (req, res) => {
    try {
      const { title, description, level, category, price } = req.body;
      const courseId = req.params.id;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found.' });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (level) updateData.level = level;
      if (category) updateData.category = category;
      if (price) updateData.price = parseFloat(price);

      // إضافة الصورة المصغرة من Cloudinary
      if (req.files.thumbnail) {
        // حذف الصورة القديمة من Cloudinary إذا كانت موجودة
        if (course.thumbnail && course.thumbnail.includes('cloudinary')) {
          const publicId = course.thumbnail.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
        // Validate image file type
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(req.files.thumbnail[0].mimetype)) {
          return res.status(400).json({ 
            message: 'Invalid image file type. Please use JPEG, PNG, GIF, or WebP.' 
          });
        }
        
        // Additional file extension check
        const fileExtension = req.files.thumbnail[0].originalname.split('.').pop().toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!validExtensions.includes(fileExtension)) {
          return res.status(400).json({ 
            message: `Invalid file extension: ${fileExtension}. Please use JPEG, PNG, GIF, or WebP files.` 
          });
        }
        
        // Validate image file size (5MB)
        const maxImageSize = 5 * 1024 * 1024;
        if (req.files.thumbnail[0].size > maxImageSize) {
          return res.status(400).json({ 
            message: `Image file too large. Maximum size is 5MB. Current size: ${(req.files.thumbnail[0].size / 1024 / 1024).toFixed(2)}MB` 
          });
        }
        
        // Check if file is corrupted or empty
        if (req.files.thumbnail[0].size === 0) {
          return res.status(400).json({ 
            message: 'Image file is empty or corrupted. Please try with a different file.' 
          });
        }
        
        // Check if file path exists and is readable
        if (req.files.thumbnail[0].path.startsWith('http')) {
          // It's a Cloudinary URL, no need to check local file
          console.log('✅ File uploaded to Cloudinary successfully');
        } else {
          // It's a local path, check if file exists
          if (!fs.existsSync(req.files.thumbnail[0].path)) {
            return res.status(400).json({ 
              message: 'Image file not found on server. Please try uploading again.' 
            });
          }
          
          // Try to read file to check if it's corrupted
          try {
            const stats = fs.statSync(req.files.thumbnail[0].path);
            if (stats.size === 0) {
              return res.status(400).json({ 
                message: 'Image file is empty. Please try with a different file.' 
              });
            }
          } catch (fileError) {
            return res.status(400).json({ 
              message: 'Error reading image file. File may be corrupted.' 
            });
          }
        }
        
        console.log(`🖼️ Processing image: ${(req.files.thumbnail[0].size / 1024 / 1024).toFixed(2)}MB`);
        updateData.thumbnail = req.files.thumbnail[0].path;
      }

      // إضافة الفيديو من Cloudinary
      if (req.files.video) {
        // حذف الفيديو القديم من Cloudinary إذا كان موجوداً
        if (course.video && course.video.includes('cloudinary')) {
          const publicId = course.video.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }
        
        // Validate video file type
        const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
        if (!allowedVideoTypes.includes(req.files.video[0].mimetype)) {
          return res.status(400).json({ 
            message: 'Invalid video file type. Please use MP4, AVI, MOV, WMV, FLV, or WebM.' 
          });
        }
        
        // Additional file extension check
        const fileExtension = req.files.video[0].originalname.split('.').pop().toLowerCase();
        const validExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
        if (!validExtensions.includes(fileExtension)) {
          return res.status(400).json({ 
            message: `Invalid file extension: ${fileExtension}. Please use MP4, AVI, MOV, WMV, FLV, or WebM files.` 
          });
        }
        
        // Validate video file size (100MB)
        const maxVideoSize = 100 * 1024 * 1024;
        if (req.files.video[0].size > maxVideoSize) {
          return res.status(400).json({ 
            message: `Video file too large. Maximum size is 100MB. Current size: ${(req.files.video[0].size / 1024 / 1024).toFixed(2)}MB` 
          });
        }
        
        // Check if file is corrupted or empty
        if (req.files.video[0].size === 0) {
          return res.status(400).json({ 
            message: 'Video file is empty or corrupted. Please try with a different file.' 
          });
        }
        
        // Check if file path exists and is readable
        if (req.files.video[0].path.startsWith('http')) {
          // It's a Cloudinary URL, no need to check local file
          console.log('✅ Video uploaded to Cloudinary successfully');
        } else {
          // It's a local path, check if file exists
          if (!fs.existsSync(req.files.video[0].path)) {
            return res.status(400).json({ 
              message: 'Video file not found on server. Please try uploading again.' 
            });
          }
          
          // Try to read file to check if it's corrupted
          try {
            const stats = fs.statSync(req.files.video[0].path);
            if (stats.size === 0) {
              return res.status(400).json({ 
                message: 'Video file is empty. Please try with a different file.' 
              });
            }
          } catch (fileError) {
            return res.status(400).json({ 
              message: 'Error reading video file. File may be corrupted.' 
            });
          }
        }
        
        console.log(`🎬 Video processed: ${(req.files.video[0].size / 1024 / 1024).toFixed(2)}MB`);
        updateData.video = req.files.video[0].path;
      }

      // إضافة الملفات الإضافية من Cloudinary
      if (req.files.files) {
        updateData.files = req.files.files.map(file => ({
          filename: file.originalname,
          filePath: file.path,
          mimeType: file.mimetype,
          description: ''
        }));
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        updateData,
        { new: true, runValidators: true }
      ).populate('category');

      res.status(200).json({ 
        message: 'Course updated successfully', 
        course: updatedCourse 
      });
    } catch (err) {
      console.error('❌ Error in course update route:', err);
      
      // Handle specific Cloudinary errors
      if (err.message && err.message.includes('File too large')) {
        return res.status(400).json({ 
          message: 'File too large for Cloudinary free plan. Maximum size is 100MB. Please compress your files or use smaller ones.',
          error: err.message 
        });
      }
      
      if (err.message && err.message.includes('bandwidth') || err.message.includes('quota')) {
        return res.status(429).json({ 
          message: 'Cloudinary bandwidth or storage quota exceeded. Please try again later or upgrade your plan.',
          error: err.message 
        });
      }
      
      if (err.message && err.message.includes('compression')) {
        return res.status(400).json({ 
          message: 'Video compression failed. Please try with a smaller video file or compress it manually.',
          error: err.message 
        });
      }
      
      if (err.message && err.message.includes('Invalid image file') || err.message.includes('corrupted')) {
        return res.status(400).json({ 
          message: 'The uploaded image file is corrupted or invalid. Please try with a different image file.',
          error: err.message 
        });
      }
      
      if (err.message && err.message.includes('File format not supported')) {
        return res.status(400).json({ 
          message: 'File format not supported. Please use JPEG, PNG, GIF, or WebP for images.',
          error: err.message 
        });
      }
      
      res.status(500).json({ 
        message: 'Error updating course.', 
        error: err.message 
      });
    }
  }
);

// **DELETE**: حذف كورس (للأدمن فقط)
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // حذف الملفات من Cloudinary
    if (course.thumbnail && course.thumbnail.includes('cloudinary')) {
      const publicId = course.thumbnail.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    
    if (course.video && course.video.includes('cloudinary')) {
      const publicId = course.video.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }
    
    if (course.files) {
      for (const file of course.files) {
        if (file.filePath && file.filePath.includes('cloudinary')) {
          const publicId = file.filePath.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      message: 'Course deleted successfully', 
      course 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error deleting course.', 
      error: err.message 
    });
  }
});

// **GET**: جلب الكورسات حسب المرحلة
router.get('/level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const validLevels = ['prep1', 'prep2', 'prep3', 'sec1', 'sec2', 'sec3'];
    
    if (!validLevels.includes(level)) {
      return res.status(400).json({ message: 'Invalid level' });
    }

    const courses = await Course.find({ level })
      .populate('category')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ products: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error fetching courses by level.', 
      error: err.message 
    });
  }
});

// **GET**: جلب الكورسات حسب الكاتيجوري
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const courses = await Course.find({ category: categoryId })
      .populate('category')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ products: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error fetching courses by category.', 
      error: err.message 
    });
  }
});

// جلب بيانات الكورسات بناءً على مصفوفة معرفات
router.post('/by-ids', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No course ids provided', courses: [] });
    }
    const courses = await Course.find({ _id: { $in: ids } }).populate('category');
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses by ids', error: err.message });
  }
});

module.exports = router;
