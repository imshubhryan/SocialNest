const commentModel = require("../models/comment.model");
const postModel = require("../models/post.model");
const notificationModel = require("../models/notification.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const addComment = asyncHandler(async (req, res) => {
    const postId = req.params.postId || req.body.postId;
    const { content, parentCommentId } = req.body;

    if (!content) throw new ApiError(400, "Comment content is required");

    const post = await postModel.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const comment = await commentModel.create({
        post: postId,
        user: req.user._id,
        content,
        parentComment: parentCommentId || null
    });

    // Update comment counter on post
    post.commentsCount += 1;
    await post.save();

    // If reply, update repliesCount on parent
    if (parentCommentId) {
        await commentModel.findByIdAndUpdate(parentCommentId, {
            $inc: { repliesCount: 1 }
        });
    }

    // Notify post owner
    if (post.user.toString() !== req.user._id.toString()) {
        await notificationModel.create({
            recipient: post.user,
            sender: req.user._id,
            type: "comment",
            post: post._id,
            comment: comment._id
        });
    }

    return res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});

const getPostComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await commentModel.find({ post: postId, parentComment: null })
        .populate("user", "username profileImage")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched"));
});

const getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const replies = await commentModel.find({ parentComment: commentId })
        .populate("user", "username profileImage")
        .sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, replies, "Replies fetched"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const comment = await commentModel.findById(commentId);

    if (!comment) throw new ApiError(404, "Comment not found");

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, "Unauthorized to delete this comment");
    }

    await commentModel.findByIdAndDelete(commentId);
    
    // Decrement counter
    await postModel.findByIdAndUpdate(comment.post, {
        $inc: { commentsCount: -1 }
    });

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});

module.exports = {
    addComment,
    getPostComments,
    getCommentReplies,
    deleteComment
};
