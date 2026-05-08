const express = require("express");
const {
    registerController,
    loginController,
    logoutController,
    logoutAllController,
    refreshAccessTokenController,
    getMEController,
    verifyEmailController,
    resendVerificationController,
    onboardingController,
    forgotPasswordController,
    resetPasswordController,
    getActiveSessionsController,
} = require('../controllers/auth.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter.middleware');
const {
    validate,
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} = require('../validators/auth.validator');

const authRouter = express.Router();

// Public routes (with Joi validation and rate limiters)
authRouter.post("/register", registerLimiter, validate(registerSchema), registerController);
authRouter.post("/login", loginLimiter, validate(loginSchema), loginController);
authRouter.get("/verify-email/:token", verifyEmailController);
authRouter.post("/resend-verification", resendVerificationController);
authRouter.post("/refresh-token", refreshAccessTokenController);
authRouter.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordController);
authRouter.post("/reset-password/:token", validate(resetPasswordSchema), resetPasswordController);

// Secured routes
authRouter.post("/logout", verifyJWT, logoutController);
authRouter.post("/logout-all", verifyJWT, logoutAllController);
authRouter.get('/get-me', verifyJWT, getMEController);
authRouter.get('/sessions', verifyJWT, getActiveSessionsController);
authRouter.post('/onboarding', verifyJWT, onboardingController);

module.exports = authRouter;
