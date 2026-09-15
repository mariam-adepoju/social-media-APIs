const express = require("express");
const followController = require("../controllers/follow.controller");
const authenticate = require("../middlewares/auth");
const pagination = require("../middlewares/pagination");

const router = express.Router();
router.use(authenticate);

router.post("/users/:userId/follow", followController.followUser);
router.delete("/users/:userId/follow", followController.unfollowUser);
router.get("/users/following", pagination, followController.getFollowing);
router.get("/users/followers", pagination, followController.getFollowers);

module.exports = router;