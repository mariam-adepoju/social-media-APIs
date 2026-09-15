const Like = require("../models/like.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const createError = require("../utils/createError");

const models = { Post, Comment };

const likeTarget = async (targetId, userId, targetType) => {
    const Model = models[targetType];

    if (!Model) {
        throw createError("Invalid like target", 400);
    }

    const target = await Model.findById(targetId);
    if (!target) {
        throw createError(`${targetType} not found`, 404);
    }

    // Only published posts can be liked
    if (targetType === "Post" && target.state !== "published") {
        throw createError("Published post not found", 404);
    }

    try {
        await Like.create({
            user: userId,
            target: targetId,
            target_type: targetType,
        });
    } catch (err) {
        if (err.code === 11000) {
            throw createError(
                `You have already liked this ${targetType.toLowerCase()}`,
                409
            );
        }
        throw err;
    }

    const updatedTarget = await Model.findByIdAndUpdate(
        targetId,
        { $inc: { like_count: 1 } },
        { returnDocument: "after" }
    );

    return updatedTarget;
};

const unlikeTarget = async (targetId, userId, targetType) => {
    const Model = models[targetType];

    if (!Model) {
        throw createError("Invalid like target", 400);
    }

    const target = await Model.findById(targetId);
    if (!target) {
        throw createError(`${targetType} not found`, 404);
    }

    if (targetType === "Post" && target.state !== "published") {
        throw createError("Published post not found", 404);
    }

    const like = await Like.findOneAndDelete({
        user: userId,
        target: targetId,
        target_type: targetType,
    });

    if (!like) {
        throw createError(
            `You have not liked this ${targetType.toLowerCase()}`,
            404
        );
    }

    const updatedTarget = await Model.findOneAndUpdate(
        {
            _id: targetId,
            like_count: { $gt: 0 },
        },
        {
            $inc: { like_count: -1 },
        },
        { returnDocument: "after" }
    );

    return updatedTarget || target;
};

module.exports = {
    likeTarget,
    unlikeTarget,
};