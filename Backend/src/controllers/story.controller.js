const storyModel = require("../models/story.model");
const followModel = require("../models/follow.model");
const { uploadToImageKit } = require("../services/imagekit.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// Upload Story
const uploadStory = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Media file is required");
    }

    const { url } = await uploadToImageKit(req.file, "stories", `story_${req.user.username}`);
    const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";

    const story = await storyModel.create({
        user: req.user._id,
        media: url,
        mediaType
    });

    return res.status(201).json(
        new ApiResponse(201, story, "Story uploaded successfully")
    );
});

// Get Stories of Followed Users
const getFollowingStories = asyncHandler(async (req, res) => {
    const following = await followModel.find({
        follower: req.user._id,
        status: "accepted"
    }).select("followee");

    const followeeIds = following.map(f => f.followee);
    followeeIds.push(req.user._id);

    const stories = await storyModel.find({
        user: { $in: followeeIds }
    })
    .populate("user", "username profileImage fullName")
    .sort({ createdAt: -1 });

    // Group stories by user
    const grouped = {};
    stories.forEach(story => {
        const uid = story.user._id.toString();
        if (!grouped[uid]) {
            grouped[uid] = {
                user: story.user,
                stories: [],
                hasUnviewed: false
            };
        }
        grouped[uid].stories.push(story);
        if (!story.viewers.includes(req.user._id.toString())) {
            grouped[uid].hasUnviewed = true;
        }
    });

    // Put current user's stories first
    const myStories = grouped[req.user._id.toString()];
    delete grouped[req.user._id.toString()];
    const result = myStories ? [myStories, ...Object.values(grouped)] : Object.values(grouped);

    return res.status(200).json(
        new ApiResponse(200, result, "Stories fetched")
    );
});

// View Story (mark as seen)
const viewStory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const story = await storyModel.findById(id);
    if (!story) throw new ApiError(404, "Story not found");

    if (!story.viewers.includes(req.user._id)) {
        story.viewers.push(req.user._id);
        await story.save();
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Story viewed")
    );
});

// Delete own story
const deleteStory = asyncHandler(async (req, res) => {
    const story = await storyModel.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });
    if (!story) throw new ApiError(404, "Story not found or not authorized");

    return res.status(200).json(
        new ApiResponse(200, {}, "Story deleted")
    );
});

module.exports = { uploadStory, getFollowingStories, viewStory, deleteStory };
