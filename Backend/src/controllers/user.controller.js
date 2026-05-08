const followModel = require("../models/follow.model");
const userModel = require("../models/user.model");
const postModel = require("../models/post.model");
const commentModel = require("../models/comment.model");
const likeModel = require("../models/like.model");
const storyModel = require("../models/story.model");
const messageModel = require("../models/message.model");
const notificationModel = require("../models/notification.model");
const userService = require("../services/user.service");
const { uploadToImageKit } = require("../services/imagekit.service");
const { escapeRegex } = require("../utils/sanitize");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const followUserController = asyncHandler(async (req, res) => {
    const followerId = req.user._id;
    const followeeUsername = req.params.username;

    const followee = await userModel.findOne({ username: followeeUsername });

    if (!followee) {
        throw new ApiError(404, "User not found");
    }

    if (followerId.toString() === followee._id.toString()) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const isAlreadyFollowing = await followModel.findOne({
        follower: followerId,
        followee: followee._id
    });

    if (isAlreadyFollowing) {
        return res.status(200).json(
            new ApiResponse(201, isAlreadyFollowing, `Follow request status: ${isAlreadyFollowing.status}`)
        );
    }

    const status = followee.isPrivate ? "pending" : "accepted";

    const followRecord = await followModel.create({
        follower: followerId,
        followee: followee._id,
        status
    });

    await notificationModel.create({
        recipient: followee._id,
        sender: followerId,
        type: status === "pending" ? "follow_request" : "follow_accepted"
    });

    return res.status(201).json(
        new ApiResponse(201, followRecord, status === "pending" ? "Follow request sent" : "Followed successfully")
    );
});

const unfollowUser = asyncHandler(async (req, res) => {
    const followerId = req.user._id;
    const followeeUsername = req.params.username;

    const followee = await userModel.findOne({ username: followeeUsername });
    if (!followee) throw new ApiError(404, "User not found");

    await followModel.findOneAndDelete({
        follower: followerId,
        followee: followee._id
    });

    return res.status(200).json(
        new ApiResponse(200, {}, `Unfollowed ${followeeUsername}`)
    );
});

const requestList = asyncHandler(async (req, res) => {
    const requests = await followModel.find({
        followee: req.user._id,
        status: "pending"
    }).populate("follower", "username profileImage bio fullName");

    return res.status(200).json(
        new ApiResponse(200, requests, "Follow requests fetched successfully")
    );
});

const respondRequests = asyncHandler(async (req, res) => {
    const { id: requestId } = req.params;
    const { action } = req.body;

    if (!["accepted", "rejected"].includes(action)) {
        throw new ApiError(400, "Invalid action");
    }

    const request = await followModel.findById(requestId);
    if (!request) throw new ApiError(404, "Request not found");

    if (request.followee.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to respond to this request");
    }

    if (action === "accepted") {
        request.status = "accepted";
        await request.save();

        await notificationModel.create({
            recipient: request.follower,
            sender: req.user._id,
            type: "follow_accepted"
        });
    } else {
        await followModel.findByIdAndDelete(requestId);
    }

    return res.status(200).json(
        new ApiResponse(200, {}, `Request ${action}`)
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await userModel.findOne({ username }).select("-password -refreshToken");

    if (!user) throw new ApiError(404, "User not found");

    // Check relationship status
    const followStatus = await followModel.findOne({
        follower: req.user._id,
        followee: user._id
    });

    const isFollowing = followStatus?.status === "accepted";
    const isPending = followStatus?.status === "pending";

    // Detailed Stats from Service
    const stats = await userService.getProfileStats(user._id);

    // Get Grid Posts (First 12)
    const posts = await postModel.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(12)
        .select("imgUrl likesCount commentsCount caption");

    return res.status(200).json(
        new ApiResponse(200, {
            ...user.toObject(),
            ...stats,
            isFollowing,
            isPending,
            posts,
            isOwner: req.user._id.toString() === user._id.toString()
        }, "Profile fetched successfully")
    );
});

const updateProfileController = asyncHandler(async (req, res) => {
    const { username, fullName, bio, isPrivate } = req.body;
    let updateData = { username, fullName, bio, isPrivate };

    // Validate bio length
    if (bio && bio.length > 150) {
        throw new ApiError(400, "Bio must be under 150 characters");
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Handle Profile Image Upload via shared service
    if (req.file) {
        const { url } = await uploadToImageKit(req.file, "profiles", `profile_${req.user.username}`);
        updateData.profileImage = url;
    }

    const updatedUser = await userService.updateProfile(req.user._id, updateData);

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});

const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query || query.trim().length === 0) throw new ApiError(400, "Search query is required");

    // Sanitize regex input to prevent ReDoS
    const safeQuery = escapeRegex(query.trim());

    const users = await userModel.find({
        $or: [
            { username: { $regex: safeQuery, $options: "i" } },
            { fullName: { $regex: safeQuery, $options: "i" } }
        ],
        _id: { $ne: req.user._id }
    }).select("username profileImage bio fullName").limit(20);

    return res.status(200).json(
        new ApiResponse(200, users, "Users found")
    );
});

// ─── SETTINGS ENDPOINTS ──────────────────────

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Both current and new password are required");
    }
    if (newPassword.length < 8) {
        throw new ApiError(400, "New password must be at least 8 characters");
    }

    const user = await userModel.findById(req.user._id).select("+password");
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new ApiError(401, "Current password is incorrect");

    user.password = newPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

const getFollowersList = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await userModel.findOne({ username });
    if (!user) throw new ApiError(404, "User not found");

    const followers = await followModel.find({
        followee: user._id,
        status: "accepted"
    }).populate("follower", "username profileImage fullName bio");

    return res.status(200).json(
        new ApiResponse(200, followers.map(f => f.follower), "Followers list")
    );
});

const getFollowingList = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await userModel.findOne({ username });
    if (!user) throw new ApiError(404, "User not found");

    const following = await followModel.find({
        follower: user._id,
        status: "accepted"
    }).populate("followee", "username profileImage fullName bio");

    return res.status(200).json(
        new ApiResponse(200, following.map(f => f.followee), "Following list")
    );
});

const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    ...(maxAge && { maxAge }),
});

const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) throw new ApiError(400, "Password is required to delete account");

    const user = await userModel.findById(req.user._id).select("+password");
    const isValid = await user.comparePassword(password);
    if (!isValid) throw new ApiError(401, "Incorrect password");

    // Full cascade delete — every trace of the user
    await Promise.all([
        postModel.deleteMany({ user: req.user._id }),
        commentModel.deleteMany({ user: req.user._id }),
        likeModel.deleteMany({ user: req.user._id }),
        storyModel.deleteMany({ user: req.user._id }),
        messageModel.deleteMany({ $or: [{ sender: req.user._id }, { recipient: req.user._id }] }),
        followModel.deleteMany({ $or: [{ follower: req.user._id }, { followee: req.user._id }] }),
        notificationModel.deleteMany({ $or: [{ sender: req.user._id }, { recipient: req.user._id }] }),
        userModel.findByIdAndDelete(req.user._id)
    ]);

    // Clear cookies with same options they were set with
    const opts = getCookieOptions();
    return res
        .status(200)
        .clearCookie("accessToken", opts)
        .clearCookie("refreshToken", opts)
        .clearCookie("csrf-token", opts)
        .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

const getSuggestedUsersController = asyncHandler(async (req, res) => {
    const following = await followModel.find({
        follower: req.user._id
    }).select("followee");
    const followingIds = following.map(f => f.followee);

    const excludeIds = [req.user._id, ...followingIds];

    // Query active stories to find creators who have active stories
    const activeStoryUserIds = await storyModel.distinct("user");

    // Advanced prioritized aggregation
    const suggested = await userModel.aggregate([
        {
            $match: {
                _id: { $nin: excludeIds }
            }
        },
        {
            $addFields: {
                hasActiveStory: {
                    $cond: { if: { $in: ["$_id", activeStoryUserIds] }, then: true, else: false }
                },
                prioritized: {
                    $add: [
                        { $cond: { if: { $eq: ["$isDemoUser", true] }, then: 2, else: 0 } },
                        { $cond: { if: { $eq: ["$isVerified", true] }, then: 1, else: 0 } },
                        { $cond: { if: { $in: ["$_id", activeStoryUserIds] }, then: 1, else: 0 } }
                    ]
                }
            }
        },
        {
            $sort: { prioritized: -1, createdAt: -1 }
        },
        {
            $limit: 15
        },
        {
            $project: {
                username: 1,
                profileImage: 1,
                fullName: 1,
                bio: 1,
                isVerified: 1,
                isDemoUser: 1,
                hasActiveStory: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, suggested, "Suggested users fetched successfully")
    );
});

module.exports = {
    followUserController,
    unfollowUser,
    requestList,
    respondRequests,
    getUserProfile,
    updateProfileController,
    searchUsers,
    changePassword,
    getFollowersList,
    getFollowingList,
    deleteAccount,
    getSuggestedUsersController
};
