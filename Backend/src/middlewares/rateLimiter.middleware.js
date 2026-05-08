const rateLimit = require('express-rate-limit');

// Detailed logs helper for production debugging
const logLimiterEvent = (type, req) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`⚠️ [RATE LIMIT] [${type}] Hit from IP: ${ip} | Path: ${req.path} | Headers-IP: ${req.headers['x-forwarded-for']}`);
};

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 100 : 10, // Relaxed in development
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logLimiterEvent('LOGIN_EXCEEDED', req);
        res.status(429).json({
            success: false,
            message: "Too many login attempts. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED"
        });
    }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'development' ? 50 : 5, // Relaxed in development
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logLimiterEvent('REGISTER_EXCEEDED', req);
        res.status(429).json({
            success: false,
            message: "Too many registration attempts. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED"
        });
    }
});

module.exports = {
    loginLimiter,
    registerLimiter
};
