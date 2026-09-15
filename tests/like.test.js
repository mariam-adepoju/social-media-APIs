const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const { createTestUser } = require("./helpers/auth.helper");

const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const Like = require("../models/like.model");

describe("Like API", () => {
    let user;
    let otherUser;
    let token;
    let otherToken;
    let post;
    let comment;

    beforeEach(async () => {
        const userAuth = await createTestUser({ username: "johndoe", email: "john@example.com" });
        user = userAuth.user;
        token = userAuth.token;

        const otherAuth = await createTestUser({ username: "janesmith", email: "jane@example.com" });
        otherUser = otherAuth.user;
        otherToken = otherAuth.token;

        post = await Post.create({
            title: "Test Post",
            content: "Test post content",
            author: user._id,
            state: "published",
        });

        comment = await Comment.create({
            content: "Test comment",
            author: user._id,
            post: post._id,
        });
    });

    describe("Post likes", () => {
        it("should require authentication", async () => {
            const response = await request(app)
                .post(`/api/posts/${post._id}/like`);

            expect(response.statusCode).toBe(401);
        });

        it("should like a published post and create a polymorphic like", async () => {
            const response = await request(app)
                .post(`/api/posts/${post._id}/like`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.like_count).toBe(1);

            const like = await Like.findOne({
                user: user._id,
                target: post._id,
                target_type: "Post",
            });

            expect(like).not.toBeNull();
        });

        it("should reject liking an unpublished post", async () => {
            const draftPost = await Post.create({
                title: "Draft Post",
                content: "Draft content",
                author: user._id,
                state: "draft",
            });

            const response = await request(app)
                .post(`/api/posts/${draftPost._id}/like`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Published post not found");
        });

        it("should reject duplicate likes", async () => {
            const route = `/api/posts/${post._id}/like`;

            await request(app)
                .post(route)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .post(route)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe(
                "You have already liked this post"
            );
        });

        it("should allow different users to like the same post", async () => {
            const route = `/api/posts/${post._id}/like`;

            await request(app)
                .post(route)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .post(route)
                .set("Authorization", `Bearer ${otherToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.like_count).toBe(2);

            expect(
                await Like.countDocuments({
                    target: post._id,
                    target_type: "Post",
                })
            ).toBe(2);
        });

        it("should reject invalid or unavailable posts", async () => {
            const invalidResponse = await request(app)
                .post("/api/posts/not-valid/like")
                .set("Authorization", `Bearer ${token}`);

            expect(invalidResponse.statusCode).toBe(400);

            const fakeId = new mongoose.Types.ObjectId();

            const notFoundResponse = await request(app)
                .post(`/api/posts/${fakeId}/like`)
                .set("Authorization", `Bearer ${token}`);

            expect(notFoundResponse.statusCode).toBe(404);
        });
    });

    describe("Post unlikes", () => {
        it("should unlike a post and remove the user's like", async () => {
            await request(app)
                .post(`/api/posts/${post._id}/like`)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .delete(`/api/posts/${post._id}/like`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.like_count).toBe(0);

            expect(
                await Like.findOne({
                    user: user._id,
                    target: post._id,
                    target_type: "Post",
                })
            ).toBeNull();
        });

        it("should reject unliking a post the user has not liked", async () => {
            const response = await request(app)
                .delete(`/api/posts/${post._id}/like`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
    });

    describe("Comment likes", () => {
        it("should like and unlike a comment", async () => {
            const likeResponse = await request(app)
                .post(`/api/comments/${comment._id}/like`)
                .set("Authorization", `Bearer ${token}`);

            expect(likeResponse.statusCode).toBe(200);
            expect(likeResponse.body.data.like_count).toBe(1);

            const like = await Like.findOne({
                user: user._id,
                target: comment._id,
                target_type: "Comment",
            });

            expect(like).not.toBeNull();

            const unlikeResponse = await request(app)
                .delete(`/api/comments/${comment._id}/like`)
                .set("Authorization", `Bearer ${token}`);

            expect(unlikeResponse.statusCode).toBe(200);
            expect(unlikeResponse.body.data.like_count).toBe(0);
        });

        it("should reject liking a nonexistent comment", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .post(`/api/comments/${fakeId}/like`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Comment not found");
        });

        it("should reject duplicate comment likes", async () => {
            const route = `/api/comments/${comment._id}/like`;

            await request(app)
                .post(route)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .post(route)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(409);
        });
    });


    describe("Polymorphic likes", () => {
        it("should keep post and comment likes independent", async () => {
            await request(app)
                .post(`/api/posts/${post._id}/like`)
                .set("Authorization", `Bearer ${token}`);

            await request(app)
                .post(`/api/comments/${comment._id}/like`)
                .set("Authorization", `Bearer ${token}`);

            const updatedPost = await Post.findById(post._id);
            const updatedComment = await Comment.findById(comment._id);

            expect(updatedPost.like_count).toBe(1);
            expect(updatedComment.like_count).toBe(1);

            expect(
                await Like.countDocuments({ user: user._id })
            ).toBe(2);
        });
    });
});