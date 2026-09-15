const express = require("express");
const feedController = require("../controllers/feed.controller");
const authenticate = require("../middlewares/auth");
const pagination = require("../middlewares/pagination");

const router = express.Router();

router.get("/", authenticate, pagination, feedController.getFeed);

module.exports = router;