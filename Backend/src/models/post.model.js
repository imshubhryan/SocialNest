const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: "",
        trim: true
    },
    imgUrl: {
        type: String,
        required: [true, "imgUrl is required for creating a post"]
    },
    user: {
        ref: "users",
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "user id is required for creating post"],
        index: true
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groups',
        index: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    commentsCount: {
        type: Number,
        default: 0
    },
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for trending feed (engagement based)
postSchema.index({ createdAt: -1, likesCount: -1 });

const postModel = mongoose.model('posts', postSchema);

module.exports = postModel;