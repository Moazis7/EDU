const App = require('./app');

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

// إنشاء تطبيق جديد
const app = new App();

// بدء الخادم
app.start();

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

console.log('📝 Server configuration completed');
console.log('🔄 Ready to start server...'); 