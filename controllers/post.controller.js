const postService = require("../services/post.service");
const successResponse = require("../utils/successResponse");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/createError");

const createPost = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;

    if (!title || !content) {
        throw createError("Title and content are required", 400);
    }

    const post = await postService.createPost({
        title,
        content,
        tags,
        authorId: req.user._id,
    });

    return successResponse(res, 201, "Post created successfully", post);
});

const getPublishedPosts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = req.query;

    const result = await postService.getPublishedPosts({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
    });

    return successResponse(
        res,
        200,
        "Posts retrieved successfully",
        result
    );
});

const getPublishedPost = asyncHandler(async (req, res) => {
    const post = await postService.getPublishedPost(
        req.params.postId
    );

    return successResponse(
        res,
        200,
        "Post retrieved successfully",
        post
    );
});

const publishPost = asyncHandler(async (req, res) => {
    const post = await postService.publishPost(
        req.params.postId,
        req.user._id
    );

    return successResponse(
        res,
        200,
        "Post published successfully",
        post
    );
});

const updatePost = asyncHandler(async (req, res) => {
    const post = await postService.updatePost(
        req.params.postId,
        req.user._id,
        req.body
    );

    return successResponse(
        res,
        200,
        "Post updated successfully",
        post
    );
});

const deletePost = asyncHandler(async (req, res) => {
    await postService.deletePost(
        req.params.postId,
        req.user._id
    );

    return successResponse(
        res,
        200,
        "Post deleted successfully"
    );
});

const getMyPosts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        state,
    } = req.query;

    const result = await postService.getMyPosts({
        userId: req.user._id,
        page: Number(page),
        limit: Number(limit),
        state,
    });

    return successResponse(
        res,
        200,
        "Your posts retrieved successfully",
        result
    );
});

module.exports = {
    createPost,
    getPublishedPosts,
    getPublishedPost,
    publishPost,
    updatePost,
    deletePost,
    getMyPosts,
};