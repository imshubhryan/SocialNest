const express = require('express');
const { uploadStory, getFollowingStories, viewStory, deleteStory } = require('../controllers/story.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { uploadMedia } = require('../middlewares/upload.middleware');

const storyRouter = express.Router();
storyRouter.use(verifyJWT);

storyRouter.post('/upload', uploadMedia.single("media"), uploadStory);
storyRouter.get('/following', getFollowingStories);
storyRouter.post('/view/:id', viewStory);
storyRouter.delete('/:id', deleteStory);

module.exports = storyRouter;
