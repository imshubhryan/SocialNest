const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    media: {
        type: String,
        required: [true, "Media URL is required"]
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Auto-delete after 24 hours (TTL index)
    }
});

const storyModel = mongoose.model('stories', storySchema);
module.exports = storyModel;
