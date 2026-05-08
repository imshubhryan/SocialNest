const postModel = require("../models/post.model");
const likeModel = require("../models/like.model");
const followModel = require("../models/follow.model");
const notificationModel = require("../models/notification.model");
const commentModel = require("../models/comment.model");
const { uploadToImageKit } = require("../services/imagekit.service");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createPostController = asyncHandler(async (req, res) => {
    const { caption, tags, isPublic, groupId } = req.body;

    if (!req.file) {
        throw new ApiError(400, "Image is required for creating a post");
    }

    // Validate caption length
    if (caption && caption.length > 2200) {
        throw new ApiError(400, "Caption must be under 2200 characters");
    }

    const { url } = await uploadToImageKit(req.file, "posts", "post");

    const post = await postModel.create({
        caption: caption || "",
        imgUrl: url,
        user: req.user._id,
        tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : [],
        isPublic: isPublic !== undefined ? isPublic : true,
        group: groupId || undefined
    });

    return res.status(201).json(
        new ApiResponse(201, post, "Post created successfully")
    );
});

const getPostDetailsController = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await postModel.findById(postId).populate("user", "username profileImage");

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Check visibility if private
    if (!post.isPublic) {
        const isFollower = await followModel.findOne({
            follower: req.user._id,
            followee: post.user,
            status: "accepted"
        });
        if (!isFollower && post.user._id.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "This post is private");
        }
    }

    const isLiked = await likeModel.exists({ post: postId, user: req.user._id });

    return res.status(200).json(
        new ApiResponse(200, { ...post.toObject(), isLiked: !!isLiked }, "Post fetched successfully")
    );
});

const likePostController = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await postModel.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const userId = req.user._id;
    const existingLike = await likeModel.findOne({ post: postId, user: userId });

    if (existingLike) {
        // Unlike — use atomic operations instead of mutating arrays
        await likeModel.findByIdAndDelete(existingLike._id);
        await postModel.findByIdAndUpdate(postId, {
            $pull: { likes: userId },
            $inc: { likesCount: -1 }
        });

        return res.status(200).json(
            new ApiResponse(200, { likesCount: Math.max(0, post.likesCount - 1), isLiked: false }, "Post unliked")
        );
    }

    // Like — atomic update
    await likeModel.create({ post: postId, user: userId });
    await postModel.findByIdAndUpdate(postId, {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 }
    });

    // Notify post owner (don't notify self)
    if (post.user.toString() !== userId.toString()) {
        await notificationModel.create({
            recipient: post.user,
            sender: userId,
            type: "like",
            post: post._id
        });
    }

    return res.status(200).json(
        new ApiResponse(200, { likesCount: post.likesCount + 1, isLiked: true }, "Post liked")
    );
});

const getFeed = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const sort = req.query.sort || 'latest';
    const skip = (page - 1) * limit;

    // Get followed users
    const following = await followModel.find({
        follower: req.user._id,
        status: "accepted"
    }).select("followee");
    const followingIds = following.map(f => f.followee);

    // Only show posts from followed users + own posts (no global public flood)
    const query = {
        $or: [
            { user: { $in: followingIds } },
            { user: req.user._id }
        ]
    };

    let sortOption = { createdAt: -1 };
    if (sort === 'trending') {
        sortOption = { likesCount: -1, commentsCount: -1, createdAt: -1 };
    }

    let posts = await postModel.find(query)
        .populate("user", "username profileImage")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();

    // FALLBACK LOGIC: Serve latest public posts to prevent empty screen
    if (posts.length === 0 && page === 1) {
        posts = await postModel.find({ isPublic: true })
            .populate("user", "username profileImage")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    // Map like/save states
    const processedPosts = posts.map(post => ({
        ...post,
        isLiked: post.likes?.some(id => id.toString() === req.user._id.toString()),
        isSaved: post.savedBy?.some(id => id.toString() === req.user._id.toString()) || req.user.savedPosts?.includes(post._id)
    }));

    return res.status(200).json(
        new ApiResponse(200, processedPosts, "Feed fetched")
    );
});

const deletePostController = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await postModel.findById(postId);

    if (!post) throw new ApiError(404, "Post not found");

    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, "Unauthorized to delete this post");
    }

    await Promise.all([
        postModel.findByIdAndDelete(postId),
        likeModel.deleteMany({ post: postId }),
        commentModel.deleteMany({ post: postId }),
        notificationModel.deleteMany({ post: postId })
    ]);

    return res.status(200).json(
        new ApiResponse(200, {}, "Post deleted successfully")
    );
});

const savePostController = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await postModel.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const userId = req.user._id;
    const isSaved = post.savedBy.includes(userId);

    if (isSaved) {
        // Unsave — use atomic operations (avoids triggering pre-save password hash)
        await postModel.findByIdAndUpdate(postId, { $pull: { savedBy: userId } });
        await require("../models/user.model").findByIdAndUpdate(userId, { $pull: { savedPosts: postId } });
        return res.status(200).json(new ApiResponse(200, { isSaved: false }, "Post unsaved"));
    }

    // Save — atomic
    await postModel.findByIdAndUpdate(postId, { $addToSet: { savedBy: userId } });
    await require("../models/user.model").findByIdAndUpdate(userId, { $addToSet: { savedPosts: postId } });
    return res.status(200).json(new ApiResponse(200, { isSaved: true }, "Post saved"));
});

const getSavedPosts = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    const user = await req.user.populate({
        path: "savedPosts",
        populate: { path: "user", select: "username profileImage" },
        options: { sort: { createdAt: -1 }, skip: (page - 1) * limit, limit }
    });
    
    return res.status(200).json(
        new ApiResponse(200, user.savedPosts, "Saved posts fetched")
    );
});

const getLikedPosts = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    const likes = await likeModel.find({ user: req.user._id })
        .populate({
            path: "post",
            populate: { path: "user", select: "username profileImage" }
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const posts = likes.map(l => l.post).filter(p => p !== null);

    return res.status(200).json(
        new ApiResponse(200, posts, "Liked posts fetched")
    );
});

module.exports = {
    createPostController,
    getPostDetailsController,
    likePostController,
    getFeed,
    deletePostController,
    savePostController,
    getSavedPosts,
    getLikedPosts
};
