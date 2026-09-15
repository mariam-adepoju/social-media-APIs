const request = require("supertest");
const app = require("../app");
const { createTestUser } = require("./helpers/auth.helper");
const Post = require("../models/post.model");

describe("Posts API", () => {
    let user, otherUser, token, otherToken;

    beforeEach(async () => {
        const u1 = await createTestUser({ username: "johndoe", email: "john@example.com" });
        user = u1.user;
        token = u1.token;

        const u2 = await createTestUser({ username: "janesmith", email: "jane@example.com" });
        otherUser = u2.user;
        otherToken = u2.token;
    });

    describe("POST /api/posts", () => {
        it("should require authentication and validate required fields", async () => {
            const unauthRes = await request(app).post("/api/posts").send({ title: "Test", content: "Content" });
            expect(unauthRes.statusCode).toBe(401);

            const invalidRes = await request(app)
                .post("/api/posts")
                .set("Authorization", `Bearer ${token}`)
                .send({ tags: ["test"] }); // Missing title and content
            expect(invalidRes.statusCode).toBe(400);
        });

        it("should create a new post as draft by default", async () => {
            const response = await request(app)
                .post("/api/posts")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "My First Post",
                    content: "This is my first post.",
                    state: "published",
                });

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.state).toBe("draft");
            expect(response.body.data.author).toBe(user._id.toString());
        });
    });

    describe("GET /api/posts", () => {
        it("should return only published posts with pagination", async () => {
            await Post.create({
                title: "Published Post",
                content: "Public",
                author: user._id,
                state: "published",
            });
            await Post.create({
                title: "Draft Post",
                content: "Private",
                author: user._id,
                state: "draft",
            });

            const response = await request(app).get("/api/posts").query({ page: 1, limit: 10 });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.posts).toHaveLength(1);
            expect(response.body.data.posts[0].state).toBe("published");
            expect(response.body.data.pagination.total).toBe(1);
        });
        it("should reject an invalid sort field", async () => {
            const response = await request(app)
                .get("/api/posts")
                .query({ sortBy: "title" });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Invalid sort field");
        });
        it("should reject an invalid sort order", async () => {
            const response = await request(app)
                .get("/api/posts")
                .query({ sortOrder: "random" });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(
                "sortOrder must be either asc or desc"
            );
        });
    });

    describe("GET /api/posts/:id", () => {
        it("should return a published post with author details and block drafts", async () => {
            const pubPost = await Post.create({
                title: "Public",
                content: "Content",
                author: user._id,
                state: "published",
            });
            const draftPost = await Post.create({
                title: "Draft",
                content: "Content",
                author: user._id,
                state: "draft",
            });

            const resPub = await request(app).get(`/api/posts/${pubPost._id}`);
            expect(resPub.statusCode).toBe(200);
            expect(resPub.body.data.author.username).toBe("johndoe");

            const resDraft = await request(app).get(`/api/posts/${draftPost._id}`);
            expect(resDraft.statusCode).toBe(404);
        });
    });

    describe("GET /api/posts/mine", () => {
        it("should return only the logged-in user's posts with state filtering", async () => {
            await Post.create({ title: "My Draft", content: "C", author: user._id, state: "draft" });
            await Post.create({ title: "My Pub", content: "C", author: user._id, state: "published" });
            await Post.create({ title: "Other Pub", content: "C", author: otherUser._id, state: "published" });

            const response = await request(app)
                .get("/api/posts/mine")
                .set("Authorization", `Bearer ${token}`)
                .query({ state: "draft" });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.posts).toHaveLength(1);
            expect(response.body.data.posts[0].title).toBe("My Draft");
        });
    });

    describe("PATCH /api/posts/:id/publish", () => {
        it("should allow owner to publish a draft and prevent unauthorized or duplicate publishing", async () => {
            const post = await Post.create({ title: "Draft", content: "C", author: user._id, state: "draft" });

            const unauthRes = await request(app)
                .patch(`/api/posts/${post._id}/publish`)
                .set("Authorization", `Bearer ${otherToken}`);
            expect(unauthRes.statusCode).toBe(404);

            const successRes = await request(app)
                .patch(`/api/posts/${post._id}/publish`)
                .set("Authorization", `Bearer ${token}`);
            expect(successRes.statusCode).toBe(200);
            expect(successRes.body.data.state).toBe("published");

            const duplicateRes = await request(app)
                .patch(`/api/posts/${post._id}/publish`)
                .set("Authorization", `Bearer ${token}`);
            expect(duplicateRes.statusCode).toBe(400);
        });
    });

    describe("PATCH /api/posts/:id (Update)", () => {
        it("should allow owner to edit post and block unauthorized users", async () => {
            const post = await Post.create({ title: "Old", content: "Old", author: user._id });

            const successRes = await request(app)
                .patch(`/api/posts/${post._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "New Title" });
            expect(successRes.statusCode).toBe(200);
            expect(successRes.body.data.title).toBe("New Title");

            const hackerRes = await request(app)
                .patch(`/api/posts/${post._id}`)
                .set("Authorization", `Bearer ${otherToken}`)
                .send({ title: "Hacked" });
            expect(hackerRes.statusCode).toBe(404);
        });
        it("should only update allowed fields", async () => {
            const post = await Post.create({
                title: "Old",
                content: "Old content",
                author: user._id,
                state: "draft",
            });

            const response = await request(app)
                .patch(`/api/posts/${post._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Updated",
                    author: otherUser._id,
                    like_count: 999,
                    state: "published",
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.title).toBe("Updated");
            expect(response.body.data.state).toBe("draft");
            expect(response.body.data.like_count).toBe(0);
            expect(response.body.data.author).toBe(user._id.toString());
        });
    });

    describe("DELETE /api/posts/:id", () => {
        it("should allow owner to delete post and block unauthorized users", async () => {
            const post = await Post.create({ title: "Delete Me", content: "C", author: user._id });

            const hackerRes = await request(app)
                .delete(`/api/posts/${post._id}`)
                .set("Authorization", `Bearer ${otherToken}`);
            expect(hackerRes.statusCode).toBe(404);

            const successRes = await request(app)
                .delete(`/api/posts/${post._id}`)
                .set("Authorization", `Bearer ${token}`);
            expect(successRes.statusCode).toBe(200);
            expect(await Post.findById(post._id)).toBeNull();
        });
    });

    describe("Search and Sorting", () => {
        beforeEach(async () => {
            await Post.deleteMany({});
            await Post.create({ title: "NodeJS Guide", content: "Backend", author: user._id, state: "published", like_count: 5, tags: ["nodejs"] });
            await Post.create({ title: "React Advanced", content: "Frontend", author: otherUser._id, state: "published", like_count: 10, tags: ["react"] });
        });

        it("should filter posts by search query and sort correctly", async () => {
            const searchRes = await request(app).get("/api/posts").query({ search: "NodeJS" });
            expect(searchRes.statusCode).toBe(200);
            expect(searchRes.body.data.posts).toHaveLength(1);

            const sortRes = await request(app).get("/api/posts").query({ sortBy: "like_count", sortOrder: "desc" });
            expect(sortRes.statusCode).toBe(200);
            expect(sortRes.body.data.posts[0].like_count).toBe(10);
        });
    });
});