const mongoose = require('mongoose');

const MAX_RETRIES = 3;
let retries = 0;

const connectToDb = async () => {
    while (retries < MAX_RETRIES) {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ MongoDB connected successfully');
            return;
        } catch (err) {
            retries++;
            console.error(`❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`, err.message);
            if (retries >= MAX_RETRIES) {
                console.error('❌ Could not connect to MongoDB. Exiting...');
                process.exit(1);
            }
            // Wait before retrying (exponential backoff)
            const delay = Math.min(retries * 2000, 10000);
            console.log(`⟳ Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Handle connection events after initial connect
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
});

module.exports = connectToDb;