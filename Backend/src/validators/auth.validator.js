const Joi = require("joi");

// ─── REGISTER ──────────────────────────────────────────
const registerSchema = Joi.object({
    username: Joi.string()
        .trim()
        .lowercase()
        .min(3)
        .max(20)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .messages({
            "string.min": "Username must be 3–20 characters",
            "string.max": "Username must be 3–20 characters",
            "string.pattern.base": "Only letters, numbers, and underscores are allowed",
            "any.required": "Username is required",
        }),
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            "string.email": "Enter a valid email address",
            "any.required": "Please enter your email",
        }),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password must be at most 128 characters",
            "string.pattern.base": "Password must include at least one uppercase letter, one lowercase letter, and one number",
            "any.required": "Password is required",
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Passwords do not match",
        }),
});

// ─── LOGIN ─────────────────────────────────────────────
const loginSchema = Joi.object({
    username: Joi.string().trim().lowercase().optional(),
    email: Joi.string().trim().lowercase().email().optional(),
    password: Joi.string().required().messages({
        "any.required": "Enter your password",
    }),
}).or("username", "email").messages({
    "object.missing": "Enter your email or username",
});

// ─── FORGOT PASSWORD ───────────────────────────────────
const forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required().messages({
        "string.email": "Enter a valid email address",
        "any.required": "Please enter your email",
    }),
});

// ─── RESET PASSWORD ────────────────────────────────────
const resetPasswordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters",
            "string.pattern.base": "Password must include at least one uppercase letter, one lowercase letter, and one number",
            "any.required": "Password is required",
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Passwords do not match",
        }),
});

// ─── VALIDATION MIDDLEWARE ─────────────────────────────
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        const messages = error.details.map((d) => d.message).join(", ");
        const ApiError = require("../utils/ApiError");
        throw new ApiError(400, messages, "VALIDATION_ERROR");
    }

    req.body = value; // Use sanitized values
    next();
};

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    validate,
};
