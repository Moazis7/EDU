const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const VideoCompressor = require('../utils/videoCompressor');
const fs = require('fs');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Custom storage that compresses videos before upload
class CompressedCloudinaryStorage extends CloudinaryStorage {
  constructor(options) {
    super(options);
    this.compressor = null;
  }

  async _handleFile(req, file, cb) {
    try {
      console.log('🎬 CompressedCloudinaryStorage._handleFile called (no compression)');
      super._handleFile(req, file, cb);
    } catch (error) {
      console.error('❌ Error in compressed storage:', error);
      cb(error);
    }
  }

  _removeFile(req, file, cb) {
    try {
      console.log('🧹 CompressedCloudinaryStorage._removeFile called');
      console.log('📁 File to remove:', file.path);
      
      // Clean up compressed files
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log('✅ Temporary file removed:', file.path);
      }
      super._removeFile(req, file, cb);
    } catch (error) {
      console.error('❌ Error removing file:', error);
      cb(error);
    }
  }
}

// Storage configuration for different file types
const storage = new CompressedCloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eduback',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Reduced size for images
      { quality: 'auto:low' } // Lower quality to save bandwidth
    ],
    // Add more specific image settings
    resource_type: 'auto', // Let Cloudinary detect resource type
    eager: [
      { width: 400, height: 300, crop: 'fill', quality: 'auto' },
      { width: 200, height: 150, crop: 'fill', quality: 'auto' }
    ],
    eager_async: true,
    eager_notification_url: null
  }
});

// Video storage configuration
const videoStorage = new CompressedCloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eduback/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    transformation: [
      { fetch_format: 'mp4' },
      { quality: 'auto:best' },
      { width: 1920, height: 1080, crop: 'limit' },
      { video_codec: 'auto' },
      { audio_codec: 'aac' },
      { bit_rate: 'auto' }
    ],
    eager_async: true
  }
});

// Thumbnail storage configuration - Use regular CloudinaryStorage for images
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eduback/thumbnails',
    resource_type: 'image', // Explicitly set for images
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 300, height: 200, crop: 'fill' }, // Smaller thumbnails
      { quality: 'auto:low' } // Lower quality
    ],
    // Add more specific image settings
    eager: [
      { width: 150, height: 100, crop: 'fill', quality: 'auto' }
    ],
    eager_async: true
  }
});

// Upload middleware
const upload = multer({ storage: storage });
const uploadVideo = multer({ storage: videoStorage });
const uploadThumbnail = multer({ storage: thumbnailStorage });

// Upload multiple files
const uploadMultiple = multer({ storage: storage }).array('files', 10);

module.exports = {
  cloudinary,
  upload,
  uploadVideo,
  uploadThumbnail,
  uploadMultiple
}; 