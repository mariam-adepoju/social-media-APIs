const express = require("express");
const postController = require("../controllers/post.controller");
const authenticate = require("../middlewares/auth");
const pagination = require("../middlewares/pagination");


const router = express.Router();

router.get("/", pagination, postController.getPublishedPosts);
router.get("/mine", authenticate, pagination, postController.getMyPosts);
router.get("/:postId", postController.getPublishedPost);
router.post("/", authenticate, postController.createPost);
router.patch("/:postId/publish", authenticate, postController.publishPost);
router.patch("/:postId", authenticate, postController.updatePost);
router.delete("/:postId", authenticate, postController.deletePost);

module.exports = router;