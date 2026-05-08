const express = require('express');
const {
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
} = require('../controllers/user.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../middlewares/upload.middleware');

const userRouter = express.Router();
userRouter.use(verifyJWT);

// Suggestions
userRouter.get('/suggestions', getSuggestedUsersController);

// Follow/Relationship
userRouter.post('/follow/:username', followUserController);
userRouter.post('/unfollow/:username', unfollowUser);
userRouter.get('/requests', requestList);
userRouter.post('/requests/:id', respondRequests);

// Profile
userRouter.get('/profile/:username', getUserProfile);
userRouter.patch('/update-profile', uploadImage.single("profileImage"), updateProfileController);
userRouter.get('/search', searchUsers);

// Followers/Following lists
userRouter.get('/:username/followers', getFollowersList);
userRouter.get('/:username/following', getFollowingList);

// Settings
userRouter.patch('/change-password', changePassword);
userRouter.delete('/delete-account', deleteAccount);

module.exports = userRouter;