const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const authRouter = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const feedRoutes = require("./routes/feed.routes");
const commentRoutes = require("./routes/comment.routes");
const likeRoutes = require("./routes/like.routes");
const followRoutes = require("./routes/follow.routes");

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Request logging
app.use(morgan("dev"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Social App API is running",
        data: {
            environment: process.env.NODE_ENV,
        },
    });
});

// Route mounting
app.use("/api/auth", authRouter);
app.use("/api/posts", postRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api", commentRoutes);
app.use("/api", likeRoutes);
app.use("/api", followRoutes);

// Global error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;