const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow_request', 'follow_accepted', 'mention', 'group_invite'],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const notificationModel = mongoose.model('notifications', notificationSchema);

module.exports = notificationModel;
