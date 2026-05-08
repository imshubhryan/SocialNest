const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    targetType: {
        type: String,
        enum: ['post', 'user', 'comment'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType'
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    actionTaken: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const reportModel = mongoose.model('reports', reportSchema);

module.exports = reportModel;
