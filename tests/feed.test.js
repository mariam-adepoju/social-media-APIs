const request = require("supertest");
const app = require("../app");
const { createTestUser } = require("./helpers/auth.helper");

const Post = require("../models/post.model");
const Follow = require("../models/follow.model");

describe("Feed API", () => {
    let user;
    let followedUser;
    let otherUser;
    let token;

    const createPost = (author, title, state = "published") =>
        Post.create({
            title,
            content: `${title} content`,
            author,
            state,
        });

    beforeEach(async () => {
        const userAuth = await createTestUser({
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            email: "test@example.com",
        });
        user = userAuth.user;
        token = userAuth.token;

        const followedAuth = await createTestUser({
            first_name: "Followed",
            last_name: "User",
            username: "followeduser",
            email: "followed@example.com",
        });
        followedUser = followedAuth.user;

        const otherAuth = await createTestUser({
            first_name: "Other",
            last_name: "User",
            username: "otheruser",
            email: "other@example.com",
        });
        otherUser = otherAuth.user;
    });

    describe("GET /api/feed", () => {
        it("should require authentication", async () => {
            const res = await request(app).get("/api/feed");

            expect(res.statusCode).toBe(401);
        });

        it("should return user's own published posts", async () => {
            await createPost(user._id, "My Post");

            const res = await request(app)
                .get("/api/feed")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.posts).toHaveLength(1);
            expect(res.body.data.posts[0].title).toBe("My Post");
        });

        it("should return published posts from followed users", async () => {
            await Follow.create({
                follower: user._id,
                following: followedUser._id,
            });

            await createPost(followedUser._id, "Followed Post");

            const res = await request(app)
                .get("/api/feed")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.posts).toHaveLength(1);
            expect(res.body.data.posts[0].title).toBe("Followed Post");
            expect(res.body.data.posts[0].author.username)
                .toBe("followeduser");
        });

        it("should include own posts and followed users' posts", async () => {
            await Follow.create({
                follower: user._id,
                following: followedUser._id,
            });

            await createPost(user._id, "My Post");
            await createPost(followedUser._id, "Followed Post");

            const res = await request(app)
                .get("/api/feed")
                .set("Authorization", `Bearer ${token}`);

            const titles = res.body.data.posts.map((post) => post.title);

            expect(res.statusCode).toBe(200);
            expect(titles).toEqual(
                expect.arrayContaining(["My Post", "Followed Post"])
            );
        });

        it("should exclude drafts and posts from users not followed", async () => {
            await Follow.create({
                follower: user._id,
                following: followedUser._id,
            });

            await createPost(user._id, "My Draft", "draft");
            await createPost(followedUser._id, "Followed Draft", "draft");
            await createPost(followedUser._id, "Followed Published");
            await createPost(otherUser._id, "Other User Post");

            const res = await request(app)
                .get("/api/feed")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.posts).toHaveLength(1);
            expect(res.body.data.posts[0].title)
                .toBe("Followed Published");
        });

        it("should support pagination", async () => {
            await Post.insertMany(
                Array.from({ length: 5 }, (_, i) => ({
                    title: `Post ${i + 1}`,
                    content: `Content ${i + 1}`,
                    author: user._id,
                    state: "published",
                }))
            );

            const res = await request(app)
                .get("/api/feed?page=1&limit=2")
                .set("Authorization", `Bearer ${token}`);

            const { posts, pagination } = res.body.data;

            expect(res.statusCode).toBe(200);
            expect(posts).toHaveLength(2);
            expect(pagination).toEqual({
                page: 1,
                limit: 2,
                total: 5,
                pages: 3,
            });
        });

        it("should return an empty feed when there are no relevant posts", async () => {
            const res = await request(app)
                .get("/api/feed")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.posts).toEqual([]);
            expect(res.body.data.pagination.total).toBe(0);
        });
    });
});