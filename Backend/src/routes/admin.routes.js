const express = require('express');
const {
    createReport,
    getAllReports,
    banUser,
    getAdminStats
} = require('../controllers/admin.controller');
const { verifyJWT, verifyRole } = require('../middlewares/auth.middleware');

const adminRouter = express.Router();

adminRouter.use(verifyJWT);

// Publicly available (for users to report)
adminRouter.post('/report', createReport);

// Admin only routes
adminRouter.use(verifyRole(['admin', 'moderator']));

adminRouter.get('/reports', getAllReports);
adminRouter.get('/stats', getAdminStats);
adminRouter.patch('/user/ban/:userId', banUser);

module.exports = adminRouter;
