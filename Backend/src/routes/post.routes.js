const express = require('express');
const {
    createPostController,
    getPostDetailsController,
    likePostController,
    getFeed,
    deletePostController,
    savePostController,
    getSavedPosts,
    getLikedPosts
} = require('../controllers/post.controller');
const { uploadImage } = require('../middlewares/upload.middleware');
const { verifyJWT } = require('../middlewares/auth.middleware');

const postRouter = express.Router();

postRouter.use(verifyJWT);

postRouter.post('/', uploadImage.single("image"), createPostController);
postRouter.get('/feed', getFeed);
postRouter.get('/saved', getSavedPosts);
postRouter.get('/liked', getLikedPosts);
postRouter.get('/:postId', getPostDetailsController);
postRouter.post('/like/:postId', likePostController);
postRouter.post('/save/:postId', savePostController);
postRouter.post('/unsave/:postId', savePostController);
postRouter.delete('/:postId', deletePostController);

module.exports = postRouter;