const jwt = require('jsonwebtoken');

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

module.exports = authMiddleware;
