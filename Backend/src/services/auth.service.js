const redis = require("../config/redis");
const crypto = require("crypto");

// ─── REFRESH TOKEN ROTATION ────────────────────────────
// Each refresh token belongs to a "family". When rotated, old one is invalidated.
// If an old token is reused, the ENTIRE family is invalidated (attack detected).

const createTokenFamily = async (userId, refreshToken) => {
    const familyId = crypto.randomBytes(16).toString("hex");
    // Store: familyId -> userId, token -> familyId
    await redis.set(`token_family:${familyId}`, userId.toString(), "EX", 864000); // 10 days
    await redis.set(`refresh_token:${refreshToken}`, familyId, "EX", 864000);
    await redis.sadd(`user_families:${userId}`, familyId);
    return familyId;
};

const rotateRefreshToken = async (oldRefreshToken, userId, newRefreshToken) => {
    const familyId = await redis.get(`refresh_token:${oldRefreshToken}`);

    if (!familyId) {
        // Old token not found — possible reuse attack!
        // Invalidate ALL families for this user (nuclear option)
        await invalidateAllUserSessions(userId);
        return null; // Signal attack detected
    }

    // Invalidate old token
    await redis.del(`refresh_token:${oldRefreshToken}`);

    // Register new token under the same family
    await redis.set(`refresh_token:${newRefreshToken}`, familyId, "EX", 864000);

    return familyId;
};

const invalidateTokenFamily = async (familyId) => {
    // Get all tokens in this family and delete them
    await redis.del(`token_family:${familyId}`);
};

const invalidateAllUserSessions = async (userId) => {
    const families = await redis.smembers(`user_families:${userId}`);
    const pipeline = redis.pipeline();
    for (const familyId of families) {
        pipeline.del(`token_family:${familyId}`);
    }
    pipeline.del(`user_families:${userId}`);
    await pipeline.exec();
};

// ─── ACCOUNT LOCKOUT ───────────────────────────────────
// After 5 failed attempts → lock for increasing periods

const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_SECONDS = 60; // 1 minute base, doubles each time

const recordFailedLogin = async (identifier) => {
    const key = `login_attempts:${identifier}`;
    const attempts = await redis.incr(key);

    if (attempts === 1) {
        await redis.expire(key, 900); // Reset counter after 15 min of inactivity
    }

    return attempts;
};

const checkAccountLocked = async (identifier) => {
    const lockKey = `account_locked:${identifier}`;
    const ttl = await redis.ttl(lockKey);

    if (ttl > 0) {
        return { locked: true, retryAfterSeconds: ttl };
    }
    return { locked: false };
};

const lockAccount = async (identifier, attemptCount) => {
    // Exponential backoff: 1min, 2min, 4min, 8min, 16min...
    const multiplier = Math.min(attemptCount - MAX_ATTEMPTS, 5);
    const lockDuration = BASE_LOCKOUT_SECONDS * Math.pow(2, multiplier);

    const lockKey = `account_locked:${identifier}`;
    await redis.set(lockKey, "true", "EX", lockDuration);

    return lockDuration;
};

const clearFailedAttempts = async (identifier) => {
    await redis.del(`login_attempts:${identifier}`);
};

// ─── DEVICE TRACKING ───────────────────────────────────

const trackLogin = async (userId, req) => {
    const deviceInfo = {
        ip: req.ip || req.connection?.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        loginAt: new Date().toISOString(),
    };

    // Store last 10 logins
    const key = `login_history:${userId}`;
    await redis.lpush(key, JSON.stringify(deviceInfo));
    await redis.ltrim(key, 0, 9);
    await redis.expire(key, 2592000); // 30 days

    return deviceInfo;
};

const isNewDevice = async (userId, userAgent) => {
    const key = `login_history:${userId}`;
    const history = await redis.lrange(key, 0, -1);

    if (history.length === 0) return true; // First login ever

    // Check if this user-agent has been seen before
    const parsedHistory = history.map((h) => JSON.parse(h));
    const knownAgents = parsedHistory.map((h) => h.userAgent);
    return !knownAgents.includes(userAgent);
};

// ─── AUDIT LOGGING ─────────────────────────────────────

const logAuthEvent = (eventType, data) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event: eventType,
        userId: data.userId || null,
        ip: data.ip || "unknown",
        userAgent: data.userAgent || "unknown",
        details: data.details || {},
        success: data.success !== undefined ? data.success : true,
    };

    // In production, send to a logging service (ELK, Datadog, etc.)
    // For now, structured console log
    console.log(`[AUTH_EVENT] ${JSON.stringify(logEntry)}`);

    return logEntry;
};

// ─── CSRF TOKEN ────────────────────────────────────────

const generateCsrfToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

module.exports = {
    // Token rotation
    createTokenFamily,
    rotateRefreshToken,
    invalidateTokenFamily,
    invalidateAllUserSessions,
    // Account lockout
    recordFailedLogin,
    checkAccountLocked,
    lockAccount,
    clearFailedAttempts,
    MAX_ATTEMPTS,
    // Device tracking
    trackLogin,
    isNewDevice,
    // Logging
    logAuthEvent,
    // CSRF
    generateCsrfToken,
};
