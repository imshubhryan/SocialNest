const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        index: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groups',
        index: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const messageModel = mongoose.model('messages', messageSchema);

module.exports = messageModel;
