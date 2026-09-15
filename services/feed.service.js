const Follow = require("../models/follow.model");
const Post = require("../models/post.model");

const getFeed = async ({
    userId,
    page = 1,
    limit = 20,
}) => {
    const skip = (page - 1) * limit;

    // Get the users that the current user follows
    const followingIds = await Follow.distinct(
        "following",
        { follower: userId }
    );

    // Include the current user's own posts
    const authorIds = [userId, ...followingIds];

    const filter = {
        author: { $in: authorIds },
        state: "published",
    };

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate(
                "author",
                "first_name last_name username"
            )
            .sort({
                createdAt: -1,
                _id: -1,
            })
            .skip(skip)
            .limit(limit),

        Post.countDocuments(filter),
    ]);

    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

module.exports = {
    getFeed,
};