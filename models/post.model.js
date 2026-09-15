const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Post title is required"],
        trim: true,
        minlength: [3, "Post title must be at least 3 characters"],
        maxlength: [200, "Post title cannot exceed 200 characters"],
    },

    content: {
        type: String,
        required: [true, "Post content is required"],
        trim: true,
        minlength: [1, "Post content cannot be empty"],
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Post author is required"],
    },

    tags: {
        type: [
            {
                type: String,
                trim: true,
                lowercase: true,
                maxlength: 30,
            },
        ],
        validate: {
            validator: (tags) => tags.length <= 5,
            message: "A post cannot have more than 5 tags",
        },
    },
    state: {
        type: String,
        enum: {
            values: ["draft", "published"],
            message: "State must be either draft or published",
        },
        default: "draft",
    },

    like_count: {
        type: Number,
        default: 0,
        min: 0,
    },

    comment_count: {
        type: Number,
        default: 0,
        min: 0,
    },
},
    { timestamps: true, }
);

postSchema.index({ state: 1, createdAt: -1 });
postSchema.index({ state: 1, like_count: -1 });
postSchema.index({ state: 1, comment_count: -1 });
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;