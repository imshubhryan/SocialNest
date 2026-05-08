const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments',
        default: null
    },
    repliesCount: {
        type: Number,
        default: 0
    },
    likesCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const commentModel = mongoose.model('comments', commentSchema);

module.exports = commentModel;
