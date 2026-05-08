const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "Username already exists"],
        required: [true, "Username is required"],
        trim: true,
        lowercase: true,
        index: true
    },
    fullName: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        unique: [true, "Email already exists"],
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
        minlength: 8
    },
    bio: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String,
        default: "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp"
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
    }],
    followedTopics: [{
        type: String,
        lowercase: true
    }],
    isBanned: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    isOnboarded: {
        type: Boolean,
        default: false
    },
    isDemoUser: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

// Hash password before saving (skip if already hashed — e.g., from Redis pending flow)
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    // If password is already a bcrypt hash, don't double-hash
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
