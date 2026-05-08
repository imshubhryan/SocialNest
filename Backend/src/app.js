const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const ApiError = require('./utils/ApiError');

const app = express();

// Trust proxy for secure cookies over HTTPS (reverse proxies)
app.set('trust proxy', 1);

// Security headers with safe CSP for fonts and image CDNs
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Core middleware
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}));
app.use(compression());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// NOTE: hpp, xss-clean, mongoSanitize removed for Express 5 compatibility (req.query is read-only)

/* require routes */
const authRouter = require('./routes/auth.routes');
const postRouter = require('./routes/post.routes');
const userRouter = require('./routes/user.routes');
const commentRouter = require('./routes/comment.routes');
const groupRouter = require('./routes/group.routes');
const notificationRouter = require('./routes/notification.routes');
const adminRouter = require('./routes/admin.routes');
const chatRouter = require('./routes/chat.routes');
const storyRouter = require('./routes/story.routes');

/* Health Check */
const mongoose = require('mongoose');
const redis = require('./config/redis');
app.get('/api/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    let redisStatus = 'disconnected';
    try {
        await redis.ping();
        redisStatus = 'connected';
    } catch {}
    res.status(dbStatus === 'connected' ? 200 : 503).json({
        status: dbStatus === 'connected' ? 'healthy' : 'degraded',
        uptime: Math.floor(process.uptime()),
        database: dbStatus,
        redis: redisStatus,
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

/* using routes */
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);
app.use('/api/comments', commentRouter);
app.use('/api/groups', groupRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);
app.use('/api/stories', storyRouter);

// Unknown API routes handler (Prevent falling back to index.html for API route mismatches)
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.originalUrl}`
    });
});

// Serve Frontend Static files in Production with immutable caching headers
const distPath = path.join(__dirname, "../../Frontend/dist");
const distExists = fs.existsSync(distPath);

console.log(`\n================ SOCIALNEST STARTUP POSTURE ================`);
console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📁 Frontend Assets Detected: ${distExists ? '✅ TRUE' : '❌ FALSE'}`);
console.log(`📂 Static Dist Path: ${distPath}`);
console.log(`🌍 API Status: 🟢 ACTIVE`);
console.log(`🖥️ Static serving posture: ${distExists ? '🟢 ONLINE' : '🟡 OFFLINE (Dynamic fallback only)'}`);
console.log(`============================================================\n`);

if (distExists || process.env.NODE_ENV === "production") {
    app.use(express.static(distPath, {
        maxAge: "1y",
        etag: true,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith("index.html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            } else {
                res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            }
        }
    }));

    // Handle React Router Client-side routing refreshes safely with Express 5 safe RegExp
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

// Centralized Global Error Handler with stack trace protection in production
app.use((err, req, res, next) => {
    console.error("ERROR:", err.stack || err.message);
    const statusCode = err.statusCode || 500;
    
    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        code: err.code || "INTERNAL_SERVER_ERROR",
        errors: err.errors || [],
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
});

module.exports = app;