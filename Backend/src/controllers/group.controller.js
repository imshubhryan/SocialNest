const groupModel = require("../models/group.model");
const postModel = require("../models/post.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { escapeRegex } = require("../utils/sanitize");

const createGroup = asyncHandler(async (req, res) => {
    const { name, description, privacy } = req.body;

    if (!name || name.trim().length === 0) throw new ApiError(400, "Group name is required");
    if (name.length > 100) throw new ApiError(400, "Group name must be under 100 characters");
    if (description && description.length > 500) throw new ApiError(400, "Description must be under 500 characters");

    const existingGroup = await groupModel.findOne({ name });
    if (existingGroup) throw new ApiError(409, "Group name already exists");

    const group = await groupModel.create({
        name,
        description,
        privacy: privacy || 'public',
        creator: req.user._id,
        members: [{ user: req.user._id, role: 'admin' }]
    });

    return res.status(201).json(new ApiResponse(201, group, "Group created successfully"));
});

const joinGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const group = await groupModel.findById(groupId);

    if (!group) throw new ApiError(404, "Group not found");

    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) throw new ApiError(400, "Already a member");

    group.members.push({ user: req.user._id, role: 'member' });
    await group.save();

    return res.status(200).json(new ApiResponse(200, group, "Joined group"));
});

const getGroupPosts = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const group = await groupModel.findById(groupId);
    if (!group) throw new ApiError(404, "Group not found");

    // Check membership if private
    if (group.privacy === 'private') {
        const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
        if (!isMember) throw new ApiError(403, "This is a private group");
    }

    const posts = await postModel.find({ group: groupId })
        .populate("user", "username profileImage")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, posts, "Group posts fetched"));
});

const searchGroups = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query || query.trim().length === 0) throw new ApiError(400, "Search query is required");

    const safeQuery = escapeRegex(query.trim());
    const groups = await groupModel.find({
        $or: [
            { name: { $regex: safeQuery, $options: 'i' } },
            { description: { $regex: safeQuery, $options: 'i' } }
        ]
    }).limit(20);

    return res.status(200).json(new ApiResponse(200, groups, "Groups found"));
});

module.exports = {
    createGroup,
    joinGroup,
    getGroupPosts,
    searchGroups
};
