const express = require("express");
const router = express.Router();

const commentController = require("../controllers/comment.controller");
const authenticate = require("../middlewares/auth");

router.post("/posts/:postId/comments", authenticate, commentController.createComment);
router.get("/posts/:postId/comments", commentController.getPostComments);
router.patch("/comments/:commentId", authenticate, commentController.updateComment);
router.delete("/comments/:commentId", authenticate, commentController.deleteComment);

module.exports = router;