# 🚀 دليل نشر EduPlatform

## 📋 المتطلبات الأساسية

- Node.js (v16 أو أحدث)
- npm أو yarn
- حساب على منصة النشر (Netlify, Vercel, أو GitHub Pages)

## 🔧 إعداد البيئة

### 1. تثبيت المتطلبات
```bash
npm install
```

### 2. إعداد متغيرات البيئة
قم بإنشاء ملف `.env.production` في مجلد `edu/`:
```env
REACT_APP_API_BASE_URL=https://your-production-api.com/api
REACT_APP_SITE_NAME=EduPlatform
REACT_APP_SITE_DESCRIPTION=Quality Online Education Platform
REACT_APP_VERSION=1.0.0
```

### 3. بناء المشروع
```bash
npm run build
```

## 🌐 خيارات النشر

### الخيار الأول: Netlify (موصى به)

1. **إنشاء حساب على Netlify**
2. **رفع الملفات:**
   - اسحب مجلد `build` إلى Netlify
   - أو اربط حساب GitHub واختر المستودع

3. **إعدادات النشر:**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: `16` أو أحدث

4. **إعداد متغيرات البيئة في Netlify:**
   - اذهب إلى Site settings > Environment variables
   - أضف متغيرات البيئة من ملف `.env.production`

### الخيار الثاني: Vercel

1. **إنشاء حساب على Vercel**
2. **ربط المستودع:**
   - اربط حساب GitHub
   - اختر المستودع
   - Vercel سيكتشف تلقائياً أنه React app

3. **إعدادات النشر:**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

### الخيار الثالث: GitHub Pages

1. **إعداد المستودع:**
```bash
npm install --save-dev gh-pages
```

2. **إضافة scripts إلى package.json:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. **النشر:**
```bash
npm run deploy
```

## 🔒 إعدادات الأمان

### 1. HTTPS
- Netlify و Vercel يوفران HTTPS تلقائياً
- تأكد من تفعيل HTTPS في إعدادات الموقع

### 2. متغيرات البيئة
- لا تضع معلومات حساسة في الكود
- استخدم متغيرات البيئة لجميع المعلومات الحساسة

### 3. CORS
- تأكد من إعداد CORS في الخادم للسماح بالدومين الجديد

## 📱 تحسين الأداء

### 1. تحسين الصور
- استخدم صيغ WebP
- اضغط الصور قبل الرفع
- استخدم lazy loading

### 2. تحسين الكود
- تأكد من أن build production يعمل بشكل صحيح
- اختبر الموقع على أجهزة مختلفة

### 3. SEO
- تأكد من وجود meta tags
- أضف sitemap.xml
- أضف robots.txt

## 🧪 اختبار ما قبل النشر

### 1. اختبار محلي
```bash
npm run build
npx serve -s build
```

### 2. اختبار الوظائف
- [ ] تسجيل الدخول/التسجيل
- [ ] تصفح الدورات
- [ ] إضافة/إزالة من السلة
- [ ] تشغيل الفيديوهات
- [ ] الوصول للصفحات المختلفة

### 3. اختبار التجاوب
- [ ] الهاتف المحمول
- [ ] التابلت
- [ ] الكمبيوتر

## 🚨 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في API:**
   - تأكد من صحة رابط API
   - تحقق من إعدادات CORS

2. **مشاكل في البناء:**
   - تأكد من تثبيت جميع المتطلبات
   - تحقق من أخطاء في الكود

3. **مشاكل في التصميم:**
   - اختبر على متصفحات مختلفة
   - تحقق من CSS

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من console المتصفح للأخطاء
2. راجع logs النشر
3. تأكد من إعدادات البيئة

---

**ملاحظة:** تأكد من تحديث رابط API في ملف `env.production` قبل النشر! 