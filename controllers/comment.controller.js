const commentService = require("../services/comment.service");
const successResponse = require("../utils/successResponse");
const asyncHandler = require("../utils/asyncHandler");

const createComment = asyncHandler(async (req, res) => {
    const result = await commentService.createComment({
        content: req.body.content,
        author: req.user._id,
        postId: req.params.postId,
    });

    return successResponse(
        res,
        201,
        "Comment created successfully",
        result
    );
});

const getPostComments = asyncHandler(async (req, res) => {
    const result = await commentService.getPostComments(
        req.params.postId
    );

    return successResponse(
        res,
        200,
        "Comments retrieved successfully",
        result
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const result = await commentService.updateComment({
        commentId: req.params.commentId,
        userId: req.user._id,
        content: req.body.content,
    });

    return successResponse(
        res,
        200,
        "Comment updated successfully",
        result
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const result = await commentService.deleteComment({
        commentId: req.params.commentId,
        userId: req.user._id,
    });

    return successResponse(
        res,
        200,
        "Comment deleted successfully",
        result
    );
});

module.exports = {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
};