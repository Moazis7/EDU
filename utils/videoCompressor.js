const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');
const path = require('path');
const os = require('os');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

class VideoCompressor {
  constructor() {
    this.maxSizeMB = 8; // Reduced to 8MB to be safe with Cloudinary limits
    this.tempDir = path.join(os.tmpdir(), 'eduback-videos');
    
    console.log('🎬 VideoCompressor initialized');
    console.log(`📁 Temp directory: ${this.tempDir}`);
    console.log(`📊 Max size: ${this.maxSizeMB}MB`);
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      console.log('✅ Temp directory created');
    } else {
      console.log('✅ Temp directory already exists');
    }
  }

  /**
   * Compress video to fit within Cloudinary's limits
   * @param {string} inputPath - Path to input video file
   * @param {function} onProgress - Progress callback function
   * @returns {Promise<string>} - Path to compressed video file
   */
  async compressVideo(inputPath, onProgress) {
    return new Promise((resolve, reject) => {
      console.log('🎬 Starting video compression...');
      console.log(`📁 Input: ${inputPath}`);
      console.log(`📊 Input exists: ${fs.existsSync(inputPath)}`);
      
      if (!fs.existsSync(inputPath)) {
        console.error('❌ Input file does not exist:', inputPath);
        return reject(new Error('Input file does not exist'));
      }
      
      // Get file info first
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          console.error('❌ Error getting video info:', err);
          return reject(err);
        }

        const duration = metadata.format.duration;
        const originalSize = metadata.format.size;
        const originalSizeMB = originalSize / (1024 * 1024);
        
        console.log(`📊 Original size: ${originalSizeMB.toFixed(2)}MB`);
        console.log(`⏱️ Duration: ${duration.toFixed(2)}s`);

        // If already under 8MB, return original
        if (originalSizeMB <= this.maxSizeMB) {
          console.log('✅ Video already under 8MB, no compression needed');
          if (onProgress) onProgress(100);
          return resolve(inputPath);
        }

        // Calculate target bitrate to achieve desired file size
        const targetSizeBytes = this.maxSizeMB * 1024 * 1024;
        const targetBitrate = Math.floor((targetSizeBytes * 8) / duration); // bits per second
        
        console.log(`🎯 Target bitrate: ${(targetBitrate / 1000).toFixed(0)}kbps`);

        // Generate output filename
        const inputExt = path.extname(inputPath);
        const inputName = path.basename(inputPath, inputExt);
        const outputPath = path.join(this.tempDir, `${inputName}_compressed${inputExt}`);

        // Enhanced compression settings for better quality/size ratio
        const compressionSettings = {
          videoCodec: 'libx264',
          audioCodec: 'aac',
          videoBitrate: `${Math.floor(targetBitrate * 0.85 / 1000)}k`, // 85% for video
          audioBitrate: '96k', // Reduced audio bitrate
          scale: '854:480', // Lower resolution to save space
          fps: 25, // Reduced FPS
          preset: 'veryfast', // Faster encoding
          crf: 30, // Higher compression
          maxrate: `${Math.floor(targetBitrate / 1000)}k`, // Max bitrate
          bufsize: `${Math.floor(targetBitrate / 500)}k` // Buffer size
        };

        console.log('🔄 Compressing video with enhanced settings...');
        
        ffmpeg(inputPath)
          .videoCodec(compressionSettings.videoCodec)
          .audioCodec(compressionSettings.audioCodec)
          .videoBitrate(compressionSettings.videoBitrate)
          .audioBitrate(compressionSettings.audioBitrate)
          .size(`${compressionSettings.scale}`)
          .fps(compressionSettings.fps)
          .outputOptions([
            `-preset ${compressionSettings.preset}`,
            `-crf ${compressionSettings.crf}`,
            `-maxrate ${compressionSettings.maxrate}`,
            `-bufsize ${compressionSettings.bufsize}`,
            '-movflags +faststart', // Optimize for web streaming
            '-profile:v baseline', // Better compatibility
            '-level 3.0' // Lower level for smaller files
          ])
          .on('start', (commandLine) => {
            console.log('🚀 FFmpeg command:', commandLine);
            if (onProgress) onProgress(5); // Started
          })
          .on('progress', (progress) => {
            const percent = progress.percent ? Math.min(progress.percent, 95) : 0;
            console.log(`📈 Progress: ${percent.toFixed(1)}%`);
            if (onProgress) onProgress(percent);
          })
          .on('end', () => {
            // Check final file size
            const stats = fs.statSync(outputPath);
            const finalSizeMB = stats.size / (1024 * 1024);
            
            console.log(`✅ Compression completed!`);
            console.log(`📊 Final size: ${finalSizeMB.toFixed(2)}MB`);
            console.log(`📁 Output: ${outputPath}`);
            
            // If still too large, try more aggressive compression
            if (finalSizeMB > this.maxSizeMB) {
              console.log('⚠️ File still too large, trying more aggressive compression...');
              this.aggressiveCompression(outputPath, onProgress)
                .then(resolve)
                .catch(reject);
              return;
            }
            
            // Clean up original file if it was in temp directory
            if (inputPath.startsWith(this.tempDir)) {
              fs.unlinkSync(inputPath);
            }
            
            if (onProgress) onProgress(100); // Completed
            resolve(outputPath);
          })
          .on('error', (err) => {
            console.error('❌ Compression error:', err);
            reject(err);
          })
          .save(outputPath);
      });
    });
  }

  /**
   * More aggressive compression if first attempt fails
   */
  async aggressiveCompression(inputPath, onProgress) {
    return new Promise((resolve, reject) => {
      console.log('🎬 Starting aggressive compression...');
      console.log(`📁 Input: ${inputPath}`);
      
      const outputPath = inputPath.replace('_compressed', '_compressed_aggressive');
      console.log(`📁 Output: ${outputPath}`);
      
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .videoBitrate('500k') // Very low bitrate
        .audioBitrate('64k') // Very low audio
        .size('640:360') // Lower resolution
        .fps(20) // Lower FPS
        .outputOptions([
          '-preset ultrafast',
          '-crf 35', // Very high compression
          '-maxrate 500k',
          '-bufsize 1000k',
          '-movflags +faststart',
          '-profile:v baseline',
          '-level 3.0'
        ])
        .on('end', () => {
          const stats = fs.statSync(outputPath);
          const finalSizeMB = stats.size / (1024 * 1024);
          console.log(`✅ Aggressive compression completed: ${finalSizeMB.toFixed(2)}MB`);
          
          // Clean up intermediate file
          if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
          }
          
          if (onProgress) onProgress(100);
          resolve(outputPath);
        })
        .on('error', reject)
        .save(outputPath);
    });
  }

  /**
   * Clean up temporary files
   */
  cleanup() {
    try {
      console.log('🧹 Starting cleanup...');
      console.log(`📁 Temp directory: ${this.tempDir}`);
      
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        console.log(`📊 Found ${files.length} files to clean up`);
        
        files.forEach(file => {
          const filePath = path.join(this.tempDir, file);
          fs.unlinkSync(filePath);
          console.log(`✅ Removed: ${file}`);
        });
        console.log('🧹 Cleaned up temporary files');
      } else {
        console.log('⚠️ Temp directory does not exist');
      }
    } catch (error) {
      console.error('❌ Error cleaning up:', error);
    }
  }

  /**
   * Get file size in MB
   */
  getFileSizeMB(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);
      console.log(`📊 File size: ${filePath} = ${sizeMB.toFixed(2)}MB`);
      return sizeMB;
    } catch (error) {
      console.error('❌ Error getting file size:', error);
      return 0;
    }
  }
}

module.exports = VideoCompressor; 