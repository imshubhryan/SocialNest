const reportModel = require("../models/report.model");
const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createReport = asyncHandler(async (req, res) => {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
        throw new ApiError(400, "Target type, ID and reason are required");
    }

    const report = await reportModel.create({
        reporter: req.user._id,
        targetType,
        targetId,
        reason
    });

    return res.status(201).json(new ApiResponse(201, report, "Report submitted successfully"));
});

// Admin Only Controllers
const getAllReports = asyncHandler(async (req, res) => {
    const reports = await reportModel.find()
        .populate("reporter", "username email")
        .populate("targetId")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, reports, "Reports fetched"));
});

const banUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body; // true to ban, false to unban

    const user = await userModel.findByIdAndUpdate(userId, { isBanned: status }, { new: true });
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, user, status ? "User banned" : "User unbanned"));
});

const getAdminStats = asyncHandler(async (req, res) => {
    const userCount = await userModel.countDocuments();
    const postCount = await postModel.countDocuments();
    const reportCount = await reportModel.countDocuments({ status: 'pending' });

    return res.status(200).json(new ApiResponse(200, {
        userCount,
        postCount,
        reportCount
    }, "Stats fetched"));
});

module.exports = {
    createReport,
    getAllReports,
    banUser,
    getAdminStats
};
