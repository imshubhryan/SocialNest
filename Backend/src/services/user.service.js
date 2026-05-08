const userModel = require("../models/user.model");
const followModel = require("../models/follow.model");
const postModel = require("../models/post.model");
const ApiError = require("../utils/ApiError");

/**
 * Service for user-related business logic
 */
class UserService {
    /**
     * Get aggregated profile stats for a user
     */
    async getProfileStats(userId) {
        const [followersCount, followingCount, postsCount] = await Promise.all([
            followModel.countDocuments({ followee: userId, status: "accepted" }),
            followModel.countDocuments({ follower: userId, status: "accepted" }),
            postModel.countDocuments({ user: userId })
        ]);

        return {
            followersCount,
            followingCount,
            postsCount
        };
    }

    /**
     * Check if username is available (excluding the current user)
     */
    async isUsernameAvailable(username, excludeUserId) {
        const existingUser = await userModel.findOne({ 
            username: username.toLowerCase().trim(),
            _id: { $ne: excludeUserId }
        });
        return !existingUser;
    }

    /**
     * Update user profile data
     */
    async updateProfile(userId, updateData) {
        // If username is being changed, check uniqueness
        if (updateData.username) {
            const isAvailable = await this.isUsernameAvailable(updateData.username, userId);
            if (!isAvailable) {
                throw new ApiError(400, "Username is already taken", "USERNAME_TAKEN");
            }
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!user) throw new ApiError(404, "User not found");
        return user;
    }
}

module.exports = new UserService();
