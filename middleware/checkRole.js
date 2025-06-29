const jwt = require('jsonwebtoken');

const checkRole = (role) => {
  return (req, res, next) => {
    console.log('👑 CheckRole middleware - Required role:', role);
    console.log('👑 CheckRole middleware - User data:', req.user);
    
    // التحقق من وجود المستخدم (تم التحقق من التوكن في middleware السابق)
    if (!req.user) {
      console.log('❌ CheckRole middleware - No user data found');
      return res.status(401).send({ message: 'Access Denied. No user data found.' });
    }

    // التحقق من الدور
    if (req.user.role !== role) {
      console.log('❌ CheckRole middleware - Role mismatch. Required:', role, 'User role:', req.user.role);
      return res.status(403).send({ 
        message: 'Forbidden. You do not have the required role.',
        requiredRole: role,
        userRole: req.user.role
      });
    }
    
    console.log('✅ CheckRole middleware - Role check passed');
    next();
  };
};

module.exports = checkRole;
