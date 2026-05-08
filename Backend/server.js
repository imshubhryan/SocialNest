require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const connectToDb = require('./src/config/database');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true
    }
});

// ─── SOCKET.IO AUTHENTICATION MIDDLEWARE ─────────────────
io.use((socket, next) => {
    try {
        // Extract token from cookie header or auth payload
        const cookies = socket.handshake.headers?.cookie;
        let token = socket.handshake.auth?.token;

        if (!token && cookies) {
            const match = cookies.match(/accessToken=([^;]+)/);
            token = match ? match[1] : null;
        }

        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.userId = decoded._id;
        next();
    } catch (err) {
        next(new Error('Invalid or expired token'));
    }
});

// ─── SOCKET EVENTS ───────────────────────────────────────
io.on('connection', (socket) => {
    // Auto-join the user's personal room for DMs/notifications
    if (socket.userId) {
        socket.join(socket.userId);
    }

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('disconnect', () => {
        // cleanup if needed
    });
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ─── STARTUP ─────────────────────────────────────────────
const startServer = async () => {
    await connectToDb();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`🚀 SocialNest server running on port ${PORT}`);
    });
};

startServer();

// ─── GRACEFUL SHUTDOWN ───────────────────────────────────
const gracefulShutdown = (signal) => {
    console.log(`\n🚨 ${signal} received. Initiating enterprise graceful shutdown...`);
    
    // Set a force-kill timeout of 10s
    const timeout = setTimeout(() => {
        console.error("❌ Shutdown forced due to active connection timeout.");
        process.exit(1);
    }, 10000);

    server.close(async () => {
        console.log("🟢 HTTP & Socket.IO servers closed.");
        
        try {
            // Close MongoDB Connection
            const mongoose = require('mongoose');
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close();
                console.log("MongoDB connection cleanly terminated.");
            }
        } catch (err) {
            console.error("Error closing MongoDB connection:", err);
        }

        try {
            // Close Redis connection pool
            const redis = require('./src/config/redis');
            await redis.quit();
            console.log("Redis client cleanly disconnected.");
        } catch (err) {
            console.error("Error disconnecting Redis:", err);
        }

        clearTimeout(timeout);
        console.log("👋 SocialNest successfully shut down. Goodbye!\n");
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));