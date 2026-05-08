const express = require('express');
const {
    createGroup,
    joinGroup,
    getGroupPosts,
    searchGroups
} = require('../controllers/group.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const groupRouter = express.Router();

groupRouter.use(verifyJWT);

groupRouter.post('/', createGroup);
groupRouter.post('/join/:groupId', joinGroup);
groupRouter.get('/posts/:groupId', getGroupPosts);
groupRouter.get('/search', searchGroups);

module.exports = groupRouter;
