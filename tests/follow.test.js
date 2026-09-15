const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const { createTestUser } = require("./helpers/auth.helper");
const Follow = require("../models/follow.model");

describe("Follow API", () => {
    let user;
    let otherUser;
    let thirdUser;
    let token;
    let otherToken;

    beforeEach(async () => {
        const userAuth = await createTestUser({ username: "johndoe", email: "john@example.com" });
        user = userAuth.user;
        token = userAuth.token;

        const otherAuth = await createTestUser({ username: "janesmith", email: "jane@example.com" });
        otherUser = otherAuth.user;
        otherToken = otherAuth.token;

        const thirdAuth = await createTestUser({ username: "peterbrown", email: "peter@example.com" });
        thirdUser = thirdAuth.user;
    });

    describe("POST /api/users/:userId/follow", () => {
        it("should require authentication", async () => {
            const response = await request(app)
                .post(`/api/users/${otherUser._id}/follow`);

            expect(response.statusCode).toBe(401);
        });

        it("should allow a user to follow another user", async () => {
            const response = await request(app)
                .post(`/api/users/${otherUser._id}/follow`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe(
                "User followed successfully"
            );

            expect(response.body.data).toHaveProperty("follower");
            expect(response.body.data).toHaveProperty("following");

            expect(response.body.data.follower.toString()).toBe(
                user._id.toString()
            );

            expect(response.body.data.following.toString()).toBe(
                otherUser._id.toString()
            );

            const follow = await Follow.findOne({
                follower: user._id,
                following: otherUser._id,
            });

            expect(follow).not.toBeNull();
        });

        it("should not allow a user to follow themselves", async () => {
            const response = await request(app)
                .post(`/api/users/${user._id}/follow`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe(
                "You cannot follow yourself"
            );
        });

        it("should not allow the same user to be followed twice", async () => {
            await request(app)
                .post(`/api/users/${otherUser._id}/follow`)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .post(`/api/users/${otherUser._id}/follow`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe(
                "You already follow this user"
            );
        });

        it("should return 404 when trying to follow a non-existent user", async () => {
            const fakeUserId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .post(`/api/users/${fakeUserId}/follow`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("User not found");
        });
    });

    describe("DELETE /api/users/:userId/follow", () => {
        it("should require authentication", async () => {
            const response = await request(app)
                .delete(`/api/users/${otherUser._id}/follow`);

            expect(response.statusCode).toBe(401);
        });

        it("should allow a user to unfollow a user they follow", async () => {
            await request(app)
                .post(`/api/users/${otherUser._id}/follow`)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .delete(`/api/users/${otherUser._id}/follow`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe(
                "User unfollowed successfully"
            );

            const follow = await Follow.findOne({
                follower: user._id,
                following: otherUser._id,
            });

            expect(follow).toBeNull();
        });

        it("should return 404 when the user is not following the target", async () => {
            const response = await request(app)
                .delete(`/api/users/${otherUser._id}/follow`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe(
                "You do not follow this user"
            );
        });
    });

    describe("GET /api/users/following", () => {
        it("should require authentication", async () => {
            const response = await request(app)
                .get("/api/users/following");

            expect(response.statusCode).toBe(401);
        });

        it("should return users the current user follows", async () => {
            await request(app)
                .post(`/api/users/${otherUser._id}/follow`)
                .set("Authorization", `Bearer ${token}`);

            await request(app)
                .post(`/api/users/${thirdUser._id}/follow`)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .get("/api/users/following")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe(
                "Following users retrieved successfully"
            );

            const follows = response.body.data.follows;

            expect(follows).toHaveLength(2);

            const followingIds = follows.map(
                (follow) => follow.following._id || follow.following
            );
            expect(followingIds.map(id => id.toString())).toContain(otherUser._id.toString());
            expect(followingIds.map(id => id.toString())).toContain(thirdUser._id.toString());
            expect(response.body.data.pagination).toMatchObject({
                page: 1,
                limit: 20,
                total: 2,
                pages: 1,
            });
        });

        it("should return an empty list when the user follows nobody", async () => {
            const response = await request(app)
                .get("/api/users/following")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.follows).toHaveLength(0);
        });
    });

    describe("GET /api/users/followers", () => {
        it("should require authentication", async () => {
            const response = await request(app)
                .get("/api/users/followers");

            expect(response.statusCode).toBe(401);
        });

        it("should return users who follow the current user", async () => {
            await request(app)
                .post(`/api/users/${user._id}/follow`)
                .set("Authorization", `Bearer ${otherToken}`);

            const response = await request(app)
                .get("/api/users/followers")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe(
                "Followers retrieved successfully"
            );

            const follows = response.body.data.follows;

            expect(follows).toHaveLength(1);

            const followerId = follows[0].follower._id || follows[0].follower;
            expect(followerId.toString()).toBe(otherUser._id.toString());
        });

        it("should return an empty list when the user has no followers", async () => {
            const response = await request(app)
                .get("/api/users/followers")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.follows).toHaveLength(0);
        });
    });
});