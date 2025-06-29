# Cloudinary Free Plan Limits

## 📊 Current Limits

### File Upload Limits
- **Maximum file size**: 100MB per file
- **Supported formats**: Images (JPG, PNG, GIF, WebP), Videos (MP4, AVI, MOV, WMV, FLV, WebM)

### Monthly Quotas
- **Storage**: 1GB total
- **Bandwidth**: 1GB per month
- **Transformations**: 1,000 per month

## 🎬 Video Compression

### Automatic Compression
- Videos over **7MB** are automatically compressed
- Target size: **80MB** (safe margin below 100MB limit)
- Compression settings:
  - Resolution: 854x480 (reduced from 1280x720)
  - FPS: 25 (reduced from 30)
  - Audio: 96kbps (reduced from 128kbps)
  - Quality: CRF 30 (higher compression)

### Aggressive Compression
- If first compression fails, a second attempt is made with:
  - Resolution: 640x360
  - FPS: 20
  - Audio: 64kbps
  - Quality: CRF 35

## 🖼️ Image Optimization

### Automatic Optimization
- Images are automatically optimized with:
  - Maximum size: 800x800px
  - Quality: auto:low (saves bandwidth)
  - Format: Optimized for web

## ⚠️ Common Issues & Solutions

### 1. File Too Large Error
**Problem**: File exceeds 100MB limit
**Solution**: 
- Use smaller files
- Compress manually before upload
- Videos over 7MB are auto-compressed

### 2. Bandwidth Exceeded
**Problem**: Monthly 1GB bandwidth limit reached
**Solution**:
- Wait until next month
- Upgrade to paid plan
- Use smaller/compressed files

### 3. Storage Full
**Problem**: 1GB storage limit reached
**Solution**:
- Delete unused files
- Upgrade to paid plan
- Use external storage

### 4. Compression Failed
**Problem**: Video compression process fails
**Solution**:
- Try smaller video file
- Compress manually using tools like YouCompress
- Check video format compatibility

## 🛠️ Manual Compression Tools

### Images
- [TinyPNG](https://tinypng.com) - PNG/JPEG compression
- [Squoosh](https://squoosh.app) - Google's image compression tool

### Videos
- [YouCompress](https://www.youcompress.com) - Online video compression
- [HandBrake](https://handbrake.fr) - Desktop video compression
- [FFmpeg](https://ffmpeg.org) - Command-line tool

## 📈 Monitoring Usage

### Check Current Usage
1. Log into [Cloudinary Dashboard](https://cloudinary.com/console)
2. Go to "Usage" section
3. Monitor:
   - Storage used
   - Bandwidth consumed
   - Transformations used

### Best Practices
1. **Compress before upload**: Use smaller files when possible
2. **Monitor usage**: Check dashboard regularly
3. **Clean up**: Delete unused files
4. **Optimize**: Use appropriate quality settings

## 🔄 Upgrade Options

### When to Upgrade
- Consistently hitting limits
- Need higher quality
- Business/production use

### Paid Plans
- **Advanced**: $89/month - 25GB storage, 25GB bandwidth
- **Custom**: Contact sales for enterprise needs

## 🚀 Performance Tips

1. **Use appropriate formats**:
   - WebP for images (better compression)
   - MP4 for videos (better compatibility)

2. **Optimize before upload**:
   - Compress images to reasonable sizes
   - Use appropriate video bitrates

3. **Monitor transformations**:
   - Avoid unnecessary image transformations
   - Use Cloudinary's auto-optimization features

4. **Clean up regularly**:
   - Delete unused files
   - Archive old content

---

**Note**: These limits are for Cloudinary's free plan. For production applications, consider upgrading to a paid plan for better performance and higher limits. 