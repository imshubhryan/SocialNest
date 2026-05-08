const notificationModel = require("../models/notification.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const getNotifications = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 30);

    const notifications = await notificationModel.find({ recipient: req.user._id })
        .populate("sender", "username profileImage")
        .populate("post", "imgUrl caption")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    // Authorization check — only the recipient can mark their own notifications
    const notification = await notificationModel.findById(notificationId);
    if (!notification) throw new ApiError(404, "Notification not found");

    if (notification.recipient.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to modify this notification");
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json(new ApiResponse(200, {}, "Marked as read"));
});

const clearNotifications = asyncHandler(async (req, res) => {
    await notificationModel.deleteMany({ recipient: req.user._id });
    return res.status(200).json(new ApiResponse(200, {}, "Notifications cleared"));
});

module.exports = {
    getNotifications,
    markAsRead,
    clearNotifications
};
