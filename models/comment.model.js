const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "Comment content is required"],
            trim: true,
            minlength: [1, "Comment cannot be empty"],
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Comment author is required"],
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: [true, "Comment post is required"],
        },
        like_count: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;