const express = require('express');
const {
    sendMessage,
    getMessages
} = require('../controllers/chat.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const chatRouter = express.Router();

chatRouter.use(verifyJWT);

chatRouter.post('/send', sendMessage);
chatRouter.get('/history/:otherUserId', getMessages);

module.exports = chatRouter;
