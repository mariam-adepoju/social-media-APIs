const authService = require("../services/auth.service");
const successResponse = require("../utils/successResponse");
const asyncHandler = require("../utils/asyncHandler");

const signup = asyncHandler(async (req, res) => {
    const { first_name, last_name, username, email, password } = req.body;

    if (!first_name || !last_name || !username || !email || !password) {
        throw createError("first_name, last_name, username, email and password are required", 400);
    }

    const result = await authService.signup({
        first_name,
        last_name,
        username,
        email,
        password,
    });

    return successResponse(res, 201, "User registered successfully", result);
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw createError("Email and password are required", 400);
    }
    const result = await authService.login({ email, password, });
    return successResponse(res, 200, "Login successful", result);
});

module.exports = { signup, login, };