const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const createError = require("../utils/createError");

const createComment = async ({ content, author, postId }) => {
    const post = await Post.findOne({
        _id: postId,
        state: "published",
    });

    if (!post) {
        throw createError("Post not found", 404);
    }

    const comment = await Comment.create({
        content,
        author,
        post: postId,
    });

    await Post.findByIdAndUpdate(postId, {
        $inc: { comment_count: 1 },
    });

    return comment;
};

const getPostComments = async (postId) => {
    const post = await Post.findOne({
        _id: postId,
        state: "published",
    });

    if (!post) {
        throw createError("Post not found", 404);
    }

    return Comment.find({
        post: postId,
    }).populate("author", "username")
        .sort({ createdAt: -1 });
};

const updateComment = async ({ commentId, userId, content }) => {
    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            author: userId,
        },
        {
            content,
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!comment) {
        throw createError("Comment not found or you are not authorized to update it", 404);
    }
    return comment;
};

const deleteComment = async ({ commentId, userId }) => {
    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        author: userId,
    });

    if (!comment) {
        throw createError("Comment not found or you are not authorized to delete it", 404);
    }

    await Post.findByIdAndUpdate(comment.post, {
        $inc: { comment_count: -1 },
    });
    return comment;
};

module.exports = {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
};