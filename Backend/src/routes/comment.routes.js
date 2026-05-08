const express = require('express');
const {
    addComment,
    getPostComments,
    getCommentReplies,
    deleteComment
} = require('../controllers/comment.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const commentRouter = express.Router();

commentRouter.use(verifyJWT);

// Specific route for POST /comment/create as requested by user
commentRouter.post('/create', addComment); 

commentRouter.post('/:postId', addComment);
commentRouter.get('/post/:postId', getPostComments);
commentRouter.get('/replies/:commentId', getCommentReplies);
commentRouter.delete('/:commentId', deleteComment);

module.exports = commentRouter;
