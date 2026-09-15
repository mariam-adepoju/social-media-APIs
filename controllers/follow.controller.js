const followService = require("../services/follow.service");
const successResponse = require("../utils/successResponse");
const asyncHandler = require("../utils/asyncHandler");

const followUser = asyncHandler(async (req, res) => {
    const follow = await followService.followUser(
        req.user._id,
        req.params.userId
    );

    return successResponse(
        res,
        201,
        "User followed successfully",
        follow
    );
});

const unfollowUser = asyncHandler(async (req, res) => {
    await followService.unfollowUser(
        req.user._id,
        req.params.userId
    );

    return successResponse(
        res,
        200,
        "User unfollowed successfully"
    );
});

const getFollowing = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
    } = req.pagination;

    const following = await followService.getFollowing({
        userId: req.user._id,
        page: Number(page),
        limit: Number(limit),
    });

    return successResponse(
        res,
        200,
        "Following users retrieved successfully",
        following
    );
});

const getFollowers = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
    } = req.pagination;

    const followers = await followService.getFollowers({
        userId: req.user._id,
        page: Number(page),
        limit: Number(limit),
    });

    return successResponse(
        res,
        200,
        "Followers retrieved successfully",
        followers
    );
});

module.exports = {
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers,
};