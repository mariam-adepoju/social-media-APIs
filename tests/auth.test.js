const request = require("supertest");
const app = require("../app");
const User = require("../models/user.model");

describe("Authentication", () => {
    describe("POST /api/auth/signup", () => {
        it("should register a new user", async () => {
            const response = await request(app)
                .post("/api/auth/signup")
                .send({
                    first_name: "John",
                    last_name: "Doe",
                    username: "johndoe",
                    email: "john@example.com",
                    password: "password123",
                });

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.password).toBeUndefined();
        });

        it("should reject duplicate username", async () => {
            await User.create({
                first_name: "John",
                last_name: "Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "password123",
            });

            const response = await request(app)
                .post("/api/auth/signup")
                .send({
                    first_name: "Jane",
                    last_name: "Doe",
                    username: "johndoe",
                    email: "jane@example.com",
                    password: "password123",
                });

            expect(response.statusCode).toBe(409);
            expect(response.body.success).toBe(false);
        });

        it("should reject duplicate email", async () => {
            await User.create({
                first_name: "John",
                last_name: "Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "password123",
            });

            const response = await request(app)
                .post("/api/auth/signup")
                .send({
                    first_name: "Jane",
                    last_name: "Doe",
                    username: "janedoe",
                    email: "john@example.com",
                    password: "password123",
                });

            expect(response.statusCode).toBe(409);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/auth/login", () => {
        beforeEach(async () => {
            await User.create({
                first_name: "John",
                last_name: "Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "password123",
            });
        });

        it("should login with valid credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "john@example.com",
                    password: "password123",
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.password).toBeUndefined();
        });

        it("should reject invalid password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "john@example.com",
                    password: "wrongpassword",
                });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should reject unknown email", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "unknown@example.com",
                    password: "password123",
                });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});