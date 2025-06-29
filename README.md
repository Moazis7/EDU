# EduBack - Backend API

## 📋 نظرة عامة
Backend API لمنصة تعليمية مبني باستخدام Node.js و Express و MongoDB.

## 🚀 الميزات
- ✅ نظام تسجيل دخول وتسجيل مستخدمين
- ✅ إدارة الأدوار (مستخدم/مدير)
- ✅ رفع وإدارة الملفات التعليمية
- ✅ نظام فئات للمحتوى
- ✅ سلة المشتريات
- ✅ البحث في المحتوى
- ✅ نظام توثيق JWT
- ✅ Rate Limiting
- ✅ Logging System

## 🛠️ التكنولوجيات المستخدمة
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password Hashing
- **multer** - File Upload
- **winston** - Logging
- **helmet** - Security
- **cors** - Cross-Origin Resource Sharing

## 📦 التثبيت والتشغيل

### المتطلبات
- Node.js (v14 أو أحدث)
- MongoDB
- npm أو yarn

### خطوات التثبيت
1. استنساخ المشروع:
```bash
git clone <repository-url>
cd eduback
```

2. تثبيت التبعيات:
```bash
npm install
```

3. إعداد المتغيرات البيئية:
```bash
# نسخ ملف التكوين
cp config.env.example config.env
# تعديل المتغيرات حسب الحاجة
```

4. تشغيل قاعدة البيانات:
```bash
# تأكد من تشغيل MongoDB
mongod
```

5. تشغيل الخادم:
```bash
# للتطوير
npm run dev

# للإنتاج
npm start
```

## 🔧 التكوين

### المتغيرات البيئية
```env
# Server Configuration
PORT=3009
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost/EDU1

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=1073741824
UPLOAD_PATH=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/auth/verify` - التحقق من صحة التوكن

### Users
- `POST /api/user` - تسجيل مستخدم جديد
- `GET /api/user/me` - بيانات المستخدم الحالي
- `GET /api/user/all` - جميع المستخدمين (للمدير)

### Files/Courses
- `POST /api/upload/upload` - رفع ملفات (للمدير)
- `GET /api/upload/files` - جميع الملفات
- `GET /api/upload/my-files` - ملفات المستخدم
- `GET /api/upload/category/:category` - ملفات حسب الفئة
- `GET /api/upload/files/stream/:id` - استريم ملف
- `DELETE /api/upload/files/:id` - حذف ملف (للمدير)

### Categories
- `GET /api/category` - جميع الفئات
- `POST /api/category` - إنشاء فئة جديدة
- `GET /api/category/:category` - فئة محددة
- `PUT /api/category/:id` - تحديث فئة
- `DELETE /api/category/:id` - حذف فئة

### Cart
- `POST /api/cart/cart` - إضافة إلى السلة
- `GET /api/cart/cart` - محتويات السلة
- `DELETE /api/cart/cart/:id` - حذف من السلة

### Search
- `GET /api/search?query=searchTerm` - البحث في المحتوى

## 🔒 الأمان
- JWT Authentication
- Password Hashing باستخدام bcrypt
- Rate Limiting
- CORS Protection
- Helmet Security Headers
- Input Validation باستخدام Joi

## 📝 Logging
يتم تسجيل الأخطاء والمعلومات في:
- `logs/error.log` - الأخطاء فقط
- `logs/combined.log` - جميع السجلات

## 🐛 استكشاف الأخطاء

### مشاكل شائعة
1. **خطأ في الاتصال بقاعدة البيانات**
   - تأكد من تشغيل MongoDB
   - تحقق من صحة MONGODB_URI

2. **خطأ في التوثيق**
   - تحقق من صحة JWT_SECRET
   - تأكد من إرسال التوكن في header `y-auth-token`

3. **خطأ في رفع الملفات**
   - تأكد من وجود مجلد `uploads`
   - تحقق من حجم الملف (الحد الأقصى 1GB)

## 📈 التحسينات المستقبلية
- [ ] إضافة Redis للتخزين المؤقت
- [ ] إضافة WebSocket للرسائل المباشرة
- [ ] إضافة نظام إشعارات
- [ ] إضافة API documentation باستخدام Swagger
- [ ] إضافة اختبارات وحدة
- [ ] إضافة Docker support

## 🤝 المساهمة
1. Fork المشروع
2. إنشاء branch جديد
3. إجراء التغييرات
4. إضافة اختبارات
5. إنشاء Pull Request

## 📄 الترخيص
ISC License 