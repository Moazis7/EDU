require('dotenv').config({ path: './config.env' });
const debug = require('debug')('app:startup');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

console.log('🚀 Starting server...');
console.log('📁 Environment:', process.env.NODE_ENV);
console.log('🔧 Port:', process.env.PORT || 3009);
console.log('🗄️ Database:', process.env.MONGODB_URI || 'mongodb://localhost/EDU1');

// ✅ التحقق من المتغيرات المطلوبة
console.log('🔍 Checking environment variables...');

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}

console.log('✅ Environment variables validated');

const app = express();
console.log('✅ Express app created');

// ✅ اتصال قاعدة البيانات
console.log('🗄️ Connecting to database...');

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost/EDU1')
  .then(() => {
    console.log('✅ Connected to MongoDB...');
    console.log(`📊 Database: ${process.env.MONGODB_URI || 'mongodb://localhost/EDU1'}`);
  })
  .catch(err => {
    console.error('❌ Could not connect to MongoDB...', err);
    process.exit(1);
  });

// ✅ إعداد CORS مع لوج للرفض
console.log('🌐 Setting up CORS...');

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3007'];

console.log('📋 Allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow all ngrok-free.app domains for development
      if (origin.includes('ngrok-free.app')) {
        console.log(`✅ Allowing ngrok origin: ${origin}`);
        return callback(null, true);
      }
      
      // Allow localhost with any port for development
      if (origin.match(/^https?:\/\/localhost:\d+$/)) {
        console.log(`✅ Allowing localhost origin: ${origin}`);
        return callback(null, true);
      }
      
      console.warn(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'y-auth-token', 'Range', 'authorization', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type']
  })
);

console.log('✅ CORS configured');

// ✅ تحديد معدل الطلبات
console.log('⏱️ Setting up rate limiting...');

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

console.log('✅ Rate limiting configured');

// ✅ ميدل وير عامة
console.log('🔧 Setting up middleware...');

app.use(
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
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  debug('Morgan enabled...');
}

console.log('✅ Middleware configured');

// ✅ الراوتات
console.log('📋 Loading routes...');

const userRoutes = require('./routes/users.js');
const authRoutes = require('./routes/auth.js');
const productUpload = require('./routes/courses.js');
const cart = require('./routes/mycourses.js');
const Category = require('./routes/categoryRoutes.js');
const searchRoutes = require('./routes/searchRoutes.js');
const purchaseCodesRoutes = require('./routes/purchaseCodes.js');
const paymentSettingsRoutes = require('./routes/paymentSettings.js');

console.log('✅ Routes loaded successfully');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', productUpload);
app.use('/api/cart', cart);
app.use('/api/category', Category);
app.use(searchRoutes);
app.use('/api/purchase-codes', purchaseCodesRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);

console.log('✅ Routes mounted successfully');

// ✅ ملفات الستاتيك
console.log('📁 Setting up static files...');

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization, authorization');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  }
}));

console.log('✅ Static files configured');

// ✅ التعامل مع الأخطاء
console.log('🛡️ Setting up error handling...');

app.use((err, req, res, next) => {
  console.error('🔥 Error: ', err.message);
  console.error('🔥 Error stack: ', err.stack);
  console.error('🔥 Request URL: ', req.url);
  console.error('🔥 Request method: ', req.method);
  console.error('🔥 Request headers: ', req.headers);
  
  if (err.message.includes('CORS')) {
    return res
      .status(403)
      .json({ message: 'Access Denied by CORS', error: err.message });
  }
  
  if (err.message.includes('File too large')) {
    return res
      .status(400)
      .json({ message: 'File too large for Cloudinary free plan', error: err.message });
  }
  
  if (err.message.includes('compression')) {
    return res
      .status(400)
      .json({ message: 'Video compression failed', error: err.message });
  }
  
  res
    .status(500)
    .json({ message: 'Something went wrong!', error: err.message });
});

console.log('✅ Error handling configured');

// ✅ 404 Route
console.log('🔍 Setting up 404 route...');

app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

console.log('✅ 404 route configured');

// ✅ الاستماع على البورت
console.log('🎧 Starting server listener...');

const port = process.env.PORT || 3009;
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}...`);
  console.log(`🌐 Server URL: http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: ${process.env.MONGODB_URI || 'mongodb://localhost/EDU1'}`);
  console.log(`☁️ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME || 'Not configured'}`);
  console.log('✅ Server ready to handle requests!');
  console.log('🎯 All systems operational!');
});

console.log('📝 Server configuration completed');
console.log('🔄 Ready to start server...');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
