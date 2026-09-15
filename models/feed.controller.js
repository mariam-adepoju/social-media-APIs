const getFeed = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
    } = req.query;

    const result = await postService.getFeed({
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