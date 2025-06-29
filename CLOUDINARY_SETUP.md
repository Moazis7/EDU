# Cloudinary Setup Guide

## 📋 Prerequisites
1. Create a Cloudinary account at [https://cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from your dashboard

## 🔧 Environment Variables Setup

Add these variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📁 Folder Structure
Cloudinary will automatically create these folders:
- `eduback/` - General files
- `eduback/thumbnails/` - Course thumbnails
- `eduback/videos/` - Course videos

## 🎥 Supported Video Formats
- MP4, AVI, MOV, WMV, FLV, WebM

## 🖼️ Supported Image Formats
- JPG, JPEG, PNG, GIF, WebP

## ⚙️ Features
- Automatic quality optimization
- Responsive image transformations
- Video compression
- Secure file storage
- CDN delivery

## 🚀 Usage
1. Upload files through AdminPanel
2. Files are automatically stored in Cloudinary
3. URLs are saved in the database
4. Files are served via Cloudinary CDN

## 🔒 Security
- Files are stored securely in Cloudinary
- Access is controlled via API keys
- Automatic cleanup on file deletion 