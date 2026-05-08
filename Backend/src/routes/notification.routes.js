const express = require('express');
const {
    getNotifications,
    markAsRead,
    clearNotifications
} = require('../controllers/notification.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const notificationRouter = express.Router();

notificationRouter.use(verifyJWT);

notificationRouter.get('/', getNotifications);
notificationRouter.patch('/:notificationId', markAsRead);
notificationRouter.delete('/', clearNotifications);

module.exports = notificationRouter;
