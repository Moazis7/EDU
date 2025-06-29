const winston = require('winston');

// تعريف Logger باستخدام winston
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'eduback-api' },
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log'
        })
    ]
});

// إضافة console transport في development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Middleware لمعالجة الأخطاء
function errorLogger(err, req, res, next) {
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user ? req.user._id : 'anonymous'
    });
    
    // لا ترسل تفاصيل الخطأ في production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message;
    
    res.status(500).json({ 
        message: errorMessage,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
}

module.exports = { errorLogger, logger };
