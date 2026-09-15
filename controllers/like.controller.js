const likeService = require("../services/like.service");
const successResponse = require("../utils/successResponse");
const asyncHandler = require("../utils/asyncHandler");

const likePost = asyncHandler(async (req, res) => {
    const post = await likeService.likeTarget(
        req.params.postId,
        req.user._id,
        "Post"
    );

    return successResponse(
        res,
        200,
        "Post liked successfully",
        post
    );
});

const unlikePost = asyncHandler(async (req, res) => {
    const post = await likeService.unlikeTarget(
        req.params.postId,
        req.user._id,
        "Post"
    );

    return successResponse(
        res,
        200,
        "Post unliked successfully",
        post
    );
});

const likeComment = asyncHandler(async (req, res) => {
    const comment = await likeService.likeTarget(
        req.params.commentId,
        req.user._id,
        "Comment"
    );

    return successResponse(
        res,
        200,
        "Comment liked successfully",
        comment
    );
});

const unlikeComment = asyncHandler(async (req, res) => {
    const comment = await likeService.unlikeTarget(
        req.params.commentId,
        req.user._id,
        "Comment"
    );

    return successResponse(
        res,
        200,
        "Comment unliked successfully",
        comment
    );
});

module.exports = {
    likePost,
    unlikePost,
    likeComment,
    unlikeComment,
};