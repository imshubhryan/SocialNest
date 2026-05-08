const Redis = require('ioredis');

const MAX_RETRIES = 5;

const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    retryStrategy: (times) => {
        if (times > MAX_RETRIES) {
            console.error(
                `\n❌ Redis: Could not connect after ${MAX_RETRIES} attempts.\n` +
                `   Make sure Redis is running on ${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}\n` +
                `   On Windows: install Redis via WSL, Docker, or Memurai.\n`
            );
            // Return null to stop retrying (ioredis will emit 'end' event)
            return null;
        }
        const delay = Math.min(times * 200, 2000);
        console.log(`⟳ Redis: Retry attempt ${times}/${MAX_RETRIES} in ${delay}ms...`);
        return delay;
    },
    // Don't throw ECONNREFUSED on every single command while reconnecting
    enableOfflineQueue: true,
});

let hasConnected = false;

redis.on('connect', () => {
    hasConnected = true;
    console.log('✅ Redis connected');
});

redis.on('error', (err) => {
    // Only log the first connection error — avoid spamming the console
    if (!hasConnected && err.code === 'ECONNREFUSED') {
        // Silenced — retryStrategy already logs attempts
        return;
    }
    console.error('Redis error:', err.message);
});

redis.on('end', () => {
    if (!hasConnected) {
        console.warn('⚠️  Redis is unavailable — features requiring Redis (auth tokens, rate limiting) will fail.');
    }
});

module.exports = redis;
