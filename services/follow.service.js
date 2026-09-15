const Follow = require("../models/follow.model");
const User = require("../models/user.model");
const createError = require("../utils/createError");

const followUser = async (followerId, followingId) => {
    if (followerId.toString() === followingId.toString()) {
        throw createError("You cannot follow yourself", 400);
    }

    const user = await User.findById(followingId);
    if (!user) {
        throw createError("User not found", 404);
    }

    const existingFollow = await Follow.findOne({
        follower: followerId,
        following: followingId,
    });

    if (existingFollow) {
        throw createError("You already follow this user", 409);
    }

    try {
        return await Follow.create({
            follower: followerId,
            following: followingId,
        });
    } catch (error) {
        // Protect against a duplicate created concurrently
        if (error.code === 11000) {
            throw createError("You already follow this user", 409);
        }

        throw error;
    }
};

const unfollowUser = async (followerId, followingId) => {
    const follow = await Follow.findOneAndDelete({
        follower: followerId,
        following: followingId,
    });

    if (!follow) {
        throw createError("You do not follow this user", 404);
    }
    return follow;
};

const getFollowing = async ({
    userId,
    page = 1,
    limit = 20,
}) => {
    const skip = (page - 1) * limit;
    const filter = { follower: userId };

    const [follows, total] = await Promise.all([
        Follow.find(filter)
            .populate(
                "following",
                "first_name last_name username email"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Follow.countDocuments(filter),
    ]);

    return {
        follows,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

const getFollowers = async ({
    userId,
    page = 1,
    limit = 20,
}) => {
    const skip = (page - 1) * limit;
    const filter = { following: userId };

    const [follows, total] = await Promise.all([
        Follow.find(filter)
            .populate(
                "follower",
                "first_name last_name username email"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Follow.countDocuments(filter),
    ]);

    return {
        follows,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers,
};