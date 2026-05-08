const userModel = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const redis = require("../config/redis");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");
const authService = require("../services/auth.service");

// ─── COOKIE OPTIONS ────────────────────────────────────
const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    path: "/",
    ...(maxAge && { maxAge }),
});

// ─── TOKEN GENERATION ──────────────────────────────────
const generateAccessAndRefreshTokens = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) throw new ApiError(500, "User not found during token generation", "TOKEN_GENERATION_FAILED");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Register token in rotation family
    await authService.createTokenFamily(userId, refreshToken);

    return { accessToken, refreshToken };
};

// ─── REGISTER ──────────────────────────────────────────
const registerController = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    // Validation is handled by Joi middleware — inputs are already sanitized

    // Check permanent DB
    const existedUser = await userModel.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        if (existedUser.email === email) {
            throw new ApiError(409, "User with this email already exists", "EMAIL_EXISTS");
        }
        throw new ApiError(409, "User with this username already exists", "USERNAME_EXISTS");
    }

    // Check pending in Redis
    const pendingUser = await redis.get(`pending_email:${email}`);
    if (pendingUser) {
        throw new ApiError(409, "A verification link was already sent. Please check your inbox.", "PENDING_VERIFICATION");
    }

    // Generate verification token
    const verificationToken = jwt.sign(
        { email },
        process.env.VERIFICATION_TOKEN_SECRET,
        { expiresIn: "24h" }
    );

    // Hash password BEFORE storing in Redis
    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = JSON.stringify({
        username,
        email,
        password: hashedPassword,
        verificationToken,
    });

    await redis.set(`pending_user:${verificationToken}`, userData, "EX", 86400);
    await redis.set(`pending_email:${email}`, "true", "EX", 86400);

    await sendVerificationEmail(email, username, verificationToken);

    authService.logAuthEvent("REGISTER_INITIATED", {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        details: { email, username },
    });

    return res.status(201).json(
        new ApiResponse(201, {}, "Registration started! Please check your email to verify your account.")
    );
});

// ─── VERIFY EMAIL ──────────────────────────────────────
const verifyEmailController = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) throw new ApiError(400, "Verification token is required", "MISSING_TOKEN");

    const userDataJson = await redis.get(`pending_user:${token}`);
    if (!userDataJson) {
        throw new ApiError(400, "Invalid or expired verification link. Please register again.", "INVALID_TOKEN");
    }

    const userData = JSON.parse(userDataJson);

    let newUser;
    try {
        newUser = await userModel.create({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            isVerified: true,
            isOnboarded: false,
        });
    } catch (err) {
        if (err.code === 11000) {
            await redis.del(`pending_user:${token}`);
            await redis.del(`pending_email:${userData.email}`);
            return res.status(200).json(
                new ApiResponse(200, {}, "Email already verified. You can log in.")
            );
        }
        throw err;
    }

    await redis.del(`pending_user:${token}`);
    await redis.del(`pending_email:${userData.email}`);

    authService.logAuthEvent("EMAIL_VERIFIED", {
        userId: newUser._id,
        ip: req.ip,
        details: { email: userData.email },
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully! You can now log in.")
    );
});

// ─── RESEND VERIFICATION ───────────────────────────────
const resendVerificationController = asyncHandler(async (req, res) => {
    throw new ApiError(400, "Please register again if your link expired.", "UNSUPPORTED");
});

// ─── LOGIN ─────────────────────────────────────────────
const loginController = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Determine login identifier for lockout tracking
    const identifier = (email || username).toLowerCase();

    // Check if account is locked
    const lockStatus = await authService.checkAccountLocked(identifier);
    if (lockStatus.locked) {
        authService.logAuthEvent("LOGIN_BLOCKED_LOCKED", {
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            details: { identifier, retryAfter: lockStatus.retryAfterSeconds },
            success: false,
        });
        throw new ApiError(
            429,
            `Account temporarily locked. Try again in ${lockStatus.retryAfterSeconds} seconds.`,
            "ACCOUNT_LOCKED"
        );
    }

    // Smart query: auto-detect if input is email or username
    // Supports: { username: "john" }, { email: "john@x.com" }, or single-field login
    const loginInput = (email || username || "").toLowerCase().trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput);

    // Use $or to search BOTH fields — handles all cases
    const user = await userModel.findOne({
        $or: [
            { email: loginInput },
            { username: loginInput }
        ]
    }).select("+password");

    if (!user) {
        const attempts = await authService.recordFailedLogin(identifier);
        if (attempts >= authService.MAX_ATTEMPTS) {
            const lockDuration = await authService.lockAccount(identifier, attempts);
            authService.logAuthEvent("ACCOUNT_LOCKED", {
                ip: req.ip,
                details: { identifier, lockDuration },
                success: false,
            });
        }
        authService.logAuthEvent("LOGIN_FAILED", {
            ip: req.ip, userAgent: req.headers["user-agent"],
            details: { identifier, reason: "user_not_found" },
            success: false,
        });
        throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email before logging in.", "UNVERIFIED_EMAIL");
    }

    if (user.isBanned) {
        throw new ApiError(403, "Your account has been suspended", "ACCOUNT_BANNED");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        const attempts = await authService.recordFailedLogin(identifier);
        if (attempts >= authService.MAX_ATTEMPTS) {
            const lockDuration = await authService.lockAccount(identifier, attempts);
            authService.logAuthEvent("ACCOUNT_LOCKED", {
                userId: user._id, ip: req.ip,
                details: { identifier, lockDuration, attempts },
                success: false,
            });
            throw new ApiError(
                429,
                `Too many failed attempts. Account locked for ${lockDuration} seconds.`,
                "ACCOUNT_LOCKED"
            );
        }
        authService.logAuthEvent("LOGIN_FAILED", {
            userId: user._id, ip: req.ip, userAgent: req.headers["user-agent"],
            details: { identifier, reason: "wrong_password", attempts },
            success: false,
        });
        throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    // Success — clear failed attempts
    await authService.clearFailedAttempts(identifier);

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Track device
    const deviceInfo = await authService.trackLogin(user._id, req);

    // Detect new device
    const isNew = await authService.isNewDevice(user._id, req.headers["user-agent"]);

    const loggedInUser = await userModel.findById(user._id)
        .select("-password -refreshToken -verificationToken");

    authService.logAuthEvent("LOGIN_SUCCESS", {
        userId: user._id, ip: req.ip, userAgent: req.headers["user-agent"],
        details: { newDevice: isNew },
    });

    // Generate CSRF token for cookie-based auth
    const csrfToken = authService.generateCsrfToken();
    await redis.set(`csrf:${user._id}`, csrfToken, "EX", 3600);

    return res
        .status(200)
        .cookie("accessToken", accessToken, getCookieOptions(3600000)) // 1 hour
        .cookie("refreshToken", refreshToken, getCookieOptions(864000000)) // 10 days
        .cookie("csrf-token", csrfToken, {
            ...getCookieOptions(3600000),
            httpOnly: false, // Frontend must read this
        })
        .json(new ApiResponse(200, { user: loggedInUser }, "Login successful"));
});

// ─── LOGOUT ────────────────────────────────────────────
const logoutController = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (accessToken) {
        try {
            const decoded = jwt.decode(accessToken);
            const ttl = decoded?.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 0) : 3600;
            await redis.set(`blacklist_${accessToken}`, "true", "EX", ttl);
        } catch {
            await redis.set(`blacklist_${accessToken}`, "true", "EX", 3600);
        }
    }

    // Invalidate refresh token family
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        const familyId = await redis.get(`refresh_token:${refreshToken}`);
        if (familyId) {
            await authService.invalidateTokenFamily(familyId);
        }
        await redis.del(`refresh_token:${refreshToken}`);
    }

    await userModel.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    authService.logAuthEvent("LOGOUT", {
        userId: req.user._id, ip: req.ip,
    });

    const opts = getCookieOptions();
    return res
        .status(200)
        .clearCookie("accessToken", opts)
        .clearCookie("refreshToken", opts)
        .clearCookie("csrf-token", opts)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─── LOGOUT ALL DEVICES ────────────────────────────────
const logoutAllController = asyncHandler(async (req, res) => {
    await authService.invalidateAllUserSessions(req.user._id);

    await userModel.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    authService.logAuthEvent("LOGOUT_ALL_DEVICES", {
        userId: req.user._id, ip: req.ip,
    });

    const opts = getCookieOptions();
    return res
        .status(200)
        .clearCookie("accessToken", opts)
        .clearCookie("refreshToken", opts)
        .clearCookie("csrf-token", opts)
        .json(new ApiResponse(200, {}, "Logged out from all devices"));
});

// ─── REFRESH TOKEN ─────────────────────────────────────
const refreshAccessTokenController = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Session expired. Please log in again.", "SESSION_EXPIRED");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired session", "INVALID_SESSION");
    }

    const user = await userModel.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid session", "INVALID_SESSION");
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Session mismatch", "SESSION_EXPIRED");
    }

    // Generate new tokens
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // REFRESH TOKEN ROTATION — detect reuse attacks
    const familyId = await authService.rotateRefreshToken(
        incomingRefreshToken, user._id.toString(), newRefreshToken
    );

    if (familyId === null) {
        // ATTACK DETECTED! All sessions invalidated
        authService.logAuthEvent("TOKEN_REUSE_ATTACK", {
            userId: user._id, ip: req.ip, userAgent: req.headers["user-agent"],
            success: false,
            details: { action: "all_sessions_invalidated" },
        });
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(401, "Security alert: session compromised. Please log in again.", "TOKEN_REUSE_DETECTED");
    }

    // Save new refresh token to DB
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    authService.logAuthEvent("TOKEN_REFRESHED", {
        userId: user._id, ip: req.ip,
    });

    return res
        .status(200)
        .cookie("accessToken", accessToken, getCookieOptions(3600000))
        .cookie("refreshToken", newRefreshToken, getCookieOptions(864000000))
        .json(new ApiResponse(200, {}, "Token refreshed"));
});

// ─── GET ME ────────────────────────────────────────────
const getMEController = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// ─── ONBOARDING ────────────────────────────────────────
const onboardingController = asyncHandler(async (req, res) => {
    const { bio } = req.body;
    const profileImage = req.body.profileImage;

    const updateData = { isOnboarded: true };
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage) updateData.profileImage = profileImage;

    const user = await userModel.findByIdAndUpdate(
        req.user._id, updateData, { new: true }
    ).select("-password -refreshToken -verificationToken");

    return res.status(200).json(new ApiResponse(200, user, "Profile setup complete!"));
});

// ─── FORGOT PASSWORD ───────────────────────────────────
const forgotPasswordController = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const GENERIC_MSG = "If an account exists with this email, a reset link has been sent.";

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(200).json(new ApiResponse(200, {}, GENERIC_MSG));
    }

    // Cooldown check
    const cooldown = await redis.get(`reset_cooldown:${user._id}`);
    if (cooldown) {
        return res.status(200).json(new ApiResponse(200, {}, GENERIC_MSG));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await redis.set(`reset_token:${resetToken}`, user._id.toString(), "EX", 900);
    await redis.set(`reset_cooldown:${user._id}`, "true", "EX", 60);

    const emailSent = await sendPasswordResetEmail(user.email, user.username, resetToken);
    if (!emailSent) {
        await redis.del(`reset_token:${resetToken}`);
        throw new ApiError(500, "Failed to send reset email", "EMAIL_SEND_FAILED");
    }

    authService.logAuthEvent("PASSWORD_RESET_REQUESTED", {
        userId: user._id, ip: req.ip,
    });

    return res.status(200).json(new ApiResponse(200, {}, GENERIC_MSG));
});

// ─── RESET PASSWORD ────────────────────────────────────
const resetPasswordController = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    // Validation handled by Joi middleware

    const userId = await redis.get(`reset_token:${token}`);
    if (!userId) {
        throw new ApiError(400, "Invalid or expired reset link", "INVALID_TOKEN");
    }

    const user = await userModel.findById(userId).select("+password");
    if (!user) throw new ApiError(404, "User not found", "USER_NOT_FOUND");

    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
        throw new ApiError(400, "New password must be different from old password", "SAME_AS_OLD_PASSWORD");
    }

    user.password = password;
    await user.save();

    // Invalidate reset token
    await redis.del(`reset_token:${token}`);

    // Invalidate ALL active sessions (security measure)
    await authService.invalidateAllUserSessions(userId);
    await userModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

    authService.logAuthEvent("PASSWORD_RESET_SUCCESS", {
        userId: user._id, ip: req.ip,
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully! Please log in again.")
    );
});

// ─── ACTIVE SESSIONS ───────────────────────────────────
const getActiveSessionsController = asyncHandler(async (req, res) => {
    const key = `login_history:${req.user._id}`;
    const history = await redis.lrange(key, 0, -1);
    const sessions = history.map((h) => JSON.parse(h));

    return res.status(200).json(
        new ApiResponse(200, { sessions }, "Active sessions fetched")
    );
});

module.exports = {
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
};
