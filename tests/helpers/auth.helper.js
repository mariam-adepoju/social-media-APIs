const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");

const createTestUser = async (userData = {}) => {
    const randomSuffix = Math.random().toString(36).substring(7);
    const defaultData = {
        first_name: "John",
        last_name: "Doe",
        username: `user_${randomSuffix}`,
        email: `john_${randomSuffix}@example.com`,
        password: "password123",
        ...userData,
    };

    const user = await User.create(defaultData);

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "test_secret_key",
        { expiresIn: "1h" }
    );

    return { user, token };
};

module.exports = { createTestUser };