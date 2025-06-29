# 🚀 Production Setup Guide

## 🧹 Files to Remove for Production

### 1. Ngrok Files (Delete these):
```bash
start-ngrok.bat
NGROK_SETUP.md
```

### 2. Update Backend Configuration

#### In `server.js` - Remove ngrok-specific CORS logic:
```javascript
// Remove this section:
// Allow all ngrok-free.app domains for development
if (origin.includes('ngrok-free.app')) {
  console.log(`✅ Allowing ngrok origin: ${origin}`);
  return callback(null, true);
}
```

#### In `config.env` - Update ALLOWED_ORIGINS:
```env
# Remove ngrok URLs, keep only your production domains
ALLOWED_ORIGINS=https://your-production-domain.com,https://www.your-production-domain.com
```

### 3. Update Frontend Configuration

#### In `edu/src/config/api.js` - Remove ngrok logic:
```javascript
// Remove this section:
// Check if ngrok URL is provided
const ngrokUrl = process.env.REACT_APP_NGROK_URL;
if (ngrokUrl && environment === 'development') {
  API_CONFIG.development.baseURL = `${ngrokUrl}/api`;
  console.log(`🚀 Using ngrok URL: ${ngrokUrl}/api`);
}
```

#### In `edu/.env` - Update for production:
```env
REACT_APP_API_BASE_URL=https://your-production-api.com/api
REACT_APP_SITE_NAME=EduPlatform
REACT_APP_SITE_DESCRIPTION=Quality Online Education Platform
REACT_APP_VERSION=1.0.0
REACT_APP_NODE_ENV=production
```

### 4. Security Updates

#### Update JWT Secret in `config.env`:
```env
JWT_SECRET=your-super-secure-production-jwt-secret
```

#### Update MongoDB URI:
```env
MONGODB_URI=mongodb://your-production-mongodb-uri
```

## 🚀 Deployment Steps

### 1. Backend Deployment:
```bash
# Install production dependencies
npm install --production

# Set environment variables
NODE_ENV=production
PORT=3009
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-jwt-secret
ALLOWED_ORIGINS=https://your-domain.com

# Start server
node server.js
```

### 2. Frontend Deployment:
```bash
cd edu

# Build for production
npm run build

# Deploy build folder to your hosting service
```

## 🔒 Production Security Checklist

- [ ] Remove all ngrok configurations
- [ ] Update JWT secret to secure value
- [ ] Use production MongoDB database
- [ ] Set proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up proper environment variables
- [ ] Remove debug logs
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up SSL certificates

## 📝 Environment Variables for Production

### Backend (`config.env`):
```env
NODE_ENV=production
PORT=3009
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=1h
ALLOWED_ORIGINS=https://your-domain.com
MAX_FILE_SIZE=1073741824
UPLOAD_PATH=uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (`edu/.env`):
```env
REACT_APP_API_BASE_URL=https://your-production-api.com/api
REACT_APP_SITE_NAME=EduPlatform
REACT_APP_SITE_DESCRIPTION=Quality Online Education Platform
REACT_APP_VERSION=1.0.0
REACT_APP_NODE_ENV=production
```

## 🎯 Summary

1. **Delete ngrok files**
2. **Update CORS settings**
3. **Remove ngrok logic from code**
4. **Set production environment variables**
5. **Update security settings**
6. **Deploy to production servers**

Remember: ngrok is for development only! 🚫 