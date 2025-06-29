# 🔒 Security Issues to Fix Before Production

## 🚨 Critical Security Issues

### 1. **JWT Secret Exposure**
**File:** `server.js` lines 13-14
```javascript
// ❌ DANGEROUS - Exposes JWT secret in logs
console.log('🔑 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
console.log('🔑 JWT_SECRET value:', process.env.JWT_SECRET);
```

**Fix:** Remove these console.log statements completely.

### 2. **Weak JWT Secret**
**File:** `config.env` line 8
```env
# ❌ WEAK - Default secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Fix:** Use a strong, random secret (at least 32 characters).

### 3. **Debug Logs in Production**
**File:** `middleware/auth.js` lines 4-5, 9, 15
```javascript
// ❌ EXPOSES SENSITIVE DATA
console.log('🔐 Auth middleware - Token received:', token ? 'Yes' : 'No');
console.log('🔐 Auth middleware - Token value:', token);
console.log('🔐 Auth middleware - Token decoded successfully:', decoded);
```

**Fix:** Remove or conditionally show only in development.

### 4. **CORS Too Permissive**
**File:** `routes/auth.js` line 11
```javascript
// ❌ TOO PERMISSIVE
origin: '*', // Allows any origin
```

**Fix:** Use specific origins from environment variables.

### 5. **Hardcoded JWT Secret Fallback**
**File:** `models/user.js` line 40, `middleware/auth.js` line 12
```javascript
// ❌ WEAK FALLBACK
process.env.JWT_SECRET || 'jwtPrivateKey'
```

**Fix:** Remove fallback, require environment variable.

## 🔧 Required Fixes

### 1. **Update server.js**
```javascript
// Remove these lines:
// console.log('🔑 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
// console.log('🔑 JWT_SECRET value:', process.env.JWT_SECRET);

// Add environment check:
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}
```

### 2. **Update middleware/auth.js**
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.header('y-auth-token');
  
  if (!token) return res.status(401).send({ message: 'Access Denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send({ message: 'Token expired. Please login again.' });
    }
    res.status(400).send({ message: 'Invalid token.' });
  }
};
```

### 3. **Update routes/auth.js**
```javascript
// Replace CORS configuration:
router.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'y-auth-token'],
}));
```

### 4. **Update models/user.js**
```javascript
userSchema.methods.generateAuthToken = function() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  const token = jwt.sign(
    { _id: this._id, role: this.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  return token;
};
```

### 5. **Generate Strong JWT Secret**
```bash
# Generate a strong secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Production Checklist

- [ ] Remove all debug console.log statements
- [ ] Generate and set strong JWT_SECRET
- [ ] Remove hardcoded JWT fallbacks
- [ ] Configure proper CORS origins
- [ ] Set NODE_ENV=production
- [ ] Use production MongoDB URI
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure rate limiting for production
- [ ] Set up monitoring and alerts

## 🎯 Priority Order

1. **HIGH:** Fix JWT secret exposure
2. **HIGH:** Remove debug logs
3. **MEDIUM:** Fix CORS configuration
4. **MEDIUM:** Remove hardcoded fallbacks
5. **LOW:** Add production logging 