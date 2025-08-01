require('dotenv').config({ path: './config.env' });
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Import routes
const userRoutes = require('./routes/userRoutes');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    console.log('🔧 Setting up middleware...');

    // CORS Configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3007'];

    this.app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          if (origin.includes('ngrok-free.app')) return callback(null, true);
          if (origin.match(/^https?:\/\/localhost:\d+$/)) return callback(null, true);
          
          console.warn(`❌ Blocked by CORS: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'y-auth-token', 'Range', 'authorization', 'Authorization'],
        credentials: true,
        exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type']
      })
    );

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Security Headers
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            objectSrc: ["'none'"],
            imgSrc: ["'self'", 'data:'],
          },
        },
      })
    );

    // Body Parsing
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));

    // Logging
    if (this.app.get('env') === 'development') {
      this.app.use(morgan('tiny'));
    }

    // Static Files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
      setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization, authorization');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      }
    }));

    console.log('✅ Middleware configured');
  }

  setupRoutes() {
    console.log('📋 Setting up routes...');

    // API Routes
    this.app.use('/api/users', userRoutes);

    // 404 Route
    this.app.use('*', (req, res) => {
      console.log(`❌ 404 - Route not found: ${req.originalUrl}`);
      res.status(404).json({ 
        success: false,
        message: 'Route not found',
        timestamp: new Date().toISOString()
      });
    });

    console.log('✅ Routes configured');
  }

  setupErrorHandling() {
    console.log('🛡️ Setting up error handling...');

    this.app.use((err, req, res, next) => {
      console.error('🔥 Error: ', err.message);
      console.error('🔥 Error stack: ', err.stack);
      console.error('🔥 Request URL: ', req.url);
      console.error('🔥 Request method: ', req.method);
      
      if (err.message.includes('CORS')) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied by CORS',
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }
      
      if (err.message.includes('File too large')) {
        return res.status(400).json({
          success: false,
          message: 'File too large for Cloudinary free plan',
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    });

    console.log('✅ Error handling configured');
  }

  async connectDatabase() {
    console.log('🗄️ Connecting to database...');
    
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/EDU1');
      console.log('✅ Connected to MongoDB...');
      console.log(`📊 Database: ${process.env.MONGODB_URI || 'mongodb://localhost/EDU1'}`);
    } catch (err) {
      console.error('❌ Could not connect to MongoDB...', err);
      process.exit(1);
    }
  }

  start(port = process.env.PORT || 3009) {
    this.connectDatabase().then(() => {
      this.app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}...`);
        console.log(`🌐 Server URL: http://localhost:${port}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️ Database: ${process.env.MONGODB_URI || 'mongodb://localhost/EDU1'}`);
        console.log(`☁️ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME || 'Not configured'}`);
        console.log('✅ Server ready to handle requests!');
        console.log('🎯 All systems operational!');
      });
    });
  }
}

module.exports = App; 