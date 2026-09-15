const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        target: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "target_type", // Dynamically resolves to 'Post' or 'Comment'
        },
        target_type: {
            type: String,
            required: true,
            enum: ["Post", "Comment"],
        },
    },
    {
        timestamps: true,
    }
);

// Prevent a user from liking the same target (post or comment) more than once
likeSchema.index({ user: 1, target: 1, target_type: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;