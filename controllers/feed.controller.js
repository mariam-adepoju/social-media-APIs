const feedService = require("../services/feed.service");
const successResponse = require("../utils/successResponse");
const asyncHandler = require("../utils/asyncHandler");

const getFeed = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
    } = req.pagination;

    const result = await feedService.getFeed({
        userId: req.user._id,
        page: Number(page),
        limit: Number(limit),
    });

    return successResponse(
        res,
        200,
        "Feed retrieved successfully",
        result
    );
});

module.exports = {
    getFeed,
};