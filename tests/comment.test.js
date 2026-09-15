const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const { createTestUser } = require("./helpers/auth.helper");

const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

describe("Comment API", () => {
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
            comment_count: 1,
        });

        comment = await Comment.create({
            content: "Test comment",
            author: user._id,
            post: post._id,
        });
    });

    describe("POST /api/posts/:postId/comments", () => {
        it("should require authentication", async () => {
            const response = await request(app)
                .post(`/api/posts/${post._id}/comments`)
                .send({
                    content: "Test comment",
                });

            expect(response.statusCode).toBe(401);
        });

        it("should create a comment and increment the post count", async () => {
            const before = await Post.findById(post._id);

            const response = await request(app)
                .post(`/api/posts/${post._id}/comments`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    content: "New comment",
                });

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.content).toBe("New comment");
            expect(response.body.data.author).toBe(user._id.toString());
            expect(response.body.data.post).toBe(post._id.toString());

            const after = await Post.findById(post._id);

            expect(after.comment_count).toBe(
                before.comment_count + 1
            );
        });

        it("should reject invalid content", async () => {
            const emptyResponse = await request(app)
                .post(`/api/posts/${post._id}/comments`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    content: "",
                });

            expect(emptyResponse.statusCode).toBe(400);

            const longResponse = await request(app)
                .post(`/api/posts/${post._id}/comments`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    content: "a".repeat(1001),
                });

            expect(longResponse.statusCode).toBe(400);
        });

        it("should reject an invalid or unavailable post", async () => {
            const invalidResponse = await request(app)
                .post("/api/posts/not-valid/comments")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    content: "Test comment",
                });

            expect(invalidResponse.statusCode).toBe(400);

            const fakeId = new mongoose.Types.ObjectId();

            const notFoundResponse = await request(app)
                .post(`/api/posts/${fakeId}/comments`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    content: "Test comment",
                });

            expect(notFoundResponse.statusCode).toBe(404);
        });
    });

    describe("GET /api/posts/:postId/comments", () => {
        it("should return comments for a post", async () => {
            const response = await request(app)
                .get(`/api/posts/${post._id}/comments`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].content).toBe(
                "Test comment"
            );
        });

        it("should return newest comments first", async () => {
            await request(app)
                .post(`/api/posts/${post._id}/comments`)
                .set("Authorization", `Bearer ${otherToken}`)
                .send({
                    content: "Newest comment",
                });

            const response = await request(app)
                .get(`/api/posts/${post._id}/comments`);

            expect(response.body.data[0].content).toBe(
                "Newest comment"
            );
        });

        it("should return 404 for an unavailable post", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/api/posts/${fakeId}/comments`);

            expect(response.statusCode).toBe(404);
        });
    });

    describe("PATCH /api/comments/:commentId", () => {
        it("should allow the author to update a comment", async () => {
            const response = await request(app)
                .patch(`/api/comments/${comment._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    content: "Updated comment",
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.content).toBe(
                "Updated comment"
            );
        });

        it("should prevent another user from updating it", async () => {
            const response = await request(app)
                .patch(`/api/comments/${comment._id}`)
                .set("Authorization", `Bearer ${otherToken}`)
                .send({
                    content: "Unauthorized update",
                });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("DELETE /api/comments/:commentId", () => {
        it("should require authentication", async () => {
            const response = await request(app)
                .delete(`/api/comments/${comment._id}`);

            expect(response.statusCode).toBe(401);
        });

        it("should allow the author to delete a comment and decrement the count", async () => {
            const before = await Post.findById(post._id);

            const response = await request(app)
                .delete(`/api/comments/${comment._id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            expect(
                await Comment.findById(comment._id)
            ).toBeNull();

            const after = await Post.findById(post._id);

            expect(after.comment_count).toBe(
                before.comment_count - 1
            );
        });

        it("should prevent another user from deleting it", async () => {
            const response = await request(app)
                .delete(`/api/comments/${comment._id}`)
                .set("Authorization", `Bearer ${otherToken}`);

            expect(response.statusCode).toBe(404);

            expect(
                await Comment.findById(comment._id)
            ).not.toBeNull();
        });
    });
});