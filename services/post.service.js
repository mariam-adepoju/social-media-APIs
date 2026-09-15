const Post = require("../models/post.model");
const User = require("../models/user.model");
const Comment = require("../models/comment.model");
const Like = require("../models/like.model");
const escapeRegex = require("../utils/escapeRegex");
const createError = require("../utils/createError");

const createPost = async ({
    title,
    content,
    tags,
    authorId,
}) => {
    const post = await Post.create({
        title,
        content,
        tags,
        author: authorId,
        state: "draft",
    });
    return post;
};

const publishPost = async (postId, userId) => {
    const post = await Post.findOne({ _id: postId, author: userId });

    if (!post) {
        throw createError("Post not found or you are not the owner", 404);
    }

    if (post.state === "published") {
        throw createError("Post is already published", 400);
    }
    post.state = "published";
    await post.save();
    return post;
};

const updatePost = async (postId, userId, updates) => {
    const post = await Post.findOne({ _id: postId, author: userId });

    if (!post) {
        throw createError("Post not found or you are not the owner", 404);
    }

    const allowedFields = ["title", "content", "tags"];

    allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
            post[field] = updates[field];
        }
    });
    await post.save();
    return post;
};

const deletePost = async (postId, userId) => {
    const post = await Post.findOneAndDelete({ _id: postId, author: userId, });
    if (!post) {
        throw createError("Post not found or you are not the owner", 404);
    }

    await Promise.all([
        Comment.deleteMany({ post: postId }),
        Like.deleteMany({
            target: postId,
            target_type: "Post",
        }),
    ]);
    return post;
};

const getPublishedPosts = async ({
    page = 1,
    limit = 20,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
}) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = { state: "published" };

    // Search title, tags, and authors safely
    if (search && search.trim() !== "") {
        const sanitizedSearch = escapeRegex(search.trim());
        const matchingUsers = await User.find({
            $or: [
                { first_name: { $regex: sanitizedSearch, $options: "i" } },
                { last_name: { $regex: sanitizedSearch, $options: "i" } },
                { username: { $regex: sanitizedSearch, $options: "i" } },
            ],
        }).select("_id");

        const authorIds = matchingUsers.map((user) => user._id);

        filter.$or = [
            { title: { $regex: sanitizedSearch, $options: "i" } },
            { tags: { $regex: sanitizedSearch, $options: "i" } },
        ];

        if (authorIds.length > 0) {
            filter.$or.push({ author: { $in: authorIds } });
        }
    }

    // Sorting definition
    const allowedSortFields = ["like_count", "comment_count", "createdAt"];

    if (sortBy && !allowedSortFields.includes(sortBy)) {
        throw createError("Invalid sort field", 400);
    }

    if (sortOrder && !["asc", "desc"].includes(sortOrder)) {
        throw createError("sortOrder must be either asc or desc", 400);
    }

    sortBy = sortBy || "createdAt";
    sortOrder = sortOrder || "desc";
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate(
                "author",
                "first_name last_name username"
            )
            .sort(sort)
            .skip(skip)
            .limit(limitNum),
        Post.countDocuments(filter),
    ]);

    return {
        posts,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        }
    };
};

const getPublishedPost = async (postId) => {
    const post = await Post.findOne({
        _id: postId,
        state: "published",
    }).populate(
        "author",
        "first_name last_name username"
    );

    if (!post) {
        throw createError("Published post not found", 404);
    }
    return post;
};

const getMyPosts = async ({
    userId,
    page = 1,
    limit = 20,
    state,
}) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const filter = { author: userId };

    if (state) {
        if (!["draft", "published"].includes(state)) {
            throw createError("State must be either draft or published", 400);
        }
        filter.state = state;
    }

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate(
                "author",
                "first_name last_name username email"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),

        Post.countDocuments(filter),
    ]);

    return {
        posts,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    };
};

module.exports = {
    createPost,
    publishPost,
    updatePost,
    deletePost,
    getPublishedPosts,
    getPublishedPost,
    getMyPosts,
};