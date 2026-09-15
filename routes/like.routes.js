const express = require("express");
const likeController = require("../controllers/like.controller");
const authenticate = require("../middlewares/auth");

const router = express.Router();
router.use(authenticate);

router.post("/posts/:postId/like", likeController.likePost);
router.delete("/posts/:postId/like", likeController.unlikePost);
router.post("/comments/:commentId/like", likeController.likeComment);
router.delete("/comments/:commentId/like", likeController.unlikeComment);

module.exports = router;